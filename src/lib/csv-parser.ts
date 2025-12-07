// Simple CSV parser for question import
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV dosyası en az bir başlık satırı ve bir veri satırı içermelidir');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length === 0) continue; // Skip empty lines
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

// Validate CSV structure for question import
export function validateQuestionCSV(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('CSV dosyası boş');
    return { valid: false, errors };
  }
  
  // Check required headers
  const requiredHeaders = ['questionText', 'questionType', 'correctAnswer', 'points'];
  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  
  requiredHeaders.forEach(header => {
    if (!headers.includes(header)) {
      errors.push(`Gerekli kolon eksik: ${header}`);
    }
  });
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 for Excel row numbering (header is row 1)
    
    if (!row.questionText || !row.questionText.trim()) {
      errors.push(`Satır ${rowNum}: Soru metni boş olamaz`);
    }
    
    if (!['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'].includes(row.questionType)) {
      errors.push(`Satır ${rowNum}: Geçersiz soru tipi (${row.questionType})`);
    }
    
    if (!row.correctAnswer || !row.correctAnswer.trim()) {
      errors.push(`Satır ${rowNum}: Doğru cevap boş olamaz`);
    }
    
    if (!row.points || isNaN(parseInt(row.points))) {
      errors.push(`Satır ${rowNum}: Geçersiz puan değeri`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
