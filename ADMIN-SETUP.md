# Blog Editor (Sveltia CMS) — Setup & Use

This site has a no-code editor at **`/admin`** so non-developers can add, edit, and
delete blog posts. Posts are saved as Markdown files in `content/blog/`, committed
to GitHub, and Vercel auto-deploys the site within about a minute.

The GitHub login is handled by two small serverless functions in [`/api`](api/)
(`auth.js` + `callback.js`) that run on Vercel — no third-party service needed.

There are three parts to this document:

1. **One-time setup** — you (the developer) do this once.
2. **Day-to-day use** — what to hand to your dad.
3. **Moving to craigtinder.com** — what to change when the custom domain goes live.

---

## Part 1 — One-time setup (developer)

> Current site URL used below: **https://tinderhome.vercel.app**
> If your real Vercel production domain differs (check **Vercel → Project →
> Settings → Domains**), use that instead — and update `base_url`/`site_url` in
> [`public/admin/config.yml`](public/admin/config.yml) to match.

### Step 1 — Create a GitHub OAuth App
1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (https://github.com/settings/developers).
2. Fill in:
   - **Application name:** `Craig Tinder Site CMS`
   - **Homepage URL:** `https://tinderhome.vercel.app`
   - **Authorization callback URL:** `https://tinderhome.vercel.app/api/callback`
3. Click **Register application**.
4. Copy the **Client ID**, then click **Generate a new client secret** and copy it.

### Step 2 — Add the secrets to Vercel
1. **Vercel → your project → Settings → Environment Variables.**
2. Add two variables (Environment: **Production**, and Preview if you want):
   - `GITHUB_CLIENT_ID` = the Client ID from Step 1
   - `GITHUB_CLIENT_SECRET` = the Client Secret from Step 1
3. **Redeploy** the production deployment so the new variables take effect
   (Vercel → Deployments → ⋯ → Redeploy, or just push any commit).

### Step 3 — Give your dad access
He only needs **read/write access to the GitHub repo** (`Citric289/tinder-home-site`).
Invite him: **GitHub repo → Settings → Collaborators → Add people** (he'll need a
free GitHub account). He accepts the email invite — that's it.

### Done
Visit `https://tinderhome.vercel.app/admin` and click **Login with GitHub**.
If it logs you into the editor, everything is wired correctly.

---

## Part 2 — How to use it (hand this to your dad)

### Logging in
1. Go to **`https://tinderhome.vercel.app/admin`** (later: `craigtinder.com/admin`).
2. Click **Login with GitHub** and approve.

### Adding a blog post
1. Click **Blog Posts → New Blog Post**.
2. Fill in the fields:
   - **Title** — the headline.
   - **Market** — Chicago or Florida (controls which page it shows on).
   - **Date** — how it appears on the post, e.g. `May 2026`.
   - **Read time** — optional, e.g. `5`.
   - **Excerpt** — one or two sentences shown on the preview card.
   - **Hero Image** — click to upload the big photo at the top.
   - **Article Body** — write the article. Use the **Heading 2** button for
     section titles, the **quote** button for pull quotes, and bullet lists as needed.
3. Click **Publish → Publish now**.
4. Wait ~1 minute and refresh the live site — the post appears automatically.

### Editing or deleting
Open **Blog Posts**, click a post to edit it (or delete it), then **Publish**.
Same one-minute wait for the change to go live.

### Reviews
1. Click **Reviews → New Review**.
2. Fill in:
   - **Client name** — optional. Shown under the quote (e.g. "The Johnson Family").
     Leave it blank to keep the review anonymous.
   - **Star rating** — 1 to 5 gold stars (defaults to 5).
   - **Review text** — what the client said.
3. **Publish.** The review joins the "What Clients Say" carousel on both the Chicago
   and Florida pages.

To edit or remove a review, open **Reviews**, click it, make changes (or delete), then **Publish**.

### Neighborhood Guides
Each guide is a **full page** with a photo and a write-up — the cards in the
"Neighborhood Guides" section open them.
1. Click **Neighborhood Guides → New Neighborhood Guide**.
2. Fill in:
   - **Neighborhood name** — the title (e.g. "North Shore").
   - **Market** — Chicago, Florida, or Both (controls which page it shows on).
   - **Order** — `1` shows first in the grid, then `2`, `3`, …
   - **Short description** — one or two sentences shown on the card.
   - **Hero Image** — the big photo at the top of the guide page.
   - **Guide Body** — the full write-up. Use the **Heading 2** button for section titles.
3. **Publish.** Edit or delete the same way you would a blog post.

### Homepage Numbers
The sales figures on the homepage (e.g. **$245M+**, **385+**, **149+**) are editable.
1. Click **Homepage Numbers → Homepage Numbers**.
2. Update any **Number** or **Caption** under *Hero banner numbers* (the top banner)
   or *About-section numbers* (the "About Craig" section).
3. **Publish.**

> Note: this updates the big number tiles, not the sentences in the paragraphs. If
> you want a number changed inside a paragraph too, ask the developer.

> These sections — Blog Posts, Reviews, Neighborhood Guides, and Homepage Numbers —
> are everything you can edit here; the rest of the site stays fixed. If something
> ever looks wrong, the developer can undo any change from GitHub's history.

---

## Part 3 — Moving to craigtinder.com

When the custom domain is live on Vercel:

1. In [`public/admin/config.yml`](public/admin/config.yml), change both
   `base_url:` and `site_url:` to `https://craigtinder.com`.
2. In the GitHub OAuth App (Step 1), update the **Homepage URL** to
   `https://craigtinder.com` and the **Authorization callback URL** to
   `https://craigtinder.com/api/callback`. (GitHub OAuth Apps allow more than one
   callback URL, so you can keep the `.vercel.app` one too during the transition.)
3. Commit and let Vercel deploy. Your dad now logs in at `craigtinder.com/admin`.
