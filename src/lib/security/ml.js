const COUNTRY_RISK = {
  india: 0.05,
  uae: 0.1,
  singapore: 0.12,
  uk: 0.18,
  usa: 0.22,
  china: 0.65,
  russia: 0.72
};

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function resolveCountryRisk(locationCountry) {
  const key = String(locationCountry || '').trim().toLowerCase();
  return COUNTRY_RISK[key] ?? 0.3;
}

export function evaluateAnomalySignal({
  user,
  amount,
  locationCountry,
  deviceDna,
  mouseShakeIntensity,
  transferAllIntent,
  paymentFrequency
}) {
  const reasons = [];

  const numericAmount = Number(amount || 0);
  const numericBalance = Number(user.balance || 0);
  const amountRatio = numericBalance > 0 ? Math.min(1, numericAmount / numericBalance) : 1;
  const locationMismatch =
    Boolean(user.lastKnownCountry && locationCountry) &&
    user.lastKnownCountry.toLowerCase() !== String(locationCountry).toLowerCase();
  const deviceMismatch =
    Boolean(user.lastKnownDeviceDna && deviceDna) &&
    user.lastKnownDeviceDna !== deviceDna;

  const countryRisk = resolveCountryRisk(locationCountry);
  const isolationLikeScore = sigmoid(
    3.2 * amountRatio +
      0.9 * Number(Boolean(transferAllIntent)) +
      0.8 * Number(locationMismatch) +
      0.7 * Number(deviceMismatch) +
      0.6 * countryRisk +
      0.01 * Number(mouseShakeIntensity || 0) +
      0.03 * Number(paymentFrequency || 0) -
      2.35
  );

  const robustDeviation = sigmoid(
    0.02 * Number(mouseShakeIntensity || 0) +
      0.0008 * Number(paymentFrequency || 0) * Number(amount || 0) +
      2.2 * amountRatio -
      1.6
  );

  const contextScore = Math.min(
    1,
    0.35 * Number(locationMismatch) +
      0.3 * Number(deviceMismatch) +
      0.2 * Number(Boolean(transferAllIntent)) +
      0.15 * countryRisk
  );

  const fusionScore =
    0.5 * isolationLikeScore +
    0.3 * robustDeviation +
    0.2 * contextScore;

  const panicRunnerRule =
    Boolean(transferAllIntent) &&
    (amountRatio >= 0.85 || Number(mouseShakeIntensity || 0) >= 80) &&
    (locationMismatch || deviceMismatch);

  if (locationMismatch) {
    reasons.push('Country mismatch from last known digital passport.');
  }

  if (deviceMismatch) {
    reasons.push('Unknown device DNA detected.');
  }

  if (Boolean(transferAllIntent) || amountRatio >= 0.9) {
    reasons.push('Panic Runner transfer behavior detected.');
  }

  if (Number(mouseShakeIntensity || 0) >= 80) {
    reasons.push('High mouse-shake intensity detected.');
  }

  if (Number(paymentFrequency || 0) >= 10) {
    reasons.push('Unusual payment burst detected.');
  }

  const normalizedScore = Math.min(0.99, Number(fusionScore.toFixed(4)));
  const flagged = panicRunnerRule || normalizedScore >= 0.62;

  return {
    flagged,
    score: normalizedScore,
    reasons,
    panicRunnerRule,
    isolationScore: Number(isolationLikeScore.toFixed(4)),
    deviationScore: Number(robustDeviation.toFixed(4)),
    contextScore: Number(contextScore.toFixed(4))
  };
}
