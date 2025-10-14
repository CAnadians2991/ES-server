"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function PartnerPaymentsPage() {
  return (
    <ProtectedRoute requiredPermission={{ resource: 'partnerPayments', action: 'read' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Виплати партнерів</h1>
        <p className="text-gray-600">Сторінка виплат партнерів в розробці...</p>
      </div>
    </ProtectedRoute>
  )
}
