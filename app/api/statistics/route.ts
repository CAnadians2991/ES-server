import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BRANCHES, COUNTRIES, RECIPIENT_TYPES } from '@/types'

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany()
    
    const totalCandidates = candidates.length
    const workingCandidates = candidates.filter(c => c.candidateStatus === 'Працює').length
    const readyCandidates = candidates.filter(c => c.candidateStatus === 'Готовий до виїзду').length
    const registeredCandidates = candidates.filter(c => c.candidateStatus === 'Зареєстровано').length
    const travelingCandidates = candidates.filter(c => c.candidateStatus === 'В дорозі').length
    const arrivedCandidates = candidates.filter(c => c.candidateStatus === 'Прибув').length
    const finishedCandidates = candidates.filter(c => c.candidateStatus === 'Завершив роботу').length
    const notArrivedCandidates = candidates.filter(c => c.candidateStatus === 'Не доїхав').length
    
    const pendingPayments = candidates.filter(c => 
      c.paymentStatus === 'Очікується' || c.paymentStatus === 'Прострочено'
    ).length

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const monthlyReceived = candidates
      .filter(c => c.paymentStatus === 'Отримано' && c.paymentAmount)
      .reduce((sum, c) => sum + c.paymentAmount, 0)

    const paidCandidates = candidates.filter(c => c.paymentAmount > 0)
    const avgPayment = paidCandidates.length > 0
      ? paidCandidates.reduce((sum, c) => sum + c.paymentAmount, 0) / paidCandidates.length
      : 0

    const conversionRate = totalCandidates > 0
      ? (workingCandidates / totalCandidates) * 100
      : 0

    const paymentRate = workingCandidates > 0
      ? (candidates.filter(c => c.candidateStatus === 'Працює' && c.paymentStatus === 'Отримано').length / workingCandidates) * 100
      : 0

    const thisMonthCandidates = candidates.filter(c => {
      if (!c.arrivalDate) return false
      const date = new Date(c.arrivalDate)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    const thisYearCandidates = candidates.filter(c => {
      if (!c.arrivalDate) return false
      const date = new Date(c.arrivalDate)
      return date.getFullYear() === currentYear
    }).length

    const uniquePartners = [...new Set(candidates.map(c => c.partnerNumber))].filter(p => p).length

    const partnerCounts: Record<string, number> = {}
    candidates.forEach(c => {
      if (c.partnerNumber) {
        partnerCounts[c.partnerNumber] = (partnerCounts[c.partnerNumber] || 0) + 1
      }
    })

    const topPartner = Object.keys(partnerCounts).length > 0
      ? Object.keys(partnerCounts).reduce((a, b) => partnerCounts[a] > partnerCounts[b] ? a : b)
      : '-'

    const avgCandidatesPerPartner = uniquePartners > 0
      ? totalCandidates / uniquePartners
      : 0

    const byCountry = COUNTRIES.map(country => ({
      country,
      count: candidates.filter(c => c.vacancyCountry === country).length,
      working: candidates.filter(c => c.vacancyCountry === country && c.candidateStatus === 'Працює').length,
    })).filter(item => item.count > 0)

    const byBranch = BRANCHES.map(branch => ({
      branch,
      count: candidates.filter(c => c.branch === branch).length,
      working: candidates.filter(c => c.branch === branch && c.candidateStatus === 'Працює').length,
    })).filter(item => item.count > 0)

    const byRecipient = RECIPIENT_TYPES.map(recipient => ({
      recipient,
      count: candidates.filter(c => c.recipientType === recipient).length,
      totalAmount: candidates.filter(c => c.recipientType === recipient).reduce((sum, c) => sum + (c.paymentAmount || 0), 0),
    })).filter(item => item.count > 0)

    const totalReceived = candidates
      .filter(c => c.paymentStatus === 'Отримано')
      .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

    const totalPending = candidates
      .filter(c => c.paymentStatus === 'Очікується' || c.paymentStatus === 'Прострочено')
      .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

    const averagePayment = avgPayment

    const statistics = {
      totalCandidates,
      workingCandidates,
      readyCandidates,
      registeredCandidates,
      travelingCandidates,
      arrivedCandidates,
      finishedCandidates,
      notArrivedCandidates,
      conversionRate,
      byCountry,
      byBranch,
      byRecipient,
      totalReceived,
      totalPending,
      averagePayment,
      paymentRate,
      monthlyReceived,
      pendingPayments,
      avgPayment,
      activePartners: uniquePartners,
      topPartner,
      avgCandidatesPerPartner,
      thisMonthCandidates,
      thisYearCandidates,
    }

    return NextResponse.json(statistics)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}

