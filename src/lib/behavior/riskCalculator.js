import { BehaviorMessages } from './messages.js';

export function calculateRisk(data) {
  const payload = {
    isAutofill: Boolean(data?.isAutofill),
    hasA11yActive: Boolean(data?.hasA11yActive),
    durationMs: Number(data?.durationMs || 0),
    loginHour: Number(data?.loginHour || 0),
    totalChars: Number(data?.totalChars || 0),
    backspaceCount: Number(data?.backspaceCount || 0),
    keyPresses: Array.isArray(data?.keyPresses) ? data.keyPresses : [],
    mouseMoves: Array.isArray(data?.mouseMoves) ? data.mouseMoves : [],
    isMobile: Boolean(data?.isMobile)
  };

  let score = 0;
  const triggeredRules = [];
  const messages = [];

  // Skip strict analysis if explicitly an autofill or accessibility tool
  if (payload.isAutofill || payload.hasA11yActive) {
    return { score: 0, riskLevel: 'LOW', action: 'allow', triggeredRules, messages };
  }

  // Rule 1: Login < 2 Seconds 
  if (payload.durationMs < 2000) {
    score += 30;
    triggeredRules.push('FAST_LOGIN');
    messages.push(BehaviorMessages.FAST_LOGIN);
  }

  // Rule 2: Login Hour (12 AM - 5 AM)
  if (payload.loginHour >= 0 && payload.loginHour <= 5) {
    score += 15;
    triggeredRules.push('UNUSUAL_HOUR');
    messages.push(BehaviorMessages.UNUSUAL_HOUR);
  }

  if (payload.totalChars > 0 && payload.keyPresses.length > 2) {
    const charsPerMin = (payload.totalChars / Math.max(1, payload.durationMs)) * 60000;
    
    // Rule 3: Typing > 300 chars/min
    if (charsPerMin > 300) {
      score += 40;
      triggeredRules.push('FAST_TYPING');
      messages.push(BehaviorMessages.FAST_TYPING);
    }

    let totalPauses = 0;
    let validPauses = 0;
    for (let i = 1; i < payload.keyPresses.length; i++) {
      const pause = payload.keyPresses[i] - payload.keyPresses[i-1];
        if (pause > 0 && pause < 1000) {
            totalPauses += pause;
            validPauses++;
        }
    }
    const avgPause = validPauses > 0 ? (totalPauses / validPauses) : 0;
    
    // Rule 4: No key pauses (< 50ms implies script insertion)
    if (validPauses > 3 && avgPause < 50) {
      score += 30;
      triggeredRules.push('NO_KEY_PAUSES');
      messages.push(BehaviorMessages.NO_KEY_PAUSES);
    }

    // Rule 5: No backspaces on long inputs
    if (payload.totalChars >= 20 && payload.backspaceCount === 0) {
      score += 20;
      triggeredRules.push('NO_BACKSPACES');
      messages.push(BehaviorMessages.NO_BACKSPACES);
    }
  }

  // Desktop Mouse rules
  if (!payload.isMobile) {
    if (payload.mouseMoves.length < 3) {
      score += 25;
      triggeredRules.push('NO_MOUSE_MOVEMENT');
      messages.push(BehaviorMessages.NO_MOUSE_MOVEMENT);
    } else {
      const first = payload.mouseMoves[0];
      const last = payload.mouseMoves[payload.mouseMoves.length - 1];
      const straightDist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
      
      let pathDist = 0;
      for (let i = 1; i < payload.mouseMoves.length; i++) {
        pathDist += Math.sqrt(
          Math.pow(payload.mouseMoves[i].x - payload.mouseMoves[i-1].x, 2) + 
          Math.pow(payload.mouseMoves[i].y - payload.mouseMoves[i-1].y, 2)
        );
      }
      
      if (pathDist > 0) {
          const straightness = straightDist / pathDist;
          if (straightness > 0.95 && pathDist > 20) {
            score += 35;
            triggeredRules.push('STRAIGHT_MOUSE');
            messages.push(BehaviorMessages.STRAIGHT_MOUSE);
          }
      }
    }
  }

  let riskLevel = 'LOW';
  let action = 'allow';
  
  if (score >= 80) {
    riskLevel = 'CRITICAL';
    action = 'block';
  } else if (score >= 60) {
    riskLevel = 'HIGH';
    action = 'require_otp';
  } else if (score >= 30) {
    riskLevel = 'MEDIUM';
    action = 'warn';
  }

  return { score, riskLevel, action, triggeredRules, messages };
}
