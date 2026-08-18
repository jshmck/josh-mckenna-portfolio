import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

/* Blocks known AI-training crawlers outright; everything else can index
   normally. Pairs with the no-training notice in the footer — see
   components/site/footer.tsx. */
const aiCrawlers = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Diffbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
