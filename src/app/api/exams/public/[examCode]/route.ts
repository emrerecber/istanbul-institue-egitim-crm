import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { examCode: string } }
) {
  try {
    const { examCode } = params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const exam = await prisma.exam.findUnique({
      where: { 
        examCode,
        isActive: true
      },
      include: {
        course: {
          select: {
            id: true,
            name: true
          }
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            points: true,
            order: true,
            // correctAnswer'ı GÖNDERMİYORUZ - güvenlik için
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Sınav bulunamadı veya aktif değil' },
        { status: 404 }
      )
    }

    // Email kontrolü varsa, kayıt ve ödeme kontrolü yap
    if (email) {
      const person = await prisma.person.findUnique({
        where: { email }
      })

      if (!person) {
        return NextResponse.json(
          { error: 'Bu email ile kayıtlı öğrenci bulunamadı' },
          { status: 403 }
        )
      }

      // Bu öğrencinin bu eğitimi almış ve ödeme yapmış olması gerekiyor
      const registration = await prisma.registration.findFirst({
        where: {
          personId: person.id,
          courseId: exam.courseId,
          paymentStatus: 'PAID' // Sadece ödeme yapanlar
        }
      })

      if (!registration) {
        return NextResponse.json(
          { 
            error: 'Bu sınava girmek için eğitime kayıtlı olmalı ve ödemeni tamamlamış olmalısın',
            details: 'Eğitim kaydı veya ödeme bulunamadı'
          },
          { status: 403 }
        )
      }

      // Daha önce bu sınava girmiş mi kontrol et
      const existingResult = await prisma.examResult.findUnique({
        where: {
          examId_personId: {
            examId: exam.id,
            personId: person.id
          }
        }
      })

      if (existingResult) {
        return NextResponse.json(
          { error: 'Bu sınavı daha önce tamamladınız' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: exam
    })

  } catch (error: any) {
    console.error('Error fetching public exam:', error)
    return NextResponse.json(
      { error: 'Sınav yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
