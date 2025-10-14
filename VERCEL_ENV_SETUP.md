# Vercel Environment Variables

## Обов'язкові змінні:

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### JWT Secret
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Next.js
```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-change-this
```

## Опціональні змінні:

### Development
```
NODE_ENV=production
```

### Email (для майбутніх функцій)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Як налаштувати в Vercel:

1. Відкрийте ваш проект в Vercel Dashboard
2. Перейдіть в Settings → Environment Variables
3. Додайте кожну змінну:
   - **Name**: DATABASE_URL
   - **Value**: postgresql://username:password@host:port/database
   - **Environment**: Production, Preview, Development
4. Повторіть для всіх змінних

## База даних для Vercel:

Рекомендовані провайдери:
- **Neon** (безкоштовний tier)
- **Supabase** (безкоштовний tier)
- **PlanetScale** (безкоштовний tier)
- **Railway** (безкоштовний tier)

## Приклад DATABASE_URL:
```
postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```
