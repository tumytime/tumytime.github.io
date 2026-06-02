#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const editorDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(editorDir, "../..");
const execFileAsync = promisify(execFile);

function argValue(flag) {
  const index = process.argv.findIndex((arg) => arg === flag);
  return index >= 0 ? process.argv[index + 1] : "";
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const port = Number(process.env.PORT || argValue("--port") || 8787);
const shouldPush = process.env.STUDY_PUBLISH_PUSH === "1" || hasFlag("--push");
const shouldPull = process.env.STUDY_PUBLISH_PULL === "1" || hasFlag("--pull");
const gitRemote = process.env.STUDY_PUBLISH_REMOTE || argValue("--remote") || "origin";
const gitBranch = process.env.STUDY_PUBLISH_BRANCH || argValue("--branch") || "main";
const sshKey = process.env.STUDY_PUBLISH_SSH_KEY || argValue("--ssh-key") || "";

const mimeTypes = new Map([
  [".css", "text/css;charset=utf-8"],
  [".cur", "image/x-icon"],
  [".gif", "image/gif"],
  [".html", "text/html;charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript;charset=utf-8"],
  [".json", "application/json;charset=utf-8"],
  [".mjs", "text/javascript;charset=utf-8"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml;charset=utf-8"],
  [".txt", "text/plain;charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml;charset=utf-8"]
]);

function send(response, status, body, contentType = "text/plain;charset=utf-8") {
  response.writeHead(status, { "Content-Type": contentType });
  response.end(body);
}

function sendJson(response, status, payload) {
  send(response, status, JSON.stringify(payload), "application/json;charset=utf-8");
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function expandHome(value) {
  if (!value) return "";
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

async function runGit(args) {
  const env = { ...process.env };
  const keyPath = expandHome(sshKey);
  if (keyPath) {
    env.GIT_SSH_COMMAND = `ssh -i ${shellQuote(keyPath)} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
  }
  return execFileAsync("git", args, {
    cwd: siteRoot,
    env,
    maxBuffer: 1024 * 1024
  });
}

async function hasStagedChanges(paths) {
  try {
    await runGit(["diff", "--cached", "--quiet", "--", ...paths]);
    return false;
  } catch (error) {
    if (error.code === 1) return true;
    throw error;
  }
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) throw new Error("发布内容太大。");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
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

function isInsideSiteRoot(target) {
  const relative = path.relative(siteRoot, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function publishNote(request, response, options = {}) {
  const payload = await readJsonBody(request);
  const metadata = normalizeMetadata(payload.metadata);
  const html = String(payload.html || "");
  if (!html.includes("<!DOCTYPE html>") || !html.includes("study-note-source")) {
    throw new Error("发布内容不是有效的学习笔记页面。");
  }
  if (options.dryRun) {
    sendJson(response, 200, {
      message: `发布服务已连接，${metadata.url} 校验通过。`,
      pushEnabled: shouldPush,
      metadata
    });
    return;
  }

  if (shouldPull) {
    await runGit(["pull", "--ff-only", gitRemote, gitBranch]);
  }

  const noteDir = path.join(siteRoot, "study", metadata.subject, metadata.slug);
  const notePath = path.join(noteDir, "index.html");
  await mkdir(noteDir, { recursive: true });
  await writeFile(notePath, html, "utf8");

  const notesPath = path.join(siteRoot, "study", "data", "notes.json");
  let notesData = { notes: [] };
  try {
    notesData = JSON.parse(await readFile(notesPath, "utf8"));
  } catch {
    notesData = { notes: [] };
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

  await writeFile(notesPath, `${JSON.stringify(notesData, null, 2)}\n`, "utf8");
  const publishedFiles = [
    path.relative(siteRoot, notesPath),
    path.relative(siteRoot, notePath)
  ];
  let pushed = false;
  let commit = "";

  if (shouldPush) {
    await runGit(["add", "--", ...publishedFiles]);
    if (await hasStagedChanges(publishedFiles)) {
      await runGit(["commit", "-m", `Publish study note: ${metadata.title}`]);
      const log = await runGit(["rev-parse", "--short", "HEAD"]);
      commit = log.stdout.trim();
    }
    await runGit(["push", gitRemote, gitBranch]);
    pushed = true;
  }

  sendJson(response, 200, {
    message: pushed
      ? `已发布到 ${metadata.url}，并推送到 GitHub。GitHub Pages 通常还要等几十秒到几分钟刷新。`
      : `已发布到 ${metadata.url}，并更新 /study/data/notes.json。`,
    pushed,
    commit,
    metadata
  });
}

async function serveStatic(url, response) {
  const pathname = decodeURIComponent(url.pathname);
  let target = path.normalize(path.join(siteRoot, pathname));
  if (!isInsideSiteRoot(target)) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const info = await stat(target);
    if (info.isDirectory()) target = path.join(target, "index.html");
  } catch {
    if (!path.extname(target)) target = path.join(target, "index.html");
  }

  try {
    const body = await readFile(target);
    const contentType = mimeTypes.get(path.extname(target).toLowerCase()) || "application/octet-stream";
    send(response, 200, body, contentType);
  } catch {
    send(response, 404, "Not found");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  try {
    if (request.method === "GET" && url.pathname === "/__study_publish/status") {
      sendJson(response, 200, {
        service: "study-editor-publish-server",
        pushEnabled: shouldPush,
        pullEnabled: shouldPull,
        remote: gitRemote,
        branch: gitBranch
      });
      return;
    }
    if (request.method === "POST" && url.pathname === "/__study_publish") {
      await publishNote(request, response, { dryRun: url.searchParams.get("dryRun") === "1" });
      return;
    }
    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(url, response);
      return;
    }
    send(response, 405, "Method not allowed");
  } catch (error) {
    send(response, 500, error.message || "Publish failed");
  }
});

server.listen(port, () => {
  console.log(`Study editor server: http://localhost:${port}/study/editor/`);
  console.log(`Publish push: ${shouldPush ? `enabled (${gitRemote}/${gitBranch})` : "disabled"}`);
});
