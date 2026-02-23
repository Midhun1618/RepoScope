export function computeScores(metrics) {
  let health = 100;
  let risk = 0;
  let consistency = 80;

  if (metrics.total_commits < 10) {
    health -= 20;
    risk += 20;
  }

  if (metrics.feature_commit_ratio < 20) {
    health -= 10;
    risk += 10;
  }

  return {
    health,
    risk,
    consistency,
    evolution: 75,
  };
}