# Європа Сервіс CRM

Професійна CRM система для кадрового агенства з повним циклом управління кандидатами, вакансіями та фінансами.

## Технології

**Frontend**
- Next.js 14 з App Router
- React 18 з TypeScript
- Shadcn UI та Radix UI
- Tailwind CSS
- Zustand для стану
- React Hook Form для форм

**Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT автентифікація
- Zod валідація

## Функціонал

1. Управління кандидатами з inline редагуванням
2. Вакансії та подання
3. Система платежів
4. Виплати партнерів
5. Зарплати співробітників
6. Витрати філій
7. Детальна статистика
8. Audit Log, мяке видалення
9. Рольова система доступу
10. Відновлення видалених записів

## Ролі користувачів

- ADMIN - повний доступ
- DIRECTOR - управління та статистика
- RECRUITMENT_DIRECTOR - виплати партнерів
- ACCOUNTANT - фінансові операції
- BRANCH_MANAGER - управління філією
- ADMINISTRATOR - кандидати та вакансії
- MANAGER - базове управління

## Локальна розробка

### 1. Клонування проекту

```bash
git clone <repository-url>
cd ES-server
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування бази даних

Створіть .env файл:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NODE_ENV="development"
```

### 4. Ініціалізація БД

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Запуск

```bash
npm run dev
```

Відкрийте http://localhost:3000

Логін: admin
Пароль: 123456

## Деплой на Vercel

### Підготовка

1. Створіть PostgreSQL базу на Neon.tech
2. Отримайте Connection String
3. Залийте код на GitHub

### Крок 1: Підключення до Vercel

1. Зайдіть на vercel.com
2. New Project
3. Імпортуйте ваш GitHub репозиторій
4. Виберіть проект ES-server

### Крок 2: Environment Variables

В Vercel Dashboard додайте змінні:

```
DATABASE_URL = postgresql://...вашаБД...
JWT_SECRET = your-production-secret-key
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = your-production-nextauth-secret
NODE_ENV = production
```

### Крок 3: Build Settings

Framework Preset: Next.js
Build Command: prisma generate && next build
Output Directory: .next
Install Command: npm install

### Крок 4: Deploy

Натисніть Deploy та зачекайте на завершення білду.

### Крок 5: Ініціалізація БД

Після успішного деплою виконайте seed:

```bash
npm install -g vercel
vercel login
vercel env pull .env.production.local
npx prisma db push
npm run db:seed
```

Або через Vercel Dashboard:
1. Settings -> Functions
2. Створіть функцію для одноразового seed

### Налаштування Custom Domain

1. Settings -> Domains
2. Додайте ваш домен
3. Налаштуйте DNS записи
4. Оновіть NEXTAUTH_URL

## Можливі помилки білду

### Помилка: Prisma Client not generated

Рішення: Додайте postinstall скрипт

```json
"postinstall": "prisma generate"
```

### Помилка: Module not found

Рішення: Перевірте імпорти, всі шляхи мають бути відносними або через @/

### Помилка: Database connection failed

Рішення: 
1. Перевірте DATABASE_URL
2. Додайте ?sslmode=require для PostgreSQL
3. Перевірте IP whitelist на Neon

### Помилка: Build timeout

Рішення:
1. Видаліть node_modules та .next
2. Збільшіть timeout у vercel.json
3. Оптимізуйте залежності

## Структура проекту

```
ES-server/
├── app/
│   ├── api/              # API endpoints
│   ├── [pages]/          # Сторінки додатку
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Глобальні стилі
├── components/
│   ├── ui/               # UI компоненти
│   ├── candidates/       # Компоненти кандидатів
│   └── auth/             # Автентифікація
├── lib/
│   ├── api.ts            # API клієнт
│   ├── auth.ts           # Автентифікація
│   ├── audit-log.ts      # Audit логування
│   ├── prisma.ts         # Prisma клієнт
│   └── utils.ts          # Утиліти
├── hooks/
│   ├── use-auth.ts       # Хук автентифікації
│   ├── use-candidates.ts # Хук кандидатів
│   └── use-toast.ts      # Хук сповіщень
├── types/
│   └── index.ts          # TypeScript типи
├── prisma/
│   ├── schema.prisma     # Схема БД
│   ├── seed.ts           # Seed для SQLite
│   └── seed-postgresql.ts # Seed для PostgreSQL
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── vercel.json
```

## База даних

Основні таблиці:

- Candidate - кандидати з мяким видаленням
- User - користувачі системи
- Vacancy - вакансії партнерів
- Application - подання кандидатів
- Payment - платежі
- MonthlySalary - зарплати
- BranchExpense - витрати філій
- AuditLog - історія змін

## Безпека

- JWT токени для автентифікації
- Рольова система доступу
- Валідація Zod на всіх входах
- Мяке видалення даних
- Audit Log для всіх змін
- Захист API endpoints

## Оптимізація

- Пагінація до 100 записів
- Віртуалізація списків
- Debounce для API запитів
- Server Components де можливо
- Оптимізовані Prisma запити
- Індекси на всіх ключових полях

## Особливості

**Audit Log**
- Автоматичне логування всіх змін
- Збереження старих та нових значень
- Можливість відкату змін
- Доступ тільки для ADMIN

**Мяке видалення**
- isDeleted замість фізичного видалення
- Можливість відновлення
- Збереження історії
- Модуль Видалені записи

**Inline редагування**
- Редагування прямо в таблиці
- Миттєве збереження
- Debounce оптимізація
- Валідація на льоту

## Команди розробки

```bash
# Запуск dev сервера
npm run dev

# Білд для production
npm run build
npm start

# Робота з БД
npx prisma studio          # UI для БД
npx prisma db push         # Створити таблиці
npm run db:seed            # Заповнити даними
npx prisma generate        # Згенерувати клієнт

# Лінтинг
npm run lint
```

## Environment Variables

### Обовязкові

```env
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET               # Секрет для JWT токенів
NEXTAUTH_URL            # URL застосунку
NEXTAUTH_SECRET         # Секрет для NextAuth
NODE_ENV                # development або production
```

### Опціональні

```env
SMTP_HOST               # Для email (майбутнє)
SMTP_PORT               # Для email
SMTP_USER               # Для email
SMTP_PASS               # Для email
```

## Підтримка PostgreSQL

Проект працює з PostgreSQL на Vercel через Neon.tech:

1. Створіть безкоштовну БД на neon.tech
2. Скопіюйте Connection String
3. Додайте в Environment Variables
4. Виконайте prisma db push
5. Запустіть seed для тестових даних

## Тестові дані

Після seed команди створюються:

**Користувач:**
- Логін: admin
- Пароль: 123456
- Роль: ADMIN

**Тестові кандидати:** 50 записів
**Тестові вакансії:** 20 записів
**Тестові платежі:** автоматично

## Troubleshooting

### Не працює inline редагування

Перевірте:
1. Права доступу користувача
2. Консоль браузера на помилки
3. Network tab на API запити

### Помилка підключення до БД

1. Перевірте DATABASE_URL
2. Додайте ?sslmode=require
3. Whitelist IP на Neon

### Повільна робота

1. Зменшіть ліміт записів
2. Очистіть кеш браузера
3. Перевірте індекси БД

### Помилки TypeScript

1. Видаліть .next та node_modules
2. npm install
3. npx prisma generate
4. npm run dev

## Продакшн чеклист

- [ ] Змінити JWT_SECRET на випадковий
- [ ] Змінити NEXTAUTH_SECRET
- [ ] Налаштувати PostgreSQL на Neon
- [ ] Додати всі Environment Variables
- [ ] Виконати prisma db push
- [ ] Запустити seed
- [ ] Налаштувати custom domain
- [ ] Оновити NEXTAUTH_URL
- [ ] Перевірити всі модулі
- [ ] Створити тестового admin
- [ ] Налаштувати backups

## Ліцензія

Приватна власність компанії Європа Сервіс.

## Контакти

Для питань та підтримки звертайтесь до команди розробки.

---

Made with Next.js 14 + TypeScript + Prisma + PostgreSQL
