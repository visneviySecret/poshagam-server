#!/bin/bash

DOMAIN="poshagam.store"
EMAIL="egor06tiger@gmail.com"

echo "=== SSL Certificate Setup Script ==="
echo ""

if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use sudo)"
  exit 1
fi

echo "Installing certbot..."
apt update
apt install -y certbot

echo ""
echo "Obtaining SSL certificate for $DOMAIN..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Certificate obtained successfully!"
    echo ""
    echo "Certificate files:"
    echo "  Key:  /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo "  Cert: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo ""
    echo "Setting up permissions..."
    chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    chmod 644 /etc/letsencrypt/live/$DOMAIN/privkey.pem
    echo "✓ Permissions set"
    echo ""
    echo "Add these to your .env file:"
    echo "USE_HTTPS=true"
    echo "SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem"
    echo "SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo ""
    echo "Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && pm2 restart mini-market-api") | crontab -
    echo "✓ Auto-renewal configured (daily at 3:00 AM)"
else
    echo "✗ Failed to obtain certificate"
    exit 1
fi
