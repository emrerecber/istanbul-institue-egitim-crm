import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tempToken, otp } = body

    // Validation
    if (!tempToken || !otp) {
      return NextResponse.json(
        { error: 'Token ve OTP zorunludur' },
        { status: 400 }
      )
    }

    // Token'ı decode et
    let email: string
    let storedOtp: string
    let expiryTime: number

    try {
      const decoded = Buffer.from(tempToken, 'base64').toString('utf-8')
      const parts = decoded.split(':')
      
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }

      email = parts[0]
      storedOtp = parts[1]
      expiryTime = parseInt(parts[2])
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 400 }
      )
    }

    // OTP'nin süresini kontrol et
    if (Date.now() > expiryTime) {
      return NextResponse.json(
        { error: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.' },
        { status: 400 }
      )
    }

    // OTP'yi kontrol et
    if (otp !== storedOtp) {
      return NextResponse.json(
        { error: 'Hatalı doğrulama kodu' },
        { status: 400 }
      )
    }

    // OTP doğru - email doğrulandı
    return NextResponse.json({
      success: true,
      message: 'Email başarıyla doğrulandı',
      email,
      verified: true
    })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
