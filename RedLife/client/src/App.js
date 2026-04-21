import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';

import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AuthCallback from './pages/AuthCallback';

/* ══════════════════════════════════════
   MAGNETIC CURSOR
══════════════════════════════════════ */
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailsRef = useRef([]);
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ringPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      ringPosRef.current.x = lerp(ringPosRef.current.x, posRef.current.x, 0.1);
      ringPosRef.current.y = lerp(ringPosRef.current.y, posRef.current.y, 0.1);
      if (ringRef.current) {
        ringRef.current.style.left = ringPosRef.current.x + 'px';
        ringRef.current.style.top = ringPosRef.current.y + 'px';
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    const onEnter = (e) => {
      if (e.target.closest('a, button, [data-hover]')) setIsHovering(true);
    };
    const onLeave = (e) => {
      if (e.target.closest('a, button, [data-hover]')) setIsHovering(false);
    };
    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div className={`cursor ${isHovering ? 'cursor--hover' : ''} ${isClicking ? 'cursor--click' : ''}`} ref={dotRef} />
      <div className={`cursor-ring ${isHovering ? 'cursor-ring--hover' : ''} ${isClicking ? 'cursor-ring--click' : ''}`} ref={ringRef} />
    </>
  );
}

/* ══════════════════════════════════════
   ADVANCED PARTICLES
══════════════════════════════════════ */
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let mouse = { x: w / 2, y: h / 2 };

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.8 + 0.3,
      color: Math.random() > 0.6 ? '#CC0000' : Math.random() > 0.5 ? '#FFD700' : '#ffffff',
      opacity: Math.random() * 0.4 + 0.05,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x -= dx * 0.0008;
          p.y -= dy * 0.0008;
        }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const opacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = '#CC0000';
            ctx.globalAlpha = (1 - dist / 90) * 0.12;
            ctx.lineWidth = 0.4;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas id="particles-canvas" ref={canvasRef} />;
}

/* ══════════════════════════════════════
   NOISE OVERLAY
══════════════════════════════════════ */
function NoiseOverlay() {
  return <div className="noise-overlay" />;
}

/* ══════════════════════════════════════
   PAGE TRANSITION
══════════════════════════════════════ */
function PageTransition({ children }) {
  const location = useLocation();
  const [display, setDisplay] = useState(children);
  const [state, setState] = useState('idle');

  useEffect(() => {
    setState('out');
    const t1 = setTimeout(() => {
      setDisplay(children);
      setState('in');
    }, 300);
    const t2 = setTimeout(() => setState('idle'), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname]);

  return (
    <div className={`page-transition page-transition--${state}`}>
      {display}
    </div>
  );
}

/* ══════════════════════════════════════
   SPLIT TEXT REVEAL
══════════════════════════════════════ */
function SplitText({ text, className = '', delay = 0 }) {
  return (
    <span className={`split-text ${className}`} style={{ '--base-delay': `${delay}ms` }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="split-char"
          style={{ '--i': i, animationDelay: `${delay + i * 40}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════
   HEADER
══════════════════════════════════════ */
function Header({ user, setUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <Link to="/" className="logo" data-hover>
          <span className="logo-bracket">[</span>
          <span className="logo-red">RED</span>
          <span className="logo-white">LIFE</span>
          <span className="logo-bracket">]</span>
          <span className="logo-tag">ROMÂNIA</span>
        </Link>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          {[['/', 'ACASĂ'], ['/shop', 'SHOP']].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'nav-link--active' : ''}`}
              data-hover
            >
              <span className="nav-link-text">{label}</span>
              <span className="nav-link-hover">{label}</span>
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/account" className={`nav-link ${location.pathname === '/account' ? 'nav-link--active' : ''}`} data-hover>
                <span className="nav-link-text">CONT</span>
                <span className="nav-link-hover">CONT</span>
              </Link>
              <button className="btn-logout" onClick={logout} data-hover>
                <span>LOGOUT</span>
                <div className="btn-logout-bg" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-nav-login" data-hover>
              <span>LOGIN</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
            </Link>
          )}
        </nav>

        <button className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} data-hover>
          <span /><span /><span />
        </button>

        <div className="header-line" />
        <div className="header-scanline" />
      </header>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

/* ══════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════ */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const duration = 1800;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(target);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, started]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════
   HOME PAGE
══════════════════════════════════════ */
function Home() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), idx * 80);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const stats = [
    { num: 1500, suffix: '+', label: 'Jucători Activi', icon: '◈' },
    { num: 50, suffix: '+', label: 'Misiuni Unice', icon: '◉' },
    { num: 99, suffix: '%', label: 'Uptime Server', icon: '◎' },
    { num: 3, suffix: ' ANI', label: 'De Activitate', icon: '◆' },
  ];

  const features = [
    { icon: '🚗', title: 'Vehicule Custom', desc: 'Sute de mașini românești și internaționale disponibile pentru tine.', tag: '500+' },
    { icon: '💼', title: 'Joburi Realiste', desc: 'Muncește, câștigă, avansează. Sistem economic complet.', tag: 'LIVE' },
    { icon: '🏠', title: 'Case & Proprietăți', desc: 'Cumpără proprietăți și construiește-ți imperiul.', tag: 'NEW' },
    { icon: '⚔️', title: 'Facțiuni & Ganguri', desc: 'Alătură-te sau creează propria facțiune.', tag: 'PVP' },
    { icon: '🛒', title: 'Shop Online', desc: 'Obține iteme exclusive direct din shop-ul nostru.', tag: 'HOT' },
    { icon: '🔐', title: 'Login Sigur', desc: 'Autentificare prin Steam, Discord sau Google.', tag: 'SEC' },
  ];

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-grid" style={{ transform: `perspective(800px) rotateX(18deg) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }} />
        <div className="hero-vignette" />

        {/* Floating orbs */}
        <div className="hero-orb hero-orb--1" style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }} />
        <div className="hero-orb hero-orb--2" style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)` }} />
        <div className="hero-orb hero-orb--3" style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 1.2}px)` }} />

        <div className="hero-content" style={{ transform: `translate(${mousePos.x * 0.05}px, ${mousePos.y * 0.05}px)` }}>
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            <span>CEL MAI TARE SERVER DIN ROMÂNIA</span>
            <span className="eyebrow-line" />
          </div>

          <h1 className="hero-title">
            <span className="t-red glitch" data-text="RED">
              <SplitText text="RED" delay={400} />
            </span>
            <span className="t-white">
              <SplitText text="LIFE" delay={600} />
            </span>
          </h1>

          <div className="hero-romania">
            <span className="hero-ro-blue">ROM</span>
            <span className="hero-ro-yellow">ÂN</span>
            <span className="hero-ro-red">IA</span>
          </div>

          <p className="hero-desc">
            Experiența ultimă de roleplay.<br />
            <span className="desc-highlight">Intră în lumea RedLife.</span>
          </p>

          <div className="hero-btns">
            <Link to="/shop" className="btn-primary" data-hover>
              <span className="btn-content">
                <span className="btn-icon">▶</span>
                INTRĂ ÎN SHOP
              </span>
              <span className="btn-glare" />
              <span className="btn-border-anim" />
            </Link>
            <Link to="/login" className="btn-secondary" data-hover>
              <span className="btn-content">CONECTEAZĂ-TE</span>
              <span className="btn-corner btn-corner--tl" />
              <span className="btn-corner btn-corner--br" />
            </Link>
          </div>

          <div className="hero-scroll">
            <span className="scroll-text-label">SCROLL</span>
            <div className="scroll-track">
              <div className="scroll-thumb" />
            </div>
          </div>
        </div>

        {/* Side decorations */}
        <div className="hero-side hero-side--left">
          {['01', '02', '03', '04', '05'].map((n) => (
            <span key={n} className="side-num">{n}</span>
          ))}
        </div>
        <div className="hero-side hero-side--right">
          <span className="side-vertical">FIVEM · ROLEPLAY · ROMÂNIA</span>
        </div>

        {/* Bottom bar */}
        <div className="hero-bottom-bar">
          <span>IP: play.redlife.ro</span>
          <span className="bar-dot">◆</span>
          <span>DISCORD: discord.gg/redlife</span>
          <span className="bar-dot">◆</span>
          <span className="bar-live"><span className="live-dot" />LIVE — 847 online</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div className="stat-item reveal" key={i} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-number">
                <Counter target={s.num} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-bar" />
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {Array(3).fill(['ROLEPLAY', '◆', 'FIVEM', '◆', 'ROMÂNIA', '◆', 'REDLIFE', '◆', 'SERVER', '◆']).flat().map((w, i) => (
            <span key={i} className={w === '◆' ? 'marquee-dot' : 'marquee-word'}>{w}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="section-header reveal">
          <div className="section-tag-wrap">
            <span className="section-tag-line" />
            <p className="section-tag">De ce RedLife?</p>
            <span className="section-tag-line" />
          </div>
          <h2 className="section-title">TOT CE AI <span>NEVOIE</span></h2>
          <p className="section-sub">Platforma completă de roleplay pentru comunitatea românească</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }} data-hover>
              <div className="feature-card-inner">
                <div className="feature-header">
                  <span className="feature-icon">{f.icon}</span>
                  <span className="feature-tag">{f.tag}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-footer">
                  <span className="feature-arrow">→ Află mai mult</span>
                </div>
              </div>
              <div className="feature-glow" />
              <div className="feature-line" />
              <div className="feature-corner feature-corner--tr" />
              <div className="feature-corner feature-corner--bl" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-section reveal">
        <div className="cta-bg" />
        <div className="cta-grid" />
        <div className="cta-content">
          <p className="cta-tag">READY TO PLAY?</p>
          <h2 className="cta-title">ALĂTURĂ-TE COMUNITĂȚII</h2>
          <p className="cta-desc">Peste 1500 de jucători te așteaptă pe serverul #1 din România</p>
          <div className="cta-btns">
            <Link to="/shop" className="btn-primary" data-hover>
              <span className="btn-content"><span className="btn-icon">◈</span>SHOP ACUM</span>
              <span className="btn-glare" />
            </Link>
            <a href="#" className="btn-secondary" data-hover>
              <span className="btn-content">JOIN DISCORD</span>
              <span className="btn-corner btn-corner--tl" />
              <span className="btn-corner btn-corner--br" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════ */
function Login({ setUser }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const providers = [
    { key: 'steam', label: 'CONTINUĂ CU STEAM', emoji: '🎮', url: '/api/auth/steam', color: '#1b2838' },
    { key: 'discord', label: 'CONTINUĂ CU DISCORD', emoji: '💬', url: '/api/auth/discord', color: '#5865F2' },
    { key: 'google', label: 'CONTINUĂ CU GOOGLE', emoji: '🔍', url: '/api/auth/google', color: '#EA4335' },
  ];

  return (
    <div className="login">
      <div className="login-bg" />
      <div className="login-orb login-orb--1" />
      <div className="login-orb login-orb--2" />

      <div className="login-card">
        {/* Corner decorations */}
        <span className="card-corner card-corner--tl" />
        <span className="card-corner card-corner--tr" />
        <span className="card-corner card-corner--bl" />
        <span className="card-corner card-corner--br" />

        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-red">RED</span>
            <span className="login-logo-white">LIFE</span>
          </div>
          <div className="login-badge">ROMÂNIA</div>
        </div>

        <p className="login-subtitle">CONECTEAZĂ-TE LA SERVER</p>
        <div className="login-divider"><span>ALEGE METODA</span></div>

        <div className="login-btns">
          {providers.map((p) => (
            <button
              key={p.key}
              className={`login-btn ${hoveredBtn === p.key ? 'login-btn--hovered' : ''}`}
              onClick={() => window.location.href = p.url}
              onMouseEnter={() => setHoveredBtn(p.key)}
              onMouseLeave={() => setHoveredBtn(null)}
              data-hover
              style={{ '--provider-color': p.color }}
            >
              <span className="login-btn-icon">{p.emoji}</span>
              <span className="login-btn-text">{p.label}</span>
              <span className="login-btn-arrow">→</span>
              <span className="login-btn-shimmer" />
            </button>
          ))}
        </div>

        <p className="login-footer-note">
          <span className="lock-icon">🔒</span>
          Autentificare securizată · Date protejate
        </p>

        <div className="login-scanline" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top-line" />
      <div className="footer-glow" />

      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo" data-hover>
            <span className="logo-bracket">[</span>
            <span className="logo-red">RED</span>
            <span className="logo-white">LIFE</span>
            <span className="logo-bracket">]</span>
          </Link>
          <p className="footer-desc">
            Cel mai tare server FiveM din România. Experiență unică de roleplay pentru toți jucătorii.
          </p>
          <div className="footer-socials">
            {['Discord', 'Facebook', 'TikTok', 'YouTube'].map((s) => (
              <a key={s} href="#" className="social-link" data-hover>{s[0]}</a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <p className="footer-heading">
            <span className="heading-bracket">◈</span> Navigare
          </p>
          <ul className="footer-links">
            {[['/', 'Acasă'], ['/shop', 'Shop'], ['/account', 'Contul Meu']].map(([path, label]) => (
              <li key={path}><Link to={path} data-hover>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="footer-heading">
            <span className="heading-bracket">◈</span> Social
          </p>
          <ul className="footer-links">
            {['Discord', 'Facebook', 'TikTok'].map((s) => (
              <li key={s}><a href="#" data-hover>{s}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="footer-heading">
            <span className="heading-bracket">◈</span> Server
          </p>
          <div className="server-status">
            <div className="status-dot" />
            <span>ONLINE</span>
          </div>
          <p className="server-ip">play.redlife.ro</p>
          <p className="server-players"><span className="player-count">847</span> / 1024 online</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 REDLIFE ROMÂNIA</span>
        <span className="footer-sep">◆</span>
        <span>TOATE DREPTURILE REZERVATE</span>
        <span className="footer-sep">◆</span>
        <span>v2.4.1</span>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════
   APP
══════════════════════════════════════ */
function AppInner() {
  const [user, setUser] = useState({ id: 1, username: 'TestUser' });
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-inner">
          <div className="loading-logo">
            <span className="logo-red">RED</span>
            <span className="logo-white">LIFE</span>
          </div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
          <span className="loading-text">SE ÎNCARCĂ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header user={user} setUser={setUser} />
      <main className="main-content">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/callback" element={<AuthCallback setUser={setUser} />} />
            <Route path="/shop" element={user ? <Shop /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
            <Route path="/account" element={user ? <Account user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Cursor />
      <Particles />
      <NoiseOverlay />
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
