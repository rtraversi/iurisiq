/* IurisIQ — main.js */

// ============================================================
// HERO CANVAS — Flowing data streams
// ============================================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const STREAM_COUNT = 26;
  let W, H, streams = [], animFrame;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeStream(index, distributed) {
    const isGold   = Math.random() < 0.12;
    const color    = isGold ? '196,147,63' : '91,189,255';
    const rowH     = H / STREAM_COUNT;
    const baseY    = rowH * index + rowH * 0.5;
    return {
      y:       baseY + (Math.random() - 0.5) * rowH * 0.9,
      x:       distributed ? Math.random() * (W + 400) - 200 : W + 20 + Math.random() * 300,
      length:  W * (0.12 + Math.random() * 0.38),
      speed:   0.18 + Math.random() * 0.52,
      opacity: 0.03 + Math.random() * 0.09,
      width:   0.3  + Math.random() * 0.85,
      color,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    streams.forEach((s, idx) => {
      const x0 = s.x, x1 = s.x + s.length;
      const grad = ctx.createLinearGradient(x0, 0, x1, 0);
      grad.addColorStop(0,    `rgba(${s.color},0)`);
      grad.addColorStop(0.2,  `rgba(${s.color},${s.opacity})`);
      grad.addColorStop(0.8,  `rgba(${s.color},${s.opacity})`);
      grad.addColorStop(1,    `rgba(${s.color},0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = s.width;
      ctx.moveTo(x0, s.y);
      ctx.lineTo(x1, s.y);
      ctx.stroke();

      // Leading-edge node dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.color},${Math.min(s.opacity * 2.8, 0.32)})`;
      ctx.arc(x0 + s.length * 0.2, s.y, s.width * 1.4, 0, Math.PI * 2);
      ctx.fill();

      s.x -= s.speed;

      if (s.x + s.length < 0) {
        const fresh = makeStream(idx % STREAM_COUNT, false);
        fresh.y = s.y + (Math.random() - 0.5) * 12;
        streams[idx] = fresh;
      }
    });

    animFrame = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    streams = Array.from({ length: STREAM_COUNT }, (_, i) => makeStream(i, true));
    if (animFrame) cancelAnimationFrame(animFrame);
    tick();
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  init();
}());


// ============================================================
// HERO CURSOR GLOW — Follows mouse with soft lag
// ============================================================
(function () {
  const hero  = document.getElementById('hero');
  const glow  = document.getElementById('hero-cursor-glow');
  if (!hero || !glow) return;

  let visible = false;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.left    = x + 'px';
    glow.style.top     = y + 'px';
    glow.style.opacity = '1';
    if (!visible) { visible = true; }
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
  }, { passive: true });
}());


// ============================================================
// HERO TICKER — Cycles through law practice areas
// ============================================================
(function () {
  const el = document.getElementById('hero-ticker-text');
  if (!el) return;

  const AREAS = [
    'your workflows.',
    'your firm size.',
    'your practice area.',
    'your growth.',
    'your clients.',
  ];
  let idx = 0;

  setInterval(() => {
    el.classList.add('t-exit');
    setTimeout(() => {
      idx = (idx + 1) % AREAS.length;
      el.textContent = AREAS[idx];
      el.classList.remove('t-exit');
      el.classList.add('t-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.classList.remove('t-enter'); });
      });
    }, 290);
  }, 2800);
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
// CONTACT FORM — POST to /api/contact via Resend
// ============================================================
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn      = form.querySelector('.btn-submit');
    const textSpan = btn.querySelector('.btn-submit-text');
    const original = textSpan ? textSpan.textContent : btn.textContent;

    btn.disabled = true;
    btn.style.opacity = '0.75';
    if (textSpan) textSpan.textContent = 'Sending…';

    const setText = (t) => { if (textSpan) textSpan.textContent = t; else btn.textContent = t; };
    const reset   = () => {
      setText(original);
      btn.style.background = '';
      btn.style.opacity    = '';
      btn.disabled         = false;
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.querySelector('#f-name').value.trim(),
          firm:    form.querySelector('#f-firm').value.trim(),
          email:   form.querySelector('#f-email').value.trim(),
          message: form.querySelector('#f-message').value.trim(),
        }),
      });

      if (res.ok) {
        setText('Message Sent!');
        btn.style.background = '#1A8055';
        setTimeout(() => { reset(); form.reset(); }, 3500);
      } else {
        throw new Error('send failed');
      }
    } catch {
      setText('Something went wrong');
      btn.style.background = '#b91c1c';
      setTimeout(reset, 3500);
    }
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
