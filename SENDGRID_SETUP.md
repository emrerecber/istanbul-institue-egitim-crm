# SendGrid Email Doğrulama Sistemi Kurulumu

## 📧 OTP (One-Time Password) Email Doğrulama

Proje, yeni öğrenci kaydında email doğrulama için SendGrid kullanmaktadır.

---

## 🚀 SendGrid Hesabı Oluşturma

### Adım 1: SendGrid'e Kaydolun
1. [SendGrid](https://signup.sendgrid.com/) adresine gidin
2. Ücretsiz hesap oluşturun (100 email/gün)
3. Email adresinizi doğrulayın

### Adım 2: API Key Oluşturun
1. SendGrid Dashboard'a girin
2. Sol menüden **Settings** → **API Keys** tıklayın
3. **Create API Key** butonuna tıklayın
4. Ad verin (örn: "Istanbul Institute CRM")
5. **Full Access** seçin
6. **Create & View** butonuna tıklayın
7. API Key'i kopyalayın (bir daha gösterilmeyecek!)

### Adım 3: Gönderen Email Adresi Doğrulama
1. Sol menüden **Settings** → **Sender Authentication** tıklayın
2. **Single Sender Verification** seçin
3. **Create New Sender** butonuna tıklayın
4. Formu doldurun:
   - From Name: `Istanbul Institute`
   - From Email Address: `noreply@istanbulinstitute.com` (veya sahip olduğunuz domain)
   - Reply To: Aynı email veya destek emaili
   - Company Address: İstanbul Institute adresi
5. **Create** butonuna tıklayın
6. Email'inize gelen doğrulama linkine tıklayın

---

## ⚙️ Proje Konfigürasyonu

### .env.local Dosyası

Proje root dizininde `.env.local` dosyası oluşturun (zaten varsa düzenleyin):

```bash
# Database (Supabase)
DATABASE_URL="your_supabase_connection_string"
DIRECT_URL="your_supabase_direct_url"

# SendGrid
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@istanbulinstitute.com"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Vercel Deployment İçin

Vercel Dashboard'da:
1. Project Settings → Environment Variables
2. Aşağıdaki değişkenleri ekleyin:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`

---

## 🎯 Nasıl Çalışır?

### 1. Öğrenci Kaydı Akışı

```
Kullanıcı → Form Doldurur (Ad, Soyad, Email)
    ↓
Kaydet Butonuna Basar
    ↓
Email Girildiyse → OTP Gönderilir (6 haneli kod)
    ↓
OTP Modal Açılır
    ↓
Kullanıcı Kodu Girer → Doğrulama Yapılır
    ↓
Başarılı → Öğrenci Kaydedilir
```

### 2. API Endpoints

- **`POST /api/persons/send-otp`**: OTP kodu oluşturur ve email gönderir
- **`POST /api/persons/verify-otp`**: OTP kodunu doğrular
- **Resend**: Modal içinde "Yeni Kod Gönder" butonu

### 3. Özellikler

✅ 6 haneli rastgele OTP kodu
✅ 10 dakika geçerlilik süresi
✅ Geri sayım timer
✅ Yeniden kod gönderme
✅ Responsive email template (Istanbul Institute logolu)
✅ Spam koruması

---

## 🧪 Test

### Lokal Test
```bash
npm run dev
```

1. http://localhost:3000/dashboard/kisiler adresine git
2. "Yeni Kişi Ekle" butonuna tıkla
3. Form doldurun (mutlaka email girin)
4. "Kaydet" butonuna tıklayın
5. Email'inizi kontrol edin (Spam klasörüne de bakın)
6. 6 haneli kodu girin ve doğrulayın

### Production Test
1. https://istanbul-institue-egitim-crm.vercel.app/dashboard/kisiler
2. Yukarıdaki adımları tekrarlayın

---

## 🔒 Güvenlik Notları

1. **API Key'i asla GitHub'a pushlama**
   - `.env.local` dosyası `.gitignore` içinde olmalı
   
2. **Rate Limiting** (Gelecek geliştirme)
   - Aynı email'e çok fazla OTP gönderimini engelle
   - IP bazlı limitleme
   
3. **Token Güvenliği**
   - Şu an Base64 encoding kullanılıyor
   - Production'da JWT veya encrypted token kullanılmalı

---

## 📊 SendGrid Limitleri

### Free Plan
- ✅ 100 email/gün
- ✅ Single Sender Verification
- ❌ Custom Domain (ücretli planlarda)

### Essentials Plan ($19.95/ay)
- ✅ 50,000 email/ay
- ✅ Domain Authentication
- ✅ Email API

---

## 🐛 Sorun Giderme

### "Email gönderilemedi" Hatası
1. API Key'in doğru olduğundan emin olun
2. Sender email'in doğrulandığını kontrol edin
3. SendGrid Dashboard'da Activity Feed'i kontrol edin

### Email Gelmiyor
1. Spam klasörünü kontrol edin
2. SendGrid Dashboard → Activity Feed → email durumunu kontrol edin
3. Sender email'in doğrulanmış olduğundan emin olun

### Vercel Deployment Hatası
1. Environment variables'ların doğru girildiğinden emin olun
2. Deployment loglarını kontrol edin
3. Vercel'de yeniden deploy yapın

---

## 📞 Destek

Sorun yaşarsanız:
- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: support@sendgrid.com
- Proje Issues: GitHub repository

---

## ✅ Checklist

Kurulum tamamlandıysa aşağıdakileri kontrol edin:

- [ ] SendGrid hesabı oluşturuldu
- [ ] API Key alındı
- [ ] Sender email doğrulandı
- [ ] `.env.local` dosyası yapılandırıldı
- [ ] Lokal test başarılı
- [ ] Vercel environment variables eklendi
- [ ] Production test başarılı

🎉 Tebrikler! Email doğrulama sistemi hazır.
