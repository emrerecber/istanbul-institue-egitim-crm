'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Clock, RefreshCw } from 'lucide-react'

interface OTPVerificationProps {
  email: string
  firstName: string
  tempToken: string
  onVerified: () => void
  onCancel: () => void
  onResend: () => Promise<{ success: boolean; tempToken?: string; error?: string }>
}

export default function OTPVerification({
  email,
  firstName,
  tempToken,
  onVerified,
  onCancel,
  onResend
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 dakika = 600 saniye
  const [canResend, setCanResend] = useState(false)
  const [currentToken, setCurrentToken] = useState(tempToken)

  // Geri sayım
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Lütfen 6 haneli kodu girin')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/persons/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: currentToken, otp })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Doğrulama başarısız')
        return
      }

      setSuccess('Email başarıyla doğrulandı! ✓')
      setTimeout(() => {
        onVerified()
      }, 1000)

    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    setOtp('')

    try {
      const result = await onResend()
      
      if (result.success && result.tempToken) {
        setCurrentToken(result.tempToken)
        setTimeLeft(600) // 10 dakika
        setCanResend(false)
        setSuccess('Yeni kod gönderildi! ✓')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Kod gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value: string) => {
    // Sadece rakam kabul et ve max 6 karakter
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setOtp(cleaned)
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.length === 6 && !loading) {
      handleVerify()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Email Doğrulama</h2>
              <p className="text-sm text-blue-100">Kodunuzu kontrol edin</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            <strong>{email}</strong> adresine 6 haneli bir doğrulama kodu gönderdik.
          </p>

          {/* OTP Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doğrulama Kodu
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={timeLeft <= 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
              Kalan süre: {formatTime(timeLeft)}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Doğrulanıyor...' : 'Doğrula'}
            </button>

            <button
              onClick={handleResend}
              disabled={loading || !canResend}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
              <RefreshCw className="w-4 h-4" />
              {canResend ? 'Yeni Kod Gönder' : 'Kod Gönderildi'}
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Kod gelmedi mi? Spam klasörünü kontrol edin veya yeni kod gönderin.
          </p>
        </div>
      </div>
    </div>
  )
}
