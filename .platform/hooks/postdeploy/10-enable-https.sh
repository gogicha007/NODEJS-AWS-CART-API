#!/bin/bash
set -euo pipefail

# 1. Fetch Environment Variables natively using the AL2023 AWS utility tool
DOMAIN_NAME=$(/opt/elasticbeanstalk/bin/get-config environment -k DOMAIN_NAME)
CERTBOT_EMAIL=$(/opt/elasticbeanstalk/bin/get-config environment -k CERTBOT_EMAIL)

if [ -z "${DOMAIN_NAME}" ]; then
  echo "ERROR: DOMAIN_NAME environment variable is empty."
  exit 1
fi

CERT_PATH="/etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem"

# 2. Automatically install Certbot if it's a completely fresh instance
if [ ! -d "/opt/certbot" ]; then
  echo "Certbot not found. Installing into virtual environment..."
  python3 -m venv /opt/certbot
  /opt/certbot/bin/pip install --upgrade pip
  /opt/certbot/bin/pip install certbot
  ln -sf /opt/certbot/bin/certbot /usr/bin/certbot
fi

# 3. Create public folder for the webroot acme verification challenge
mkdir -p /var/app/current/public/.well-known/acme-challenge

# 4. If the certificate doesn't exist yet, request it cleanly using webroot mode
if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
  echo "Certificate missing. Generating Let's Encrypt SSL via webroot..."
  certbot certonly --webroot -w /var/app/current/public --non-interactive --agree-tos \
    --email "${CERTBOT_EMAIL}" \
    -d "${DOMAIN_NAME}"
fi

# 5. Write out the final secure Nginx routing architecture
cat > /etc/nginx/conf.d/https-letsencrypt.conf <<EOF
server {
    listen 443 ssl;
    server_name ${DOMAIN_NAME};

    ssl_certificate ${CERT_PATH};
    ssl_certificate_key ${KEY_PATH};

    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # Point directly to port 80 where Elastic Beanstalk routes the Docker container
        proxy_pass http://127.0.0.1:80;
    }
}

server {
    listen 80;
    server_name ${DOMAIN_NAME};
    
    # Allow the renewal verification path to bypass the HTTPS redirect logic
    location /.well-known/acme-challenge/ {
        root /var/app/current/public;
        allow all;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

# 6. Test configuration rules and reload safely
nginx -t
systemctl reload nginx

# 7. Inject automated background renewal cron job
cat > /etc/cron.d/certbot-renew <<'EOF'
17 3 * * * root certbot renew --webroot -w /var/app/current/public --quiet --non-interactive && systemctl reload nginx
EOF
chmod 644 /etc/cron.d/certbot-renew

echo "HTTPS deployment successfully provisioned!"