import { useState } from "react";
import axios from "axios";
import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis
} from "recharts";
import { CircularProgressbar, buildStyles }
  from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./index.css";

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRepo = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/analyze", { repoUrl });
      setAnalysis(res.data);
    } catch {
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div style={{ textAlign: "center", marginTop: "200px" }}>
        <h1>RepoScope Intelligence</h1>
        <input
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <div style={{ marginTop: "1rem" }}>
          <button onClick={analyzeRepo}>
            {loading ? "Analyzing..." : "Analyze Repository"}
          </button>
        </div>
      </div>
    );
  }

  const busFactorRisk =
    analysis.metrics.contributors <= 1 ? "High" :
    analysis.metrics.contributors <= 3 ? "Medium" : "Low";

  const technicalDebtRisk =
    analysis.metrics.refactor_commit_ratio < 5 ? "Medium" : "Low";

  const adoptionSignal =
    analysis.overview.stars > 50 ? "Growing" :
    analysis.overview.stars > 10 ? "Emerging" : "Early";

 return (
  <div className="dashboard">

    {/* PROFILE TILE (2 columns) */}
    <div className="card" style={{ gridColumn: "span 2" }}>
      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
        <img
          src={analysis.owner.avatar}
          alt="avatar"
          style={{ width: 70, height: 70, borderRadius: "50%" }}
        />
        <div>
          <h2>{analysis.owner.username}</h2>
          <p className="small-text">
            Repository: {analysis.overview.name}
          </p>
          <p className="small-text">
            ⭐ {analysis.overview.stars} stars • {analysis.owner.followers} followers • {analysis.owner.public_repos} public repos
          </p>
        </div>
      </div>
      <button onClick={() => setAnalysis(null)}>
        New Analysis
      </button>
    </div>

    {/* RADAR TILE (2 columns) */}
    <div className="card" style={{ gridColumn: "span 2" }}>
      <h3>Strategic Performance Overview</h3>
      <p className="small-text">
        Combined health, stability and evolution metrics forming the system profile.
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={[
          { metric: "Health", value: analysis.scores.health },
          { metric: "Consistency", value: analysis.scores.consistency },
          { metric: "Evolution", value: analysis.scores.evolution },
          { metric: "Risk Inverted", value: 100 - analysis.scores.risk }
        ]}>
          <PolarGrid stroke="#444" />
          <PolarAngleAxis dataKey="metric" />
          <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>

    {/* HEALTH GAUGE */}
    <div className="card">
      <h3>Maintainability Index</h3>
      <p className="small-text">
        Stability vs technical debt exposure.
      </p>
      <div style={{ width: 120, margin: "auto" }}>
        <CircularProgressbar
          value={analysis.scores.health - analysis.scores.risk}
          text={`${analysis.scores.health - analysis.scores.risk}%`}
          styles={buildStyles({
            textColor: "#fff",
            pathColor: "#22c55e",
            trailColor: "#333"
          })}
        />
      </div>
    </div>

    {/* COMMIT DISTRIBUTION */}
    <div className="card">
      <h3>Engineering Activity</h3>
      <p className="small-text">
        Feature vs fix vs refactor distribution.
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={[
              { name: "Feature", value: analysis.metrics.feature_commit_ratio },
              { name: "Fix", value: analysis.metrics.fix_commit_ratio },
              { name: "Refactor", value: analysis.metrics.refactor_commit_ratio }
            ]}
            dataKey="value"
            outerRadius={60}
          >
            <Cell fill="#22c55e" />
            <Cell fill="#facc15" />
            <Cell fill="#ef4444" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* FORECAST SUMMARY */}
    <div className="card">
      <h3>Forward Outlook</h3>
      <p className="small-text">
        AI-evaluated long-term sustainability.
      </p>
      <p><strong>Bus Factor Risk:</strong> {analysis.metrics.contributors <= 1 ? "High" : "Moderate"}</p>
      <p><strong>Technical Debt Risk:</strong> {analysis.metrics.refactor_commit_ratio < 5 ? "Medium" : "Low"}</p>
      <p><strong>Adoption Stage:</strong> {analysis.overview.stars > 10 ? "Emerging" : "Early"}</p>
    </div>

    {/* CONTRIBUTOR TILE (wide) */}
    <div className="card" style={{ gridColumn: "span 2" }}>
      <h3>Contributor & Evolution Signal</h3>
      <p className="small-text">
        Development cadence across {analysis.metrics.active_months} active months
        with {analysis.metrics.contributors} active contributor(s).
      </p>
      <h1 style={{ marginTop: 10 }}>
        {analysis.metrics.total_commits} Total Commits
      </h1>
    </div>

    {/* ADOPTION TILE */}
    <div className="card">
      <h3>Adoption Signal</h3>
      <p className="small-text">
        Community validation indicator.
      </p>
      <h1>⭐ {analysis.overview.stars}</h1>
    </div>

  </div>
);
}