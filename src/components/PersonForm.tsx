'use client'

import { useState } from 'react'
import { PersonFormData, Gender } from '@/types'
import { Input } from './Input'
import { Button } from './Button'

interface PersonFormProps {
  initialData?: Partial<PersonFormData>
  onSubmit: (data: PersonFormData) => Promise<void>
  onCancel: () => void
}

export function PersonForm({ initialData, onSubmit, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState<PersonFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || undefined,
    phone: initialData?.phone || undefined,
    identityNumber: initialData?.identityNumber || undefined,
    birthDate: initialData?.birthDate || undefined,
    gender: initialData?.gender || undefined,
    address: initialData?.address || undefined,
    city: initialData?.city || undefined,
    district: initialData?.district || undefined,
    postalCode: initialData?.postalCode || undefined,
    notes: initialData?.notes || undefined,
    source: initialData?.source || undefined,
    tags: initialData?.tags || []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleChange = (field: keyof PersonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName) {
      setError('Ad ve soyad zorunludur')
      return
    }
    
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Temel Bilgiler */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Temel Bilgiler</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ad"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
          <Input
            label="Soyad"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="E-posta"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <Input
            label="Telefon"
            type="tel"
            placeholder="0532 123 4567"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="TC Kimlik No"
            maxLength={11}
            value={formData.identityNumber || ''}
            onChange={(e) => handleChange('identityNumber', e.target.value)}
          />
          <Input
            label="Doğum Tarihi"
            type="date"
            value={formData.birthDate ? String(formData.birthDate).split('T')[0] : ''}
            onChange={(e) => handleChange('birthDate', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cinsiyet
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value as Gender)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seçiniz</option>
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>
      </div>
      
      {/* Adres Bilgileri */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Adres Bilgileri</h3>
        
        <Input
          label="Adres"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Şehir"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <Input
            label="İlçe"
            value={formData.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
          />
          <Input
            label="Posta Kodu"
            value={formData.postalCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
          />
        </div>
      </div>
      
      {/* Diğer Bilgiler */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Diğer Bilgiler</h3>
        
        <Input
          label="Kaynak"
          placeholder="Nasıl ulaştı? (Referans, web, vb.)"
          value={formData.source || ''}
          onChange={(e) => handleChange('source', e.target.value)}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notlar
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {initialData ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  )
}
