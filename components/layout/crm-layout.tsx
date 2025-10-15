'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Briefcase, 
  CreditCard, 
  Euro, 
  BarChart3, 
  User, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut as LogOutIcon,
  Home,
  FileText,
  Calendar,
  MessageSquare,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Wallet,
  Landmark,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

interface LayoutProps {
  children: React.ReactNode
}

export default function CRMLayout({ children }: LayoutProps) {
  const { user, logout, hasPermission } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications] = useState({
    crm: 11,
    tasks: 99,
    feed: 5,
    messenger: 50
  })

  const navigationItems = [
    { 
      id: 'home', 
      label: 'Головна', 
      icon: Home, 
      href: '/',
      permission: null
    },
    { 
      id: 'candidates', 
      label: 'Кандидати', 
      icon: Users, 
      href: '/candidates',
      permission: 'candidates'
    },
    { 
      id: 'clients', 
      label: 'Клієнти', 
      icon: Users, 
      href: '/clients',
      permission: 'clients'
    },
    { 
      id: 'deals', 
      label: 'Угоди', 
      icon: Briefcase, 
      href: '/deals',
      permission: 'deals'
    },
    { 
      id: 'vacancies', 
      label: 'Вакансії', 
      icon: Briefcase, 
      href: '/vacancies',
      permission: 'vacancies'
    },
    { 
      id: 'payments', 
      label: 'Оплати', 
      icon: CreditCard, 
      href: '/payments',
      permission: 'payments'
    },
    { 
      id: 'salaries', 
      label: 'Зарплати', 
      icon: Euro, 
      href: '/salaries',
      permission: 'salaries'
    },
    { 
      id: 'statistics', 
      label: 'Статистика', 
      icon: BarChart3, 
      href: '/statistics',
      permission: 'statistics'
    },
    { 
      id: 'users', 
      label: 'Користувачі', 
      icon: User, 
      href: '/users',
      permission: 'users'
    }
  ]

  const filteredNavItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission, 'read')
  )

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Бічна панель */}
      <div className={`${sidebarOpen ? 'w-52' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Логотип та заголовок */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ЄС</span>
                </div>
                <div>
                  <h1 className="font-semibold text-sm text-gray-900">Європа Сервіс</h1>
                  <p className="text-xs text-gray-500">CRM система</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Навігація */}
        <nav className="flex-1 p-1 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const notificationCount = notifications[item.id as keyof typeof notifications]
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="ml-2 flex-1">{item.label}</span>
                    {notificationCount && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </>
                )}
              </a>
            )
          })}
        </nav>

        {/* Користувач */}
        <div className="p-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-medium text-xs">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 leading-tight truncate">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-gray-500 leading-tight truncate">
                  {user?.role === 'MANAGER' ? 'Менеджер' :
                   user?.role === 'DIRECTOR' ? 'Директор' :
                   user?.role === 'ADMIN' ? 'Адміністратор' :
                   user?.role === 'ACCOUNTANT' ? 'Бухгалтер' : 'Співробітник'}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-1 text-gray-600 hover:text-red-600 flex-shrink-0"
            >
                <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Основний контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Верхня панель */}
        <header className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {pathname === '/clients' ? 'Клієнти' :
                 pathname === '/candidates' ? 'Кандидати' :
                 pathname === '/deals' ? 'Угоди' :
                 pathname === '/vacancies' ? 'Вакансії' :
                 pathname === '/payments' ? 'Оплати' :
                 pathname === '/salaries' ? 'Зарплати' :
                 pathname === '/statistics' ? 'Статистика' :
                 pathname === '/users' ? 'Користувачі' :
                 'Головна'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Компактний пошук */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Пошук..."
                  className="pl-7 pr-3 py-1.5 border border-green-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-32"
                />
              </div>
              
              {/* Компактні кнопки */}
              <Button variant="ghost" size="sm" className="relative p-1.5 h-7 w-7">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center">
                  5
                </span>
              </Button>
              
              <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Контент */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-green-50/30 to-emerald-50/30">
          {children}
        </main>
      </div>
    </div>
  )
}
