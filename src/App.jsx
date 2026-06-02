import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import blakeLogo from "./blake-logo.png";
import craigLogo from "./Craig Tinder logo.png";
import craigPhoto from "./craig-tinder-photo.jpg";
import { POSTS, POSTS_BY_MARKET, getPostBySlug, postInMarket } from "./blog/posts";
import { GUIDES_BY_MARKET, getGuideBySlug, guideInMarket } from "./neighborhoods/guides";
import { REVIEWS } from "./reviews/reviews";
import siteStats from "../content/site/stats.json";

// Resolve a post's "market" frontmatter to a real theme key. "both" posts have
// no theme of their own, so they default to Chicago when opened cold (e.g. a
// deep link); when opened from a market they keep whichever market you're in.
function marketToTheme(market) {
  if (market === "chicago" || market === "florida") return market;
  if (market === "both") return "chicago";
  return null;
}

// ─── LUXURY DESIGN TOKENS ──────────────────────────────────────────────────
const L = {
  white:      "#FFFFFF",
  cream:      "#F8F5F2",
  taupe:      "#F5F1ED",
  charcoal:   "#2D2D2D",
  slate:      "#64748B",
  slateLight: "#94A3B8",
  gold:       "#D4AF37",
  goldMuted:  "rgba(212,175,55,0.18)",
  border:     "#E5E5E5",
  serif:      "'Playfair Display', Georgia, serif",
  sans:       "'Montserrat', 'Source Sans 3', sans-serif",
};

// ─── CONTENT DATA ──────────────────────────────────────────────────────────
const THEMES = {
  chicago: {
    name: "Chicago",
    brokerage: "@properties",
    location: "Greater Chicago Area",
    email: "craigtinder@atproperties.com",
    taglineL1: "Your Guide to the",
    taglineL2: "Greater Chicago Area",
    heroImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80",
    logoUrl: "https://resources.atproperties.com/images/ta/atp/20250717160224.at.cirehorizontalfullcolor.450.png",
    logoAspect: "wide",
  },
  florida: {
    name: "Florida",
    brokerage: "Blake Real Estate",
    location: "Clearwater Area, FL",
    email: "craig.tinder@blakerealestate.com",
    taglineL1: "Gulf Coast Living",
    taglineL2: "Clearwater & Beyond",
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    logoUrl: blakeLogo,
    logoAspect: "square",
  },
};

const FORMSPREE = {
  valuation: {
    chicago: "https://formspree.io/f/xvzvyljl",
    florida: "https://formspree.io/f/xzdkwwpe",
  },
  contact: {
    chicago: "https://formspree.io/f/xvzvyljl", // replace with dedicated contact form ID
    florida: "https://formspree.io/f/xzdkwwpe",  // replace with dedicated contact form ID
  },
};

// ─── INJECTED STYLES ────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes luxFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.7; }
  }
  @keyframes pageFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; box-sizing: border-box; }
  body { margin: 0; }
  input::placeholder, textarea::placeholder { color: #94A3B8; font-family: 'Montserrat', sans-serif; font-weight: 300; }
  input:focus, textarea:focus, select:focus { border-color: #D4AF37 !important; outline: none; }
  a { transition: color 0.2s ease; }

  /* Ghost button hover states */
  .lux-btn-light:hover  { background: rgba(212,175,55,0.15) !important; border-color: #D4AF37 !important; }
  .lux-btn-dark:hover   { background: #2D2D2D !important; color: #fff !important; }
  .lux-btn-gold:hover   { background: #D4AF37 !important; color: #2D2D2D !important; }

  /* Mount-time fade — animates in automatically, never stays invisible */
  .lux-fade {
    animation: luxFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .lux-fade { animation: none !important; }
  }

  /* Responsive */
  @media (max-width: 900px) {
    .lux-split   { grid-template-columns: 1fr !important; }
    .lux-split > *:first-child { max-width: 320px; margin: 0 auto; }
    .lux-stats   { grid-template-columns: 1fr 1fr !important; }
    .lux-section { padding: 72px 28px !important; }
    .lux-nav-links { display: none !important; }
    .lux-nav-burger { display: flex !important; }
    .lux-nav-logo { height: 60px !important; }
    .lux-nav     { padding: 0 24px !important; }
    .lux-hero-stats { padding: 28px 24px !important; gap: 32px !important; }
    .lux-hero-content { padding: 0 20px !important; }
    .lux-val-grid   { grid-template-columns: 1fr !important; }
    .lux-footer-grid { flex-direction: column !important; gap: 40px !important; }
  }
  @media (max-width: 600px) {
    .lux-stats { grid-template-columns: 1fr !important; }
    .lux-card-grid { grid-template-columns: 1fr !important; }
  }

  /* Blog horizontal scroller — 3 cards per view on desktop, 2 on tablet, 1 on mobile */
  .blog-track::-webkit-scrollbar { display: none; }
  .blog-card { flex: 0 0 calc((100% - 6px) / 3); }
  @media (max-width: 900px) { .blog-card { flex-basis: calc((100% - 3px) / 2); } }
  @media (max-width: 600px) { .blog-card { flex-basis: 100%; } }
`;

// ─── MARKET DATA HOOK ───────────────────────────────────────────────────────
// Fetches live stats from the FRED API (St. Louis Fed — free, public).
// Requires VITE_FRED_API_KEY in .env.local (free key at fred.stlouisfed.org).
// Silently skips rendering if no key is present.
function useMarketData() {
  const [data, setData] = useState({ loading: true, rate: null, price: null, supply: null, updatedAt: null });

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FRED_API_KEY;
    if (!apiKey) { setData(d => ({ ...d, loading: false })); return; }

    const obs = (series) =>
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${apiKey}&limit=1&sort_order=desc&file_type=json`)
        .then(r => r.json())
        .then(j => j.observations?.[0]?.value ?? null);

    Promise.all([
      obs("MORTGAGE30US"), // 30-yr fixed rate, weekly
      obs("MSPUS"),        // US median sale price, quarterly
      obs("MSACSR"),       // months of housing supply, monthly
    ]).then(([rate, price, supply]) => {
      setData({
        loading: false,
        rate:    rate   ? `${parseFloat(rate).toFixed(2)}%`           : null,
        price:   price  ? `$${Math.round(parseFloat(price) / 1000)}K` : null,
        supply:  supply ? `${parseFloat(supply).toFixed(1)} mo`        : null,
        updatedAt: new Date(),
      });
    }).catch(() => setData(d => ({ ...d, loading: false })));
  }, []);

  return data;
}

// ─── UTILITY HOOKS ──────────────────────────────────────────────────────────
// Sets animation-delay on mount so .lux-fade elements stagger in automatically.
// Content is never hidden — luxFadeUp keyframe runs once then stays at opacity:1.
function useFadeIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.style.animationDelay = `${delay}s`;
  }, [delay]);
  return ref;
}

// ─── PRIMITIVE COMPONENTS ───────────────────────────────────────────────────
function GoldRule({ center = false }) {
  return (
    <div style={{
      width: 48,
      height: 1,
      background: L.gold,
      margin: center ? "28px auto" : "28px 0",
    }} />
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p style={{
      fontFamily: L.sans,
      fontSize: 10,
      color: light ? "rgba(255,255,255,0.5)" : L.slateLight,
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      margin: "0 0 18px",
      fontWeight: 600,
    }}>{children}</p>
  );
}

function SectionHeading({ children, light = false, center = false }) {
  return (
    <h2 style={{
      fontFamily: L.serif,
      fontSize: "clamp(32px, 3.5vw, 54px)",
      color: light ? "#fff" : L.charcoal,
      margin: 0,
      fontWeight: 400,
      lineHeight: 1.12,
      letterSpacing: "-0.01em",
      textAlign: center ? "center" : "left",
    }}>{children}</h2>
  );
}

function GhostButton({ href, children, variant = "dark", className = "", onClick, style: extraStyle = {} }) {
  const variants = {
    dark:  { border: `1px solid ${L.charcoal}`, color: L.charcoal, background: "transparent" },
    light: { border: "1px solid rgba(255,255,255,0.5)", color: "#fff", background: "transparent" },
    gold:  { border: `1px solid ${L.gold}`, color: L.gold, background: "transparent" },
  };
  const base = {
    display: "inline-block",
    padding: "15px 44px",
    fontFamily: L.sans,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.28s ease",
    ...variants[variant],
    ...extraStyle,
  };
  if (href) return <a href={href} className={`lux-btn-${variant} ${className}`} style={base}>{children}</a>;
  return <button onClick={onClick} className={`lux-btn-${variant} ${className}`} style={{ ...base, border: base.border }}>{children}</button>;
}

const SOCIALS = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/craig-tinder-0162a49/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <path d="M7 10v7M7 7v.01M12 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4M12 10v7"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/tinderhome_/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/tinderhome/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

function StarRating({ count }) {
  return (
    <span style={{ color: L.gold, fontSize: 13, letterSpacing: 3 }}>{"★".repeat(count)}</span>
  );
}

function BrokerageLogo({ theme, width, height, onDark = false }) {
  const pad = onDark ? "3px 7px" : 0;
  const imgStyle = height
    ? { height, width: "auto", display: "block" }
    : { width: width || 110, height: "auto", display: "block" };
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: onDark ? "rgba(255,255,255,0.92)" : "transparent",
      borderRadius: onDark ? 3 : 0,
      padding: pad,
      flexShrink: 0,
    }}>
      <img src={theme.logoUrl} alt={theme.brokerage} style={imgStyle} />
    </div>
  );
}

// ─── THEME TOGGLE ───────────────────────────────────────────────────────────
function ThemeToggle({ active, onSwitch, scrolled }) {
  return (
    <div style={{
      display: "flex",
      border: scrolled ? `1px solid ${L.border}` : "1px solid rgba(255,255,255,0.3)",
      borderRadius: 1,
      overflow: "hidden",
    }}>
      {[{ key: "chicago", label: "Chicago" }, { key: "florida", label: "Florida" }].map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onSwitch(key)}
            style={{
              padding: "9px 18px",
              border: "none",
              cursor: "pointer",
              fontFamily: L.sans,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              transition: "all 0.25s ease",
              background: isActive
                ? (scrolled ? L.charcoal : "rgba(255,255,255,0.9)")
                : "transparent",
              color: isActive
                ? (scrolled ? "#fff" : L.charcoal)
                : (scrolled ? L.slate : "rgba(255,255,255,0.7)"),
            }}
          >{label}</button>
        );
      })}
    </div>
  );
}

// ─── NAV ────────────────────────────────────────────────────────────────────
const NAV_ITEMS = ["About", "Neighborhoods", "Testimonials", "Blog", "Contact"];

function Nav({ activeTheme, onSwitch, onHome, scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <nav className="lux-nav" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: "0 80px",
      height: scrolled ? 72 : 90,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.4s ease",
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${L.border}` : "none",
    }}>
      {/* Brand */}
      <button
        onClick={onHome}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
        aria-label="Return to market selection"
      >
        <img className="lux-nav-logo" src={craigLogo} alt="Craig Tinder" style={{ height: 116, width: "auto", display: "block", filter: scrolled ? "none" : "brightness(0) invert(1)", transition: "filter 0.4s ease" }} />
      </button>

      {/* Desktop links */}
      <div className="lux-nav-links" style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {NAV_ITEMS.map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            fontFamily: L.sans,
            fontSize: 10,
            color: scrolled ? L.slate : "rgba(255,255,255,0.75)",
            textDecoration: "none",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            transition: "color 0.25s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = scrolled ? L.charcoal : "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = scrolled ? L.slate : "rgba(255,255,255,0.75)"}
          >{item}</a>
        ))}
        <ThemeToggle active={activeTheme} onSwitch={onSwitch} scrolled={scrolled} />
      </div>

      {/* Mobile hamburger — revealed below 900px via .lux-nav-burger */}
      <button
        className="lux-nav-burger"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        style={{
          display: "none",
          flexDirection: "column",
          gap: 5,
          background: "none",
          border: "none",
          padding: 8,
          cursor: "pointer",
        }}
      >
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display: "block", width: 24, height: 2,
            background: scrolled ? L.charcoal : "#fff",
            transition: "background 0.3s ease",
          }} />
        ))}
      </button>

      {/* Mobile menu overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          background: L.cream,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          style={{
            position: "absolute", top: 26, right: 24,
            background: "none", border: "none", padding: 8, cursor: "pointer",
            fontFamily: L.sans, fontSize: 30, lineHeight: 1, color: L.charcoal,
          }}
        >×</button>

        {NAV_ITEMS.map(item => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: L.serif,
              fontSize: 30,
              color: L.charcoal,
              textDecoration: "none",
              fontWeight: 400,
              letterSpacing: "0.01em",
              padding: "12px 0",
            }}
          >{item}</a>
        ))}

        <div style={{ width: 40, height: 1, background: L.gold, margin: "28px 0" }} />

        {/* Market toggle — close the menu after switching */}
        <ThemeToggle
          active={activeTheme}
          onSwitch={(key) => { onSwitch(key); setMenuOpen(false); }}
          scrolled={true}
        />
      </div>
    </nav>
  );
}

// ─── HERO ───────────────────────────────────────────────────────────────────
function Hero({ theme }) {
  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const onScroll = () => setParallax(Math.min(window.scrollY * 0.08, 10));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section style={{
      height: "100vh",
      minHeight: 640,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Parallax image */}
      <div style={{
        position: "absolute",
        inset: "-12px",
        backgroundImage: `url(${theme.heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: `translateY(${parallax}px)`,
        transition: "transform 0.1s linear",
      }} />
      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(18,18,18,0.38) 0%, rgba(18,18,18,0.68) 100%)",
      }} />

      {/* Hero text — paddingBottom offsets the stats bar so content is visually centered */}
      <div
        className="lux-hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 40px 110px",
          maxWidth: 860,
          animation: "heroFadeIn 1.3s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <Eyebrow light>{theme.location}</Eyebrow>
        <h1 style={{
          fontFamily: L.serif,
          fontSize: "clamp(44px, 6.5vw, 88px)",
          color: "#FFFFFF",
          fontWeight: 400,
          lineHeight: 1.1,
          margin: "0 0 28px",
          letterSpacing: "-0.01em",
        }}>
          <span style={{ display: "block" }}>{theme.taglineL1}</span>
          <span style={{ display: "block" }}>{theme.taglineL2}</span>
        </h1>
        <div style={{ width: 48, height: 1, background: L.gold, margin: "0 auto 28px" }} />
        <p style={{
          fontFamily: L.sans,
          fontSize: 16,
          color: "rgba(255,255,255,0.68)",
          lineHeight: 1.9,
          maxWidth: 460,
          margin: "0 auto 40px",
          fontWeight: 300,
          letterSpacing: "0.02em",
        }}>
          Over two decades helping families buy, sell, and invest with the personal touch that makes all the difference.
        </p>
        <GhostButton href="#contact" variant="light" className="lux-btn-light">
          Contact Craig
        </GhostButton>
      </div>

      {/* Bottom stats bar */}
      <div
        className="lux-hero-stats"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "28px 80px",
          display: "flex",
          justifyContent: "center",
          gap: 64,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          flexWrap: "wrap",
        }}
      >
        {siteStats.heroStats.map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: L.serif, fontSize: "clamp(20px, 2.2vw, 28px)", color: "#fff", margin: "0 0 5px", fontWeight: 400 }}>{stat.value}</p>
            <p style={{ fontFamily: L.sans, fontSize: 10, color: "rgba(255,255,255,0.45)", margin: 0, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.22)", animation: "scrollPulse 2s ease infinite" }} />
      </div>
    </section>
  );
}

// ─── ABOUT ──────────────────────────────────────────────────────────────────
function About() {
  const textRef  = useFadeIn(0);
  const photoRef = useFadeIn(0.1);

  return (
    <section id="about" className="lux-section" style={{ padding: "120px 80px", background: L.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="lux-split" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 88, alignItems: "flex-start" }}>

          {/* Text + stats */}
          <div ref={textRef} className="lux-fade">
            <Eyebrow>About Craig</Eyebrow>
            <SectionHeading>A Different Kind of Agent</SectionHeading>
            <GoldRule />
            <p style={{ fontFamily: L.sans, fontSize: 17, color: L.slate, lineHeight: 1.95, margin: "0 0 24px", fontWeight: 300, letterSpacing: "0.02em" }}>
              Before real estate, Craig spent nearly a decade as a therapist, social worker, and college lecturer — backed by a Master of Arts from the University of Chicago. That foundation in listening, reading people, and navigating high-stakes moments shapes how he approaches every transaction today.
            </p>
            <p style={{ fontFamily: L.sans, fontSize: 17, color: L.slate, lineHeight: 1.95, margin: "0 0 52px", fontWeight: 300, letterSpacing: "0.02em" }}>
              For 25 years he has applied that perspective across two of America's most distinct markets — the greater Chicago area, where he's closed 149+ sales in Park Ridge alone, and Florida's Gulf Coast. Whether it's a luxury sale, a first home, or a Midwest-to-Sunbelt relocation, you get Craig's direct line — no hand-offs, no assistants.
            </p>

            {/* Clean stats row */}
            <div style={{ display: "flex", gap: 52, flexWrap: "wrap", marginBottom: 48 }}>
              {siteStats.aboutStats.map((item, i) => (
                <div key={i}>
                  <p style={{ fontFamily: L.serif, fontSize: "clamp(22px, 2vw, 30px)", color: L.charcoal, margin: "0 0 5px", fontWeight: 400 }}>{item.value}</p>
                  <p style={{ fontFamily: L.sans, fontSize: 10, color: L.slateLight, margin: 0, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Credentials & Recognition */}
            <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 36, display: "flex", gap: 64, flexWrap: "wrap" }}>
              {[
                { label: "Designations", value: "CRS  ·  CNE  ·  Luxury Properties Specialist" },
                { label: "Recognition",  value: "Rolex Award  ·  5× Centurion  ·  Multi-Year Masters Club" },
              ].map((item, i) => (
                <div key={i} style={{ minWidth: 220 }}>
                  <p style={{ fontFamily: L.sans, fontSize: 10, color: L.slateLight, margin: "0 0 10px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</p>
                  <p style={{ fontFamily: L.sans, fontSize: 13, color: L.charcoal, margin: 0, fontWeight: 400, lineHeight: 1.7, letterSpacing: "0.02em" }}>{item.value}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Photo */}
          <div ref={photoRef} className="lux-fade">
            <div style={{
              position: "relative",
              aspectRatio: "4 / 5",
              overflow: "hidden",
              boxShadow: "0 28px 72px rgba(0,0,0,0.13)",
            }}>
              <img
                src={craigPhoto}
                alt="Craig Tinder"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: L.gold }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── MARKET PULSE ───────────────────────────────────────────────────────────
function MarketPulse() {
  const { loading, rate, price, supply, updatedAt } = useMarketData();

  // Don't render if no API key or all fetches failed
  if (loading || (!rate && !price && !supply)) return null;

  const stats = [
    { label: "30-Year Fixed Rate",    value: rate,   note: "Freddie Mac · Updated weekly"   },
    { label: "US Median Sale Price",  value: price,  note: "St. Louis Fed · Updated quarterly" },
    { label: "Months of Supply",      value: supply, note: "US Census Bureau · Updated monthly" },
  ].filter(s => s.value);

  return (
    <section style={{ padding: "80px 80px", background: L.charcoal }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "#4ade80",
              animation: "scrollPulse 2.4s ease infinite",
            }} />
            <p style={{
              fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 700, margin: 0,
            }}>Live Market Data</p>
          </div>
          {updatedAt && (
            <p style={{
              fontFamily: L.sans, fontSize: 10, color: "rgba(255,255,255,0.22)",
              letterSpacing: "0.08em", margin: 0, fontWeight: 300,
            }}>
              As of {updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 3 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              borderTop: `1px solid rgba(212,175,55,0.25)`,
              padding: "40px 36px",
            }}>
              <p style={{
                fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, margin: "0 0 16px",
              }}>{stat.label}</p>
              <p style={{
                fontFamily: L.serif, fontSize: "clamp(30px, 3vw, 44px)",
                color: "#fff", margin: "0 0 10px", fontWeight: 400,
              }}>{stat.value}</p>
              <p style={{
                fontFamily: L.sans, fontSize: 10, color: "rgba(255,255,255,0.22)",
                margin: 0, fontWeight: 300, letterSpacing: "0.06em",
              }}>{stat.note}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── NEIGHBORHOODS ──────────────────────────────────────────────────────────
// Cards are driven by the Markdown guides in /content/neighborhoods (edited in
// the CMS). Each card opens a full guide page (see NeighborhoodGuide), mirroring
// how the blog cards open a full post.
function Neighborhoods({ theme, activeTheme, onOpenGuide }) {
  const headRef = useFadeIn(0);
  const guides = GUIDES_BY_MARKET[activeTheme] || [];

  return (
    <section id="neighborhoods" className="lux-section" style={{ padding: "120px 80px", background: L.cream }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div ref={headRef} className="lux-fade" style={{ textAlign: "center", marginBottom: 72 }}>
          <Eyebrow>Local Expertise</Eyebrow>
          <SectionHeading center>Neighborhood Guides</SectionHeading>
          <GoldRule center />
          <p style={{ fontFamily: L.sans, fontSize: 16, color: L.slate, maxWidth: 500, margin: "0 auto", lineHeight: 1.85, fontWeight: 300 }}>
            Explore the communities Craig knows best in the {theme.name} area.
          </p>
        </div>
        <div className="lux-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 3 }}>
          {guides.map((n, i) => (
            <NeighborhoodCard key={n.slug} n={n} i={i} onOpen={() => onOpenGuide(n.slug)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NeighborhoodCard({ n, i, onOpen }) {
  const outerRef = useFadeIn(i * 0.07);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={outerRef} className="lux-fade" style={{ height: "100%" }}>
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen?.(); } }}
        role="link"
        tabIndex={0}
        aria-label={`Read neighborhood guide: ${n.name}`}
        style={{
          background: L.white,
          padding: "48px 40px",
          cursor: "pointer",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.07)" : "none",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          outline: "none",
        }}
      >
        <span style={{ fontFamily: L.serif, fontSize: 13, color: L.gold, letterSpacing: "0.06em", fontWeight: 400 }}>
          0{i + 1}
        </span>
        <h3 style={{
          fontFamily: L.serif,
          fontSize: 24,
          color: L.charcoal,
          margin: "12px 0 16px",
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: "0.01em",
        }}>{n.name}</h3>
        <div style={{ width: 32, height: 1, background: L.border, margin: "0 0 20px" }} />
        <p style={{
          fontFamily: L.sans,
          fontSize: 14,
          color: L.slate,
          lineHeight: 1.95,
          margin: "0 0 28px",
          fontWeight: 300,
        }}>{n.excerpt}</p>
        <span style={{
          marginTop: "auto",
          fontFamily: L.sans,
          fontSize: 10,
          color: hovered ? L.gold : L.slateLight,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          transition: "color 0.22s ease",
          borderBottom: `1px solid ${hovered ? L.gold : "transparent"}`,
          paddingBottom: 2,
          alignSelf: "flex-start",
        }}>Read Guide →</span>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function Testimonials() {
  const headRef   = useFadeIn(0);
  const trackRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = REVIEWS.length;

  function scrollTo(idx) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx];
    if (!card) return;
    const trackLeft  = track.getBoundingClientRect().left;
    const cardLeft   = card.getBoundingClientRect().left;
    const cardCenter = cardLeft - trackLeft + card.offsetWidth / 2;
    const newScroll  = track.scrollLeft + cardCenter - track.offsetWidth / 2;
    track.scrollTo({ left: newScroll, behavior: "smooth" });
    setActiveIdx(idx);
  }

  function prev() { scrollTo(Math.max(0, activeIdx - 1)); }
  function next() { scrollTo(Math.min(total - 1, activeIdx + 1)); }

  // Keep activeIdx in sync when user manually scrolls
  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const cardCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  }

  return (
    <section id="testimonials" style={{ padding: "120px 0", background: L.white, overflow: "hidden" }}>

      {/* Header */}
      <div ref={headRef} className="lux-fade" style={{ textAlign: "center", marginBottom: 64, padding: "0 80px" }}>
        <Eyebrow>Client Stories</Eyebrow>
        <SectionHeading center>What Clients Say</SectionHeading>
        <GoldRule center />
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingLeft: "max(80px, calc((100vw - 1100px) / 2))",
          paddingRight: "max(80px, calc((100vw - 1100px) / 2))",
          paddingBottom: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {REVIEWS.map((t, i) => (
          <div
            key={t.slug}
            onClick={() => scrollTo(i)}
            style={{
              flexShrink: 0,
              width: "clamp(300px, 38vw, 500px)",
              scrollSnapAlign: "center",
              background: i % 2 === 0 ? L.cream : L.taupe,
              padding: "56px 48px",
              position: "relative",
              cursor: activeIdx === i ? "default" : "pointer",
              opacity: activeIdx === i ? 1 : 0.5,
              transform: activeIdx === i ? "scale(1)" : "scale(0.97)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <span style={{
              fontFamily: L.serif, fontSize: 88, color: L.gold, opacity: 0.18,
              position: "absolute", top: 16, left: 28, lineHeight: 1, fontWeight: 400, pointerEvents: "none",
            }}>"</span>
            <StarRating count={t.rating} />
            <p style={{
              fontFamily: L.serif, fontSize: 16, color: L.charcoal, lineHeight: 1.9,
              margin: "20px 0 28px", fontStyle: "italic", fontWeight: 400, letterSpacing: "0.01em",
            }}>"{t.text}"</p>
            <div style={{ width: 24, height: 1, background: L.gold }} />
            {t.name && (
              <p style={{
                fontFamily: L.sans, fontSize: 11, color: L.slate, margin: "20px 0 0",
                letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700,
              }}>— {t.name}</p>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 48, padding: "0 80px" }}>
        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={activeIdx === 0}
          style={{
            background: "none", border: `1px solid ${L.border}`, width: 44, height: 44,
            cursor: activeIdx === 0 ? "default" : "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: activeIdx === 0 ? 0.25 : 1, transition: "opacity 0.2s ease",
          }}
          aria-label="Previous review"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke={L.charcoal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 8 }}>
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to review ${i + 1}`}
              style={{
                width: activeIdx === i ? 24 : 6,
                height: 6,
                background: activeIdx === i ? L.gold : L.border,
                border: "none", padding: 0, cursor: "pointer",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={activeIdx === total - 1}
          style={{
            background: "none", border: `1px solid ${L.border}`, width: 44, height: 44,
            cursor: activeIdx === total - 1 ? "default" : "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: activeIdx === total - 1 ? 0.25 : 1, transition: "opacity 0.2s ease",
          }}
          aria-label="Next review"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke={L.charcoal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </section>
  );
}

// ─── BLOG ────────────────────────────────────────────────────────────────────
// Posts arrive newest-first (sorted by date in blog/posts.js). They're shown in
// a horizontal scroller — three at a time on desktop — matching the Testimonials
// carousel. Arrows and dots appear only when there are more posts than fit.
function Blog({ activeTheme, onOpenPost }) {
  const headRef = useFadeIn(0);
  const trackRef = useRef(null);
  const posts = POSTS_BY_MARKET[activeTheme] || [];
  const total = posts.length;

  const [activeIdx, setActiveIdx] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Measure scroll position: which card leads the view, whether we can scroll
  // further, and whether the track overflows at all.
  const readState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const x = track.scrollLeft;
    setOverflowing(track.scrollWidth > track.clientWidth + 1);
    setAtStart(x <= 1);
    setAtEnd(x + track.clientWidth >= track.scrollWidth - 1);
    // Closest card to the track's left edge (rect-based so it doesn't depend on
    // offsetParent positioning).
    const trackLeft = track.getBoundingClientRect().left;
    let closest = 0;
    let min = Infinity;
    Array.from(track.children).forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
      if (dist < min) { min = dist; closest = i; }
    });
    setActiveIdx(closest);
  }, []);

  // Reset to the newest post and re-measure when the market changes or on resize.
  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
    const raf = requestAnimationFrame(readState);
    window.addEventListener("resize", readState);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", readState); };
  }, [activeTheme, readState]);

  function scrollToCard(idx) {
    const track = trackRef.current;
    const card = track?.children[idx];
    if (!card) return;
    // Align the card's left edge to the track's left edge.
    const delta = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
  }
  function prev() { scrollToCard(Math.max(0, activeIdx - 1)); }
  function next() { scrollToCard(Math.min(total - 1, activeIdx + 1)); }

  const arrowStyle = (disabled) => ({
    background: "none", border: `1px solid ${L.border}`, width: 44, height: 44,
    cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", opacity: disabled ? 0.25 : 1, transition: "opacity 0.2s ease",
  });

  return (
    <section id="blog" className="lux-section" style={{ padding: "120px 80px", background: L.cream, overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div ref={headRef} className="lux-fade" style={{ textAlign: "center", marginBottom: 72 }}>
          <Eyebrow>Intelligence</Eyebrow>
          <SectionHeading center>Market Insights</SectionHeading>
          <GoldRule center />
          <p style={{ fontFamily: L.sans, fontSize: 16, color: L.slate, maxWidth: 460, margin: "0 auto", lineHeight: 1.85, fontWeight: 300 }}>
            Craig's latest market analysis and local intelligence.
          </p>
        </div>

        {/* Scrollable track */}
        <div
          ref={trackRef}
          onScroll={readState}
          className="blog-track"
          style={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 4,
          }}
        >
          {posts.map((post, i) => (
            <div key={post.slug} className="blog-card" style={{ flexShrink: 0, scrollSnapAlign: "start" }}>
              <BlogCard post={post} i={i} onOpen={() => onOpenPost(post.slug)} />
            </div>
          ))}
        </div>

        {/* Controls — only when there's more than one viewport of posts */}
        {overflowing && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 48 }}>
            <button onClick={prev} disabled={atStart} style={arrowStyle(atStart)} aria-label="Previous articles">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke={L.charcoal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {posts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToCard(i)}
                  aria-label={`Go to article ${i + 1}`}
                  style={{
                    width: activeIdx === i ? 24 : 6,
                    height: 6,
                    background: activeIdx === i ? L.gold : L.border,
                    border: "none", padding: 0, cursor: "pointer",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              ))}
            </div>

            <button onClick={next} disabled={atEnd} style={arrowStyle(atEnd)} aria-label="Next articles">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke={L.charcoal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post, i, onOpen }) {
  const ref = useFadeIn(i * 0.08);
  const [hovered, setHovered] = useState(false);
  return (
    <article
      ref={ref}
      className="lux-fade"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen?.(); } }}
      role="link"
      tabIndex={0}
      aria-label={`Read article: ${post.title}`}
      style={{
        background: L.white,
        padding: 0,
        cursor: "pointer",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        boxShadow: hovered ? "0 18px 40px -24px rgba(0,0,0,0.22)" : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        outline: "none",
      }}
    >
      {post.heroImage && (
        <div style={{
          width: "100%",
          aspectRatio: "16 / 10",
          backgroundImage: `url(${post.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: hovered ? "scale(1.02)" : "scale(1)",
          transition: "transform 0.5s ease",
        }} />
      )}
      <div style={{ padding: "40px 40px 44px" }}>
        <p style={{
          fontFamily: L.sans,
          fontSize: 10,
          color: L.slateLight,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          margin: "0 0 20px",
        }}>
          {post.date}{post.readMinutes ? `  ·  ${post.readMinutes} min read` : ""}
        </p>
        <h3 style={{
          fontFamily: L.serif,
          fontSize: 22,
          color: L.charcoal,
          margin: "0 0 16px",
          fontWeight: 400,
          lineHeight: 1.38,
          letterSpacing: "0.01em",
        }}>{post.title}</h3>
        <div style={{ width: 32, height: 1, background: L.border, margin: "0 0 20px" }} />
        <p style={{
          fontFamily: L.sans,
          fontSize: 14,
          color: L.slate,
          lineHeight: 1.9,
          margin: "0 0 32px",
          fontWeight: 300,
        }}>{post.excerpt}</p>
        <span style={{
          fontFamily: L.sans,
          fontSize: 10,
          color: hovered ? L.gold : L.slateLight,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          transition: "color 0.22s ease",
          borderBottom: `1px solid ${hovered ? L.gold : "transparent"}`,
          paddingBottom: 2,
        }}>Read Article →</span>
      </div>
    </article>
  );
}

// ─── MARKDOWN RENDERING ──────────────────────────────────────────────────────
// Maps the Markdown a post produces onto the site's existing article styles, so
// posts written in the CMS look identical to the old hand-built block layout.
// A context flag lets paragraphs inside a blockquote pick up the pull-quote
// styling instead of the default body-paragraph styling.
const InQuote = createContext(false);

// Paragraphs render as body text by default, or as the pull-quote style when
// nested inside a blockquote. Declared as a named component so it's a valid
// place to call the useContext hook.
function MarkdownParagraph({ children }) {
  const inQuote = useContext(InQuote);
  if (inQuote) {
    return (
      <p style={{
        fontFamily: L.serif, fontSize: 22, fontStyle: "italic", color: L.charcoal,
        lineHeight: 1.5, fontWeight: 400, margin: 0,
      }}>{children}</p>
    );
  }
  return (
    <p style={{
      fontFamily: L.sans, fontSize: 17, color: L.charcoal, lineHeight: 1.78,
      fontWeight: 300, margin: "0 0 22px",
    }}>{children}</p>
  );
}

const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: L.serif, fontSize: 28, color: L.charcoal, fontWeight: 400,
      lineHeight: 1.25, letterSpacing: "-0.005em", margin: "48px 0 20px",
    }}>{children}</h2>
  ),
  p: MarkdownParagraph,
  ul: ({ children }) => (
    <ul style={{ margin: "0 0 28px", padding: "0 0 0 22px", listStyle: "none" }}>{children}</ul>
  ),
  li: ({ children }) => (
    <li style={{
      position: "relative", fontFamily: L.sans, fontSize: 16, color: L.charcoal,
      lineHeight: 1.78, fontWeight: 300, margin: "0 0 12px", paddingLeft: 18,
      listStyle: "none",
    }}>
      <span style={{ position: "absolute", left: 0, top: "0.7em", width: 8, height: 1, background: L.gold }} />
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <InQuote.Provider value={true}>
      <blockquote style={{
        margin: "40px 0", padding: "8px 0 8px 28px", borderLeft: `2px solid ${L.gold}`,
      }}>{children}</blockquote>
    </InQuote.Provider>
  ),
  a: ({ children, href }) => (
    <a href={href} style={{ color: L.gold, textDecoration: "none", borderBottom: `1px solid ${L.gold}` }}>{children}</a>
  ),
};

// ─── BLOG POST (full article view) ──────────────────────────────────────────
function BlogPost({ post, activeTheme, onBack, onOpenPost }) {
  const headRef = useFadeIn(0);
  const bodyRef = useFadeIn(0.08);

  // Two most-recent posts in the market being browsed, excluding the current
  // one. Falls back to the post's own market for "both" posts opened cold.
  const related = (POSTS_BY_MARKET[activeTheme] || POSTS_BY_MARKET[marketToTheme(post.market)] || [])
    .filter(p => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <article style={{ background: L.white }}>
      {/* Hero */}
      <header style={{
        position: "relative",
        height: "62vh",
        minHeight: 460,
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        background: L.charcoal,
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${post.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(18,18,18,0.32) 0%, rgba(18,18,18,0.78) 100%)",
        }} />
        <div ref={headRef} className="lux-fade lux-hero-content" style={{
          position: "relative",
          maxWidth: 880,
          width: "100%",
          margin: "0 auto",
          padding: "0 80px 88px",
          color: "#fff",
        }}>
          <Eyebrow light>
            {(activeTheme || post.market) === "florida" ? "Gulf Coast Intelligence" : "Chicago Intelligence"}
          </Eyebrow>
          <h1 style={{
            fontFamily: L.serif,
            fontSize: "clamp(34px, 4.4vw, 60px)",
            margin: 0,
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: "#fff",
            maxWidth: 820,
          }}>{post.title}</h1>
          <p style={{
            marginTop: 24,
            fontFamily: L.sans,
            fontSize: 11,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            {post.date}{post.readMinutes ? `  ·  ${post.readMinutes} min read` : ""}{"  ·  By Craig Tinder"}
          </p>
        </div>
      </header>

      {/* Body */}
      <div ref={bodyRef} className="lux-fade" style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "88px 32px 32px",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            margin: "0 0 48px",
            fontFamily: L.sans,
            fontSize: 10,
            color: L.slate,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.color = L.gold}
          onMouseLeave={e => e.currentTarget.style.color = L.slate}
        >
          ← All Articles
        </button>

        <ReactMarkdown components={mdComponents}>{post.body}</ReactMarkdown>

        {/* Author footer */}
        <div style={{
          marginTop: 72,
          padding: "40px 0 0",
          borderTop: `1px solid ${L.border}`,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <img
            src={craigPhoto}
            alt="Craig Tinder"
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ flex: "1 1 240px" }}>
            <p style={{ fontFamily: L.serif, fontSize: 18, color: L.charcoal, margin: "0 0 4px", fontWeight: 500 }}>Craig Tinder</p>
            <p style={{ fontFamily: L.sans, fontSize: 13, color: L.slate, margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
              Twenty-five years guiding clients across the greater Chicago area and Florida's Gulf Coast. Former therapist and college lecturer — now a Park Ridge–based broker with $245M+ in career sales.
            </p>
          </div>
          <a href="#contact" onClick={onBack} style={{
            fontFamily: L.sans,
            fontSize: 10,
            color: L.charcoal,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            textDecoration: "none",
            border: `1px solid ${L.charcoal}`,
            padding: "13px 28px",
            transition: "all 0.25s ease",
          }}
          className="lux-btn-dark"
          >Work With Craig</a>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ background: L.cream, padding: "88px 32px 120px", marginTop: 96 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Eyebrow>Keep Reading</Eyebrow>
              <SectionHeading center>More Articles</SectionHeading>
              <GoldRule center />
            </div>
            <div className="lux-card-grid" style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
              gap: 3,
            }}>
              {related.map((p, i) => (
                <BlogCard key={p.slug} post={p} i={i} onOpen={() => onOpenPost(p.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

// ─── NEIGHBORHOOD GUIDE (full page view) ─────────────────────────────────────
// The full-page view for a neighborhood guide. Mirrors BlogPost: a hero image,
// the Markdown body rendered with the shared mdComponents, an author footer, and
// a "More Neighborhoods" grid of other guides in the same market.
function NeighborhoodGuide({ guide, activeTheme, onBack, onOpenGuide }) {
  const headRef = useFadeIn(0);
  const bodyRef = useFadeIn(0.08);

  // Up to three other guides in the market being browsed, excluding this one.
  const related = (GUIDES_BY_MARKET[activeTheme] || GUIDES_BY_MARKET[marketToTheme(guide.market)] || [])
    .filter(g => g.slug !== guide.slug)
    .slice(0, 3);

  return (
    <article style={{ background: L.white }}>
      {/* Hero */}
      <header style={{
        position: "relative",
        height: "62vh",
        minHeight: 460,
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        background: L.charcoal,
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${guide.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(18,18,18,0.32) 0%, rgba(18,18,18,0.78) 100%)",
        }} />
        <div ref={headRef} className="lux-fade lux-hero-content" style={{
          position: "relative",
          maxWidth: 880,
          width: "100%",
          margin: "0 auto",
          padding: "0 80px 88px",
          color: "#fff",
        }}>
          <Eyebrow light>Neighborhood Guide</Eyebrow>
          <h1 style={{
            fontFamily: L.serif,
            fontSize: "clamp(34px, 4.4vw, 60px)",
            margin: 0,
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: "#fff",
            maxWidth: 820,
          }}>{guide.name}</h1>
        </div>
      </header>

      {/* Body */}
      <div ref={bodyRef} className="lux-fade" style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "88px 32px 32px",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            margin: "0 0 48px",
            fontFamily: L.sans,
            fontSize: 10,
            color: L.slate,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.color = L.gold}
          onMouseLeave={e => e.currentTarget.style.color = L.slate}
        >
          ← All Neighborhoods
        </button>

        <ReactMarkdown components={mdComponents}>{guide.body}</ReactMarkdown>

        {/* Author footer */}
        <div style={{
          marginTop: 72,
          padding: "40px 0 0",
          borderTop: `1px solid ${L.border}`,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <img
            src={craigPhoto}
            alt="Craig Tinder"
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ flex: "1 1 240px" }}>
            <p style={{ fontFamily: L.serif, fontSize: 18, color: L.charcoal, margin: "0 0 4px", fontWeight: 500 }}>Craig Tinder</p>
            <p style={{ fontFamily: L.sans, fontSize: 13, color: L.slate, margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
              Twenty-five years guiding clients across the greater Chicago area and Florida's Gulf Coast. Former therapist and college lecturer — now a Park Ridge–based broker with $245M+ in career sales.
            </p>
          </div>
          <a href="#contact" onClick={onBack} style={{
            fontFamily: L.sans,
            fontSize: 10,
            color: L.charcoal,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            textDecoration: "none",
            border: `1px solid ${L.charcoal}`,
            padding: "13px 28px",
            transition: "all 0.25s ease",
          }}
          className="lux-btn-dark"
          >Work With Craig</a>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ background: L.cream, padding: "88px 32px 120px", marginTop: 96 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Eyebrow>Keep Exploring</Eyebrow>
              <SectionHeading center>More Neighborhoods</SectionHeading>
              <GoldRule center />
            </div>
            <div className="lux-card-grid" style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
              gap: 3,
            }}>
              {related.map((g, i) => (
                <NeighborhoodCard key={g.slug} n={g} i={i} onOpen={() => onOpenGuide(g.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

// ─── VALUATION ───────────────────────────────────────────────────────────────
function Valuation({ theme, activeTheme }) {
  const [fields, setFields] = useState({ address: "", name: "", email: "", phone: "" });
  const [status, setStatus] = useState("idle");
  const ref = useFadeIn(0);

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    border: `1px solid rgba(255,255,255,0.18)`,
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
    fontFamily: L.sans,
    fontSize: 14,
    fontWeight: 300,
    letterSpacing: "0.02em",
    outline: "none",
    transition: "border-color 0.2s",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch(FORMSPREE.valuation[activeTheme], {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ subject: `Home Valuation Request — ${fields.address}`, ...fields }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setFields({ address: "", name: "", email: "", phone: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="valuation" className="lux-section" style={{ padding: "120px 80px", background: L.charcoal }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div ref={ref} className="lux-fade lux-val-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          {/* Copy */}
          <div>
            <Eyebrow light></Eyebrow>
            <h2 style={{
              fontFamily: L.serif,
              fontSize: "clamp(32px, 3.2vw, 50px)",
              color: "#fff",
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}>What Is Your Home Worth?</h2>
            <div style={{ width: 48, height: 1, background: L.gold, margin: "28px 0" }} />
            <p style={{
              fontFamily: L.sans,
              fontSize: 16,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.9,
              margin: 0,
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}>
              Receive a complimentary, no-obligation market analysis of your property. Craig reviews every request personally and responds within 24 hours.
            </p>
          </div>

          {/* Form */}
          <div>
            {status === "success" ? (
              <div style={{ padding: "52px 44px", border: "1px solid rgba(212,175,55,0.3)", textAlign: "center" }}>
                <p style={{ fontFamily: L.serif, fontSize: 28, color: "#fff", margin: "0 0 12px", fontWeight: 400 }}>Request Received</p>
                <div style={{ width: 32, height: 1, background: L.gold, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: L.sans, fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 300, lineHeight: 1.85 }}>
                  Craig will reach out within 24 hours with your personalized market analysis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <input
                  type="text"
                  placeholder="Property Address *"
                  required
                  value={fields.address}
                  onChange={e => setFields(f => ({ ...f, address: e.target.value }))}
                  style={inputStyle}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                  <input type="text" placeholder="Your Name *" required value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  <input type="tel" placeholder="Phone Number" value={fields.phone} onChange={e => setFields(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={fields.email}
                  onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                />
                {status === "error" && (
                  <p style={{ fontFamily: L.sans, color: "#FFB3B3", fontSize: 13, margin: "4px 0 0", fontWeight: 300 }}>
                    Something went wrong. Please try again or email Craig directly.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="lux-btn-gold"
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "15px 44px",
                    border: `1px solid ${L.gold}`,
                    background: "transparent",
                    color: L.gold,
                    fontFamily: L.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: status === "submitting" ? "not-allowed" : "pointer",
                    opacity: status === "submitting" ? 0.5 : 1,
                    transition: "all 0.28s ease",
                  }}
                >
                  {status === "submitting" ? "Sending..." : "Request My Free Valuation"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
function Contact({ theme, activeTheme }) {
  const ref = useFadeIn(0);
  const [fields, setFields] = useState({ name: "", email: "", phone: "", intent: "How can Craig help?", message: "" });
  const [status, setStatus] = useState("idle");

  const inputStyle = {
    padding: "16px 20px",
    border: `1px solid ${L.border}`,
    fontFamily: L.sans,
    fontSize: 14,
    outline: "none",
    background: L.cream,
    color: L.charcoal,
    fontWeight: 300,
    letterSpacing: "0.02em",
    transition: "border-color 0.2s",
    width: "100%",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch(FORMSPREE.contact[activeTheme], {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          subject: `Contact Form — ${fields.intent} (${theme.location})`,
          ...fields,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", phone: "", intent: "How can Craig help?", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="lux-section" style={{ padding: "120px 80px", background: L.white }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div ref={ref} className="lux-fade lux-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 88, alignItems: "start" }}>
          {/* Contact info */}
          <div>
            <Eyebrow>Get in Touch</Eyebrow>
            <SectionHeading>Start the Conversation</SectionHeading>
            <GoldRule />
            <p style={{ fontFamily: L.sans, fontSize: 16, color: L.slate, lineHeight: 1.9, margin: "0 0 52px", fontWeight: 300, letterSpacing: "0.02em" }}>
              Craig responds personally to every inquiry. Whether you're buying, selling, or simply exploring — no pressure, just guidance.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                { label: "Phone",  value: "(847) 638-5522" },
                { label: "Email",  value: theme.email },
                { label: "Office", value: theme.location },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontFamily: L.sans, fontSize: 10, color: L.slateLight, margin: "0 0 5px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>{item.label}</p>
                  <p style={{ fontFamily: L.sans, fontSize: 16, color: L.charcoal, margin: 0, fontWeight: 400 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
              {SOCIALS.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 42, height: 42,
                    border: `1px solid ${L.border}`,
                    color: L.slateLight,
                    textDecoration: "none",
                    transition: "border-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = L.gold; e.currentTarget.style.color = L.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.color = L.slateLight; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            {status === "success" ? (
              <div style={{ padding: "52px 44px", border: `1px solid ${L.border}`, textAlign: "center", background: L.cream }}>
                <p style={{ fontFamily: L.serif, fontSize: 28, color: L.charcoal, margin: "0 0 12px", fontWeight: 400 }}>Message Sent</p>
                <div style={{ width: 32, height: 1, background: L.gold, margin: "0 auto 20px" }} />
                <p style={{ fontFamily: L.sans, fontSize: 14, color: L.slate, margin: 0, fontWeight: 300, lineHeight: 1.85 }}>
                  Craig will be in touch shortly. You can also reach him directly at {theme.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <input
                  type="text" placeholder="Your Name *" required
                  value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="email" placeholder="Email Address *" required
                  value={fields.email} onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="tel" placeholder="Phone (optional)"
                  value={fields.phone} onChange={e => setFields(f => ({ ...f, phone: e.target.value }))}
                  style={inputStyle}
                />
                <select
                  value={fields.intent}
                  onChange={e => setFields(f => ({ ...f, intent: e.target.value }))}
                  style={{ ...inputStyle, color: fields.intent === "How can Craig help?" ? L.slate : L.charcoal, appearance: "none", cursor: "pointer" }}
                >
                  <option>How can Craig help?</option>
                  <option>Buy a home</option>
                  <option>Sell my home</option>
                  <option>Get a home valuation</option>
                  <option>Just exploring</option>
                </select>
                <textarea
                  placeholder="Tell me about your real estate goals..."
                  rows={5}
                  value={fields.message}
                  onChange={e => setFields(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                {status === "error" && (
                  <p style={{ fontFamily: L.sans, color: "#c0392b", fontSize: 13, margin: "4px 0 0", fontWeight: 300 }}>
                    Something went wrong. Please try again or email Craig at {theme.email}.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="lux-btn-dark"
                  style={{
                    marginTop: 8,
                    padding: "15px 44px",
                    border: `1px solid ${L.charcoal}`,
                    background: "transparent",
                    color: L.charcoal,
                    fontFamily: L.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: status === "submitting" ? "not-allowed" : "pointer",
                    opacity: status === "submitting" ? 0.5 : 1,
                    transition: "all 0.28s ease",
                  }}
                >
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ theme }) {
  return (
    <footer style={{ padding: "72px 80px 52px", background: L.charcoal, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="lux-footer-grid" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48 }}>
        {/* Brand */}
        <div>
          <p style={{ fontFamily: L.serif, fontSize: 22, color: "#fff", margin: "0 0 6px", fontWeight: 400, letterSpacing: "0.03em" }}>Craig Tinder</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <BrokerageLogo theme={theme} width={theme.logoAspect === "wide" ? 108 : 100} onDark />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <span style={{ fontFamily: L.sans, fontSize: 12, color: "rgba(255,255,255,0.38)", letterSpacing: "0.06em" }}>{theme.location}</span>
          </div>
          <div style={{ width: 32, height: 1, background: "rgba(212,175,55,0.4)", margin: "0 0 20px" }} />
          <p style={{ fontFamily: L.sans, fontSize: 12, color: "rgba(255,255,255,0.28)", margin: 0, fontWeight: 300, letterSpacing: "0.04em" }}>
            © 2026 Craig Tinder Real Estate. All rights reserved.
          </p>
        </div>

        {/* Navigate */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontFamily: L.sans, fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>Navigate</p>
          {["About", "Neighborhoods", "Testimonials", "Blog", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              fontFamily: L.sans,
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              fontWeight: 300,
              letterSpacing: "0.04em",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            >{item}</a>
          ))}
        </div>

        {/* Connect */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontFamily: L.sans, fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 4px", fontWeight: 600 }}>Connect</p>
          {SOCIALS.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                fontFamily: L.sans, fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none", fontWeight: 300,
                letterSpacing: "0.04em", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            >
              {s.icon}{s.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── LANDING (split-screen market selector) ───────────────────────────────────
function Landing({ onSelect }) {
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);

  function handleClick(key) {
    if (selected) return;
    setSelected(key);
    setTimeout(() => onSelect(key), 1150);
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@300;400;600;700&family=Source+Sans+3:wght@300;400&display=swap" rel="stylesheet" />

      <div style={{ height: "100vh", position: "relative", overflow: "hidden", background: L.charcoal }}>

        {/* Top brand bar — fades out on selection */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          textAlign: "center",
          padding: "16px 24px",
          zIndex: 10,
          pointerEvents: "none",
          opacity: selected ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}>
          <img src={craigLogo} alt="Craig Tinder" style={{ height: "clamp(75px, 10vw, 125px)", width: "auto", display: "block", margin: "0 auto", filter: "brightness(0) invert(1)" }} />
        </div>

        {/* Split panels — fill full viewport height */}
        <div style={{ display: "flex", height: "100%" }}>
          {[
            { key: "chicago", label: "Chicago Suburbs",  sub: "Greater Chicago Area", image: THEMES.chicago.heroImage },
            { key: "florida", label: "Gulf Coast Florida", sub: "Clearwater Area, FL",  image: THEMES.florida.heroImage },
          ].map(({ key, label, sub, image }, idx) => {
            const isSelected    = selected === key;
            const otherSelected = selected !== null && !isSelected;
            const isHovered     = !selected && hovered === key;
            const otherHovered  = !selected && hovered !== null && !isHovered;

            let flexVal = 1;
            if (isSelected)    flexVal = 1;
            if (otherSelected) flexVal = 0;
            if (!selected && isHovered)    flexVal = 1.14;
            if (!selected && otherHovered) flexVal = 0.86;

            return (
              <div
                key={key}
                onClick={() => handleClick(key)}
                onMouseEnter={() => !selected && setHovered(key)}
                onMouseLeave={() => !selected && setHovered(null)}
                style={{
                  flex: flexVal,
                  position: "relative",
                  cursor: selected ? "default" : "pointer",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: selected
                    ? "flex 1.1s cubic-bezier(0.76,0,0.24,1)"
                    : "flex 0.55s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {/* Background image */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: isHovered || isSelected ? "scale(1.06)" : "scale(1)",
                  transition: isSelected ? "transform 1.2s ease" : "transform 0.65s ease",
                }} />
                {/* Dark overlay — lifts on selection */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: isSelected
                    ? "rgba(15,15,15,0.25)"
                    : isHovered
                      ? "rgba(15,15,15,0.38)"
                      : "rgba(15,15,15,0.60)",
                  transition: isSelected ? "background 1.1s ease" : "background 0.4s ease",
                }} />
                {/* Vertical rule between panels */}
                {idx === 0 && (
                  <div style={{
                    position: "absolute", right: 0, top: "12%", bottom: "12%",
                    width: 1,
                    background: selected ? "transparent" : "rgba(255,255,255,0.1)",
                    zIndex: 3,
                    transition: "background 0.4s ease",
                  }} />
                )}
                {/* Panel content — all text fades out on any selection */}
                <div style={{
                  position: "relative", zIndex: 2, textAlign: "center", padding: "0 48px",
                  opacity: selected ? 0 : 1,
                  transition: "opacity 0.28s ease",
                }}>
                  <p style={{
                    fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.28em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600,
                  }}>{sub}</p>
                  <h2 style={{
                    fontFamily: L.serif,
                    fontSize: "clamp(20px, 3vw, 38px)",
                    color: "#fff",
                    margin: "0 0 18px",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                  }}>{label}</h2>
                  <div style={{ width: 28, height: 1, background: L.gold, margin: "0 auto 24px" }} />
                  <div style={{
                    display: "inline-block",
                    padding: "12px 36px",
                    border: isHovered ? `1px solid ${L.gold}` : "1px solid rgba(255,255,255,0.3)",
                    color: isHovered ? L.gold : "rgba(255,255,255,0.9)",
                    fontFamily: L.sans,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    background: isHovered ? L.goldMuted : "transparent",
                    transition: "all 0.3s ease",
                  }}>Explore →</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom hint — fades out on selection */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          textAlign: "center",
          padding: "18px",
          zIndex: 10,
          pointerEvents: "none",
          opacity: selected ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}>
          <p style={{
            fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, fontWeight: 600,
          }}>Select a Market</p>
        </div>

      </div>
    </>
  );
}

// ─── ROUTING HELPERS ────────────────────────────────────────────────────────
// Hash format: "#post/<slug>" routes to a full blog post.
// Anything else (including "#blog", "#about", etc.) keeps the homepage rendered
// so existing in-page anchor links still work.
function readPostSlugFromHash() {
  const h = (typeof window !== "undefined" ? window.location.hash : "").replace(/^#/, "");
  if (h.startsWith("post/")) return h.slice(5);
  return null;
}

// Hash format: "#guide/<slug>" routes to a full neighborhood guide.
function readGuideSlugFromHash() {
  const h = (typeof window !== "undefined" ? window.location.hash : "").replace(/^#/, "");
  if (h.startsWith("guide/")) return h.slice(6);
  return null;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function CraigTinderRealEstate() {
  const [activeSlug, setActiveSlug] = useState(() => readPostSlugFromHash());
  const [activeGuideSlug, setActiveGuideSlug] = useState(() => readGuideSlugFromHash());
  // Deep links to /#post/<slug> or /#guide/<slug> auto-pick the content's market
  // so the page can render cold.
  const [activeTheme, setActiveTheme] = useState(() => {
    const postSlug = readPostSlugFromHash();
    if (postSlug) return marketToTheme(getPostBySlug(postSlug)?.market);
    const guideSlug = readGuideSlugFromHash();
    if (guideSlug) return marketToTheme(getGuideBySlug(guideSlug)?.market);
    return null;
  });
  const [scrolled, setScrolled] = useState(false);
  const [fading,   setFading]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync the active post/guide with the URL hash so deep links + back/forward work.
  useEffect(() => {
    const sync = () => {
      setActiveSlug(readPostSlugFromHash());
      setActiveGuideSlug(readGuideSlugFromHash());
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const openPost = (slug) => {
    const p = getPostBySlug(slug);
    if (!p) return;
    // Only switch markets if the post isn't available in the current one.
    // "both" posts are available everywhere, so they never force a switch.
    if (!activeTheme || !postInMarket(p, activeTheme)) setActiveTheme(marketToTheme(p.market));
    setActiveGuideSlug(null);
    setActiveSlug(slug);
    if (window.location.hash !== `#post/${slug}`) {
      window.history.pushState(null, "", `#post/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const closePost = () => {
    setActiveSlug(null);
    window.history.pushState(null, "", "#blog");
    // Scroll to the Blog section once it's mounted again
    setTimeout(() => {
      document.getElementById("blog")?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 0);
  };

  const openGuide = (slug) => {
    const g = getGuideBySlug(slug);
    if (!g) return;
    // Switch markets only if the guide isn't available in the current one.
    if (!activeTheme || !guideInMarket(g, activeTheme)) setActiveTheme(marketToTheme(g.market));
    setActiveSlug(null);
    setActiveGuideSlug(slug);
    if (window.location.hash !== `#guide/${slug}`) {
      window.history.pushState(null, "", `#guide/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const closeGuide = () => {
    setActiveGuideSlug(null);
    window.history.pushState(null, "", "#neighborhoods");
    // Scroll back to the Neighborhoods section once it's mounted again.
    setTimeout(() => {
      document.getElementById("neighborhoods")?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 0);
  };

  // Called from Landing — no fade-out needed, site fades in over the expanding panel
  const selectFromLanding = (key) => {
    setActiveTheme(key);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Called from nav toggle — fade out current content, swap, fade in
  const switchTheme = (key) => {
    if (key === activeTheme) return;
    setFading(true);
    setTimeout(() => {
      setActiveTheme(key);
      // Switching markets returns to the homepage of the new market
      setActiveSlug(null);
      setActiveGuideSlug(null);
      if (window.location.hash.startsWith("#post/") || window.location.hash.startsWith("#guide/")) {
        window.history.pushState(null, "", "#");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => setFading(false), 50);
    }, 320);
  };

  if (!activeTheme) return <Landing onSelect={selectFromLanding} />;

  const theme = THEMES[activeTheme];
  const activePost = activeSlug ? getPostBySlug(activeSlug) : null;
  const activeGuide = activeGuideSlug ? getGuideBySlug(activeGuideSlug) : null;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@300;400;600;700&family=Source+Sans+3:wght@300;400&display=swap" rel="stylesheet" />
      <div style={{
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 0.32s ease" : "none",
        animation: "pageFadeIn 1s ease both",
        background: L.white,
        minHeight: "100vh",
      }}>
        <Nav activeTheme={activeTheme} onSwitch={switchTheme} onHome={() => { setActiveSlug(null); setActiveGuideSlug(null); setActiveTheme(null); }} scrolled={scrolled} />
        {activePost ? (
          <BlogPost post={activePost} activeTheme={activeTheme} onBack={closePost} onOpenPost={openPost} />
        ) : activeGuide ? (
          <NeighborhoodGuide guide={activeGuide} activeTheme={activeTheme} onBack={closeGuide} onOpenGuide={openGuide} />
        ) : (
          <>
            <Hero theme={theme} />
            <MarketPulse />
            <About />
            <Neighborhoods theme={theme} activeTheme={activeTheme} onOpenGuide={openGuide} />
            <Testimonials />
            <Blog activeTheme={activeTheme} onOpenPost={openPost} />
            <Valuation theme={theme} activeTheme={activeTheme} />
            <Contact theme={theme} activeTheme={activeTheme} />
          </>
        )}
        <Footer theme={theme} />
      </div>
    </>
  );
}
