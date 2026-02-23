import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES  (injected once into <head>)
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080d1a; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 3px; }
`;

function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────────────────────── */
function AnimatedCounter({ value, duration = 1.4 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setDisplay(0);
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SVG CIRCULAR GAUGE
───────────────────────────────────────────────────────────────────────────── */
function CircularGauge({ value, max = 100, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    setAnim(0);
    let f = 0;
    const timer = setInterval(() => {
      f += 0.018;
      if (f >= 1) { setAnim(1); clearInterval(timer); }
      else setAnim(f);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const offset = circ * (1 - (value / max) * anim);

  return (
    <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto" }}>
      <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle
          cx={64} cy={64} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>
          {Math.round(value * anim)}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>/ {max}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RISK BADGE
───────────────────────────────────────────────────────────────────────────── */
function RiskBadge({ label, level }) {
  const map = {
    Low:    { bg: "rgba(52,211,153,.12)",  border: "rgba(52,211,153,.3)",  text: "#34d399" },
    Medium: { bg: "rgba(251,191,36,.12)",  border: "rgba(251,191,36,.3)",  text: "#fbbf24" },
    High:   { bg: "rgba(239,68,68,.12)",   border: "rgba(239,68,68,.3)",   text: "#ef4444" },
    Growing:  { bg: "rgba(52,211,153,.12)", border: "rgba(52,211,153,.3)", text: "#34d399" },
    Emerging: { bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.3)", text: "#fbbf24" },
    Early:    { bg: "rgba(148,163,184,.1)", border: "rgba(148,163,184,.25)", text: "#94a3b8" },
  };
  const c = map[level] || map.Low;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20,
    }}>
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: c.text, boxShadow: `0 0 6px ${c.text}` }}
      />
      <span style={{ fontSize: 12, color: c.text, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS CARD
───────────────────────────────────────────────────────────────────────────── */
function Card({ children, style = {}, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 24,
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "rgba(148,163,184,0.55)",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 20, height: 1, background: "rgba(148,163,184,0.3)" }} />
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM DONUT TOOLTIP
───────────────────────────────────────────────────────────────────────────── */
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div style={{
      background: "rgba(10,15,30,0.97)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "8px 14px",
    }}>
      <p style={{ color, fontWeight: 700, fontSize: 13, margin: 0 }}>{name}</p>
      <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "2px 0 0" }}>{value}%</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   AI ACCORDION
───────────────────────────────────────────────────────────────────────────── */
function AIAccordion({ suggestions }) {
  const [open, setOpen] = useState(false);
  const icons = ["✦", "◈", "⬡"];
  return (
    <div>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: "#a5b4fc",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.03em" }}>
          Improvement Suggestions ({suggestions.length})
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
          style={{ fontSize: 16 }}>▾</motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestions.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px",
                  }}
                >
                  <span style={{ fontSize: 14, color: "#818cf8", marginTop: 1 }}>{icons[i % 3]}</span>
                  <span style={{ fontSize: 13, color: "rgba(203,213,225,0.85)", lineHeight: 1.5 }}>{s}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LANDING / INPUT SCREEN
───────────────────────────────────────────────────────────────────────────── */
function LandingScreen({ repoUrl, setRepoUrl, analyzeRepo, loading }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1230 50%, #0a0f1e 100%)",
      fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24, position: "relative",
    }}>
      {/* bg glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(99,102,241,0.1) 0%, transparent 70%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 500, width: "100%" }}
      >
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, boxShadow: "0 0 40px rgba(99,102,241,0.45)",
        }}>⬡</div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: "#f8fafc",
          letterSpacing: "-0.03em", marginBottom: 10,
        }}>
          Repo<span style={{ color: "#818cf8" }}>Scope</span>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(148,163,184,0.65)", marginBottom: 36, lineHeight: 1.6 }}>
          Hybrid repository intelligence — health, risk, and evolution signals in one view.
        </p>

        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: 24, backdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeRepo()}
            placeholder="https://github.com/owner/repo"
            style={{
              width: "100%", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
              padding: "12px 16px", color: "#f8fafc", fontSize: 14,
              fontFamily: "'DM Mono', monospace", outline: "none",
              marginBottom: 14,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
          />
          <motion.button
            onClick={analyzeRepo}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              width: "100%", padding: "13px 24px", borderRadius: 10, border: "none",
              background: loading
                ? "rgba(99,102,241,0.4)"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block" }}>⬡</motion.span>
                Analyzing…
              </span>
            ) : "Analyze Repository →"}
          </motion.button>
        </div>

        <p style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", marginTop: 20, letterSpacing: "0.08em" }}>
          POWERED BY REPOSCOPE INTELLIGENCE ENGINE
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DASHBOARD SCREEN
───────────────────────────────────────────────────────────────────────────── */
function Dashboard({ analysis, onReset }) {
  const { overview, owner, metrics, scores, ai_insights } = analysis;

  const busFactorRisk =
    metrics.contributors <= 1 ? "High" :
    metrics.contributors <= 3 ? "Medium" : "Low";

  const technicalDebtRisk =
    metrics.refactor_commit_ratio < 5 ? "Medium" : "Low";

  const adoptionSignal =
    overview.stars > 50 ? "Growing" :
    overview.stars > 10 ? "Emerging" : "Early";

  const radarData = [
    { subject: "Health",       value: scores.health },
    { subject: "Consistency",  value: scores.consistency },
    { subject: "Evolution",    value: scores.evolution },
    { subject: "Safety",       value: 100 - scores.risk },
  ];

  const donutData = [
    { name: "Features", value: metrics.feature_commit_ratio, color: "#818cf8" },
    { name: "Fixes",    value: metrics.fix_commit_ratio,     color: "#34d399" },
    { name: "Refactor", value: metrics.refactor_commit_ratio, color: "#f59e0b" },
  ];

  const healthDelta = scores.health - scores.risk;
  const gaugeColor  = healthDelta > 70 ? "#34d399" : healthDelta > 40 ? "#fbbf24" : "#ef4444";

  const memberSince = owner.created_at
    ? new Date(owner.created_at).getFullYear()
    : "—";

  const adoptionStages = ["Early", "Emerging", "Growing"];
  const adoptionIdx = adoptionStages.indexOf(adoptionSignal);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1230 40%, #0a0f1e 100%)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#e2e8f0", padding: "clamp(16px, 4vw, 40px)",
      position: "relative", overflowX: "hidden",
    }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(52,211,153,0.05) 0%, transparent 60%)
        `,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto" }}>

        {/* TOP BAR */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 32, flexWrap: "wrap", gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}>⬡</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              RepoScope{" "}
              <span style={{ color: "rgba(99,102,241,0.7)", fontWeight: 400, fontSize: 12, letterSpacing: "0.06em" }}>
                INTELLIGENCE
              </span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
              Live Analysis
            </div>
            <motion.button
              onClick={onReset}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.8)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ← New Analysis
            </motion.button>
          </div>
        </motion.div>

        {/* BENTO GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16, alignItems: "start",
        }}>

          {/* 1 · IDENTITY */}
          <Card delay={0.05}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              borderRadius: "0 20px 0 100%",
            }} />
            <SectionLabel>Repository Owner</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {owner.avatar && owner.avatar !== "https://avatar-url" ? (
                  <img src={owner.avatar} alt="avatar" style={{
                    width: 56, height: 56, borderRadius: "50%",
                    boxShadow: "0 0 0 3px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.2)",
                  }} />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 800, color: "#fff",
                    boxShadow: "0 0 0 3px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.2)",
                  }}>
                    {owner.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.4)" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                  {owner.username}
                </div>
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", marginTop: 2 }}>
                  Member since {memberSince}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Followers",    val: owner.followers    },
                { label: "Public Repos", val: owner.public_repos },
                { label: "⭐ Stars",     val: overview.stars     },
                { label: "Forks",        val: overview.forks     },
              ].map(({ label, val }, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", fontFamily: "'DM Mono', monospace" }}>
                    <AnimatedCounter value={val ?? 0} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2, letterSpacing: "0.03em" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(99,102,241,0.08)", borderRadius: 10,
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>{overview.name}</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginTop: 2 }}>{overview.description}</div>
            </div>
          </Card>

          {/* 2 · RADAR */}
          <Card delay={0.1}>
            <SectionLabel>Strategic Performance</SectionLabel>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(148,163,184,0.7)", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <Radar name="Score" dataKey="value"
                    stroke="#818cf8" fill="#818cf8" fillOpacity={0.18}
                    strokeWidth={2} isAnimationActive animationDuration={1200}
                    dot={{ r: 4, fill: "#818cf8", stroke: "#1e1b4b", strokeWidth: 2 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", textAlign: "center", margin: "8px 0 0", lineHeight: 1.5 }}>
              Combined health, stability &amp; evolution metrics
            </p>
          </Card>

          {/* 3 · DONUT */}
          <Card delay={0.15}>
            <SectionLabel>Engineering Activity</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 140, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%"
                      innerRadius={44} outerRadius={62}
                      dataKey="value" paddingAngle={3}
                      isAnimationActive animationDuration={1000} animationBegin={300}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 6px ${entry.color}50)`, cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {donutData.map(({ name, value, color }, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 6px ${color}` }} />
                        {name}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>{value}%</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(value * 2.94, 100)}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        style={{ height: "100%", background: color, borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 4, lineHeight: 1.4 }}>
                  Hover slices for detail
                </p>
              </div>
            </div>
          </Card>

          {/* 4 · GAUGE */}
          <Card delay={0.2}>
            <SectionLabel>Maintainability Index</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <CircularGauge value={healthDelta} color={gaugeColor} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
                {[
                  { label: "HEALTH", val: scores.health,  color: "#34d399", bg: "rgba(52,211,153,.08)",  border: "rgba(52,211,153,.15)" },
                  { label: "RISK",   val: scores.risk,    color: "#818cf8", bg: "rgba(99,102,241,.08)",  border: "rgba(99,102,241,.15)" },
                ].map(({ label, val, color, bg, border }, i) => (
                  <div key={i} style={{
                    background: bg, borderRadius: 10, padding: "10px 12px",
                    border: `1px solid ${border}`, textAlign: "center",
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'DM Mono', monospace" }}>
                      <AnimatedCounter value={val} />
                    </div>
                    <div style={{ fontSize: 10, color: `${color}99`, marginTop: 2, letterSpacing: "0.08em" }}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", textAlign: "center" }}>
                Stability vs technical debt exposure
              </p>
            </div>
          </Card>

          {/* 5 · FORWARD FORECAST */}
          <Card delay={0.25}>
            <SectionLabel>Forward Forecast</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <RiskBadge label={`Bus Factor · ${busFactorRisk} Risk`} level={busFactorRisk} />
              <RiskBadge label={`Tech Debt · ${technicalDebtRisk}`}   level={technicalDebtRisk} />
              <RiskBadge label={`Adoption · ${adoptionSignal}`}       level={adoptionSignal} />
            </div>
            <div style={{
              padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Adoption Stage
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {adoptionStages.map((s, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i <= adoptionIdx ? "#6366f1" : "rgba(255,255,255,0.06)",
                    boxShadow: i === adoptionIdx ? "0 0 10px rgba(99,102,241,0.5)" : "none",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {adoptionStages.map((s, i) => (
                  <span key={i} style={{
                    fontSize: 9, letterSpacing: "0.05em",
                    color: i === adoptionIdx ? "#a5b4fc" : "rgba(148,163,184,0.3)",
                    fontWeight: i === adoptionIdx ? 700 : 400,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* 6 · EVOLUTION SUMMARY */}
          <Card delay={0.3}>
            <SectionLabel>Evolution Summary</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Total Commits",  val: metrics.total_commits,  icon: "◎", color: "#818cf8" },
                { label: "Active Months",  val: metrics.active_months,  icon: "◈", color: "#06b6d4" },
                { label: "Contributors",   val: metrics.contributors,   icon: "◉", color: "#34d399" },
              ].map(({ label, val, icon, color }, i) => (
                <motion.div key={i}
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.06)", cursor: "default",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color, flexShrink: 0,
                  }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'DM Mono', monospace" }}>
                      <AnimatedCounter value={val ?? 0} />
                    </div>
                  </div>
                  <motion.div
                    initial={{ width: 0, height: 3 }}
                    animate={{ width: 40 }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.7 }}
                    style={{ height: 3, background: color, borderRadius: 2, alignSelf: "flex-end", marginBottom: 4 }}
                  />
                </motion.div>
              ))}
            </div>
          </Card>

          {/* 7 · AI INSIGHTS (wide) */}
          <Card delay={0.35} style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
              }}>✦</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.01em" }}>AI Strategic Insights</div>
                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 1 }}>Powered by pattern analysis</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <RiskBadge label="Analysis Complete" level="Low" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Development Pattern",     val: ai_insights?.development_pattern,     icon: "⬡", color: "#818cf8" },
                { label: "Maintainability Outlook", val: ai_insights?.maintainability_outlook, icon: "◈", color: "#34d399" },
              ].map(({ label, val, icon, color }, i) => (
                <div key={i} style={{
                  background: `${color}0a`, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${color}1a`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ color, fontSize: 13 }}>{icon}</span>
                    <span style={{ fontSize: 10, color: `${color}99`, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(203,213,225,0.8)", lineHeight: 1.5, margin: 0 }}>
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>

            {ai_insights?.improvement_suggestions?.length > 0 && (
              <AIAccordion suggestions={ai_insights.improvement_suggestions} />
            )}
          </Card>

        </div>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "rgba(148,163,184,0.2)", letterSpacing: "0.1em" }}
        >
          REPOSCOPE INTELLIGENCE · {new Date().getFullYear()} · REAL-TIME REPOSITORY ANALYSIS
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [repoUrl,  setRepoUrl]  = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const analyzeRepo = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/analyze", { repoUrl });
      setAnalysis(res.data);
    } catch {
      alert("Analysis failed. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingScreen
              repoUrl={repoUrl} setRepoUrl={setRepoUrl}
              analyzeRepo={analyzeRepo} loading={loading}
            />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard analysis={analysis} onReset={() => setAnalysis(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}