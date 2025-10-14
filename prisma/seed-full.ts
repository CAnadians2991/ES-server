import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const branches = ['ЦО', 'Рівне', 'Київ', 'Одеса']
const countries = ['Польща', 'Чехія', 'Німеччина', 'Латвія', 'Румунія', 'Литва', 'Угорщина', 'Греція', 'Австрія']
const candidateCountries = ['Україна', 'Білорусь', 'Грузія']
const statuses = ['Зареєстровано', 'Не зареєстрован', 'Готовий до виїзду', 'В дорозі', 'Прибув', 'Працює', 'Завершив роботу', 'Не доїхав']
const paymentStatuses = ['Очікується', 'Отримано', 'Прострочено']
const recipients = ['ТОВ ЕВ', 'ФОП Коктов', 'ФОП Литви', 'ТОВ ПерсоналВорк']
const packageTypes = ['Базовий', 'Стандарт', 'Преміум', 'Безкоштовний']
const packagePrices = { 'Базовий': 999, 'Стандарт': 1499, 'Преміум': 2299, 'Безкоштовний': 0 }

const firstNames = ['Анатолій', 'Тетяна', 'Юрій', 'Олена', 'Іван', 'Марія', 'Дмитро', 'Світлана', 'Андрій', 'Наталія', 'Сергій', 'Вікторія', 'Максим', 'Олександр', 'Катерина', 'Денис', 'Юлія', 'Віталій', 'Людмила', 'Роман', 'Ірина', 'Павло', 'Оксана', 'Богдан', 'Анна', 'Микола', 'Валентина', 'Артем', 'Галина', 'Ігор', 'Тамара', 'Володимир', 'Лариса', 'Едуард', 'Марина']
const lastNames = ['Шепотков', 'Площенюк', 'Сніжко', 'Мельник', 'Петренко', 'Коваленко', 'Сидоренко', 'Бондаренко', 'Ткаченко', 'Шевченко', 'Кравченко', 'Морозова', 'Гриценко', 'Лисенко', 'Павленко', 'Романенко', 'Сергієнко', 'Кравець', 'Зайцева', 'Білий', 'Гончарова', 'Степаненко', 'Васильєва', 'Ковальчук', 'Коломієць', 'Савченко', 'Литвин', 'Приходько', 'Федорова', 'Мартиненко', 'Новікова', 'Семенов', 'Ткач', 'Соколов', 'Григоренко']

const projects = ['ID Logistics (ZARA)', 'DHL AMAZON', 'Valeo', 'Amazon Logistics', 'Škoda Auto', 'Biedronka Logistics', 'BMW Production', 'Continental', 'Rimi Logistics', 'InPost', 'Mercedes Production', 'Dacia Auto', 'Maxima Logistics', 'Kaufland', 'Tesco Distribution', 'Audi Hungary', 'Olive Production', 'Spar Logistics', 'Lidl DC', 'Volkswagen', 'Bosch Production', 'Lidl Baltics', 'Auchan', 'Ford Romania', 'Norfa Logistics', 'Samsung Hungary', 'Hotel Crete', 'Hofer Distribution', 'Porsche Leipzig', 'DPD Poland', 'Penny Market', 'Top Logistics', 'Carrefour', 'Metro Cash', 'Opel Production']

const managerNames = [
  'Тетяна Чуприна', 'Наталія Жиган', 'Діана Сологуб', 'Олександр Петров', 'Ірина Коваль',
  'Максим Савченко', 'Юлія Мельник', 'Андрій Бойко', 'Світлана Ткач', 'Дмитро Кравець',
  'Олена Литвин', 'Сергій Романюк', 'Вікторія Поліщук', 'Ігор Шевчук', 'Катерина Білоус',
  'Павло Мороз', 'Вікторія Сидорова', 'Роман Гончар', 'Марина Кравчук', 'Валентин Бойко',
  'Тарас Шевчук', 'Оксана Терещенко', 'Ярослав Коваль', 'Анастасія Грищенко', 'Богдан Кучма',
  'Лідія Мельник', 'Євген Савченко', 'Алла Романова', 'Руслан Павленко', 'Ніна Соколова',
  'Василь Литвиненко', 'Галина Іванова', 'Станіслав Король', 'Людмила Дмитренко', 'Артур Ткач',
  'Тамара Зайцева', 'Микита Волков', 'Віра Павлюк', 'Степан Олійник', 'Раїса Бондар',
  'Костянтин Левченко', 'Надія Ковальчук', 'Олег Білий', 'Марія Гнатюк', 'Ілля Приходько',
  'Зоя Сергієнко', 'Віктор Мартинюк', 'Лариса Кузнецова', 'Геннадій Яценко', 'Ганна Федорова',
  'Петро Чорний', 'Любов Михайленко', 'Ростислав Данилюк', 'Тетяна Гордієнко', 'Григорій Сердюк',
  'Алла Демченко', 'Ярослава Матвієнко', 'Борис Панасюк', 'Клавдія Поліщук', 'Федір Лазаренко',
  'Софія Величко', 'Анатолій Коломієць', 'Віолета Рибак', 'Семен Гаврилюк', 'Зінаїда Савчук',
  'Мирослав Луценко', 'Раїса Червоненко', 'Юрій Гриценко', 'Емілія Сухомлин', 'Святослав Ярош'
]

const adminNames = ['Марія Іванова', 'Олег Петренко', 'Наталя Сидоренко', 'Віктор Коваленко', 'Анна Шевченко']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(startMonth: number, year: number): Date {
  const daysInMonth = new Date(year, startMonth, 0).getDate()
  const day = randomInt(1, daysInMonth)
  return new Date(year, startMonth - 1, day)
}

function generatePhone(): string {
  return `38067${randomInt(1000000, 9999999)}`
}

async function main() {
  console.log('Очищення бази даних...')
  await prisma.monthlySalary.deleteMany({})
  await prisma.branchExpense.deleteMany({})
  await prisma.visaSale.deleteMany({})
  await prisma.application.deleteMany({})
  await prisma.vacancy.deleteMany({})
  await prisma.payment.deleteMany({})
  await prisma.candidate.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Створення користувачів...')
  const defaultPassword = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: {
      username: 'admin',
      password: defaultPassword,
      role: 'ADMIN',
      fullName: 'Системний Адміністратор',
      salary: 0,
    },
  })

  await prisma.user.create({
    data: {
      username: 'director',
      password: defaultPassword,
      role: 'DIRECTOR',
      fullName: 'Генеральний Директор',
      salary: 0,
    },
  })

  await prisma.user.create({
    data: {
      username: 'recruitment_director',
      password: defaultPassword,
      role: 'RECRUITMENT_DIRECTOR',
      fullName: 'Директор Рекрутації',
      salary: 0,
    },
  })

  await prisma.user.create({
    data: {
      username: 'accountant',
      password: defaultPassword,
      role: 'ACCOUNTANT',
      fullName: 'Головний Бухгалтер',
      salary: 28000,
    },
  })

  const branchManagers = []
  for (let i = 0; i < branches.length; i++) {
    const manager = await prisma.user.create({
      data: {
        username: `branch_${branches[i].toLowerCase()}`,
        password: defaultPassword,
        role: 'BRANCH_MANAGER',
        fullName: `Керівник ${branches[i]}`,
        branch: branches[i],
        salary: 0,
      },
    })
    branchManagers.push(manager)
  }

  const administrators = []
  for (let i = 0; i < adminNames.length; i++) {
    const admin = await prisma.user.create({
      data: {
        username: `administrator${i + 1}`,
        password: defaultPassword,
        role: 'ADMINISTRATOR',
        fullName: adminNames[i],
        salary: randomInt(22000, 30000),
      },
    })
    administrators.push(admin)
  }

  const managers = []
  for (let i = 0; i < managerNames.length; i++) {
    const branch = randomItem(branches)
    const manager = await prisma.user.create({
      data: {
        username: `manager${i + 1}`,
        password: defaultPassword,
        role: 'MANAGER',
        fullName: managerNames[i],
        branch: branch,
        salary: randomInt(8000, 18000),
      },
    })
    managers.push(manager)
  }

  console.log('Створення вакансій...')
  const vacancies = []
  for (let i = 0; i < 50; i++) {
    const vacancy = await prisma.vacancy.create({
      data: {
        country: randomItem(countries),
        projectName: randomItem(projects),
        partnerName: `№${randomInt(1, 50)}`,
        salary: `${randomInt(1200, 3500)} €`,
        workType: randomItem(['Логістика', 'Виробництво', 'Готель', 'Будівництво', 'Склад']),
        requirements: randomItem(['Досвід не потрібен', 'Досвід 1+ років', 'Знання мови B1', null]),
        isPriority: Math.random() > 0.8,
        isActive: Math.random() > 0.2,
      },
    })
    vacancies.push(vacancy)
  }

  console.log('Створення кандидатів та подань (9000+ записів)...')
  
  const startYear = 2024
  const startMonth = 8
  const monthsToGenerate = 15
  
  let candidateCounter = 0

  for (let monthOffset = 0; monthOffset < monthsToGenerate; monthOffset++) {
    const currentMonth = ((startMonth + monthOffset - 1) % 12) + 1
    const currentYear = startYear + Math.floor((startMonth + monthOffset - 1) / 12)
    
    console.log(`Генерація даних для ${currentMonth}/${currentYear}...`)
    
    const candidatesPerMonth = randomInt(580, 620)
    
    for (let i = 0; i < candidatesPerMonth; i++) {
      candidateCounter++
      const branch = randomItem(branches)
      const branchManagers = managers.filter(m => m.branch === branch)
      const manager = branchManagers.length > 0 ? randomItem(branchManagers) : randomItem(managers)
      const responsible = manager.fullName
      const country = randomItem(countries)
      const status = randomItem(statuses)
      const packageType = randomItem(packageTypes)
      const isFree = packageType === 'Безкоштовний'
      
      const arrivalDate = randomDate(currentMonth, currentYear)
      
      let paymentAmount = 0
      let paymentStatus = null
      let recipientType = null
      
      if (status === 'Працює' || status === 'Завершив роботу') {
        paymentAmount = randomInt(12000, 25000)
        paymentStatus = randomItem(paymentStatuses)
        recipientType = randomItem(recipients)
      }

      const candidate = await prisma.candidate.create({
        data: {
          branch,
          responsible,
          firstName: randomItem(firstNames),
          lastName: randomItem(lastNames),
          phone: generatePhone(),
          age: randomInt(18, 55),
          candidateCountry: randomItem(candidateCountries),
          vacancyCountry: country,
          projectName: randomItem(projects),
          partnerNumber: `№${randomInt(1, 50)}`,
          arrivalDate,
          candidateStatus: status,
          paymentAmount,
          paymentStatus,
          recipientType,
          comment: Math.random() > 0.7 ? randomItem(['Терміново', 'VIP', 'Перевірити', null]) : null,
        },
      })

      const vacancy = randomItem(vacancies.filter(v => v.country === country))
      
      const application = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          vacancyId: vacancy.id,
          managerId: manager.id,
          packageType,
          packagePrice: packagePrices[packageType as keyof typeof packagePrices],
          isFree,
          status: randomItem(['Поданий', 'Підтверджено', 'Відхилено', 'В обробці']),
          arrivedStatus: status === 'Прибув' || status === 'Працює' ? 'Доїхав' : null,
          workedStatus: status === 'Працює' || status === 'Завершив роботу' ? 'Відпрацював' : null,
          partnerPayment: status === 'Працює' || status === 'Завершив роботу' ? randomInt(8000, 20000) : null,
          paymentDays: status === 'Працює' || status === 'Завершив роботу' ? randomInt(14, 60) : null,
        },
      })

      if (Math.random() > 0.7) {
        await prisma.visaSale.create({
          data: {
            candidateId: candidate.id,
            managerId: manager.id,
            price: 6500,
            commission: 600,
            saleDate: arrivalDate,
          },
        })
      }
    }

    for (const branch of branches) {
      await prisma.branchExpense.create({
        data: {
          branch,
          month: currentMonth,
          year: currentYear,
          rent: randomInt(15000, 35000),
          utilities: randomInt(3000, 8000),
          office: randomInt(2000, 5000),
          advertising: randomInt(10000, 50000),
          other: randomInt(1000, 10000),
          description: `Витрати ${branch} за ${currentMonth}/${currentYear}`,
        },
      })
    }

    for (const manager of managers) {
      const monthApplications = await prisma.application.findMany({
        where: {
          managerId: manager.id,
          createdAt: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      })

      const paidCount = monthApplications.filter(a => !a.isFree).length
      const freeCount = monthApplications.filter(a => a.isFree).length
      const arrivedCount = monthApplications.filter(a => a.arrivedStatus === 'Доїхав').length

      let gradationRate = 300
      if (paidCount > 30) gradationRate = 600
      else if (paidCount > 20) gradationRate = 500
      else if (paidCount > 10) gradationRate = 400

      const bonus = paidCount * gradationRate
      const freeBonus = arrivedCount * 100

      const visaSales = await prisma.visaSale.findMany({
        where: {
          managerId: manager.id,
          saleDate: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      })

      const visaBonus = visaSales.reduce((sum, v) => sum + v.commission, 0)

      await prisma.monthlySalary.create({
        data: {
          userId: manager.id,
          month: currentMonth,
          year: currentYear,
          baseSalary: manager.salary,
          bonus,
          visaBonus,
          freeBonus,
          total: manager.salary + bonus + visaBonus + freeBonus,
          indicators: paidCount,
        },
      })
    }

    for (const admin of administrators) {
      await prisma.monthlySalary.create({
        data: {
          userId: admin.id,
          month: currentMonth,
          year: currentYear,
          baseSalary: admin.salary,
          bonus: 0,
          visaBonus: 0,
          freeBonus: 0,
          total: admin.salary,
          indicators: 0,
        },
      })
    }

    for (const branchManager of branchManagers) {
      const branchApplications = await prisma.application.findMany({
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
        include: {
          candidate: true,
        },
      })

      const branchPaidCount = branchApplications.filter(
        a => !a.isFree && a.candidate.branch === branchManager.branch
      ).length

      const branchBonus = branchPaidCount * 250

      await prisma.monthlySalary.create({
        data: {
          userId: branchManager.id,
          month: currentMonth,
          year: currentYear,
          baseSalary: 0,
          bonus: branchBonus,
          visaBonus: 0,
          freeBonus: 0,
          total: branchBonus,
          indicators: branchPaidCount,
        },
      })
    }

    const allPaidApplications = await prisma.application.findMany({
      where: {
        isFree: false,
        createdAt: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    })

    const recruitmentDirectorBonus = allPaidApplications.length * 200

    const recruitmentDirector = await prisma.user.findFirst({
      where: { role: 'RECRUITMENT_DIRECTOR' },
    })

    if (recruitmentDirector) {
      await prisma.monthlySalary.create({
        data: {
          userId: recruitmentDirector.id,
          month: currentMonth,
          year: currentYear,
          baseSalary: 0,
          bonus: recruitmentDirectorBonus,
          visaBonus: 0,
          freeBonus: 0,
          total: recruitmentDirectorBonus,
          indicators: allPaidApplications.length,
        },
      })
    }
  }

  console.log(`База даних заповнена успішно!`)
  console.log(`Створено ${candidateCounter} кандидатів`)
  console.log(`Створено ${await prisma.application.count()} подань`)
  console.log(`Створено ${await prisma.visaSale.count()} продажів віз`)
  console.log(`Створено ${await prisma.branchExpense.count()} записів витрат`)
  console.log(`Створено ${await prisma.monthlySalary.count()} записів зарплат`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

