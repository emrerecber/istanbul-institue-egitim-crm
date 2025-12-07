'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { QuestionForm } from '@/components/QuestionForm';
import { parseCSV, validateQuestionCSV } from '@/lib/csv-parser';

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
  correctAnswer: string;
  points: number;
  order: number;
}

interface Exam {
  id: string;
  examCode: string;
  title: string;
  totalScore: number;
  course: {
    name: string;
  };
}

export default function QuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExam();
      fetchQuestions();
    }
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      if (!response.ok) throw new Error('Failed to fetch exam');
      const data = await response.json();
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert('Sınav bilgileri alınamadı');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete question');

      fetchQuestions();
      fetchExam(); // Refresh to update totalScore
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Soru silinirken bir hata oluştu');
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!confirm('TÜM soruları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete questions');

      fetchQuestions();
      fetchExam();
      alert('Tüm sorular silindi');
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert('Sorular silinirken bir hata oluştu');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        const validation = validateQuestionCSV(parsed);

        if (!validation.valid) {
          setImportErrors(validation.errors);
          setImportData([]);
        } else {
          setImportData(parsed);
          setImportErrors([]);
        }
      } catch (error) {
        setImportErrors([error instanceof Error ? error.message : 'Dosya okuma hatası']);
        setImportData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}/import/template`);
      if (!response.ok) throw new Error('Template download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'soru-sablonu.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Şablon indirilirken bir hata oluştu');
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      alert('Lütfen önce bir CSV dosyası yükleyin');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(`/api/exams/${examId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: importData }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.validationErrors) {
          setImportErrors(result.validationErrors);
        } else {
          throw new Error(result.error || 'Import failed');
        }
        return;
      }

      setIsImportModalOpen(false);
      setImportData([]);
      setImportErrors([]);
      fetchQuestions();
      fetchExam();
      alert(result.message);
    } catch (error) {
      console.error('Import error:', error);
      alert(error instanceof Error ? error.message : 'Import işlemi sırasında bir hata oluştu');
    } finally {
      setImporting(false);
    }
  };

  const handleAddQuestion = async (questionData: any) => {
    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add question');
      }

      setIsAddModalOpen(false);
      fetchQuestions();
      fetchExam();
      alert('Soru başarıyla eklendi');
    } catch (error) {
      console.error('Error adding question:', error);
      alert(error instanceof Error ? error.message : 'Soru eklenirken bir hata oluştu');
      throw error;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      MULTIPLE_CHOICE: 'Çoktan Seçmeli',
      TRUE_FALSE: 'Doğru/Yanlış',
      SHORT_ANSWER: 'Kısa Cevap',
      ESSAY: 'Yazılı',
    };
    return types[type] || type;
  };

  const columns = [
    {
      key: 'order',
      header: 'Sıra',
      render: (q: Question) => <span className="font-medium">{q.order}</span>,
    },
    {
      key: 'questionText',
      header: 'Soru',
      render: (q: Question) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 line-clamp-2">{q.questionText}</div>
          <div className="text-xs text-gray-500 mt-1">{getQuestionTypeLabel(q.questionType)}</div>
        </div>
      ),
    },
    {
      key: 'correctAnswer',
      header: 'Doğru Cevap',
      render: (q: Question) => (
        <span className="text-sm text-green-600 font-medium">{q.correctAnswer}</span>
      ),
    },
    {
      key: 'points',
      header: 'Puan',
      render: (q: Question) => <span className="font-medium">{q.points}</span>,
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (q: Question) => (
        <Button
          variant="ghost"
          onClick={() => handleDeleteQuestion(q.id)}
          className="text-red-600 hover:text-red-800"
        >
          Sil
        </Button>
      ),
    },
  ];

  if (!exam) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Geri
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{exam.title} - Sorular</h1>
          <p className="text-gray-600 mt-1">
            {exam.course.name} • Kod: {exam.examCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            📁 Toplu İçe Aktar
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            + Soru Ekle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Toplam Soru</div>
          <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Toplam Puan</div>
          <div className="text-2xl font-bold text-blue-600">{exam.totalScore}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Ortalama Puan/Soru</div>
          <div className="text-2xl font-bold text-purple-600">
            {questions.length > 0 ? (exam.totalScore / questions.length).toFixed(1) : '0'}
          </div>
        </Card>
      </div>

      {/* Actions */}
      {questions.length > 0 && (
        <Card>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {questions.length} soru bulunuyor
            </p>
            <Button variant="danger" onClick={handleDeleteAllQuestions}>
              🗑️ Tüm Soruları Sil
            </Button>
          </div>
        </Card>
      )}

      {/* Questions Table */}
      <Card>
        <Table
          columns={columns}
          data={questions}
          isLoading={loading}
          emptyMessage="Henüz soru eklenmemiş"
        />
      </Card>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Soru Ekle"
      >
        <QuestionForm
          examId={examId}
          onSubmit={handleAddQuestion}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Toplu Soru İçe Aktarma"
      >
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              📝 CSV dosyası yükleyerek toplu soru ekleyebilirsiniz.
              <br />
              Şablon dosyasını indirip düzenlemeniz önerilir.
            </p>
          </div>

          {/* Template Download */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
            <div>
              <h4 className="font-medium text-gray-900">Şablon Dosyası</h4>
              <p className="text-sm text-gray-600">CSV şablonunu indirin ve düzenleyin</p>
            </div>
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              💾 İndir
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Dosyası Yükle
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview */}
          {importData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                ✅ {importData.length} soru hazır. İçe aktarmaya hazır!
              </p>
            </div>
          )}

          {/* Errors */}
          {importErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-medium text-red-800 mb-2">❌ Hatalar:</p>
              <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                {importErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsImportModalOpen(false);
                setImportData([]);
                setImportErrors([]);
              }}
            >
              İptal
            </Button>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={importing || importData.length === 0 || importErrors.length > 0}
            >
              {importing ? 'Aktarılıyor...' : 'İçe Aktar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
