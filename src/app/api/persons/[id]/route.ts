import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PersonFormData } from '@/types'

// GET /api/persons/[id] - Get single person
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        registrations: {
          include: {
            course: true
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    if (!person) {
      return NextResponse.json(
        { success: false, error: 'Kişi bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: person })
  } catch (error: any) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { success: false, error: 'Kişi yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/persons/[id] - Update person
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: PersonFormData = await request.json()
    
    // Check if person exists
    const existing = await prisma.person.findUnique({
      where: { id: params.id }
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kişi bulunamadı' },
        { status: 404 }
      )
    }
    
    // Check if email is being changed and already used by another person
    if (body.email && body.email !== existing.email) {
      const emailInUse = await prisma.person.findUnique({
        where: { email: body.email }
      })
      if (emailInUse) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    // Check if identityNumber is being changed and already used
    if (body.identityNumber && body.identityNumber !== existing.identityNumber) {
      const idInUse = await prisma.person.findUnique({
        where: { identityNumber: body.identityNumber }
      })
      if (idInUse) {
        return NextResponse.json(
          { success: false, error: 'Bu TC kimlik numarası zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    const person = await prisma.person.update({
      where: { id: params.id },
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      },
      include: {
        company: true
      }
    })
    
    return NextResponse.json({ success: true, data: person })
  } catch (error: any) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { success: false, error: 'Kişi güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/persons/[id] - Delete person (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if person exists
    const existing = await prisma.person.findUnique({
      where: { id: params.id }
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kişi bulunamadı' },
        { status: 404 }
      )
    }
    
    // Soft delete by setting isActive to false
    const person = await prisma.person.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true, data: person })
  } catch (error: any) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { success: false, error: 'Kişi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
