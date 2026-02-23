import { computeScores } from "./rules.js";

export function analyzeRepository(repoData) {
  console.log("🧮 Running structural + commit analysis...");

  const commits = repoData.commits || [];

  const totalCommits = commits.length;

  const contributors = new Set();
  const monthlyMap = {};
  let feature = 0;
  let fix = 0;
  let refactor = 0;

  commits.forEach(commit => {
    const message = commit.commit.message.toLowerCase();
    const date = new Date(commit.commit.author.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    // Contributor tracking
    if (commit.author?.login) {
      contributors.add(commit.author.login);
    }

    // Monthly grouping
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;

    // Categorization
    if (message.includes("add") || message.includes("implement")) feature++;
    else if (message.includes("fix") || message.includes("bug")) fix++;
    else if (message.includes("refactor") || message.includes("improve")) refactor++;
  });

  const activeMonths = Object.keys(monthlyMap).length;

  const featureRatio =
    totalCommits > 0 ? Math.round((feature / totalCommits) * 100) : 0;

  const fixRatio =
    totalCommits > 0 ? Math.round((fix / totalCommits) * 100) : 0;

  const refactorRatio =
    totalCommits > 0 ? Math.round((refactor / totalCommits) * 100) : 0;

  console.log(`📊 Total commits: ${totalCommits}`);
  console.log(`👥 Contributors: ${contributors.size}`);
  console.log(`🗓 Active months: ${activeMonths}`);
  console.log(`✨ Feature ratio: ${featureRatio}%`);

  const metrics = {
    total_commits: totalCommits,
    contributors: contributors.size,
    active_months: activeMonths,
    feature_commit_ratio: featureRatio,
    fix_commit_ratio: fixRatio,
    refactor_commit_ratio: refactorRatio,
    summary: {
      total_commits: totalCommits,
      contributors: contributors.size,
      active_months: activeMonths,
      feature_commit_ratio: featureRatio,
      fix_commit_ratio: fixRatio,
      refactor_commit_ratio: refactorRatio
    }
  };

  const scores = computeScores(metrics);

  return { metrics, scores };
}