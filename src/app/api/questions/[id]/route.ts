import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/questions/[id] - Tek soru getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Soru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Question fetch error:', error);
    return NextResponse.json(
      { error: 'Soru getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Soru güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Get old question to calculate point difference
    const oldQuestion = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!oldQuestion) {
      return NextResponse.json(
        { error: 'Soru bulunamadı' },
        { status: 404 }
      );
    }

    const newPoints = parseInt(body.points);
    const pointDiff = newPoints - oldQuestion.points;

    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        questionText: body.questionText,
        questionType: body.questionType,
        options: body.options || undefined,
        correctAnswer: body.correctAnswer,
        points: newPoints,
        order: body.order !== undefined ? parseInt(body.order) : undefined,
      },
    });

    // Update exam totalScore
    if (pointDiff !== 0) {
      await prisma.exam.update({
        where: { id: oldQuestion.examId },
        data: {
          totalScore: {
            increment: pointDiff,
          },
        },
      });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Question update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Soru bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Soru güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Soru sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Soru bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.question.delete({
      where: { id: params.id },
    });

    // Update exam totalScore
    await prisma.exam.update({
      where: { id: question.examId },
      data: {
        totalScore: {
          decrement: question.points,
        },
      },
    });

    return NextResponse.json({ message: 'Soru silindi' });
  } catch (error) {
    console.error('Question delete error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Soru bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Soru silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
