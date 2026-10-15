# 日麻工具 PWA

可安装、可离线使用的日麻算分与练习工具，基于 [llx07/mahjong-vue](https://github.com/llx07/mahjong-vue)。前端使用 Vue，核心算分逻辑使用 JavaScript。

An installable Riichi Mahjong scoring and practice PWA, forked from `llx07/mahjong-vue`, with offline caching and refined mobile controls.

## 本 fork 的增强

- PWA 清单与 Service Worker 资源预缓存，可添加到主屏幕。
- 首次完整加载并缓存后，可离线打开使用。
- GitHub Pages 自动构建与部署。
- 移动端布局、安全区域及 iOS 独立窗口适配。
- Liquid Glass 风格按钮、触控反馈与算分操作区优化。
- 赤五牌等输入与交互改进。

## 功能

- 日麻点数计算。
- 算分练习。
- 可按界面选项调整食断、多倍/复合役满、连风雀头符数和累计役满等规则。

## 安装为应用

先在支持 PWA 的浏览器中在线打开部署后的页面，等待资源加载完成，再使用浏览器的“安装应用”或“添加到主屏幕”。离线使用前，需先完成该设备上的首次加载与缓存。

浏览器版本和平台会影响安装入口；本仓库不包含原生 Android/iOS 安装包。

## 本地开发

准备 Node.js 与 npm，在仓库根目录运行：

```bash
npm install
npm run serve
```

按开发服务器输出的地址访问。生产构建与代码检查：

```bash
npm run build
npm run lint
```

`npm run lint` 使用现有 Vue CLI lint 配置，可能自动修复文件。

## 部署

工作流位于 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)。当前 [`vue.config.js`](vue.config.js) 的 `publicPath` 为 `/mahjong-vue-PWA/`；更改部署路径时应一并调整。

## 来源与许可

算分与练习功能基于上游项目；本分支重点是 PWA、移动端和交互体验。原说明标注牌画素材来自“最完整的日本麻將中文維基百科”。代码许可见 [LICENSE](LICENSE)，素材使用条件以原来源为准。
