// ─── NEIGHBORHOOD GUIDES ─────────────────────────────────────────────────────
// Neighborhood guides are authored as Markdown files in /content/neighborhoods/*.md
// and edited through the no-code admin at /admin (Sveltia CMS). DO NOT hand-edit
// guides here — add or change them in the CMS, or directly in the .md files.
//
// Each file has YAML frontmatter (name, market, order, excerpt, heroImage) followed
// by the guide body in Markdown. The card grid (Neighborhoods) shows name + excerpt;
// the full page (NeighborhoodGuide) renders the body. This mirrors the blog (posts.js).
//
// This module loads every .md file at build time, parses it, and exposes GUIDES,
// GUIDES_BY_MARKET, and getGuideBySlug.

import fm from "front-matter";

// Eagerly load the raw text of every guide at build time.
const files = import.meta.glob("../../content/neighborhoods/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const GUIDES = Object.entries(files)
  .map(([path, raw]) => {
    const { attributes, body } = fm(raw);
    const slug = path.split("/").pop().replace(/\.md$/, "");
    return {
      slug,
      name: attributes.name,
      market: attributes.market,
      order: Number(attributes.order) || 0,
      excerpt: attributes.excerpt,
      heroImage: attributes.heroImage,
      body, // Markdown string, rendered by <NeighborhoodGuide>
    };
  })
  // Card numbering (01, 02, …) relies on this ascending order.
  .sort((a, b) => a.order - b.order);

// A guide belongs to a market if it targets that market specifically, or "both".
export function guideInMarket(guide, market) {
  return guide.market === market || guide.market === "both";
}

export const GUIDES_BY_MARKET = {
  chicago: GUIDES.filter(g => guideInMarket(g, "chicago")),
  florida: GUIDES.filter(g => guideInMarket(g, "florida")),
};

export function getGuideBySlug(slug) {
  return GUIDES.find(g => g.slug === slug) || null;
}
