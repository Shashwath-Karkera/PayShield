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
  let score = 0;

  const numericAmount = Number(amount || 0);
  const numericBalance = Number(user.balance || 0);

  if (
    user.lastKnownCountry &&
    locationCountry &&
    user.lastKnownCountry.toLowerCase() !== locationCountry.toLowerCase()
  ) {
    score += 0.35;
    reasons.push('Country mismatch from last known digital passport.');
  }

  if (user.lastKnownDeviceDna && deviceDna && user.lastKnownDeviceDna !== deviceDna) {
    score += 0.25;
    reasons.push('Unknown device DNA detected.');
  }

  if (Boolean(transferAllIntent) || numericAmount >= numericBalance * 0.9) {
    score += 0.3;
    reasons.push('Panic Runner transfer behavior detected.');
  }

  if (Number(mouseShakeIntensity || 0) >= 80) {
    score += 0.2;
    reasons.push('High mouse-shake intensity detected.');
  }

  if (Number(paymentFrequency || 0) >= 10) {
    score += 0.1;
    reasons.push('Unusual payment burst detected.');
  }

  const normalizedScore = Math.min(0.99, Number(score.toFixed(2)));
  const flagged = normalizedScore >= 0.5;

  return {
    flagged,
    score: normalizedScore,
    reasons
  };
}
