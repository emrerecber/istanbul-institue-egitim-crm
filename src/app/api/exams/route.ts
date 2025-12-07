import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExamCode } from '@/lib/utils';
import { Prisma } from '@prisma/client';

// GET /api/exams - Liste
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const courseId = searchParams.get('courseId') || '';

    const where: Prisma.ExamWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { examCode: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        courseId ? { courseId } : {},
      ],
    };

    const exams = await prisma.exam.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
      orderBy: {
        examDate: 'desc',
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error('Exams fetch error:', error);
    return NextResponse.json(
      { error: 'Sınavlar getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/exams - Yeni sınav oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique exam code
    let examCode = generateExamCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await prisma.exam.findUnique({
        where: { examCode },
      });

      if (!existing) break;
      
      examCode = generateExamCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Benzersiz sınav kodu oluşturulamadı' },
        { status: 500 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        courseId: body.courseId,
        examCode,
        title: body.title,
        description: body.description || undefined,
        examDate: new Date(body.examDate),
        duration: parseInt(body.duration),
        totalScore: parseInt(body.totalScore),
        passingScore: parseInt(body.passingScore),
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error('Exam creation error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Geçersiz eğitim seçimi' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Sınav oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
