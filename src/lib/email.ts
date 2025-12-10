import sgMail from '@sendgrid/mail'

// SendGrid API Key'i environment variable'dan al
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@istanbulinstitute.com'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

/**
 * 6 haneli rastgele OTP kodu üret
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * OTP süresini hesapla (varsayılan: 10 dakika)
 */
export function getOTPExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

/**
 * OTP'nin geçerli olup olmadığını kontrol et
 */
export function isOTPValid(expiry: Date | null): boolean {
  if (!expiry) return false
  return new Date() < expiry
}

/**
 * Email gönderme servisi - OTP
 */
export async function sendOTPEmail(
  to: string,
  firstName: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  if (!SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'İstanbul Institute - Email Doğrulama Kodu',
    text: `Merhaba ${firstName},\n\nEmail doğrulama kodunuz: ${otp}\n\nBu kod 10 dakika geçerlidir.\n\nİyi günler,\nİstanbul Institute`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { width: 60px; height: 60px; background: white; border-radius: 10px; margin: 0 auto 15px; padding: 10px; }
          .logo img { width: 100%; height: 100%; object-fit: contain; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .info { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://istanbul-institue-egitim-crm.vercel.app/istanbul-institute-logo.png" alt="Istanbul Institute">
            </div>
            <h1 style="margin: 0;">Email Doğrulama</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${firstName}</strong>,</p>
            
            <p>İstanbul Institute Eğitim CRM sistemine hoş geldiniz! Email adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="info">
              <strong>⏱️ Önemli:</strong> Bu kod <strong>10 dakika</strong> süreyle geçerlidir.
            </div>
            
            <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            
            <p>İyi günler,<br>
            <strong>İstanbul Institute Ekibi</strong></p>
          </div>
          
          <div class="footer">
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>&copy; 2024 İstanbul Institute. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await sgMail.send(msg)
    console.log(`OTP email sent to ${to}`)
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid error:', error.response?.body || error.message)
    return { 
      success: false, 
      error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.' 
    }
  }
}
