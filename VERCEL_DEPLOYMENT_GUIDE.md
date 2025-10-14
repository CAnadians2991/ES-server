# 🚀 Деплой Європа Сервіс CRM на Vercel

## ✅ **Що вже підготовлено:**

1. **Vercel конфігурація** - `vercel.json`
2. **PostgreSQL схема** - `prisma/schema.prisma`
3. **Seed файл** - `prisma/seed-postgresql.ts`
4. **Package.json** - оновлено для продакшену
5. **Environment variables** - `VERCEL_ENV_SETUP.md`

## 🗄️ **Крок 1: Налаштування бази даних**

### Варіант 1: Neon (рекомендовано)
1. Відкрийте [neon.tech](https://neon.tech)
2. Створіть безкоштовний акаунт
3. Створіть новий проект
4. Скопіюйте connection string

### Варіант 2: Supabase
1. Відкрийте [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Перейдіть в Settings → Database
4. Скопіюйте connection string

### Варіант 3: Railway
1. Відкрийте [railway.app](https://railway.app)
2. Створіть новий проект
3. Додайте PostgreSQL service
4. Скопіюйте connection string

## 🔧 **Крок 2: Налаштування Vercel**

### 2.1 Environment Variables
В Vercel Dashboard → Settings → Environment Variables додайте:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-change-this
NODE_ENV=production
```

### 2.2 Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 🚀 **Крок 3: Деплой**

### 3.1 Автоматичний деплой
1. Підключіть GitHub репозиторій до Vercel
2. Vercel автоматично зробить деплой при push

### 3.2 Ручний деплой
```bash
# Встановіть Vercel CLI
npm i -g vercel

# Логін в Vercel
vercel login

# Деплой
vercel --prod
```

## 🗃️ **Крок 4: Налаштування бази даних після деплою**

### 4.1 Підключення до бази даних
```bash
# Встановіть Prisma CLI
npm install -g prisma

# Підключіться до бази даних
prisma db push

# Запустіть seed
npm run db:seed-pg
```

### 4.2 Альтернативно через Vercel CLI
```bash
# Встановіть залежності
vercel env pull .env.local

# Підключіть базу даних
npx prisma db push

# Запустіть seed
npx tsx prisma/seed-postgresql.ts
```

## 🔐 **Крок 5: Налаштування безпеки**

### 5.1 JWT Secret
Генеруйте випадковий JWT secret:
```bash
openssl rand -base64 32
```

### 5.2 Database SSL
Переконайтеся що DATABASE_URL містить `?sslmode=require`

## 🧪 **Крок 6: Тестування**

### 6.1 Перевірка деплою
1. Відкрийте URL вашого додатку
2. Перевірте що сторінка завантажується
3. Спробуйте увійти як admin/123456

### 6.2 Перевірка бази даних
1. Перейдіть до модуля "Кандидати"
2. Перевірте що дані завантажуються
3. Спробуйте додати нового кандидата

## 🐛 **Розв'язання проблем**

### Проблема 1: Build Error
```bash
# Перевірте логи в Vercel Dashboard
# Найчастіші причини:
# - Відсутні environment variables
# - Помилки в TypeScript
# - Проблеми з Prisma
```

### Проблема 2: Database Connection Error
```bash
# Перевірте DATABASE_URL
# Переконайтеся що база даних доступна
# Перевірте SSL налаштування
```

### Проблема 3: Prisma Client Error
```bash
# Перегенеруйте Prisma Client
npx prisma generate

# Перезапустіть деплой
```

## 📊 **Моніторинг**

### Vercel Analytics
1. Увімкніть Vercel Analytics
2. Відстежуйте продуктивність
3. Моніторьте помилки

### Database Monitoring
1. Використовуйте вбудовані інструменти провайдера
2. Налаштуйте алерти
3. Моніторьте використання ресурсів

## 🔄 **Оновлення**

### Автоматичні оновлення
- Push в main branch → автоматичний деплой
- Pull Request → preview deployment

### Ручні оновлення
```bash
# Оновлення бази даних
npx prisma db push

# Перегенерація клієнта
npx prisma generate

# Перезапуск деплою
vercel --prod
```

## 📞 **Підтримка**

Якщо виникнуть проблеми:
1. Перевірте логи в Vercel Dashboard
2. Перевірте environment variables
3. Перевірте підключення до бази даних
4. Зверніться до команди розробки

---

**Деплой готовий!** 🚀

Всі файли підготовлені для успішного деплою на Vercel.
