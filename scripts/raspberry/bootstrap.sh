#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -eq 0 ]]; then
  echo "Run this script as a regular user with sudo privileges, not as root."
  exit 1
fi

echo "[1/6] Updating apt index and packages"
sudo apt update
sudo apt upgrade -y

echo "[2/6] Installing base dependencies"
sudo apt install -y ca-certificates curl git ufw fail2ban

echo "[3/6] Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "[4/6] Adding current user to docker group"
sudo usermod -aG docker "${USER}"

echo "[5/6] Enabling docker service"
sudo systemctl enable docker
sudo systemctl start docker

echo "[6/6] Configuring firewall (SSH + HTTP + HTTPS)"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "Bootstrap complete. Re-login is required so docker group changes take effect."
