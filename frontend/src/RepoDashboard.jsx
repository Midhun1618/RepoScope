import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const data = {
  overview: {
    name: "RepoScope",
    description: "Hybrid repository intelligence system",
    stars: 72,
    forks: 5,
  },
  owner: {
    username: "Midhun1618",
    avatar: "https://avatar-url",
    followers: 18,
    public_repos: 12,
    created_at: "2022-04-12T00:00:00Z",
  },
  metrics: {
    total_commits: 72,
    contributors: 1,
    active_months: 8,
    feature_commit_ratio: 32,
    fix_commit_ratio: 1,
    refactor_commit_ratio: 1,
  },
  scores: {
    health: 100,
    risk: 0,
    consistency: 80,
    evolution: 75,
  },
  ai_insights: {
    development_pattern: "Primarily feature-driven with steady cadence",
    maintainability_outlook: "Strong foundation, minimal debt accumulation",
    improvement_suggestions: [
      "Introduce regular refactoring cycles",
      "Encourage additional contributors",
      "Set up structured bug tracking",
    ],
  },
};

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.5, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ─── Circular Gauge ────────────────────────────────────────────────────────────
function CircularGauge({ value, max = 100, label, color }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const [anim, setAnim] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let f = 0;
    const timer = setInterval(() => {
      f += 0.02;
      if (f >= 1) { setAnim(1); clearInterval(timer); }
      else setAnim(f);
    }, 16);
    return () => clearInterval(timer);
  }, [inView]);

  const offset = circ * (1 - pct * anim);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
          <circle
            cx={64} cy={64} r={r} fill="none"
            stroke={color} strokeWidth={10}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "none" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>
            {Math.round(value * anim)}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>/ {max}</span>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
function RiskBadge({ label, level }) {
  const colors = {
    low: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "#34d399", dot: "#34d399" },
    medium: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24", dot: "#fbbf24" },
    high: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#ef4444", dot: "#ef4444" },
  };
  const c = colors[level] || colors.low;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20,
      backdropFilter: "blur(10px)"
    }}>
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, boxShadow: `0 0 6px ${c.dot}` }}
      />
      <span style={{ fontSize: 12, color: c.text, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

// ─── Glass Card ────────────────────────────────────────────────────────────────
function Card({ children, style = {}, delay = 0, span = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "rgba(148,163,184,0.6)",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 8
    }}>
      <div style={{ width: 20, height: 1, background: "rgba(148,163,184,0.3)" }} />
      {children}
    </div>
  );
}

// ─── Custom Radar Dot ──────────────────────────────────────────────────────────
const CustomRadarDot = (props) => {
  const { cx, cy } = props;
  return <circle cx={cx} cy={cy} r={4} fill="#818cf8" stroke="#312e81" strokeWidth={2} />;
};

// ─── Custom Donut Tooltip ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "8px 14px", backdropFilter: "blur(20px)"
      }}>
        <p style={{ color: payload[0].payload.color, fontWeight: 700, fontSize: 13, margin: 0 }}>
          {payload[0].name}
        </p>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "2px 0 0" }}>
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

// ─── AI Accordion ──────────────────────────────────────────────────────────────
function AIAccordion({ suggestions }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 12, padding: "12px 16px", cursor: "pointer", color: "#a5b4fc"
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.03em" }}>
          Improvement Suggestions
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
          style={{ fontSize: 16, lineHeight: 1 }}>▾</motion.span>
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px"
                  }}
                >
                  <span style={{ fontSize: 14, marginTop: 1 }}>
                    {["✦", "◈", "⬡"][i % 3]}
                  </span>
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function RepoDashboard() {
  const { overview, owner, metrics, scores, ai_insights } = data;

  const radarData = [
    { subject: "Health", value: scores.health },
    { subject: "Consistency", value: scores.consistency },
    { subject: "Evolution", value: scores.evolution },
    { subject: "Safety", value: 100 - scores.risk },
  ];

  const donutData = [
    { name: "Features", value: metrics.feature_commit_ratio, color: "#818cf8" },
    { name: "Fixes", value: metrics.fix_commit_ratio, color: "#34d399" },
    { name: "Refactor", value: metrics.refactor_commit_ratio, color: "#f59e0b" },
  ];

  const healthScore = scores.health - scores.risk;
  const gaugeColor = healthScore > 70 ? "#34d399" : healthScore > 40 ? "#fbbf24" : "#ef4444";

  const memberSince = new Date(owner.created_at).getFullYear();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1230 40%, #0a0f1e 100%)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#e2e8f0",
      padding: "clamp(16px, 4vw, 40px)",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Background mesh */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(52,211,153,0.05) 0%, transparent 60%)
        `
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1300, margin: "0 auto" }}>

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 32, flexWrap: "wrap", gap: 12
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "0 0 20px rgba(99,102,241,0.4)"
            }}>⬡</div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              RepoScope <span style={{ color: "rgba(99,102,241,0.7)", fontWeight: 400, fontSize: 12, letterSpacing: "0.06em" }}>INTELLIGENCE</span>
            </span>
          </div>
          <div style={{
            fontSize: 11, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em",
            textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6
          }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
            Live Analysis
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}>

          {/* ── 1. Identity Card ── */}
          <Card delay={0.05} style={{ gridColumn: "span 1" }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              borderRadius: "0 20px 0 100%"
            }} />
            <SectionLabel>Repository Owner</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 800, color: "#fff",
                  boxShadow: "0 0 0 3px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.2)"
                }}>
                  {owner.username[0].toUpperCase()}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    position: "absolute", inset: -4, borderRadius: "50%",
                    border: "2px solid rgba(99,102,241,0.4)"
                  }}
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
                { label: "Followers", val: owner.followers },
                { label: "Public Repos", val: owner.public_repos },
                { label: "⭐ Stars", val: overview.stars },
                { label: "Forks", val: overview.forks },
              ].map(({ label, val }, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", fontFamily: "'DM Mono', monospace" }}>
                    <AnimatedCounter value={val} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2, letterSpacing: "0.03em" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(99,102,241,0.08)", borderRadius: 10,
              border: "1px solid rgba(99,102,241,0.2)"
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>{overview.name}</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginTop: 2 }}>{overview.description}</div>
            </div>
          </Card>

          {/* ── 2. Radar Chart ── */}
          <Card delay={0.1} style={{ gridColumn: "span 1" }}>
            <SectionLabel>Strategic Performance</SectionLabel>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(148,163,184,0.7)", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <Radar
                    name="Score" dataKey="value"
                    stroke="#818cf8" fill="#818cf8" fillOpacity={0.18}
                    strokeWidth={2} dot={<CustomRadarDot />}
                    isAnimationActive={true} animationDuration={1200}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p style={{
              fontSize: 12, color: "rgba(148,163,184,0.6)", textAlign: "center",
              margin: "8px 0 0", lineHeight: 1.5
            }}>
              High health & safety — consistency & evolution show room for growth
            </p>
          </Card>

          {/* ── 3. Donut Chart ── */}
          <Card delay={0.15} style={{ gridColumn: "span 1" }}>
            <SectionLabel>Engineering Activity</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ width: 140, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData} cx="50%" cy="50%"
                      innerRadius={44} outerRadius={62}
                      dataKey="value" paddingAngle={3}
                      isAnimationActive animationDuration={1000}
                      animationBegin={300}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)`, cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {donutData.map(({ name, value, color }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: color,
                      boxShadow: `0 0 8px ${color}`, flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)" }}>{name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>{value}%</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value * 2.94}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          style={{ height: "100%", background: color, borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 4, lineHeight: 1.4 }}>
                  Hover slices for detail. Feature-heavy pattern detected.
                </p>
              </div>
            </div>
          </Card>

          {/* ── 4. Maintainability Gauge ── */}
          <Card delay={0.2} style={{ gridColumn: "span 1" }}>
            <SectionLabel>Maintainability Score</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <CircularGauge value={healthScore} max={100} label="Health Delta" color={gaugeColor} />
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%"
              }}>
                <div style={{
                  background: "rgba(52,211,153,0.08)", borderRadius: 10, padding: "10px 12px",
                  border: "1px solid rgba(52,211,153,0.15)", textAlign: "center"
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#34d399", fontFamily: "'DM Mono', monospace" }}>
                    <AnimatedCounter value={scores.health} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(52,211,153,0.6)", marginTop: 2, letterSpacing: "0.08em" }}>HEALTH</div>
                </div>
                <div style={{
                  background: "rgba(99,102,241,0.08)", borderRadius: 10, padding: "10px 12px",
                  border: "1px solid rgba(99,102,241,0.15)", textAlign: "center"
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#818cf8", fontFamily: "'DM Mono', monospace" }}>
                    <AnimatedCounter value={scores.risk} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(99,102,241,0.6)", marginTop: 2, letterSpacing: "0.08em" }}>RISK</div>
                </div>
              </div>
            </div>
          </Card>

          {/* ── 5. Forward Forecast ── */}
          <Card delay={0.25} style={{ gridColumn: "span 1" }}>
            <SectionLabel>Forward Forecast</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <RiskBadge label="Bus Factor · Low Risk" level="low" />
              <RiskBadge label="Tech Debt · Minimal" level="low" />
              <RiskBadge label="Single Contributor" level="medium" />
            </div>
            <div style={{
              marginTop: 16, padding: "12px 14px",
              background: "rgba(255,255,255,0.03)", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Adoption Stage
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["Inception", "Growth", "Mature"].map((stage, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i === 0 ? "#6366f1" : i === 1 ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)",
                    boxShadow: i === 0 ? "0 0 10px rgba(99,102,241,0.5)" : "none",
                    transition: "all 0.3s"
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["Inception", "Growth", "Mature"].map((s, i) => (
                  <span key={i} style={{
                    fontSize: 9, color: i === 0 ? "#a5b4fc" : "rgba(148,163,184,0.3)",
                    fontWeight: i === 0 ? 700 : 400, letterSpacing: "0.05em"
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* ── 6. Evolution Summary ── */}
          <Card delay={0.3} style={{ gridColumn: "span 1" }}>
            <SectionLabel>Evolution Summary</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {[
                { label: "Total Commits", val: metrics.total_commits, icon: "◎", color: "#818cf8" },
                { label: "Active Months", val: metrics.active_months, icon: "◈", color: "#06b6d4" },
                { label: "Contributors", val: metrics.contributors, icon: "◉", color: "#34d399" },
              ].map(({ label, val, icon, color }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.06)", cursor: "default"
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color, flexShrink: 0
                  }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 2, letterSpacing: "0.04em" }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'DM Mono', monospace" }}>
                      <AnimatedCounter value={val} />
                    </div>
                  </div>
                  <div style={{
                    width: 40, height: 3, borderRadius: 2, background: `${color}20`, alignSelf: "flex-end", marginBottom: 4
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.7 }}
                      style={{ height: "100%", background: color, borderRadius: 2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* ── 7. AI Strategic Insights ── */}
          <Card delay={0.35} style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15
              }}>✦</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.01em" }}>AI Strategic Insights</div>
                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 1 }}>Powered by pattern analysis</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <RiskBadge label="Analysis Complete" level="low" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Development Pattern", val: ai_insights.development_pattern, icon: "⬡", color: "#818cf8" },
                { label: "Maintainability Outlook", val: ai_insights.maintainability_outlook, icon: "◈", color: "#34d399" },
              ].map(({ label, val, icon, color }, i) => (
                <div key={i} style={{
                  background: `${color}0a`, borderRadius: 12, padding: "14px 16px",
                  border: `1px solid ${color}1a`
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ color, fontSize: 13 }}>{icon}</span>
                    <span style={{ fontSize: 10, color: `${color}99`, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(203,213,225,0.8)", lineHeight: 1.5, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>

            <AIAccordion suggestions={ai_insights.improvement_suggestions} />
          </Card>

        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{
            marginTop: 32, textAlign: "center",
            fontSize: 11, color: "rgba(148,163,184,0.25)", letterSpacing: "0.1em"
          }}
        >
          REPOSCOPE INTELLIGENCE · {new Date().getFullYear()} · REAL-TIME REPOSITORY ANALYSIS
        </motion.div>
      </div>
    </div>
  );
}