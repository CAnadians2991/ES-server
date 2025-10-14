# Налаштування PostgreSQL для Europe Service CRM

## Варіант 1: Локальна установка PostgreSQL

### Встановлення на macOS:
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Створення бази даних:
```bash
createdb europeservice_crm
```

### Налаштування .env:
```
DATABASE_URL="postgresql://your_username@localhost:5432/europeservice_crm"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

Замініть `your_username` на ваше ім'я користувача macOS.

## Варіант 2: Docker (рекомендовано)

### Встановлення Docker Desktop:
1. Завантажте з https://www.docker.com/products/docker-desktop
2. Встановіть Docker Desktop
3. Запустіть Docker Desktop

### Запуск PostgreSQL:
```bash
docker compose up -d
```

### .env вже налаштовано:
```
DATABASE_URL="postgresql://europeservice:europeservice123@localhost:5432/europeservice_crm"
```

## Варіант 3: Хмарна база даних (для продакшн)

### Supabase (безкоштовно):
1. Зареєструйтесь на https://supabase.com
2. Створіть новий проект
3. Скопіюйте Connection String
4. Вставте в .env

### Neon (безкоштовно):
1. Зареєструйтесь на https://neon.tech
2. Створіть базу даних
3. Скопіюйте Connection String
4. Вставте в .env

### Railway (платно $5/міс):
1. Зареєструйтесь на https://railway.app
2. Додайте PostgreSQL Plugin
3. Скопіюйте DATABASE_URL
4. Вставте в .env

## Після налаштування PostgreSQL:

### 1. Застосувати схему:
```bash
npx prisma db push
```

### 2. Заповнити тестовими даними:
```bash
npm run db:seed-full
```

### 3. Запустити проект:
```bash
npm run dev
```

## Переваги PostgreSQL:

- Швидкість запитів: в 3-5 разів швидше ніж SQLite
- Масштабування: підтримує мільйони записів
- Concurrent writes: декілька користувачів одночасно
- Повнотекстовий пошук
- JSON поля
- Складні запити з JOIN

## Моніторинг:

```bash
# Prisma Studio
npx prisma studio

# Перевірка з'єднання
psql -h localhost -U europeservice -d europeservice_crm
```

## Бекап:

```bash
# Створити бекап
pg_dump -h localhost -U europeservice europeservice_crm > backup.sql

# Відновити з бекапу
psql -h localhost -U europeservice europeservice_crm < backup.sql
```

