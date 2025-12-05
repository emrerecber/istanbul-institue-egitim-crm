import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/registrations/[id] - Tek kayıt getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
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

    if (!registration) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Registration fetch error:', error);
    return NextResponse.json(
      { error: 'Kayıt getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/registrations/[id] - Kayıt güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Calculate payment status
    const paidAmount = parseFloat(body.paidAmount || '0');
    const totalAmount = parseFloat(body.totalAmount);

    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIAL';
    }

    const registration = await prisma.registration.update({
      where: { id: params.id },
      data: {
        personId: body.personId,
        courseId: body.courseId,
        companyId: body.companyId || undefined,
        status: body.status,
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

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Registration update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Geçersiz kişi, eğitim veya firma seçimi' },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Kayıt güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/registrations/[id] - Kayıt sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.registration.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Kayıt silindi' });
  } catch (error) {
    console.error('Registration delete error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Kayıt bulunamadı' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Kayıt silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
