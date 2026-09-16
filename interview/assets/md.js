// ============================================================
// md.js —— 极简 Markdown → HTML 渲染器（为 Obsidian 笔记定制）
// 支持：标题 / 粗斜体 / 行内代码 / 代码块 / 列表 / 引用与 callout
//       表格 / 分隔线 / 外链 / [[双链]] / ![图]
// ============================================================
window.MD = (function () {
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---- 行内 ----
  function inline(s) {
    let t = esc(s);

    // 行内代码先抽出来（避免内部被其它规则破坏）
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => {
      codes.push(c);
      return "\u0000C" + (codes.length - 1) + "\u0000";
    });

    // 图片 ![alt](url)
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
    // 外链 [text](url)
    t = t.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    // 双链 [[目标|别名]] / [[目标#锚点]]
    t = t.replace(/\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g, (_, tgt, anchor, alias) => {
      const name = (alias || tgt).trim();
      const target = tgt.trim();
      return `<a class="wl" data-note="${esc(target)}" data-anchor="${esc(anchor || "")}">${esc(name)}</a>`;
    });
    // 粗体 / 斜体 / 删除线
    t = t.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    // 高亮 ==x==
    t = t.replace(/==([^=]+)==/g, '<mark>$1</mark>');

    // 还原行内代码
    t = t.replace(/\u0000C(\d+)\u0000/g, (_, i) => "<code>" + esc(codes[+i]) + "</code>");
    return t;
  }

  const CALLOUT_ICON = {
    note: "📝", info: "ℹ️", tip: "💡", important: "❗", warning: "⚠️",
    quote: "❝", danger: "🔥", success: "✅", question: "❓", example: "🧪",
  };

  function render(src) {
    const lines = String(src || "").replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 代码块（支持 ``` 与 ~~~ 两种围栏）
      const fence = line.match(/^\s*(?:```|~~~)(\w*)/);
      if (fence) {
        const lang = fence[1] || "";
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*(?:```|~~~)/.test(lines[i])) buf.push(lines[i++]);
        i++; // 跳过结束 fence
        out.push(
          `<pre class="code"${lang ? ` data-lang="${esc(lang)}"` : ""}><code>${esc(buf.join("\n"))}</code></pre>`
        );
        continue;
      }
      // 标题
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        const lv = Math.min(h[1].length + 1, 6); // h1 -> h2（页面已有 h1）
        out.push(`<h${lv}>${inline(h[2])}</h${lv}>`);
        i++;
        continue;
      }

      // 分隔线
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        out.push("<hr>");
        i++;
        continue;
      }

      // 表格
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        const cells = (r) =>
          r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        const head = cells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push(
          '<div class="tw"><table><thead><tr>' +
            head.map((c) => `<th>${inline(c)}</th>`).join("") +
            "</tr></thead><tbody>" +
            rows.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
            "</tbody></table></div>"
        );
        continue;
      }

      // 引用 / callout
      if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
        const head = (buf[0] || "").match(/^\[!(\w+)\]\s*(.*)$/);
        if (head) {
          const kind = head[1].toLowerCase();
          const title = head[2] || kind;
          const icon = CALLOUT_ICON[kind] || "📌";
          const body = render(buf.slice(1).join("\n"));
          out.push(
            `<div class="callout ${esc(kind)}"><div class="co-head">${icon} ${inline(title)}</div><div class="co-body">${body}</div></div>`
          );
        } else {
          out.push(`<blockquote>${render(buf.join("\n"))}</blockquote>`);
        }
        continue;
      }

      // 有序 / 无序列表
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        const ordered = /^\s*\d+\.\s+/.test(line);
        const items = [];
        while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
          let text = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
          // 任务清单
          const task = text.match(/^\[([ xX])\]\s+(.*)$/);
          i++;
          // 续行（缩进的非列表行）
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
            text += " " + lines[i].trim();
            i++;
          }
          if (task) {
            const done = task[1].toLowerCase() === "x";
            items.push(`<li class="task${done ? " done" : ""}">${done ? "☑" : "☐"} ${inline(task[2])}</li>`);
          } else {
            items.push(`<li>${inline(text)}</li>`);
          }
        }
        out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
        continue;
      }

      // 空行
      if (!line.trim()) {
        i++;
        continue;
      }

      // 段落
      const buf = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^\s*(#{1,6}\s|>|```|~~~|\||([-*+]|\d+\.)\s)/.test(lines[i]) &&
        !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
      ) {
        buf.push(lines[i++]);
      }
      if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`);
      else i++;
    }

    return out.join("\n");
  }

  return { render, inline, esc };
})();
