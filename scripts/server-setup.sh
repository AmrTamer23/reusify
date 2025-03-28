#!/bin/bash

# Server setup script for reusify application
# This script helps with installing Docker and Docker Compose on the server

# Exit on any error
set -e

# Function to print colored output
print_message() {
  GREEN='\033[0;32m'
  NC='\033[0m' # No Color
  echo -e "${GREEN}$1${NC}"
}

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

print_message "=== Updating system packages ==="
apt-get update
apt-get upgrade -y

print_message "=== Installing prerequisites ==="
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  apt-transport-https \
  software-properties-common

print_message "=== Installing Docker ==="
# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose separately
print_message "=== Installing Docker Compose ==="
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
print_message "=== Verifying installations ==="
docker --version
docker-compose --version

# Add current user to docker group (if not root)
if [ -n "$SUDO_USER" ]; then
  print_message "=== Adding $SUDO_USER to docker group ==="
  usermod -aG docker $SUDO_USER
  echo "Please log out and log back in for group changes to take effect"
fi

print_message "=== Setup complete! ==="
print_message "You can now use Docker and Docker Compose for your application." 