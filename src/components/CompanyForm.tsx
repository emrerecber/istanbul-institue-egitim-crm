'use client'

import { useState } from 'react'
import { CompanyFormData } from '@/types'
import { Input } from './Input'
import { Button } from './Button'

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>
  onSubmit: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
}

export function CompanyForm({ initialData, onSubmit, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: initialData?.name || '',
    taxNumber: initialData?.taxNumber || undefined,
    taxOffice: initialData?.taxOffice || undefined,
    email: initialData?.email || undefined,
    phone: initialData?.phone || undefined,
    website: initialData?.website || undefined,
    address: initialData?.address || undefined,
    city: initialData?.city || undefined,
    district: initialData?.district || undefined,
    sector: initialData?.sector || undefined,
    employeeCount: initialData?.employeeCount || undefined,
    notes: initialData?.notes || undefined
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      setError('Firma adı zorunludur')
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
        
        <Input
          label="Firma Adı"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vergi Numarası"
            maxLength={10}
            value={formData.taxNumber || ''}
            onChange={(e) => handleChange('taxNumber', e.target.value)}
          />
          <Input
            label="Vergi Dairesi"
            value={formData.taxOffice || ''}
            onChange={(e) => handleChange('taxOffice', e.target.value)}
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
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        
        <Input
          label="Website"
          type="url"
          placeholder="https://example.com"
          value={formData.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
        />
      </div>
      
      {/* Adres Bilgileri */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Adres Bilgileri</h3>
        
        <Input
          label="Adres"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
      
      {/* Diğer Bilgiler */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Diğer Bilgiler</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sektör"
            placeholder="Teknoloji, Eğitim, vb."
            value={formData.sector || ''}
            onChange={(e) => handleChange('sector', e.target.value)}
          />
          <Input
            label="Çalışan Sayısı"
            type="number"
            value={formData.employeeCount || ''}
            onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || undefined)}
          />
        </div>
        
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
