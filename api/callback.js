// Vercel serverless function — step 2 of the GitHub login used by the /admin
// editor (Sveltia CMS). GitHub redirects here with a one-time code; we exchange
// it for an access token and hand it back to the editor window via the
// postMessage handshake that Sveltia/Decap expect. See ADMIN-SETUP.md.
export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const { code, state } = req.query;

  // Validate the state cookie set by /api/auth.
  const cookies = (req.headers.cookie || "")
    .split(";")
    .map(c => c.trim());
  const savedState = cookies
    .find(c => c.startsWith("oauth_state="))
    ?.split("=")[1];

  if (!code || !state || state !== savedState) {
    res.status(400).send("Invalid OAuth state. Please try logging in again.");
    return;
  }

  let payload;
  let status;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();
    if (data.access_token) {
      status = "success";
      payload = { token: data.access_token, provider: "github" };
    } else {
      status = "error";
      payload = { error: data.error_description || "Token exchange failed." };
    }
  } catch (err) {
    status = "error";
    payload = { error: String(err) };
  }

  // Clear the state cookie.
  res.setHeader("Set-Cookie", "oauth_state=; Path=/; Max-Age=0");

  // The editor opened this URL in a popup. Post the result back to it, then the
  // popup closes itself.
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const page = `<!doctype html><html><body><script>
    (function () {
      function receive(e) {
        window.opener && window.opener.postMessage(${JSON.stringify(message)}, e.origin);
        window.removeEventListener("message", receive, false);
      }
      window.addEventListener("message", receive, false);
      window.opener && window.opener.postMessage("authorizing:github", "*");
    })();
  </script></body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(page);
}
