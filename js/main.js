/* IurisIQ — main.js */

// ============================================================
// HERO CANVAS — Network graph animation (mirrors the logo icon)
// ============================================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NODE_COUNT = 55;
  const MAX_DIST   = 150;
  const SPEED      = 0.28;
  const NODE_COLOR = '91,189,255';
  const EDGE_COLOR = '91,189,255';

  let W, H, nodes = [], animFrame;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  Math.random() * 1.8 + 0.8,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${EDGE_COLOR},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${NODE_COLOR},0.55)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Update position
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20 || n.x > W + 20) n.vx *= -1;
      if (n.y < -20 || n.y > H + 20) n.vy *= -1;
    });

    animFrame = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
    if (animFrame) cancelAnimationFrame(animFrame);
    tick();
  }

  window.addEventListener('resize', () => {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }, { passive: true });

  init();
}());


// ============================================================
// NAV — Add scrolled class when user scrolls past threshold
// ============================================================
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}());


// ============================================================
// SCROLL REVEAL — Staggered reveal for .reveal elements
// ============================================================
(function () {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Find siblings to stagger
      const el     = entry.target;
      const parent = el.parentElement;
      const siblings = parent
        ? Array.from(parent.querySelectorAll(':scope > .reveal')).filter(s => !s.classList.contains('visible'))
        : [el];

      // If this el is the trigger, stagger the visible siblings in order
      if (siblings.includes(el)) {
        siblings.forEach((sib, i) => {
          setTimeout(() => {
            sib.classList.add('visible');
            observer.unobserve(sib);
          }, i * 75);
        });
      } else {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -48px 0px',
  });

  targets.forEach(el => observer.observe(el));
}());


// ============================================================
// MODULE CHIPS — Toggle demo on click
// ============================================================
(function () {
  document.querySelectorAll('.chip--off, .chip--add').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('chip--add')) return;
      chip.classList.toggle('chip--off');
      chip.classList.toggle('chip--on');
    });
  });
}());


// ============================================================
// CONTACT FORM — Simple feedback on submit
// ============================================================
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn      = form.querySelector('.btn-submit');
    const textSpan = btn.querySelector('.btn-submit-text');
    const original = textSpan ? textSpan.textContent : btn.textContent;

    btn.disabled = true;
    btn.style.opacity = '0.75';
    if (textSpan) textSpan.textContent = 'Sending…';
    else btn.textContent = 'Sending…';

    // Simulate send (replace with real endpoint later)
    setTimeout(() => {
      if (textSpan) textSpan.textContent = 'Message Sent!';
      else btn.textContent = 'Message Sent!';
      btn.style.background = '#1A8055';

      setTimeout(() => {
        if (textSpan) textSpan.textContent = original;
        else btn.textContent = original;
        btn.style.background = '';
        btn.style.opacity    = '';
        btn.disabled         = false;
        form.reset();
      }, 3500);
    }, 900);
  });
}());


// ============================================================
// SMOOTH NAV LINKS — Close mobile menu on link click (future)
// ============================================================
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}());
