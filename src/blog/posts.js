// ─── BLOG POSTS ──────────────────────────────────────────────────────────────
// Posts are authored as Markdown files in /content/blog/*.md and edited through
// the no-code admin at /admin (Sveltia CMS). DO NOT hand-edit posts here — add
// or change articles in the CMS, or directly in the .md files.
//
// Each Markdown file has YAML frontmatter (title, market, date, readMinutes,
// excerpt, heroImage) followed by the article body in Markdown. The body is
// rendered by the BlogPost component in App.jsx.
//
// This module loads every .md file at build time, parses the frontmatter, and
// exposes the same API the rest of the app already used: POSTS,
// POSTS_BY_MARKET, and getPostBySlug().

import fm from "front-matter";

// Eagerly load the raw text of every Markdown file at build time.
const files = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Turn "April 2026" / "March 2026" etc. into a sortable timestamp.
function dateValue(str) {
  const t = Date.parse(str);
  return Number.isNaN(t) ? 0 : t;
}

export const POSTS = Object.entries(files)
  .map(([path, raw]) => {
    const { attributes, body } = fm(raw);
    const slug = path.split("/").pop().replace(/\.md$/, "");
    return {
      slug,
      title: attributes.title,
      market: attributes.market,
      date: attributes.date,
      readMinutes: attributes.readMinutes,
      excerpt: attributes.excerpt,
      heroImage: attributes.heroImage,
      body, // Markdown string, rendered by <BlogPost>
    };
  })
  // Newest first — the homepage and "related" lists rely on this order.
  .sort((a, b) => dateValue(b.date) - dateValue(a.date));

export const POSTS_BY_MARKET = {
  chicago: POSTS.filter(p => p.market === "chicago"),
  florida: POSTS.filter(p => p.market === "florida"),
};

export function getPostBySlug(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}
