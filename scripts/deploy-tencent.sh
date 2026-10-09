#!/usr/bin/env bash
set -euo pipefail
for name in TENCENT_HOST TENCENT_PORT TENCENT_USER TENCENT_SSH_KEY TENCENT_KNOWN_HOSTS TENCENT_SITE_URL GITHUB_SHA GITHUB_RUN_ID GITHUB_RUN_ATTEMPT; do
    test -n "${!name:-}" || { echo "Missing deployment configuration: $name"; exit 1; }
done
[[ "$TENCENT_HOST" =~ ^[a-zA-Z0-9.-]+$ ]]
[[ "$TENCENT_PORT" =~ ^[0-9]+$ ]]
[[ "$TENCENT_USER" = portfolio-deploy ]]
[[ "$GITHUB_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$GITHUB_RUN_ID" =~ ^[0-9]+$ ]]
[[ "$GITHUB_RUN_ATTEMPT" =~ ^[0-9]+$ ]]
release="$GITHUB_SHA-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
ssh_dir=$(mktemp -d)
trap 'rm -rf "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
printf '%s\n' "$TENCENT_SSH_KEY" > "$ssh_dir/key"
printf '%s\n' "$TENCENT_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/key" "$ssh_dir/known_hosts"
ssh_flags=(-i "$ssh_dir/key" -p "$TENCENT_PORT" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts" -o ConnectTimeout=20 -o ServerAliveInterval=15 -o ServerAliveCountMax=3)
remote="$TENCENT_USER@$TENCENT_HOST"
ssh "${ssh_flags[@]}" "$remote" "python3 /usr/local/lib/portfolio-deploy.py prepare $release"
printf -v transport '%q ' ssh "${ssh_flags[@]}"
# Large material updates may be uploaded locally into an unpublished staging release first.
# The final release is still checked against its full manifest before activation.
seed="/srv/yang-wenxiang-portfolio/.incoming/$GITHUB_SHA-0-1"
seed_flags=()
if ssh "${ssh_flags[@]}" "$remote" "test -d $seed"; then
    seed_flags=(--link-dest="$seed")
fi
# --delete only operates inside the NEW incoming release, never current or older releases.
rsync -rplz --checksum --link-dest=/srv/yang-wenxiang-portfolio/current \
    "${seed_flags[@]}" \
    --delay-updates --delete --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
    -e "$transport" build/ "$remote:/srv/yang-wenxiang-portfolio/.incoming/$release/"
ssh "${ssh_flags[@]}" "$remote" "python3 /usr/local/lib/portfolio-deploy.py publish $release"
export PORTFOLIO_EXPECTED_RELEASE="$release"
node scripts/verify-live.mjs
