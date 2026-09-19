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
