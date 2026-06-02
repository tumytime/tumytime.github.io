(function () {
  const SUBJECTS = {
    math: {
      label: "数学",
      eyebrow: "Mathematics",
      accent: "#58e6cf",
      accent2: "#7aa8ff",
      path: "/study/math/",
      description: "分析、代数、几何和那些值得反复咀嚼的定理。"
    },
    control: {
      label: "自动控制原理",
      eyebrow: "Automatic Control",
      accent: "#ffb75e",
      accent2: "#ff6f91",
      path: "/study/control/",
      description: "系统、反馈、稳定性，以及把动态过程驯服的方式。"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  let isSyncingVisualEditor = false;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function sanitizeHtml(html) {
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(html, {
        ADD_ATTR: [
          "data-caption",
          "data-expression",
          "data-range",
          "data-snippet",
          "data-src",
          "data-title",
          "data-type",
          "data-widget"
        ]
      });
    }

    return String(html || "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "");
  }

  function slugify(value) {
    const clean = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return clean || `note-${Date.now()}`;
  }

  function formatDate(value) {
    if (!value) return "未标日期";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  function cacheBustedUrl(value) {
    const url = new URL(value, window.location.origin);
    url.searchParams.set("_", String(Date.now()));
    return url.href;
  }

  function isLocalEditorHost() {
    return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  }

  function hashSeed(value) {
    let hash = 0;
    const text = String(value || "study");
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function coverSvg(note) {
    const subject = SUBJECTS[note.subject] || SUBJECTS.math;
    const seed = hashSeed(`${note.coverSeed || ""}${note.title || ""}`);
    const angle = seed % 360;
    const title = escapeHtml(note.title || "Study Note");
    const label = escapeHtml(subject.label);
    const formula = note.subject === "control" ? "G(s)=Y(s)/R(s)" : "z=f(x,y)";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1" gradientTransform="rotate(${angle})">
            <stop offset="0%" stop-color="${subject.accent}"/>
            <stop offset="55%" stop-color="#121c32"/>
            <stop offset="100%" stop-color="${subject.accent2}"/>
          </linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
        </defs>
        <rect width="900" height="520" fill="url(#g)"/>
        <circle cx="${160 + (seed % 210)}" cy="${100 + (seed % 160)}" r="170" fill="rgba(255,255,255,0.16)" filter="url(#blur)"/>
        <circle cx="${610 + (seed % 120)}" cy="${280 + (seed % 95)}" r="210" fill="rgba(255,255,255,0.12)" filter="url(#blur)"/>
        <g opacity="0.34" stroke="rgba(255,255,255,0.7)" stroke-width="2">
          <path d="M80 400 C180 250 250 460 360 330 S520 220 640 310 760 430 840 260" fill="none"/>
          <path d="M110 120 H260 V250 H410 M410 185 H570 M570 120 V250 H740" fill="none"/>
        </g>
        <text x="58" y="78" fill="rgba(255,255,255,0.78)" font-family="Avenir Next, sans-serif" font-size="26" font-weight="800" letter-spacing="5">${label}</text>
        <text x="58" y="272" fill="white" font-family="Songti SC, Georgia, serif" font-size="58" font-weight="700">${title}</text>
        <text x="58" y="412" fill="rgba(255,255,255,0.76)" font-family="Georgia, serif" font-size="42">${formula}</text>
      </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  async function loadNotes() {
    try {
      const response = await fetch(cacheBustedUrl("/study/data/notes.json"), { cache: "no-store" });
      if (!response.ok) throw new Error(`notes.json ${response.status}`);
      const data = await response.json();
      return Array.isArray(data.notes) ? data.notes : [];
    } catch (error) {
      console.warn("Unable to load notes:", error);
      return [];
    }
  }

  function initParticles() {
    const canvas = $(".study-canvas");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    const particles = [];
    let width = 0;
    let height = 0;
    let animationId = 0;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles.length = 0;
      const count = Math.min(96, Math.max(42, Math.floor(width / 18)));
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          r: 1.2 + Math.random() * 2.4,
          hue: Math.random() > 0.55 ? "88, 230, 207" : "255, 183, 94"
        });
      }
    }

    function tick() {
      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.lineWidth = 1;

      for (let i = 0; i < particles.length; i += 1) {
        const point = particles[i];
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;

        context.beginPath();
        context.fillStyle = `rgba(${point.hue}, 0.72)`;
        context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 118) {
            context.globalAlpha = (118 - dist) / 118;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
            context.globalAlpha = 1;
          }
        }
      }

      animationId = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("pagehide", () => cancelAnimationFrame(animationId));
  }

  function simpleMarkdown(markdown) {
    const escaped = escapeHtml(markdown || "");
    const withCode = escaped.replace(/```([\s\S]*?)```/g, (_match, code) => `<pre><code>${code.trim()}</code></pre>`);
    return withCode
      .split(/\n{2,}/)
      .map((block) => {
        const text = block.trim();
        if (!text) return "";
        if (text.startsWith("<pre>")) return text;
        if (/^###\s+/.test(text)) return `<h3>${text.replace(/^###\s+/, "")}</h3>`;
        if (/^##\s+/.test(text)) return `<h2>${text.replace(/^##\s+/, "")}</h2>`;
        if (/^#\s+/.test(text)) return `<h2>${text.replace(/^#\s+/, "")}</h2>`;
        return `<p>${text.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");
  }

  function parseWidgetConfig(raw) {
    const config = {};
    String(raw || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const index = part.indexOf("=");
        if (index === -1) return;
        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        config[key] = value;
      });
    return config;
  }

  const parseSurfaceConfig = parseWidgetConfig;

  function renderMarkdownFragment(markdown) {
    const parsed = window.marked ? window.marked.parse(markdown || "", { gfm: true, breaks: false }) : simpleMarkdown(markdown || "");
    return sanitizeHtml(parsed);
  }

  function surfaceWidgetHtml(config) {
    const expression = config.function || config.expression || "sin(x)*cos(y)";
    const range = config.range || "-6,6";
    const title = config.title || "交互式 3D 曲面";
    return `<div class="surface-widget" data-widget="surface" data-expression="${escapeHtml(expression)}" data-range="${escapeHtml(range)}" data-title="${escapeHtml(title)}" contenteditable="false"></div>`;
  }

  function calloutWidgetHtml(config, bodyHtml) {
    const type = config.type || "idea";
    const safeType = ["idea", "focus", "warn", "tip"].includes(type) ? type : "idea";
    const title = config.title || (safeType === "warn" ? "注意" : "提示");
    return `<section class="study-widget study-widget--${safeType}" data-widget="callout" data-type="${escapeHtml(safeType)}" data-title="${escapeHtml(title)}"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function theoremWidgetHtml(config, bodyHtml) {
    const title = config.title || "定理";
    return `<section class="study-widget theorem-box" data-widget="theorem" data-title="${escapeHtml(title)}"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function proofWidgetHtml(config, bodyHtml) {
    const title = config.title || "证明";
    return `<section class="study-widget proof-box" data-widget="proof" data-title="${escapeHtml(title)}"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function twoColumnWidgetHtml(config, rawBody) {
    const title = config.title || "双栏比较";
    const parts = String(rawBody || "").split("[[column]]");
    const left = renderMarkdownFragment(parts[0] || "左侧内容");
    const right = renderMarkdownFragment(parts.slice(1).join("[[column]]") || "右侧内容");
    return `<section class="study-widget" data-widget="twocol" data-title="${escapeHtml(title)}"><h4>${escapeHtml(title)}</h4><div class="two-col-widget"><div class="two-col-widget__pane">${left}</div><div class="two-col-widget__pane">${right}</div></div></section>`;
  }

  function flashcardWidgetHtml(config) {
    const front = config.front || "问题";
    const back = config.back || "答案";
    return `<section class="study-widget flashcard" data-widget="flashcard"><h4>复习问答卡</h4><div class="flashcard__face"><strong>Q</strong>${escapeHtml(front)}</div><div class="flashcard__face"><strong>A</strong>${escapeHtml(back)}</div></section>`;
  }

  function imageWidgetHtml(config) {
    const src = config.src || "";
    const caption = config.caption || "图片说明";
    if (!src) {
      return `<section class="study-widget media-card"><h4>图片</h4><p>请填写图片地址，例如 [[image:src=/img/demo.png;caption=说明]]。</p></section>`;
    }
    return `<figure class="study-widget media-card" data-widget="image" data-src="${escapeHtml(src)}" data-caption="${escapeHtml(caption)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  }

  function widgetHtml(widget) {
    if (widget.kind === "surface") return surfaceWidgetHtml(widget.config);
    if (widget.kind === "callout") return calloutWidgetHtml(widget.config, renderMarkdownFragment(widget.body));
    if (widget.kind === "theorem") return theoremWidgetHtml(widget.config, renderMarkdownFragment(widget.body));
    if (widget.kind === "proof") return proofWidgetHtml(widget.config, renderMarkdownFragment(widget.body));
    if (widget.kind === "twocol") return twoColumnWidgetHtml(widget.config, widget.body);
    if (widget.kind === "flashcard") return flashcardWidgetHtml(widget.config);
    if (widget.kind === "image") return imageWidgetHtml(widget.config);
    return "";
  }

  function renderMarkdownToHtml(markdown) {
    const blocks = [];
    let source = String(markdown || "");
    source = source.replace(/\[\[(callout|theorem|proof|twocol):?([^\]]*)\]\]([\s\S]*?)\[\[\/\1\]\]/g, (_match, kind, raw, body) => {
      const token = `WIDGET_BLOCK_${blocks.length}`;
      blocks.push({ token, kind, config: parseWidgetConfig(raw), body });
      return token;
    });
    source = source.replace(/\[\[(surface|flashcard|image):([^\]]+)\]\]/g, (_match, kind, raw) => {
      const token = `WIDGET_BLOCK_${blocks.length}`;
      blocks.push({ token, kind, config: parseWidgetConfig(raw), body: "" });
      return token;
    });

    const parsed = window.marked ? window.marked.parse(source, { gfm: true, breaks: false }) : simpleMarkdown(source);
    let html = sanitizeHtml(parsed);

    blocks.forEach((block) => {
      const widget = widgetHtml(block);
      html = html.replace(`<p>${block.token}</p>`, widget);
      html = html.replace(block.token, widget);
    });

    return html;
  }

  function renderMath(root) {
    if (!window.renderMathInElement || !root) return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  function normalizeExpression(value) {
    let expression = String(value || "").trim();
    expression = expression.replace(/^z\s*=\s*/i, "");
    expression = expression.replace(/\bln\s*\(/gi, "log(");
    expression = expression.replace(/\bpi\b/gi, "PI");
    expression = expression.replace(/\be\b/g, "E");

    if (!/^[0-9A-Za-z_+\-*/^().,\s]+$/.test(expression)) {
      throw new Error("函数里只能使用 x、y、数字、基础运算符和常见 Math 函数。");
    }

    const words = expression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
    const allowed = new Set([
      "x", "y", "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
      "sinh", "cosh", "tanh", "exp", "log", "sqrt", "abs", "pow",
      "min", "max", "floor", "ceil", "round", "PI", "E"
    ]);
    const badWord = words.find((word) => !allowed.has(word));
    if (badWord) {
      throw new Error(`暂不支持函数或变量：${badWord}`);
    }

    return expression.replace(/\^/g, "**");
  }

  function makeEvaluator(expression) {
    const normalized = normalizeExpression(expression);
    return new Function("x", "y", `with (Math) { return ${normalized}; }`);
  }

  function parseRange(value) {
    const parts = String(value || "-6,6").split(",").map((part) => Number(part.trim()));
    const min = Number.isFinite(parts[0]) ? parts[0] : -6;
    const max = Number.isFinite(parts[1]) ? parts[1] : 6;
    return min < max ? [min, max] : [-6, 6];
  }

  function buildSurfaceData(expression, rangeText) {
    const [min, max] = parseRange(rangeText);
    const evaluator = makeEvaluator(expression);
    const steps = 46;
    const xs = [];
    const ys = [];
    const z = [];
    const step = (max - min) / (steps - 1);

    for (let i = 0; i < steps; i += 1) {
      xs.push(Number((min + step * i).toFixed(4)));
      ys.push(Number((min + step * i).toFixed(4)));
    }

    for (let yi = 0; yi < steps; yi += 1) {
      const row = [];
      for (let xi = 0; xi < steps; xi += 1) {
        const value = evaluator(xs[xi], ys[yi]);
        row.push(Number.isFinite(value) ? value : null);
      }
      z.push(row);
    }

    return { x: xs, y: ys, z };
  }

  function renderSurfaceElement(element) {
    if (!element || element.dataset.rendered === "true") return;
    const expression = element.dataset.expression || "sin(x)*cos(y)";
    const range = element.dataset.range || "-6,6";
    const title = element.dataset.title || "交互式 3D 曲面";

    if (!window.Plotly) {
      element.innerHTML = `<div style="padding:24px">Plotly 加载中或未加载，模型暂时无法显示。</div>`;
      return;
    }

    try {
      const data = buildSurfaceData(expression, range);
      window.Plotly.newPlot(
        element,
        [{
          ...data,
          type: "surface",
          colorscale: [
            [0, "#151c2d"],
            [0.28, "#3a6ea5"],
            [0.62, "#58e6cf"],
            [1, "#fff2a6"]
          ],
          contours: {
            z: {
              show: true,
              usecolormap: true,
              highlightcolor: "#ffffff",
              project: { z: true }
            }
          }
        }],
        {
          title: { text: `${title}: z = ${expression}`, font: { size: 16 } },
          autosize: true,
          margin: { l: 0, r: 0, t: 52, b: 0 },
          scene: {
            xaxis: { title: "x", backgroundcolor: "rgba(255,255,255,0.35)" },
            yaxis: { title: "y", backgroundcolor: "rgba(255,255,255,0.35)" },
            zaxis: { title: "z", backgroundcolor: "rgba(255,255,255,0.35)" },
            camera: { eye: { x: 1.45, y: 1.45, z: 1.05 } }
          }
        },
        { responsive: true, displaylogo: false }
      );
      element.dataset.rendered = "true";
    } catch (error) {
      element.innerHTML = `<div style="padding:24px;color:#9f1239">函数解析失败：${escapeHtml(error.message)}</div>`;
    }
  }

  function renderSurfaces(root = document) {
    $$(".surface-widget, .surface-preview", root).forEach(renderSurfaceElement);
  }

  function buildToc() {
    const list = $("[data-toc]");
    const article = $(".article");
    if (!list || !article) return;
    const headings = $$("h2, h3", article);
    list.innerHTML = "";
    headings.forEach((heading, index) => {
      const id = heading.id || `section-${index + 1}`;
      heading.id = id;
      const item = document.createElement("li");
      item.innerHTML = `<a href="#${id}">${escapeHtml(heading.textContent)}</a>`;
      list.appendChild(item);
    });
  }

  function renderNoteCard(note, index) {
    const subject = SUBJECTS[note.subject] || SUBJECTS.math;
    const subjectClass = note.subject === "control" ? "control" : "";
    return `
      <a class="note-card" style="animation-delay:${80 + index * 70}ms" href="${escapeHtml(note.url)}">
        <div class="note-card__cover" style="background-image:url('${coverSvg(note)}')"></div>
        <div class="note-card__body">
          <span class="note-card__subject ${subjectClass}">${escapeHtml(subject.eyebrow)}</span>
          <h3>${escapeHtml(note.title)}</h3>
          <p>${escapeHtml(note.summary)}</p>
          <time>${formatDate(note.date)}</time>
        </div>
      </a>`;
  }

  async function renderHomeStats() {
    const notes = await loadNotes();
    const mathCount = notes.filter((note) => note.subject === "math").length;
    const controlCount = notes.filter((note) => note.subject === "control").length;
    const latest = notes.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];

    const totalNode = $('[data-stat="total"]');
    const mathNode = $('[data-stat="math"]');
    const controlNode = $('[data-stat="control"]');
    const latestNode = $('[data-stat="latest"]');
    if (totalNode) totalNode.textContent = notes.length;
    if (mathNode) mathNode.textContent = mathCount;
    if (controlNode) controlNode.textContent = controlCount;
    if (latestNode) latestNode.textContent = latest ? formatDate(latest.date) : "等待第一篇";
  }

  async function renderCoursePage() {
    const subjectKey = document.body.dataset.subject || "math";
    const subject = SUBJECTS[subjectKey] || SUBJECTS.math;
    const notes = (await loadNotes())
      .filter((note) => note.subject === subjectKey)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const grid = $("[data-notes-grid]");
    const count = $("[data-course-count]");
    const latest = $("[data-course-latest]");

    document.documentElement.style.setProperty("--accent", subject.accent);
    if (count) count.textContent = notes.length;
    if (latest) latest.textContent = notes[0] ? formatDate(notes[0].date) : "等待第一篇";
    if (!grid) return;

    if (!notes.length) {
      grid.innerHTML = `<div class="empty-state">这里还没有笔记。写完第一篇后，把元数据加到 notes.json，它就会出现在这里。</div>`;
      return;
    }

    grid.innerHTML = notes.map(renderNoteCard).join("");
  }

  function currentShortcode() {
    const expression = $("#surface-expression")?.value || "sin(x)*cos(y)";
    const range = $("#surface-range")?.value || "-6,6";
    const title = $("#surface-title")?.value || "交互式 3D 曲面";
    return `[[surface:function=${expression};range=${range};title=${title}]]`;
  }

  function defaultMarkdown() {
    return `## 观察曲面的第一步

二元函数可以写作 $z=f(x,y)$。当我们讨论极限时，其实是在问：

$$
\\lim_{(x,y)\\to(a,b)} f(x,y)=L
$$

[[callout:type=idea;title=今天的直觉]]
如果从不同路径靠近同一点时，函数值都趋向同一个数，极限才有机会存在。
[[/callout]]

## 一个可以拖进笔记的模型

把下面的 3D 曲面拖到正文里，或者点击“插入模型块”。

[[surface:function=sin(x)*cos(y);range=-6,6;title=振荡曲面]]

[[theorem:title=路径观察]]
如果能找到两条路径靠近同一点，却得到不同的函数值趋势，那么该点极限不存在。
[[/theorem]]

[[proof:title=证明思路]]
1. 选择两条容易计算的路径。
2. 分别代入函数。
3. 比较两个路径上的极限值。
[[/proof]]

## 小结

- 曲面的高度对应函数值。
- 旋转模型时，可以观察不同方向靠近同一点时的变化。
- 如果路径不同导致高度趋势不同，极限通常不存在。`;
  }

  function setStatus(message) {
    const status = $("#editor-status");
    if (status) status.textContent = message || "";
  }

  function jsonForScript(data) {
    return JSON.stringify(data, null, 2).replace(/<\/script/gi, "<\\/script");
  }

  function fillEditor(metadata, markdown, html) {
    const titleInput = $("#note-title");
    const slugInput = $("#note-slug");
    if (titleInput) titleInput.value = metadata.title || "未命名笔记";
    if ($("#note-subject")) $("#note-subject").value = metadata.subject || "math";
    if (slugInput) {
      slugInput.value = metadata.slug || slugify(metadata.title || "");
      slugInput.dataset.touched = "true";
    }
    if ($("#note-date")) $("#note-date").value = metadata.date || new Date().toISOString().slice(0, 10);
    if ($("#note-summary")) $("#note-summary").value = metadata.summary || "";
    if ($("#cover-seed")) $("#cover-seed").value = metadata.coverSeed || metadata.slug || slugify(metadata.title || "");
    if ($("#note-markdown")) $("#note-markdown").value = markdown || "";
    loadVisualContent(markdown || "", html || "");
  }

  function newBlankNote() {
    fillEditor({
      title: "新的学习笔记",
      subject: "math",
      summary: "这里写一句话摘要，列表页会显示它。",
      date: new Date().toISOString().slice(0, 10),
      slug: "new-study-note",
      coverSeed: "new-study-note"
    }, defaultMarkdown());
    setStatus("已切换到新笔记模板。");
  }

  function fallbackMarkdownFromArticle(article) {
    if (!article) return "";
    const pieces = [];
    Array.from(article.children).forEach((node) => {
      const tag = node.tagName.toLowerCase();
      const text = node.textContent.trim();
      if (!text) return;
      if (tag === "h2") pieces.push(`## ${text}`);
      else if (tag === "h3") pieces.push(`### ${text}`);
      else if (tag === "ul") {
        pieces.push(Array.from(node.querySelectorAll("li")).map((li) => `- ${li.textContent.trim()}`).join("\n"));
      } else if (tag === "pre") {
        pieces.push(`\`\`\`\n${text}\n\`\`\``);
      } else if (node.classList.contains("surface-widget")) {
        pieces.push(`[[surface:function=${node.dataset.expression || "sin(x)*cos(y)"};range=${node.dataset.range || "-6,6"};title=${node.dataset.title || "交互式 3D 曲面"}]]`);
      } else {
        pieces.push(text);
      }
    });
    return pieces.join("\n\n");
  }

  async function loadPublishedNote(note) {
    const response = await fetch(cacheBustedUrl(note.url), { cache: "no-store" });
    if (!response.ok) throw new Error(`无法读取 ${note.url}`);
    const pageHtml = await response.text();
    const doc = new DOMParser().parseFromString(pageHtml, "text/html");
    const sourceNode = doc.querySelector("#study-note-source");
    let metadata = note;
    let markdown = "";
    let articleHtml = "";

    if (sourceNode?.textContent?.trim()) {
      const payload = JSON.parse(sourceNode.textContent);
      metadata = { ...note, ...(payload.metadata || {}) };
      markdown = payload.markdown || "";
      articleHtml = payload.html || "";
    } else {
      markdown = fallbackMarkdownFromArticle(doc.querySelector(".article"));
    }

    fillEditor(metadata, markdown, articleHtml);
    setStatus(`已载入《${metadata.title || note.title}》。修改后点右侧发布即可更新。`);
  }

  async function populateExistingNotes() {
    const select = $("#existing-note");
    if (!select) return [];
    const notes = await loadNotes();
    select.innerHTML = notes.length
      ? notes.map((note) => `<option value="${escapeHtml(note.url)}">${escapeHtml((SUBJECTS[note.subject] || SUBJECTS.math).label)} / ${escapeHtml(note.title)}</option>`).join("")
      : `<option value="">还没有可载入的笔记</option>`;
    window.__studyNotes = notes;
    return notes;
  }

  function applyFormat(kind) {
    const context = selectionInsideVisual();
    const selected = selectedVisualText();
    const content = selected || "这里写内容";
    if (kind === "h2" || kind === "h3") {
      if (context && selected) {
        context.visual.focus();
        document.execCommand("formatBlock", false, `<${kind}>`);
        syncMarkdownFromVisual();
      } else {
        insertHtmlIntoVisual(`<${kind}>${kind === "h2" ? "小节标题" : "三级标题"}</${kind}>`);
      }
      setStatus(selected ? "已把选区设为标题。" : "已插入标题。");
      return;
    }

    if (kind === "bold") {
      if (context && selected) {
        context.visual.focus();
        document.execCommand("bold", false);
        syncMarkdownFromVisual();
      } else {
        insertHtmlIntoVisual("<p><strong>重点文字</strong></p>");
      }
      setStatus(selected ? "已加粗选中文字。" : "已插入加粗文字。");
      return;
    }

    const templates = {
      latex: `$$\n${selected || "f(x)=x^2"}\n$$`,
      callout: `[[callout:type=idea;title=提示]]\n${content}\n[[/callout]]`,
      theorem: `[[theorem:title=定理]]\n${content}\n[[/theorem]]`,
      proof: `[[proof:title=证明]]\n${content}\n[[/proof]]`,
      twocol: `[[twocol:title=双栏比较]]\n${selected || "左侧内容"}\n[[column]]\n右侧内容\n[[/twocol]]`
    };
    if (!context && !$("#visual-editor")) return;
    insertVisualSnippet(templates[kind] || content);
    setStatus(selected ? "已把纸张选区转换成新样式。" : "已在纸张中插入样式模板。");
  }

  function makeSnippetDraggable(element, getSnippet) {
    element.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", getSnippet());
    });
  }

  function textFromNode(node) {
    return (node?.textContent || "").replace(/\u00a0/g, " ").trim();
  }

  function markdownFromChildren(root, options = {}) {
    return Array.from(root?.childNodes || [])
      .map((node) => markdownFromNode(node, options))
      .filter(Boolean)
      .join("\n\n");
  }

  function markdownFromWidget(node) {
    const widget = node.dataset.widget;
    if (widget === "surface") {
      return `[[surface:function=${node.dataset.expression || "sin(x)*cos(y)"};range=${node.dataset.range || "-6,6"};title=${node.dataset.title || "交互式 3D 曲面"}]]`;
    }
    if (widget === "callout") {
      return `[[callout:type=${node.dataset.type || "idea"};title=${textFromNode($("h4", node)) || node.dataset.title || "提示"}]]\n${markdownFromChildrenWithoutHeading(node)}\n[[/callout]]`;
    }
    if (widget === "theorem") {
      return `[[theorem:title=${textFromNode($("h4", node)) || node.dataset.title || "定理"}]]\n${markdownFromChildrenWithoutHeading(node)}\n[[/theorem]]`;
    }
    if (widget === "proof") {
      return `[[proof:title=${textFromNode($("h4", node)) || node.dataset.title || "证明"}]]\n${markdownFromChildrenWithoutHeading(node)}\n[[/proof]]`;
    }
    if (widget === "twocol") {
      const panes = $$(".two-col-widget__pane", node);
      const left = markdownFromChildren(panes[0]);
      const right = markdownFromChildren(panes[1]);
      return `[[twocol:title=${textFromNode($("h4", node)) || node.dataset.title || "双栏比较"}]]\n${left || "左侧内容"}\n[[column]]\n${right || "右侧内容"}\n[[/twocol]]`;
    }
    if (widget === "flashcard") {
      const faces = $$(".flashcard__face", node).map((face) => textFromNode(face).replace(/^[QA]\s*/, ""));
      return `[[flashcard:front=${faces[0] || "问题"};back=${faces[1] || "答案"}]]`;
    }
    if (widget === "image") {
      const src = node.dataset.src || $("img", node)?.getAttribute("src") || "";
      const caption = textFromNode($("figcaption", node)) || node.dataset.caption || "图片说明";
      return `[[image:src=${src};caption=${caption}]]`;
    }
    return "";
  }

  function markdownFromChildrenWithoutHeading(node) {
    const clone = node.cloneNode(true);
    const heading = $("h4", clone);
    if (heading) heading.remove();
    return markdownFromChildren(clone) || textFromNode(clone);
  }

  function markdownFromNode(node) {
    if (!node) return "";
    if (node.nodeType === 3) return textFromNode(node);
    if (node.dataset?.widget) return markdownFromWidget(node);
    if (node.classList?.contains("surface-widget")) return markdownFromWidget(node);

    const tag = node.tagName?.toLowerCase();
    if (tag === "br") return "";
    const text = textFromNode(node);
    if (!text && tag !== "img") return "";
    if (tag === "h1") return `# ${text}`;
    if (tag === "h2") return `## ${text}`;
    if (tag === "h3") return `### ${text}`;
    if (tag === "h4") return "";
    if (tag === "ul") return Array.from(node.querySelectorAll(":scope > li")).map((li) => `- ${textFromNode(li)}`).join("\n");
    if (tag === "ol") return Array.from(node.querySelectorAll(":scope > li")).map((li, index) => `${index + 1}. ${textFromNode(li)}`).join("\n");
    if (tag === "pre") return `\`\`\`\n${text}\n\`\`\``;
    if (tag === "blockquote") return text.split("\n").map((line) => `> ${line}`).join("\n");
    if (tag === "img") return `[[image:src=${node.getAttribute("src") || ""};caption=${node.getAttribute("alt") || "图片说明"}]]`;
    return text;
  }

  function stripEditorArtifacts(root) {
    if (!root) return;
    $$("[contenteditable]", root).forEach((node) => {
      node.removeAttribute("contenteditable");
    });
    $$("[data-rendered]", root).forEach((node) => {
      node.removeAttribute("data-rendered");
    });
    $$(".surface-widget", root).forEach((node) => {
      node.classList.remove("js-plotly-plot");
      node.removeAttribute("style");
      node.innerHTML = "";
    });
  }

  function articleHtmlFromVisual() {
    const visual = $("#visual-editor");
    if (!visual) return "";
    const clone = visual.cloneNode(true);
    stripEditorArtifacts(clone);
    return sanitizeHtml(clone.innerHTML.trim());
  }

  function prepareVisualForEditing(root) {
    $$(".surface-widget", root).forEach((node) => {
      node.setAttribute("contenteditable", "false");
    });
  }

  function loadVisualContent(markdown, html) {
    const visual = $("#visual-editor");
    if (!visual) return;
    isSyncingVisualEditor = true;
    visual.innerHTML = sanitizeHtml(html || renderMarkdownToHtml(markdown || ""));
    prepareVisualForEditing(visual);
    renderSurfaces(visual);
    isSyncingVisualEditor = false;
    syncMarkdownFromVisual();
    updateMetadataOutput();
  }

  function syncMarkdownFromVisual() {
    const visual = $("#visual-editor");
    const source = $("#note-markdown");
    if (!visual || !source || isSyncingVisualEditor) return;
    source.value = markdownFromChildren(visual);
    updateMetadataOutput();
  }

  function syncVisualFromMarkdown() {
    const visual = $("#visual-editor");
    const markdown = $("#note-markdown")?.value || "";
    if (!visual) return;
    isSyncingVisualEditor = true;
    visual.innerHTML = renderMarkdownToHtml(markdown);
    renderSurfaces(visual);
    isSyncingVisualEditor = false;
    updateMetadataOutput();
  }

  function selectionInsideVisual() {
    const visual = $("#visual-editor");
    const selection = window.getSelection();
    if (!visual || !selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!visual.contains(range.commonAncestorContainer)) return null;
    return { visual, selection, range };
  }

  function rangeAfterCurrentBlock(context) {
    if (!context) return null;
    const element = nodeElement(context.range.commonAncestorContainer);
    const block = element?.closest?.("p, h1, h2, h3, h4, li, blockquote, pre");
    if (!block || !context.visual.contains(block)) return null;
    const range = document.createRange();
    range.setStartAfter(block);
    range.collapse(true);
    return range;
  }

  function insertHtmlIntoVisual(html, options = {}) {
    const context = selectionInsideVisual();
    const visual = $("#visual-editor");
    if (!visual) return;
    visual.focus();
    const range = (options.afterCurrentBlock ? rangeAfterCurrentBlock(context) : null) || context?.range || document.createRange();
    if (!context) {
      range.selectNodeContents(visual);
      range.collapse(false);
    }
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    prepareVisualForEditing(visual);
    renderSurfaces(visual);
    syncMarkdownFromVisual();
  }

  function insertVisualSnippet(snippet, options = {}) {
    insertHtmlIntoVisual(renderMarkdownToHtml(snippet), options);
  }

  function selectedVisualText() {
    const context = selectionInsideVisual();
    return context ? context.selection.toString().trim() : "";
  }

  function nodeElement(node) {
    return node?.nodeType === 1 ? node : node?.parentElement;
  }

  function blockInsideWidget(element, widget) {
    const blockTags = new Set(["P", "LI", "DIV", "BLOCKQUOTE", "PRE", "H2", "H3"]);
    let node = element;
    while (node && node !== widget) {
      if (blockTags.has(node.tagName)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function isBlankEditableBlock(node) {
    if (!node) return false;
    if (node.querySelector?.("img, .surface-widget, .study-widget")) return false;
    return textFromNode(node) === "";
  }

  function isCaretAtBlockEnd(range, block) {
    if (!range || !block?.contains(range.startContainer)) return false;
    const tail = range.cloneRange();
    tail.selectNodeContents(block);
    tail.setStart(range.startContainer, range.startOffset);
    return tail.toString().trim() === "";
  }

  function isLastTextBlockInWidget(block, widget) {
    if (!block || !widget) return false;
    const blocks = $$("p, li, blockquote, pre", widget)
      .filter((node) => textFromNode(node) || node === block);
    return blocks[blocks.length - 1] === block;
  }

  function placeCaretInside(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertParagraphAfterWidget(widget) {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    widget.insertAdjacentElement("afterend", paragraph);
    placeCaretInside(paragraph);
  }

  function handleVisualEnter(event) {
    if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const context = selectionInsideVisual();
    if (!context || !context.range.collapsed) return;

    const element = nodeElement(context.range.startContainer);
    const widget = element?.closest?.(".study-widget");
    if (!widget || !context.visual.contains(widget)) return;

    const block = blockInsideWidget(element, widget);
    const exitsAtBlockEnd = ["callout", "theorem"].includes(widget.dataset.widget || "") &&
      isLastTextBlockInWidget(block, widget) &&
      isCaretAtBlockEnd(context.range, block);
    if (!isBlankEditableBlock(block) && !exitsAtBlockEnd) return;

    event.preventDefault();
    if (isBlankEditableBlock(block)) block.remove();
    context.visual.focus();
    insertParagraphAfterWidget(widget);
    syncMarkdownFromVisual();
    setStatus("已跳出卡片，可以继续写下一段。");
  }

  function closeRenderPreview() {
    const modal = $("#render-preview-modal");
    const content = $("#render-preview-content");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (content) content.innerHTML = "";
    $("#visual-editor")?.focus();
  }

  function openRenderPreview() {
    const payload = buildPublishPayload();
    const modal = $("#render-preview-modal");
    const content = $("#render-preview-content");
    if (!modal || !content) return;

    const subject = SUBJECTS[payload.metadata.subject] || SUBJECTS.math;
    content.innerHTML = `
      <article class="reader-card">
        <span class="reader-kicker">${escapeHtml(subject.label)}</span>
        <h1>${escapeHtml(payload.metadata.title)}</h1>
        <p class="reader-lead">${escapeHtml(payload.metadata.summary)}</p>
        <p class="reader-date">${formatDate(payload.metadata.date)}</p>
        <div class="article">${payload.articleHtml}</div>
      </article>`;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    renderMath(content);
    renderSurfaces(content);
    $("#close-render-preview")?.focus();
    setStatus("已打开渲染预览。");
  }

  function renderEditorPreview() {
    const markdown = $("#note-markdown")?.value || "";
    loadVisualContent(markdown, "");
    return articleHtmlFromVisual();
  }

  function updateMetadataOutput() {
    const title = $("#note-title")?.value || "未命名笔记";
    const subject = $("#note-subject")?.value || "math";
    const slug = slugify($("#note-slug")?.value || title);
    const metadata = {
      title,
      subject,
      summary: $("#note-summary")?.value || "",
      date: $("#note-date")?.value || new Date().toISOString().slice(0, 10),
      slug,
      coverSeed: $("#cover-seed")?.value || slug,
      url: `/study/${subject}/${slug}/`
    };
    const box = $("#metadata-output");
    if (box) box.value = JSON.stringify(metadata, null, 2);
    return metadata;
  }

  function buildNoteHtml(metadata, articleHtml, markdown) {
    const subject = SUBJECTS[metadata.subject] || SUBJECTS.math;
    const sourcePayload = jsonForScript({ metadata, markdown, html: articleHtml });
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata.title)} | ${escapeHtml(subject.label)} | Tumy Study</title>
  <meta name="description" content="${escapeHtml(metadata.summary)}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="/study/assets/study.css">
</head>
<body class="study-reader" data-page="note">
  <canvas class="study-canvas" aria-hidden="true"></canvas>
  <main class="study-shell">
    <nav class="study-nav" aria-label="页面导航">
      <a class="study-brand" href="/study/"><span class="study-brand__mark">S</span><span>Tumy Study</span></a>
      <div class="study-nav__links">
        <a class="study-pill" href="/study/${metadata.subject}/">返回${escapeHtml(subject.label)}</a>
        <a class="study-pill" href="/study/">学习主页</a>
      </div>
    </nav>
    <section class="reader-wrap">
      <article class="reader-card">
        <span class="reader-kicker">${escapeHtml(subject.label)}</span>
        <h1>${escapeHtml(metadata.title)}</h1>
        <p class="reader-lead">${escapeHtml(metadata.summary)}</p>
        <p class="reader-date">${formatDate(metadata.date)}</p>
        <div class="article">${articleHtml}</div>
      </article>
      <aside class="reader-aside">
        <div class="reader-card">
          <strong>目录</strong>
          <ul class="toc-list" data-toc></ul>
        </div>
        <div class="reader-card">
          <strong>说明</strong>
          <p>这个页面由 /study/editor/ 发布，支持 LaTeX 公式和 Plotly 3D 曲面。</p>
        </div>
      </aside>
    </section>
  </main>
  <script type="application/json" id="study-note-source">${sourcePayload}</script>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script src="/study/assets/study.js"></script>
</body>
</html>`;
  }

  function buildPublishPayload() {
    syncMarkdownFromVisual();
    const metadata = updateMetadataOutput();
    const markdown = $("#note-markdown")?.value || "";
    const articleHtml = articleHtmlFromVisual() || renderMarkdownToHtml(markdown);
    const html = buildNoteHtml(metadata, articleHtml, markdown);
    return { metadata, markdown, articleHtml, html };
  }

  function downloadHtmlPayload(payload) {
    const blob = new Blob([payload.html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${payload.metadata.slug}-index.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function downloadHtml() {
    const payload = buildPublishPayload();
    downloadHtmlPayload(payload);
    setStatus(`已下载 ${payload.metadata.slug}-index.html。`);
  }

  async function publishNote() {
    const payload = buildPublishPayload();
    try {
      const response = await fetch("/__study_publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `发布服务返回 ${response.status}`);
      }
      const result = await response.json().catch(() => ({}));
      setStatus(result.message || `已发布到 ${payload.metadata.url}`);
      await populateExistingNotes();
    } catch (error) {
      downloadHtmlPayload(payload);
      setStatus(isLocalEditorHost()
        ? `没有连接本地发布服务，已改为下载 HTML：${payload.metadata.slug}-index.html。`
        : `线上发布服务还没接入，浏览器不能直接写 GitHub；已改为下载 HTML：${payload.metadata.slug}-index.html。`);
    }
  }

  async function refreshPublishServiceStatus() {
    try {
      const response = await fetch(cacheBustedUrl("/__study_publish/status"), { cache: "no-store" });
      if (!response.ok) return;
      const status = await response.json();
      setStatus(status.pushEnabled ? "发布服务已连接：发布后会自动推送到 GitHub。" : "发布服务已连接：发布后会更新本地文件。");
    } catch {
      if (!isLocalEditorHost()) {
        setStatus("当前是线上静态编辑器：可读取线上笔记；直接发布还需要接入云端发布服务。");
      }
    }
  }

  function exportHtml() {
    downloadHtml();
  }

  function initEditor() {
    const today = new Date().toISOString().slice(0, 10);
    const titleInput = $("#note-title");
    const slugInput = $("#note-slug");
    const dateInput = $("#note-date");
    const markdown = $("#note-markdown");
    const visual = $("#visual-editor");
    const chip = $("#model-chip");

    if (dateInput && !dateInput.value) dateInput.value = today;
    if (titleInput && !titleInput.value) titleInput.value = "曲面、极限与直观图像";
    if (slugInput && !slugInput.value) slugInput.value = "limit-surface";
    if ($("#note-summary") && !$("#note-summary").value) {
      $("#note-summary").value = "用一个可旋转的曲面，把二元函数的局部形状和极限直观联系起来。";
    }
    if ($("#cover-seed") && !$("#cover-seed").value) $("#cover-seed").value = "limit-surface";
    if (markdown && !markdown.value.trim()) {
      markdown.value = defaultMarkdown();
    }
    if (visual) {
      document.execCommand("defaultParagraphSeparator", false, "p");
    }

    if (titleInput && slugInput) {
      titleInput.addEventListener("input", () => {
        if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
        updateMetadataOutput();
      });
      slugInput.addEventListener("input", () => {
        slugInput.dataset.touched = "true";
        updateMetadataOutput();
      });
    }

    $$("#note-subject, #note-summary, #note-date, #cover-seed").forEach((element) => {
      element.addEventListener("input", updateMetadataOutput);
      element.addEventListener("change", updateMetadataOutput);
    });
    markdown?.addEventListener("input", syncVisualFromMarkdown);
    markdown?.addEventListener("change", syncVisualFromMarkdown);
    visual?.addEventListener("keydown", handleVisualEnter);
    visual?.addEventListener("input", syncMarkdownFromVisual);
    visual?.addEventListener("blur", syncMarkdownFromVisual);
    visual?.addEventListener("dragover", (event) => event.preventDefault());
    visual?.addEventListener("drop", (event) => {
      event.preventDefault();
      insertVisualSnippet(event.dataTransfer.getData("text/plain") || "");
    });

    $$("#surface-expression, #surface-range, #surface-title").forEach((element) => {
      element.addEventListener("input", () => {
        if (chip) chip.querySelector("code").textContent = currentShortcode();
        const preview = $("#model-preview");
        if (preview) {
          preview.dataset.expression = $("#surface-expression")?.value || "sin(x)*cos(y)";
          preview.dataset.range = $("#surface-range")?.value || "-6,6";
          preview.dataset.title = $("#surface-title")?.value || "交互式 3D 曲面";
          preview.dataset.rendered = "false";
          renderSurfaceElement(preview);
        }
      });
    });

    populateExistingNotes();
    refreshPublishServiceStatus();
    $("#load-existing")?.addEventListener("click", async () => {
      const selectedUrl = $("#existing-note")?.value || "";
      const note = (window.__studyNotes || []).find((item) => item.url === selectedUrl);
      if (!note) {
        setStatus("请先选择一篇已发布笔记。");
        return;
      }
      try {
        setStatus("正在载入已发布笔记...");
        await loadPublishedNote(note);
      } catch (error) {
        setStatus(`载入失败：${error.message}`);
      }
    });
    $("#new-note")?.addEventListener("click", newBlankNote);

    $("#insert-model")?.addEventListener("click", () => insertVisualSnippet(currentShortcode(), { afterCurrentBlock: true }));
    $("#render-preview")?.addEventListener("click", openRenderPreview);
    $("#close-render-preview")?.addEventListener("click", closeRenderPreview);
    $$("[data-close-render-preview]").forEach((element) => {
      element.addEventListener("click", closeRenderPreview);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#render-preview-modal")?.hidden) closeRenderPreview();
    });
    $("#publish-note")?.addEventListener("click", publishNote);
    $("#download-html")?.addEventListener("click", downloadHtml);
    $("#export-html")?.addEventListener("click", exportHtml);
    $("#copy-metadata")?.addEventListener("click", async () => {
      const text = $("#metadata-output")?.value || "";
      await navigator.clipboard.writeText(text);
      const status = $("#editor-status");
      if (status) status.textContent = "笔记元数据 JSON 已复制。";
    });

    if (chip) {
      chip.querySelector("code").textContent = currentShortcode();
      makeSnippetDraggable(chip, currentShortcode);
    }

    $$(".tool-chip").forEach((tool) => {
      makeSnippetDraggable(tool, () => tool.dataset.snippet || "");
      tool.addEventListener("click", () => insertVisualSnippet(tool.dataset.snippet || "", { afterCurrentBlock: true }));
    });
    $$(".format-toolbar [data-format]").forEach((button) => {
      button.addEventListener("click", () => applyFormat(button.dataset.format));
    });

    const modelPreview = $("#model-preview");
    if (modelPreview) {
      modelPreview.dataset.expression = $("#surface-expression")?.value || "sin(x)*cos(y)";
      modelPreview.dataset.range = $("#surface-range")?.value || "-6,6";
      modelPreview.dataset.title = $("#surface-title")?.value || "交互式 3D 曲面";
    }

    renderEditorPreview();
    renderSurfaces();
  }

  function initNotePage() {
    renderMath(document.body);
    renderSurfaces();
    buildToc();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    const page = document.body.dataset.page;
    if (page === "home") renderHomeStats();
    if (page === "course") renderCoursePage();
    if (page === "editor") initEditor();
    if (page === "note") initNotePage();
  });
})();
