#!/usr/bin/env bash
set -euo pipefail

# 운영 전환 승인 전까지는 초안으로만 보관합니다.
# SERVICE_NAME과 WEB_ROOT는 기존 운영 systemd/Nginx 설정 확인 후 주입합니다.
PROJECT_ROOT="/home/ubuntu/services/linksuwon"
SERVICE_NAME="${LINKSUWON_SERVICE_NAME:-linksuwon}"
WEB_ROOT="${LINKSUWON_WEB_ROOT:?기존 Nginx root를 확인한 뒤 LINKSUWON_WEB_ROOT를 지정해야 합니다.}"
API_HEALTH_URL="${LINKSUWON_API_HEALTH_URL:-http://127.0.0.1:5002/api/v1/health}"

cd "$PROJECT_ROOT"
git fetch origin main
git reset --hard origin/main

cd backend
"$PROJECT_ROOT/.venv/bin/python" -m pip install -r requirements.txt

cd ../frontend
npm ci
npm run build
sudo rsync -a --delete dist/ "$WEB_ROOT/"

sudo systemctl restart "$SERVICE_NAME"
curl --fail --silent --show-error "$API_HEALTH_URL"
curl --fail --silent --show-error https://linksuwon.everytriplog.com/api/v1/health
