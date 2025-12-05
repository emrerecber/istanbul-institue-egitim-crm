'use client'

import { useState, useEffect } from 'react'
import { PersonWithRelations } from '@/types'
import { Table } from '@/components/Table'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { PersonForm } from '@/components/PersonForm'
import { formatDate } from '@/lib/utils'

export default function KisilerPage() {
  const [persons, setPersons] = useState<PersonWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PersonWithRelations | null>(null)
  
  useEffect(() => {
    fetchPersons()
  }, [])
  
  const fetchPersons = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/persons?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setPersons(result.data)
      }
    } catch (error) {
      console.error('Error fetching persons:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = () => {
    fetchPersons()
  }
  
  const handleAddPerson = async (data: any) => {
    try {
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsModalOpen(false)
        fetchPersons()
      } else {
        throw new Error(result.error || 'Kişi eklenirken hata oluştu')
      }
    } catch (error: any) {
      throw error
    }
  }
  
  const handleEditPerson = async (data: any) => {
    if (!selectedPerson) return
    
    try {
      const response = await fetch(`/api/persons/${selectedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsModalOpen(false)
        setSelectedPerson(null)
        fetchPersons()
      } else {
        throw new Error(result.error || 'Kişi güncellenirken hata oluştu')
      }
    } catch (error: any) {
      throw error
    }
  }
  
  const openAddModal = () => {
    setSelectedPerson(null)
    setIsModalOpen(true)
  }
  
  const openEditModal = (person: PersonWithRelations) => {
    setSelectedPerson(person)
    setIsModalOpen(true)
  }
  
  const columns = [
    {
      key: 'fullName',
      header: 'Ad Soyad',
      render: (person: PersonWithRelations) => (
        <div>
          <div className="font-medium">{person.firstName} {person.lastName}</div>
          {person.email && (
            <div className="text-xs text-gray-500">{person.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Telefon',
      render: (person: PersonWithRelations) => person.phone || '-'
    },
    {
      key: 'company',
      header: 'Firma',
      render: (person: PersonWithRelations) => person.company?.name || '-'
    },
    {
      key: 'city',
      header: 'Şehir',
      render: (person: PersonWithRelations) => person.city || '-'
    },
    {
      key: 'createdAt',
      header: 'Kayıt Tarihi',
      render: (person: PersonWithRelations) => formatDate(person.createdAt)
    },
    {
      key: 'status',
      header: 'Durum',
      render: (person: PersonWithRelations) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          person.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {person.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kişiler</h1>
          <p className="text-gray-600 mt-1">Tüm kişileri görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={openAddModal}>
          ➕ Yeni Kişi Ekle
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Ad, soyad, e-posta veya telefon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            🔍 Ara
          </Button>
          <Button variant="secondary" onClick={() => { setSearch(''); fetchPersons(); }}>
            🔄 Temizle
          </Button>
        </div>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Toplam Kişi</div>
          <div className="text-2xl font-bold mt-1">{persons.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Aktif</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {persons.filter(p => p.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pasif</div>
          <div className="text-2xl font-bold mt-1 text-gray-600">
            {persons.filter(p => !p.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Firmaya Bağlı</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {persons.filter(p => p.companyId).length}
          </div>
        </Card>
      </div>
      
      {/* Table */}
      <Card>
        <Table
          data={persons}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Henüz kişi kaydı bulunmuyor"
          onRowClick={openEditModal}
        />
      </Card>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPerson(null)
        }}
        title={selectedPerson ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle'}
        size="lg"
      >
        <PersonForm
          initialData={selectedPerson ? {
            firstName: selectedPerson.firstName,
            lastName: selectedPerson.lastName,
            email: selectedPerson.email || undefined,
            phone: selectedPerson.phone || undefined,
            identityNumber: selectedPerson.identityNumber || undefined,
            birthDate: selectedPerson.birthDate || undefined,
            gender: selectedPerson.gender || undefined,
            address: selectedPerson.address || undefined,
            city: selectedPerson.city || undefined,
            district: selectedPerson.district || undefined,
            postalCode: selectedPerson.postalCode || undefined,
            notes: selectedPerson.notes || undefined,
            source: selectedPerson.source || undefined,
            tags: selectedPerson.tags || []
          } : undefined}
          onSubmit={selectedPerson ? handleEditPerson : handleAddPerson}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedPerson(null)
          }}
        />
      </Modal>
    </div>
  )
}
