# Швидке виправлення помилки логіну

## Проблема
База даних на Neon порожня, таблиці не створені.

## Рішення

### Варіант 1: Через локальний термінал (РЕКОМЕНДОВАНО)

1. Скопіюйте DATABASE_URL з Vercel:
   - Vercel Dashboard -> Settings -> Environment Variables
   - Скопіюйте значення DATABASE_URL

2. Виконайте команди:

```bash
cd d:\Personal\ES-server

# Встановіть DATABASE_URL тимчасово
$env:DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Створіть таблиці
npx prisma db push

# Заповніть даними
npm run db:seed
```

### Варіант 2: Через .env файл

1. Створіть файл `.env` в корені проекту:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

2. Виконайте:

```bash
npx prisma db push
npm run db:seed
```

3. Видаліть файл .env (не комітьте його!)

### Перевірка

Після виконання команд:
1. Оновіть сторінку на Vercel
2. Логін: admin або director
3. Пароль: 123456

## Якщо не працює

Перевірте чи правильний DATABASE_URL:
1. Має містити `?sslmode=require` в кінці
2. Має містити правильний пароль
3. База має бути активна на Neon

Приклад правильного URL:
```
postgresql://neondb_owner:npg_xB8CVkSlu9GW@ep-old-sea-ag9q434h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

