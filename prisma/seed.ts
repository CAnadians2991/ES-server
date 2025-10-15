import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const defaultPassword = await bcrypt.hash('123456', 10)

  // Системний адміністратор
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: defaultPassword },
    create: {
      username: 'admin',
      password: defaultPassword,
      role: 'ADMIN',
      fullName: 'Системний Адміністратор',
    },
  })

  // Директор
  await prisma.user.upsert({
    where: { username: 'director' },
    update: { password: defaultPassword },
    create: {
      username: 'director',
      password: defaultPassword,
      role: 'DIRECTOR',
      fullName: 'Директор',
    },
  })

  // Бухгалтер
  await prisma.user.upsert({
    where: { username: 'accountant' },
    update: { password: defaultPassword },
    create: {
      username: 'accountant',
      password: defaultPassword,
      role: 'ACCOUNTANT',
      fullName: 'Бухгалтер',
    },
  })

  // Менеджери для тестування згідно з BUSINESS_LOGIC.md
  await prisma.user.upsert({
    where: { username: 'manager_kiev' },
    update: { password: defaultPassword },
    create: {
      username: 'manager_kiev',
      password: defaultPassword,
      role: 'MANAGER',
      fullName: 'Тетяна Чуприна',
      branch: 'Київ',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { username: 'manager_lviv' },
    update: { password: defaultPassword },
    create: {
      username: 'manager_lviv',
      password: defaultPassword,
      role: 'MANAGER',
      fullName: 'Менеджер Львів',
      branch: 'Львів',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { username: 'manager_odessa' },
    update: { password: defaultPassword },
    create: {
      username: 'manager_odessa',
      password: defaultPassword,
      role: 'MANAGER',
      fullName: 'Діана Сологуб',
      branch: 'Одеса',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { username: 'manager_kharkiv' },
    update: { password: defaultPassword },
    create: {
      username: 'manager_kharkiv',
      password: defaultPassword,
      role: 'MANAGER',
      fullName: 'Менеджер Харків',
      branch: 'Харків',
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { username: 'manager_dnipro' },
    update: { password: defaultPassword },
    create: {
      username: 'manager_dnipro',
      password: defaultPassword,
      role: 'MANAGER',
      fullName: 'Менеджер Дніпро',
      branch: 'Дніпро',
      isActive: true,
    },
  })

  const candidates = [
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Анатолій', lastName: 'Шепотков', phone: '380501234567', age: 22, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'ID Logistics (ZARA)', partnerNumber: '№3', arrivalDate: new Date('2024-10-27'), candidateStatus: 'Готовий до виїзду', paymentAmount: 15000, paymentStatus: 'Очікується', recipientType: 'ТОВ ЕВ', comment: 'Термінова виплата' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Тетяна', lastName: 'Площенюк', phone: '380671234567', age: 34, candidateCountry: 'Україна', vacancyCountry: 'Чехія', projectName: 'DHL AMAZON', partnerNumber: '№1', arrivalDate: new Date('2024-10-28'), candidateStatus: 'Працює', paymentAmount: 12000, paymentStatus: 'Отримано', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Юрій', lastName: 'Сніжко', phone: '380931234567', age: 18, candidateCountry: 'Україна', vacancyCountry: 'Німеччина', projectName: 'Valeo', partnerNumber: '№47', arrivalDate: new Date('2024-11-15'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: 'Перевірити документи' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Олена', lastName: 'Мельник', phone: '380951234567', age: 28, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'Amazon Logistics', partnerNumber: '№5', arrivalDate: new Date('2024-11-01'), candidateStatus: 'Працює', paymentAmount: 18000, paymentStatus: 'Отримано', recipientType: 'ТОВ ПерсоналВорк', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Іван', lastName: 'Петренко', phone: '380661234567', age: 25, candidateCountry: 'Україна', vacancyCountry: 'Чехія', projectName: 'Škoda Auto', partnerNumber: '№2', arrivalDate: new Date('2024-10-30'), candidateStatus: 'В дорозі', paymentAmount: 16000, paymentStatus: 'Очікується', recipientType: 'ФОП Литви', comment: '' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Марія', lastName: 'Коваленко', phone: '380501234568', age: 30, candidateCountry: 'Білорусь', vacancyCountry: 'Польща', projectName: 'Biedronka Logistics', partnerNumber: '№8', arrivalDate: new Date('2024-11-05'), candidateStatus: 'Прибув', paymentAmount: 14000, paymentStatus: 'Очікується', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Дмитро', lastName: 'Сидоренко', phone: '380671234568', age: 27, candidateCountry: 'Україна', vacancyCountry: 'Німеччина', projectName: 'BMW Production', partnerNumber: '№12', arrivalDate: new Date('2024-11-20'), candidateStatus: 'Не зареєстрован', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: 'Чекає документи' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Світлана', lastName: 'Бондаренко', phone: '380931234568', age: 35, candidateCountry: 'Україна', vacancyCountry: 'Чехія', projectName: 'Continental', partnerNumber: '№15', arrivalDate: new Date('2024-10-25'), candidateStatus: 'Працює', paymentAmount: 20000, paymentStatus: 'Отримано', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Андрій', lastName: 'Ткаченко', phone: '380951234568', age: 23, candidateCountry: 'Україна', vacancyCountry: 'Латвія', projectName: 'Rimi Logistics', partnerNumber: '№20', arrivalDate: new Date('2024-11-08'), candidateStatus: 'Готовий до виїзду', paymentAmount: 13000, paymentStatus: 'Очікується', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Наталія', lastName: 'Шевченко', phone: '380661234568', age: 29, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'InPost', partnerNumber: '№7', arrivalDate: new Date('2024-10-29'), candidateStatus: 'Працює', paymentAmount: 17000, paymentStatus: 'Прострочено', recipientType: 'ФОП Литви', comment: 'Прострочка 5 днів' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Сергій', lastName: 'Кравченко', phone: '380501234569', age: 31, candidateCountry: 'Грузія', vacancyCountry: 'Німеччина', projectName: 'Mercedes Production', partnerNumber: '№25', arrivalDate: new Date('2024-11-18'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Вікторія', lastName: 'Морозова', phone: '380671234569', age: 26, candidateCountry: 'Україна', vacancyCountry: 'Румунія', projectName: 'Dacia Auto', partnerNumber: '№30', arrivalDate: new Date('2024-11-12'), candidateStatus: 'Готовий до виїзду', paymentAmount: 12500, paymentStatus: 'Очікується', recipientType: 'ТОВ ПерсоналВорк', comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Максим', lastName: 'Гриценко', phone: '380931234569', age: 24, candidateCountry: 'Україна', vacancyCountry: 'Литва', projectName: 'Maxima Logistics', partnerNumber: '№18', arrivalDate: new Date('2024-11-03'), candidateStatus: 'В дорозі', paymentAmount: 14500, paymentStatus: 'Очікується', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Олександр', lastName: 'Лисенко', phone: '380951234569', age: 32, candidateCountry: 'Білорусь', vacancyCountry: 'Польща', projectName: 'Kaufland', partnerNumber: '№9', arrivalDate: new Date('2024-10-26'), candidateStatus: 'Працює', paymentAmount: 19000, paymentStatus: 'Отримано', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Катерина', lastName: 'Павленко', phone: '380661234569', age: 21, candidateCountry: 'Україна', vacancyCountry: 'Чехія', projectName: 'Tesco Distribution', partnerNumber: '№4', arrivalDate: new Date('2024-11-10'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: 'Новий кандидат' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Денис', lastName: 'Романенко', phone: '380501234570', age: 28, candidateCountry: 'Україна', vacancyCountry: 'Угорщина', projectName: 'Audi Hungary', partnerNumber: '№35', arrivalDate: new Date('2024-11-22'), candidateStatus: 'Не зареєстрован', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Юлія', lastName: 'Сергієнко', phone: '380671234570', age: 33, candidateCountry: 'Україна', vacancyCountry: 'Греція', projectName: 'Olive Production', partnerNumber: '№40', arrivalDate: new Date('2024-12-01'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Віталій', lastName: 'Кравець', phone: '380931234570', age: 27, candidateCountry: 'Україна', vacancyCountry: 'Австрія', projectName: 'Spar Logistics', partnerNumber: '№28', arrivalDate: new Date('2024-11-16'), candidateStatus: 'Готовий до виїзду', paymentAmount: 21000, paymentStatus: 'Очікується', recipientType: 'ФОП Литви', comment: '' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Людмила', lastName: 'Зайцева', phone: '380951234570', age: 36, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'Lidl DC', partnerNumber: '№6', arrivalDate: new Date('2024-10-24'), candidateStatus: 'Працює', paymentAmount: 16500, paymentStatus: 'Отримано', recipientType: 'ТОВ ПерсоналВорк', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Роман', lastName: 'Білий', phone: '380661234570', age: 25, candidateCountry: 'Україна', vacancyCountry: 'Німеччина', projectName: 'Volkswagen', partnerNumber: '№14', arrivalDate: new Date('2024-11-07'), candidateStatus: 'Прибув', paymentAmount: 22000, paymentStatus: 'Очікується', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Ірина', lastName: 'Гончарова', phone: '380501234571', age: 29, candidateCountry: 'Білорусь', vacancyCountry: 'Чехія', projectName: 'Bosch Production', partnerNumber: '№16', arrivalDate: new Date('2024-11-04'), candidateStatus: 'В дорозі', paymentAmount: 18500, paymentStatus: 'Очікується', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Павло', lastName: 'Степаненко', phone: '380671234571', age: 22, candidateCountry: 'Україна', vacancyCountry: 'Латвія', projectName: 'Lidl Baltics', partnerNumber: '№22', arrivalDate: new Date('2024-11-14'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Оксана', lastName: 'Васильєва', phone: '380931234571', age: 31, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'Auchan', partnerNumber: '№10', arrivalDate: new Date('2024-10-31'), candidateStatus: 'Працює', paymentAmount: 15500, paymentStatus: 'Прострочено', recipientType: 'ФОП Литви', comment: 'Прострочка 3 дні' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Богдан', lastName: 'Ковальчук', phone: '380951234571', age: 26, candidateCountry: 'Україна', vacancyCountry: 'Румунія', projectName: 'Ford Romania', partnerNumber: '№32', arrivalDate: new Date('2024-11-19'), candidateStatus: 'Готовий до виїзду', paymentAmount: 13500, paymentStatus: 'Очікується', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Анна', lastName: 'Коломієць', phone: '380661234571', age: 24, candidateCountry: 'Грузія', vacancyCountry: 'Литва', projectName: 'Norfa Logistics', partnerNumber: '№19', arrivalDate: new Date('2024-11-09'), candidateStatus: 'В дорозі', paymentAmount: 14000, paymentStatus: 'Очікується', recipientType: 'ТОВ ПерсоналВорк', comment: '' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Микола', lastName: 'Савченко', phone: '380501234572', age: 34, candidateCountry: 'Україна', vacancyCountry: 'Угорщина', projectName: 'Samsung Hungary', partnerNumber: '№36', arrivalDate: new Date('2024-11-25'), candidateStatus: 'Не зареєстрован', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: 'Очікує підтвердження' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Валентина', lastName: 'Литвин', phone: '380671234572', age: 28, candidateCountry: 'Україна', vacancyCountry: 'Греція', projectName: 'Hotel Crete', partnerNumber: '№42', arrivalDate: new Date('2024-12-05'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Артем', lastName: 'Приходько', phone: '380931234572', age: 30, candidateCountry: 'Україна', vacancyCountry: 'Австрія', projectName: 'Hofer Distribution', partnerNumber: '№27', arrivalDate: new Date('2024-11-11'), candidateStatus: 'Готовий до виїзду', paymentAmount: 19500, paymentStatus: 'Очікується', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Галина', lastName: 'Федорова', phone: '380951234572', age: 32, candidateCountry: 'Білорусь', vacancyCountry: 'Німеччина', projectName: 'Porsche Leipzig', partnerNumber: '№45', arrivalDate: new Date('2024-11-21'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Ігор', lastName: 'Мартиненко', phone: '380661234572', age: 27, candidateCountry: 'Україна', vacancyCountry: 'Польща', projectName: 'DPD Poland', partnerNumber: '№11', arrivalDate: new Date('2024-11-02'), candidateStatus: 'Працює', paymentAmount: 17500, paymentStatus: 'Отримано', recipientType: 'ФОП Литви', comment: '' },
    { branch: 'ЦО', responsible: 'Тетяна Чуприна', firstName: 'Тамара', lastName: 'Новікова', phone: '380501234573', age: 35, candidateCountry: 'Україна', vacancyCountry: 'Чехія', projectName: 'Penny Market', partnerNumber: '№17', arrivalDate: new Date('2024-10-28'), candidateStatus: 'Працює', paymentAmount: 16000, paymentStatus: 'Отримано', recipientType: 'ТОВ ЕВ', comment: '' },
    { branch: 'Рівне', responsible: 'Наталія Жиган', firstName: 'Володимир', lastName: 'Семенов', phone: '380671234573', age: 23, candidateCountry: 'Україна', vacancyCountry: 'Латвія', projectName: 'Top Logistics', partnerNumber: '№21', arrivalDate: new Date('2024-11-13'), candidateStatus: 'В дорозі', paymentAmount: 13000, paymentStatus: 'Очікується', recipientType: 'ТОВ ПерсоналВорк', comment: '' },
    { branch: 'Одеса', responsible: 'Діана Сологуб', firstName: 'Лариса', lastName: 'Ткач', phone: '380931234573', age: 29, candidateCountry: 'Грузія', vacancyCountry: 'Польща', projectName: 'Carrefour', partnerNumber: '№13', arrivalDate: new Date('2024-11-06'), candidateStatus: 'Прибув', paymentAmount: 15000, paymentStatus: 'Очікується', recipientType: 'ФОП Коктов', comment: '' },
    { branch: 'Київ', responsible: 'Тетяна Чуприна', firstName: 'Едуард', lastName: 'Соколов', phone: '380951234573', age: 31, candidateCountry: 'Україна', vacancyCountry: 'Румунія', projectName: 'Metro Cash', partnerNumber: '№31', arrivalDate: new Date('2024-11-17'), candidateStatus: 'Готовий до виїзду', paymentAmount: 14500, paymentStatus: 'Очікується', recipientType: 'ФОП Литви', comment: '' },
    { branch: 'Житомир', responsible: 'Наталія Жиган', firstName: 'Марина', lastName: 'Григоренко', phone: '380661234573', age: 26, candidateCountry: 'Україна', vacancyCountry: 'Німеччина', projectName: 'Opel Production', partnerNumber: '№48', arrivalDate: new Date('2024-11-23'), candidateStatus: 'Зареєстровано', paymentAmount: 0, paymentStatus: null, recipientType: null, comment: 'VIP клієнт' }
  ]

  for (const candidate of candidates) {
    await prisma.candidate.create({
      data: candidate,
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

