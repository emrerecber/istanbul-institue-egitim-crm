import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Registration } from '@/types';

interface RegistrationFormProps {
  registration?: Registration | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface Course {
  id: string;
  name: string;
  code: string;
  price: any;
}

interface Company {
  id: string;
  name: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  registration,
  onSubmit,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    personId: registration?.personId || '',
    courseId: registration?.courseId || '',
    companyId: registration?.companyId || '',
    status: registration?.status || 'POTENTIAL',
    totalAmount: registration?.totalAmount?.toString() || '',
    paidAmount: registration?.paidAmount?.toString() || '0',
    discount: registration?.discount?.toString() || '',
    notes: registration?.notes || '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-fill totalAmount when course is selected
    if (formData.courseId) {
      const selectedCourse = courses.find((c) => c.id === formData.courseId);
      if (selectedCourse && !registration) {
        const price = parseFloat(selectedCourse.price.toString());
        const discount = formData.discount ? parseFloat(formData.discount) : 0;
        const total = price - discount;
        setFormData((prev) => ({ ...prev, totalAmount: total.toString() }));
      }
    }
  }, [formData.courseId, formData.discount, courses, registration]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [personsRes, coursesRes, companiesRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/courses'),
        fetch('/api/companies'),
      ]);

      const personsData = await personsRes.json();
      const coursesData = await coursesRes.json();
      const companiesData = await companiesRes.json();

      // Ensure we always set arrays
      const personsArray = personsData.success ? personsData.data : personsData;
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      const companiesArray = Array.isArray(companiesData) ? companiesData : [];

      setPersons(Array.isArray(personsArray) ? personsArray : []);
      setCourses(coursesArray);
      setCompanies(companiesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.personId) {
      newErrors.personId = 'Kişi seçimi gereklidir';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Eğitim seçimi gereklidir';
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Geçerli bir tutar giriniz';
    }

    const paidAmount = parseFloat(formData.paidAmount || '0');
    const totalAmount = parseFloat(formData.totalAmount || '0');
    if (paidAmount > totalAmount) {
      newErrors.paidAmount = 'Ödenen tutar toplam tutardan fazla olamaz';
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

  const remainingAmount = parseFloat(formData.totalAmount || '0') - parseFloat(formData.paidAmount || '0');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kişi *
          </label>
          <select
            name="personId"
            value={formData.personId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.personId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Kişi Seçin</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
                {person.email && ` (${person.email})`}
              </option>
            ))}
          </select>
          {errors.personId && (
            <p className="mt-1 text-xs text-red-500">{errors.personId}</p>
          )}
        </div>

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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Firma (Opsiyonel)
          </label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Firma Yok</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

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
            <option value="POTENTIAL">Potansiyel</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="İndirim (₺)"
          name="discount"
          type="number"
          step="0.01"
          value={formData.discount}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Toplam Tutar (₺) *"
          name="totalAmount"
          type="number"
          step="0.01"
          value={formData.totalAmount}
          onChange={handleChange}
          error={errors.totalAmount}
          placeholder="0.00"
        />

        <Input
          label="Ödenen Tutar (₺)"
          name="paidAmount"
          type="number"
          step="0.01"
          value={formData.paidAmount}
          onChange={handleChange}
          error={errors.paidAmount}
          placeholder="0.00"
        />
      </div>

      {remainingAmount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            <strong>Kalan Tutar:</strong> ₺{remainingAmount.toFixed(2)}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notlar
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Kayıt hakkında notlar..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : registration ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};
