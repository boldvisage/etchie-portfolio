/* ==========================================================================
   ETCHIE THEOPHILUS — INTERACTIONS ENGINE (GRACE DANIYAN REPLICA ENGINE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. THEME SWITCH ENGINE (LIGHT & DARK MODE)
  // =========================================================================
  const themeSwitchBtn = document.getElementById('themeSwitchBtn');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : false; // Default to paper light mode like Grace Daniyan

  function applyTheme(isDark) {
    if (isDark) {
      htmlRoot.classList.add('dark');
      if (themeSwitchBtn) {
        themeSwitchBtn.setAttribute('aria-checked', 'true');
        themeSwitchBtn.setAttribute('aria-label', 'Switch to light mode');
      }
    } else {
      htmlRoot.classList.remove('dark');
      if (themeSwitchBtn) {
        themeSwitchBtn.setAttribute('aria-checked', 'false');
        themeSwitchBtn.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {}

    // Notify physics canvas to update color palette
    if (window.updatePillsTheme) {
      window.updatePillsTheme();
    }
  }

  applyTheme(initialDark);

  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener('click', () => {
      const isCurrentlyDark = htmlRoot.classList.contains('dark');
      applyTheme(!isCurrentlyDark);
    });
  }

  // =========================================================================
  // 2. FIXED FLOATING NAVBAR ON SCROLL
  // =========================================================================
  const fixedNav = document.getElementById('fixedNav');

  function handleNavScroll() {
    if (!fixedNav) return;
    if (window.scrollY > 100) {
      fixedNav.classList.add('visible');
    } else {
      fixedNav.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // =========================================================================
  // 3. SCROLL-DRIVEN WORD BLUR REVEAL ("WHAT I DO")
  // =========================================================================
  const revealContainer = document.querySelector('.scroll-reveal-text');
  const words = document.querySelectorAll('.scroll-word');

  function handleWordReveal() {
    if (!revealContainer || words.length === 0) return;

    const rect = revealContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Start unblurring when top of text enters at 85% of window, fully clear at 40%
    const startY = windowHeight * 0.85;
    const endY = windowHeight * 0.35;

    const progress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY)));

    // Stagger progress across each word
    const totalWords = words.length;
    words.forEach((word, idx) => {
      const wordStart = idx / totalWords;
      const wordEnd = (idx + 1.5) / totalWords;
      const wordProgress = Math.min(1, Math.max(0, (progress - wordStart) / (wordEnd - wordStart)));
      word.style.setProperty('--p', wordProgress.toFixed(3));
    });
  }

  window.addEventListener('scroll', handleWordReveal, { passive: true });
  handleWordReveal();

  // =========================================================================
  // 4. FALLING PILLS 2D CANVAS PHYSICS SIMULATION
  // =========================================================================
  const canvas = document.getElementById('pillsCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animId = null;

    const pillDefinitions = [
      { text: "Product Design", bgLight: "#c7b6ff", bgDark: "#58429b", color: "#12100e" },
      { text: "UI/UX Design", bgLight: "#c6ef63", bgDark: "#4b6814", color: "#12100e" },
      { text: "Design Systems", bgLight: "#8fd0ff", bgDark: "#234e78", color: "#12100e" },
      { text: "Prototyping", bgLight: "#ef9a8f", bgDark: "#783025", color: "#12100e" },
      { text: "Education", bgLight: "#ffc400", bgDark: "#7d5d00", color: "#12100e" },
      { text: "Frontend / Code", bgLight: "#ff9fb4", bgDark: "#85263d", color: "#12100e" },
      { text: "AI Prototyping", bgLight: "#8bf7d2", bgDark: "#1a6e54", color: "#12100e" },
      { text: "Mentorship", bgLight: "#d8c5ff", bgDark: "#48367a", color: "#12100e" },
      { text: "User Research", bgLight: "#ffd1a4", bgDark: "#784b1f", color: "#12100e" },
      { text: "Brand Strategy", bgLight: "#a3e635", bgDark: "#365314", color: "#12100e" }
    ];

    let pills = [];
    let isDark = htmlRoot.classList.contains('dark');

    window.updatePillsTheme = () => {
      isDark = htmlRoot.classList.contains('dark');
    };

    function resizeCanvas() {
      const container = canvas.parentElement;
      width = container.clientWidth;
      height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    class Pill {
      constructor(def, x, y, vx, vy) {
        this.def = def;
        this.text = def.text;
        this.fontSize = 13;
        this.paddingX = 22;
        this.paddingY = 12;

        // Measure text width
        ctx.font = `600 ${this.fontSize}px 'Inter', sans-serif`;
        const metrics = ctx.measureText(this.text);
        this.w = metrics.width + this.paddingX * 2;
        this.h = this.fontSize + this.paddingY * 2;
        this.r = this.h / 2;

        this.x = x || Math.random() * (width - this.w - 40) + 20;
        this.y = y || -Math.random() * 200 - this.h;
        this.vx = vx || (Math.random() - 0.5) * 4;
        this.vy = vy || Math.random() * 2 + 1;
        this.angle = (Math.random() - 0.5) * 0.4;
        this.vAngle = (Math.random() - 0.5) * 0.05;

        this.mass = this.w * this.h;
        this.isDragged = false;
      }

      update() {
        if (this.isDragged) return;

        const gravity = 0.42;
        const friction = 0.985;
        const bounce = 0.55;

        this.vy += gravity;
        this.vx *= friction;
        this.vy *= friction;
        this.vAngle *= 0.96;

        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.vAngle;

        // Bottom floor collision
        if (this.y + this.h > height) {
          this.y = height - this.h;
          this.vy = -this.vy * bounce;
          this.vx *= 0.9;
          this.vAngle *= 0.8;
          if (Math.abs(this.vy) < 0.4) this.vy = 0;
        }

        // Left wall collision
        if (this.x < 0) {
          this.x = 0;
          this.vx = -this.vx * bounce;
        }

        // Right wall collision
        if (this.x + this.w > width) {
          this.x = width - this.w;
          this.vx = -this.vx * bounce;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(this.angle);

        const halfW = this.w / 2;
        const halfH = this.h / 2;
        const radius = this.r;

        // Pill Capsule Path
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, this.w, this.h, radius);

        // Fill
        ctx.fillStyle = isDark ? this.def.bgDark : this.def.bgLight;
        ctx.fill();

        // Border & Highlight
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.12)";
        ctx.stroke();

        // Inner soft shadow simulation
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.roundRect(-halfW + 1, -halfH + 1, this.w - 2, this.h - 2, radius);
        ctx.stroke();

        // Label Text
        ctx.font = `600 ${this.fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDark ? '#f2f4f8' : this.def.color;
        ctx.fillText(this.text, 0, 1);

        ctx.restore();
      }

      contains(px, py) {
        return px >= this.x && px <= this.x + this.w &&
               py >= this.y && py <= this.y + this.h;
      }
    }

    // Resolve simple pill-to-pill collision
    function resolveCollisions() {
      for (let i = 0; i < pills.length; i++) {
        for (let j = i + 1; j < pills.length; j++) {
          const p1 = pills[i];
          const p2 = pills[j];

          const c1x = p1.x + p1.w / 2;
          const c1y = p1.y + p1.h / 2;
          const c2x = p2.x + p2.w / 2;
          const c2y = p2.y + p2.h / 2;

          const dx = c2x - c1x;
          const dy = c2y - c1y;
          const dist = Math.hypot(dx, dy);
          const minDist = (p1.r + p2.r) * 1.35;

          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            if (!p1.isDragged) {
              p1.x -= nx * overlap;
              p1.y -= ny * overlap;
              p1.vx -= nx * 0.5;
              p1.vy -= ny * 0.5;
            }
            if (!p2.isDragged) {
              p2.x += nx * overlap;
              p2.y += ny * overlap;
              p2.vx += nx * 0.5;
              p2.vy += ny * 0.5;
            }
          }
        }
      }
    }

    function initPills() {
      pills = [];
      pillDefinitions.forEach((def, index) => {
        const staggerY = -40 * index - 20;
        const randX = Math.random() * (width - 180) + 10;
        pills.push(new Pill(def, randX, staggerY));
      });
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);

      pills.forEach(p => p.update());
      resolveCollisions();
      pills.forEach(p => p.draw());

      animId = requestAnimationFrame(loop);
    }

    resizeCanvas();
    initPills();
    loop();

    window.addEventListener('resize', () => {
      resizeCanvas();
    });

    // Interactive Drag & Throw Controls
    let activePill = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVx = 0;
    let mouseVy = 0;

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function onPointerDown(e) {
      const { x, y } = getCanvasCoords(e);
      for (let i = pills.length - 1; i >= 0; i--) {
        if (pills[i].contains(x, y)) {
          activePill = pills[i];
          activePill.isDragged = true;
          dragOffsetX = x - activePill.x;
          dragOffsetY = y - activePill.y;
          lastMouseX = x;
          lastMouseY = y;
          mouseVx = 0;
          mouseVy = 0;
          break;
        }
      }
    }

    function onPointerMove(e) {
      if (!activePill) return;
      const { x, y } = getCanvasCoords(e);
      mouseVx = x - lastMouseX;
      mouseVy = y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;

      activePill.x = x - dragOffsetX;
      activePill.y = y - dragOffsetY;
    }

    function onPointerUp() {
      if (activePill) {
        activePill.isDragged = false;
        activePill.vx = mouseVx * 0.8;
        activePill.vy = mouseVy * 0.8;
        activePill = null;
      }
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Button Controls
    const addPillsBtn = document.getElementById('addPillsBtn');
    const resetPillsBtn = document.getElementById('resetPillsBtn');

    if (addPillsBtn) {
      addPillsBtn.addEventListener('click', () => {
        pillDefinitions.forEach((def, index) => {
          const randX = Math.random() * (width - 180) + 10;
          const staggerY = -40 * index - 30;
          pills.push(new Pill(def, randX, staggerY));
        });
      });
    }

    if (resetPillsBtn) {
      resetPillsBtn.addEventListener('click', () => {
        initPills();
      });
    }
  }

  // =========================================================================
  // 5. INTERACTIVE CARTOON EYE-TRACKING PUPILS
  // =========================================================================
  const pupils = Array.from(document.querySelectorAll('[data-pupil="true"]'));

  if (pupils.length > 0) {
    function trackEyes(e) {
      pupils.forEach(pupil => {
        const parent = pupil.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const maxDist = 0.26 * Math.min(rect.width, rect.height);
        const dist = Math.min(maxDist, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 10);

        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;

        pupil.style.transform = `translate(calc(-50% + ${offsetX.toFixed(2)}px), calc(-50% + ${offsetY.toFixed(2)}px))`;
      });
    }

    window.addEventListener('mousemove', trackEyes, { passive: true });
  }

  // =========================================================================
  // 6. CYCLING WORD FLIPPER ("LET'S DESIGN/BUILD/CRAFT/TEACH")
  // =========================================================================
  const flipperWords = ['DESIGN', 'BUILD', 'CRAFT', 'TEACH'];
  const flipperWordEl = document.getElementById('flipperWord');
  const flipperWordSolidEl = document.getElementById('flipperWordSolid');
  let currentWordIndex = 0;

  if (flipperWordEl && flipperWordSolidEl) {
    setInterval(() => {
      currentWordIndex = (currentWordIndex + 1) % flipperWords.length;
      const nextWord = flipperWords[currentWordIndex];

      // Smooth opacity & transform transition
      flipperWordEl.style.opacity = '0';
      flipperWordSolidEl.style.opacity = '0';
      flipperWordEl.style.transform = 'translateY(10px)';
      flipperWordSolidEl.style.transform = 'translateY(10px)';

      setTimeout(() => {
        flipperWordEl.textContent = nextWord;
        flipperWordSolidEl.textContent = nextWord;
        flipperWordEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        flipperWordSolidEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        flipperWordEl.style.opacity = '1';
        flipperWordSolidEl.style.opacity = '1';
        flipperWordEl.style.transform = 'translateY(0)';
        flipperWordSolidEl.style.transform = 'translateY(0)';
      }, 300);
    }, 2800);
  }

  // =========================================================================
  // 7. TESTIMONIAL SNAP CAROUSEL NAVIGATION
  // =========================================================================
  const feedbackTrack = document.getElementById('feedbackTrack');
  const btnPrev = document.getElementById('btnFeedbackPrev');
  const btnNext = document.getElementById('btnFeedbackNext');
  const btnPrevMobile = document.getElementById('btnFeedbackPrevMobile');
  const btnNextMobile = document.getElementById('btnFeedbackNextMobile');

  function scrollFeedback(direction) {
    if (!feedbackTrack) return;
    const slideWidth = feedbackTrack.querySelector('.testimonial-slide')?.clientWidth || 400;
    feedbackTrack.scrollBy({
      left: direction * (slideWidth + 32),
      behavior: 'smooth'
    });
  }

  if (btnPrev) btnPrev.addEventListener('click', () => scrollFeedback(-1));
  if (btnNext) btnNext.addEventListener('click', () => scrollFeedback(1));
  if (btnPrevMobile) btnPrevMobile.addEventListener('click', () => scrollFeedback(-1));
  if (btnNextMobile) btnNextMobile.addEventListener('click', () => scrollFeedback(1));

});
