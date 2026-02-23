import axios from "axios";

export async function fetchRepositoryData(repoUrl) {
  console.log("🔎 Fetching GitHub data...");

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(\.git)?$/);
  if (!match) {
    throw new Error("Invalid GitHub URL format.");
  }

  const owner = match[1];
  const repo = match[2];

  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "RepoScope-App"
  };

  try {
    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const commitsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      { headers }
    );

    const userRes = await axios.get(
      `https://api.github.com/users/${owner}`,
      { headers }
    );

    return {
      overview: {
        name: repoRes.data.name,
        description: repoRes.data.description,
        stars: repoRes.data.stargazers_count,
        forks: repoRes.data.forks_count
      },

      owner: {
        username: userRes.data.login,
        avatar: userRes.data.avatar_url,
        followers: userRes.data.followers,
        public_repos: userRes.data.public_repos,
        created_at: userRes.data.created_at
      },

      commits: commitsRes.data
    };

  } catch (error) {
    if (error.response?.status === 404)
      throw new Error("Repository not found.");

    if (error.response?.status === 403)
      throw new Error("GitHub API rate limit exceeded.");

    throw new Error("GitHub API request failed.");
  }
}