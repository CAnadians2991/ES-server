# Інструкція по запуску проекту Європа Сервіс CRM

Детальна інструкція з встановлення та налаштування проекту.

## Крок 1: Встановлення Node.js

Переконайтеся що у вас встановлено Node.js версії 18 або вище.

```bash
node --version
```

Якщо Node.js не встановлено, завантажте його з [nodejs.org](https://nodejs.org/)

## Крок 2: Клонування проекту

Проект вже створено в директорії `ES_Server`.

```bash
cd ES_Server
```

## Крок 3: Встановлення залежностей

```bash
npm install
```

Це встановить всі необхідні пакети з `package.json`:
- Next.js 14
- React 18
- Prisma (ORM)
- Shadcn UI компоненти
- Zod (валідація)
- Zustand (state management)
- та інші

## Крок 4: Налаштування бази даних

## Виправлення помилок

Якщо при спробі зайти на модуль виникає помилка, виконайте наступні кроки:

1. **Перегенеруйте Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Перезапустіть dev-сервер** (Ctrl+C для зупинки, потім знову):
   ```bash
   npm run dev
   ```

3. **Якщо помилка залишається**, оновіть базу даних:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

База даних SQLite вже налаштована. Файл `.env` знаходиться в корені проекту з налаштуваннями:

```env
DATABASE_URL="file:./dev.db"
PAYMENTS_PASSWORD="1111"
ADMIN_CODE="222"
```

Створіть базу даних та таблиці:

```bash
npm run db:push
```

Заповніть базу тестовими даними:

```bash
npm run db:seed
```

## Крок 5: Запуск проекту

Запустіть development сервер:

```bash
npm run dev
```

Проект запуститься на [http://localhost:3000](http://localhost:3000)

## Крок 6: Перевірка роботи

Відкрийте браузер та перейдіть на:
- Головна сторінка: [http://localhost:3000](http://localhost:3000)
- Кандидати: [http://localhost:3000/candidates](http://localhost:3000/candidates)
- Оплати: [http://localhost:3000/payments](http://localhost:3000/payments) (пароль: 1111)
- Статистика: [http://localhost:3000/statistics](http://localhost:3000/statistics)

## Додаткові команди

### Управління базою даних

Відкрити Prisma Studio для перегляду даних:

```bash
npm run db:studio
```

Це відкриє візуальний інтерфейс на [http://localhost:5555](http://localhost:5555)

### Збірка для production

```bash
npm run build
npm start
```

### Перезапуск бази даних

Якщо потрібно очистити базу та створити заново:

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## Структура проекту

```
ES_Server/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── candidates/        # Сторінка кандидатів
│   ├── payments/          # Сторінка оплат
│   ├── statistics/        # Сторінка статистики
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Головна сторінка
│   └── globals.css        # Глобальні стилі
├── components/            # React компоненти
│   ├── ui/               # Shadcn UI компоненти
│   ├── candidates/       # Компоненти для кандидатів
│   └── ...
├── lib/                   # Утиліти та конфігурація
│   ├── prisma.ts         # Prisma client
│   ├── api.ts            # API клієнт
│   └── utils.ts          # Допоміжні функції
├── hooks/                 # React hooks
├── types/                 # TypeScript типи
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # Схема бази даних
│   └── seed.ts           # Seed data
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## Основні функції

### Модуль Кандидатів

- Перегляд всіх кандидатів
- Додавання нового кандидата
- Редагування кандидата
- Видалення кандидата
- Фільтрація по філіях, країнах, статусах
- Фільтрація по місяцях та рокам

### Модуль Оплат

- Захист паролем (пароль: 1111)
- Перегляд історії платежів
- Статистика оплат
- Фільтрація по статусах та реквізитах

### Модуль Статистики

- Загальна статистика по кандидатах
- Воронка конверсії
- Фінансова ефективність
- Аналітика по партнерах

## Зміна паролів

### Пароль модуля оплат

Для зміни пароля модуля оплат:
1. Змініть `PAYMENTS_PASSWORD` в файлі `.env`
2. Запустіть повторно `npm run db:seed`

### Код підтвердження для зміни пароля

Для зміни коду адміністратора:
1. Змініть `ADMIN_CODE` в файлі `.env`
2. Запустіть повторно `npm run db:seed`

## Вирішення проблем

### Помилка при встановленні залежностей

```bash
rm -rf node_modules package-lock.json
npm install
```

### Помилка з базою даних

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Порт вже зайнятий

Змініть порт в команді запуску:

```bash
PORT=3001 npm run dev
```

## Підтримка

Для питань та підтримки звертайтеся до технічної команди.

