/* 日期格式化工具 */

/** 2026-09-16 → 2026.09.16 */
export function fmtDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 相对时间,超过 30 天回退为绝对日期 */
export function relTime(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);

  const diff = Date.now() - d.getTime();
  const hour = 36e5;
  const day = 864e5;

  if (diff < hour) return '刚刚';
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < day * 30) return `${Math.floor(diff / day)} 天前`;
  return fmtDate(v);
}

/* 作者 */

/** 把作者串拆成名字数组:支持 & , ，、; / 与 " 和 " 分隔 */
export function parseAuthors(writer) {
  return String(writer || '')
    .split(/[&,，、;；/]|\s+和\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 作者行：1 人「作者：xxx」，多人「作者：A，B 和 C 联合编写」 */
export function fmtAuthors(writer) {
  const names = parseAuthors(writer);
  if (!names.length) return '';
  if (names.length === 1) return `作者：${names[0]}`;
  return `作者：${names.slice(0, -1).join('，')} 和 ${names[names.length - 1]} 联合编写`;
}
