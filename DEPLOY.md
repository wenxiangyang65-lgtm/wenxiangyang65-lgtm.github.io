# 作品集部署与日常更新

## 实际站点与仓库

- 腾讯云网址：<http://115.159.25.132/>
- 原 GitHub Pages 网址保持不变：<https://wenxiangyang65-lgtm.github.io/>
- 仓库：<https://github.com/wenxiangyang65-lgtm/wenxiangyang65-lgtm.github.io>
- 发布分支：`main`
- 服务器：腾讯云轻量应用服务器，上海，Ubuntu 22.04 LTS，实例 `lhins-27kgc1ew`。
- 服务器部署账号：`portfolio-deploy`，没有 sudo 权限；管理员仍使用原来的 `ubuntu` 账号。
- 当前没有绑定自有域名。腾讯云入口先使用 HTTP 公网 IP；原 GitHub 入口继续提供 HTTPS。

这是完整静态网站，含已经导出的 Next.js AWE 页面和其余独立项目页面。服务器只需要 Nginx、Python 3 和 rsync；不需要 Node 常驻进程、PM2 或数据库。构建由 GitHub 完成，没有第三方 npm 依赖。

## 本地项目与服务器目录

```text
content/projects.json       项目顺序、名称、简介、封面、入口
dist/                       网站源文件和素材；可以修改
  assets/                   主页、简历、唱片封面
  projects/<slug>/          各项目独立的页面、文案、图片、视频、字体
scripts/                    内容生成、检查、构建、上传和公网验证
deploy/                     Nginx 模板、服务器配置、发布工具、首次安装脚本
tests/                      发布失败保护和回滚测试
build/                      构建产物；自动生成，不提交
.github/workflows/          腾讯云与原 GitHub Pages 两套发布流程
```

服务器实际运行根目录：`/srv/yang-wenxiang-portfolio/current`。

```text
/srv/yang-wenxiang-portfolio/
  .incoming/<版本号>/       新版本上传区，不对外访问
  releases/<版本号>/        已完整上传的版本
  current -> releases/...   当前公开版本，原子切换
  previous -> releases/...  前一个正常版本，用于快速回滚
  logs/deploy.jsonl         发布、失败、回滚和清理记录
  .deploy.lock              防止同时切换版本的锁
```

Nginx 配置：`/etc/nginx/sites-available/yang-wenxiang-portfolio`。
服务器发布配置：`/etc/portfolio-deploy.json`。
发布工具：`/usr/local/lib/portfolio-deploy.py`。
这三个系统文件归 root 所有；部署账号不能修改它们，也不影响其他虚拟主机。

Nginx 已配置开机启动。`current` 软链接在重启后仍然指向完整版本，无需手动恢复进程。原有默认配置和其他网站不被删除。静态项目使用真实目录的 `index.html`，支持刷新项目网址；不存在的资源返回真实 404，避免误把首页当成图片或脚本。[Nginx 静态托管文档](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)

## 自动部署如何工作

推送 `main` 后，`Publish to Tencent Cloud` 工作流自动执行：

1. 安装锁定依赖（当前无外部依赖），运行发布保护测试。
2. 检查所有项目入口、HTML 与 CSS 的本地资源引用、JS 语法、JSON 和敏感文件。
3. 把 `dist/` 打包到 `build/`，生成目录配置和包含每个文件大小、SHA-256 的清单。
4. 经 SSH 上传至新的 `.incoming/<提交号-运行号-尝试号>/`。
5. 服务器逐文件校验后才切换 `current`。上传或校验失败时旧版不受影响。
6. Nginx 本地检查当前版本、主页和全部项目；失败自动把链接切回旧版。
7. 外网验证提交号、全部项目入口、封面/简历图片、视频大小与视频 Range 请求。

构建失败不会连接服务器；上传失败不会修改当前目录。相同时间的发布排队执行。至少保留最近三个成功版本（首次上线只有一个，随后随正常更新积累）；当前与前一个版本额外受保护。失败版本不会被当作可回滚版本。

原来的 `Publish portfolio` 工作流也使用相同检查和构建产物，继续更新同一个 GitHub Pages 地址。两个托管地址独立，腾讯云更新不改变 GitHub 地址。

## 密钥和配置

GitHub 的 `tencent-production` 环境存放：

| Secret | 用途 |
| --- | --- |
| `TENCENT_HOST` | SSH 服务器地址 |
| `TENCENT_PORT` | SSH 端口，当前 22 |
| `TENCENT_USER` | 专用部署账号 |
| `TENCENT_SSH_KEY` | 专用 SSH 私钥 |
| `TENCENT_KNOWN_HOSTS` | 已与腾讯云终端核对的服务器公钥 |

仓库变量 `TENCENT_DEPLOY_ENABLED=true` 启用腾讯云发布；`TENCENT_SITE_URL` 是公网验证地址。没有服务器密码、私钥或 Token 在仓库里。SSH 使用固定主机公钥校验，未使用关闭校验或每次发布重新信任未知公钥的做法。服务器 authorized_keys 的 `restrict` 禁止转发和交互式 PTY。密钥仅交给专用部署账号。[GitHub Secrets 文档](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

本机 SSH 别名为 `portfolio-tencent`，配置在 `~/.ssh/config`；专用私钥位于 `~/.ssh/portfolio_tencent_deploy_20261008`，不属于项目目录。不要把该文件粘贴到聊天或上传到仓库。换电脑后需要重新安全授权本机连接，GitHub 自动部署仍然可用。

## 在 Codex 修改和发布

直接描述修改，例如「把许我一匹马吧的封面替换成这张图片」或「把某项目放到第四位」。Codex 在对应项目目录和中央配置里修改，保留现有设计。

修改完成后说 **「发布网站」**。Codex 按 `AGENTS.md` 检查、测试与构建，说明准备发布哪些内容。你确认后，Codex 提交并推送 `main`，等待两套工作流完成，检查线上网站并提供地址。日常内容更新不需要再登录服务器。

如果手动维护，检查命令为：

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run content
npm test
npm run build
```

不要直接修改 `build/`。目录卡片的顺序就是 `content/projects.json` 数组顺序。原编号 `n` 用于原版美术，不因展示顺序改变。前八项的卡片文字已印在图片里，修改图片中的字需要替换原素材；配置里的名称控制链接、提示与目录下方的文字。

各项目的正文仍在各自页面或已有数据文件里。例如徐杰在 `dist/projects/xujie/site-data.json`，许我一匹马吧在其 `project-data.js`，初瑞雪有独立 `project-profile.js` 和各章节文件。不要把不同项目的数据合并到一个大文件。

新增项目优先沿用现有唱片模板：在 `dist/projects/<新slug>/` 新建详情页，把圆形封面放入明确命名的素材目录，在中央配置增加唯一 `n`、`slug`、`title`、`label`、`year`、`description`、`entry`、`cover`、`category` 和 `template: "sleeve"`。页数和滚动计数自动跟随项目数量，不必修改动画脚本。编辑详情页后把 `/project-navigation.js` 和 `/desktop-preview.js` 接入，沿用现有返回目录与手机预览行为。

## 查看结果与日志

- 打开仓库的 [Actions](https://github.com/wenxiangyang65-lgtm/wenxiangyang65-lgtm.github.io/actions)，查看 `Publish to Tencent Cloud` 的最新运行。成功运行会在 Summary 提供网站链接和提交号。
- 公开 `/_release.json` 只有版本号、提交号、时间和校验结果，没有密钥。可以用它确认自己正在看哪个版本。
- 构建产物在 GitHub 保留 7 天；GitHub 日志和服务器实际版本目录是不同的保留机制。
- 服务器发布日志：`/srv/yang-wenxiang-portfolio/logs/deploy.jsonl`。
- Nginx 日志：`/var/log/nginx/portfolio-access.log`、`portfolio-error.log`，管理员可查看。

Codex 可以使用：

```bash
ssh portfolio-tencent 'python3 /usr/local/lib/portfolio-deploy.py status'
ssh portfolio-tencent 'tail -50 /srv/yang-wenxiang-portfolio/logs/deploy.jsonl'
```

不要通过删除线上文件修复失败；先看是构建、SSH、磁盘、校验、Nginx 还是外网访问失败。

## 恢复上一个正常版本

告诉 Codex「回滚到上一个正常版本」。专用账号可直接安全切换：

```bash
ssh portfolio-tencent 'python3 /usr/local/lib/portfolio-deploy.py rollback'
```

指定保留的版本也可传完整版本号。工具先核对清单和成功标记，切换后检查 Nginx；失败则恢复原链接，不删除版本。回滚是服务器即时操作，不改变 GitHub 提交历史；后续推送 main 会再次发布新构建。长期撤销错误内容时，还需要在 GitHub 中恢复对应内容并正常发布。第一次上线时还没有前一个版本，工具会准确报告这一状态。

## 域名与 HTTPS

拿到域名后告诉 Codex域名和希望使用的主机名即可。服务器在上海；域名上线前需要核对备案和接入状态，不填写或提交身份材料来替代你本人操作。

后续顺序：把域名 A 记录指向 `115.159.25.132`；添加独立域名虚拟主机；配置经验证的 TLS 证书和自动续期；只放通所需 443 端口；测试 `nginx -t` 后 reload；把 HTTP 转到 HTTPS；更新 `TENCENT_SITE_URL`。同时更新 `/etc/portfolio-deploy.json` 的 `server_name`，使本地检查仍然命中作品集站点。配置源码模板也同步更新，避免以后误覆盖。新域名验证成功前保留 IP 和 GitHub 原入口。

已使用自有域名时，更换域名沿用同样步骤，旧入口是否重定向按用户要求处理。不要擅自购买域名或开通付费证书。

## 图片、视频与 COS

当前约 251MB，服务器足够容纳站点与最近三个版本。Nginx 原生支持视频范围请求；素材保持原来的项目目录，构建校验能检查漏传或损坏。入口脚本、页面、JSON 不长期缓存；封面素材配置按内容生成版本参数，方便替换后刷新。

本次没有开通 COS、CDN 或迁移素材。后续视频明显增加或访问量变大时，再根据实际流量和成本评估 COS；迁移前需确认费用、域名、缓存和兼容性，不让付费服务成为发布前提。
