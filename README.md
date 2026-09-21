# 凌云社 MikuBug

Vue 3 + Vite 的**纯静态**社团站（无后端），产物 `dist/` 丢到任意静态托管即可。
英文名 **MikuBug**，中文名 **凌云社**（周南梅溪湖中学凌云社），主题色 **#66CCFF**。
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
  notice.json           公告数据
  about.json            关于 / 加入 的自定义内容（可选）
  404.html              history 路由的静态托管回退页
  _redirects            Cloudflare Pages / Netlify 的回退规则
  assets/               Logo 与音乐
repo/*.md               成果文档（文件名即标题，无需清单）
src/
  router/               路由表（history 模式）
  lib/                  site / theme / content / md / format / player
  components/           开场动画 / 背景 / 播放器 / 主题开关 / 通用块
  directives/reveal.js  v-reveal 滚动进场
  views/                首页 / 公告 / 成果 + 详情 / 关于 / 加入 / 404
  styles/               base（令牌）/ pages / markdown
```

## 内容维护

**公告** —— 编辑 `public/notice.json`：

```json
[{ "title": "标题", "publisher": "MikuBug", "date": "2026-09-16", "pinned": true,
   "tags": ["通知"], "body": "正文支持 **Markdown**。" }]
```

**成果** —— 把 `.md` 丢进 `repo/` 就行，**文件名即标题**，构建期扫描内联，不需要任何清单文件。
开头可写元信息（单行式或 `---` YAML 式都支持）：

```
writer:liyifan202201;tags=硬件/开发;url=https://example.com
```

列表展示正文前 100 字符的渲染摘要，点开看全文。

**关于 / 加入** —— 编辑 `public/about.json` 的 `about` / `join` 字段，留空用占位内容。

## 路由

| 路径 | 页面 |
|---|---|
| `/` | 首页 |
| `/notice` | 公告 |
| `/works` · `/works/<文件名>.md` | 成果 / 成果详情 |
| `/about` · `/join` | 关于 / 加入（进入自动播放音乐） |

