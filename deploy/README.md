# Single-VPS operations

The current single-host layout keeps project material separate from the deployable repository:

```text
/home/deploy/projects/moon-courier/
├── spec_moon/
├── repo_moon/
└── backups/
```

`Caddyfile.ip` exposes the application over HTTP while no domain is assigned. Replace `:80` with the domain after DNS is configured; Caddy will then provision HTTPS automatically.

The backup unit uses SQLite's online `.backup` command, validates the compressed artifact, and retains 14 days by default. Install it with:

```bash
sudo apt-get install -y sqlite3
sudo install -m 0755 deploy/backup-sqlite.sh /usr/local/sbin/backup-moon-courier
sudo install -m 0644 deploy/moon-courier-backup.service /etc/systemd/system/
sudo install -m 0644 deploy/moon-courier-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now moon-courier-backup.timer
sudo systemctl start moon-courier-backup.service
```

Inspect the schedule and latest run with:

```bash
systemctl list-timers moon-courier-backup.timer
systemctl status moon-courier-backup.service
```
