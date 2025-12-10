import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const results = await prisma.examResult.findMany({
      where: { examId: id },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error: any) {
    console.error('Error fetching exam results:', error)
    return NextResponse.json(
      { error: 'Sonuçlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
