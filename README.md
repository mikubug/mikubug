# 凌云社 MikuBug 官方网站

Vue 3 + Vite 构建的**纯静态**站点（无后端），产物 `dist/` 可直接丢到任意静态托管。

- 英文名：**MikuBug**
- 中文名：**凌云社**（周南梅溪湖中学凌云社）
- GitHub：<https://github.com/mikubug>
- 主题色：**#66CCFF**

## 开发与构建

```bash
npm install
npm run dev      # 本地开发（Vite Dev Server）
npm run build    # 产出 dist/
```

## 目录结构

```
.
├── index.html              # 入口（含首屏主题防闪烁脚本）
├── vite.config.js
├── public/                 # 原样拷贝进 dist
│   ├── notice.json         # 公告数据（直接编辑即可）
│   ├── about.json          # 关于 / 加入 的自定义内容（可选）
│   ├── assets/logo.png     # 社团 Logo
│   ├── assets/music.ogg    # 梅花开时（Opus，约 1.6 MB）
│   └── repo/*.md           # 成果文档
└── src/
    ├── main.js             # 应用入口：挂载路由 + v-reveal 指令
    ├── App.vue             # 应用壳：导航 / 主题开关 / 路由出口 / 页脚 / 播放器
    ├── lib/
    │   ├── site.js         # 站点名 / 链接等全局配置
    │   ├── theme.js        # 明暗主题状态（localStorage + 圆形揭示切换）
    │   ├── content.js      # 构建期扫描 public/repo/*.md（无需清单文件）
    │   ├── md.js           # Markdown 渲染 + front-matter 解析
    │   ├── format.js       # 日期等格式化
    │   └── player.js       # 音乐播放器状态
    ├── components/         # IntroScreen / Loading / FxBackground / MusicPlayer
    │                       # ThemeToggle / PageHead / StateBox / TagChips / MarkdownBlock
    ├── directives/reveal.js# v-reveal 滚动进场（含三道路径兜底）
    ├── router/index.js     # hash 路由
    ├── views/              # Home / Notice / Works / WorkDetail / About / Join / NotFound
    └── styles/
        ├── base.css        # 主题令牌 + 壳层 + 通用组件 + 主题开关
        ├── pages.css       # 各页面组件样式
        └── markdown.css    # Markdown 排版
```

## 主题系统

- 主题色统一 `#66CCFF`，在 `base.css` 里以三件套暴露：
  - `--accent` —— 色块、边框、发光；
  - `--accent-ink` —— 强调**文字**（浅色主题会自动换成更深的蓝，保证可读性）；
  - `--accent-rgb` —— 供 `rgba(var(--accent-rgb), .2)` 这类透明度变体使用。
- 明暗两套变量：`:root`（深色）与 `html[data-theme='light']`（浅色）。组件样式只引用变量，不写死颜色。
- 右上角是**开关式**明暗切换（`components/ThemeToggle.vue`），选择记在 `localStorage['mikubug.theme']`；
  支持的浏览器上切换会走 View Transitions，从指针位置展开一圈圆形揭示。

## 页面

| 路由 | 页面 |
|---|---|
| `#/` | 首页 |
| `#/notice` | 公告 |
| `#/works` | 成果 |
| `#/works/<文件名>.md` | 成果详情 |
| `#/about` | 关于 |
| `#/join` | 加入（自动播放音乐 + 右上角播放器） |

> 使用 hash 路由，因此任意静态托管（含本地 `file://`）都能直接打开，无需服务端重写规则。

## 如何更新内容

### 公告

编辑 `public/notice.json`：

```json
[
  {
    "title": "公告标题",
    "publisher": "MikuBug",
    "date": "2026-09-16",
    "pinned": true,
    "tags": ["标签"],
    "body": "正文支持 **Markdown**。"
  }
]
```

- `date` 支持 `YYYY-MM-DD`；`pinned: true` 会置顶。
- `body` 字段走完整 Markdown 渲染。

### 成果

把 `.md` 文件丢进 `public/repo/` 即可，**文件名即标题**，无需任何清单文件
（构建时用 `import.meta.glob` 扫描，内容会内联进 JS）。

文档开头可写元信息（两种写法都支持）：

```
writer:liyifan202201;tags=硬件/开发;url=https://example.com
```

或者 YAML 风格：

```
---
writer: liyifan202201
tags: 硬件/开发/记录
url: https://example.com
---
```

支持字段：`writer`、`tags`、`url`、`date`、`title`。

- 列表中展示正文前 **100 个字符**的 Markdown 渲染摘要。
- 点开渲染完整 Markdown。

### 关于 / 加入

编辑 `public/about.json`：

```json
{
  "about": "关于内容，支持 Markdown",
  "join": "加入内容，支持 Markdown"
}
```

留空则显示内置占位内容。

## 本地预览

```bash
npm run dev
# 或预览构建产物
npx vite preview
```

## 部署

把 `dist/` 上传到任意静态托管即可（GitHub Pages / Cloudflare Pages / Vercel / Netlify / 对象存储…）。
本站资源全部使用相对路径，部署在子路径下（如 GitHub Pages 项目页）也能直接工作。

## 说明

### 音乐文件

`public/assets/music.ogg` 由原始 WAV 转码得到：**OGG / Opus，48 kHz 单声道，时长 3 分 43 秒，仅 1.6 MB**。
（原 WAV 为 48 kHz 立体声 float，体积 81.7 MB，已转码后移除。）

### 动效

- 全站进场动画走 `v-reveal` 指令（`directives/reveal.js`），带三道路径兜底，内容绝不会因脚本异常而不可见。
- 全站尊重 `prefers-reduced-motion`，对动效敏感的用户会看到静态版本。
- 浏览器自动播放策略可能拦截音乐，播放器会自动降级为「点击播放」。
