'use client'

import { useState, useEffect } from 'react'
import { CompanyWithRelations } from '@/types'
import { Table } from '@/components/Table'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { CompanyForm } from '@/components/CompanyForm'
import { formatDate } from '@/lib/utils'

export default function FirmalarPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  
  useEffect(() => {
    fetchCompanies()
  }, [])
  
  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/companies?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setCompanies(result.data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = () => {
    fetchCompanies()
  }
  
  const handleAddCompany = async (data: any) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsModalOpen(false)
        fetchCompanies()
      } else {
        throw new Error(result.error || 'Firma eklenirken hata oluştu')
      }
    } catch (error: any) {
      throw error
    }
  }
  
  const handleEditCompany = async (data: any) => {
    if (!selectedCompany) return
    
    try {
      const response = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsModalOpen(false)
        setSelectedCompany(null)
        fetchCompanies()
      } else {
        throw new Error(result.error || 'Firma güncellenirken hata oluştu')
      }
    } catch (error: any) {
      throw error
    }
  }
  
  const openAddModal = () => {
    setSelectedCompany(null)
    setIsModalOpen(true)
  }
  
  const openEditModal = (company: any) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }
  
  const columns = [
    {
      key: 'name',
      header: 'Firma Adı',
      render: (company: any) => (
        <div>
          <div className="font-medium">{company.name}</div>
          {company.email && (
            <div className="text-xs text-gray-500">{company.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Telefon',
      render: (company: any) => company.phone || '-'
    },
    {
      key: 'city',
      header: 'Şehir',
      render: (company: any) => company.city || '-'
    },
    {
      key: 'sector',
      header: 'Sektör',
      render: (company: any) => company.sector || '-'
    },
    {
      key: 'persons',
      header: 'Kişi Sayısı',
      render: (company: any) => company._count?.persons || 0
    },
    {
      key: 'createdAt',
      header: 'Kayıt Tarihi',
      render: (company: any) => formatDate(company.createdAt)
    },
    {
      key: 'status',
      header: 'Durum',
      render: (company: any) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          company.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {company.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firmalar</h1>
          <p className="text-gray-600 mt-1">Tüm firmaları görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={openAddModal}>
          ➕ Yeni Firma Ekle
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Firma adı, şehir, sektör ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            🔍 Ara
          </Button>
          <Button variant="secondary" onClick={() => { setSearch(''); fetchCompanies(); }}>
            🔄 Temizle
          </Button>
        </div>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Toplam Firma</div>
          <div className="text-2xl font-bold mt-1">{companies.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Aktif</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {companies.filter(c => c.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Toplam Kişi</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {companies.reduce((sum, c) => sum + (c._count?.persons || 0), 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Toplam Kayıt</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">
            {companies.reduce((sum, c) => sum + (c._count?.registrations || 0), 0)}
          </div>
        </Card>
      </div>
      
      {/* Table */}
      <Card>
        <Table
          data={companies}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Henüz firma kaydı bulunmuyor"
          onRowClick={openEditModal}
        />
      </Card>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCompany(null)
        }}
        title={selectedCompany ? 'Firmayı Düzenle' : 'Yeni Firma Ekle'}
        size="lg"
      >
        <CompanyForm
          initialData={selectedCompany ? {
            name: selectedCompany.name,
            taxNumber: selectedCompany.taxNumber || undefined,
            taxOffice: selectedCompany.taxOffice || undefined,
            email: selectedCompany.email || undefined,
            phone: selectedCompany.phone || undefined,
            website: selectedCompany.website || undefined,
            address: selectedCompany.address || undefined,
            city: selectedCompany.city || undefined,
            district: selectedCompany.district || undefined,
            sector: selectedCompany.sector || undefined,
            employeeCount: selectedCompany.employeeCount || undefined,
            notes: selectedCompany.notes || undefined
          } : undefined}
          onSubmit={selectedCompany ? handleEditCompany : handleAddCompany}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedCompany(null)
          }}
        />
      </Modal>
    </div>
  )
}
