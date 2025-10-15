"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import type { LoginRequest, LoginResponse } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting login with:', formData)
      const result = await api.auth.login(formData) as LoginResponse
      console.log('Login result:', result)

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        console.log('Login successful, token saved:', result.token)
        console.log('User saved:', result.user)
        
        toast({
          title: 'Успішний вхід',
          description: `Вітаємо, ${result.user?.fullName}!`,
        })

        // Додаємо невелику затримку перед перенаправленням
        setTimeout(() => {
          console.log('Attempting to redirect to /')
          router.push('/')
        }, 1000)
      } else {
        toast({
          title: 'Помилка входу',
          description: result.error || 'Невірний логін або пароль',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Помилка',
        description: error instanceof Error ? error.message : 'Помилка з\'єднання з сервером',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Фонові елементи */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-slate-300 to-gray-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200 to-slate-200 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 border border-gray-200 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6 border-b">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-3xl">🇪🇺</span>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Європа Сервіс
          </CardTitle>
          <CardDescription className="text-slate-600 mt-3 space-y-1">
            <div className="font-medium">Ліцензоване кадрове агенство</div>
            <div className="text-sm">Працевлаштування в країнах Європи</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">Логін</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введіть логін"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-slate-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введіть пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                className="border-gray-300 focus:border-slate-500 transition-all"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all duration-300 py-6 text-lg" 
              disabled={isLoading}
            >
              {isLoading ? 'Виконується вхід...' : 'Увійти до системи'}
            </Button>
          </form>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold mb-3 text-slate-700 text-sm">
              Тестові облікові записи:
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 min-w-[100px]">Адміністратор:</span> 
                <code className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">admin / 123456</code>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 min-w-[100px]">Директор:</span> 
                <code className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">director / 123456</code>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-700 min-w-[100px]">Бухгалтер:</span> 
                <code className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">accountant / 123456</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
