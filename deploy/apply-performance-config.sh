#!/usr/bin/env bash
set -euo pipefail
if [[ $(id -u) != 0 ]]; then
    echo '请在腾讯云管理员终端执行此脚本；普通网站发布账号不能修改 Nginx。' >&2
    exit 1
fi
source_dir=$(cd -- "$(dirname -- "$0")" && pwd)
target=/etc/nginx/sites-available/yang-wenxiang-portfolio
test -f "$target"
backup=$(mktemp /etc/nginx/sites-available/yang-wenxiang-portfolio.backup.XXXXXX)
cp -p -- "$target" "$backup"
install -m 644 "$source_dir/nginx-portfolio.conf" "$target"
if ! nginx -t; then
    cp -p -- "$backup" "$target"
    echo '配置检查未通过，已恢复原配置。' >&2
    exit 1
fi
if ! systemctl reload nginx; then
    cp -p -- "$backup" "$target"
    nginx -t && systemctl reload nginx
    echo '重载未通过，已恢复原配置。' >&2
    exit 1
fi
printf '作品集服务器缓存已启用。原配置备份：%s\n' "$backup"
