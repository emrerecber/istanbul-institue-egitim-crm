import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/exams/[id]/import - CSV/XLSX formatında toplu soru import
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id;

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Sınav bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli soru listesi gereklidir' },
        { status: 400 }
      );
    }

    // Validate questions
    const validationErrors: string[] = [];
    const validQuestions: any[] = [];

    questions.forEach((q: any, index: number) => {
      const errors: string[] = [];
      const rowNum = index + 2; // +2 because Excel row 1 is header, and array is 0-indexed

      // Required fields
      if (!q.questionText || !q.questionText.trim()) {
        errors.push(`Satır ${rowNum}: Soru metni gereklidir`);
      }

      if (!q.questionType) {
        errors.push(`Satır ${rowNum}: Soru tipi gereklidir`);
      } else if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'].includes(q.questionType)) {
        errors.push(`Satır ${rowNum}: Geçersiz soru tipi (${q.questionType})`);
      }

      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        errors.push(`Satır ${rowNum}: Doğru cevap gereklidir`);
      }

      if (!q.points || parseInt(q.points) <= 0) {
        errors.push(`Satır ${rowNum}: Geçerli bir puan değeri gereklidir`);
      }

      // Multiple choice specific validation
      if (q.questionType === 'MULTIPLE_CHOICE') {
        if (!q.optionA || !q.optionB) {
          errors.push(`Satır ${rowNum}: Çoktan seçmeli sorular için en az A ve B şıkları gereklidir`);
        }
      }

      if (errors.length > 0) {
        validationErrors.push(...errors);
      } else {
        // Prepare question data
        const questionData: any = {
          examId,
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          correctAnswer: q.correctAnswer.trim(),
          points: parseInt(q.points),
          order: q.order !== undefined ? parseInt(q.order) : index + 1,
        };

        // Add options for multiple choice
        if (q.questionType === 'MULTIPLE_CHOICE') {
          questionData.options = {
            A: q.optionA?.trim() || '',
            B: q.optionB?.trim() || '',
            C: q.optionC?.trim() || undefined,
            D: q.optionD?.trim() || undefined,
          };
        }

        validQuestions.push(questionData);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Doğrulama hataları',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Import questions
    const result = await prisma.question.createMany({
      data: validQuestions,
    });

    // Update exam totalScore
    const totalPoints = validQuestions.reduce((sum, q) => sum + q.points, 0);
    await prisma.exam.update({
      where: { id: examId },
      data: {
        totalScore: {
          increment: totalPoints,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} soru başarıyla içe aktarıldı`,
      count: result.count,
      totalPoints,
    }, { status: 201 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import işlemi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

// GET /api/exams/[id]/import/template - CSV şablon dosyası indir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CSV template content
    const csvContent = `questionText,questionType,correctAnswer,points,optionA,optionB,optionC,optionD
"JavaScript'te değişken tanımlamak için hangi anahtar kelime kullanılır?",MULTIPLE_CHOICE,A,10,"var, let, const","function","class","import"
"TypeScript JavaScript'in üzerine tip güvenliği ekler.",TRUE_FALSE,Doğru,5,,,
"React'te component state'ini güncellemek için hangi hook kullanılır?",SHORT_ANSWER,useState,15,,,
"MVC (Model-View-Controller) mimarisini açıklayınız.",ESSAY,"Model veriyi, View görünümü, Controller mantığı temsil eder",20,,,`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="soru-sablonu.csv"',
      },
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json(
      { error: 'Şablon indirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
