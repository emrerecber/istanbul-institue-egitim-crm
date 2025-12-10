import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSV template content
    const csvContent = `questionText,questionType,correctAnswer,points,optionA,optionB,optionC,optionD
"Türkiye'nin başkenti neresidir?",MULTIPLE_CHOICE,A,10,Ankara,İstanbul,İzmir,Bursa
"Node.js bir programlama dili midir?",TRUE_FALSE,Yanlış,5,,,
"JavaScript'te değişken tanımlamak için hangi anahtar kelime kullanılır?",SHORT_ANSWER,var,10,,,
"React'in avantajlarını açıklayınız.",ESSAY,Manuel değerlendirme gerekir,20,,,`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="soru-sablonu.csv"',
      },
    })
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: 'Şablon indirilirken hata oluştu' },
      { status: 500 }
    )
  }
}
