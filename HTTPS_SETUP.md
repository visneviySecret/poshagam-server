# Настройка HTTPS для проекта

## Локальная разработка (HTTP)

По умолчанию проект работает на HTTP. В `.env` файле:

```env
USE_HTTPS=false
API_PORT=5000
```

Сервер будет доступен на `http://localhost:5000`

## Продакшн с HTTPS

### 1. Получение SSL сертификата

#### Вариант A: Let's Encrypt (бесплатно)

```bash
# Установка certbot
sudo apt update
sudo apt install certbot

# Получение сертификата для домена
sudo certbot certonly --standalone -d poshagam.store -d www.poshagam.store

# Сертификаты будут сохранены в:
# /etc/letsencrypt/live/poshagam.store/privkey.pem
# /etc/letsencrypt/live/poshagam.store/fullchain.pem
```

#### Вариант B: Другой провайдер SSL

Разместите файлы сертификата в безопасном месте на сервере.

### 2. Настройка переменных окружения

В `.env` файле на продакшн сервере:

```env
USE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80
SSL_KEY_PATH=/etc/letsencrypt/live/poshagam.store/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/poshagam.store/fullchain.pem
CLIENT_URL=https://poshagam.store
```

### 3. Права доступа к сертификатам

```bash
# Дать права Node.js приложению читать сертификаты
sudo chmod 644 /etc/letsencrypt/live/poshagam.store/fullchain.pem
sudo chmod 644 /etc/letsencrypt/live/poshagam.store/privkey.pem

# Или запускать приложение от имени пользователя с правами
sudo chown -R your_user:your_user /etc/letsencrypt/live/poshagam.store/
```

### 4. Открытие портов

```bash
# Разрешить порты 80 и 443 в firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 5. Запуск приложения

```bash
# Обычный запуск (требует sudo для портов 80/443)
sudo npm start

# Или с PM2
sudo pm2 start dist/index.js --name "mini-market-api"
```

### 6. Автоматическое обновление сертификата

Let's Encrypt сертификаты действительны 90 дней. Настройте автообновление:

```bash
# Тест обновления
sudo certbot renew --dry-run

# Добавить в crontab для автоматического обновления
sudo crontab -e

# Добавить строку (проверка каждый день в 3:00)
0 3 * * * certbot renew --quiet && pm2 restart mini-market-api
```

## Альтернатива: Использование Nginx как reverse proxy

Вместо запуска Node.js на портах 80/443, можно использовать Nginx:

### Конфигурация Nginx

```nginx
server {
    listen 80;
    server_name poshagam.store www.poshagam.store;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name poshagam.store www.poshagam.store;

    ssl_certificate /etc/letsencrypt/live/poshagam.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/poshagam.store/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

В этом случае в `.env`:

```env
USE_HTTPS=false
API_PORT=5000
CLIENT_URL=https://poshagam.store
```

Node.js работает на порту 5000, а Nginx обрабатывает SSL и проксирует запросы.

## Проверка

После настройки проверьте:

1. HTTP редирект: `curl -I http://poshagam.store` → должен вернуть 301 с Location на https
2. HTTPS работает: `curl -I https://poshagam.store` → должен вернуть 200
3. SSL валидный: https://www.ssllabs.com/ssltest/

## Troubleshooting

### Ошибка: EACCES permission denied на порту 80/443

Решение: Запустить с sudo или использовать Nginx

### Ошибка: SSL certificate files not found

Проверьте пути в `.env` и существование файлов:

```bash
ls -la /etc/letsencrypt/live/poshagam.store/
```

### Ошибка: Cannot read property 'host' of undefined

Убедитесь что CLIENT_URL настроен правильно и включает протокол (https://)
