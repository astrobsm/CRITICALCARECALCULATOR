import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Logo as base64 data URL
const LOGO_BASE64 = 'data:image/png;base64,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';

// Helper function to add logo to PDF header
function addLogo(doc: jsPDF, xPos: number = 14, yPos: number = 10, width: number = 12, height: number = 12) {
  // Logo temporarily disabled - will be re-enabled with proper base64
  // try {
  //   doc.addImage(LOGO_BASE64, 'PNG', xPos, yPos, width, height);
  // } catch (error) {
  //   console.error('Error adding logo to PDF:', error);
  // }
}

// Helper function to create safe filename from patient name
function createFilename(patientName: string, prefix: string): string {
  if (!patientName || patientName.trim() === '') {
    return `${prefix}_${Date.now()}.pdf`;
  }
  const safeName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  return `${prefix}_${safeName}_${timestamp}.pdf`;
}

// Sodium PDF Generator
export function generateSodiumPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SODIUM DISORDER TREATMENT PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - WHO Aligned Protocol', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Patient Data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT PARAMETERS', 14, 45);
  
  autoTable(doc, {
    startY: 50,
    head: [['Parameter', 'Value', 'Reference']],
    body: [
      ['Current Sodium', `${result.current} mmol/L`, '135-145 mmol/L'],
      ['Target Sodium', `${result.target} mmol/L`, '—'],
      ['Body Weight', `${result.weight} kg`, '—'],
      ['Total Body Water', `${result.tbw} L`, '—'],
      ['Volume Status', result.volumeStatus, '—'],
      ['Acuity', result.isAcute ? 'Acute (<48h)' : 'Chronic (>48h)', '—'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [3, 132, 199] },
  });

  // Assessment
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL ASSESSMENT', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Diagnosis:', result.severity],
      ['Severity:', result.isHypo ? 'Hyponatremia' : result.isHyper ? 'Hypernatremia' : 'Normal'],
      ['Symptoms:', result.hasSymptoms ? '⚠️ SEVERE - Seizures/Coma' : 'Mild or None'],
    ],
    theme: 'plain',
    styles: { fontSize: 11 },
  });

  // Calculations
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CALCULATIONS', 14, yPos);
  
  const calcBody = [];
  if (result.sodiumDeficit) {
    calcBody.push(['Sodium Deficit', `${result.sodiumDeficit} mmol`, 'Formula: (Target - Current) × TBW']);
  }
  if (result.waterDeficit) {
    calcBody.push(['Free Water Deficit', `${result.waterDeficit} L`, 'Formula: TBW × [(Na/140) - 1]']);
  }
  calcBody.push(['Max Correction Rate', `${result.maxCorrection} mmol/L per ${result.correctionTime}h`, 'WHO Safety Limit']);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value', 'Notes']],
    body: calcBody,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  });

  // Treatment Protocol
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TREATMENT PROTOCOL', 14, yPos);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  doc.text(`Recommended Fluid: ${result.fluidType}`, 14, yPos);
  
  // Monitoring
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING REQUIREMENTS', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  const monitoring = [
    '• Monitor serum sodium every 2-4 hours during active correction',
    '• Continuous ECG monitoring if concurrent potassium abnormality',
    '• Strict fluid balance charting (input/output)',
    '• Neurological observations hourly',
    '• Assess for signs of cerebral edema or osmotic demyelination',
  ];
  
  monitoring.forEach((item) => {
    doc.text(item, 14, yPos);
    yPos += 6;
  });

  // Safety Warnings
  yPos += 5;
  doc.setFillColor(255, 243, 205);
  doc.rect(14, yPos - 4, 182, 25, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ SAFETY WARNINGS', 16, yPos + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• Rapid correction of chronic hyponatremia can cause osmotic demyelination syndrome', 16, yPos + 8);
  doc.text('• Never exceed 8 mmol/L correction in 24 hours for chronic cases', 16, yPos + 13);
  doc.text('• High-risk patients (alcoholism, malnutrition): ≤6 mmol/L per 24h', 16, yPos + 18);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a clinical decision support tool. Always use clinical judgment and verify calculations.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only. Not a substitute for clinical assessment.', 105, 290, { align: 'center' });

  // Save
  const filename = createFilename(patientInfo?.name, 'Sodium_Treatment_Plan');
  doc.save(filename);
}

// Potassium PDF Generator
export function generatePotassiumPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('POTASSIUM DISORDER TREATMENT PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - WHO Aligned Protocol', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Patient Data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT PARAMETERS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value', 'Reference']],
    body: [
      ['Current Potassium', `${result.current} mmol/L`, '3.5-5.5 mmol/L'],
      ['Body Weight', `${result.weight} kg`, '—'],
      ['ECG Changes', result.hasECGChanges ? `YES - ${result.ecgFinding}` : 'No', '—'],
      ['Magnesium Status', result.hasMg ? 'Normal' : '⚠️ LOW', '≥0.7 mmol/L'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
  });

  // Assessment
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL ASSESSMENT', 14, yPos);
  
  const urgencyText = result.urgency === 'emergency' ? '🚨 EMERGENCY' : result.urgency === 'urgent' ? '⚠️ URGENT' : 'Routine';
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Diagnosis:', result.severity],
      ['Urgency Level:', urgencyText],
      ['Estimated Deficit:', result.deficit ? `${result.deficit} mmol` : 'N/A (Hyperkalemia)'],
    ],
    theme: 'plain',
    styles: { fontSize: 11 },
  });

  // Treatment Protocol
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TREATMENT PROTOCOL', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  result.treatment.forEach((item: string, index: number) => {
    const text = `${index + 1}. ${item}`;
    const lines = doc.splitTextToSize(text, 180);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 14, yPos);
      yPos += 5;
    });
  });

  // Monitoring
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING REQUIREMENTS', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  result.monitoring.forEach((item: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`• ${item}`, 14, yPos);
    yPos += 6;
  });

  // ECG Warning if applicable
  if (result.hasECGChanges) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 5;
    doc.setFillColor(254, 226, 226);
    doc.rect(14, yPos - 4, 182, 20, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ ECG CHANGES DETECTED - CARDIAC EMERGENCY', 16, yPos + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Finding: ${result.ecgFinding.toUpperCase()}`, 16, yPos + 9);
    doc.text('Immediate intervention required. Consider ICU admission and cardiology consult.', 16, yPos + 15);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a clinical decision support tool. Always use clinical judgment and verify calculations.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only. ECG changes require immediate action.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'Potassium_Treatment_Plan');
  doc.save(filename);
}

// Acid-Base PDF Generator
export function generateAcidBasePDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ACID-BASE DISORDER ANALYSIS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ABG Results
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTERIAL BLOOD GAS RESULTS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value', 'Reference Range']],
    body: [
      ['pH', result.ph.toFixed(2), '7.35 - 7.45'],
      ['HCO₃⁻', `${result.hco3.toFixed(1)} mmol/L`, '22 - 26 mmol/L'],
      ['PCO₂', `${result.pco2.toFixed(1)} mmHg`, '35 - 45 mmHg'],
      ...(result.anionGap ? [['Anion Gap', `${result.anionGap} mmol/L (${result.agCategory})`, '8 - 12 mmol/L']] : []),
    ],
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] },
  });

  // Assessment
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL ASSESSMENT', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Diagnosis:', result.severity],
      ['Disorder Type:', result.disorder.replace(/-/g, ' ').toUpperCase()],
    ],
    theme: 'plain',
    styles: { fontSize: 11 },
  });

  // HCO3 Calculation if applicable
  if (result.hco3Required) {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BICARBONATE CALCULATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: [
        ['Required HCO₃⁻:', `${result.hco3Required} mmol`],
        ['Target HCO₃⁻:', '18-20 mmol/L'],
        ['Administration:', 'Give 50% of dose over 30-60 min, recheck ABG'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  // Possible Causes
  if (result.causes && result.causes.length > 0) {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('POSSIBLE CAUSES', 14, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 7;
    
    result.causes.forEach((cause: string) => {
      doc.text(`• ${cause}`, 14, yPos);
      yPos += 6;
    });
  }

  // Treatment Protocol
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TREATMENT PROTOCOL', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  result.treatment.forEach((item: string, index: number) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const text = `${index + 1}. ${item}`;
    const lines = doc.splitTextToSize(text, 180);
    lines.forEach((line: string) => {
      doc.text(line, 14, yPos);
      yPos += 5;
    });
  });

  // Monitoring
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING REQUIREMENTS', 14, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  
  const monitoring = [
    '• Repeat ABG every 2-4 hours initially',
    '• Continuous pulse oximetry',
    '• Monitor electrolytes (K⁺, Ca²⁺, Mg²⁺)',
    '• Assess respiratory rate and work of breathing',
    '• Monitor mental status and level of consciousness',
  ];
  
  monitoring.forEach((item) => {
    doc.text(item, 14, yPos);
    yPos += 6;
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a clinical decision support tool. Always use clinical judgment and verify calculations.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only. Treat underlying cause as priority.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'AcidBase_Analysis');
  doc.save(filename);
}

// GFR PDF Generator
export function generateGFRPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KIDNEY FUNCTION ASSESSMENT REPORT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - GFR Analysis', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Patient Data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT PARAMETERS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value', 'Reference']],
    body: [
      ['Serum Creatinine', `${result.creatinine} mg/dL`, '0.6-1.2 mg/dL'],
      ['Blood Urea', result.urea ? `${result.urea} mg/dL` : 'Not provided', '7-20 mg/dL'],
      ['Age', `${result.age} years`, '—'],
      ['Weight', `${result.weight} kg`, '—'],
      ['Gender', result.gender === 'male' ? 'Male' : 'Female', '—'],
      ['Race', result.race === 'black' ? 'Black/African American' : 'Non-Black', '—'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [3, 132, 199] },
  });

  // GFR Results
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GLOMERULAR FILTRATION RATE (GFR)', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Formula', 'Result', 'Units']],
    body: [
      ['CKD-EPI (Recommended)', result.ckdEpi, 'mL/min/1.73m²'],
      ['Cockcroft-Gault', result.cockcroftGault, 'mL/min'],
      ['MDRD', result.mdrd, 'mL/min/1.73m²'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [3, 132, 199] },
    bodyStyles: { fontSize: 11, fontStyle: 'bold' },
  });

  // CKD Stage
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CHRONIC KIDNEY DISEASE CLASSIFICATION', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['CKD Stage:', `${result.stage} - ${result.description}`],
      ['eGFR:', `${result.ckdEpi} mL/min/1.73m²`],
    ],
    theme: 'plain',
    bodyStyles: { fontSize: 11 },
  });

  // BUN/Creatinine Ratio
  if (result.bun) {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BUN/CREATININE RATIO ANALYSIS', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: [
        ['BUN:', `${result.bun} mg/dL`],
        ['BUN/Creatinine Ratio:', result.bunCreatRatio],
        ['Normal Range:', '10-20'],
        ['Interpretation:', result.bunInterpretation],
      ],
      theme: 'grid',
      headStyles: { fillColor: [3, 132, 199] },
    });
  }

  // Clinical Recommendation
  yPos = (doc as any).lastAutoTable.finalY + 10;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL RECOMMENDATION', 14, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recommendation = doc.splitTextToSize(result.recommendation, 180);
  recommendation.forEach((line: string) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 14, yPos);
    yPos += 5;
  });

  // CKD Stages Reference
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CKD STAGES REFERENCE', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Stage', 'GFR (mL/min/1.73m²)', 'Description']],
    body: [
      ['G1', '≥90', 'Normal or high (kidney damage present)'],
      ['G2', '60-89', 'Mild reduction in kidney function'],
      ['G3a', '45-59', 'Mild to moderate reduction'],
      ['G3b', '30-44', 'Moderate to severe reduction'],
      ['G4', '15-29', 'Severe reduction'],
      ['G5', '<15', 'Kidney failure'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [3, 132, 199] },
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a clinical decision support tool. GFR estimates should be interpreted with clinical context.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only. Always consider patient history and other clinical findings.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'GFR_Report');
  doc.save(filename);
}

// BNF Drug Dosing PDF Generator
export function generateBNFPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RENAL DOSE ADJUSTMENT GUIDE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - BNF Guidelines', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RENAL FUNCTION', 14, 45);
  
  autoTable(doc, {
    startY: 50,
    body: [
      ['eGFR:', `${result.gfr} mL/min/1.73m²`],
      ['CKD Stage:', result.ckdStage],
      ['Classification:', result.categoryLabel],
    ],
    theme: 'grid',
    headStyles: { fillColor: [3, 132, 199] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DOSING RECOMMENDATIONS', 14, yPos);
  
  result.recommendations.forEach((rec: any, index: number) => {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${rec.drug}`, 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: [
        ['Indication:', rec.indication],
        ['Normal Dose:', rec.normal],
        ['Recommended Dose:', rec.recommendedDose],
        ['Notes:', rec.notes],
      ],
      theme: 'striped',
      headStyles: { fillColor: [3, 132, 199] },
    });
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Always check current BNF/local formulary. Monitor drug levels where appropriate.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'BNF_Dosing');
  doc.save(filename);
}

// Burns PDF Generator
export function generateBurnsPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BURNS MANAGEMENT PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Parkland Formula', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BURN ASSESSMENT', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value']],
    body: [
      ['Total BSA Burned', `${result.totalBSA}%`],
      ['Patient Weight', `${result.weight} kg`],
      ['Severity', result.severity],
      ['Admission', result.admission],
    ],
    theme: 'grid',
    headStyles: { fillColor: [234, 88, 12] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AFFECTED AREAS', 14, yPos);
  
  const areasData = result.burnAreas.map((area: any) => [area.area, `${area.percentage}%`]);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Body Area', 'BSA %']],
    body: areasData,
    theme: 'striped',
    headStyles: { fillColor: [234, 88, 12] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAY 1 FLUID RESUSCITATION (PARKLAND FORMULA)', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Time Period', 'Volume', 'Rate', 'Fluid Type']],
    body: [
      ['Formula: 4mL × kg × %BSA', `4 × ${result.weight} × ${result.totalBSA}%`, '—', 'Parkland Formula'],
      ['First 24 hours TOTAL', `${result.totalFluid24h} mL`, '—', "Ringer's Lactate"],
      ['First 8 hours (from burn)', `${result.first8h} mL`, `${result.hourlyRateFirst8h} mL/hr`, "Ringer's Lactate"],
      ['Next 16 hours', `${result.next16h} mL`, `${result.hourlyRateNext16h} mL/hr`, "Ringer's Lactate"],
      ['Hours 8-24 Colloid (if BSA>30%)', `${result.colloidVolume8to24h || 0} mL`, '—', 'Albumin 5% or FFP'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [3, 132, 199] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAY 2 FLUID THERAPY (24-48 hours)', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Volume/Rate']],
    body: [
      ['Total Daily Fluid', `${result.day2FluidTotal} mL/day`],
      ['Hourly Rate', `${result.day2HourlyRate} mL/hour`],
      ['Maintenance Component', `${result.maintenanceFluid24h} mL`],
      ['Evaporative Loss Component', `${result.evaporativeLosses} mL`],
      ['Crystalloid (2/3)', '0.45% Saline or D5 0.45% Saline'],
      ['Colloid (1/3, if BSA>30%)', `${result.colloidDay2 || 0} mL Albumin 5%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [3, 132, 199] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAYS 3-7 MAINTENANCE FLUIDS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value']],
    body: [
      ['Total Daily Fluid', `${result.day3to7Fluid} mL/day`],
      ['Hourly Rate', `${result.day3to7HourlyRate} mL/hour`],
      ['Primary Fluid', '5% Dextrose in 0.45% Saline or 0.9% NS'],
      ['Colloid (if albumin <2.5)', 'Consider Albumin replacement'],
      ['Enteral Fluids', 'Encourage oral intake as tolerated'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING TARGETS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Urine Output Target:', `${result.urineOutputTarget} mL/hour`],
      ['Monitoring Frequency:', 'Hourly urine output, adjust rate ±20%'],
      ['Electrolytes:', 'Check Na, K, Cl, HCO3 every 6-12 hours'],
      ['Albumin:', 'Monitor daily, replace if <2.5 g/dL'],
      ['Other Parameters:', 'HR, BP, CVP, lactate, base deficit, Hct'],
    ],
    theme: 'plain',
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL REQUIREMENTS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Daily Calories:', `${result.totalCalories} kcal/day`],
      ['Protein:', `${result.proteinRequirement} g/day`],
      ['Recommendation:', 'See Nutrition Calculator for meal plan'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('WOUND CARE PROTOCOL', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Step', 'Action']],
    body: [
      ['Cleaning', 'Use Wound-Clex solution for wound cleansing'],
      ['Face burns', 'Apply Gentamicin ointment'],
      ['Body burns', 'Apply Hera gel, Sofratulle, or Honey care gauze'],
      ['Dressing changes', 'Daily or when saturated'],
      ['Monitoring', 'Watch for infection: increased pain, purulent discharge, fever'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [234, 88, 12] },
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Adjust fluid rate based on urine output. Monitor for compartment syndrome.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'Burns_Plan');
  doc.save(filename);
}

// Nutrition PDF Generator
export function generateNutritionPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITION CARE PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Nigerian Foods', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information (if provided)
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL REQUIREMENTS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Nutrient', 'Daily Requirement']],
    body: [
      ['Total Calories', `${result.totalCalories} kcal/day`],
      ['Protein', `${result.proteinRequirement} g/day`],
      ['Carbohydrates', `${result.carbsGrams} g/day`],
      ['Fats', `${result.fatsGrams} g/day`],
      ['Vitamin C', `${result.vitaminC} mg/day`],
      ['Zinc', `${result.zinc} mg/day`],
      ['Vitamin A', `${result.vitaminA} IU/day`],
      ['Fluids', `${result.fluidRequirement} mL/day (baseline)`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.addPage();
  yPos = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('7-DAY NIGERIAN MEAL PLAN', 105, yPos, { align: 'center' });
  
  yPos += 10;
  
  result.mealPlan.forEach((day: any, index: number) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(day.day, 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Breakfast:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(day.breakfast.join(', '), 40, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Lunch:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    const lunchText = doc.splitTextToSize(day.lunch.join(', '), 150);
    lunchText.forEach((line: string) => {
      doc.text(line, 40, yPos);
      yPos += 5;
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text('Dinner:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(day.dinner.join(', '), 40, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Snacks:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(day.snacks.join(', '), 40, yPos);
    yPos += 8;
  });

  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FEEDING RECOMMENDATIONS', 14, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const recommendations = [
    '• 6 small meals per day better tolerated than 3 large meals',
    '• Start enteral nutrition within 24-48 hours if possible',
    '• High-protein foods essential for wound healing',
    '• Adequate hydration crucial - monitor intake',
    '• Supplement with vitamins C, A, and zinc as prescribed',
    '• Monitor weight daily to prevent malnutrition',
  ];
  
  recommendations.forEach((item) => {
    doc.text(item, 14, yPos);
    yPos += 5;
  });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Based on Nigerian/African food composition. Adjust portions to meet caloric needs.', 105, 285, { align: 'center' });
  doc.text('For healthcare professionals only.', 105, 290, { align: 'center' });

  const filename = createFilename(patientInfo?.name, 'Nutrition_Plan');
  doc.save(filename);
}

// DVT Risk Assessment PDF Generator
export function generateDVTRiskPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DVT RISK ASSESSMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Caprini Risk Score', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Risk Assessment Results
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK ASSESSMENT RESULTS', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: [
      ['Caprini Score', result.score.toString()],
      ['Risk Level', result.riskLevel],
      ['DVT Risk Probability', result.riskPercentage]
    ],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Prophylaxis Protocol
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPHYLAXIS PROTOCOL', 14, yPos);
  
  const prophylaxisData = result.prophylaxis.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: prophylaxisData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GENERAL RECOMMENDATIONS', 14, yPos);
  
  const recommendationsData = result.recommendations.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: recommendationsData,
    theme: 'striped',
    headStyles: { fillColor: [251, 191, 36] },
  });

  // Additional Recommendations (if any)
  if (result.additionalRecommendations.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL CONSIDERATIONS', 14, yPos);
    
    const additionalData = result.additionalRecommendations.map((item: string) => [item]);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: additionalData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
  }

  // Available Medications
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AVAILABLE MEDICATIONS (NIGERIA)', 14, yPos);
  
  const medicationsData = result.availableMedications.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: medicationsData,
    theme: 'grid',
    headStyles: { fillColor: [147, 51, 234] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Warning Signs
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('WARNING SIGNS - SEEK IMMEDIATE ATTENTION', 14, yPos);
  
  const warningData = result.warningSigns.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: warningData,
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('DVT Risk Assessment - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'DVT_Risk_Assessment');
  doc.save(filename);
}

// Pressure Sore Risk PDF Generator
export function generatePressureSorePDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESSURE SORE RISK ASSESSMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Braden Scale', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Braden Scale Results
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BRADEN SCALE ASSESSMENT', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Category', 'Score']],
    body: [
      ['Sensory Perception', result.sensoryScore],
      ['Moisture', result.moistureScore],
      ['Activity', result.activityScore],
      ['Mobility', result.mobilityScore],
      ['Nutrition', result.nutritionScore],
      ['Friction & Shear', result.frictionScore],
      ['TOTAL SCORE', result.score + '/23'],
      ['RISK LEVEL', result.riskLevel]
    ],
    theme: 'grid',
    headStyles: { fillColor: [147, 51, 234] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Risk Factors (if any)
  if (result.riskFactors.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CRITICAL RISK FACTORS IDENTIFIED', 14, yPos);
    
    const riskFactorsData = result.riskFactors.map((item: string) => [item]);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: riskFactorsData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      bodyStyles: { textColor: [127, 29, 29] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Prevention Protocol
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PREVENTION PROTOCOL', 14, yPos);
  
  const protocolData = result.preventionProtocol.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: protocolData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // New page for turning schedule
  doc.addPage();
  yPos = 20;

  // Turning Schedule
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TURNING SCHEDULE', 14, yPos);
  
  const turningData = result.turningSchedule.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: turningData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { font: 'courier', fontSize: 9 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Skin Care Protocol
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SKIN CARE PROTOCOL', 14, yPos);
  
  const skinCareData = result.skinCareProtocol.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: skinCareData,
    theme: 'striped',
    headStyles: { fillColor: [147, 51, 234] },
  });

  // New page for nutrition and equipment
  doc.addPage();
  yPos = 20;

  // Nutritional Support
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL SUPPORT', 14, yPos);
  
  const nutritionData = result.nutritionalSupport.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: nutritionData,
    theme: 'striped',
    headStyles: { fillColor: [251, 191, 36] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Equipment Needed
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPMENT NEEDED', 14, yPos);
  
  const equipmentData = result.equipmentNeeded.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: equipmentData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Pressure Sore Risk Assessment - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'Pressure_Sore_Risk');
  doc.save(filename);
}

// Nutritional Assessment PDF Generator
export function generateNutritionalAssessmentPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL RISK ASSESSMENT', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - MUST Score', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Diagnosis', patientInfo.diagnosis || 'N/A'],
        ...(patientInfo.comorbidities && patientInfo.comorbidities.length > 0 
          ? [['Comorbidities', patientInfo.comorbidities.join(', ')]] 
          : [])
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // MUST Score Results
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MUST SCORE ASSESSMENT', 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Score']],
    body: [
      ['BMI Score', result.bmiScore + ` (BMI: ${result.bmiValue})`],
      ['Weight Loss Score', result.weightLossScore],
      ['Acute Disease Score', result.acuteDiseaseScore],
      ['TOTAL MUST SCORE', result.score],
      ['RISK LEVEL', result.riskLevel]
    ],
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Critical Concerns (if any)
  if (result.additionalConcerns && result.additionalConcerns.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ CRITICAL CONCERNS', 14, yPos);
    
    const concernsData = result.additionalConcerns.map((item: string) => [item]);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: concernsData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      bodyStyles: { textColor: [127, 29, 29] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Interventions Required
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INTERVENTIONS REQUIRED', 14, yPos);
  
  const interventionsData = result.interventions.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: interventionsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // New page for dietary plan
  doc.addPage();
  yPos = 20;

  // Dietary Plan
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIETARY PLAN', 14, yPos);
  
  const dietData = result.dietaryPlan.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: dietData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 }
  });

  // New page for supplements
  doc.addPage();
  yPos = 20;

  // Nutritional Supplements
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL SUPPLEMENTS', 14, yPos);
  
  const supplementsData = result.supplements.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: supplementsData,
    theme: 'grid',
    headStyles: { fillColor: [147, 51, 234] },
    styles: { fontSize: 8 }
  });

  // New page for Nigerian foods and monitoring
  doc.addPage();
  yPos = 20;

  // Nigerian High-Calorie Foods
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('NIGERIAN HIGH-CALORIE FOODS', 14, yPos);
  
  const foodsData = result.nigerianFoods.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: foodsData,
    theme: 'striped',
    headStyles: { fillColor: [251, 191, 36] },
    styles: { fontSize: 8 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Monitoring Plan
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING PLAN', 14, yPos);
  
  const monitoringData = result.monitoring.map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: monitoringData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Nutritional Risk Assessment - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'Nutritional_Assessment');
  doc.save(filename);
}

// Wound Healing Meal Plan PDF Generator
export function generateWoundHealingMealPlanPDF(result: any, patientInfo: any, weight: string, woundType: string, woundSeverity: string, albumin: string) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPREHENSIVE WOUND HEALING MEAL PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Evidence-Based Nutrition Protocol', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  // Patient Information
  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Age', patientInfo.age ? `${patientInfo.age} years` : 'N/A'],
        ['Gender', patientInfo.gender === 'male' ? 'Male' : 'Female'],
        ['Weight', `${weight} kg`],
        ['Albumin', albumin ? `${albumin} g/dL` : 'Not provided'],
        ['Wound Type', woundType || 'N/A'],
        ['Wound Severity', woundSeverity || 'N/A'],
        ...(result.hasComorbidities && result.comorbidityList.length > 0 
          ? [['Active Comorbidities', result.comorbidityList.join(', ')]] 
          : [])
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Nutritional Goals Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY NUTRITIONAL GOALS', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Target', 'Details']],
    body: [
      ['Calories', `${result.totalCalories} kcal/day`, `${result.calorieRequirement} kcal/kg body weight`],
      ['Protein', `${result.totalProtein} g/day`, `${result.proteinRequirement} g/kg body weight`],
      ['Fluids', `${result.totalFluid} ml/day`, `${result.fluidRequirement} ml/kg body weight`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Key Nutrients
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ESSENTIAL NUTRIENTS FOR WOUND HEALING', 14, yPos);

  const nutrientData = result.keyNutrients.filter((n: string) => n.trim() !== '').map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: nutrientData,
    theme: 'plain',
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // 7-Day Meal Plan
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('7-DAY MEAL PLAN', 14, yPos);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Nigerian-Adapted High-Protein, Nutrient-Dense Menu', 14, yPos + 6);

  yPos += 12;

  result.sampleMealPlan.days.forEach((day: any) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(day.day, 14, yPos);
    yPos += 6;

    day.meals.forEach((meal: any) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(meal.time, 18, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      meal.items.forEach((item: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const lines = doc.splitTextToSize(item, 175);
        doc.text(lines, 22, yPos);
        yPos += lines.length * 4;
      });
      yPos += 3;
    });
    yPos += 5;
  });

  // Food Recommendations
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NIGERIAN FOOD RECOMMENDATIONS', 14, yPos);

  const foodData = result.foodRecommendations.filter((f: string) => f.trim() !== '').map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: foodData,
    theme: 'plain',
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Foods to Avoid
  if (result.foodsToAvoid.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FOODS TO LIMIT OR AVOID', 14, yPos);

    const avoidData = result.foodsToAvoid.map((item: string) => [item]);
    
    autoTable(doc, {
      startY: yPos + 5,
      body: avoidData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Supplement Recommendations
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPPLEMENT RECOMMENDATIONS', 14, yPos);

  const suppData = result.supplementRecommendations.filter((s: string) => s.trim() !== '').map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: suppData,
    theme: 'plain',
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Hydration Protocol
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HYDRATION PROTOCOL', 14, yPos);

  const hydrationData = result.hydrationProtocol.filter((h: string) => h.trim() !== '').map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: hydrationData,
    theme: 'plain',
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Monitoring Parameters
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MONITORING & FOLLOW-UP', 14, yPos);

  const monitorData = result.monitoringParameters.filter((m: string) => m.trim() !== '').map((item: string) => [item]);
  
  autoTable(doc, {
    startY: yPos + 5,
    body: monitorData,
    theme: 'plain',
    styles: { fontSize: 9 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Wound Healing Meal Plan - For healthcare professionals only. Always verify with clinical judgment.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'Wound_Healing_Meal_Plan');
  doc.save(filename);
}

// Weight Reduction PDF Generator
export function generateWeightReductionPDF(result: any, patientInfo: any, currentWeight: string, height: string, targetWeight: string, timeframe: string, activityLevel: string) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TARGETED WEIGHT REDUCTION MEAL PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Evidence-Based Weight Loss Program', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Current Weight', `${currentWeight} kg`],
        ['Target Weight', `${targetWeight} kg`],
        ['Height', `${height} cm`],
        ['Timeframe', `${timeframe} weeks`],
        ['Activity Level', activityLevel || 'N/A'],
        ['Weight to Lose', `${result.weightToLose} kg`],
        ['Weekly Target', `${result.weeklyWeightLoss} kg/week`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITIONAL TARGETS', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Target']],
    body: [
      ['Calories', `${result.targetCalories} kcal/day`],
      ['Protein', `${result.proteinGrams}g/day`],
      ['Carbohydrates', `${result.carbGrams}g/day`],
      ['Fats', `${result.fatGrams}g/day`],
      ['Water', `${result.waterML}ml/day`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Weight Reduction Plan - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'Weight_Reduction_Plan');
  doc.save(filename);
}

// Weight Gain PDF Generator
export function generateWeightGainPDF(result: any, patientInfo: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add logo
  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TARGETED WEIGHT GAIN MEAL PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Critical Calculator - Healthy Muscle Building Program', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name || 'N/A'],
        ['Current Weight', `${result.currentWeight} kg (BMI: ${result.currentBMI})`],
        ['Target Weight', `${result.targetWeight} kg (BMI: ${result.targetBMI})`],
        ['Weight to Gain', `${result.weightToGain} kg in ${result.weeks} weeks`],
        ['Weekly Target', `${result.weeklyWeightGain} kg/week`],
        ['Safety Rating', result.safetyRating]
      ],
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY NUTRITIONAL TARGETS', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Target']],
    body: [
      ['Calories (Surplus)', `${result.targetCalories} kcal/day (+500 kcal above TDEE)`],
      ['Protein', `${result.proteinGrams}g/day (2.0g/kg for muscle growth)`],
      ['Carbohydrates', `${result.carbGrams}g/day`],
      ['Fats', `${result.fatGrams}g/day`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Weight Gain Plan - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'Weight_Gain_Plan');
  doc.save(filename);
}

// Sickle Cell Disease Management PDF Generator
export function generateSickleCellPDF(result: any, patientInfo?: any) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  addLogo(doc);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SICKLE CELL DISEASE MANAGEMENT PLAN', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('WHO-Aligned Protocol - Haemoglobinopathic Ulcer Management', 105, 27, { align: 'center' });
  doc.text(`Generated: ${timestamp}`, 105, 33, { align: 'center' });

  let yPos = 45;

  if (patientInfo && patientInfo.name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, yPos);
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Field', 'Value']],
      body: [
        ['Name', patientInfo.name],
        ['Age', patientInfo.age || 'N/A'],
        ['Hospital', patientInfo.hospital || 'N/A'],
        ['Hospital Number', patientInfo.hospitalNumber || 'N/A'],
        ['Diagnosis', patientInfo.diagnosis || 'Sickle Cell Disease'],
        ['Comorbidities', patientInfo.comorbidities?.join(', ') || 'None listed']
      ],
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CRISIS RISK ASSESSMENT', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Parameter', 'Value']],
    body: [
      ['Crisis Risk Level', result.crisisRisk],
      ['Annual Crisis Frequency', `${result.crisisPerYear} per year`],
      ['Current Hemoglobin', `${result.hb} g/dL`],
      ['Hydration Status', result.hydrationLevel],
    ],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (result.hasUlcers) {
    doc.addPage();
    yPos = 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LEG ULCER ASSESSMENT', 14, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Parameter', 'Value']],
      body: [
        ['Location', result.ulcerLocation],
        ['Size', `${result.ulcerSizeCm} cm diameter`],
        ['Duration', `${result.ulcerWeeks} weeks`],
        ['Healing Prognosis', result.healingPrognosis],
        ['Estimated Healing Time', `${result.healingWeeks} weeks`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY REQUIREMENTS', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Requirement', 'Target']],
    body: [
      ['Hydration', `${result.fluidLiters} Liters daily (minimum)`],
      ['Calories', `${result.totalCalories} kcal/day`],
      ['Protein', `${result.proteinGrams}g/day`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  const addSection = (title: string, items: string[]) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, yPos);

    const body = items.map(item => {
      const cleanItem = item.replace(/[^\x00-\x7F]/g, '');
      return [cleanItem];
    });

    autoTable(doc, {
      startY: yPos + 5,
      body: body,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 180 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  };

  doc.addPage();
  yPos = 20;
  addSection('Lifestyle Modifications', result.lifestyleChanges);
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Hydration Protocol', result.hydrationProtocol);
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Nutrition Plan', result.nutritionPlan);
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Essential Supplements', result.supplements);
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Crisis Prevention', result.crisisPrevention);
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Wound Healing Nutrients', result.woundHealingNutrients);
  
  if (result.hasUlcers) {
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    addSection('Ulcer Management Protocol', result.ulcerManagement);
  }
  
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  addSection('Monitoring Schedule', result.monitoringSchedule);

  doc.addPage();
  yPos = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('EMERGENCY WARNING SIGNS', 14, yPos);
  doc.setTextColor(0, 0, 0);

  const warningBody = result.urgentWarnings.map((w: string) => {
    const cleanWarning = w.replace(/[^\x00-\x7F]/g, '');
    return [cleanWarning];
  });

  autoTable(doc, {
    startY: yPos + 5,
    body: warningBody,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 3, textColor: [127, 29, 29] },
    columnStyles: { 0: { cellWidth: 180, fontStyle: 'bold' } },
    headStyles: { fillColor: [220, 38, 38] },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text('Sickle Cell Disease Management - WHO Guidelines - For healthcare professionals only.', 105, 285, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = createFilename(patientInfo?.name, 'SCD_Management_Plan');
  doc.save(filename);
}

