'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { ExamForm } from '@/components/ExamForm';
import { formatDate } from '@/lib/utils';

interface Exam {
  id: string;
  examCode: string;
  title: string;
  description: string | null;
  examDate: Date;
  duration: number;
  totalScore: number;
  passingScore: number;
  isActive: boolean;
  course: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    questions: number;
    results: number;
  };
}

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalQuestions: 0,
    totalResults: 0,
  });

  useEffect(() => {
    fetchExams();
  }, [searchTerm]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/exams?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch exams');

      const data = await response.json();
      setExams(data);

      // Calculate stats
      const totalExams = data.length;
      const activeExams = data.filter((e: Exam) => e.isActive).length;
      const totalQuestions = data.reduce((sum: number, e: any) => sum + (e._count?.questions || 0), 0);
      const totalResults = data.reduce((sum: number, e: any) => sum + (e._count?.results || 0), 0);

      setStats({
        total: totalExams,
        active: activeExams,
        totalQuestions,
        totalResults,
      });
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = () => {
    setSelectedExam(null);
    setIsModalOpen(true);
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Bu sınavı silmek istediğinizden emin misiniz? Tüm sorular ve sonuçlar da silinecektir.')) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete exam');

      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Sınav silinirken bir hata oluştu');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = selectedExam
        ? `/api/exams/${selectedExam.id}`
        : '/api/exams';
      const method = selectedExam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save exam');
      }

      setIsModalOpen(false);
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert(error instanceof Error ? error.message : 'Bir hata oluştu');
      throw error;
    }
  };

  const handleManageQuestions = (examId: string) => {
    router.push(`/dashboard/sinavlar/${examId}/sorular`);
  };

  const copyExamCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Sınav kodu kopyalandı: ${code}`);
  };

  const columns = [
    {
      key: 'examCode',
      header: 'Sınav Kodu',
      render: (exam: Exam) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-blue-600">{exam.examCode}</span>
          <button
            onClick={() => copyExamCode(exam.examCode)}
            className="text-gray-400 hover:text-gray-600"
            title="Kodu Kopyala"
          >
            📋
          </button>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Sınav Başlığı',
      render: (exam: Exam) => (
        <div>
          <div className="font-medium text-gray-900">{exam.title}</div>
          <div className="text-xs text-gray-500">{exam.course.name}</div>
        </div>
      ),
    },
    {
      key: 'examDate',
      header: 'Tarih',
      render: (exam: Exam) => (
        <div>
          <div>{formatDate(exam.examDate)}</div>
          <div className="text-xs text-gray-500">{exam.duration} dakika</div>
        </div>
      ),
    },
    {
      key: 'scores',
      header: 'Puanlama',
      render: (exam: Exam) => (
        <div className="text-sm">
          <div>Toplam: {exam.totalScore}</div>
          <div className="text-gray-500">Geçme: {exam.passingScore}</div>
        </div>
      ),
    },
    {
      key: 'stats',
      header: 'İstatistikler',
      render: (exam: any) => (
        <div className="text-sm">
          <div>{exam._count?.questions || 0} Soru</div>
          <div className="text-gray-500">{exam._count?.results || 0} Sonuç</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Durum',
      render: (exam: Exam) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            exam.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {exam.isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (exam: Exam) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleManageQuestions(exam.id)}
            className="text-purple-600 hover:text-purple-800"
          >
            Sorular
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/sinavlar/${exam.id}/sonuclar`)}
            className="text-green-600 hover:text-green-800"
          >
            Sonuçlar
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleEditExam(exam)}
            className="text-blue-600 hover:text-blue-800"
          >
            Düzenle
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleDeleteExam(exam.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Sınavlar</h1>
        <Button onClick={handleAddExam}>+ Yeni Sınav</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Toplam Sınav</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Aktif Sınav</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Toplam Soru</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Sınav Sonuçları</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalResults}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="Ara (başlık, kod)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm && (
            <Button variant="secondary" onClick={() => setSearchTerm('')}>
              Temizle
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={exams}
          isLoading={loading}
          emptyMessage="Sınav bulunamadı"
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedExam ? 'Sınav Düzenle' : 'Yeni Sınav Ekle'}
      >
        <ExamForm
          exam={selectedExam as any}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
