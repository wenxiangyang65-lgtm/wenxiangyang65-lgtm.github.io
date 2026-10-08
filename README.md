# 杨文祥 · AI Visual Portfolio

作品集主页包含封面、简历和可点击唱片目录，15 个项目分别进入二级页面。

站点源文件位于 `dist/`，项目名称、简介、封面和展示顺序集中在 `content/projects.json`。

检查与构建：`npm ci --ignore-scripts --no-audit --no-fund` → `npm test` → `npm run build`。

推送 `main` 后，通过 GitHub Actions 自动检查并发布到腾讯云 Nginx，同时保留原 GitHub Pages 地址。使用完整文件校验、版本目录、原子切换、至少三个成功版本和回滚。

日常使用只需在 Codex 中说「发布网站」，检查与确认后自动推送、部署并验证。

完整部署、日志、回滚、域名与内容维护说明见 [DEPLOY.md](DEPLOY.md)。
