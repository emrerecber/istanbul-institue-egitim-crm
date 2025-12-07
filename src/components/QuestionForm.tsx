import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface QuestionFormProps {
  examId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ examId, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    points: '10',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Soru metni gereklidir';
    }

    if (!formData.points || parseInt(formData.points) <= 0) {
      newErrors.points = 'Geçerli bir puan giriniz';
    }

    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'Doğru cevap gereklidir';
    }

    // Validate options for multiple choice
    if (formData.questionType === 'MULTIPLE_CHOICE') {
      if (!formData.optionA.trim()) {
        newErrors.optionA = 'A şıkkı gereklidir';
      }
      if (!formData.optionB.trim()) {
        newErrors.optionB = 'B şıkkı gereklidir';
      }
      // C and D are optional, but if correctAnswer is C or D, they must exist
      if (formData.correctAnswer === 'C' && !formData.optionC.trim()) {
        newErrors.optionC = 'Doğru cevap C ise C şıkkı gereklidir';
      }
      if (formData.correctAnswer === 'D' && !formData.optionD.trim()) {
        newErrors.optionD = 'Doğru cevap D ise D şıkkı gereklidir';
      }
    }

    // Validate TRUE_FALSE
    if (formData.questionType === 'TRUE_FALSE') {
      if (!['Doğru', 'Yanlış', 'TRUE', 'FALSE'].includes(formData.correctAnswer)) {
        newErrors.correctAnswer = 'Doğru/Yanlış soruları için cevap "Doğru" veya "Yanlış" olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data based on question type
      const questionData: any = {
        questionText: formData.questionText,
        questionType: formData.questionType,
        correctAnswer: formData.correctAnswer,
        points: parseInt(formData.points),
      };

      // Add options for multiple choice
      if (formData.questionType === 'MULTIPLE_CHOICE') {
        questionData.options = {
          A: formData.optionA,
          B: formData.optionB,
          C: formData.optionC || undefined,
          D: formData.optionD || undefined,
        };
      }

      await onSubmit(questionData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Soru Tipi *
        </label>
        <select
          name="questionType"
          value={formData.questionType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
          <option value="TRUE_FALSE">Doğru/Yanlış</option>
          <option value="SHORT_ANSWER">Kısa Cevap</option>
          <option value="ESSAY">Yazılı</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Soru Metni *
        </label>
        <textarea
          name="questionText"
          value={formData.questionText}
          onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.questionText ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Soru metnini buraya yazın..."
        />
        {errors.questionText && (
          <p className="mt-1 text-xs text-red-500">{errors.questionText}</p>
        )}
      </div>

      {/* Multiple Choice Options */}
      {formData.questionType === 'MULTIPLE_CHOICE' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">Şıklar</h4>
          
          <Input
            label="A Şıkkı *"
            name="optionA"
            value={formData.optionA}
            onChange={handleChange}
            error={errors.optionA}
            placeholder="A şıkkı"
          />

          <Input
            label="B Şıkkı *"
            name="optionB"
            value={formData.optionB}
            onChange={handleChange}
            error={errors.optionB}
            placeholder="B şıkkı"
          />

          <Input
            label="C Şıkkı (Opsiyonel)"
            name="optionC"
            value={formData.optionC}
            onChange={handleChange}
            error={errors.optionC}
            placeholder="C şıkkı"
          />

          <Input
            label="D Şıkkı (Opsiyonel)"
            name="optionD"
            value={formData.optionD}
            onChange={handleChange}
            error={errors.optionD}
            placeholder="D şıkkı"
          />
        </div>
      )}

      {/* Instructions based on question type */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          {formData.questionType === 'MULTIPLE_CHOICE' && (
            <span>💡 Doğru cevabı A, B, C veya D olarak giriniz.</span>
          )}
          {formData.questionType === 'TRUE_FALSE' && (
            <span>💡 Doğru cevabı "Doğru" veya "Yanlış" olarak giriniz.</span>
          )}
          {formData.questionType === 'SHORT_ANSWER' && (
            <span>💡 Beklenen kısa cevabı tam olarak giriniz.</span>
          )}
          {formData.questionType === 'ESSAY' && (
            <span>💡 Yazılı sorular manuel olarak değerlendirilir. Örnek cevap veya anahtar kelimeler giriniz.</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Doğru Cevap *"
          name="correctAnswer"
          value={formData.correctAnswer}
          onChange={handleChange}
          error={errors.correctAnswer}
          placeholder={
            formData.questionType === 'MULTIPLE_CHOICE' ? 'Örn: A' :
            formData.questionType === 'TRUE_FALSE' ? 'Doğru veya Yanlış' :
            'Doğru cevap'
          }
        />

        <Input
          label="Puan *"
          name="points"
          type="number"
          value={formData.points}
          onChange={handleChange}
          error={errors.points}
          placeholder="10"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Soru Ekle'}
        </Button>
      </div>
    </form>
  );
};
