import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface ExamFormProps {
  exam?: any | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export const ExamForm: React.FC<ExamFormProps> = ({ exam, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    courseId: exam?.courseId || '',
    title: exam?.title || '',
    description: exam?.description || '',
    examDate: exam?.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
    duration: exam?.duration?.toString() || '60',
    totalScore: exam?.totalScore?.toString() || '100',
    passingScore: exam?.passingScore?.toString() || '50',
    isActive: exam?.isActive !== undefined ? exam.isActive : true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoadingData(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.courseId) {
      newErrors.courseId = 'Eğitim seçimi gereklidir';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Sınav başlığı gereklidir';
    }

    if (!formData.examDate) {
      newErrors.examDate = 'Sınav tarihi gereklidir';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Geçerli bir süre giriniz';
    }

    if (!formData.totalScore || parseInt(formData.totalScore) <= 0) {
      newErrors.totalScore = 'Geçerli bir toplam puan giriniz';
    }

    if (!formData.passingScore || parseInt(formData.passingScore) <= 0) {
      newErrors.passingScore = 'Geçerli bir geçme puanı giriniz';
    }

    const totalScore = parseInt(formData.totalScore);
    const passingScore = parseInt(formData.passingScore);
    if (passingScore > totalScore) {
      newErrors.passingScore = 'Geçme puanı toplam puandan fazla olamaz';
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

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Eğitim *
        </label>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.courseId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Eğitim Seçin</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
        {errors.courseId && (
          <p className="mt-1 text-xs text-red-500">{errors.courseId}</p>
        )}
      </div>

      <Input
        label="Sınav Başlığı *"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Örn: Final Sınavı"
      />

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
          placeholder="Sınav hakkında açıklama..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Sınav Tarihi *"
          name="examDate"
          type="date"
          value={formData.examDate}
          onChange={handleChange}
          error={errors.examDate}
        />

        <Input
          label="Süre (Dakika) *"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          error={errors.duration}
          placeholder="60"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Toplam Puan *"
          name="totalScore"
          type="number"
          value={formData.totalScore}
          onChange={handleChange}
          error={errors.totalScore}
          placeholder="100"
        />

        <Input
          label="Geçme Puanı *"
          name="passingScore"
          type="number"
          value={formData.passingScore}
          onChange={handleChange}
          error={errors.passingScore}
          placeholder="50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Sınav Aktif
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : exam ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};
