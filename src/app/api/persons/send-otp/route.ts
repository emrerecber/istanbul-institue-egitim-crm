import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, getOTPExpiry, sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName } = body

    // Validation
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email ve isim zorunludur' },
        { status: 400 }
      )
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      )
    }

    // OTP oluştur
    const otp = generateOTP()
    const expiry = getOTPExpiry(10) // 10 dakika

    // Email gönder
    const emailResult = await sendOTPEmail(email, firstName, otp)
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Email gönderilemedi' },
        { status: 500 }
      )
    }

    // OTP'yi veritabanına kaydet (eğer kişi varsa güncelle, yoksa session'da saklanacak)
    // Bu aşamada sadece response'da döndüreceğiz, 
    // verify-otp'de kişi kaydedilirken OTP kontrolü yapılacak
    
    return NextResponse.json({
      success: true,
      message: 'Doğrulama kodu email adresinize gönderildi',
      // OTP'yi hash'lenmiş halde veya session'da saklamak daha güvenli
      // Şimdilik basit tutuyoruz - production'da JWT veya session kullan
      tempToken: Buffer.from(`${email}:${otp}:${expiry.getTime()}`).toString('base64')
    })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
