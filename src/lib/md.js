/* md.js — 轻量 Markdown 渲染 + Front-matter 解析（零依赖，输出前先转义 HTML） */

/* 1. HTML 转义：所有文本先转义，再做行内标记 */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* 2. 解析 front-matter
   两种写法：单行 `writer:xxx;tags=a/b;url=x`，或 `---` 包起来的 YAML 块 */
export function parseFrontMatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const meta = {};
  let body = text;

  // A. YAML 风格 --- ... --- 块
  const fence = text.match(/^\s*---\s*\n([\s\S]*?)\n\s*---\s*\n?/);
  if (fence) {
    fence[1].split('\n').forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][\w-]*)\s*[:=]\s*(.*)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, '');
    });
    body = text.slice(fence[0].length);
  } else {
    // B. 单行 key:val;key=val 形式(仅取首个非空行)
    const nl = text.indexOf('\n');
    const first = (nl === -1 ? text : text.slice(0, nl)).trim();
    // 必须形如 key:value / key=value 且不含 Markdown 标记,才判定为 meta 行
    if (first && !/^[#>\-*`|]/.test(first) && /^[A-Za-z_][\w-]*\s*[:=]/.test(first)) {
      first.split(';').forEach((pair) => {
        const m = pair.match(/^\s*([A-Za-z_][\w-]*)\s*[:=]\s*(.*)$/);
        if (m) meta[m[1].toLowerCase()] = m[2].trim();
      });
      body = nl === -1 ? '' : text.slice(nl + 1);
    }
  }

  // 归一化 tags:支持 "a/b/c"、"a,b,c"、"a b c"
  if (meta.tags) {
    meta.tags = meta.tags
      .split(/[\/,，、|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  } else {
    meta.tags = [];
  }

  return { meta, body };
}

/* 3. 行内标记 */
function inline(src) {
  let out = esc(src);

  // 行内代码 `code`
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000C${codes.length - 1}\u0000`;
  });

  // 图片 ![alt](url) — 先于链接
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt, src2, title) =>
      `<img src="${src2}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy" />`);

  // 链接 [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, txt, href, title) => {
      const ext = /^https?:\/\//i.test(href);
      return `<a href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}` +
             `${title ? ` title="${title}"` : ''}>${txt}</a>`;
    });

  // 粗体 / 斜体 / 删除线
  out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // 高亮 ==text==
  out = out.replace(/==([^=]+)==/g, '<mark>$1</mark>');

  // 自动链接裸 URL
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,
    (_, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);

  // 还原 code
  out = out.replace(/\u0000C(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);

  return out;
}

/* 4. 块级渲染 */
export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const isBlank = (s) => !s || !s.trim();

  while (i < lines.length) {
    const line = lines[i];

    // 空行
    if (isBlank(line)) { i++; continue; }

    // 围栏代码块 ```lang
    const fence = line.match(/^\s*(`{3,}|~{3,})\s*([\w+#-]*)\s*$/);
    if (fence) {
      const marker = fence[1][0];
      const lang = fence[2] || '';
      const buf = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${marker}{3,}\\s*$`).test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      i++; // 跳过闭合围栏
      const cls = lang ? ` class="lang-${esc(lang)}"` : '';
      out.push(`<pre${cls}><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // 标题 # ~ ######
    const h = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (h) {
      const lv = h[1].length;
      out.push(`<h${lv}>${inline(h[2].trim())}</h${lv}>`);
      i++; continue;
    }

    // 分隔线
    if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
      out.push('<hr />'); i++; continue;
    }

    // 引用 >
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, '')); i++;
      }
      out.push(`<blockquote>${renderMarkdown(buf.join('\n'))}</blockquote>`);
      continue;
    }

    // 表格:| a | b |   +   | --- | --- |
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length &&
        /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(cells(lines[i])); i++;
      }
      const th = head.map((c) => `<th>${inline(c)}</th>`).join('');
      const tb = rows.map((r) =>
        `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
      out.push(`<div class="md-table"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`);
      continue;
    }

    // 任务列表 / 无序列表 / 有序列表
    const bullet = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      const ordered = /\d/.test(bullet[2]);
      const tag = ordered ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (!m) break;
        if (/\d/.test(m[2]) !== ordered) break;
        let content = m[3];
        // 任务列表语法 - [ ] / - [x]
        const task = content.match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          content = `<input type="checkbox" disabled${/[xX]/.test(task[1]) ? ' checked' : ''} /> ${task[2]}`;
          items.push(`<li class="task">${inline(content).replace(/&lt;input/, '<input').replace(/\/&gt;/, ' />')}</li>`);
        } else {
          items.push(`<li>${inline(content)}</li>`);
        }
        i++;
      }
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    // 段落:合并到空行或下一个块级标记为止
    const buf = [line];
    i++;
    while (i < lines.length && !isBlank(lines[i]) &&
           !/^\s*(#{1,6}\s|>|`{3,}|~{3,})/.test(lines[i]) &&
           !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) &&
           !/^\s*\|.*\|\s*$/.test(lines[i]) &&
           !/^\s*([-*_])\s*(\1\s*){2,}$/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join('\n'))}</p>`);
  }

  return out.join('\n');
}

/* 5. 提取纯文本(用于列表摘要) */
export function toPlain(src, limit = 100) {
  const t = String(src)
    .replace(/```[\s\S]*?```/g, ' ')          // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // 链接保留文字
    .replace(/^\s*#{1,6}\s+/gm, '')            // 标题符号
    .replace(/^\s*>\s?/gm, '')                 // 引用符号
    .replace(/^\s*([-*+]|\d+[.)])\s+/gm, '')   // 列表符号
    .replace(/^\s*\|.*\|\s*$/gm, ' ')          // 表格
    .replace(/^\s*([-*_])\s*(\1\s*){2,}$/gm, ' ') // 分隔线
    .replace(/[*_~`=]/g, '')                   // 强调标记
    .replace(/\s+/g, ' ')
    .trim();

  if (t.length <= limit) return t;
  return t.slice(0, limit).trimEnd() + '…';
}
