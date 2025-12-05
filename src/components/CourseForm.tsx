import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Course, CourseStatus } from '@/types';

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    duration: course?.duration?.toString() || '',
    capacity: course?.capacity?.toString() || '',
    price: course?.price?.toString() || '',
    startDate: course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
    endDate: course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
    schedule: course?.schedule || '',
    instructor: course?.instructor || '',
    location: course?.location || '',
    status: course?.status || 'PLANNED',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Eğitim adı gereklidir';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Eğitim kodu gereklidir';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Geçerli bir süre giriniz';
    }

    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Geçerli bir kapasite giriniz';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Geçerli bir fiyat giriniz';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Başlangıç tarihi gereklidir';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Bitiş tarihi gereklidir';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Eğitim Adı *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Örn: React İleri Seviye"
        />

        <Input
          label="Eğitim Kodu *"
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          placeholder="Örn: REACT-ADV-2024"
        />
      </div>

      <div className="grid grid-cols-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Açıklama
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Eğitim açıklaması..."
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Süre (Saat) *"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          placeholder="40"
        />

        <Input
          label="Kapasite *"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          placeholder="20"
        />

        <Input
          label="Fiyat (₺) *"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          placeholder="5000.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Başlangıç Tarihi *"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />

        <Input
          label="Bitiş Tarihi *"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          error={errors.endDate}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Eğitmen"
          name="instructor"
          value={formData.instructor}
          onChange={handleChange}
          placeholder="Örn: Ahmet Yılmaz"
        />

        <Input
          label="Konum"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Örn: İstanbul - Beşiktaş"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Program"
          name="schedule"
          value={formData.schedule}
          onChange={handleChange}
          placeholder="Örn: Pazartesi-Çarşamba 18:00-21:00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PLANNED">Planlandı</option>
            <option value="ACTIVE">Aktif</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : course ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export { CourseForm };
