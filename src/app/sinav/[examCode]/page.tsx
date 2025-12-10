'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'
  options: any
  points: number
  order: number
}

interface Exam {
  id: string
  title: string
  description: string
  duration: number
  totalScore: number
  passingScore: number
  questions: Question[]
}

export default function PublicExamPage() {
  const params = useParams()
  const router = useRouter()
  const examCode = params.examCode as string

  const [step, setStep] = useState<'info' | 'exam' | 'completed'>('info')
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Öğrenci bilgileri
  const [studentInfo, setStudentInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  // Sınav durumu
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)

  // Sınavı yükle
  const loadExam = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/exams/public/${examCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Sınav bulunamadı')
        return
      }

      setExam(data.data)
      setTimeLeft(data.data.duration * 60) // Dakikadan saniyeye çevir
    } catch (err) {
      setError('Sınav yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (examCode) {
      loadExam()
    }
  }, [examCode])

  // Timer
  useEffect(() => {
    if (step === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam() // Süre bittiğinde otomatik submit
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartExam = () => {
    if (!studentInfo.firstName || !studentInfo.lastName || !studentInfo.email) {
      setError('Lütfen tüm bilgileri doldurun')
      return
    }

    setExamStartTime(new Date())
    setStep('exam')
    setError('')
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitExam = async () => {
    if (!exam) return

    try {
      setLoading(true)

      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          studentInfo,
          answers
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Sınav gönderilemedi')
        return
      }

      setStep('completed')
    } catch (err) {
      setError('Sınav gönderilirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = exam?.questions[currentQuestionIndex]
  const progress = exam ? ((currentQuestionIndex + 1) / exam.questions.length) * 100 : 0

  if (loading && !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sınav yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  // Bilgi Formu
  if (step === 'info' && exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <img src="/istanbul-institute-logo.png" alt="Istanbul Institute" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{exam.title}</h1>
                <p className="text-blue-100">İstanbul Institute</p>
              </div>
            </div>
            {exam.description && (
              <p className="text-blue-100 mt-2">{exam.description}</p>
            )}
          </div>

          {/* Info */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{exam.duration}</div>
                <div className="text-sm text-gray-600">Dakika</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{exam.questions.length}</div>
                <div className="text-sm text-gray-600">Soru</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{exam.totalScore}</div>
                <div className="text-sm text-gray-600">Toplam Puan</div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Öğrenci Bilgileri</h3>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ad *"
                  value={studentInfo.firstName}
                  onChange={(e) => setStudentInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Soyad *"
                  value={studentInfo.lastName}
                  onChange={(e) => setStudentInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <input
                type="email"
                placeholder="E-posta *"
                value={studentInfo.email}
                onChange={(e) => setStudentInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleStartExam}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              Sınava Başla
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Sınava başladığınızda süre başlayacaktır. Sınav süresi boyunca sayfadan çıkmayınız.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sınav Ekranı
  if (step === 'exam' && exam && currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                <p className="text-sm text-gray-600">
                  {studentInfo.firstName} {studentInfo.lastName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Soru {currentQuestionIndex + 1} / {exam.questions.length}</span>
                <span>{Math.round(progress)}% Tamamlandı</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-900 mb-2">{currentQuestion.questionText}</p>
                  <span className="text-sm text-gray-500">{currentQuestion.points} puan</span>
                </div>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
                <>
                  {['A', 'B', 'C', 'D'].map(option => {
                    const optionText = currentQuestion.options?.[`option${option}`]
                    if (!optionText) return null

                    const isSelected = answers[currentQuestion.id] === option

                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, option)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-semibold text-blue-600">{option})</span>
                        <span className="text-gray-900">{optionText}</span>
                      </label>
                    )
                  })}
                </>
              )}

              {currentQuestion.questionType === 'TRUE_FALSE' && (
                <>
                  {['Doğru', 'Yanlış'].map(option => {
                    const isSelected = answers[currentQuestion.id] === option

                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQuestion.id, option)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-900 font-medium">{option}</span>
                      </label>
                    )
                  })}
                </>
              )}

              {(currentQuestion.questionType === 'SHORT_ANSWER' || currentQuestion.questionType === 'ESSAY') && (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  rows={currentQuestion.questionType === 'ESSAY' ? 8 : 3}
                  placeholder="Cevabınızı buraya yazın..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Önceki
              </button>

              {currentQuestionIndex === exam.questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                >
                  {loading ? 'Gönderiliyor...' : 'Sınavı Bitir'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sonraki →
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Soru Navigasyonu</h3>
            <div className="grid grid-cols-10 gap-2">
              {exam.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition ${
                    idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[q.id]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></span>
              Cevaplanmış sorular
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Tamamlandı Ekranı
  if (step === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sınav Tamamlandı!</h2>
          <p className="text-gray-600 mb-8">
            Sınavınız başarıyla gönderildi. Sonuçlarınız değerlendirildikten sonra size bildirilecektir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Tamam
          </button>
        </div>
      </div>
    )
  }

  return null
}
