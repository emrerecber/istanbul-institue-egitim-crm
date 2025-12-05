'use client'

import { useState, useEffect } from 'react'
import { DashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Hoş geldiniz! Sistemin genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Öğrenci</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalStudents || 0}</p>
              <p className={`text-sm mt-1 ${
                (stats?.studentGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.studentGrowth || 0) >= 0 ? '↗' : '↘'} %{Math.abs(stats?.studentGrowth || 0)} {(stats?.studentGrowth || 0) >= 0 ? 'artış' : 'azalış'}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Eğitimler</p>
              <p className="text-3xl font-bold mt-2">{stats?.activeCourses || 0}</p>
              <p className={`text-sm mt-1 ${
                (stats?.courseGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.courseGrowth || 0) >= 0 ? '↗' : '↘'} %{Math.abs(stats?.courseGrowth || 0)} {(stats?.courseGrowth || 0) >= 0 ? 'artış' : 'azalış'}
              </p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bu Ay Gelir</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
              <p className={`text-sm mt-1 ${
                (stats?.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.revenueGrowth || 0) >= 0 ? '↗' : '↘'} %{Math.abs(stats?.revenueGrowth || 0)} {(stats?.revenueGrowth || 0) >= 0 ? 'artış' : 'azalış'}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Kayıtlar</p>
              <p className="text-3xl font-bold mt-2">{stats?.pendingRegistrations || 0}</p>
              <p className={`text-sm mt-1 ${
                (stats?.registrationGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(stats?.registrationGrowth || 0) >= 0 ? '↗' : '↘'} %{Math.abs(stats?.registrationGrowth || 0)} {(stats?.registrationGrowth || 0) >= 0 ? 'artış' : 'azalış'}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="btn-primary w-full py-3 text-left flex items-center gap-3">
          <span className="text-xl">➕</span>
          <span>Yeni Kayıt Ekle</span>
        </button>
        <button className="btn-primary w-full py-3 text-left flex items-center gap-3">
          <span className="text-xl">✅</span>
          <span>Yoklama Yap</span>
        </button>
        <button className="btn-primary w-full py-3 text-left flex items-center gap-3">
          <span className="text-xl">📢</span>
          <span>Duyuru Gönder</span>
        </button>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Son Kayıtlar</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Ahmet Yılmaz', course: 'YTÜ Editörlük', date: '29.09.2025', status: 'Kesin' },
                { name: 'Ayşe Demir', course: 'CRM Eğitimi', date: '28.09.2025', status: 'Potansiyel' },
                { name: 'Mehmet Kaya', course: 'Proje Yönetimi', date: '28.09.2025', status: 'Kesin' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{item.date}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'Kesin' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Bugün Başlayan Eğitimler</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'YTÜ Editörlük Programı', time: '09:00-17:00', participants: 28 },
                { name: 'CRM Sistemi Eğitimi', time: '14:00-18:00', participants: 15 },
                { name: 'Proje Yönetimi', time: '10:00-16:00', participants: 22 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">🕐 {item.time}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {item.participants} kişi
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
