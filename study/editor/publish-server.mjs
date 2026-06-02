#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const editorDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(editorDir, "../..");
const portArgIndex = process.argv.findIndex((arg) => arg === "--port");
const port = Number(process.env.PORT || (portArgIndex >= 0 ? process.argv[portArgIndex + 1] : "") || 8787);

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
      metadata
    });
    return;
  }

  const noteDir = path.join(siteRoot, "study", metadata.subject, metadata.slug);
  await mkdir(noteDir, { recursive: true });
  await writeFile(path.join(noteDir, "index.html"), html, "utf8");

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
  sendJson(response, 200, {
    message: `已发布到 ${metadata.url}，并更新 /study/data/notes.json。`,
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
});
