'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, User, Calendar, Award } from 'lucide-react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'

interface ExamResult {
  id: string
  score: number
  isPassed: boolean
  createdAt: string
  person: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  answers: any
}

interface Exam {
  id: string
  title: string
  examCode: string
  totalScore: number
  passingScore: number
  examDate: string
}

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    fetchExamAndResults()
  }, [examId])

  const fetchExamAndResults = async () => {
    try {
      setLoading(true)

      // Sınavı yükle
      const examRes = await fetch(`/api/exams/${examId}`)
      const examData = await examRes.json()

      if (examRes.ok && !examData.error) {
        setExam(examData)
      }

      // Sonuçları yükle
      const resultsRes = await fetch(`/api/exams/${examId}/results`)
      const resultsData = await resultsRes.json()

      if (resultsData.success) {
        setResults(resultsData.data)
      }

    } catch (error) {
      console.error('Error fetching exam results:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    if (filter === 'passed') return result.isPassed
    if (filter === 'failed') return !result.isPassed
    return true
  })

  const stats = {
    total: results.length,
    passed: results.filter(r => r.isPassed).length,
    failed: results.filter(r => !r.isPassed).length,
    averageScore: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0,
    passRate: results.length > 0
      ? Math.round((results.filter(r => r.isPassed).length / results.length) * 100)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Sınav bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/sinavlar/${examId}/sorular`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{exam.title} - Sonuçlar</h1>
            <p className="text-gray-600 mt-1">
              Sınav Kodu: <span className="font-mono font-semibold">{exam.examCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Toplam Katılımcı</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Başarılı</div>
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-10 h-10 text-red-600" />
            <div>
              <div className="text-sm text-gray-600">Başarısız</div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Award className="w-10 h-10 text-purple-600" />
            <div>
              <div className="text-sm text-gray-600">Ortalama Puan</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageScore}/{exam.totalScore}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-orange-600" />
            <div>
              <div className="text-sm text-gray-600">Başarı Oranı</div>
              <div className="text-2xl font-bold text-orange-600">{stats.passRate}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü ({stats.total})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'passed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Başarılı ({stats.passed})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Başarısız ({stats.failed})
          </button>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Öğrenci
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  E-posta
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Puan
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {filter === 'all' 
                      ? 'Henüz sonuç bulunmuyor'
                      : `${filter === 'passed' ? 'Başarılı' : 'Başarısız'} sonuç bulunmuyor`
                    }
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {result.person.firstName} {result.person.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {result.person.email}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {result.score}
                      </span>
                      <span className="text-sm text-gray-500">
                        /{exam.totalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {result.isPassed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Başarılı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Başarısız
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {new Date(result.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
