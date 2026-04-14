import { prisma } from '@/lib/prisma';

const MAX_TRAVEL_SPEED_KMH = 900;

function toRad(value) {
  return (value * Math.PI) / 180;
}

function haversineKm(a, b) {
  if (!a || !b) {
    return null;
  }

  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * r * Math.asin(Math.sqrt(h));
}

const COUNTRY_COORDS = {
  IN: { lat: 20.5937, lon: 78.9629 },
  US: { lat: 39.8283, lon: -98.5795 },
  GB: { lat: 55.3781, lon: -3.436 },
  DE: { lat: 51.1657, lon: 10.4515 },
  FR: { lat: 46.2276, lon: 2.2137 },
  RU: { lat: 61.524, lon: 105.3188 },
  CN: { lat: 35.8617, lon: 104.1954 },
  SG: { lat: 1.3521, lon: 103.8198 },
  AU: { lat: -25.2744, lon: 133.7751 }
};

function normalizeCountry(country) {
  if (!country) {
    return null;
  }

  return String(country).trim().toUpperCase();
}

export async function evaluateGeoRisk(user, input) {
  const reasons = [];
  let score = 0;

  const currentCountry = normalizeCountry(input.locationCountry);
  const currentIp = String(input.ipAddress || '').trim();

  if (currentCountry && user.lastKnownCountry) {
    const previousCountry = normalizeCountry(user.lastKnownCountry);
    if (previousCountry && previousCountry !== currentCountry) {
      score += 0.35;
      reasons.push(`Country changed from ${previousCountry} to ${currentCountry}.`);
    }

    const previousCoord = COUNTRY_COORDS[previousCountry];
    const currentCoord = COUNTRY_COORDS[currentCountry];

    if (previousCoord && currentCoord && user.lastLoginAt) {
      const distanceKm = haversineKm(previousCoord, currentCoord);
      if (distanceKm) {
        const hoursElapsed = (Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60);
        if (hoursElapsed > 0) {
          const speed = distanceKm / hoursElapsed;
          if (speed > MAX_TRAVEL_SPEED_KMH) {
            score += 0.35;
            reasons.push('Impossible travel speed detected between consecutive logins.');
          }
        }
      }
    }
  }

  if (currentIp && /(vpn|proxy|tor)/i.test(String(input.networkHints || ''))) {
    score += 0.25;
    reasons.push('Network appears to use VPN/proxy routing.');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const rapidCountryHops = await prisma.securityEvent.count({
    where: {
      userId: user.id,
      type: 'LOGIN_SUCCESS',
      createdAt: { gte: oneHourAgo },
      metadata: {
        path: ['locationCountry'],
        not: currentCountry || undefined
      }
    }
  });

  if (rapidCountryHops >= 2) {
    score += 0.2;
    reasons.push('Frequent country switching detected in the last hour.');
  }

  const normalized = Math.min(0.99, Number(score.toFixed(2)));

  return {
    score: normalized,
    reasons,
    highRisk: normalized >= 0.5
  };
}
