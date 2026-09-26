# 凌云社 MikuBug

Vue 3 + Vite 的**纯静态**社团站（无后端），产物 `dist/` 丢到任意静态托管即可。
英文名 **MikuBug**，中文名 **凌云社**（周南梅溪湖中学凌云社）
部署在 <https://github.com/mikubug/mikubug.github.io>。

## 命令

```bash
npm install
npm run dev      # 开发
npm run build    # 产出 dist/
npm run preview  # 预览构建产物
```

## 结构

```
index.html              入口（首屏主题防闪烁 + 路由地址还原）
public/                 原样拷进 dist
  notice.json5          公告数据（JSON5）
  about.json5           关于页内容（可选）
  join.json5            加入页文案与联系渠道（可选）
  404.html              history 路由的静态托管回退页
  _redirects            Cloudflare Pages / Netlify 的回退规则
  assets/               Logo 与音乐
repo/*.md               成果文档（文件名即标题，无需清单）
src/
  router/               路由表（history 模式）
  lib/                  site / theme / content / json5 / md / format / player
  components/           开场动画 / 背景 / 播放器 / 主题开关 / 通用块
  directives/reveal.js  v-reveal 滚动进场
  views/                首页 / 公告 / 成果 + 详情 / 关于 / 加入 / 404
  styles/               tokens（Fluent 2 令牌）/ base / pages / markdown
```

## 设计系统

界面按 **[Fluent 2](https://fluent2.microsoft.design)** 组织，令牌集中在 `src/styles/tokens.css`：

- **颜色**：`colorBrand10…160` 十六条品牌色阶（基准 `#66CCFF`）+ Fluent 全套中性色，深浅两套语义令牌
- **材质**：Mica 底 + Acrylic 浮层（半透明 + `blur(30px) saturate(125%)` + 噪点）
- **排版 / 圆角 / 描边 / 阴影 / 动效**：Fluent 的 type ramp、`borderRadius`、`shadow2…64`、`duration*` + `curve*`
- **导航是"灵动岛"**：桌面端居中悬浮胶囊；窄屏收成右上角一个按钮，点开由胶囊自身展开成面板

组件样式里**不写死颜色和时长**，一律引用令牌。换主题色只需改 `tokens.css` 里的品牌色阶。

## 内容维护

**公告** —— 编辑 `public/notice.json5`：

```json5
// JSON5：能写注释、键名不用引号、允许尾随逗号，正文还可以直接换行
[
  {
    title: '标题',
    publisher: 'MikuBug',
    date: '2026-09-16',
    pinned: true,
    tags: ['通知'],
    body: '正文支持 **Markdown**。',
  },
]
```

**成果** —— 把 `.md` 丢进 `repo/` 就行，**文件名即标题**，构建期扫描内联，不需要任何清单文件。
开头可写元信息（单行式或 `---` YAML 式都支持）：

```
writer:liyifan202201;tags=硬件/开发;url=https://example.com
```

列表展示正文前 100 字符的渲染摘要，点开看全文。

**关于** —— 编辑 `public/about.json5` 的 `about` 字段，留空用占位内容。

**加入** —— 编辑 `public/join.json5`：

```json5
{
  slides: [
    { kicker: '01 / WHY', title: '标题', desc: '副标题', detail: '卡片正文' },
  ],
  channels: [{ key: 'GITHUB', value: 'mikubug', href: 'https://github.com/mikubug' }],
  join: '',   // 最后一页的 Markdown 正文，留空则用该页的 detail
}
```

> 内容文件都用 **JSON5**（`public/*.json5`）：可以写注释、键名不用引号、允许尾随逗号；另外字符串里**可以直接换行**，长正文不必手敲转义。
> 只有 `package.json` 保持标准 JSON（npm 要求）。

## 路由

| 路径 | 页面 |
|---|---|
| `/` | 首页 |
| `/notice` | 公告 |
| `/works` · `/works/<文件名>.md` | 成果 / 成果详情 |
| `/about` · `/join` | 关于 / 加入（进入自动播放音乐） |

