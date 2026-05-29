/**
 * Application-wide constants and configuration
 */
export const config = {
  // Base URL
  baseUrl: "https://memfit.ai",

  // GitHub
  github: {
    repoUrl: "https://github.com/memfitai/memfit",
    starsFormatted: {
      compact: "50K",
      full: "50,000",
    },
  },

  // Social links
  social: {
    twitter: "https://x.com/memfit",
    discord: "https://discord.gg/memfit",
  },

  // Static stats (used on landing page)
  stats: {
    contributors: "500",
    commits: "6,500",
    monthlyUsers: "650,000",
  },
} as const
