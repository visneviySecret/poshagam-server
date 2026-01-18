# Mini Market Server

Backend API для интернет-магазина с поддержкой HTTPS, платежей через Robokassa и отправки email.

## Быстрый старт

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Скопируйте `env.example` в `.env` и настройте переменные окружения

3. Запустите Docker контейнеры (PostgreSQL и MinIO):
```bash
npm run docker:up
```

4. Инициализируйте базу данных:
```bash
npm run db:init
```

5. Запустите сервер в режиме разработки:
```bash
npm run dev
```

Сервер будет доступен на `http://localhost:5000`

## Продакшн с HTTPS

### Быстрая настройка

1. На сервере запустите скрипт установки SSL:
```bash
sudo chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh
```

2. Обновите `.env`:
```env
USE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80
SSL_KEY_PATH=/etc/letsencrypt/live/poshagam.store/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/poshagam.store/fullchain.pem
CLIENT_URL=https://poshagam.store
```

3. Соберите и запустите:
```bash
npm run build
sudo npm start
```

### Подробная инструкция

См. [HTTPS_SETUP.md](./HTTPS_SETUP.md) для детальной настройки HTTPS, включая:
- Получение SSL сертификата через Let's Encrypt
- Настройка автообновления сертификатов
- Использование Nginx как reverse proxy
- Troubleshooting

## Скрипты

- `npm run dev` - Запуск в режиме разработки (с автоперезагрузкой)
- `npm run build` - Сборка TypeScript в JavaScript
- `npm start` - Запуск продакшн версии
- `npm run docker:up` - Запуск Docker контейнеров
- `npm run docker:down` - Остановка Docker контейнеров
- `npm run db:init` - Инициализация базы данных

## Структура проекта

```
src/
├── config/          # Конфигурации (SSL, и т.д.)
├── controller/      # Контроллеры API
├── database/        # Настройки БД и миграции
├── helpers/         # Вспомогательные функции
├── middleware/      # Middleware (auth, upload, и т.д.)
├── repository/      # Слой работы с БД
├── router/          # Роутинг API
├── service/         # Бизнес-логика
├── templates/       # Шаблоны (email, и т.д.)
├── types/           # TypeScript типы
└── index.ts         # Точка входа
```

## Основные возможности

- ✅ REST API с Express
- ✅ PostgreSQL база данных
- ✅ S3-совместимое хранилище (MinIO)
- ✅ JWT аутентификация
- ✅ Загрузка файлов (изображения, PDF)
- ✅ Интеграция с Robokassa для платежей
- ✅ Отправка email через Gmail OAuth2
- ✅ HTTPS поддержка с автоматическим редиректом
- ✅ Docker контейнеры для разработки
- ✅ TypeScript

## Переменные окружения

Основные переменные (см. `env.example` для полного списка):

```env
# Сервер
API_PORT=5000
CLIENT_URL=http://localhost:3000

# HTTPS (опционально)
USE_HTTPS=false
SSL_KEY_PATH=/path/to/privkey.pem
SSL_CERT_PATH=/path/to/fullchain.pem

# База данных
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_NAME=poshagam

# S3 Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=mini-market-bucket

# JWT
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

# Robokassa
ROBOKASSA_MERCHANT_LOGIN=your_login
ROBOKASSA_PASSWORD_1=your_password
ROBOKASSA_TEST_MODE=true

# Google Mail
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CLOUD_REFRESH=your_token
GOOGLE_CLIENT_USER=your_email@gmail.com
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/refresh` - Обновление токена

### Продукты
- `GET /api/product` - Список продуктов
- `POST /api/product/create` - Создание продукта (admin)

### Заказы
- `POST /api/order-create` - Создание заказа
- `GET /api/order/:id` - Получение заказа
- `GET /api/order/user/:userId` - Заказы пользователя

### Платежи
- `POST /api/payment/create` - Создание платежа
- `POST /api/payment/result` - Webhook от Robokassa
- `GET /api/payment/success` - Успешный платеж
- `GET /api/payment/fail` - Неудачный платеж

### Email
- `POST /api/mail/send-instruction` - Отправка инструкции

## Лицензия

ISC
