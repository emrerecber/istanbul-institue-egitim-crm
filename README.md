# 🎓 Eğitim CRM Sistemi

Modern ve kapsamlı bir eğitim kurumu yönetim sistemi. Next.js 14, TypeScript, Prisma ve PostgreSQL ile geliştirilmiştir.

## ✨ Özellikler

### 👥 Kişi ve Firma Yönetimi
- Öğrenci ve iletişim kişileri yönetimi
- Firma kayıtları ve kurumsal eğitimler
- Detaylı kişi profilleri ve iletişim geçmişi

### 📚 Eğitim Yönetimi
- Eğitim programları ve kategoriler
- Kapasite ve katılımcı takibi
- Eğitim takvimi ve planlama
- Eğitmen atamaları

### 💰 Mali İşlemler
- Gelir ve gider takibi
- Ödeme planları ve taksitlendirme
- Mali raporlar ve analizler
- Fatura ve makbuz yönetimi

### 📋 Kayıt ve Katılım
- Potansiyel ve kesin kayıt yönetimi
- Online başvuru sistemi
- Otomatik yoklama takibi
- Katılım raporları

### 📝 Sınav ve Değerlendirme
- Online sınav sistemi
- Soru bankası yönetimi
- Otomatik değerlendirme
- Sonuç ve analiz raporları

### 📢 İletişim Modülü
- Toplu SMS ve e-posta gönderimi
- Duyuru yönetimi
- İletişim şablonları
- Otomatik bildirimler

### 📊 Raporlama ve Analitik
- Detaylı performans raporları
- Özelleştirilebilir dashboard
- Excel/PDF export
- Grafik ve görselleştirmeler

### 🌐 Dil Desteği
- Türkçe ve İngilizce arayüz
- Kullanıcı bazlı dil tercihi

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Chart.js / React-Chartjs-2
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

### 1. Repository'yi klonlayın
\`\`\`bash
git clone https://github.com/yourusername/egitim-crm.git
cd egitim-crm
\`\`\`

### 2. Bağımlılıkları yükleyin
\`\`\`bash
npm install
\`\`\`

### 3. Environment variables'ı ayarlayın
\`\`\`bash
cp .env.example .env
\`\`\`

`.env` dosyasını düzenleyin:
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/egitim_crm"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 4. Database'i oluşturun
\`\`\`bash
npx prisma db push
\`\`\`

### 5. (Opsiyonel) Seed data yükleyin
\`\`\`bash
npm run seed
\`\`\`

### 6. Development server'ı başlatın
\`\`\`bash
npm run dev
\`\`\`

Tarayıcıda http://localhost:3000 adresini açın.

## 📦 Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## 🗄️ Database Yönetimi

### Prisma Studio (Database GUI)
\`\`\`bash
npm run prisma:studio
\`\`\`

### Migration oluşturma
\`\`\`bash
npm run prisma:migrate
\`\`\`

### Prisma Client yenileme
\`\`\`bash
npm run prisma:generate
\`\`\`

## 🧪 Test

\`\`\`bash
# Testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage
\`\`\`

## 📁 Proje Yapısı

\`\`\`
egitim-crm/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API routes
│   │   ├── (auth)/           # Auth pages
│   │   └── (dashboard)/      # Dashboard pages
│   ├── components/           # React bileşenleri
│   ├── lib/                  # Utility fonksiyonlar
│   ├── hooks/                # Custom hooks
│   ├── context/              # React context
│   └── types/                # TypeScript types
├── public/                   # Static dosyalar
└── package.json
\`\`\`

## 🌍 Deployment

### Render.com
1. GitHub repository'nizi Render'a bağlayın
2. PostgreSQL database oluşturun
3. Web Service oluşturun ve environment variables'ı ayarlayın
4. Otomatik deploy başlayacak

### Vercel (Alternatif)
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

## 🔒 Güvenlik

- Tüm formlar CSRF korumalı
- SQL injection koruması (Prisma)
- XSS koruması
- Authentication ve authorization (NextAuth)
- Rate limiting (API routes)
- Audit logging

## 📝 Lisans

Bu proje özel bir projedir ve telif hakkı saklıdır.

## 👥 Geliştirici

İstanbul Institute - Eğitim Yönetim Sistemi

## 📞 Destek

Sorularınız için: [destek@example.com](mailto:destek@example.com)
