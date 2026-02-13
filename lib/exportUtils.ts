import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ============================================
   EXPORT UTILITIES
   PDF A4, Thermal 80mm, WhatsApp Share
   ============================================ */

// ============================================
// THERMAL PRINT 80mm CONFIGURATION
// ============================================

export const THERMAL_CONFIG = {
  // 80mm thermal paper = 72mm printable width
  // At 72 DPI: ~204 points width
  pageWidth: 80,
  pageHeight: 297, // Long roll paper
  printableWidth: 72,
  margin: 4,
  contentWidth: 64 // 72 - 8 margins
};

// ============================================
// PDF A4 CONFIGURATION  
// ============================================

export const A4_CONFIG = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 14,
  contentWidth: 182
};

// ============================================
// COLOR SCHEMES
// ============================================

const COLORS = {
  primary: [0, 0, 0] as [number, number, number],
  secondary: [0, 0, 0] as [number, number, number],
  success: [0, 0, 0] as [number, number, number],
  warning: [0, 0, 0] as [number, number, number],
  danger: [0, 0, 0] as [number, number, number],
  muted: [80, 80, 80] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  border: [0, 0, 0] as [number, number, number],
};

// ============================================
// THERMAL PDF GENERATOR
// ============================================

export function generateThermalPDF(
  title: string,
  content: ThermalContent,
  filename: string
) {
  // 80mm thermal paper dimensions (in mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 297] // 80mm width, variable height
  });
  
  const { margin, contentWidth, pageWidth } = THERMAL_CONFIG;
  let yPos = margin;
  
  // Header - compact for thermal (black & white)
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(0, 12, pageWidth, 12);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, pageWidth / 2, 5, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(6);
  doc.text(new Date().toLocaleString(), pageWidth / 2, 10, { align: 'center' });
  
  yPos = 15;
  doc.setTextColor(...COLORS.secondary);
  
  // Patient Info (if provided)
  if (content.patientInfo) {
    yPos = addThermalPatientInfo(doc, content.patientInfo, yPos);
  }
  
  // Dashed separator
  yPos = addThermalSeparator(doc, yPos);
  
  // Main Content Sections
  if (content.sections) {
    for (const section of content.sections) {
      yPos = addThermalSection(doc, section.title, section.items, yPos);
      yPos = addThermalSeparator(doc, yPos);
    }
  }
  
  // Meal Plan (if provided)
  if (content.mealPlan) {
    yPos = addThermalMealPlan(doc, content.mealPlan, yPos);
  }
  
  // Summary (if provided)
  if (content.summary) {
    yPos = addThermalSummary(doc, content.summary, yPos);
  }
  
  // Footer
  yPos += 3;
  doc.setFontSize(5);
  doc.setTextColor(...COLORS.muted);
  doc.text('Clinical Decision Support Tool', pageWidth / 2, yPos, { align: 'center' });
  yPos += 3;
  doc.text('For Healthcare Professionals Only', pageWidth / 2, yPos, { align: 'center' });
  
  // Add cut line
  yPos += 5;
  doc.setDrawColor(...COLORS.muted);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  doc.save(filename);
  return doc;
}

function addThermalPatientInfo(doc: jsPDF, patientInfo: any, yPos: number): number {
  const { margin, contentWidth, pageWidth } = THERMAL_CONFIG;
  
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.text('PATIENT', margin, yPos);
  yPos += 4;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(6);
  
  if (patientInfo.name) {
    doc.text(`Name: ${patientInfo.name}`, margin, yPos);
    yPos += 3;
  }
  if (patientInfo.hospitalNumber) {
    doc.text(`ID: ${patientInfo.hospitalNumber}`, margin, yPos);
    yPos += 3;
  }
  if (patientInfo.age || patientInfo.gender) {
    const ageGender = [
      patientInfo.age ? `${patientInfo.age}y` : '',
      patientInfo.gender ? patientInfo.gender.charAt(0).toUpperCase() : ''
    ].filter(Boolean).join(' / ');
    doc.text(ageGender, margin, yPos);
    yPos += 3;
  }
  
  return yPos + 2;
}

function addThermalSeparator(doc: jsPDF, yPos: number): number {
  const { margin, pageWidth } = THERMAL_CONFIG;
  doc.setDrawColor(...COLORS.border);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  doc.setLineDashPattern([], 0);
  return yPos + 3;
}

function addThermalSection(doc: jsPDF, title: string, items: string[], yPos: number): number {
  const { margin, contentWidth, pageWidth } = THERMAL_CONFIG;
  
  // Section title
  doc.setFont('times', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.primary);
  doc.text(title.toUpperCase(), margin, yPos);
  yPos += 4;
  
  // Items
  doc.setFont('times', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.secondary);
  
  for (const item of items) {
    const lines = doc.splitTextToSize(item, contentWidth);
    for (const line of lines) {
      doc.text(line, margin, yPos);
      yPos += 3;
    }
  }
  
  return yPos + 2;
}

function addThermalMealPlan(doc: jsPDF, mealPlan: any[], yPos: number): number {
  const { margin, contentWidth, pageWidth } = THERMAL_CONFIG;
  
  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primary);
  doc.text('MEAL PLAN', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  
  for (const day of mealPlan) {
    // Day header
    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.primary);
    doc.text(day.day || `Day`, margin, yPos);
    yPos += 4;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(...COLORS.secondary);
    
    // Breakfast
    if (day.breakfast) {
      doc.setFont('times', 'bold');
      doc.text('B:', margin, yPos);
      doc.setFont('times', 'normal');
      const bfItems = Array.isArray(day.breakfast) ? day.breakfast.join(', ') : day.breakfast;
      const bfLines = doc.splitTextToSize(bfItems, contentWidth - 5);
      doc.text(bfLines, margin + 5, yPos);
      yPos += Math.max(3, bfLines.length * 2.5);
    }
    
    // Lunch
    if (day.lunch) {
      doc.setFont('times', 'bold');
      doc.text('L:', margin, yPos);
      doc.setFont('times', 'normal');
      const lItems = Array.isArray(day.lunch) ? day.lunch.join(', ') : day.lunch;
      const lLines = doc.splitTextToSize(lItems, contentWidth - 5);
      doc.text(lLines, margin + 5, yPos);
      yPos += Math.max(3, lLines.length * 2.5);
    }
    
    // Dinner
    if (day.dinner) {
      doc.setFont('times', 'bold');
      doc.text('D:', margin, yPos);
      doc.setFont('times', 'normal');
      const dItems = Array.isArray(day.dinner) ? day.dinner.join(', ') : day.dinner;
      const dLines = doc.splitTextToSize(dItems, contentWidth - 5);
      doc.text(dLines, margin + 5, yPos);
      yPos += Math.max(3, dLines.length * 2.5);
    }
    
    // Snacks
    if (day.snacks) {
      doc.setFont('times', 'bold');
      doc.text('S:', margin, yPos);
      doc.setFont('times', 'normal');
      const sItems = Array.isArray(day.snacks) ? day.snacks.join(', ') : day.snacks;
      const sLines = doc.splitTextToSize(sItems, contentWidth - 5);
      doc.text(sLines, margin + 5, yPos);
      yPos += Math.max(3, sLines.length * 2.5);
    }
    
    yPos += 2;
  }
  
  return yPos;
}

function addThermalSummary(doc: jsPDF, summary: { label: string; value: string }[], yPos: number): number {
  const { margin, contentWidth, pageWidth } = THERMAL_CONFIG;
  
  // Box border (no fill for B&W)
  doc.setDrawColor(...COLORS.primary);
  doc.rect(margin, yPos - 1, contentWidth, summary.length * 4 + 4, 'S');
  
  doc.setFont('times', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.primary);
  doc.text('SUMMARY', margin + 2, yPos + 2);
  yPos += 5;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.secondary);
  
  for (const item of summary) {
    doc.text(`${item.label}: ${item.value}`, margin + 2, yPos);
    yPos += 3;
  }
  
  return yPos + 2;
}

// ============================================
// WHATSAPP SHARE UTILITY
// ============================================

export interface ShareContent {
  title: string;
  patientInfo?: any;
  summary?: string[];
  mealPlan?: any[];
  recommendations?: string[];
  warnings?: string[];
}

export function generateWhatsAppMessage(content: ShareContent): string {
  let message = '';
  
  // Header
  message += `*${content.title}*\n`;
  message += `📅 ${new Date().toLocaleDateString()}\n`;
  message += `─────────────────\n\n`;
  
  // Patient Info
  if (content.patientInfo) {
    message += `*👤 PATIENT*\n`;
    if (content.patientInfo.name) message += `Name: ${content.patientInfo.name}\n`;
    if (content.patientInfo.hospitalNumber) message += `ID: ${content.patientInfo.hospitalNumber}\n`;
    if (content.patientInfo.age) message += `Age: ${content.patientInfo.age} years\n`;
    message += `\n`;
  }
  
  // Summary
  if (content.summary && content.summary.length > 0) {
    message += `*📊 SUMMARY*\n`;
    for (const item of content.summary) {
      message += `• ${item}\n`;
    }
    message += `\n`;
  }
  
  // Meal Plan (condensed)
  if (content.mealPlan && content.mealPlan.length > 0) {
    message += `*🍽️ MEAL PLAN*\n`;
    for (const day of content.mealPlan.slice(0, 3)) { // First 3 days only for WhatsApp
      message += `\n*${day.day || 'Day'}*\n`;
      if (day.breakfast) {
        const bf = Array.isArray(day.breakfast) ? day.breakfast.slice(0, 2).join(', ') : day.breakfast;
        message += `🌅 ${bf}\n`;
      }
      if (day.lunch) {
        const l = Array.isArray(day.lunch) ? day.lunch.slice(0, 2).join(', ') : day.lunch;
        message += `🌞 ${l}\n`;
      }
      if (day.dinner) {
        const d = Array.isArray(day.dinner) ? day.dinner.slice(0, 2).join(', ') : day.dinner;
        message += `🌙 ${d}\n`;
      }
    }
    if (content.mealPlan.length > 3) {
      message += `\n_...and ${content.mealPlan.length - 3} more days_\n`;
    }
    message += `\n`;
  }
  
  // Recommendations
  if (content.recommendations && content.recommendations.length > 0) {
    message += `*📋 KEY RECOMMENDATIONS*\n`;
    for (const item of content.recommendations.slice(0, 5)) {
      message += `✅ ${item}\n`;
    }
    message += `\n`;
  }
  
  // Warnings
  if (content.warnings && content.warnings.length > 0) {
    message += `*⚠️ WARNINGS*\n`;
    for (const item of content.warnings) {
      message += `❗ ${item}\n`;
    }
    message += `\n`;
  }
  
  // Footer
  message += `─────────────────\n`;
  message += `_Clinical Critical Calculator_\n`;
  message += `_For Healthcare Professionals_`;
  
  return message;
}

export function shareOnWhatsApp(content: ShareContent, phoneNumber?: string): void {
  const message = generateWhatsAppMessage(content);
  const encodedMessage = encodeURIComponent(message);
  
  let url: string;
  if (phoneNumber) {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  } else {
    // Open WhatsApp with message ready to share
    url = `https://wa.me/?text=${encodedMessage}`;
  }
  
  window.open(url, '_blank');
}

// ============================================
// WEB SHARE API
// ============================================

export async function shareViaNativeShare(content: ShareContent, pdfBlob?: Blob): Promise<boolean> {
  if (!navigator.share) {
    // Fallback to WhatsApp if Web Share API not supported
    shareOnWhatsApp(content);
    return false;
  }
  
  const shareData: ShareData = {
    title: content.title,
    text: generateWhatsAppMessage(content),
  };
  
  // Add PDF file if provided and supported
  if (pdfBlob && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], 'plan.pdf', { type: 'application/pdf' })] })) {
    shareData.files = [new File([pdfBlob], `${content.title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' })];
  }
  
  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
}

// ============================================
// TYPES
// ============================================

export interface ThermalContent {
  patientInfo?: any;
  sections?: { title: string; items: string[] }[];
  mealPlan?: any[];
  summary?: { label: string; value: string }[];
}

export interface ExportOptions {
  format: 'pdf-a4' | 'pdf-thermal' | 'whatsapp' | 'share';
  filename?: string;
}
