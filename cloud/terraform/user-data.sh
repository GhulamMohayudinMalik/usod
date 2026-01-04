#!/bin/bash
# USOD Backend EC2 User Data Script
# This runs when the instance first boots

set -e

# Log all output
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting USOD Backend Setup ==="

# Update system
apt-get update && apt-get upgrade -y

# Install dependencies
apt-get install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create app user
useradd -m -s /bin/bash usod || true

# Create app directory
mkdir -p /opt/usod/backend
chown -R usod:usod /opt/usod

# Create environment file
cat > /opt/usod/backend/.env << EOF
PORT=5000
NODE_ENV=${environment}
MONGODB_URI=${mongodb_uri}
JWT_SECRET=${jwt_secret}
FRONTEND_URL=${frontend_url}
CORS_ORIGIN=${frontend_url}
EOF
chown usod:usod /opt/usod/backend/.env
chmod 600 /opt/usod/backend/.env

# Create systemd service
cat > /etc/systemd/system/usod-backend.service << EOF
[Unit]
Description=USOD Backend API
After=network.target

[Service]
Type=simple
User=usod
WorkingDirectory=/opt/usod/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=${environment}
EnvironmentFile=/opt/usod/backend/.env

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/usod << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
    }
}
EOF

# Enable Nginx config
ln -sf /etc/nginx/sites-available/usod /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Enable and start services
systemctl daemon-reload
systemctl enable nginx
systemctl restart nginx

echo "=== USOD Backend Setup Complete ==="
echo "Server is ready. Deploy your code to /opt/usod/backend"
echo "Then run: sudo systemctl start usod-backend"
