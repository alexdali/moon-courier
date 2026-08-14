# Deployment

## 1. Local production mode

```bash
cp .env.example .env
npm ci
npm run bootstrap
npm run build
npm run start
```

## 2. Docker

```bash
cp .env.example .env
# Заполнить APP_URL / OPENROUTER_SITE_URL и при необходимости OPENROUTER_API_KEY.
docker compose up --build -d
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
```

Persist:

- SQLite data volume;
- optional reports/screenshots volume.

## 3. Single VPS

Recommended baseline:

```text
Ubuntu 24.04
Node 22 or Docker
1–2 vCPU
1–2 GB RAM
10 GB persistent disk
Nginx/Caddy HTTPS
```

AI compute is remote; Monte Carlo is CPU-bound but small for demo sizes.

Минимальная последовательность для Ubuntu VPS:

```bash
git clone https://github.com/alexdali/moon-courier.git
cd moon-courier
cp .env.example .env
# Отредактировать .env локально на VPS, не коммитить его.
docker compose up --build -d
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
```

В firewall открывается только `80/443`; порт `3000` следует публиковать через reverse proxy. Если приложение доступно только через Caddy/Nginx на том же VPS, замените mapping Compose на `127.0.0.1:3000:3000`.

## 4. Environment

Required for online AI:

```dotenv
OPENROUTER_API_KEY=
```

Настройки перед публичной публикацией:

```dotenv
APP_URL=https://example.com
OPENROUTER_SITE_URL=https://example.com
```

`ADMIN_TOKEN` в текущем MVP зарезервирован и не является механизмом авторизации. Публичный demo защищён только rate limit; не используйте его как многопользовательскую production-систему.

## 5. Reverse proxy

- HTTPS;
- WebSocket not required;
- request body cap 1 MB;
- AI route timeout above application timeout by a small margin;
- no caching API responses;
- static mockups may be cached.

Пример Caddy:

```caddyfile
moon.example.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
```

## 6. Database volume

Do not place SQLite on ephemeral container filesystem. Use named volume or bind mount.

Backup перед обновлением:

```bash
docker compose stop web
docker run --rm -v moon-courier_moon_courier_data:/source -v "$PWD/backups:/backup" alpine \
  sh -c 'cp /source/moon-courier.db /backup/moon-courier-$(date +%Y%m%d-%H%M%S).db'
docker compose start web
```

Префикс volume зависит от имени Compose project; проверьте его через `docker volume ls`.

## 7. Zero-downtime limitation

SQLite + one process means simple restart deployment. For multiple replicas migrate to PostgreSQL first.

## 8. CI/CD

CI builds and tests. Deployment should:

1. backup DB;
2. pull image;
3. run migrations;
4. replace process;
5. health check;
6. smoke;
7. rollback image and DB only if migration is backward-incompatible.

Обновление из Git:

```bash
git pull --ff-only
docker compose build --pull
docker compose up -d
docker compose ps
curl --fail https://moon.example.com/api/health
```
