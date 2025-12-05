import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/courses/[id] - Tek eğitim getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Eğitim bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Course fetch error:', error);
    return NextResponse.json(
      { error: 'Eğitim getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Eğitim güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        name: body.name,
        code: body.code,
        description: body.description || undefined,
        categoryId: body.categoryId || undefined,
        duration: parseInt(body.duration),
        capacity: parseInt(body.capacity),
        price: body.price,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        schedule: body.schedule || undefined,
        instructor: body.instructor || undefined,
        location: body.location || undefined,
        status: body.status,
        isActive: body.isActive,
      },
      include: {
        category: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Course update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu kod zaten kullanılıyor' },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Eğitim bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Eğitim güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Eğitim sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Eğitim silindi' });
  } catch (error) {
    console.error('Course delete error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Eğitim bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Eğitim silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
