import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


COUNTRY_RISK = {
    "india": 0.05,
    "uae": 0.1,
    "singapore": 0.12,
    "uk": 0.18,
    "usa": 0.22,
    "china": 0.65,
    "russia": 0.72,
}

BASE_FEATURES = [
    "amount_ratio",
    "mouse_shake_intensity",
    "scroll_speed",
    "payment_frequency",
    "transfer_all_intent",
    "location_mismatch",
    "device_mismatch",
    "country_risk",
]


@dataclass
class InferenceInput:
    amount_ratio: float
    mouse_shake_intensity: float
    scroll_speed: float
    payment_frequency: float
    transfer_all_intent: int
    location_mismatch: int
    device_mismatch: int
    country_risk: float


@dataclass
class ModelBundle:
    models: list[IsolationForest]
    scaler: StandardScaler
    adaptive_threshold: float
    baseline_median: np.ndarray
    baseline_mad: np.ndarray


def generate_synthetic_logs(size: int = 3000) -> pd.DataFrame:
    rng = np.random.default_rng(42)

    normal = pd.DataFrame(
        {
            "amount_ratio": rng.uniform(0.01, 0.35, size),
            "mouse_shake_intensity": rng.normal(18, 8, size).clip(0, 100),
            "scroll_speed": rng.normal(500, 220, size).clip(50, 2600),
            "payment_frequency": rng.poisson(2.5, size),
            "transfer_all_intent": rng.binomial(1, 0.03, size),
            "location_mismatch": rng.binomial(1, 0.04, size),
            "device_mismatch": rng.binomial(1, 0.05, size),
            "country_risk": rng.uniform(0.02, 0.25, size),
        }
    )

    anomaly_size = max(150, size // 8)
    anomalies = pd.DataFrame(
        {
            "amount_ratio": rng.uniform(0.8, 1.0, anomaly_size),
            "mouse_shake_intensity": rng.uniform(75, 100, anomaly_size),
            "scroll_speed": rng.uniform(1800, 3200, anomaly_size),
            "payment_frequency": rng.integers(9, 25, anomaly_size),
            "transfer_all_intent": np.ones(anomaly_size),
            "location_mismatch": rng.binomial(1, 0.75, anomaly_size),
            "device_mismatch": rng.binomial(1, 0.7, anomaly_size),
            "country_risk": rng.uniform(0.5, 0.95, anomaly_size),
        }
    )

    return pd.concat([normal, anomalies], ignore_index=True)


def load_external_dataset(path: Path | None) -> pd.DataFrame:
    # Treat empty value or non-file paths as no external dataset.
    if not path or not path.exists() or not path.is_file():
        return pd.DataFrame()

    external = pd.read_csv(path)
    expected = set(BASE_FEATURES)

    missing = expected.difference(set(external.columns))
    if missing:
        raise ValueError(f"Missing required columns in external dataset: {sorted(missing)}")

    return external[BASE_FEATURES]


def _sigmoid(value: float) -> float:
    return float(1.0 / (1.0 + np.exp(-value)))


def _build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    base = df[BASE_FEATURES].astype(float)

    amount_ratio = base["amount_ratio"].to_numpy()
    shake = base["mouse_shake_intensity"].to_numpy()
    scroll = base["scroll_speed"].to_numpy()
    frequency = base["payment_frequency"].to_numpy()
    transfer = base["transfer_all_intent"].to_numpy()
    loc = base["location_mismatch"].to_numpy()
    dev = base["device_mismatch"].to_numpy()
    country = base["country_risk"].to_numpy()

    engineered = np.column_stack(
        [
            amount_ratio * transfer,
            (shake / 100.0) * transfer,
            np.log1p(scroll) * np.log1p(frequency),
            loc * dev,
            country * amount_ratio,
            (shake / 100.0) * (scroll / 1000.0),
        ]
    )

    return np.hstack([base.to_numpy(), engineered])


def _trusted_baseline(df: pd.DataFrame) -> np.ndarray:
    trusted = df[
        (df["transfer_all_intent"] == 0)
        & (df["location_mismatch"] == 0)
        & (df["device_mismatch"] == 0)
    ]

    if len(trusted) < max(50, len(df) // 10):
        trusted = df

    return trusted[BASE_FEATURES].astype(float).to_numpy()


def train_model(dataset: pd.DataFrame) -> ModelBundle:
    matrix = _build_feature_matrix(dataset)

    scaler = StandardScaler()
    scaled_matrix = scaler.fit_transform(matrix)

    configs = [
        {"n_estimators": 220, "contamination": 0.04, "seed": 42},
        {"n_estimators": 320, "contamination": 0.06, "seed": 77},
        {"n_estimators": 420, "contamination": 0.08, "seed": 121},
    ]

    rng = np.random.default_rng(2026)
    models: list[IsolationForest] = []
    all_decisions = []

    for config in configs:
        sample_size = max(200, int(len(scaled_matrix) * 0.92))
        sample_indices = rng.choice(len(scaled_matrix), size=sample_size, replace=True)

        model = IsolationForest(
            n_estimators=config["n_estimators"],
            contamination=config["contamination"],
            random_state=config["seed"],
            n_jobs=-1,
        )
        model.fit(scaled_matrix[sample_indices])
        models.append(model)
        all_decisions.append(model.decision_function(scaled_matrix))

    mean_decisions = np.mean(np.column_stack(all_decisions), axis=1)
    adaptive_threshold = float(np.quantile(mean_decisions, 0.09))

    baseline = _trusted_baseline(dataset)
    baseline_median = np.median(baseline, axis=0)
    baseline_mad = np.median(np.abs(baseline - baseline_median), axis=0)
    baseline_mad = np.where(baseline_mad < 1e-6, 1e-6, baseline_mad)

    return ModelBundle(
        models=models,
        scaler=scaler,
        adaptive_threshold=adaptive_threshold,
        baseline_median=baseline_median,
        baseline_mad=baseline_mad,
    )


def to_feature_vector(payload: dict) -> InferenceInput:
    country = str(payload.get("current_country", "")).lower().strip()
    return InferenceInput(
        amount_ratio=float(payload.get("amount_ratio", 0.0)),
        mouse_shake_intensity=float(payload.get("mouse_shake_intensity", 0.0)),
        scroll_speed=float(payload.get("scroll_speed", 0.0)),
        payment_frequency=float(payload.get("payment_frequency", 0.0)),
        transfer_all_intent=int(bool(payload.get("transfer_all_intent", False))),
        location_mismatch=int(bool(payload.get("location_mismatch", False))),
        device_mismatch=int(bool(payload.get("device_mismatch", False))),
        country_risk=float(payload.get("country_risk", COUNTRY_RISK.get(country, 0.3))),
    )


def infer(bundle: ModelBundle, sample: InferenceInput) -> dict[str, Any]:
    base_row = np.array(
        [
            sample.amount_ratio,
            sample.mouse_shake_intensity,
            sample.scroll_speed,
            sample.payment_frequency,
            sample.transfer_all_intent,
            sample.location_mismatch,
            sample.device_mismatch,
            sample.country_risk,
        ],
        dtype=float,
    )

    row_df = pd.DataFrame([dict(zip(BASE_FEATURES, base_row))])
    row_matrix = _build_feature_matrix(row_df)
    transformed = bundle.scaler.transform(row_matrix)

    model_preds = np.array([model.predict(transformed)[0] for model in bundle.models], dtype=float)
    model_scores = np.array([model.score_samples(transformed)[0] for model in bundle.models], dtype=float)
    model_decisions = np.array(
        [model.decision_function(transformed)[0] for model in bundle.models], dtype=float
    )

    mean_decision = float(np.mean(model_decisions))
    mean_score = float(np.mean(model_scores))

    # Isolation component relative to adaptive threshold.
    threshold_margin = bundle.adaptive_threshold - mean_decision
    isolation_score = _sigmoid(11.0 * threshold_margin)

    # Statistical deviation component using robust median absolute deviation.
    robust_z = np.abs(base_row - bundle.baseline_median) / (1.4826 * bundle.baseline_mad)
    robust_z = np.clip(robust_z, 0.0, 12.0)
    weights = np.array([0.22, 0.16, 0.08, 0.1, 0.16, 0.1, 0.1, 0.08], dtype=float)
    deviation_score = _sigmoid(float(np.dot(robust_z, weights) - 2.8))

    # Contextual risk component prioritizing geo/device mismatch + high country risk.
    context_raw = (
        0.35 * sample.location_mismatch
        + 0.3 * sample.device_mismatch
        + 0.2 * sample.transfer_all_intent
        + 0.15 * sample.country_risk
    )
    context_score = float(np.clip(context_raw, 0.0, 1.0))

    # Adaptive Isolation Fusion (AIF): stronger than plain IF while still data-driven.
    fusion_score = float(0.5 * isolation_score + 0.3 * deviation_score + 0.2 * context_score)

    # Hard fail-safe for high-risk panic-runner patterns.
    panic_runner_rule = bool(
        sample.transfer_all_intent == 1
        and (sample.amount_ratio >= 0.85 or sample.mouse_shake_intensity >= 80)
        and (sample.location_mismatch == 1 or sample.device_mismatch == 1)
    )
    ensemble_outlier_votes = int(np.sum(model_preds == -1))
    flagged = bool(
        panic_runner_rule
        or fusion_score >= 0.62
        or (ensemble_outlier_votes >= 2 and deviation_score >= 0.5)
    )

    return {
        "flagged": bool(flagged),
        "anomaly_score": fusion_score,
        "isolation_score": isolation_score,
        "deviation_score": deviation_score,
        "context_score": context_score,
        "raw_score": mean_score,
        "decision_score": mean_decision,
        "adaptive_threshold": bundle.adaptive_threshold,
        "ensemble_outlier_votes": ensemble_outlier_votes,
        "robust_z_max": float(np.max(robust_z)),
        "panic_runner_rule": panic_runner_rule,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Isolation Forest detector for PayShield")
    parser.add_argument("--dataset", type=str, default="", help="Optional Kaggle CSV path")
    parser.add_argument(
        "--input-json",
        type=str,
        default="{}",
        help="JSON payload for single-sample inference",
    )
    parser.add_argument(
        "--input-file",
        type=str,
        default="",
        help="Optional JSON file path for single-sample inference",
    )

    args = parser.parse_args()

    synthetic = generate_synthetic_logs()
    external = load_external_dataset(Path(args.dataset))
    dataset = pd.concat([synthetic, external], ignore_index=True) if not external.empty else synthetic

    bundle = train_model(dataset)
    if args.input_file:
        payload = json.loads(Path(args.input_file).read_text(encoding="utf-8"))
    else:
        payload = json.loads(args.input_json)
    sample = to_feature_vector(payload)
    result = infer(bundle, sample)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
