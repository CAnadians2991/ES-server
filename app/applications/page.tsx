"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ApplicationsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'applications', action: 'read' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Подання</h1>
        <p className="text-gray-600">Сторінка подань в розробці...</p>
      </div>
    </ProtectedRoute>
  )
}
