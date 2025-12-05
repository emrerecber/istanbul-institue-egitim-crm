import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/registrations - Liste
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const courseId = searchParams.get('courseId') || '';

    const where: Prisma.RegistrationWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { person: { firstName: { contains: search, mode: 'insensitive' } } },
                { person: { lastName: { contains: search, mode: 'insensitive' } } },
                { person: { email: { contains: search, mode: 'insensitive' } } },
                { course: { name: { contains: search, mode: 'insensitive' } } },
                { course: { code: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {},
        status ? { status: status as any } : {},
        paymentStatus ? { paymentStatus: paymentStatus as any } : {},
        courseId ? { courseId } : {},
      ],
    };

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        registrationDate: 'desc',
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    return NextResponse.json(
      { error: 'Kayıtlar getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/registrations - Yeni kayıt oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Calculate remaining amount
    const paidAmount = parseFloat(body.paidAmount || '0');
    const totalAmount = parseFloat(body.totalAmount);

    // Determine payment status
    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    const registration = await prisma.registration.create({
      data: {
        personId: body.personId,
        courseId: body.courseId,
        companyId: body.companyId || undefined,
        status: body.status || 'POTENTIAL',
        paymentStatus: paymentStatus,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        discount: body.discount ? parseFloat(body.discount) : undefined,
        notes: body.notes || undefined,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Registration creation error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Geçersiz kişi, eğitim veya firma seçimi' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Kayıt oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
