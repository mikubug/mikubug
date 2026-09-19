/* ============================================================
   content.js — 内容层
   ------------------------------------------------------------
   成果文档:构建期用 import.meta.glob 扫描 ./repo/ 下的所有 .md,
   由 Vite 编译进包内。
   → 不需要 index.json,不需要任何清单文件,新增文档只要丢进 repo/ 即可。
   → 站点仍是纯静态,运行时零额外请求。

   公告 / 关于:public/ 下的 JSON,运行时 fetch(便于不改代码就能更新)。
   ============================================================ */

import { parseFrontMatter, toPlain } from './md';

/* ---------- 成果文档 ---------- */

const sources = import.meta.glob('/repo/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function toDoc(path, raw) {
  const file = decodeURIComponent(path.split('/').pop());
  const { meta, body } = parseFrontMatter(raw);

  return {
    file,                                    // 文件名,既作路由参数也作标题兜底
    title: meta.title || file.replace(/\.md$/i, ''),
    writer: meta.writer || '',
    date: meta.date || '',
    url: meta.url || '',
    tags: meta.tags || [],
    body,
    excerpt: toPlain(body, 100),             // 列表页展示前 100 字符
  };
}

/** 全部成果文档:按日期倒序,无日期的按标题排 */
export const DOCS = Object.entries(sources)
  .map(([path, raw]) => toDoc(path, raw))
  .sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    if (ta !== tb) return tb - ta;
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  });

/** 全部标签(去重升序),用于筛选条 */
export const ALL_TAGS = [...new Set(DOCS.flatMap((d) => d.tags))].sort();

/** 按文件名查文档 */
export const findDoc = (file) => DOCS.find((d) => d.file === file) || null;

/* ---------- 公告 ---------- */

const asset = (p) => import.meta.env.BASE_URL + p;

/**
 * 读取 public/notice.json
 * 支持数组或 { notices | items: [...] } 两种结构
 */
export async function loadNotices() {
  const res = await fetch(asset('notice.json'), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`notice.json ${res.status}`);
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.notices || data.items || [];

  return list
    .map((n) => ({
      title: n.title || '无标题',
      body: n.body || n.content || '',
      publisher: n.publisher || n.author || '凌云社',
      date: n.date || n.created_at || n.time || '',
      pinned: Boolean(n.pinned),
      tags: Array.isArray(n.tags) ? n.tags : n.tags ? String(n.tags).split(/[/,，]/) : [],
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
}

/* ---------- 关于 / 加入(可选) ---------- */

export async function loadAbout() {
  try {
    const res = await fetch(asset('about.json'), { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
