#!/bin/sh
set -eu

database_path="${MOON_COURIER_DB_PATH:-/var/lib/docker/volumes/moon_courier_moon_courier_data/_data/moon-courier.db}"
backup_dir="${MOON_COURIER_BACKUP_DIR:-/home/deploy/projects/moon-courier/backups}"
retention_days="${MOON_COURIER_BACKUP_RETENTION_DAYS:-14}"
timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup_path="$backup_dir/moon-courier-$timestamp.db"

if [ ! -f "$database_path" ]; then
  echo "Moon Courier database not found: $database_path" >&2
  exit 1
fi

umask 077
install -d -m 0700 "$backup_dir"
sqlite3 "$database_path" ".timeout 10000" ".backup '$backup_path'"
gzip "$backup_path"
gzip -t "$backup_path.gz"
find "$backup_dir" -type f -name 'moon-courier-*.db.gz' -mtime "+$retention_days" -delete

echo "Created $backup_path.gz"
