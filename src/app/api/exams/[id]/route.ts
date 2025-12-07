import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/exams/[id] - Tek sınav getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
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

    if (!exam) {
      return NextResponse.json(
        { error: 'Sınav bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Exam fetch error:', error);
    return NextResponse.json(
      { error: 'Sınav getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/exams/[id] - Sınav güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        courseId: body.courseId,
        title: body.title,
        description: body.description || undefined,
        examDate: new Date(body.examDate),
        duration: parseInt(body.duration),
        totalScore: parseInt(body.totalScore),
        passingScore: parseInt(body.passingScore),
        isActive: body.isActive,
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

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Exam update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Sınav bulunamadı' },
          { status: 404 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Geçersiz eğitim seçimi' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Sınav güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/exams/[id] - Sınav sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related questions first (cascade)
    await prisma.question.deleteMany({
      where: { examId: params.id },
    });

    // Delete related results
    await prisma.examResult.deleteMany({
      where: { examId: params.id },
    });

    // Delete exam
    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Sınav silindi' });
  } catch (error) {
    console.error('Exam delete error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Sınav bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Sınav silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
