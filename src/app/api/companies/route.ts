import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompanyFormData } from '@/types'

// GET /api/companies
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { sector: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const companies = await prisma.company.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { persons: true, registrations: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, data: companies })
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { success: false, error: 'Firmalar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/companies
export async function POST(request: NextRequest) {
  try {
    const body: CompanyFormData = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Firma adı zorunludur' },
        { status: 400 }
      )
    }
    
    // Check if taxNumber already exists
    if (body.taxNumber) {
      const existing = await prisma.company.findUnique({
        where: { taxNumber: body.taxNumber }
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Bu vergi numarası zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    // Get default admin user
    let user = await prisma.user.findUnique({
      where: { email: 'admin@istanbulinstitute.com' }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sistem kullanıcısı bulunamadı' },
        { status: 500 }
      )
    }
    
    const company = await prisma.company.create({
      data: {
        ...body,
        createdById: user.id
      }
    })
    
    return NextResponse.json({ success: true, data: company }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { success: false, error: 'Firma oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
