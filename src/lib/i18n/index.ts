// Internationalization (i18n) Configuration
export type Language = 'tr' | 'en';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  tr: TranslationKey;
  en: TranslationKey;
}

// Language configuration
export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export const DEFAULT_LANGUAGE: Language = 'tr';

// Translation strings
export const translations: Translations = {
  tr: {
    // Common
    common: {
      loading: 'Yükleniyor...',
      error: 'Hata oluştu',
      success: 'Başarılı',
      cancel: 'İptal',
      save: 'Kaydet',
      delete: 'Sil',
      edit: 'Düzenle',
      view: 'Görüntüle',
      back: 'Geri',
      next: 'İleri',
      previous: 'Önceki',
      close: 'Kapat',
      confirm: 'Onayla',
      yes: 'Evet',
      no: 'Hayır',
      or: 'veya',
      and: 've',
      select: 'Seçin',
      search: 'Ara',
      filter: 'Filtrele',
      sort: 'Sırala',
      download: 'İndir',
      upload: 'Yükle',
      print: 'Yazdır',
      share: 'Paylaş',
      copy: 'Kopyala',
      email: 'E-posta',
      phone: 'Telefon',
      address: 'Adres',
      date: 'Tarih',
      time: 'Saat',
      name: 'Ad',
      description: 'Açıklama',
      status: 'Durum',
      active: 'Aktif',
      inactive: 'Pasif',
      enabled: 'Etkin',
      disabled: 'Pasif',
      public: 'Genel',
      private: 'Özel',
      required: 'Zorunlu',
      optional: 'İsteğe bağlı'
    },
    
    // Navigation
    navigation: {
      home: 'Ana Sayfa',
      dashboard: 'Dashboard',
      packages: 'Paketler',
      audits: 'Audit Raporları',
      profile: 'Profil',
      settings: 'Ayarlar',
      logout: 'Çıkış Yap',
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      admin: 'Yönetim',
      analytics: 'Analitikler',
      users: 'Kullanıcılar',
      reports: 'Raporlar'
    },

    // Authentication
    auth: {
      welcome: 'Hoş Geldiniz',
      signIn: 'Giriş Yapın',
      signUp: 'Kayıt Olun',
      signOut: 'Çıkış Yap',
      forgotPassword: 'Şifremi Unuttum',
      resetPassword: 'Şifre Sıfırla',
      changePassword: 'Şifre Değiştir',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Şifre Onayı',
      emailAddress: 'E-posta Adresi',
      password: 'Şifre',
      fullName: 'Ad Soyad',
      company: 'Şirket',
      rememberMe: 'Beni Hatırla',
      signInGoogle: 'Google ile Giriş Yap',
      signInGithub: 'GitHub ile Giriş Yap',
      alreadyAccount: 'Zaten hesabınız var mı?',
      noAccount: 'Hesabınız yok mu?',
      termsAgree: 'Kullanım koşullarını kabul ediyorum',
      privacyAgree: 'Gizlilik politikasını kabul ediyorum'
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Hoş Geldiniz',
      overview: 'Genel Bakış',
      recentAudits: 'Son Audit Raporları',
      purchasedPackages: 'Satın Alınan Paketler',
      quickActions: 'Hızlı İşlemler',
      stats: {
        totalAudits: 'Toplam Audit',
        completedAudits: 'Tamamlanan Audit',
        averageScore: 'Ortalama Puan',
        improvements: 'İyileştirmeler'
      },
      actions: {
        newAudit: 'Yeni Audit',
        viewReports: 'Raporları Görüntüle',
        buyPackage: 'Paket Satın Al',
        viewAnalytics: 'Analitikleri Görüntüle'
      }
    },

    // Packages
    packages: {
      title: 'Audit Paketleri',
      subtitle: 'İşletmenize uygun audit paketini seçin',
      selectPackage: 'Paket Seçin',
      features: 'Özellikler',
      pricing: 'Fiyatlandırma',
      buyNow: 'Şimdi Satın Al',
      popular: 'Popüler',
      recommended: 'Önerilen',
      enterprise: 'Kurumsal',
      basic: 'Temel',
      advanced: 'Gelişmiş',
      premium: 'Premium',
      comparison: 'Paket Karşılaştırması',
      included: 'Dahil',
      notIncluded: 'Dahil değil',
      auditsIncluded: 'audit dahil',
      supportIncluded: 'destek dahil',
      reportsIncluded: 'rapor dahil'
    },

    // Audits
    audits: {
      title: 'Audit Raporları',
      subtitle: 'Tüm audit raporlarınızı görüntüleyin ve yönetin',
      newAudit: 'Yeni Audit Başlat',
      viewReport: 'Raporu Görüntüle',
      downloadReport: 'Raporu İndir',
      shareReport: 'Raporu Paylaş',
      auditHistory: 'Audit Geçmişi',
      websiteUrl: 'Web Sitesi URL',
      auditType: 'Audit Türü',
      startDate: 'Başlangıç Tarihi',
      completionDate: 'Tamamlanma Tarihi',
      score: 'Puan',
      issues: 'Sorunlar',
      recommendations: 'Öneriler',
      status: {
        pending: 'Beklemede',
        inProgress: 'İşlemde',
        completed: 'Tamamlandı',
        failed: 'Başarısız',
        cancelled: 'İptal Edildi'
      },
      categories: {
        performance: 'Performans',
        seo: 'SEO',
        security: 'Güvenlik',
        accessibility: 'Erişilebilirlik',
        bestPractices: 'En İyi Uygulamalar',
        usability: 'Kullanılabilirlik'
      }
    },

    // AI Recommendations
    aiRecommendations: {
      title: 'AI Önerileri',
      subtitle: 'Yapay zeka destekli akıllı öneriler',
      priority: {
        critical: 'Kritik',
        high: 'Yüksek',
        medium: 'Orta',
        low: 'Düşük'
      },
      impact: 'Etki',
      effort: 'Çaba',
      roi: 'Yatırım Getirisi',
      estimatedTime: 'Tahmini Süre',
      category: 'Kategori',
      reasoning: 'Neden önemli',
      implementationSteps: 'Uygulama Adımları',
      resources: 'Faydalı Kaynaklar',
      competitorAnalysis: 'Rakip Analizi',
      industryAverage: 'Sektör Ortalaması',
      yourPosition: 'Konumunuz',
      bestPractices: 'En İyi Uygulamalar',
      markImplemented: 'Uygulandı Olarak İşaretle',
      dismiss: 'Yok Say',
      showDetails: 'Detayları Göster',
      showLess: 'Daha Az Göster',
      filterByType: 'Türe Göre Filtrele',
      filterByPriority: 'Önceliğe Göre Filtrele',
      quickWins: 'Hızlı Kazanımlar',
      roiPotential: 'ROI Potansiyeli',
      implemented: 'Uygulandı'
    },

    // Analytics
    analytics: {
      title: 'Analitikler',
      subtitle: 'Kapsamlı iş zekası ve performans metrikleri',
      overview: 'Genel Bakış',
      users: 'Kullanıcılar',
      revenue: 'Gelir',
      trends: 'Trendler',
      dateRange: 'Tarih Aralığı',
      last7Days: 'Son 7 gün',
      last30Days: 'Son 30 gün',
      last90Days: 'Son 90 gün',
      lastYear: 'Son yıl',
      exportReport: 'Rapor Dışa Aktar',
      metrics: {
        totalUsers: 'Toplam Kullanıcı',
        activeUsers: 'Aktif Kullanıcılar',
        newUsers: 'Yeni Kullanıcılar',
        totalRevenue: 'Toplam Gelir',
        monthlyRevenue: 'Aylık Gelir',
        totalSales: 'Toplam Satış',
        conversionRate: 'Dönüşüm Oranı',
        averageScore: 'Ortalama Puan',
        completionRate: 'Tamamlanma Oranı',
        growth: 'Büyüme'
      }
    },

    // Profile & Settings
    profile: {
      title: 'Profil',
      personalInfo: 'Kişisel Bilgiler',
      accountSettings: 'Hesap Ayarları',
      securitySettings: 'Güvenlik Ayarları',
      notifications: 'Bildirimler',
      preferences: 'Tercihler',
      language: 'Dil',
      timezone: 'Saat Dilimi',
      currency: 'Para Birimi',
      theme: 'Tema',
      lightTheme: 'Açık Tema',
      darkTheme: 'Koyu Tema',
      emailNotifications: 'E-posta Bildirimleri',
      pushNotifications: 'Push Bildirimleri',
      marketingEmails: 'Pazarlama E-postaları',
      updateProfile: 'Profili Güncelle',
      changeAvatar: 'Avatar Değiştir',
      deleteAccount: 'Hesabı Sil',
      confirmDelete: 'Hesap silme işlemini onaylıyor musunuz?'
    },

    // Admin Panel
    admin: {
      title: 'Yönetim Paneli',
      subtitle: 'Platformunuzu yönetin ve performansı izleyin',
      userManagement: 'Kullanıcı Yönetimi',
      packageManagement: 'Paket Yönetimi',
      systemSettings: 'Sistem Ayarları',
      recentUsers: 'Son Kullanıcılar',
      packagePerformance: 'Paket Performansı',
      viewAll: 'Tümünü Görüntüle',
      viewDetails: 'Detayları Görüntüle',
      viewAnalytics: 'Analitikleri Görüntüle',
      stats: {
        totalUsers: 'Toplam Kullanıcı',
        totalSales: 'Toplam Satış',
        totalRevenue: 'Toplam Gelir',
        totalAudits: 'Toplam Audit',
        monthlyGrowth: 'Aylık Büyüme'
      }
    },

    // Error Messages
    errors: {
      general: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      network: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
      unauthorized: 'Bu işlem için yetkiniz yok.',
      notFound: 'Sayfa bulunamadı.',
      validation: 'Girdiğiniz bilgileri kontrol edin.',
      required: 'Bu alan zorunludur.',
      email: 'Geçerli bir e-posta adresi girin.',
      password: 'Şifreniz en az 8 karakter olmalıdır.',
      passwordMatch: 'Şifreler eşleşmiyor.',
      uploadError: 'Dosya yükleme hatası.',
      fileTooLarge: 'Dosya boyutu çok büyük.',
      unsupportedFormat: 'Desteklenmeyen dosya formatı.'
    },

    // Success Messages
    success: {
      profileUpdated: 'Profil başarıyla güncellendi.',
      passwordChanged: 'Şifre başarıyla değiştirildi.',
      auditCompleted: 'Audit başarıyla tamamlandı.',
      reportGenerated: 'Rapor başarıyla oluşturuldu.',
      packagePurchased: 'Paket başarıyla satın alındı.',
      emailSent: 'E-posta başarıyla gönderildi.',
      accountCreated: 'Hesap başarıyla oluşturuldu.',
      loginSuccessful: 'Giriş başarılı.',
      logoutSuccessful: 'Çıkış başarılı.',
      saved: 'Başarıyla kaydedildi.',
      deleted: 'Başarıyla silindi.',
      copied: 'Panoya kopyalandı.'
    }
  },
  
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      select: 'Select',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      download: 'Download',
      upload: 'Upload',
      print: 'Print',
      share: 'Share',
      copy: 'Copy',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      date: 'Date',
      time: 'Time',
      name: 'Name',
      description: 'Description',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      public: 'Public',
      private: 'Private',
      required: 'Required',
      optional: 'Optional'
    },
    
    // Navigation
    navigation: {
      home: 'Home',
      dashboard: 'Dashboard',
      packages: 'Packages',
      audits: 'Audit Reports',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      admin: 'Admin',
      analytics: 'Analytics',
      users: 'Users',
      reports: 'Reports'
    },

    // Authentication
    auth: {
      welcome: 'Welcome',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      emailAddress: 'Email Address',
      password: 'Password',
      fullName: 'Full Name',
      company: 'Company',
      rememberMe: 'Remember Me',
      signInGoogle: 'Sign in with Google',
      signInGithub: 'Sign in with GitHub',
      alreadyAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      termsAgree: 'I agree to the terms and conditions',
      privacyAgree: 'I agree to the privacy policy'
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome',
      overview: 'Overview',
      recentAudits: 'Recent Audit Reports',
      purchasedPackages: 'Purchased Packages',
      quickActions: 'Quick Actions',
      stats: {
        totalAudits: 'Total Audits',
        completedAudits: 'Completed Audits',
        averageScore: 'Average Score',
        improvements: 'Improvements'
      },
      actions: {
        newAudit: 'New Audit',
        viewReports: 'View Reports',
        buyPackage: 'Buy Package',
        viewAnalytics: 'View Analytics'
      }
    },

    // Packages
    packages: {
      title: 'Audit Packages',
      subtitle: 'Choose the right audit package for your business',
      selectPackage: 'Select Package',
      features: 'Features',
      pricing: 'Pricing',
      buyNow: 'Buy Now',
      popular: 'Popular',
      recommended: 'Recommended',
      enterprise: 'Enterprise',
      basic: 'Basic',
      advanced: 'Advanced',
      premium: 'Premium',
      comparison: 'Package Comparison',
      included: 'Included',
      notIncluded: 'Not included',
      auditsIncluded: 'audits included',
      supportIncluded: 'support included',
      reportsIncluded: 'reports included'
    },

    // Audits
    audits: {
      title: 'Audit Reports',
      subtitle: 'View and manage all your audit reports',
      newAudit: 'Start New Audit',
      viewReport: 'View Report',
      downloadReport: 'Download Report',
      shareReport: 'Share Report',
      auditHistory: 'Audit History',
      websiteUrl: 'Website URL',
      auditType: 'Audit Type',
      startDate: 'Start Date',
      completionDate: 'Completion Date',
      score: 'Score',
      issues: 'Issues',
      recommendations: 'Recommendations',
      status: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled'
      },
      categories: {
        performance: 'Performance',
        seo: 'SEO',
        security: 'Security',
        accessibility: 'Accessibility',
        bestPractices: 'Best Practices',
        usability: 'Usability'
      }
    },

    // AI Recommendations
    aiRecommendations: {
      title: 'AI Recommendations',
      subtitle: 'AI-powered intelligent suggestions',
      priority: {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low'
      },
      impact: 'Impact',
      effort: 'Effort',
      roi: 'Return on Investment',
      estimatedTime: 'Estimated Time',
      category: 'Category',
      reasoning: 'Why this matters',
      implementationSteps: 'Implementation Steps',
      resources: 'Helpful Resources',
      competitorAnalysis: 'Competitive Analysis',
      industryAverage: 'Industry Average',
      yourPosition: 'Your Position',
      bestPractices: 'Best Practices',
      markImplemented: 'Mark as Implemented',
      dismiss: 'Dismiss',
      showDetails: 'Show Details',
      showLess: 'Show Less',
      filterByType: 'Filter by Type',
      filterByPriority: 'Filter by Priority',
      quickWins: 'Quick Wins',
      roiPotential: 'ROI Potential',
      implemented: 'Implemented'
    },

    // Analytics
    analytics: {
      title: 'Analytics',
      subtitle: 'Comprehensive business intelligence and performance metrics',
      overview: 'Overview',
      users: 'Users',
      revenue: 'Revenue',
      trends: 'Trends',
      dateRange: 'Date Range',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      last90Days: 'Last 90 days',
      lastYear: 'Last year',
      exportReport: 'Export Report',
      metrics: {
        totalUsers: 'Total Users',
        activeUsers: 'Active Users',
        newUsers: 'New Users',
        totalRevenue: 'Total Revenue',
        monthlyRevenue: 'Monthly Revenue',
        totalSales: 'Total Sales',
        conversionRate: 'Conversion Rate',
        averageScore: 'Average Score',
        completionRate: 'Completion Rate',
        growth: 'Growth'
      }
    },

    // Profile & Settings
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      accountSettings: 'Account Settings',
      securitySettings: 'Security Settings',
      notifications: 'Notifications',
      preferences: 'Preferences',
      language: 'Language',
      timezone: 'Timezone',
      currency: 'Currency',
      theme: 'Theme',
      lightTheme: 'Light Theme',
      darkTheme: 'Dark Theme',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      marketingEmails: 'Marketing Emails',
      updateProfile: 'Update Profile',
      changeAvatar: 'Change Avatar',
      deleteAccount: 'Delete Account',
      confirmDelete: 'Are you sure you want to delete your account?'
    },

    // Admin Panel
    admin: {
      title: 'Admin Panel',
      subtitle: 'Manage your platform and monitor performance',
      userManagement: 'User Management',
      packageManagement: 'Package Management',
      systemSettings: 'System Settings',
      recentUsers: 'Recent Users',
      packagePerformance: 'Package Performance',
      viewAll: 'View All',
      viewDetails: 'View Details',
      viewAnalytics: 'View Analytics',
      stats: {
        totalUsers: 'Total Users',
        totalSales: 'Total Sales',
        totalRevenue: 'Total Revenue',
        totalAudits: 'Total Audits',
        monthlyGrowth: 'Monthly Growth'
      }
    },

    // Error Messages
    errors: {
      general: 'An error occurred. Please try again.',
      network: 'Network connection error. Please check your internet connection.',
      unauthorized: 'You are not authorized to perform this action.',
      notFound: 'Page not found.',
      validation: 'Please check the information you entered.',
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      password: 'Your password must be at least 8 characters long.',
      passwordMatch: 'Passwords do not match.',
      uploadError: 'File upload error.',
      fileTooLarge: 'File size is too large.',
      unsupportedFormat: 'Unsupported file format.'
    },

    // Success Messages
    success: {
      profileUpdated: 'Profile updated successfully.',
      passwordChanged: 'Password changed successfully.',
      auditCompleted: 'Audit completed successfully.',
      reportGenerated: 'Report generated successfully.',
      packagePurchased: 'Package purchased successfully.',
      emailSent: 'Email sent successfully.',
      accountCreated: 'Account created successfully.',
      loginSuccessful: 'Login successful.',
      logoutSuccessful: 'Logout successful.',
      saved: 'Saved successfully.',
      deleted: 'Deleted successfully.',
      copied: 'Copied to clipboard.'
    }
  }
};

// Utility functions
export function getNestedTranslation(
  translations: TranslationKey,
  key: string
): string {
  const keys = key.split('.');
  let result: any = translations;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : key;
}

export function formatTranslation(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}