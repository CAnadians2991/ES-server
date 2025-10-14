"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function VacanciesPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'vacancies', action: 'read' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Вакансії</h1>
        <p className="text-gray-600">Сторінка вакансій в розробці...</p>
      </div>
    </ProtectedRoute>
  )
}
