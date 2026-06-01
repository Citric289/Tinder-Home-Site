// Vercel serverless function — step 1 of the GitHub login used by the /admin
// editor (Sveltia CMS). It kicks off GitHub's OAuth flow by redirecting the
// login popup to GitHub. The Client ID/Secret come from Vercel env vars, so no
// secrets live in the repo. See ADMIN-SETUP.md.
import crypto from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("Missing GITHUB_CLIENT_ID environment variable.");
    return;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/callback`;

  // A random "state" value, stored in a short-lived cookie and checked in the
  // callback to protect against cross-site request forgery.
  const state = crypto.randomBytes(16).toString("hex");
  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state,
    allow_signup: "false",
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params}`,
  });
  res.end();
}
