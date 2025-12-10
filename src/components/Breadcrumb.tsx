'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb() {
  const pathname = usePathname()
  
  // Path'i parse et
  const segments = pathname.split('/').filter(Boolean)
  
  // Türkçe etiketler
  const labelMap: Record<string, string> = {
    'dashboard': 'Ana Sayfa',
    'kisiler': 'Kişiler',
    'firmalar': 'Firmalar',
    'egitimler': 'Eğitimler',
    'kayitlar': 'Kayıtlar',
    'sinavlar': 'Sınavlar',
    'sorular': 'Sorular',
    'mali': 'Mali İşlemler',
    'raporlar': 'Raporlar',
  }
  
  // Breadcrumb item'ları oluştur
  const breadcrumbItems: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = labelMap[segment] || segment
    
    return {
      label,
      href: index === segments.length - 1 ? undefined : href // Son item'a link verme
    }
  })
  
  // Ana sayfa item'ını ekle
  if (breadcrumbItems.length > 0 && breadcrumbItems[0].label !== 'Ana Sayfa') {
    breadcrumbItems.unshift({
      label: 'Ana Sayfa',
      href: '/dashboard'
    })
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      {/* Logo */}
      <div className="w-6 h-6 rounded overflow-hidden bg-white flex items-center justify-center flex-shrink-0 border border-gray-200">
        <img 
          src="/istanbul-institute-logo.png" 
          alt="Istanbul Institute" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Breadcrumb Items */}
      <div className="flex items-center gap-2">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            
            {item.href ? (
              <Link 
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-semibold">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
