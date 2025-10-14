# Інструкція деплою на Vercel

## Готовність проекту

Проект підготовлено для деплою:
- Видалено WebSocket (не підтримується Vercel)
- Видалено кастомний server.js
- Видалено всі тимчасові MD файли
- Виправлено всі TypeScript помилки
- Білд успішний

## Крок 1: Підготовка БД на Neon

1. Зайдіть на https://neon.tech
2. Створіть безкоштовний акаунт
3. Create New Project
4. Назва: europe-service-crm
5. Регіон: Europe (Frankfurt)
6. Скопіюйте Connection String

Приклад Connection String:
```
postgresql://neondb_owner:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Крок 2: Підключення до Vercel

1. Зайдіть на https://vercel.com
2. New Project
3. Import Git Repository
4. Виберіть ваш GitHub репозиторій
5. Root Directory: залишити пустим
6. Framework Preset: Next.js (автоматично)

## Крок 3: Environment Variables

У Vercel додайте ці змінні:

```
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=generate-random-string-here-32-chars-min

NEXTAUTH_URL=https://your-app.vercel.app

NEXTAUTH_SECRET=another-random-string-32-chars

NODE_ENV=production
```

Згенерувати секрети можна так:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Крок 4: Deploy

1. Натисніть Deploy
2. Зачекайте 2-3 хвилини
3. Перевірте чи білд успішний

## Крок 5: Ініціалізація БД

Після успішного деплою:

### Варіант A: Через термінал

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.production.local
npx prisma db push
npm run db:seed
```

### Варіант B: Через Vercel Dashboard

1. Перейдіть у Settings -> Functions
2. Додайте Build Command:
```
prisma generate && prisma db push && next build
```

3. Після чого вручну запустіть seed:
- Скопіюйте DATABASE_URL з Vercel
- Запустіть локально:
```bash
DATABASE_URL="ваш-url" npm run db:seed
```

## Крок 6: Тестування

1. Відкрийте ваш Vercel URL
2. Перейдіть на /login
3. Логін: admin
4. Пароль: 123456

Перевірте модулі:
- Кандидати
- Вакансії
- Платежі
- Статистика

## Можливі проблеми

### Помилка: DATABASE_URL not found

Рішення:
1. Перевірте змінні в Settings -> Environment Variables
2. Redeploy проекту

### Помилка: Prisma Client generation failed

Рішення:
1. Змініть Build Command на: `prisma generate && next build`
2. Redeploy

### Помилка: Cannot connect to database

Рішення:
1. Перевірте Connection String
2. Додайте `?sslmode=require` в кінці URL
3. Перевірте чи БД активна на Neon

### Помилка 500 на сторінках

Рішення:
1. Перевірте логи: Vercel Dashboard -> Deployments -> Functions
2. Перевірте чи виконано `prisma db push`
3. Перевірте чи є дані в БД

## Custom Domain

1. Settings -> Domains
2. Add Domain
3. Введіть ваш домен
4. Налаштуйте DNS записи:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Оновіть NEXTAUTH_URL:
```
NEXTAUTH_URL=https://yourdomain.com
```

6. Redeploy

## Оптимізація

### Регіон

За замовчуванням: fra1 (Frankfurt, Europe)

Якщо потрібен інший регіон:
vercel.json -> regions: ["iad1"] // США

### Function Timeout

За замовчуванням: 30 секунд

Збільшити: Settings -> Functions -> Max Duration

## Backups

Автоматичні backups на Neon:
1. Neon Dashboard -> Project Settings
2. Backups -> Configure
3. Увімкніть Daily Backups

## Моніторинг

Перевірка статусу:
1. Vercel Dashboard -> Analytics
2. Neon Dashboard -> Monitoring

Логи помилок:
1. Vercel -> Deployments -> Functions
2. Фільтр: Errors Only

## Підтримка

Якщо виникли проблеми:
1. Перевірте логи на Vercel
2. Перевірте Connection String
3. Перевірте Environment Variables
4. Спробуйте Redeploy

## Чеклист успішного деплою

- [ ] БД створено на Neon
- [ ] Connection String скопійовано
- [ ] Проект імпортовано на Vercel
- [ ] Environment Variables додано
- [ ] Deploy успішний
- [ ] prisma db push виконано
- [ ] Seed виконано
- [ ] Логін працює
- [ ] Модулі працюють
- [ ] Custom domain налаштовано (опціонально)

## Фінал

Після успішного деплою ваша CRM буде доступна за адресою:
https://your-app.vercel.app

Змініть пароль admin після першого входу!

Settings -> Users -> Admin -> Change Password

