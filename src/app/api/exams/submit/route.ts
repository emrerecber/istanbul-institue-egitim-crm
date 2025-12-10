import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId, studentInfo, answers } = body

    // Validation
    if (!examId || !studentInfo || !answers) {
      return NextResponse.json(
        { error: 'Eksik bilgiler' },
        { status: 400 }
      )
    }

    if (!studentInfo.firstName || !studentInfo.lastName || !studentInfo.email) {
      return NextResponse.json(
        { error: 'Öğrenci bilgileri eksik' },
        { status: 400 }
      )
    }

    // Sınavı ve soruları yükle
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Sınav bulunamadı' },
        { status: 404 }
      )
    }

    // Öğrenciyi bul veya oluştur
    let person = await prisma.person.findUnique({
      where: { email: studentInfo.email }
    })

    if (!person) {
      // Admin user'ı bul
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@istanbulinstitute.com' }
      })

      if (!admin) {
        return NextResponse.json(
          { error: 'Sistem hatası: Admin kullanıcı bulunamadı' },
          { status: 500 }
        )
      }

      // Yeni öğrenci oluştur
      person = await prisma.person.create({
        data: {
          firstName: studentInfo.firstName,
          lastName: studentInfo.lastName,
          email: studentInfo.email,
          isActive: true,
          createdById: admin.id
        }
      })
    }

    // Puanlama yap
    let totalScore = 0
    const answerDetails: any[] = []

    exam.questions.forEach(question => {
      const studentAnswer = answers[question.id]
      let isCorrect = false
      let earnedPoints = 0

      if (studentAnswer) {
        // Cevap kontrolü
        if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
          isCorrect = studentAnswer === question.correctAnswer
          earnedPoints = isCorrect ? question.points : 0
        } else if (question.questionType === 'SHORT_ANSWER') {
          // Kısa cevap - tam eşleşme (case-insensitive)
          isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
          earnedPoints = isCorrect ? question.points : 0
        } else if (question.questionType === 'ESSAY') {
          // Yazılı sorular manuel değerlendirilmeli - şimdilik 0 puan
          isCorrect = false
          earnedPoints = 0
        }
      }

      totalScore += earnedPoints

      answerDetails.push({
        questionId: question.id,
        studentAnswer: studentAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        earnedPoints,
        maxPoints: question.points
      })
    })

    const isPassed = totalScore >= exam.passingScore

    // Sonucu kaydet
    const result = await prisma.examResult.create({
      data: {
        examId: exam.id,
        personId: person.id,
        score: totalScore,
        isPassed,
        answers: answerDetails
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        resultId: result.id,
        score: totalScore,
        totalScore: exam.totalScore,
        passingScore: exam.passingScore,
        isPassed,
        message: isPassed 
          ? 'Tebrikler! Sınavı başarıyla geçtiniz.' 
          : 'Üzgünüz, sınavı geçemediniz.'
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error submitting exam:', error)
    
    // Duplicate entry hatası
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu sınavı daha önce tamamladınız' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Sınav gönderilirken hata oluştu' },
      { status: 500 }
    )
  }
}
