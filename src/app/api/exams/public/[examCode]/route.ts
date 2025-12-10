import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { examCode: string } }
) {
  try {
    const { examCode } = params

    const exam = await prisma.exam.findUnique({
      where: { 
        examCode,
        isActive: true
      },
      include: {
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
