import { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  👤
                </div>
                <span className="text-sm font-medium">Admin</span>
              </div>
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
