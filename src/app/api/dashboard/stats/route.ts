import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Toplam öğrenci sayısı (aktif kişiler)
    const totalStudents = await prisma.person.count({
      where: { isActive: true }
    })
    
    // Geçen ayki öğrenci sayısı
    const lastMonthStudents = await prisma.person.count({
      where: {
        isActive: true,
        createdAt: {
          lt: firstDayOfMonth
        }
      }
    })
    
    // Aktif eğitimler
    const activeCourses = await prisma.course.count({
      where: { status: 'ACTIVE', isActive: true }
    })
    
    // Geçen ayki aktif eğitimler
    const lastMonthCourses = await prisma.course.count({
      where: {
        status: 'ACTIVE',
        isActive: true,
        createdAt: {
          lt: firstDayOfMonth
        }
      }
    })
    
    // Bu ay gelir (confirmed registrations)
    const monthlyPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: firstDayOfMonth,
          lte: now
        }
      },
      _sum: {
        amount: true
      }
    })
    
    // Geçen ay gelir
    const lastMonthPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth
        }
      },
      _sum: {
        amount: true
      }
    })
    
    // Bekleyen kayıtlar
    const pendingRegistrations = await prisma.registration.count({
      where: { status: 'POTENTIAL' }
    })
    
    // Geçen ayki bekleyen kayıtlar
    const lastMonthPendingRegistrations = await prisma.registration.count({
      where: {
        status: 'POTENTIAL',
        createdAt: {
          lt: firstDayOfMonth
        }
      }
    })
    
    // Calculate growth percentages
    const studentGrowth = lastMonthStudents > 0 
      ? ((totalStudents - lastMonthStudents) / lastMonthStudents * 100) 
      : 0
      
    const courseGrowth = lastMonthCourses > 0
      ? ((activeCourses - lastMonthCourses) / lastMonthCourses * 100)
      : 0
      
    const monthlyRevenue = Number(monthlyPayments._sum.amount || 0)
    const lastRevenue = Number(lastMonthPayments._sum.amount || 0)
    const revenueGrowth = lastRevenue > 0
      ? ((monthlyRevenue - lastRevenue) / lastRevenue * 100)
      : 0
      
    const registrationGrowth = lastMonthPendingRegistrations > 0
      ? ((pendingRegistrations - lastMonthPendingRegistrations) / lastMonthPendingRegistrations * 100)
      : 0
    
    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        activeCourses,
        monthlyRevenue,
        pendingRegistrations,
        studentGrowth: Math.round(studentGrowth),
        courseGrowth: Math.round(courseGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        registrationGrowth: Math.round(registrationGrowth)
      }
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
