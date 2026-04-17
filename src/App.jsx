import { useState, useEffect, useRef } from "react";
import blakeLogo from "./blake-logo.png";
import tinderHomeLogo from "./Tinder Home.png";
import craigPhoto from "./craig-tinder-photo.jpg";

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
    neighborhoods: [
      { name: "North Shore", desc: "Evanston, Wilmette, Winnetka, and Highland Park — prestigious lakefront communities with exceptional schools and charm." },
      { name: "Northwest Suburbs", desc: "Arlington Heights, Palatine, and Schaumburg offer family-friendly living, top park districts, and easy expressway access." },
      { name: "NW Chicago Neighborhoods", desc: "Edison Park, Norwood Park, and Jefferson Park blend city energy with a tight-knit, small-town feel." },
      { name: "North Suburbs", desc: "Glenview, Northbrook, and Deerfield — consistently ranked among Illinois' best places to live and raise a family." },
    ],
    blogPosts: [
      { title: "2026 Chicago Metro Market Outlook", excerpt: "What rising inventory and shifting rates mean for buyers and sellers across the greater Chicago area this spring.", date: "April 2026" },
      { title: "City vs. Suburbs: A Greater Chicago Buyer's Guide", excerpt: "Weighing walkability, school districts, and commute times? Here's how to choose the right community for your lifestyle.", date: "March 2026" },
      { title: "Preparing Your Home for a Chicago Winter Sale", excerpt: "Curb appeal doesn't stop when the snow falls. Here's how to make your listing shine in the cold months.", date: "February 2026" },
    ],
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
    neighborhoods: [
      { name: "Clearwater Beach", desc: "World-famous white sand and turquoise water — consistently ranked among America's best beaches and ideal for full-time or vacation living." },
      { name: "Dunedin & Safety Harbor", desc: "Charming downtowns, waterfront parks, and a relaxed coastal lifestyle just minutes from the beach." },
      { name: "St. Petersburg", desc: "A thriving arts scene, waterfront dining, and one of Florida's fastest-growing real estate markets." },
      { name: "Palm Harbor & Tarpon Springs", desc: "Top-rated schools, lush neighborhoods, and a welcoming community — a favorite for families relocating from the Midwest." },
    ],
    blogPosts: [
      { title: "Clearwater Area: The Market to Watch in 2026", excerpt: "From Clearwater Beach to Dunedin, discover why Pinellas County continues to attract buyers from across the country.", date: "April 2026" },
      { title: "Relocating from Chicago to Clearwater", excerpt: "A practical guide for Chicago-area families making the move — taxes, schools, and Gulf Coast lifestyle.", date: "March 2026" },
      { title: "Clearwater Market Update: Spring 2026", excerpt: "Inventory is tight and demand is surging. Here's what buyers and sellers need to know right now.", date: "February 2026" },
    ],
  },
};

const TESTIMONIALS = [
  { text: "It truly makes a big difference who you work with on the other side of a real estate transaction. Craig has been in the real estate business for over 20 years and it shows—his experience, strong local knowledge, and connections in the Park Ridge and surrounding areas help him bring transactions smoothly to the closing table.", rating: 5 },
  { text: "Craig is an exceptional realtor. His deep expertise in the Chicagoland market and his commitment to forming a trusting relationship with his clients ensure that they will find the perfect place to call home. His attention to detail and responsiveness make purchasing a new home a truly positive experience.", rating: 5 },
  { text: "Craig and the Tinder Team have been wonderful to work with. He has the experience and professionalism to close your deal with complete satisfaction. Don't forget to use Craig and his vast network of referrals for your out of state property needs!", rating: 5 },
  { text: "Craig's knowledge of the Park Ridge area is second to none. He guided us through every step of the selling process with professionalism and ease. We couldn't have asked for a better partner in this transition.", rating: 5 },
  { text: "Highly recommend Craig for anyone looking in the Chicago suburbs. He is incredibly patient, never pushy, and truly wants what is best for his clients. A true professional in every sense of the word.", rating: 5 },
  { text: "We used Craig for both a purchase and a sale. His negotiation skills are top-tier and he managed to get us a price we were very happy with. His communication throughout the entire process was flawless.", rating: 5 },
  { text: "Expert service from start to finish. Craig's 20+ years of experience really shine when things get complicated—he knows exactly how to handle every situation that arises during a closing.", rating: 5 },
  { text: "If you are looking for an agent who actually listens and delivers, Craig is your guy. He made the stressful process of finding a home in a competitive market feel manageable and even enjoyable.", rating: 5 },
  { text: "Professional, knowledgeable, and reliable. Craig Tinder is a staple of the Park Ridge real estate community for a reason. He treats every client like they are his only client.", rating: 5 },
  { text: "Fantastic experience working with the Tinder Team. They are responsive, organized, and deeply connected in both the local Illinois market and Florida. Seamless service across the board.", rating: 5 },
];

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
function Nav({ activeTheme, onSwitch, onHome, scrolled }) {
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
        <img src={tinderHomeLogo} alt="Tinder Home" style={{ height: 116, width: "auto", display: "block" }} />
      </button>
      {/* Links */}
      <div className="lux-nav-links" style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {["About", "Neighborhoods", "Testimonials", "Blog", "Contact"].map(item => (
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
          Over two decades helping families buy, sell, and invest — with the personal touch that makes all the difference.
        </p>
        <GhostButton href="#contact" variant="light" className="lux-btn-light">
          Begin the Conversation
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
        {[
          { value: "$245M+", label: "In Real Estate Sales" },
          { value: "25 Years", label: "Serving Clients" },
          { value: "Two Markets", label: "Chicago & Clearwater" },
        ].map((stat, i) => (
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
              Craig Tinder has spent over two decades navigating two of America's most distinct real estate markets — the greater Chicago area and Florida's Clearwater coast. That dual-market expertise gives clients a rare advantage: an agent who understands both where you're coming from and where you're going.
            </p>
            <p style={{ fontFamily: L.sans, fontSize: 17, color: L.slate, lineHeight: 1.95, margin: "0 0 52px", fontWeight: 300, letterSpacing: "0.02em" }}>
              Every client gets Craig's direct line. No hand-offs, no assistants — just honest, expert guidance from first conversation to final closing.
            </p>

            {/* Clean stats row */}
            <div style={{ display: "flex", gap: 52, flexWrap: "wrap", marginBottom: 52 }}>
              {[
                { value: "$245M+",    label: "In Real Estate Sales" },
                { value: "25 Years",  label: "Market Experience" },
                { value: "2 Markets", label: "Chicago & Gulf Coast" },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontFamily: L.serif, fontSize: "clamp(22px, 2vw, 30px)", color: L.charcoal, margin: "0 0 5px", fontWeight: 400 }}>{item.value}</p>
                  <p style={{ fontFamily: L.sans, fontSize: 10, color: L.slateLight, margin: 0, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>{item.label}</p>
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
function Neighborhoods({ theme }) {
  const headRef = useFadeIn(0);

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
          {theme.neighborhoods.map((n, i) => (
            <NeighborhoodCard key={n.name} n={n} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NeighborhoodCard({ n, i }) {
  const outerRef = useFadeIn(i * 0.07);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={outerRef} className="lux-fade">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: L.white,
          padding: "48px 40px",
          cursor: "default",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.07)" : "none",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          height: "100%",
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
          margin: 0,
          fontWeight: 300,
        }}>{n.desc}</p>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function Testimonials() {
  const headRef   = useFadeIn(0);
  const trackRef  = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = TESTIMONIALS.length;

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
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
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
          {TESTIMONIALS.map((_, i) => (
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
function Blog({ theme }) {
  const headRef = useFadeIn(0);

  return (
    <section id="blog" className="lux-section" style={{ padding: "120px 80px", background: L.cream }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div ref={headRef} className="lux-fade" style={{ textAlign: "center", marginBottom: 72 }}>
          <Eyebrow>Intelligence</Eyebrow>
          <SectionHeading center>Market Insights</SectionHeading>
          <GoldRule center />
          <p style={{ fontFamily: L.sans, fontSize: 16, color: L.slate, maxWidth: 460, margin: "0 auto", lineHeight: 1.85, fontWeight: 300 }}>
            Craig's latest market analysis and local intelligence.
          </p>
        </div>
        <div className="lux-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
          {theme.blogPosts.map((post, i) => (
            <BlogCard key={i} post={post} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogCard({ post, i }) {
  const ref = useFadeIn(i * 0.08);
  const [hovered, setHovered] = useState(false);
  return (
    <article
      ref={ref}
      className="lux-fade"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: L.white,
        padding: "48px 40px",
        cursor: "default",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "transform 0.22s ease",
      }}
    >
      <p style={{
        fontFamily: L.sans,
        fontSize: 10,
        color: L.slateLight,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 700,
        margin: "0 0 20px",
      }}>{post.date}</p>
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
            <Eyebrow light>Complimentary</Eyebrow>
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
          padding: "44px 24px 36px",
          zIndex: 10,
          pointerEvents: "none",
          opacity: selected ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}>
          <p style={{
            fontFamily: L.sans, fontSize: 9, color: "rgba(255,255,255,0.32)",
            letterSpacing: "0.32em", textTransform: "uppercase", margin: "0 0 12px", fontWeight: 600,
          }}>Real Estate · Two Markets · One Agent</p>
          <img src={tinderHomeLogo} alt="Tinder Home" style={{ height: "clamp(80px, 12vw, 160px)", width: "auto", display: "block", margin: "0 auto" }} />
          <div style={{ width: 28, height: 1, background: L.gold, margin: "16px auto 0" }} />
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

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function CraigTinderRealEstate() {
  const [activeTheme, setActiveTheme] = useState(null);
  const [scrolled,    setScrolled]    = useState(false);
  const [fading,      setFading]      = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      window.scrollTo({ top: 0, behavior: "instant" });
      setTimeout(() => setFading(false), 50);
    }, 320);
  };

  if (!activeTheme) return <Landing onSelect={selectFromLanding} />;

  const theme = THEMES[activeTheme];

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
        <Nav activeTheme={activeTheme} onSwitch={switchTheme} onHome={() => setActiveTheme(null)} scrolled={scrolled} />
        <Hero theme={theme} />
        <MarketPulse />
        <About />
        <Neighborhoods theme={theme} />
        <Testimonials />
        <Blog theme={theme} />
        <Valuation theme={theme} activeTheme={activeTheme} />
        <Contact theme={theme} activeTheme={activeTheme} />
        <Footer theme={theme} />
      </div>
    </>
  );
}
