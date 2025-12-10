import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PersonFormData } from '@/types'

// GET /api/persons - List all persons with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (companyId) {
      where.companyId = companyId
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    const persons = await prisma.person.findMany({
      where,
      include: {
        company: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, data: persons })
  } catch (error: any) {
    console.error('Error fetching persons:', error)
    return NextResponse.json(
      { success: false, error: 'Kişiler yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/persons - Create new person
export async function POST(request: NextRequest) {
  try {
    const body: PersonFormData = await request.json()
    
    // Validation
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { success: false, error: 'Ad ve soyad zorunludur' },
        { status: 400 }
      )
    }
    
    // Check if email already exists
    if (body.email) {
      const existing = await prisma.person.findUnique({
        where: { email: body.email }
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    // Check if identityNumber already exists
    if (body.identityNumber) {
      const existing = await prisma.person.findUnique({
        where: { identityNumber: body.identityNumber }
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Bu TC kimlik numarası zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }
    
    // Get default admin user or create if not exists
    let user = await prisma.user.findUnique({
      where: { email: 'admin@istanbulinstitute.com' }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sistem kullanıcısı bulunamadı. Lütfen /api/seed endpoint\'ini çağırın.' },
        { status: 500 }
      )
    }
    
    const person = await prisma.person.create({
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        createdById: user.id
      },
      include: {
        company: true
      }
    })
    
    return NextResponse.json({ success: true, data: person }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating person:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Kişi oluşturulurken hata oluştu',
        details: error.message // Debug için
      },
      { status: 500 }
    )
  }
}
