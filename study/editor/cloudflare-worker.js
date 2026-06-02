const DEFAULT_OWNER = "tumytime";
const DEFAULT_REPO = "tumytime.github.io";
const DEFAULT_BRANCH = "main";
const DEFAULT_ORIGIN = "https://tumytime.space";

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      ...headers
    }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  if (!origin) return {};
  if (origin !== allowedOrigin && !origin.startsWith("http://localhost:")) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, X-Study-Editor-Password",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
}

function safeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

function normalizeMetadata(raw) {
  const subject = raw?.subject === "control" ? "control" : "math";
  const slug = String(raw?.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) throw new Error("缺少 URL Slug。");

  return {
    title: String(raw?.title || "未命名笔记"),
    subject,
    summary: String(raw?.summary || ""),
    date: String(raw?.date || new Date().toISOString().slice(0, 10)),
    slug,
    coverSeed: String(raw?.coverSeed || slug),
    url: `/study/${subject}/${slug}/`
  };
}

function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) {
    binary += String.fromCharCode(...bytes.subarray(i, i + size));
  }
  return btoa(binary);
}

function base64Decode(text) {
  const binary = atob(String(text || "").replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function repoConfig(env) {
  return {
    owner: env.GITHUB_OWNER || DEFAULT_OWNER,
    repo: env.GITHUB_REPO || DEFAULT_REPO,
    branch: env.GITHUB_BRANCH || DEFAULT_BRANCH
  };
}

async function githubFetch(env, apiPath, init = {}) {
  if (!env.GITHUB_TOKEN) throw new Error("Worker 缺少 GITHUB_TOKEN secret。");
  const { owner, repo } = repoConfig(env);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${apiPath}`, {
    ...init,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "tumy-study-editor",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 500)}`);
  }

  return response.json();
}

async function getRepoFile(env, filePath) {
  const { branch } = repoConfig(env);
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  try {
    const data = await githubFetch(env, `/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`);
    return {
      sha: data.sha,
      text: base64Decode(data.content || "")
    };
  } catch (error) {
    if (String(error.message || "").includes("GitHub API 404")) return null;
    throw error;
  }
}

async function putRepoFile(env, filePath, content, message, sha) {
  const { branch } = repoConfig(env);
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const body = {
    message,
    content: base64Encode(content),
    branch
  };
  if (sha) body.sha = sha;
  return githubFetch(env, `/contents/${encodedPath}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

async function publishNote(request, env, headers) {
  const password = request.headers.get("X-Study-Editor-Password") || "";
  if (!safeEqual(password, env.EDITOR_PASSWORD)) {
    return json({ error: "发布密码不正确。" }, 401, headers);
  }

  const payload = await request.json();
  const metadata = normalizeMetadata(payload.metadata);
  const html = String(payload.html || "");
  if (!html.includes("<!DOCTYPE html>") || !html.includes("study-note-source")) {
    throw new Error("发布内容不是有效的学习笔记页面。");
  }

  const notePath = `study/${metadata.subject}/${metadata.slug}/index.html`;
  const notesPath = "study/data/notes.json";
  const [currentNote, currentNotes] = await Promise.all([
    getRepoFile(env, notePath),
    getRepoFile(env, notesPath)
  ]);

  let notesData = { notes: [] };
  if (currentNotes?.text) {
    notesData = JSON.parse(currentNotes.text);
  }
  if (!Array.isArray(notesData.notes)) notesData.notes = [];

  const existingIndex = notesData.notes.findIndex((note) => (
    note.url === metadata.url ||
    (note.subject === metadata.subject && note.slug === metadata.slug)
  ));
  if (existingIndex >= 0) {
    notesData.notes[existingIndex] = { ...notesData.notes[existingIndex], ...metadata };
  } else {
    notesData.notes.unshift(metadata);
  }

  const noteResult = await putRepoFile(
    env,
    notePath,
    html,
    `Publish study note: ${metadata.title}`,
    currentNote?.sha
  );
  const notesResult = await putRepoFile(
    env,
    notesPath,
    `${JSON.stringify(notesData, null, 2)}\n`,
    `Update study notes metadata: ${metadata.title}`,
    currentNotes?.sha
  );

  return json({
    message: `已发布到 ${metadata.url}，GitHub Pages 通常还要等几十秒到几分钟刷新。`,
    pushed: true,
    commits: [
      noteResult.commit?.sha || "",
      notesResult.commit?.sha || ""
    ].filter(Boolean),
    metadata
  }, 200, headers);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      if (request.method === "GET" && url.pathname === "/__study_publish/status") {
        return json({
          service: "study-editor-cloud-publisher",
          pushEnabled: true,
          authRequired: true,
          owner: env.GITHUB_OWNER || DEFAULT_OWNER,
          repo: env.GITHUB_REPO || DEFAULT_REPO,
          branch: env.GITHUB_BRANCH || DEFAULT_BRANCH
        }, 200, headers);
      }

      if (request.method === "POST" && url.pathname === "/__study_publish") {
        return publishNote(request, env, headers);
      }

      return json({ error: "Not found" }, 404, headers);
    } catch (error) {
      return json({ error: error.message || "Publish failed" }, 500, headers);
    }
  }
};
