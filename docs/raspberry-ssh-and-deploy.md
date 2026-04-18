# Raspberry Setup, SSH and Deploy

## 1. Prepare SSH access from Windows + VS Code

1. Generate SSH key on your PC:
   - `ssh-keygen -t ed25519 -C "cactus-dev"`
2. Copy the public key to Raspberry user:
   - `ssh-copy-id <user>@<raspberry-ip>`
3. Add host config to `~/.ssh/config`:

```sshconfig
Host cactus-rpi
  HostName <raspberry-ip>
  User <user>
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 30
  ServerAliveCountMax 6
```

4. In VS Code install Remote-SSH extension and connect to host `cactus-rpi`.

## 2. Provision Raspberry

Inside Raspberry terminal:

```bash
cd ~/cactus
chmod +x scripts/raspberry/bootstrap.sh
./scripts/raspberry/bootstrap.sh
```

Log out and log in again.

## 3. Clone project and configure env

```bash
git clone <repo-url> ~/cactus
cd ~/cactus
cp .env.example .env
nano .env
```

Set secure values for POSTGRES_PASSWORD and SECRET_KEY.

## 4. Deploy

```bash
chmod +x scripts/raspberry/deploy.sh
./scripts/raspberry/deploy.sh ~/cactus
```

## 5. Validate

- Frontend: `http://<raspberry-ip>:3000`
- API docs: `http://<raspberry-ip>:8000/docs`
- DB health: `http://<raspberry-ip>:8000/api/health/db`

## 6. Backup database

```bash
chmod +x scripts/raspberry/backup-postgres.sh
./scripts/raspberry/backup-postgres.sh ~/cactus ~/cactus-backups
```

## 7. Optional hardening after stable launch

1. Disable SSH password auth (keep key auth only).
2. Change SSH port only if your team can maintain it.
3. Configure automatic security updates.
4. Add reverse proxy + TLS when internet exposure is enabled.
