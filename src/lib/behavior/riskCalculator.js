import { BehaviorMessages } from './messages.js';

export function calculateRisk(data) {
  let score = 0;
  const triggeredRules = [];
  const messages = [];

  // Skip strict analysis if explicitly an autofill or accessibility tool
  if (data.isAutofill || data.hasA11yActive) {
    return { score: 0, riskLevel: 'LOW', action: 'allow', triggeredRules, messages };
  }

  // Rule 1: Login < 2 Seconds 
  if (data.durationMs < 2000) {
    score += 30;
    triggeredRules.push('FAST_LOGIN');
    messages.push(BehaviorMessages.FAST_LOGIN);
  }

  // Rule 2: Login Hour (12 AM - 5 AM)
  if (data.loginHour >= 0 && data.loginHour <= 5) {
    score += 15;
    triggeredRules.push('UNUSUAL_HOUR');
    messages.push(BehaviorMessages.UNUSUAL_HOUR);
  }

  if (data.totalChars > 0 && data.keyPresses.length > 2) {
    const charsPerMin = (data.totalChars / Math.max(1, data.durationMs)) * 60000;
    
    // Rule 3: Typing > 300 chars/min
    if (charsPerMin > 300) {
      score += 40;
      triggeredRules.push('FAST_TYPING');
      messages.push(BehaviorMessages.FAST_TYPING);
    }

    let totalPauses = 0;
    let validPauses = 0;
    for (let i = 1; i < data.keyPresses.length; i++) {
        const pause = data.keyPresses[i] - data.keyPresses[i-1];
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
    if (data.totalChars >= 20 && data.backspaceCount === 0) {
      score += 20;
      triggeredRules.push('NO_BACKSPACES');
      messages.push(BehaviorMessages.NO_BACKSPACES);
    }
  }

  // Desktop Mouse rules
  if (!data.isMobile) {
    if (data.mouseMoves.length < 3) {
      score += 25;
      triggeredRules.push('NO_MOUSE_MOVEMENT');
      messages.push(BehaviorMessages.NO_MOUSE_MOVEMENT);
    } else {
      const first = data.mouseMoves[0];
      const last = data.mouseMoves[data.mouseMoves.length - 1];
      const straightDist = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
      
      let pathDist = 0;
      for (let i = 1; i < data.mouseMoves.length; i++) {
        pathDist += Math.sqrt(
          Math.pow(data.mouseMoves[i].x - data.mouseMoves[i-1].x, 2) + 
          Math.pow(data.mouseMoves[i].y - data.mouseMoves[i-1].y, 2)
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
