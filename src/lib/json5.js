/* json5.js — 解析 public/*.json5
   JSON5 本身支持注释 / 无引号键名 / 尾随逗号，这里再加一条扩展：
   字符串里可以直接换行（解析前折成 \n），长正文不用手敲转义。 */

import JSON5 from 'json5';

/** 把字符串字面量里的裸换行折成 \n 转义；注释原样保留 */

function foldLiteralNewlines(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let quote = ''; // 当前所处字符串的引号；空串表示不在字符串里

  while (i < n) {
    const c = src[i];

    if (!quote) {
      // 行注释
      if (c === '/' && src[i + 1] === '/') {
        const end = src.indexOf('\n', i);
        const stop = end === -1 ? n : end;
        out += src.slice(i, stop);
        i = stop;
        continue;
      }
      // 块注释
      if (c === '/' && src[i + 1] === '*') {
        const end = src.indexOf('*/', i + 2);
        const stop = end === -1 ? n : end + 2;
        out += src.slice(i, stop);
        i = stop;
        continue;
      }
      if (c === '"' || c === "'") quote = c;
      out += c;
      i += 1;
      continue;
    }

    // 字符串内部
    if (c === '\\') { out += src.slice(i, i + 2); i += 2; continue; }
    if (c === quote) { quote = ''; out += c; i += 1; continue; }
    if (c === '\r') { out += '\\n'; i += src[i + 1] === '\n' ? 2 : 1; continue; }
    if (c === '\n') { out += '\\n'; i += 1; continue; }

    out += c;
    i += 1;
  }

  return out;
}

/** 解析 JSON5 文本（含「字符串内直接换行」扩展） */
export function parseJson5(text) {
  return JSON5.parse(foldLiteralNewlines(String(text).replace(/^\uFEFF/, '')));
}
