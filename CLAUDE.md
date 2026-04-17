# Project Overview
You are helping build and maintain a modern marketing website / landing page for a SaaS-style product.
Primary goals: clean visual design, fast performance, responsive layout, and easily editable content sections.

## Tech Stack
- Framework: Next.js / React SPA (update this per project)
- Styling: Tailwind CSS (prefer utility classes over inline styles)
- Components: Reusable, accessible, minimal props, no unnecessary abstractions
- Content: All copy lives in dedicated config/content files where possible

## Design Principles
- Overall look: modern, airy, generous white space, clear hierarchy
- Typography: 1–2 font families max, consistent scale, good line-height
- Color: limited palette, strong contrast, clear primary accent color
- Layout: responsive first, mobile-friendly nav, avoid horizontal scroll
- Avoid “AI slop”: no over‑decorated gradients, keep animations subtle and purposeful

## Code Style
- Use TypeScript with strict types
- Prefer functional components and hooks
- Keep files small and focused; extract reusable UI into /components
- Use descriptive names for components, props, and variables
- Follow existing patterns instead of introducing new ones

## UX & Accessibility
- Semantic HTML structure (header, main, section, footer)
- Keyboard‑navigable menus and buttons
- Provide alt text for all non‑decorative images
- Respect prefers-reduced-motion for animations

## Content Guidelines
- Voice: concise, confident, user‑focused, no hype or buzzword salad
- Structure pages with clear sections: hero, problem, solution, features, social proof, FAQ, CTA
- When rewriting copy, keep it shorter and more scannable than the original

## Working With This Project
- When asked to add or change UI:
  - Reuse existing components when possible
  - Update or create tests if the project already uses them
- When creating new files, explain briefly where they live and how to use them
- If requirements are unclear, ask 2–3 clarifying questions before making big changes

## What To Avoid
- Generating boilerplate frameworks the project doesn’t use
- Introducing new design systems without being asked
- Overcomplicated animations, carousels, or third‑party libraries
- Large, monolithic components doing too many things

## Example Tasks You Should Excel At
- Designing and implementing new landing page sections
- Refactoring messy layout into clean, reusable components
- Improving responsiveness and accessibility
- Tightening marketing copy while preserving meaning