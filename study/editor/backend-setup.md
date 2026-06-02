# Study Editor Backend

This Cloudflare Worker powers:

- `GET /__study_publish/status`
- `POST /__study_publish`

It verifies an editor password, then updates `tumytime/tumytime.github.io` through the GitHub Contents API.

## GitHub Token

Create a fine-grained GitHub token for `tumytime/tumytime.github.io` with:

- Repository permissions: `Contents` -> `Read and write`

Keep the token private.

## Cloudflare Worker

From this directory:

```bash
cd study/editor
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put EDITOR_PASSWORD
npx wrangler deploy
```

`EDITOR_PASSWORD` is the password the public editor page asks for when you click `发布到网站`.

## Route

When `tumytime.space` is managed by Cloudflare, route the Worker to:

```text
tumytime.space/__study_publish*
```

If the domain is not managed by Cloudflare yet, deploy without a route and use the generated `workers.dev` URL as the publish API. The editor at `https://tumytime.space/study/editor/` can then publish directly to GitHub after its API endpoint is pointed at that Worker URL. GitHub Pages may still take a short time to refresh after each successful publish.

## Local Fallback

The local Node server still works:

```bash
node study/editor/publish-server.mjs --port 8787 --push --ssh-key ~/.ssh/id_ed25519_tumytime
```
