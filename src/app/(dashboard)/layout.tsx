'use client'

import { ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Breadcrumb from '@/components/Breadcrumb'

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Süper Admin',
  ADMIN: 'Admin',
  MANAGER: 'Yönetici',
  USER: 'Kullanıcı',
  INSTRUCTOR: 'Eğitmen',
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  USER: 'bg-gray-100 text-gray-800',
  INSTRUCTOR: 'bg-green-100 text-green-800',
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data: session } = useSession()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white">
        <div className="p-4 border-b border-slate-800">
          <a href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              <img 
                src="/istanbul-institute-logo.png" 
                alt="Istanbul Institute Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg group-hover:text-blue-400 transition">Eğitim CRM</h1>
              <p className="text-xs text-gray-400">İstanbul Institute</p>
            </div>
          </a>
        </div>
        
        <nav className="p-4 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            📊 Dashboard
          </a>
          <a href="/dashboard/kisiler" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            👥 Kişiler
          </a>
          <a href="/dashboard/firmalar" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            🏢 Firmalar
          </a>
          <a href="/dashboard/egitimler" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            📚 Eğitimler
          </a>
          <a href="/dashboard/kayitlar" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            📝 Kayıtlar
          </a>
          <a href="/dashboard/sinavlar" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            🎯 Sınavlar
          </a>
          <a href="/dashboard/mali" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            💰 Mali İşlemler
          </a>
          <a href="/dashboard/raporlar" className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition">
            📈 Raporlar
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">🔔</button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {session?.user?.name || session?.user?.email}
                  </div>
                  {session?.user?.role && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[session.user.role]}`}>
                      {roleLabels[session.user.role]}
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>
          
          {children}
        </main>
      </div>
    </div>
  )
}
