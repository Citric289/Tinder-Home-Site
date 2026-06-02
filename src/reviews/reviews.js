// ─── REVIEWS ─────────────────────────────────────────────────────────────────
// Client reviews are authored as Markdown files in /content/reviews/*.md and
// edited through the no-code admin at /admin (Sveltia CMS). DO NOT hand-edit
// reviews here — add or change them in the CMS, or directly in the .md files.
//
// Each file has YAML frontmatter (name, rating) followed by the review text as
// the Markdown body. They render in the Testimonials carousel in App.jsx.
//
// This module loads every .md file at build time, parses it, and exposes REVIEWS.

import fm from "front-matter";

// Eagerly load the raw text of every review at build time.
const files = import.meta.glob("../../content/reviews/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const REVIEWS = Object.entries(files)
  .map(([path, raw]) => {
    const { attributes, body } = fm(raw);
    const slug = path.split("/").pop().replace(/\.md$/, "");
    return {
      slug,
      // Optional client name/initials shown under the quote.
      name: (attributes.name || "").trim(),
      // Star count, clamped to 1–5; defaults to a 5-star review.
      rating: Math.max(1, Math.min(5, Number(attributes.rating) || 5)),
      // The review text itself (plain prose written in the CMS).
      text: body.trim(),
    };
  })
  // Stable, predictable order regardless of how the OS lists files.
  .sort((a, b) => a.slug.localeCompare(b.slug));
