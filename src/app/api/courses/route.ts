import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/courses - Liste
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: Prisma.CourseWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { instructor: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        status ? { status: status as any } : {},
        categoryId ? { categoryId } : {},
      ],
    };

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'Eğitimler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Yeni eğitim oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get first user ID for createdById
    const user = await prisma.user.findFirst({
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const course = await prisma.course.create({
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
        status: body.status || 'PLANNED',
        createdById: user.id,
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Course creation error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu kod zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Eğitim oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
