import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/exams/[id]/questions - Sınav sorularını listele
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questions = await prisma.question.findMany({
      where: { examId: params.id },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { error: 'Sorular getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/exams/[id]/questions - Soru ekle (tek veya toplu)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const examId = params.id;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Sınav bulunamadı' },
        { status: 404 }
      );
    }

    // Check if bulk import or single question
    const isBulk = Array.isArray(body);
    
    if (isBulk) {
      // Bulk import
      const questions = body.map((q: any, index: number) => ({
        examId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || undefined,
        correctAnswer: q.correctAnswer,
        points: parseInt(q.points),
        order: q.order !== undefined ? parseInt(q.order) : index + 1,
      }));

      const result = await prisma.question.createMany({
        data: questions,
      });

      // Update exam totalScore
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      await prisma.exam.update({
        where: { id: examId },
        data: {
          totalScore: {
            increment: totalPoints,
          },
        },
      });

      return NextResponse.json({
        message: `${result.count} soru eklendi`,
        count: result.count,
      }, { status: 201 });
    } else {
      // Single question
      // Get current max order
      const maxOrder = await prisma.question.findFirst({
        where: { examId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const question = await prisma.question.create({
        data: {
          examId,
          questionText: body.questionText,
          questionType: body.questionType,
          options: body.options || undefined,
          correctAnswer: body.correctAnswer,
          points: parseInt(body.points),
          order: body.order !== undefined ? parseInt(body.order) : (maxOrder?.order || 0) + 1,
        },
      });

      // Update exam totalScore
      await prisma.exam.update({
        where: { id: examId },
        data: {
          totalScore: {
            increment: parseInt(body.points),
          },
        },
      });

      return NextResponse.json(question, { status: 201 });
    }
  } catch (error) {
    console.error('Question creation error:', error);

    return NextResponse.json(
      { error: 'Soru eklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/exams/[id]/questions - Tüm soruları sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await prisma.question.deleteMany({
      where: { examId: params.id },
    });

    // Reset exam totalScore
    await prisma.exam.update({
      where: { id: params.id },
      data: {
        totalScore: 0,
      },
    });

    return NextResponse.json({
      message: `${result.count} soru silindi`,
      count: result.count,
    });
  } catch (error) {
    console.error('Questions delete error:', error);
    return NextResponse.json(
      { error: 'Sorular silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
