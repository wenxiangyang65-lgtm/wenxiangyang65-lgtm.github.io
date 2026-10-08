#!/usr/bin/env bash
# Run once as administrator after the dedicated account and server have been inspected.
set -euo pipefail
cd "$(dirname "$0")"
test "$(id -u)" = 0
id portfolio-deploy >/dev/null
test -d /srv/yang-wenxiang-portfolio
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx rsync python3
install -m 644 -o root -g root release.py /usr/local/lib/portfolio-deploy.py
install -m 644 -o root -g root server-config.json /etc/portfolio-deploy.json
for folder in releases .incoming logs; do
    install -d -m 755 -o portfolio-deploy -g portfolio-deploy "/srv/yang-wenxiang-portfolio/$folder"
done
site=/etc/nginx/sites-available/yang-wenxiang-portfolio
if test -e "$site"; then
    echo "The dedicated Nginx configuration already exists; inspect it before replacing."
    exit 1
fi
install -m 644 -o root -g root nginx-portfolio.conf "$site"
ln -s "$site" /etc/nginx/sites-enabled/yang-wenxiang-portfolio
if ! nginx -t; then
    unlink /etc/nginx/sites-enabled/yang-wenxiang-portfolio
    echo 'Nginx validation failed; existing virtual hosts were preserved.'
    exit 1
fi
systemctl enable nginx
systemctl reload nginx
echo 'PORTFOLIO_NGINX_READY'
