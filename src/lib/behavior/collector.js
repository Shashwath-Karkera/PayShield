export default class BehaviorCollector {
  constructor() {
    this.keyPresses = [];
    this.mouseMoves = [];
    this.backspaceCount = 0;
    this.totalChars = 0;
    this.startTime = Date.now();
    this.isMobile = typeof window !== 'undefined' ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false;
    this.isAutofill = false;
    this.hasA11yActive = false;
    this.isRunning = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  startTracking() {
    if (typeof window === 'undefined' || this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    
    // Key tracking
    window.addEventListener('keydown', this.handleKeyDown);
    // Mouse tracking (skip on mobile)
    if (!this.isMobile) {
      window.addEventListener('mousemove', this.handleMouseMove);
    }
    // Paste tracking
    window.addEventListener('paste', this.handlePaste);
  }

  stopTracking() {
    if (typeof window === 'undefined' || !this.isRunning) return;
    this.isRunning = false;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    if (!this.isMobile) {
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
    window.removeEventListener('paste', this.handlePaste);
  }

  handleKeyDown(e) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      this.backspaceCount++;
    } else if (e.key.length === 1) { // Normal character
      this.totalChars++;
      this.keyPresses.push(Date.now());
    }

    // Rough check for accessibility tools (repeated rapid strange keys)
    if (e.key === 'Tab') {
      this.hasA11yActive = true;
    }
  }

  handleMouseMove(e) {
    // Throttle slightly to save memory
    if (this.mouseMoves.length === 0 || (Date.now() - this.mouseMoves[this.mouseMoves.length - 1].t > 50)) {
      this.mouseMoves.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    }
  }

  handlePaste(e) {
    this.isAutofill = true;
    const text = e.clipboardData?.getData('text') || '';
    this.totalChars += text.length;
  }

  // Call this right before submit to get final metrics
  getData() {
    return {
      durationMs: Date.now() - this.startTime,
      keyPresses: this.keyPresses,
      mouseMoves: this.mouseMoves,
      backspaceCount: this.backspaceCount,
      totalChars: this.totalChars,
      isMobile: this.isMobile,
      isAutofill: this.isAutofill,
      hasA11yActive: this.hasA11yActive,
      loginHour: new Date().getHours() // 0-23
    };
  }
}
