import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Створюємо адміністратора
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      fullName: 'Системний Адміністратор',
      branch: 'ЦО',
      email: 'admin@europe-service.com',
      phone: '+380501234567',
      isActive: true,
    },
  })

  console.log('✅ Admin user created:', admin.username)

  // Створюємо тестові дані кандидатів
  const candidates = await Promise.all([
    prisma.candidate.upsert({
      where: { id: 1 },
      update: {},
      create: {
        branch: 'Київ',
        responsible: 'Іван Петренко',
        firstName: 'Олександр',
        lastName: 'Коваленко',
        phone: '+380501234567',
        age: 28,
        candidateCountry: 'Україна',
        vacancyCountry: 'Польща',
        projectName: 'Складські роботи',
        partnerNumber: 'P001',
        arrivalDate: new Date('2024-01-15'),
        candidateStatus: 'Прибув',
        paymentAmount: 1500,
        paymentStatus: 'Оплачено',
        recipientType: 'Фізична особа',
        comment: 'Досвідчений працівник',
        applicationNumber: 'APP001',
        email: 'oleksandr.kovalenko@email.com',
        passportNumber: 'AB1234567',
        passportExpiry: new Date('2025-12-31'),
        education: 'Середня',
        workExperience: '5 років',
        languageSkills: 'Польська - базовий',
        familyStatus: 'Одружений',
        children: 1,
        sortOrder: 1,
        isDeleted: false,
      },
    }),
    prisma.candidate.upsert({
      where: { id: 2 },
      update: {},
      create: {
        branch: 'Львів',
        responsible: 'Марія Іваненко',
        firstName: 'Анна',
        lastName: 'Шевченко',
        phone: '+380671234567',
        age: 25,
        candidateCountry: 'Україна',
        vacancyCountry: 'Німеччина',
        projectName: 'Медицина',
        partnerNumber: 'P002',
        arrivalDate: new Date('2024-02-01'),
        candidateStatus: 'Очікується',
        paymentAmount: 2000,
        paymentStatus: 'Частково оплачено',
        recipientType: 'Фізична особа',
        comment: 'Медична сестра',
        applicationNumber: 'APP002',
        email: 'anna.shevchenko@email.com',
        passportNumber: 'CD2345678',
        passportExpiry: new Date('2026-06-30'),
        education: 'Вища медична',
        workExperience: '3 роки',
        languageSkills: 'Німецька - середній',
        familyStatus: 'Неодружена',
        children: 0,
        sortOrder: 2,
        isDeleted: false,
      },
    }),
    prisma.candidate.upsert({
      where: { id: 3 },
      update: {},
      create: {
        branch: 'Одеса',
        responsible: 'Петро Сидоренко',
        firstName: 'Михайло',
        lastName: 'Петренко',
        phone: '+380931234567',
        age: 32,
        candidateCountry: 'Україна',
        vacancyCountry: 'Чехія',
        projectName: 'Будівництво',
        partnerNumber: 'P003',
        arrivalDate: new Date('2024-01-20'),
        candidateStatus: 'Працює',
        paymentAmount: 1800,
        paymentStatus: 'Оплачено',
        recipientType: 'Фізична особа',
        comment: 'Будівельник',
        applicationNumber: 'APP003',
        email: 'mikhail.petrenko@email.com',
        passportNumber: 'EF3456789',
        passportExpiry: new Date('2025-09-15'),
        education: 'Професійно-технічна',
        workExperience: '8 років',
        languageSkills: 'Чеська - базовий',
        familyStatus: 'Одружений',
        children: 2,
        sortOrder: 3,
        isDeleted: false,
      },
    }),
  ])

  console.log('✅ Candidates created:', candidates.length)

  // Створюємо тестові платежі
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        candidateId: 1,
        amount: 1500,
        paymentDate: new Date('2024-01-10'),
        paymentStatus: 'Оплачено',
        expectedDate: new Date('2024-01-15'),
        recipientType: 'Фізична особа',
        bankAccount: 'UA1234567890123456789012345',
        paymentMethod: 'Банківський переказ',
        referenceNumber: 'REF001',
        comment: 'Повна оплата',
      },
    }),
    prisma.payment.create({
      data: {
        candidateId: 2,
        amount: 1000,
        paymentDate: new Date('2024-01-25'),
        paymentStatus: 'Частково оплачено',
        expectedDate: new Date('2024-02-01'),
        recipientType: 'Фізична особа',
        bankAccount: 'UA2345678901234567890123456',
        paymentMethod: 'Банківський переказ',
        referenceNumber: 'REF002',
        comment: 'Перша частина',
      },
    }),
  ])

  console.log('✅ Payments created:', payments.length)

  // Створюємо тестові витрати
  const expenses = await Promise.all([
    prisma.branchExpense.create({
      data: {
        branch: 'ЦО',
        month: 1,
        year: 2024,
        rent: 15000,
        utilities: 2000,
        office: 3000,
        advertising: 5000,
        other: 1000,
        description: 'Витрати за січень 2024',
      },
    }),
    prisma.branchExpense.create({
      data: {
        branch: 'Рівне',
        month: 1,
        year: 2024,
        rent: 8000,
        utilities: 1500,
        office: 2000,
        advertising: 3000,
        other: 500,
        description: 'Витрати за січень 2024',
      },
    }),
    prisma.branchExpense.create({
      data: {
        branch: 'Київ',
        month: 1,
        year: 2024,
        rent: 12000,
        utilities: 1800,
        office: 2500,
        advertising: 4000,
        other: 700,
        description: 'Витрати за січень 2024',
      },
    }),
  ])

  console.log('✅ Branch expenses created:', expenses.length)

  // Створюємо тестові зарплати
  const salaries = await Promise.all([
    prisma.monthlySalary.create({
      data: {
        userId: admin.id,
        month: 1,
        year: 2024,
        baseSalary: 15000,
        bonus: 3000,
        visaBonus: 1000,
        freeBonus: 500,
        total: 19500,
        indicators: 10,
      },
    }),
  ])

  console.log('✅ Salaries created:', salaries.length)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
