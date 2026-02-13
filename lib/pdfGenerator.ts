import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ============================================
   CLINICAL PDF GENERATOR
   Black & White Professional Medical Documents
   Font: Times (Georgia-style serif)
   ============================================ */

// ============================================
// PDF CONFIGURATION - Black & White
// ============================================

const PDF_CONFIG = {
  // Document Settings
  page: {
    margin: 14,
    width: 210,
    contentWidth: 182, // 210 - 14*2
  },
  
  // Black & White Color Scheme
  colors: {
    // All text is pure black
    textPrimary: [0, 0, 0] as [number, number, number],
    textSecondary: [0, 0, 0] as [number, number, number],
    textMuted: [0, 0, 0] as [number, number, number],
    textWhite: [0, 0, 0] as [number, number, number],
    
    // No colored backgrounds - all white/light gray
    primaryDark: [0, 0, 0] as [number, number, number],
    primary: [0, 0, 0] as [number, number, number],
    primaryLight: [255, 255, 255] as [number, number, number],
    
    // Semantic Colors - all black
    success: [0, 0, 0] as [number, number, number],
    successLight: [255, 255, 255] as [number, number, number],
    warning: [0, 0, 0] as [number, number, number],
    warningLight: [255, 255, 255] as [number, number, number],
    danger: [0, 0, 0] as [number, number, number],
    dangerLight: [255, 255, 255] as [number, number, number],
    
    // Table Colors - Black & White
    tableHeader: [0, 0, 0] as [number, number, number],
    tableHeaderText: [255, 255, 255] as [number, number, number],
    tableAlt: [245, 245, 245] as [number, number, number],
    tableBorder: [0, 0, 0] as [number, number, number],
    
    // Neutral
    border: [0, 0, 0] as [number, number, number],
    background: [255, 255, 255] as [number, number, number],
    lightGray: [245, 245, 245] as [number, number, number],
  },
  
  // Typography - Times (Georgia-style serif font)
  fonts: {
    heading: 'times' as const,
    body: 'times' as const,
    mono: 'courier' as const,
  },
  
  // Font Sizes - Headers/Footers are 12pt bold
  sizes: {
    title: 12,
    subtitle: 12,
    heading: 12,
    subheading: 11,
    body: 10,
    small: 9,
    tiny: 8,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Strip emoji characters from text for PDF compatibility
 * jsPDF with Times font cannot render emojis properly
 */
function stripEmojis(text: string): string {
  if (!text) return '';
  // Remove emoji and other non-ASCII characters, clean up spacing
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Keep only printable ASCII characters (32-126)
    if (code >= 32 && code <= 126) {
      result += text[i];
    }
  }
  // Clean up multiple spaces and trim
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Create safe filename from patient name
 */
function createFilename(patientName: string, prefix: string): string {
  if (!patientName || patientName.trim() === '') {
    return `${prefix}_${Date.now()}.pdf`;
  }
  const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  return `${prefix}_${safeName}_${timestamp}.pdf`;
}

/**
 * Add Black & White Header to PDF
 */
function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  const { colors, sizes, page } = PDF_CONFIG;
  const centerX = page.width / 2;
  
  // Header border line (no background fill)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(page.margin, 5, page.width - page.margin, 5);
  
  // Title - Black, Times font, 12pt bold
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, centerX, 12, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(subtitle, centerX, 19, { align: 'center' });
  }
  
  // Timestamp
  const timestamp = new Date().toLocaleString();
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Generated: ${timestamp}`, centerX, 25, { align: 'center' });
  
  // Bottom border line
  doc.setLineWidth(0.5);
  doc.line(page.margin, 28, page.width - page.margin, 28);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

/**
 * Add Black & White Footer to PDF
 */
function addFooter(doc: jsPDF, pageNum?: number) {
  const { colors, sizes, page } = PDF_CONFIG;
  const centerX = page.width / 2;
  
  // Footer line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(page.margin, 280, page.width - page.margin, 280);
  
  // Disclaimer - Times font, 12pt bold
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Clinical Decision Support Tool - Always verify calculations with clinical judgment', centerX, 285, { align: 'center' });
  doc.text('FOR HEALTHCARE PROFESSIONALS ONLY', centerX, 291, { align: 'center' });
  
  // Page number
  if (pageNum) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(`Page ${pageNum}`, page.width - page.margin, 291, { align: 'right' });
  }
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

/**
 * Add Section Header - Black & White
 */
function addSectionHeader(doc: jsPDF, title: string, yPos: number): number {
  const { colors, sizes, page } = PDF_CONFIG;
  
  // Section underline (no background)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(page.margin, yPos + 2, page.width - page.margin, yPos + 2);
  
  // Section title - Times font, 12pt bold, black
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, page.margin, yPos);
  
  return yPos + 10;
}

/**
 * Add Patient Information Table - Black & White
 */
function addPatientInfo(doc: jsPDF, patientInfo: any, startY: number): number {
  if (!patientInfo || !patientInfo.name) {
    return startY;
  }
  
  const { colors, page } = PDF_CONFIG;
  
  const body = [
    ['Name', patientInfo.name || 'N/A'],
    ['Hospital', patientInfo.hospital || 'N/A'],
    ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
    ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
    ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
  ];
  
  if (patientInfo.diagnosis) {
    body.push(['Diagnosis', patientInfo.diagnosis]);
  }
  
  if (patientInfo.comorbidities && patientInfo.comorbidities.length > 0) {
    body.push(['Comorbidities', patientInfo.comorbidities.join(', ')]);
  }
  
  autoTable(doc, {
    startY: startY,
    head: [['Patient Information', 'Details']],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 3,
      font: 'times',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 10,
      cellPadding: 3,
      font: 'times',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: page.margin, right: page.margin },
  });
  
  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Standard Data Table - Black & White
 */
function addDataTable(
  doc: jsPDF, 
  head: string[][], 
  body: (string | number)[][], 
  startY: number,
  options?: {
    headerColor?: [number, number, number];
    columnWidths?: (number | 'auto')[];
  }
): number {
  const { colors, page } = PDF_CONFIG;
  // Always use black for header
  const headerColor: [number, number, number] = [0, 0, 0];
  
  const columnStyles: { [key: number]: { cellWidth?: number | 'auto' } } = {};
  if (options?.columnWidths) {
    options.columnWidths.forEach((width, index) => {
      columnStyles[index] = { cellWidth: width };
    });
  }
  
  autoTable(doc, {
    startY: startY,
    head: head,
    body: body.map(row => row.map(cell => String(cell))),
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 3,
      halign: 'left',
      font: 'times',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 10,
      cellPadding: 3,
      font: 'times',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columnStyles,
    margin: { left: page.margin, right: page.margin },
  });
  
  return (doc as any).lastAutoTable.finalY + 6;
}

/**
 * Add Warning/Alert Box - Black & White
 */
function addAlertBox(
  doc: jsPDF, 
  title: string, 
  content: string[], 
  yPos: number,
  type: 'warning' | 'danger' | 'info' | 'success' = 'warning'
): number {
  const { colors, sizes, page } = PDF_CONFIG;
  
  // Line spacing 0.75 for 12pt = 9 points
  const lineHeight = 9;
  const boxHeight = 12 + ((content?.length || 0) * lineHeight);
  
  // Border box (no fill)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(page.margin, yPos, page.contentWidth, boxHeight, 'S');
  
  // Left accent bar - black
  doc.setFillColor(0, 0, 0);
  doc.rect(page.margin, yPos, 3, boxHeight, 'F');
  
  // Title - Times font, bold, black, 12pt
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, page.margin + 6, yPos + 6);
  
  // Content - Times font, normal, black, 12pt
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let lineY = yPos + 15;
  if (content && content.length > 0) {
    content.forEach((line) => {
      // Strip emojis for PDF compatibility
      const cleanLine = stripEmojis(line);
      doc.text(`- ${cleanLine}`, page.margin + 6, lineY);
      lineY += lineHeight;
    });
  }
  
  return yPos + boxHeight + 6;
}

/**
 * Add Plain Text Section - Black & White
 */
function addTextSection(
  doc: jsPDF, 
  items: string[], 
  yPos: number,
  options?: { numbered?: boolean; indent?: number }
): number {
  const { colors, sizes, page } = PDF_CONFIG;
  const indent = options?.indent || 0;
  
  // Font size 12, Times font as requested
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  // Line spacing 0.75 = 9 points for 12pt font
  const lineHeight = 9;
  
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 35;
      }
      
      // Strip emojis from text for PDF compatibility
      const cleanItem = stripEmojis(item);
      const prefix = options?.numbered ? `${index + 1}. ` : '- ';
      const text = `${prefix}${cleanItem}`;
      const lines = doc.splitTextToSize(text, page.contentWidth - indent);
      
      lines.forEach((line: string) => {
        doc.text(line, page.margin + indent, yPos);
        yPos += lineHeight;
      });
    });
  }
  
  return yPos + 3;
}

/**
 * Check if new page needed
 */
function checkNewPage(doc: jsPDF, yPos: number, minSpace: number = 40): number {
  if (yPos > 280 - minSpace) {
    doc.addPage();
    return 35;
  }
  return yPos;
}

// ============================================
// SODIUM DISORDER PDF GENERATOR
// ============================================

export function generateSodiumPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'SODIUM DISORDER TREATMENT PLAN', 'WHO-Aligned Electrolyte Management Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Patient Parameters
  yPos = addSectionHeader(doc, 'PATIENT PARAMETERS', yPos);
  yPos = addDataTable(doc, 
    [['Parameter', 'Value', 'Reference Range']],
    [
      ['Current Sodium', `${result.current} mmol/L`, '135-145 mmol/L'],
      ['Target Sodium', `${result.target} mmol/L`, '—'],
      ['Body Weight', `${result.weight} kg`, '—'],
      ['Total Body Water', `${result.tbw} L`, '—'],
      ['Volume Status', result.volumeStatus, '—'],
      ['Acuity', result.isAcute ? 'Acute (<48h)' : 'Chronic (>48h)', '—'],
    ],
    yPos
  );
  
  // Clinical Assessment
  yPos = addSectionHeader(doc, 'CLINICAL ASSESSMENT', yPos);
  yPos = addDataTable(doc,
    [['Assessment', 'Finding']],
    [
      ['Diagnosis', result.severity],
      ['Classification', result.isHypo ? 'Hyponatremia' : result.isHyper ? 'Hypernatremia' : 'Normal'],
      ['Symptoms', result.hasSymptoms ? 'SEVERE - Seizures/Coma' : 'Mild or None'],
    ],
    yPos
  );
  
  // Calculations
  yPos = addSectionHeader(doc, 'CALCULATIONS', yPos);
  const calcBody: (string | number)[][] = [];
  if (result.sodiumDeficit) {
    calcBody.push(['Sodium Deficit', `${result.sodiumDeficit} mmol`, '(Target - Current) × TBW']);
  }
  if (result.waterDeficit) {
    calcBody.push(['Free Water Deficit', `${result.waterDeficit} L`, 'TBW × [(Na/140) - 1]']);
  }
  calcBody.push(['Max Correction Rate', `${result.maxCorrection} mmol/L per ${result.correctionTime}h`, 'WHO Safety Limit']);
  
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Formula/Notes']],
    calcBody,
    yPos,
    { headerColor: colors.success }
  );
  
  // Treatment Protocol
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'TREATMENT PROTOCOL', yPos);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  doc.text(`Recommended Fluid: ${result.fluidType}`, page.margin, yPos);
  yPos += 6;
  
  if (result.fluidStrategy) {
    doc.setFont('times', 'normal');
    const strategyLines = doc.splitTextToSize(result.fluidStrategy, page.contentWidth);
    strategyLines.forEach((line: string) => {
      doc.text(line, page.margin, yPos);
      yPos += 5;
    });
  }
  yPos += 4;
  
  // Monitoring Requirements
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MONITORING REQUIREMENTS', yPos);
  yPos = addTextSection(doc, [
    'Monitor serum sodium every 2-4 hours during active correction',
    'Continuous ECG monitoring if concurrent potassium abnormality',
    'Strict fluid balance charting (input/output)',
    'Neurological observations hourly',
    'Assess for signs of cerebral edema or osmotic demyelination',
  ], yPos);
  
  // Safety Warnings
  yPos = checkNewPage(doc, yPos, 50);
  yPos = addAlertBox(doc, 'SAFETY WARNINGS', [
    'Rapid correction of chronic hyponatremia can cause osmotic demyelination syndrome',
    'Never exceed 8 mmol/L correction in 24 hours for chronic cases',
    'High-risk patients (alcoholism, malnutrition): ≤6 mmol/L per 24h',
  ], yPos, 'warning');
  
  // Footer
  addFooter(doc, 1);
  
  // Save
  const filename = createFilename(patientInfo?.name, 'Sodium_Treatment_Plan');
  doc.save(filename);
}

// ============================================
// POTASSIUM DISORDER PDF GENERATOR
// ============================================

export function generatePotassiumPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'POTASSIUM DISORDER TREATMENT PLAN', 'WHO-Aligned Electrolyte Management Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Patient Parameters
  yPos = addSectionHeader(doc, 'PATIENT PARAMETERS', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Reference Range']],
    [
      ['Current Potassium', `${result.current} mmol/L`, '3.5-5.5 mmol/L'],
      ['Body Weight', `${result.weight} kg`, '—'],
      ['ECG Changes', result.hasECGChanges ? `YES - ${result.ecgFinding}` : 'No', '—'],
      ['Magnesium Status', result.hasMg ? 'Normal' : 'LOW', '≥0.7 mmol/L'],
    ],
    yPos,
    { headerColor: colors.danger }
  );
  
  // Clinical Assessment
  yPos = addSectionHeader(doc, 'CLINICAL ASSESSMENT', yPos);
  const urgencyText = result.urgency === 'emergency' ? 'EMERGENCY' : result.urgency === 'urgent' ? 'URGENT' : 'Routine';
  
  yPos = addDataTable(doc,
    [['Assessment', 'Finding']],
    [
      ['Diagnosis', result.severity],
      ['Urgency Level', urgencyText],
      ['Estimated Deficit', result.deficit ? `${result.deficit} mmol` : 'N/A (Hyperkalemia)'],
    ],
    yPos
  );
  
  // Treatment Protocol
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'TREATMENT PROTOCOL', yPos);
  yPos = addTextSection(doc, result.treatment, yPos, { numbered: true });
  
  // Monitoring Requirements
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MONITORING REQUIREMENTS', yPos);
  yPos = addTextSection(doc, result.monitoring, yPos);
  
  // ECG Warning if applicable
  if (result.hasECGChanges) {
    yPos = checkNewPage(doc, yPos, 50);
    yPos = addAlertBox(doc, 'ECG CHANGES DETECTED - CARDIAC EMERGENCY', [
      `Finding: ${result.ecgFinding.toUpperCase()}`,
      'Immediate intervention required',
      'Consider ICU admission and cardiology consult',
    ], yPos, 'danger');
  }
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'Potassium_Treatment_Plan');
  doc.save(filename);
}

// ============================================
// ACID-BASE DISORDER PDF GENERATOR
// ============================================

export function generateAcidBasePDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'ACID-BASE DISORDER ANALYSIS', 'Clinical Critical Calculator - ABG Interpretation');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // ABG Results
  yPos = addSectionHeader(doc, 'ARTERIAL BLOOD GAS RESULTS', yPos);
  const abgBody: (string | number)[][] = [
    ['pH', result.ph.toFixed(2), '7.35 - 7.45'],
    ['HCO₃⁻', `${result.hco3.toFixed(1)} mmol/L`, '22 - 26 mmol/L'],
    ['PCO₂', `${result.pco2.toFixed(1)} mmHg`, '35 - 45 mmHg'],
  ];
  if (result.anionGap) {
    abgBody.push(['Anion Gap', `${result.anionGap} mmol/L (${result.agCategory})`, '8 - 12 mmol/L']);
  }
  
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Reference Range']],
    abgBody,
    yPos
  );
  
  // Clinical Assessment
  yPos = addSectionHeader(doc, 'CLINICAL ASSESSMENT', yPos);
  yPos = addDataTable(doc,
    [['Assessment', 'Finding']],
    [
      ['Diagnosis', result.severity],
      ['Disorder Type', result.disorder.replace(/-/g, ' ').toUpperCase()],
    ],
    yPos
  );
  
  // Bicarbonate Calculation if applicable
  if (result.hco3Required) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'BICARBONATE CALCULATION', yPos);
    yPos = addDataTable(doc,
      [['Parameter', 'Value']],
      [
        ['Required HCO₃⁻', `${result.hco3Required} mmol`],
        ['Target HCO₃⁻', '18-20 mmol/L'],
        ['Administration', 'Give 50% of dose over 30-60 min, recheck ABG'],
      ],
      yPos,
      { headerColor: colors.success }
    );
  }
  
  // Possible Causes
  if (result.causes && result.causes.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'POSSIBLE CAUSES', yPos);
    yPos = addTextSection(doc, result.causes, yPos);
  }
  
  // Treatment Protocol
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'TREATMENT PROTOCOL', yPos);
  yPos = addTextSection(doc, result.treatment, yPos, { numbered: true });
  
  // Monitoring
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MONITORING REQUIREMENTS', yPos);
  yPos = addTextSection(doc, [
    'Repeat ABG every 2-4 hours initially',
    'Continuous pulse oximetry',
    'Monitor electrolytes (K⁺, Ca²⁺, Mg²⁺)',
    'Assess respiratory rate and work of breathing',
    'Monitor mental status and level of consciousness',
  ], yPos);
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'AcidBase_Analysis');
  doc.save(filename);
}

// ============================================
// GFR PDF GENERATOR
// ============================================

export function generateGFRPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'KIDNEY FUNCTION ASSESSMENT REPORT', 'Glomerular Filtration Rate Analysis');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Patient Parameters
  yPos = addSectionHeader(doc, 'PATIENT PARAMETERS', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Reference Range']],
    [
      ['Serum Creatinine', `${result.creatinine} mg/dL`, '0.6-1.2 mg/dL'],
      ['Blood Urea', result.urea ? `${result.urea} mg/dL` : 'Not provided', '7-20 mg/dL'],
      ['Age', `${result.age} years`, '—'],
      ['Weight', `${result.weight} kg`, '—'],
      ['Gender', result.gender === 'male' ? 'Male' : 'Female', '—'],
      ['Race', result.race === 'black' ? 'Black/African American' : 'Non-Black', '—'],
    ],
    yPos
  );
  
  // GFR Results
  yPos = addSectionHeader(doc, 'GLOMERULAR FILTRATION RATE (GFR)', yPos);
  yPos = addDataTable(doc,
    [['Formula', 'Result', 'Units']],
    [
      ['CKD-EPI (Recommended)', result.ckdEpi, 'mL/min/1.73m²'],
      ['Cockcroft-Gault', result.cockcroftGault, 'mL/min'],
      ['MDRD', result.mdrd, 'mL/min/1.73m²'],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // CKD Stage
  yPos = addSectionHeader(doc, 'CHRONIC KIDNEY DISEASE CLASSIFICATION', yPos);
  yPos = addDataTable(doc,
    [['Classification', 'Details']],
    [
      ['CKD Stage', `${result.stage} - ${result.description}`],
      ['eGFR', `${result.ckdEpi} mL/min/1.73m²`],
    ],
    yPos
  );
  
  // BUN/Creatinine Ratio
  if (result.bun) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'BUN/CREATININE RATIO ANALYSIS', yPos);
    yPos = addDataTable(doc,
      [['Parameter', 'Value']],
      [
        ['BUN', `${result.bun} mg/dL`],
        ['BUN/Creatinine Ratio', result.bunCreatRatio],
        ['Normal Range', '10-20'],
        ['Interpretation', result.bunInterpretation],
      ],
      yPos
    );
  }
  
  // Clinical Recommendation
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'CLINICAL RECOMMENDATION', yPos);
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  const recommendation = doc.splitTextToSize(result.recommendation || '', page.contentWidth);
  if (recommendation && recommendation.length > 0) {
    recommendation.forEach((line: string) => {
      doc.text(line, page.margin, yPos);
      yPos += 5;
    });
  }
  yPos += 4;
  
  // CKD Stages Reference
  yPos = checkNewPage(doc, yPos, 80);
  yPos = addSectionHeader(doc, 'CKD STAGES REFERENCE', yPos);
  yPos = addDataTable(doc,
    [['Stage', 'GFR (mL/min/1.73m²)', 'Description']],
    [
      ['G1', '≥90', 'Normal or high (kidney damage present)'],
      ['G2', '60-89', 'Mild reduction in kidney function'],
      ['G3a', '45-59', 'Mild to moderate reduction'],
      ['G3b', '30-44', 'Moderate to severe reduction'],
      ['G4', '15-29', 'Severe reduction'],
      ['G5', '<15', 'Kidney failure'],
    ],
    yPos
  );
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'GFR_Report');
  doc.save(filename);
}

// ============================================
// BNF DRUG DOSING PDF GENERATOR
// ============================================

export function generateBNFPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'RENAL DOSE ADJUSTMENT GUIDE', 'BNF Guidelines - Drug Dosing in Renal Impairment');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Renal Function
  yPos = addSectionHeader(doc, 'RENAL FUNCTION', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value']],
    [
      ['eGFR', `${result.gfr} mL/min/1.73m²`],
      ['CKD Stage', result.ckdStage],
      ['Classification', result.categoryLabel],
    ],
    yPos
  );
  
  // Dosing Recommendations
  yPos = addSectionHeader(doc, 'DOSING RECOMMENDATIONS', yPos);
  
  if (result.recommendations && result.recommendations.length > 0) {
    result.recommendations.forEach((rec: any, index: number) => {
      yPos = checkNewPage(doc, yPos, 50);
      
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.primaryDark);
      doc.text(`${index + 1}. ${rec.drug}`, page.margin, yPos);
      yPos += 6;
      
      yPos = addDataTable(doc,
        [['Field', 'Details']],
      [
        ['Indication', rec.indication],
        ['Normal Dose', rec.normal],
        ['Recommended Dose', rec.recommendedDose],
        ['Notes', rec.notes],
      ],
      yPos
    );
    
    yPos += 4;
    });
  }
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'BNF_Dosing');
  doc.save(filename);
}

// ============================================
// BURNS PDF GENERATOR
// ============================================

export function generateBurnsPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'BURNS MANAGEMENT PLAN', 'Parkland Formula - WHO Burn Care Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Burn Assessment
  yPos = addSectionHeader(doc, 'BURN ASSESSMENT', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value']],
    [
      ['Total BSA Burned', `${result.totalBSA}%`],
      ['Patient Weight', `${result.weight} kg`],
      ['Severity', result.severity],
      ['Admission', result.admission],
    ],
    yPos,
    { headerColor: [0, 0, 0] }
  );
  
  // Affected Areas
  if (result.burnAreas && result.burnAreas.length > 0) {
    yPos = addSectionHeader(doc, 'AFFECTED AREAS', yPos);
    const areasData = result.burnAreas.map((area: any) => [area.area, `${area.percentage}%`]);
    yPos = addDataTable(doc,
      [['Body Area', 'BSA %']],
      areasData,
      yPos,
      { headerColor: [0, 0, 0] }
    );
  }
  
  // Day 1 Fluid Resuscitation
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'DAY 1 FLUID RESUSCITATION (PARKLAND FORMULA)', yPos);
  yPos = addDataTable(doc,
    [['Time Period', 'Volume', 'Rate', 'Fluid Type']],
    [
      ['Formula: 4mL × kg × %BSA', `4 × ${result.weight} × ${result.totalBSA}%`, '—', 'Parkland Formula'],
      ['First 24 hours TOTAL', `${result.totalFluid24h} mL`, '—', "Ringer's Lactate"],
      ['First 8 hours (from burn)', `${result.first8h} mL`, `${result.hourlyRateFirst8h} mL/hr`, "Ringer's Lactate"],
      ['Next 16 hours', `${result.next16h} mL`, `${result.hourlyRateNext16h} mL/hr`, "Ringer's Lactate"],
    ],
    yPos
  );
  
  // Day 2 Fluid Therapy
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'DAY 2 FLUID THERAPY (24-48 hours)', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value']],
    [
      ['Total Daily Fluid', `${result.day2FluidTotal} mL/day`],
      ['Hourly Rate', `${result.day2HourlyRate} mL/hour`],
      ['Maintenance Component', `${result.maintenanceFluid24h} mL`],
      ['Evaporative Loss Component', `${result.evaporativeLosses} mL`],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Monitoring Targets
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MONITORING TARGETS', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Target']],
    [
      ['Urine Output Target', `${result.urineOutputTarget} mL/hour`],
      ['Monitoring Frequency', 'Hourly urine output, adjust rate ±20%'],
      ['Electrolytes', 'Check Na, K, Cl, HCO3 every 6-12 hours'],
      ['Albumin', 'Monitor daily, replace if <2.5 g/dL'],
    ],
    yPos
  );
  
  // Nutritional Requirements
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'NUTRITIONAL REQUIREMENTS', yPos);
  yPos = addDataTable(doc,
    [['Requirement', 'Value']],
    [
      ['Daily Calories', `${result.totalCalories} kcal/day`],
      ['Protein', `${result.proteinRequirement} g/day`],
      ['Recommendation', 'See Nutrition Calculator for meal plan'],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Wound Care Protocol
  doc.addPage();
  addHeader(doc, 'BURNS MANAGEMENT PLAN', 'Parkland Formula - WHO Burn Care Protocol');
  yPos = 35;
  
  yPos = addSectionHeader(doc, 'WOUND CARE PROTOCOL', yPos);
  yPos = addDataTable(doc,
    [['Step', 'Action']],
    [
      ['Cleaning', 'Use Wound-Clex solution for wound cleansing'],
      ['Face burns', 'Apply Gentamicin ointment'],
      ['Body burns', 'Apply Hera gel, Sofratulle, or Honey care gauze'],
      ['Dressing changes', 'Daily or when saturated'],
      ['Monitoring', 'Watch for infection: increased pain, purulent discharge, fever'],
    ],
    yPos,
    { headerColor: [0, 0, 0] }
  );
  
  // Footer
  addFooter(doc, 2);
  
  const filename = createFilename(patientInfo?.name, 'Burns_Plan');
  doc.save(filename);
}

// ============================================
// NUTRITION PDF GENERATOR
// ============================================

export function generateNutritionPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'NUTRITION CARE PLAN', 'Nigerian Foods - Clinical Nutrition Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Nutritional Requirements
  yPos = addSectionHeader(doc, 'NUTRITIONAL REQUIREMENTS', yPos);
  yPos = addDataTable(doc,
    [['Nutrient', 'Daily Requirement']],
    [
      ['Total Calories', `${result.totalCalories} kcal/day`],
      ['Protein', `${result.proteinRequirement} g/day`],
      ['Carbohydrates', `${result.carbsGrams} g/day`],
      ['Fats', `${result.fatsGrams} g/day`],
      ['Vitamin C', `${result.vitaminC} mg/day`],
      ['Zinc', `${result.zinc} mg/day`],
      ['Vitamin A', `${result.vitaminA} IU/day`],
      ['Fluids', `${result.fluidRequirement} mL/day (baseline)`],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // 7-Day Meal Plan
  if (result.mealPlan && result.mealPlan.length > 0) {
    doc.addPage();
    addHeader(doc, '7-DAY NIGERIAN MEAL PLAN', 'Clinical Nutrition Protocol');
    yPos = 35;
    
    result.mealPlan.forEach((day: any, index: number) => {
    yPos = checkNewPage(doc, yPos, 50);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primaryDark);
    doc.text(day.day || `Day ${index + 1}`, page.margin, yPos);
    yPos += 6;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);
    
    const bfText = Array.isArray(day.breakfast) ? day.breakfast.join(', ') : (day.breakfast || '');
    const lnText = Array.isArray(day.lunch) ? day.lunch.join(', ') : (day.lunch || '');
    const dnText = Array.isArray(day.dinner) ? day.dinner.join(', ') : (day.dinner || '');
    const snText = Array.isArray(day.snacks) ? day.snacks.join(', ') : (day.snacks || '');
    
    doc.setFont('times', 'bold');
    doc.text('Breakfast:', page.margin, yPos);
    doc.setFont('times', 'normal');
    doc.text(bfText, page.margin + 25, yPos);
    yPos += 5;
    
    doc.setFont('times', 'bold');
    doc.text('Lunch:', page.margin, yPos);
    doc.setFont('times', 'normal');
    const lunchText = doc.splitTextToSize(lnText, page.contentWidth - 25);
    lunchText.forEach((line: string) => {
      doc.text(line, page.margin + 25, yPos);
      yPos += 4;
    });
    
    doc.setFont('times', 'bold');
    doc.text('Dinner:', page.margin, yPos);
    doc.setFont('times', 'normal');
    doc.text(dnText, page.margin + 25, yPos);
    yPos += 5;
    
    doc.setFont('times', 'bold');
    doc.text('Snacks:', page.margin, yPos);
    doc.setFont('times', 'normal');
    doc.text(snText, page.margin + 25, yPos);
    yPos += 10;
    });
  }
  
  // Feeding Recommendations
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'FEEDING RECOMMENDATIONS', yPos);
  yPos = addTextSection(doc, [
    '6 small meals per day better tolerated than 3 large meals',
    'Start enteral nutrition within 24-48 hours if possible',
    'High-protein foods essential for wound healing',
    'Adequate hydration crucial - monitor intake',
    'Supplement with vitamins C, A, and zinc as prescribed',
    'Monitor weight daily to prevent malnutrition',
  ], yPos);
  
  // Footer
  addFooter(doc);
  
  const filename = createFilename(patientInfo?.name, 'Nutrition_Plan');
  doc.save(filename);
}

// ============================================
// DVT RISK PDF GENERATOR
// ============================================

export function generateDVTRiskPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'DVT RISK ASSESSMENT', 'Caprini Risk Score - VTE Prophylaxis Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Risk Score
  yPos = addSectionHeader(doc, 'CAPRINI RISK SCORE', yPos);
  
  const riskColor = result.riskLevel === 'highest' || result.riskLevel === 'high' ? colors.danger :
                    result.riskLevel === 'moderate' ? colors.warning : colors.success;
  
  yPos = addDataTable(doc,
    [['Assessment', 'Result']],
    [
      ['Total Score', result.score],
      ['Risk Level', result.riskLevel.toUpperCase()],
      ['VTE Risk', result.vteRisk],
    ],
    yPos,
    { headerColor: riskColor }
  );
  
  // Risk Factors
  if (result.riskFactors && result.riskFactors.length > 0) {
    yPos = addSectionHeader(doc, 'IDENTIFIED RISK FACTORS', yPos);
    yPos = addTextSection(doc, result.riskFactors, yPos);
  }
  
  // Prophylaxis Recommendations
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'PROPHYLAXIS RECOMMENDATIONS', yPos);
  yPos = addTextSection(doc, result.prophylaxis, yPos, { numbered: true });
  
  // Contraindications if any
  if (result.contraindications && result.contraindications.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addAlertBox(doc, 'CONTRAINDICATIONS TO PHARMACOLOGICAL PROPHYLAXIS', 
      result.contraindications, yPos, 'danger');
  }
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'DVT_Risk_Assessment');
  doc.save(filename);
}

// ============================================
// PRESSURE SORE PDF GENERATOR
// ============================================

export function generatePressureSorePDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'PRESSURE INJURY RISK ASSESSMENT', 'Braden Scale - Prevention Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Braden Score
  yPos = addSectionHeader(doc, 'BRADEN SCALE ASSESSMENT', yPos);
  
  const riskColor = result.riskLevel === 'severe' || result.riskLevel === 'high' ? colors.danger :
                    result.riskLevel === 'moderate' ? colors.warning : colors.success;
  
  yPos = addDataTable(doc,
    [['Component', 'Score']],
    [
      ['Sensory Perception', result.sensoryScore],
      ['Moisture', result.moistureScore],
      ['Activity', result.activityScore],
      ['Mobility', result.mobilityScore],
      ['Nutrition', result.nutritionScore],
      ['Friction/Shear', result.frictionScore],
      ['TOTAL SCORE', result.totalScore],
    ],
    yPos,
    { headerColor: riskColor }
  );
  
  // Risk Classification
  yPos = addSectionHeader(doc, 'RISK CLASSIFICATION', yPos);
  yPos = addDataTable(doc,
    [['Classification', 'Details']],
    [
      ['Risk Level', result.riskLevel.toUpperCase()],
      ['Score Interpretation', result.interpretation],
    ],
    yPos
  );
  
  // Prevention Protocol
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'PREVENTION PROTOCOL', yPos);
  yPos = addTextSection(doc, result.preventionMeasures, yPos, { numbered: true });
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'Pressure_Sore_Assessment');
  doc.save(filename);
}

// ============================================
// NUTRITIONAL ASSESSMENT (MUST) PDF GENERATOR
// ============================================

export function generateMUSTPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'MUST SCREENING ASSESSMENT', 'Malnutrition Universal Screening Tool');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // MUST Score
  yPos = addSectionHeader(doc, 'MUST SCORE CALCULATION', yPos);
  
  const riskColor = result.riskLevel === 'high' ? colors.danger :
                    result.riskLevel === 'medium' ? colors.warning : colors.success;
  
  yPos = addDataTable(doc,
    [['Component', 'Score', 'Details']],
    [
      ['BMI Score', result.bmiScore, result.bmiCategory],
      ['Weight Loss Score', result.weightLossScore, result.weightLossCategory],
      ['Acute Disease Score', result.acuteDiseaseScore, result.acuteDiseaseCategory],
      ['TOTAL MUST SCORE', result.totalScore, result.riskLevel.toUpperCase()],
    ],
    yPos,
    { headerColor: riskColor }
  );
  
  // Risk Classification
  yPos = addSectionHeader(doc, 'NUTRITIONAL RISK CLASSIFICATION', yPos);
  yPos = addDataTable(doc,
    [['Risk Level', 'Action Required']],
    [
      [result.riskLevel.toUpperCase(), result.action],
    ],
    yPos
  );
  
  // Management Plan
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MANAGEMENT PLAN', yPos);
  yPos = addTextSection(doc, result.managementPlan, yPos, { numbered: true });
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'MUST_Assessment');
  doc.save(filename);
}

// ============================================
// WOUND HEALING MEAL PLAN PDF GENERATOR
// ============================================

export function generateWoundMealPlanPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'WOUND HEALING NUTRITION PLAN', 'Nigerian Foods for Optimal Recovery');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Nutritional Requirements
  yPos = addSectionHeader(doc, 'WOUND HEALING REQUIREMENTS', yPos);
  yPos = addDataTable(doc,
    [['Nutrient', 'Daily Target', 'Purpose']],
    [
      ['Protein', `${result.proteinRequirement} g/day`, 'Tissue repair and collagen synthesis'],
      ['Calories', `${result.calorieRequirement} kcal/day`, 'Energy for healing process'],
      ['Vitamin C', `${result.vitaminC} mg/day`, 'Collagen formation'],
      ['Zinc', `${result.zinc} mg/day`, 'Wound closure and immune function'],
      ['Vitamin A', `${result.vitaminA} IU/day`, 'Epithelialization'],
      ['Fluids', `${result.fluidRequirement} mL/day`, 'Hydration for tissue perfusion'],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Meal Plan
  if (result.mealPlan) {
    doc.addPage();
    addHeader(doc, 'DAILY MEAL PLAN', 'Nigerian Foods for Wound Healing');
    yPos = 35;
    
    result.mealPlan.forEach((day: any) => {
      yPos = checkNewPage(doc, yPos, 50);
      
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.primaryDark);
      doc.text(day.day, page.margin, yPos);
      yPos += 6;
      
      yPos = addDataTable(doc,
        [['Meal', 'Menu']],
        [
          ['Breakfast', Array.isArray(day.breakfast) ? day.breakfast.join(', ') : (day.breakfast || '')],
          ['Lunch', Array.isArray(day.lunch) ? day.lunch.join(', ') : (day.lunch || '')],
          ['Dinner', Array.isArray(day.dinner) ? day.dinner.join(', ') : (day.dinner || '')],
          ['Snacks', Array.isArray(day.snacks) ? day.snacks.join(', ') : (day.snacks || '')],
        ],
        yPos
      );
      
      yPos += 4;
    });
  }
  
  // Healing Foods
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'RECOMMENDED HEALING FOODS', yPos);
  yPos = addTextSection(doc, result.healingFoods || [
    'High-protein: Fish, chicken, eggs, beans, moi-moi',
    'Vitamin C: Oranges, guava, pawpaw, garden eggs',
    'Zinc: Pumpkin seeds, meat, fish, beans',
    'Iron: Liver, green leafy vegetables, beans',
    'Vitamin A: Palm oil, carrots, sweet potato leaves',
  ], yPos);
  
  // Footer
  addFooter(doc);
  
  const filename = createFilename(patientInfo?.name, 'Wound_Healing_Nutrition');
  doc.save(filename);
}

// ============================================
// WEIGHT REDUCTION PDF GENERATOR
// ============================================

export function generateWeightReductionPDF(
  result: any, 
  patientInfo?: any,
  currentWeight?: string,
  height?: string,
  targetWeight?: string,
  timeframe?: string,
  activityLevel?: string
) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'WEIGHT REDUCTION PROGRAM', 'Evidence-Based Weight Management Plan');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Current Status
  yPos = addSectionHeader(doc, 'CURRENT STATUS', yPos);
  
  const currentWt = currentWeight || result.currentWeight;
  const targetWt = targetWeight || result.targetWeight;
  const heightVal = height || result.height;
  
  // Calculate BMI if we have values
  let bmi = result.currentBMI;
  if (currentWt && heightVal && !bmi) {
    const heightM = parseFloat(heightVal) / 100;
    bmi = (parseFloat(currentWt) / (heightM * heightM)).toFixed(1);
  }
  
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Target']],
    [
      ['Current Weight', `${currentWt} kg`, `${targetWt} kg`],
      ['Height', `${heightVal} cm`, '—'],
      ['Current BMI', bmi || 'N/A', '18.5 - 24.9'],
      ['Weight to Lose', `${result.weightToLose || (parseFloat(currentWt) - parseFloat(targetWt)).toFixed(1)} kg`, '—'],
      ['Timeline', `${timeframe || result.timeline} weeks`, '—'],
      ['Activity Level', activityLevel || result.activityLevel || 'N/A', '—'],
    ],
    yPos
  );
  
  // Calorie Targets
  yPos = addSectionHeader(doc, 'CALORIE TARGETS', yPos);
  yPos = addDataTable(doc,
    [['Metric', 'Value']],
    [
      ['Daily Calorie Target', `${result.dailyCalories} kcal/day`],
      ['Weekly Deficit', `${result.weeklyDeficit} kcal`],
      ['Expected Loss/Week', `${result.weeklyLoss} kg`],
      ['Daily Protein', `${result.dailyProtein || 'Calculated'} g/day`],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Meal Plan
  if (result.mealPlan) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'SAMPLE MEAL PLAN', yPos);
    
    result.mealPlan.forEach((day: any) => {
      yPos = checkNewPage(doc, yPos, 30);
      
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.text(day.day || 'Day', page.margin, yPos);
      yPos += 5;
      
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      const bfText = Array.isArray(day.breakfast) ? day.breakfast.join(', ') : (day.breakfast || '');
      const lunchText = Array.isArray(day.lunch) ? day.lunch.join(', ') : (day.lunch || '');
      const dinnerText = Array.isArray(day.dinner) ? day.dinner.join(', ') : (day.dinner || '');
      doc.text(`Breakfast: ${bfText}`, page.margin + 5, yPos);
      yPos += 4;
      doc.text(`Lunch: ${lunchText}`, page.margin + 5, yPos);
      yPos += 4;
      doc.text(`Dinner: ${dinnerText}`, page.margin + 5, yPos);
      yPos += 6;
    });
  }
  
  // Exercise Recommendations
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'EXERCISE RECOMMENDATIONS', yPos);
  yPos = addTextSection(doc, result.exerciseRecommendations || [
    'Aim for 150 minutes of moderate activity per week',
    'Start with 20-30 minutes of walking daily',
    'Include strength training 2-3 times per week',
    'Gradually increase intensity as fitness improves',
  ], yPos);
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'Weight_Reduction_Plan');
  doc.save(filename);
}

// ============================================
// WEIGHT GAIN PDF GENERATOR
// ============================================

export function generateWeightGainPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'WEIGHT GAIN PROGRAM', 'Healthy Weight Restoration Plan');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Current Status
  yPos = addSectionHeader(doc, 'CURRENT STATUS', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Value', 'Target']],
    [
      ['Current Weight', `${result.currentWeight} kg`, `${result.targetWeight} kg`],
      ['Current BMI', result.currentBMI, '18.5 - 24.9'],
      ['Weight to Gain', `${result.weightToGain} kg`, '—'],
      ['Timeline', `${result.timeline} weeks`, '—'],
    ],
    yPos
  );
  
  // Calorie Targets
  yPos = addSectionHeader(doc, 'CALORIE TARGETS', yPos);
  yPos = addDataTable(doc,
    [['Metric', 'Value']],
    [
      ['Daily Calorie Target', `${result.dailyCalories} kcal/day`],
      ['Daily Surplus', `${result.dailySurplus} kcal`],
      ['Expected Gain/Week', `${result.weeklyGain} kg`],
      ['Protein Target', `${result.proteinTarget} g/day`],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // High-Calorie Foods
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'RECOMMENDED HIGH-CALORIE FOODS', yPos);
  yPos = addTextSection(doc, result.highCalorieFoods || [
    'Nuts and nut butters (groundnuts, cashews)',
    'Avocado and palm oil',
    'Full-fat dairy products',
    'Eggs and meat',
    'Rice, yam, and plantain',
    'Smoothies with added healthy fats',
  ], yPos);
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'Weight_Gain_Plan');
  doc.save(filename);
}

// ============================================
// SICKLE CELL MANAGEMENT PDF GENERATOR
// ============================================

export function generateSickleCellPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'SICKLE CELL DISEASE MANAGEMENT', 'WHO-Aligned Crisis Management Protocol');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Crisis Risk Assessment
  yPos = addSectionHeader(doc, 'CRISIS RISK ASSESSMENT', yPos);
  yPos = addDataTable(doc,
    [['Parameter', 'Finding']],
    [
      ['Crisis Risk Level', result.crisisRisk || 'Not assessed'],
      ['Annual Crisis Frequency', `${result.crisisPerYear || 'N/A'} per year`],
      ['Current Hemoglobin', result.hb ? `${result.hb} g/dL` : 'Not specified'],
      ['Pain Level', result.painLevel ? `${result.painLevel}/10` : 'Not specified'],
      ['Hydration Status', result.hydrationLevel || 'Not specified'],
    ],
    yPos,
    { headerColor: colors.primary }
  );
  
  // Ulcer Assessment (if applicable)
  if (result.hasUlcers) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'LEG ULCER ASSESSMENT', yPos);
    yPos = addDataTable(doc,
      [['Parameter', 'Details']],
      [
        ['Location', result.ulcerLocation || 'Not specified'],
        ['Size', result.ulcerSizeCm ? `${result.ulcerSizeCm} cm` : 'Not specified'],
        ['Duration', result.ulcerWeeks ? `${result.ulcerWeeks} weeks` : 'Not specified'],
        ['Estimated Healing Time', result.healingWeeks ? `${result.healingWeeks} weeks` : 'N/A'],
        ['Prognosis', result.healingPrognosis || 'N/A'],
      ],
      yPos
    );
    
    // Ulcer Management
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'ULCER MANAGEMENT PROTOCOL', yPos);
    yPos = addTextSection(doc, result.ulcerManagement || [
      'Daily wound cleansing with normal saline',
      'Debridement of necrotic tissue as needed',
      'Hydrocolloid or foam dressings for moisture balance',
      'Monitor for signs of infection',
      'Elevation of affected limb when resting',
    ], yPos);
    
    // Wound Healing Nutrients
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'WOUND HEALING NUTRITION', yPos);
    yPos = addTextSection(doc, result.woundHealingNutrients || [], yPos);
  }
  
  // Nutritional Requirements
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'DAILY NUTRITIONAL REQUIREMENTS', yPos);
  yPos = addDataTable(doc,
    [['Nutrient', 'Recommendation']],
    [
      ['Fluids', result.fluidLiters ? `${result.fluidLiters}L daily (${result.recommendedFluidML}ml)` : '2.5-3L daily'],
      ['Calories', result.totalCalories ? `${result.totalCalories} kcal/day` : 'Based on weight'],
      ['Protein', result.proteinGrams ? `${result.proteinGrams}g/day` : '1.2-1.8g/kg/day'],
      ['Folic Acid', '5mg daily (mandatory)'],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Nutrition Plan
  if (result.nutritionPlan && result.nutritionPlan.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'NUTRITION GUIDELINES', yPos);
    yPos = addTextSection(doc, result.nutritionPlan, yPos);
  }
  
  // Hydration Protocol
  if (result.hydrationProtocol && result.hydrationProtocol.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'HYDRATION PROTOCOL', yPos);
    yPos = addTextSection(doc, result.hydrationProtocol, yPos);
  }
  
  // Supplements Page
  doc.addPage();
  addHeader(doc, 'SUPPLEMENTS & LIFESTYLE', 'Evidence-Based Recommendations');
  yPos = 35;
  
  // Supplements
  if (result.supplements && result.supplements.length > 0) {
    yPos = addSectionHeader(doc, 'RECOMMENDED SUPPLEMENTS', yPos);
    yPos = addTextSection(doc, result.supplements, yPos);
  }
  
  // Crisis Prevention
  if (result.crisisPrevention && result.crisisPrevention.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'CRISIS PREVENTION STRATEGIES', yPos);
    yPos = addTextSection(doc, result.crisisPrevention, yPos);
  }
  
  // Lifestyle Changes
  if (result.lifestyleChanges && result.lifestyleChanges.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'LIFESTYLE MODIFICATIONS', yPos);
    yPos = addTextSection(doc, result.lifestyleChanges, yPos);
  }
  
  // Monitoring Schedule
  if (result.monitoringSchedule && result.monitoringSchedule.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'MONITORING SCHEDULE', yPos);
    yPos = addTextSection(doc, result.monitoringSchedule, yPos);
  }
  
  // Urgent Warnings
  if (result.urgentWarnings && result.urgentWarnings.length > 0) {
    yPos = checkNewPage(doc, yPos, 80);
    yPos = addAlertBox(doc, 'URGENT WARNING SIGNS', result.urgentWarnings, yPos, 'danger');
  }
  
  // Footer
  addFooter(doc);
  
  const filename = createFilename(patientInfo?.name, 'Sickle_Cell_Management');
  doc.save(filename);
}

// ============================================
// CONSULT LETTER PDF GENERATOR
// ============================================

export function generateConsultLetterPDF(
  patientInfo: any,
  fromUnit: string,
  toUnit: string,
  consultReason: string,
  clinicalFindings: string,
  recommendations: string,
  letterType: string,
  calculatorResults?: string
) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'CONSULTATION LETTER', letterType.replace(/_/g, ' ').toUpperCase());
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Referral Details
  yPos = addSectionHeader(doc, 'REFERRAL DETAILS', yPos);
  yPos = addDataTable(doc,
    [['Field', 'Details']],
    [
      ['From Unit', fromUnit || 'Not specified'],
      ['To Unit', toUnit || 'Not specified'],
      ['Date', new Date().toLocaleDateString()],
      ['Letter Type', letterType.replace(/_/g, ' ')],
    ],
    yPos
  );
  
  // Reason for Consultation
  yPos = addSectionHeader(doc, 'REASON FOR CONSULTATION', yPos);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  const reasonLines = doc.splitTextToSize(consultReason || 'Not specified', page.contentWidth);
  reasonLines.forEach((line: string) => {
    doc.text(line, page.margin, yPos);
    yPos += 5;
  });
  yPos += 4;
  
  // Clinical Findings
  if (clinicalFindings) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'CLINICAL FINDINGS', yPos);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textSecondary);
    const findingsLines = doc.splitTextToSize(clinicalFindings, page.contentWidth);
    findingsLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 35;
      }
      doc.text(line, page.margin, yPos);
      yPos += 5;
    });
    yPos += 4;
  }
  
  // Calculator Results (if applicable)
  if (calculatorResults) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'INVESTIGATION RESULTS', yPos);
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);
    const resultsLines = doc.splitTextToSize(calculatorResults, page.contentWidth);
    resultsLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 35;
      }
      doc.text(line, page.margin, yPos);
      yPos += 4;
    });
    yPos += 4;
    doc.setFont('times', 'normal');
  }
  
  // Recommendations
  if (recommendations) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'RECOMMENDATIONS', yPos);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textSecondary);
    const recLines = doc.splitTextToSize(recommendations, page.contentWidth);
    recLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 35;
      }
      doc.text(line, page.margin, yPos);
      yPos += 5;
    });
  }
  
  // Signature Section
  yPos = checkNewPage(doc, yPos, 50);
  yPos += 15;
  
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  
  doc.text('Requesting Physician: ____________________________', page.margin, yPos);
  yPos += 10;
  doc.text('Signature: ____________________________', page.margin, yPos);
  yPos += 10;
  doc.text('Date: ____________________________', page.margin, yPos);
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, `Consult_Letter_${letterType}`);
  doc.save(filename);
}

// ============================================
// NUTRITIONAL ASSESSMENT PDF GENERATOR
// ============================================

export function generateNutritionalAssessmentPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'NUTRITIONAL ASSESSMENT REPORT', 'MUST Screening & Management Plan');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // MUST Score Summary
  yPos = addSectionHeader(doc, 'MUST SCREENING SCORE', yPos);
  
  const riskColor = result.riskLevel === 'High Risk' ? colors.danger :
                    result.riskLevel === 'Medium Risk' ? colors.warning : colors.success;
  
  yPos = addDataTable(doc,
    [['Component', 'Score', 'Details']],
    [
      ['BMI Score', result.bmiScore || '0', `BMI: ${result.bmi?.toFixed(1) || 'N/A'}`],
      ['Weight Loss Score', result.weightLossScore || '0', result.weightLossCategory || 'No unplanned weight loss'],
      ['Acute Disease Score', result.acuteDiseaseScore || '0', result.acuteDiseaseEffect || 'No acute disease effect'],
      ['TOTAL SCORE', result.totalScore || '0', result.riskLevel || 'Low Risk'],
    ],
    yPos,
    { headerColor: riskColor }
  );
  
  // Risk Classification
  yPos = addSectionHeader(doc, 'RISK CLASSIFICATION', yPos);
  
  const riskClass = result.riskLevel === 'High Risk' ? 'danger' :
                    result.riskLevel === 'Medium Risk' ? 'warning' : 'success';
  
  yPos = addAlertBox(doc, result.riskLevel?.toUpperCase() || 'LOW RISK', [
    result.interpretation || 'Patient is at low risk of malnutrition',
    `Recommended action: ${result.action || 'Routine screening'}`,
  ], yPos, riskClass as 'warning' | 'danger' | 'success');
  
  // Interventions
  if (result.interventions && result.interventions.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'RECOMMENDED INTERVENTIONS', yPos);
    yPos = addTextSection(doc, result.interventions, yPos, { numbered: true });
  }
  
  // Dietary Plan
  if (result.dietaryPlan && result.dietaryPlan.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'DIETARY PLAN', yPos);
    yPos = addTextSection(doc, result.dietaryPlan, yPos);
  }
  
  // Nigerian Foods
  if (result.nigerianFoods && result.nigerianFoods.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'RECOMMENDED NIGERIAN FOODS', yPos);
    yPos = addTextSection(doc, result.nigerianFoods, yPos);
  }
  
  // Supplements
  if (result.supplements && result.supplements.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'SUPPLEMENTS', yPos);
    yPos = addTextSection(doc, result.supplements, yPos);
  }
  
  // Monitoring
  if (result.monitoring && result.monitoring.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'MONITORING REQUIREMENTS', yPos);
    yPos = addTextSection(doc, result.monitoring, yPos);
  }
  
  // Footer
  addFooter(doc, 1);
  
  const filename = createFilename(patientInfo?.name, 'Nutritional_Assessment');
  doc.save(filename);
}

// ============================================
// WOUND HEALING MEAL PLAN PDF GENERATOR  
// ============================================

export function generateWoundHealingMealPlanPDF(
  result: any, 
  patientInfo?: any,
  weight?: string,
  woundType?: string,
  woundSeverity?: string,
  albumin?: string
) {
  const doc = new jsPDF();
  const { colors, page } = PDF_CONFIG;
  
  // Header
  addHeader(doc, 'WOUND HEALING NUTRITION PLAN', 'Evidence-Based Meal Plan for Recovery');
  
  let yPos = 35;
  
  // Patient Information
  yPos = addPatientInfo(doc, patientInfo, yPos);
  
  // Wound Assessment
  if (weight || woundType || woundSeverity) {
    yPos = addSectionHeader(doc, 'WOUND ASSESSMENT', yPos);
    yPos = addDataTable(doc,
      [['Parameter', 'Value']],
      [
        ['Patient Weight', `${weight || result.weight} kg`],
        ['Wound Type', woundType || result.woundType || 'N/A'],
        ['Wound Severity', woundSeverity || result.woundSeverity || 'N/A'],
        ['Serum Albumin', albumin ? `${albumin} g/dL` : 'N/A'],
      ],
      yPos
    );
  }
  
  // Nutritional Requirements
  yPos = addSectionHeader(doc, 'NUTRITIONAL REQUIREMENTS', yPos);
  yPos = addDataTable(doc,
    [['Nutrient', 'Daily Target', 'Purpose']],
    [
      ['Protein', `${result.proteinRequirement || result.dailyProtein} g/day`, 'Tissue repair & collagen synthesis'],
      ['Calories', `${result.calorieRequirement || result.dailyCalories} kcal/day`, 'Energy for healing'],
      ['Vitamin C', `${result.vitaminC || '500-1000'} mg/day`, 'Collagen formation'],
      ['Zinc', `${result.zinc || '15-30'} mg/day`, 'Wound closure & immunity'],
      ['Vitamin A', `${result.vitaminA || '5000'} IU/day`, 'Epithelialization'],
      ['Fluids', `${result.fluidRequirement || result.dailyFluid} mL/day`, 'Tissue perfusion'],
    ],
    yPos,
    { headerColor: colors.success }
  );
  
  // Meal Plan
  if (result.mealPlan && result.mealPlan.length > 0) {
    doc.addPage();
    addHeader(doc, '7-DAY NIGERIAN MEAL PLAN', 'Optimized for Wound Healing');
    yPos = 35;
    
    result.mealPlan.forEach((day: any, index: number) => {
      yPos = checkNewPage(doc, yPos, 60);
      
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.primaryDark);
      doc.text(day.day || `Day ${index + 1}`, page.margin, yPos);
      yPos += 6;
      
      const mealData: (string | number)[][] = [];
      if (day.breakfast) mealData.push(['Breakfast', Array.isArray(day.breakfast) ? day.breakfast.join(', ') : day.breakfast]);
      if (day.morningSnack) mealData.push(['Morning Snack', Array.isArray(day.morningSnack) ? day.morningSnack.join(', ') : day.morningSnack]);
      if (day.lunch) mealData.push(['Lunch', Array.isArray(day.lunch) ? day.lunch.join(', ') : day.lunch]);
      if (day.afternoonSnack) mealData.push(['Afternoon Snack', Array.isArray(day.afternoonSnack) ? day.afternoonSnack.join(', ') : day.afternoonSnack]);
      if (day.dinner) mealData.push(['Dinner', Array.isArray(day.dinner) ? day.dinner.join(', ') : day.dinner]);
      if (day.eveningSnack) mealData.push(['Evening Snack', Array.isArray(day.eveningSnack) ? day.eveningSnack.join(', ') : day.eveningSnack]);
      if (day.snacks) mealData.push(['Snacks', Array.isArray(day.snacks) ? day.snacks.join(', ') : day.snacks]);
      
      if (mealData.length > 0) {
        yPos = addDataTable(doc,
          [['Meal', 'Menu']],
          mealData,
          yPos
        );
      }
      
      yPos += 4;
    });
  }
  
  // Healing Foods
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'KEY HEALING FOODS', yPos);
  yPos = addTextSection(doc, result.healingFoods || [
    'High-protein: Fish (tilapia, mackerel), chicken, eggs, beans, moi-moi',
    'Vitamin C rich: Oranges, guava, pawpaw, garden eggs, peppers',
    'Zinc sources: Pumpkin seeds (egusi), meat, fish, beans, groundnuts',
    'Iron-rich: Liver, ugwu (fluted pumpkin leaves), ewedu, beans',
    'Vitamin A: Palm oil, carrots, sweet potato leaves, mangoes',
    'Collagen support: Bone broth (cow foot), fish with bones',
  ], yPos);
  
  // Special Considerations
  if (result.specialConsiderations && result.specialConsiderations.length > 0) {
    yPos = checkNewPage(doc, yPos);
    yPos = addAlertBox(doc, 'SPECIAL DIETARY CONSIDERATIONS', result.specialConsiderations, yPos, 'warning');
  }
  
  // Monitoring
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'MONITORING', yPos);
  yPos = addTextSection(doc, result.monitoring || [
    'Weekly weight monitoring',
    'Weekly wound assessment and measurement',
    'Monitor albumin and prealbumin if available',
    'Track dietary intake with food diary',
    'Assess for signs of malnutrition',
  ], yPos);
  
  // Footer
  addFooter(doc);
  
  const filename = createFilename(patientInfo?.name, 'Wound_Healing_Meal_Plan');
  doc.save(filename);
}

// ============================================
// EMERGENCY RESUSCITATION & PRE-OP PDF
// ============================================

export function generateEmergencyResuscitationPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const { colors, sizes, page } = PDF_CONFIG;
  
  // Add header
  addHeader(doc, 'EMERGENCY RESUSCITATION & PRE-OP OPTIMIZATION', 'Diabetic Foot Sepsis - WHO/SSC Aligned Protocol');
  
  let yPos = 35;
  
  // Patient Information
  if (patientInfo) {
    yPos = addPatientInfo(doc, patientInfo, yPos);
  }
  
  // Clinical Governance Notice
  yPos = addAlertBox(doc, 'CLINICAL GOVERNANCE NOTICE', [
    'This is decision-support only. Final decisions rest with the attending surgeon and anaesthetist.',
    'All outputs are editable and overridable. Local protocols and resource availability must be considered.',
    `Generated: ${new Date().toLocaleString()}`,
  ], yPos, 'warning');
  
  // Priority Level
  yPos = checkNewPage(doc, yPos);
  const priorityColor = result.priorityLevel === 'CRITICAL' ? colors.danger :
                        result.priorityLevel === 'URGENT' ? colors.warning : colors.primary;
  doc.setFillColor(...priorityColor);
  doc.rect(page.margin, yPos, page.contentWidth, 10, 'F');
  doc.setTextColor(...colors.textWhite);
  doc.setFontSize(sizes.heading);
  doc.setFont(PDF_CONFIG.fonts.heading, 'bold');
  doc.text(`PRIORITY LEVEL: ${result.priorityLevel}`, page.width / 2, yPos + 7, { align: 'center' });
  doc.setTextColor(...colors.textPrimary);
  yPos += 16;
  
  // Sepsis Scores
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'SEPSIS ASSESSMENT', yPos);
  
  const sepsisData = [
    ['qSOFA Score', `${result.sepsisScore?.qSOFA || 0}/3`, result.sepsisScore?.qSOFA >= 2 ? 'HIGH RISK' : 'Monitor'],
    ['SIRS Criteria', `${result.sepsisScore?.sirs || 0}/4`, result.sepsisScore?.sirs >= 2 ? 'SIRS PRESENT' : 'Not met'],
    ['Sepsis Status', result.sepsisScore?.hasSepsis ? 'SEPSIS' : 'No Sepsis', result.sepsisScore?.hasSepsis ? 'Protocol Active' : ''],
    ['Septic Shock', result.sepsisScore?.hasSepticShock ? 'YES' : 'No', result.sepsisScore?.hasSepticShock ? 'CRITICAL' : ''],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Value', 'Status']],
    body: sepsisData,
    theme: 'grid',
    styles: { fontSize: sizes.body, cellPadding: 3 },
    headStyles: { fillColor: colors.tableHeader, textColor: colors.tableHeaderText },
    columnStyles: {
      2: { fontStyle: 'bold', textColor: result.sepsisScore?.hasSepsis ? colors.danger : colors.success }
    },
    margin: { left: page.margin, right: page.margin },
  });
  yPos = (doc as any).lastAutoTable.finalY + 6;
  
  // Targets
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'RESUSCITATION TARGETS', yPos);
  
  const targetsData = Object.entries(result.targets || {}).map(([key, value]) => [
    key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    value as string
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Target']],
    body: targetsData,
    theme: 'striped',
    styles: { fontSize: sizes.body, cellPadding: 3 },
    headStyles: { fillColor: colors.tableHeader, textColor: colors.tableHeaderText },
    margin: { left: page.margin, right: page.margin },
  });
  yPos = (doc as any).lastAutoTable.finalY + 6;
  
  // Fluid Calculations
  if (result.fluidCalculations) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'FLUID CALCULATIONS', yPos);
    
    const fluidData = [
      ['Estimated Fluid Deficit', `${result.fluidCalculations.fluidDeficit} mL`],
      ['Bolus Volume', `${result.fluidCalculations.bolusVolume} mL`],
      ['Maintenance Rate', `${result.fluidCalculations.maintenanceRate} mL/hr`],
      ['Deficit Correction Rate', `${result.fluidCalculations.correctionRate} mL/hr over 24h`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Calculation', 'Value']],
      body: fluidData,
      theme: 'striped',
      styles: { fontSize: sizes.body, cellPadding: 3 },
      headStyles: { fillColor: colors.primary, textColor: colors.tableHeaderText },
      margin: { left: page.margin, right: page.margin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 6;
  }
  
  // Surgery Readiness
  yPos = checkNewPage(doc, yPos);
  yPos = addSectionHeader(doc, 'SURGERY READINESS ASSESSMENT', yPos);
  
  if (result.surgeryReadiness?.canProceed) {
    yPos = addAlertBox(doc, 'SURGERY CAN PROCEED', result.surgeryReadiness.requirements, yPos, 'success');
  } else {
    yPos = addAlertBox(doc, 'REQUIREMENTS BEFORE SURGERY', result.surgeryReadiness?.requirements || [], yPos, 'warning');
  }
  
  if (result.surgeryReadiness?.warnings?.length > 0) {
    yPos = addAlertBox(doc, 'WARNINGS', result.surgeryReadiness.warnings, yPos, 'danger');
  }
  
  // Add recommendation sections
  const sections = [
    { title: 'IMMEDIATE TRIAGE & PRIORITIZATION', key: 'triage' },
    { title: 'AIRWAY MANAGEMENT', key: 'airway' },
    { title: 'BREATHING ASSESSMENT', key: 'breathing' },
    { title: 'CIRCULATION & FLUID RESUSCITATION', key: 'circulation' },
    { title: 'SEPSIS MANAGEMENT', key: 'sepsis' },
    { title: 'GLYCAEMIC CONTROL', key: 'glycemic' },
    { title: 'FLUID & ELECTROLYTE CORRECTION', key: 'fluids' },
    { title: 'ANAEMIA ASSESSMENT', key: 'anaemia' },
    { title: 'RENAL & METABOLIC SUPPORT', key: 'renal' },
    { title: 'PRE-OPERATIVE PREPARATION', key: 'preOp' },
    { title: 'ENDPOINTS FOR SURGERY', key: 'endpoints' },
    { title: 'POST-OPERATIVE CARE', key: 'postOp' },
  ];
  
  for (const section of sections) {
    if (result.recommendations?.[section.key]?.length > 0) {
      yPos = checkNewPage(doc, yPos);
      yPos = addSectionHeader(doc, section.title, yPos);
      yPos = addTextSection(doc, result.recommendations[section.key], yPos);
    }
  }
  
  // Clinical Notes
  if (result.clinicalNotes) {
    yPos = checkNewPage(doc, yPos);
    yPos = addSectionHeader(doc, 'CLINICAL NOTES', yPos);
    yPos = addTextSection(doc, [result.clinicalNotes], yPos);
  }
  
  // Critical Statement
  yPos = checkNewPage(doc, yPos);
  yPos = addAlertBox(doc, 'CRITICAL STATEMENT', [
    '"In life-threatening sepsis, surgery should NOT be delayed once minimum resuscitative targets are achieved.',
    'Source control is definitive treatment."',
    '- Surviving Sepsis Campaign Guidelines',
  ], yPos, 'danger');
  
  // Footer
  addFooter(doc);
  
  const filename = createFilename(patientInfo?.name, 'Emergency_Resuscitation_Protocol');
  doc.save(filename);
}

