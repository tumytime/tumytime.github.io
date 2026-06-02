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
        ADD_ATTR: ["data-expression", "data-range", "data-title", "data-snippet"]
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
      const response = await fetch("/study/data/notes.json", { cache: "no-store" });
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
    return `<div class="surface-widget" data-expression="${escapeHtml(expression)}" data-range="${escapeHtml(range)}" data-title="${escapeHtml(title)}"></div>`;
  }

  function calloutWidgetHtml(config, bodyHtml) {
    const type = config.type || "idea";
    const safeType = ["idea", "focus", "warn", "tip"].includes(type) ? type : "idea";
    const title = config.title || (safeType === "warn" ? "注意" : "提示");
    return `<section class="study-widget study-widget--${safeType}"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function theoremWidgetHtml(config, bodyHtml) {
    const title = config.title || "定理";
    return `<section class="study-widget theorem-box"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function proofWidgetHtml(config, bodyHtml) {
    const title = config.title || "证明";
    return `<section class="study-widget proof-box"><h4>${escapeHtml(title)}</h4>${bodyHtml}</section>`;
  }

  function twoColumnWidgetHtml(config, rawBody) {
    const title = config.title || "双栏比较";
    const parts = String(rawBody || "").split("[[column]]");
    const left = renderMarkdownFragment(parts[0] || "左侧内容");
    const right = renderMarkdownFragment(parts.slice(1).join("[[column]]") || "右侧内容");
    return `<section class="study-widget"><h4>${escapeHtml(title)}</h4><div class="two-col-widget"><div class="two-col-widget__pane">${left}</div><div class="two-col-widget__pane">${right}</div></div></section>`;
  }

  function flashcardWidgetHtml(config) {
    const front = config.front || "问题";
    const back = config.back || "答案";
    return `<section class="study-widget flashcard"><h4>复习问答卡</h4><div class="flashcard__face"><strong>Q</strong>${escapeHtml(front)}</div><div class="flashcard__face"><strong>A</strong>${escapeHtml(back)}</div></section>`;
  }

  function imageWidgetHtml(config) {
    const src = config.src || "";
    const caption = config.caption || "图片说明";
    if (!src) {
      return `<section class="study-widget media-card"><h4>图片</h4><p>请填写图片地址，例如 [[image:src=/img/demo.png;caption=说明]]。</p></section>`;
    }
    return `<figure class="study-widget media-card"><img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
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

  function insertAtCursor(textarea, value) {
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const insertion = `${before.endsWith("\n") ? "" : "\n"}${value}${after.startsWith("\n") ? "" : "\n"}`;
    textarea.value = `${before}${insertion}${after}`;
    textarea.focus();
    const position = before.length + insertion.length;
    textarea.setSelectionRange(position, position);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
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

  function fillEditor(metadata, markdown) {
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
    renderEditorPreview();
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
    const response = await fetch(note.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`无法读取 ${note.url}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const sourceNode = doc.querySelector("#study-note-source");
    let metadata = note;
    let markdown = "";

    if (sourceNode?.textContent?.trim()) {
      const payload = JSON.parse(sourceNode.textContent);
      metadata = { ...note, ...(payload.metadata || {}) };
      markdown = payload.markdown || "";
    } else {
      markdown = fallbackMarkdownFromArticle(doc.querySelector(".article"));
    }

    fillEditor(metadata, markdown);
    setStatus(`已载入《${metadata.title || note.title}》。修改后导出 HTML 覆盖原页面即可更新。`);
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
    const textarea = $("#note-markdown");
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selected = textarea.value.slice(start, end);
    const content = selected || "这里写内容";
    const templates = {
      h2: `## ${selected || "小节标题"}`,
      h3: `### ${selected || "三级标题"}`,
      bold: `**${selected || "重点文字"}**`,
      latex: `$$\n${selected || "f(x)=x^2"}\n$$`,
      callout: `[[callout:type=idea;title=提示]]\n${content}\n[[/callout]]`,
      theorem: `[[theorem:title=定理]]\n${content}\n[[/theorem]]`,
      proof: `[[proof:title=证明]]\n${content}\n[[/proof]]`,
      twocol: `[[twocol:title=双栏比较]]\n${selected || "左侧内容"}\n[[column]]\n右侧内容\n[[/twocol]]`
    };
    const value = templates[kind] || content;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = `${before}${value}${after}`;
    textarea.focus();
    textarea.setSelectionRange(before.length, before.length + value.length);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    setStatus(selected ? "已把选区转换成新样式。" : "已插入样式模板。");
  }

  function makeSnippetDraggable(element, getSnippet) {
    element.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", getSnippet());
    });
  }

  function renderEditorPreview() {
    const title = $("#note-title")?.value || "未命名笔记";
    const subjectKey = $("#note-subject")?.value || "math";
    const summary = $("#note-summary")?.value || "这里会显示笔记摘要。";
    const date = $("#note-date")?.value || new Date().toISOString().slice(0, 10);
    const markdown = $("#note-markdown")?.value || "";
    const subject = SUBJECTS[subjectKey] || SUBJECTS.math;
    const preview = $("#editor-preview");
    if (!preview) return "";

    const articleHtml = renderMarkdownToHtml(markdown);
    preview.innerHTML = `
      <article class="reader-card">
        <span class="reader-kicker">${escapeHtml(subject.label)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="reader-lead">${escapeHtml(summary)}</p>
        <p class="reader-date">${formatDate(date)}</p>
        <div class="article">${articleHtml}</div>
      </article>`;

    renderMath(preview);
    renderSurfaces(preview);
    updateMetadataOutput();
    return articleHtml;
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

  function exportHtml() {
    const metadata = updateMetadataOutput();
    const subject = SUBJECTS[metadata.subject] || SUBJECTS.math;
    const markdown = $("#note-markdown")?.value || "";
    const articleHtml = renderMarkdownToHtml(markdown);
    const sourcePayload = jsonForScript({ metadata, markdown });
    const html = `<!DOCTYPE html>
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
          <p>这个页面由 /study/editor/ 导出，支持 LaTeX 公式和 Plotly 3D 曲面。</p>
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

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.slug}-index.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    const status = $("#editor-status");
    if (status) status.textContent = `已导出 ${metadata.slug}-index.html；放到 ${metadata.url} 对应目录即可发布。`;
  }

  function initEditor() {
    const today = new Date().toISOString().slice(0, 10);
    const titleInput = $("#note-title");
    const slugInput = $("#note-slug");
    const dateInput = $("#note-date");
    const markdown = $("#note-markdown");
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

    if (titleInput && slugInput) {
      titleInput.addEventListener("input", () => {
        if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
        renderEditorPreview();
      });
      slugInput.addEventListener("input", () => {
        slugInput.dataset.touched = "true";
        updateMetadataOutput();
      });
    }

    $$("#note-subject, #note-summary, #note-date, #cover-seed, #note-markdown").forEach((element) => {
      element.addEventListener("input", renderEditorPreview);
      element.addEventListener("change", renderEditorPreview);
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

    $("#insert-model")?.addEventListener("click", () => insertAtCursor(markdown, currentShortcode()));
    $("#refresh-preview")?.addEventListener("click", renderEditorPreview);
    $("#export-html")?.addEventListener("click", exportHtml);
    $("#copy-metadata")?.addEventListener("click", async () => {
      const text = $("#metadata-output")?.value || "";
      await navigator.clipboard.writeText(text);
      const status = $("#editor-status");
      if (status) status.textContent = "笔记元数据 JSON 已复制。";
    });

    if (chip && markdown) {
      chip.querySelector("code").textContent = currentShortcode();
      makeSnippetDraggable(chip, currentShortcode);
      markdown.addEventListener("dragover", (event) => event.preventDefault());
      markdown.addEventListener("drop", (event) => {
        event.preventDefault();
        insertAtCursor(markdown, event.dataTransfer.getData("text/plain") || currentShortcode());
      });
    }

    $$(".tool-chip").forEach((tool) => {
      makeSnippetDraggable(tool, () => tool.dataset.snippet || "");
      tool.addEventListener("click", () => insertAtCursor(markdown, tool.dataset.snippet || ""));
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
