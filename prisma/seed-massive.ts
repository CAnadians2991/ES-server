import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const branches = ['ЦО', 'Рівне', 'Київ', 'Одеса']
const responsiblePersons = ['Тетяна Чуприна', 'Наталія Жиган', 'Діана Сологуб']
const countries = ['Польща', 'Чехія', 'Німеччина', 'Латвія', 'Румунія', 'Литва', 'Угорщина', 'Греція', 'Австрія']
const candidateCountries = ['Україна', 'Білорусь', 'Грузія']
const statuses = ['Зареєстровано', 'Готовий до виїзду', 'В дорозі', 'Прибув', 'Працює', 'Завершив роботу']
const firstNames = [
  'Олександр', 'Максим', 'Іван', 'Дмитро', 'Андрій', 'Сергій', 'Владислав', 'Богдан', 'Ярослав', 'Михайло',
  'Олена', 'Марія', 'Анна', 'Ірина', 'Наталія', 'Юлія', 'Тетяна', 'Світлана', 'Оксана', 'Валентина',
  'Петро', 'Василь', 'Григорій', 'Павло', 'Роман', 'Віктор', 'Олег', 'Ігор', 'Юрій', 'Володимир'
]
const lastNames = [
  'Шевченко', 'Коваленко', 'Бондаренко', 'Ткаченко', 'Кравченко', 'Мельник', 'Петренко', 'Коваль', 'Гончар', 'Зайцев',
  'Іваненко', 'Павленко', 'Марченко', 'Білий', 'Сидоренко', 'Поліщук', 'Гриценко', 'Степаненко', 'Лисенко', 'Савченко',
  'Дмитренко', 'Романенко', 'Морозов', 'Ковальчук', 'Литвиненко', 'Сергієнко', 'Миронов', 'Федоров', 'Олійник', 'Левченко'
]
const projects = [
  'Amazon Logistics', 'DHL Express', 'Zalando Warehouse', 'BMW Factory', 'Mercedes Production',
  'Hotel Marriott', 'Lidl Distribution', 'IKEA Assembly', 'Construction Site Berlin', 'Volkswagen Plant'
]

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePhone(): string {
  return `+38050${randomInt(1000000, 9999999)}`
}

async function main() {
  console.log('🌱 Генерація 9000 тестових кандидатів...')
  
  // Починаємо з 10.2025 (жовтень 2025)
  const startMonth = 10
  const startYear = 2025
  
  let totalCreated = 0
  const batchSize = 500
  
  // 18 місяців по 500 кандидатів = 9000
  for (let i = 0; i < 18; i++) {
    const month = ((startMonth - 1 + i) % 12) + 1
    const year = startYear + Math.floor((startMonth - 1 + i) / 12)
    
    console.log(`\n📅 Створюємо 500 кандидатів за ${month}.${year}...`)
    
    const candidates = []
    
    for (let j = 0; j < batchSize; j++) {
      const firstName = randomElement(firstNames)
      const lastName = randomElement(lastNames)
      const day = randomInt(1, 28)
      const createdDate = new Date(year, month - 1, day)
      
      candidates.push({
        branch: randomElement(branches),
        responsible: randomElement(responsiblePersons),
        firstName,
        lastName,
        phone: generatePhone(),
        age: randomInt(18, 55),
        candidateCountry: randomElement(candidateCountries),
        vacancyCountry: randomElement(countries),
        projectName: randomElement(projects),
        partnerNumber: `P${randomInt(1000, 9999)}`,
        arrivalDate: Math.random() > 0.5 ? new Date(year, month - 1, randomInt(1, 28)) : null,
        candidateStatus: randomElement(statuses),
        paymentAmount: Math.random() > 0.3 ? randomInt(1000, 5000) : 0,
        paymentStatus: Math.random() > 0.5 ? 'Отримано' : 'Очікується',
        recipientType: randomElement(['ТОВ ЕВ', 'ФОП Коктов', 'ФОП Литви', 'ТОВ ПерсоналВорк']),
        comment: Math.random() > 0.7 ? `Коментар для ${firstName} ${lastName}` : null,
        createdAt: createdDate,
        updatedAt: createdDate,
      })
    }
    
    // Створюємо батчами по 100 для швидкості
    for (let k = 0; k < candidates.length; k += 100) {
      const batch = candidates.slice(k, k + 100)
      await prisma.candidate.createMany({
        data: batch,
      })
    }
    
    totalCreated += batchSize
    console.log(`✅ Створено ${batchSize} кандидатів (всього: ${totalCreated}/9000)`)
    
    // Невелика затримка між місяцями
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n🎉 Успішно створено ${totalCreated} кандидатів!`)
  
  // Статистика
  const stats = await prisma.candidate.groupBy({
    by: ['candidateStatus'],
    _count: true,
  })
  
  console.log('\n📊 Статистика по статусах:')
  stats.forEach(stat => {
    console.log(`   ${stat.candidateStatus}: ${stat._count}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Помилка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

