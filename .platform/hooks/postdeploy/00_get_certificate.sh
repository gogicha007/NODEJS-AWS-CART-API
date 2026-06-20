#!/bin/bash

# This script is executed after the application has been deployed.
# It installs certbot and obtains an SSL certificate from Let's Encrypt.

# Variables from environment
DOMAIN_NAME="$DOMAIN_NAME"
CERTBOT_EMAIL="$CERTBOT_EMAIL"

if [ -z "$DOMAIN_NAME" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "DOMAIN_NAME and CERTBOT_EMAIL environment variables are required."
  exit 1
fi

# Install EPEL repository and certbot
amazon-linux-extras install epel -y
yum install certbot -y

# Stop Nginx to allow certbot to bind to port 80
service nginx stop

# Obtain the certificate
certbot certonly --standalone -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$CERTBOT_EMAIL"

# Start Nginx again
service nginx start
