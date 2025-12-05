import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompanyFormData } from '@/types'

// GET /api/companies/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        persons: true,
        registrations: {
          include: {
            person: true,
            course: true
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { success: false, error: 'Firma yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: CompanyFormData = await request.json()
    
    const existing = await prisma.company.findUnique({
      where: { id: params.id }
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      )
    }
    
    // Check taxNumber uniqueness
    if (body.taxNumber && body.taxNumber !== existing.taxNumber) {
      const taxInUse = await prisma.company.findUnique({
        where: { taxNumber: body.taxNumber }
      })
      if (taxInUse) {
        return NextResponse.json(
          { success: false, error: 'Bu vergi numarası zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    const company = await prisma.company.update({
      where: { id: params.id },
      data: body
    })
    
    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { success: false, error: 'Firma güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.company.findUnique({
      where: { id: params.id }
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      )
    }
    
    const company = await prisma.company.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { success: false, error: 'Firma silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
