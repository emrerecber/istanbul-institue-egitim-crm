import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@istanbulinstitute.com' }
    })
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Test kullanıcısı zaten mevcut',
        data: { id: existing.id, email: existing.email }
      })
    }
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@istanbulinstitute.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test kullanıcısı oluşturuldu',
      data: { id: user.id, email: user.email }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { success: false, error: 'Test verileri oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
