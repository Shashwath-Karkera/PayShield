export function computeGenuinityScore(logs) {
  if (!logs?.length) {
    return 100;
  }

  const total = logs.length;
  const transferAllCount = logs.filter((log) => log.transferAllIntent).length;
  const highShakeCount = logs.filter((log) => log.mouseShakeIntensity >= 80).length;
  const avgScrollSpeed =
    logs.reduce((sum, log) => sum + Number(log.scrollSpeed || 0), 0) / total;

  let score = 100;
  score -= transferAllCount * 18;
  score -= highShakeCount * 10;
  if (avgScrollSpeed > 1800) {
    score -= 12;
  }

  return Math.max(0, Math.min(100, score));
}

export function shouldUseMirrorLedger(score) {
  return score < 60;
}
