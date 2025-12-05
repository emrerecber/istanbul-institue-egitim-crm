'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { CourseForm } from '@/components/CourseForm';
import { Course } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data);

      // Calculate stats
      const totalCourses = data.length;
      const activeCourses = data.filter((c: Course) => c.status === 'ACTIVE').length;
      const totalStudents = data.reduce((sum: number, c: any) => sum + (c._count?.registrations || 0), 0);
      const totalRevenue = data.reduce((sum: number, c: Course) => {
        const registrations = (c as any)._count?.registrations || 0;
        return sum + (parseFloat(c.price.toString()) * registrations);
      }, 0);

      setStats({
        total: totalCourses,
        active: activeCourses,
        totalStudents,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Bu eğitimi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete course');

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Eğitim silinirken bir hata oluştu');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = selectedCourse
        ? `/api/courses/${selectedCourse.id}`
        : '/api/courses';
      const method = selectedCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save course');
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error instanceof Error ? error.message : 'Bir hata oluştu');
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PLANNED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Planlandı' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tamamlandı' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal' },
    };

    const config = statusConfig[status] || statusConfig.PLANNED;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'code',
      label: 'Kod',
      render: (course: Course) => (
        <span className="font-medium text-gray-900">{course.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Eğitim Adı',
      render: (course: Course) => course.name,
    },
    {
      key: 'instructor',
      label: 'Eğitmen',
      render: (course: Course) => course.instructor || '-',
    },
    {
      key: 'dates',
      label: 'Tarihler',
      render: (course: Course) => (
        <div className="text-sm">
          <div>{formatDate(course.startDate)}</div>
          <div className="text-gray-500">{formatDate(course.endDate)}</div>
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Kapasite',
      render: (course: any) => {
        const registered = course._count?.registrations || 0;
        const capacity = course.capacity;
        const percentage = (registered / capacity) * 100;
        return (
          <div className="text-sm">
            <div className="font-medium">{registered} / {capacity}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Fiyat',
      render: (course: Course) => formatCurrency(parseFloat(course.price.toString())),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (course: Course) => getStatusBadge(course.status),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (course: Course) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleEditCourse(course)}
            className="text-blue-600 hover:text-blue-800"
          >
            Düzenle
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDeleteCourse(course.id)}
            className="text-red-600 hover:text-red-800"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Eğitimler</h1>
        <Button onClick={handleAddCourse}>+ Yeni Eğitim</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Toplam Eğitim</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Aktif Eğitim</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Toplam Öğrenci</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Toplam Gelir</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Ara (ad, kod, eğitmen, konum)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PLANNED">Planlandı</option>
            <option value="ACTIVE">Aktif</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
          {(searchTerm || statusFilter) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={courses}
          loading={loading}
          emptyMessage="Eğitim bulunamadı"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Eğitim Düzenle' : 'Yeni Eğitim Ekle'}
      >
        <CourseForm
          course={selectedCourse}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
