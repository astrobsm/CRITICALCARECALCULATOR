'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  Droplets, 
  Thermometer, 
  Clock, 
  Download, 
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  Syringe,
  Pill,
  ClipboardList,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save
} from 'lucide-react';
import { generateEmergencyResuscitationPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

// Types
interface VitalSigns {
  systolicBP: string;
  diastolicBP: string;
  heartRate: string;
  respiratoryRate: string;
  spO2: string;
  temperature: string;
  gcs: string;
  avpu: 'A' | 'V' | 'P' | 'U';
}

interface LabValues {
  glucose: string;
  hba1c: string;
  sodium: string;
  potassium: string;
  bicarbonate: string;
  creatinine: string;
  urea: string;
  hemoglobin: string;
  wbc: string;
  platelets: string;
  lactate: string;
  urineOutput: string;
}

interface SepsisScore {
  qSOFA: number;
  sirs: number;
  hasSepsis: boolean;
  hasSepticShock: boolean;
}

interface ClinicalAssessment {
  airwayCompromised: boolean;
  requiresOxygenSupport: boolean;
  signsOfShock: boolean;
  organDysfunction: boolean;
  acuteKidneyInjury: boolean;
  alteredConsciousness: boolean;
  dehydrationSeverity: 'mild' | 'moderate' | 'severe';
  woundExtent: 'localized' | 'extensive' | 'necrotizing';
  gangrenePresent: boolean;
  osteomyelitisPresent: boolean;
}

interface ResuscitationResult {
  timestamp: string;
  sepsisScore: SepsisScore;
  priorityLevel: 'CRITICAL' | 'URGENT' | 'HIGH';
  recommendations: {
    triage: string[];
    airway: string[];
    breathing: string[];
    circulation: string[];
    sepsis: string[];
    glycemic: string[];
    fluids: string[];
    anaemia: string[];
    renal: string[];
    preOp: string[];
    endpoints: string[];
    postOp: string[];
  };
  targets: {
    map: string;
    urineOutput: string;
    glucose: string;
    lactate: string;
    hemoglobin: string;
    potassium: string;
    sodium: string;
  };
  fluidCalculations: {
    fluidDeficit: number;
    maintenanceRate: number;
    bolusVolume: number;
    correctionRate: number;
  };
  surgeryReadiness: {
    canProceed: boolean;
    requirements: string[];
    warnings: string[];
  };
  clinicalNotes: string;
}

export default function EmergencyResuscitationCalculator({ patientInfo }: PatientInfoProps) {
  // Patient demographics
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('');

  // Vital signs
  const [vitals, setVitals] = useState<VitalSigns>({
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    respiratoryRate: '',
    spO2: '',
    temperature: '',
    gcs: '',
    avpu: 'A'
  });

  // Lab values
  const [labs, setLabs] = useState<LabValues>({
    glucose: '',
    hba1c: '',
    sodium: '',
    potassium: '',
    bicarbonate: '',
    creatinine: '',
    urea: '',
    hemoglobin: '',
    wbc: '',
    platelets: '',
    lactate: '',
    urineOutput: ''
  });

  // Clinical assessment
  const [assessment, setAssessment] = useState<ClinicalAssessment>({
    airwayCompromised: false,
    requiresOxygenSupport: false,
    signsOfShock: false,
    organDysfunction: false,
    acuteKidneyInjury: false,
    alteredConsciousness: false,
    dehydrationSeverity: 'moderate',
    woundExtent: 'extensive',
    gangrenePresent: false,
    osteomyelitisPresent: false
  });

  // UI state
  const [result, setResult] = useState<ResuscitationResult | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    triage: true,
    airway: true,
    circulation: true,
    sepsis: true,
    glycemic: true,
    fluids: true,
    anaemia: true,
    renal: true,
    preOp: true,
    endpoints: true,
    postOp: true
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Helper functions
  const parseNumber = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const calculateMAP = (): number => {
    const sbp = parseNumber(vitals.systolicBP);
    const dbp = parseNumber(vitals.diastolicBP);
    if (sbp === 0 || dbp === 0) return 0;
    return Math.round(dbp + (sbp - dbp) / 3);
  };

  const calculateQSOFA = (): number => {
    let score = 0;
    if (parseNumber(vitals.respiratoryRate) >= 22) score++;
    if (parseNumber(vitals.systolicBP) <= 100) score++;
    if (vitals.avpu !== 'A' || parseNumber(vitals.gcs) < 15) score++;
    return score;
  };

  const calculateSIRS = (): number => {
    let score = 0;
    const temp = parseNumber(vitals.temperature);
    const hr = parseNumber(vitals.heartRate);
    const rr = parseNumber(vitals.respiratoryRate);
    const wbc = parseNumber(labs.wbc);

    if (temp > 38 || temp < 36) score++;
    if (hr > 90) score++;
    if (rr > 20) score++;
    if (wbc > 12 || wbc < 4) score++;
    return score;
  };

  const calculateSepsisScore = (): SepsisScore => {
    const qSOFA = calculateQSOFA();
    const sirs = calculateSIRS();
    const map = calculateMAP();
    const lactate = parseNumber(labs.lactate);

    const hasSepsis = qSOFA >= 2 || sirs >= 2;
    const hasSepticShock = hasSepsis && (map < 65 || lactate > 2);

    return { qSOFA, sirs, hasSepsis, hasSepticShock };
  };

  const calculateFluidDeficit = (): number => {
    const wt = parseNumber(weight);
    if (wt === 0) return 0;
    
    const severityMultiplier = {
      mild: 0.03,
      moderate: 0.06,
      severe: 0.09
    };
    
    return Math.round(wt * severityMultiplier[assessment.dehydrationSeverity] * 1000);
  };

  const calculateMaintenanceFluid = (): number => {
    const wt = parseNumber(weight);
    if (wt === 0) return 0;
    
    // Standard 30-35 ml/kg/day for adults
    return Math.round((30 * wt) / 24); // ml/hr
  };

  const generateRecommendations = (): ResuscitationResult => {
    const sepsisScore = calculateSepsisScore();
    const map = calculateMAP();
    const glucose = parseNumber(labs.glucose);
    const hb = parseNumber(labs.hemoglobin);
    const potassium = parseNumber(labs.potassium);
    const sodium = parseNumber(labs.sodium);
    const lactate = parseNumber(labs.lactate);
    const creatinine = parseNumber(labs.creatinine);
    const gcs = parseNumber(vitals.gcs);
    const spO2 = parseNumber(vitals.spO2);
    const urineOutput = parseNumber(labs.urineOutput);
    const wt = parseNumber(weight);

    // Determine priority level
    let priorityLevel: 'CRITICAL' | 'URGENT' | 'HIGH' = 'HIGH';
    if (sepsisScore.hasSepticShock || assessment.airwayCompromised || map < 65) {
      priorityLevel = 'CRITICAL';
    } else if (sepsisScore.hasSepsis || assessment.signsOfShock || assessment.gangrenePresent) {
      priorityLevel = 'URGENT';
    }

    // Generate all recommendations
    const recommendations = {
      triage: generateTriageRecommendations(sepsisScore, priorityLevel),
      airway: generateAirwayRecommendations(gcs, spO2),
      breathing: generateBreathingRecommendations(spO2),
      circulation: generateCirculationRecommendations(map, sepsisScore),
      sepsis: generateSepsisRecommendations(sepsisScore, lactate),
      glycemic: generateGlycemicRecommendations(glucose),
      fluids: generateFluidRecommendations(sodium, potassium, wt),
      anaemia: generateAnaemiaRecommendations(hb),
      renal: generateRenalRecommendations(creatinine, urineOutput, wt),
      preOp: generatePreOpRecommendations(sepsisScore, hb, potassium, glucose),
      endpoints: generateEndpoints(map, glucose, potassium, hb, lactate),
      postOp: generatePostOpRecommendations()
    };

    // Calculate fluid requirements
    const fluidDeficit = calculateFluidDeficit();
    const maintenanceRate = calculateMaintenanceFluid();
    const bolusVolume = sepsisScore.hasSepticShock ? Math.min(30 * wt, 1000) : 500;
    const correctionRate = Math.round(fluidDeficit / 24);

    // Assess surgery readiness
    const surgeryReadiness = assessSurgeryReadiness(map, hb, potassium, glucose, gcs, sepsisScore);

    return {
      timestamp: new Date().toISOString(),
      sepsisScore,
      priorityLevel,
      recommendations,
      targets: {
        map: '≥65 mmHg',
        urineOutput: '≥0.5 mL/kg/hr',
        glucose: '8-12 mmol/L (140-220 mg/dL)',
        lactate: '<2 mmol/L',
        hemoglobin: '≥7 g/dL (≥8 if cardiac history)',
        potassium: '3.5-5.0 mmol/L',
        sodium: '135-145 mmol/L'
      },
      fluidCalculations: {
        fluidDeficit,
        maintenanceRate,
        bolusVolume,
        correctionRate
      },
      surgeryReadiness,
      clinicalNotes
    };
  };

  // Recommendation generators
  const generateTriageRecommendations = (score: SepsisScore, priority: string): string[] => {
    const recs: string[] = [];
    
    if (score.hasSepticShock) {
      recs.push('SEPTIC SHOCK IDENTIFIED - Activate sepsis protocol immediately');
      recs.push('Escalate to senior surgeon/intensivist NOW');
    }
    
    if (assessment.gangrenePresent || assessment.woundExtent === 'necrotizing') {
      recs.push('NECROTIZING INFECTION SUSPECTED - Surgical source control within 6 hours');
    }
    
    recs.push(`Priority Level: ${priority} - ${priority === 'CRITICAL' ? 'Immediate intervention required' : priority === 'URGENT' ? 'Intervention within 1-2 hours' : 'Intervention within 6 hours'}`);
    recs.push('Initiate parallel resuscitation and surgical preparation');
    recs.push('Two large-bore IV cannulae (16G or larger) required');
    recs.push('Urinary catheter for hourly output monitoring');
    recs.push('Arterial line if shock present or vasopressors anticipated');
    
    return recs;
  };

  const generateAirwayRecommendations = (gcs: number, spO2: number): string[] => {
    const recs: string[] = [];
    
    recs.push('ASSESSMENT:');
    recs.push('• Assess patency: Look, listen, feel for air movement');
    recs.push('• Check for obstruction: Secretions, vomitus, tongue');
    recs.push('• Assess protective reflexes: Gag, cough');
    
    if (assessment.airwayCompromised || gcs < 8) {
      recs.push('');
      recs.push('⚠️ AIRWAY PROTECTION REQUIRED:');
      recs.push('• GCS <8 or loss of protective reflexes - Consider intubation');
      recs.push('• Notify anaesthesia team immediately');
      recs.push('• Prepare RSI drugs and equipment');
      recs.push('• Keep nil by mouth, head-up positioning');
    } else {
      recs.push('');
      recs.push('MAINTENANCE:');
      recs.push('• Position patient at 30-45° head elevation');
      recs.push('• Suction available at bedside');
      recs.push('• Nil by mouth for emergency surgery');
    }
    
    return recs;
  };

  const generateBreathingRecommendations = (spO2: number): string[] => {
    const recs: string[] = [];
    
    recs.push('OXYGEN TARGETS:');
    recs.push('• Target SpO₂: 94-98% (88-92% if COPD/CO₂ retainer)');
    
    if (spO2 > 0 && spO2 < 94) {
      recs.push('');
      recs.push('⚠️ HYPOXIA DETECTED:');
      recs.push('• Start high-flow oxygen (15L/min via non-rebreather mask)');
      recs.push('• If SpO₂ <90% despite high-flow O₂: Consider NIV or intubation');
      recs.push('• Request urgent ABG if available');
      recs.push('• Chest X-ray to exclude pulmonary pathology');
    } else {
      recs.push('• Low-flow oxygen via nasal cannula if SpO₂ 94-98%');
      recs.push('• Titrate to target, avoid hyperoxia');
    }
    
    recs.push('');
    recs.push('MONITORING:');
    recs.push('• Continuous pulse oximetry');
    recs.push('• Respiratory rate every 15 minutes');
    recs.push('• Work of breathing assessment');
    
    if (assessment.requiresOxygenSupport) {
      recs.push('');
      recs.push('ASSISTED VENTILATION INDICATIONS:');
      recs.push('• Respiratory rate >35/min or <8/min');
      recs.push('• SpO₂ <90% despite high-flow oxygen');
      recs.push('• Severe acidosis (pH <7.2)');
      recs.push('• Exhaustion or altered consciousness');
    }
    
    return recs;
  };

  const generateCirculationRecommendations = (map: number, score: SepsisScore): string[] => {
    const recs: string[] = [];
    const wt = parseNumber(weight);
    
    recs.push('IV ACCESS:');
    recs.push('• Two large-bore peripheral cannulae (16-18G)');
    recs.push('• Central venous access if peripheral difficult or vasopressors needed');
    recs.push('• Arterial line for continuous BP monitoring if shocked');
    
    recs.push('');
    recs.push('FLUID RESUSCITATION (WHO/SSC Guidelines):');
    
    if (score.hasSepticShock || map < 65) {
      recs.push('⚠️ HYPOTENSION/SHOCK:');
      recs.push(`• Immediate crystalloid bolus: ${Math.min(30 * wt, 1000)}mL over 15-30 minutes`);
      recs.push('• Use balanced crystalloid (Ringer\'s Lactate preferred) or 0.9% NaCl');
      recs.push('• Reassess after each bolus (BP, HR, perfusion, JVP)');
      recs.push('• Up to 30mL/kg in first 3 hours for septic shock');
    } else {
      recs.push('• Initial bolus: 500mL crystalloid over 30 minutes');
      recs.push('• Reassess response and repeat if needed');
    }
    
    recs.push('');
    recs.push('VASOPRESSOR INDICATIONS:');
    recs.push('• MAP <65 mmHg despite 30mL/kg fluid resuscitation');
    recs.push('• First-line: Noradrenaline via central line');
    recs.push('• Target MAP ≥65 mmHg');
    recs.push('• Add vasopressin if noradrenaline dose escalating');
    
    recs.push('');
    recs.push('MONITORING:');
    recs.push('• BP every 5-15 minutes during resuscitation');
    recs.push('• HR, capillary refill, urine output hourly');
    recs.push('• Lactate clearance (repeat 2-4 hourly)');
    
    return recs;
  };

  const generateSepsisRecommendations = (score: SepsisScore, lactate: number): string[] => {
    const recs: string[] = [];
    
    recs.push('SEPSIS BUNDLE - "HOUR-1" (SSC 2021):');
    recs.push('');
    
    recs.push('1. BLOOD CULTURES:');
    recs.push('   • 2 sets (aerobic + anaerobic) BEFORE antibiotics');
    recs.push('   • From 2 separate venipuncture sites');
    recs.push('   • Do NOT delay antibiotics >45 minutes for cultures');
    
    recs.push('');
    recs.push('2. EMPIRICAL ANTIBIOTICS:');
    recs.push('   • Administer within 1 hour of sepsis recognition');
    recs.push('   • Broad-spectrum coverage for:');
    recs.push('     - Gram-positive (including MRSA if risk factors)');
    recs.push('     - Gram-negative (including Pseudomonas)');
    recs.push('     - Anaerobes (diabetic foot infections)');
    recs.push('   • Consult local antibiogram and infection control');
    recs.push('   • Adjust for renal function');
    
    recs.push('');
    recs.push('3. SOURCE CONTROL:');
    recs.push('   • Emergency surgical debridement is definitive source control');
    recs.push('   • Target: Within 6-12 hours of presentation');
    recs.push('   • Do not delay for complete optimization if patient deteriorating');
    
    recs.push('');
    recs.push('4. LACTATE ASSESSMENT:');
    if (lactate > 2) {
      recs.push(`   ⚠️ Elevated lactate: ${lactate || 'Not measured'} mmol/L`);
      recs.push('   • Indicates tissue hypoperfusion');
      recs.push('   • Guide resuscitation to lactate <2 mmol/L or >10% reduction');
      recs.push('   • Repeat every 2-4 hours until normalized');
    } else {
      recs.push('   • Measure if not done');
      recs.push('   • Target: <2 mmol/L');
    }
    
    recs.push('');
    recs.push('SEPSIS SCORES:');
    recs.push(`• qSOFA Score: ${score.qSOFA}/3 ${score.qSOFA >= 2 ? '⚠️ HIGH RISK' : ''}`);
    recs.push(`• SIRS Criteria: ${score.sirs}/4 ${score.sirs >= 2 ? '⚠️ SIRS PRESENT' : ''}`);
    
    return recs;
  };

  const generateGlycemicRecommendations = (glucose: number): string[] => {
    const recs: string[] = [];
    
    recs.push('IMMEDIATE GLUCOSE MANAGEMENT:');
    recs.push('');
    
    if (glucose > 20) {
      recs.push('⚠️ SEVERE HYPERGLYCAEMIA:');
      recs.push('• Check for DKA: pH, ketones, anion gap');
      recs.push('• If DKA present: Follow DKA protocol (separate pathway)');
      recs.push('• Start IV insulin infusion: 0.1 units/kg/hr');
      recs.push('• Fluid resuscitation takes priority over glucose control');
      recs.push('• Target reduction: 3-4 mmol/L per hour maximum');
    } else if (glucose > 14) {
      recs.push('MODERATE HYPERGLYCAEMIA:');
      recs.push('• IV insulin infusion: Start at 2-4 units/hr');
      recs.push('• Adjust based on hourly glucose checks');
      recs.push('• Target: 8-12 mmol/L (140-220 mg/dL) peri-operatively');
    } else if (glucose > 10) {
      recs.push('MILD HYPERGLYCAEMIA:');
      recs.push('• Consider sliding scale insulin initially');
      recs.push('• Convert to infusion if glucose rising or >14 mmol/L');
    } else if (glucose < 4) {
      recs.push('⚠️ HYPOGLYCAEMIA - TREAT IMMEDIATELY:');
      recs.push('• 75-100mL 20% dextrose IV OR 150-200mL 10% dextrose');
      recs.push('• Recheck glucose in 15 minutes');
      recs.push('• Identify and treat cause');
      recs.push('• Start maintenance dextrose infusion');
    } else {
      recs.push('GLUCOSE IN TARGET RANGE');
      recs.push('• Maintain monitoring every 1-2 hours');
      recs.push('• Be alert to hypoglycaemia risk with nil by mouth status');
    }
    
    recs.push('');
    recs.push('PERI-OPERATIVE TARGETS:');
    recs.push('• Pre-op glucose: 8-12 mmol/L (140-220 mg/dL)');
    recs.push('• Avoid hypoglycaemia (<4 mmol/L) - more dangerous than hyperglycaemia');
    recs.push('• Monitor hourly during resuscitation phase');
    recs.push('• Continue IV insulin through surgery');
    
    recs.push('');
    recs.push('MONITORING:');
    recs.push('• Blood glucose: Hourly during active resuscitation');
    recs.push('• Every 2 hours once stable');
    recs.push('• Check for ketones if glucose >15 mmol/L');
    recs.push('• Monitor potassium closely with insulin therapy');
    
    return recs;
  };

  const generateFluidRecommendations = (sodium: number, potassium: number, wt: number): string[] => {
    const recs: string[] = [];
    const fluidDeficit = calculateFluidDeficit();
    
    recs.push('DEHYDRATION ASSESSMENT:');
    recs.push(`• Severity: ${assessment.dehydrationSeverity.toUpperCase()}`);
    recs.push(`• Estimated fluid deficit: ${fluidDeficit}mL`);
    
    recs.push('');
    recs.push('CORRECTION PRIORITIES:');
    
    // Potassium
    if (potassium > 0 && potassium < 3.0) {
      recs.push('');
      recs.push('⚠️ SEVERE HYPOKALAEMIA:');
      recs.push('• Hold surgery if K+ <2.5 mmol/L (cardiac risk)');
      recs.push('• IV KCl: 10-20 mmol/hr via central line (max 40mmol/hr if severe)');
      recs.push('• Cardiac monitoring essential');
      recs.push('• Check magnesium - replace if low');
    } else if (potassium > 0 && potassium < 3.5) {
      recs.push('');
      recs.push('HYPOKALAEMIA:');
      recs.push('• Add KCl 20-40 mmol to each litre of IV fluid');
      recs.push('• Target K+ 3.5-4.5 mmol/L pre-operatively');
    } else if (potassium > 5.5) {
      recs.push('');
      recs.push('⚠️ HYPERKALAEMIA:');
      recs.push('• ECG for peaked T waves, QRS widening');
      recs.push('• Calcium gluconate 10mL 10% IV for cardiac protection');
      recs.push('• Insulin-dextrose: 10 units Actrapid + 50mL 50% dextrose');
      recs.push('• Nebulized salbutamol 10-20mg');
      recs.push('• Consider dialysis if K+ >6.5 or ECG changes');
    }
    
    // Sodium
    if (sodium > 0 && sodium < 130) {
      recs.push('');
      recs.push('HYPONATRAEMIA:');
      recs.push('• Correct slowly: Max 8-10 mmol/L per 24 hours');
      recs.push('• Use 0.9% NaCl for resuscitation');
      recs.push('• Monitor Na+ every 4-6 hours');
    } else if (sodium > 150) {
      recs.push('');
      recs.push('HYPERNATRAEMIA:');
      recs.push('• Use hypotonic fluids (0.45% NaCl or 5% dextrose)');
      recs.push('• Correct slowly: Max 10 mmol/L per 24 hours');
    }
    
    recs.push('');
    recs.push('FLUID REGIMEN:');
    recs.push(`• Maintenance: ${calculateMaintenanceFluid()}mL/hr`);
    recs.push(`• Deficit replacement: ${Math.round(fluidDeficit / 24)}mL/hr over 24 hours`);
    recs.push('• Add ongoing losses (urine, drains, insensible)');
    recs.push('• Preferred fluid: Balanced crystalloid (Ringer\'s Lactate/Hartmann\'s)');
    
    recs.push('');
    recs.push('MONITORING:');
    recs.push('• Urine output: Target ≥0.5 mL/kg/hr');
    recs.push('• Electrolytes: Every 4-6 hours during correction');
    recs.push('• Fluid balance: Strict input/output charting');
    
    return recs;
  };

  const generateAnaemiaRecommendations = (hb: number): string[] => {
    const recs: string[] = [];
    
    recs.push('HAEMOGLOBIN ASSESSMENT:');
    
    if (hb > 0 && hb < 7) {
      recs.push('');
      recs.push('⚠️ SEVERE ANAEMIA (Hb <7 g/dL):');
      recs.push('• Transfusion required pre-operatively');
      recs.push('• Target: Hb ≥7-8 g/dL for surgery');
      recs.push('• Cross-match 2-4 units PRBC');
      recs.push('• Group & Save if transfusion anticipated');
      recs.push('• Consider Hb ≥8-9 g/dL if cardiac disease');
    } else if (hb > 0 && hb < 8) {
      recs.push('');
      recs.push('MODERATE ANAEMIA (Hb 7-8 g/dL):');
      recs.push('• Consider transfusion based on clinical status');
      recs.push('• Transfuse if symptomatic or anticipated blood loss');
      recs.push('• Cross-match 2 units PRBC');
    } else if (hb > 0 && hb < 10) {
      recs.push('');
      recs.push('MILD ANAEMIA (Hb 8-10 g/dL):');
      recs.push('• Acceptable for emergency surgery');
      recs.push('• Group & Save recommended');
      recs.push('• Anticipate intraoperative blood loss');
    } else if (hb >= 10) {
      recs.push('');
      recs.push('HAEMOGLOBIN ADEQUATE:');
      recs.push('• No transfusion required pre-operatively');
      recs.push('• Group & Save as precaution');
    } else {
      recs.push('');
      recs.push('• Check haemoglobin if not done');
      recs.push('• Send Group & Save/Cross-match');
    }
    
    recs.push('');
    recs.push('TRANSFUSION TARGETS FOR EMERGENCY SURGERY:');
    recs.push('• Minimum Hb: 7 g/dL (restrictive strategy)');
    recs.push('• Hb ≥8 g/dL if: Cardiac disease, active bleeding, shock');
    recs.push('• Avoid over-transfusion: Target Hb 7-9 g/dL');
    
    recs.push('');
    recs.push('ADDITIONAL:');
    recs.push('• Check coagulation profile (PT, APTT, INR)');
    recs.push('• Consider platelets if <50,000 and surgery imminent');
    recs.push('• FFP if INR >1.5 and active bleeding expected');
    
    return recs;
  };

  const generateRenalRecommendations = (creatinine: number, urineOutput: number, wt: number): string[] => {
    const recs: string[] = [];
    
    recs.push('URINE OUTPUT TARGETS:');
    recs.push(`• Target: ≥0.5 mL/kg/hr (≥${Math.round(0.5 * wt)}mL/hr for this patient)`);
    recs.push('• Insert urinary catheter if not done');
    recs.push('• Hourly monitoring during resuscitation');
    
    if (assessment.acuteKidneyInjury || creatinine > 150 || (urineOutput > 0 && urineOutput < 0.5 * wt)) {
      recs.push('');
      recs.push('⚠️ ACUTE KIDNEY INJURY SUSPECTED:');
      recs.push('• Optimize fluid status first');
      recs.push('• Avoid nephrotoxins: NSAIDs, aminoglycosides (adjust doses)');
      recs.push('• Adjust drug doses for renal function');
      recs.push('• Consider nephrology input if oliguric despite adequate resuscitation');
    }
    
    recs.push('');
    recs.push('RENAL PROTECTION STRATEGIES:');
    recs.push('• Adequate volume resuscitation (prevents pre-renal AKI)');
    recs.push('• Maintain MAP ≥65 mmHg');
    recs.push('• Avoid iodinated contrast if possible');
    recs.push('• Dose-adjust antibiotics for renal function');
    recs.push('• Monitor potassium closely');
    
    recs.push('');
    recs.push('GLUCOSE CONTROL IN RENAL IMPAIRMENT:');
    recs.push('• Reduce insulin doses by 25-50%');
    recs.push('• Higher risk of hypoglycaemia');
    recs.push('• More frequent glucose monitoring');
    
    recs.push('');
    recs.push('INDICATIONS FOR DIALYSIS/RRT:');
    recs.push('• Refractory hyperkalaemia (K+ >6.5, ECG changes)');
    recs.push('• Severe metabolic acidosis (pH <7.1)');
    recs.push('• Fluid overload unresponsive to diuretics');
    recs.push('• Uraemic encephalopathy or pericarditis');
    
    return recs;
  };

  const generatePreOpRecommendations = (score: SepsisScore, hb: number, potassium: number, glucose: number): string[] => {
    const recs: string[] = [];
    
    recs.push('MINIMUM ACCEPTABLE PARAMETERS FOR SURGERY:');
    recs.push('');
    recs.push('Haemodynamic:');
    recs.push('• MAP ≥65 mmHg (on vasopressors acceptable)');
    recs.push('• Improving lactate trend');
    recs.push('• Responding to fluid resuscitation');
    
    recs.push('');
    recs.push('Oxygenation:');
    recs.push('• SpO₂ ≥92% on supplemental O₂');
    recs.push('• Airway secured if GCS <8');
    
    recs.push('');
    recs.push('Metabolic:');
    recs.push('• Glucose 8-15 mmol/L (up to 20 acceptable if improving)');
    recs.push('• Potassium 3.0-6.0 mmol/L');
    recs.push('• Severe derangements actively being corrected');
    
    recs.push('');
    recs.push('Haematological:');
    recs.push('• Hb ≥7 g/dL (transfusion in progress acceptable)');
    recs.push('• Coagulation available, corrected if required');
    
    recs.push('');
    recs.push('ANAESTHETIC CONSIDERATIONS:');
    recs.push('• High aspiration risk - RSI required');
    recs.push('• Anticipate haemodynamic instability on induction');
    recs.push('• Vasopressors and blood products immediately available');
    recs.push('• Consider regional anaesthesia if appropriate');
    recs.push('• Plan for ICU/HDU admission post-operatively');
    
    recs.push('');
    recs.push('CONSENT & DOCUMENTATION:');
    recs.push('• Emergency consent - document in notes');
    recs.push('• Discuss high-risk nature of procedure');
    recs.push('• Document: Sepsis present, life/limb-saving procedure');
    recs.push('• Include possibility of amputation if relevant');
    recs.push('• Witnessed consent if possible');
    
    recs.push('');
    recs.push('WHAT CAN BE OPTIMIZED DURING SURGERY:');
    recs.push('• Ongoing fluid resuscitation');
    recs.push('• Blood transfusion');
    recs.push('• Insulin infusion continuation');
    recs.push('• Electrolyte correction');
    recs.push('• Vasopressor titration');
    
    return recs;
  };

  const generateEndpoints = (map: number, glucose: number, potassium: number, hb: number, lactate: number): string[] => {
    const recs: string[] = [];
    
    recs.push('ENDPOINTS TO DECLARE PATIENT FIT FOR SURGERY:');
    recs.push('');
    recs.push('✓ HAEMODYNAMIC STABILITY:');
    recs.push(`   • MAP ≥65 mmHg [Current: ${map > 0 ? map + ' mmHg' : 'Not measured'}]`);
    recs.push('   • Stable or decreasing vasopressor requirement');
    recs.push('   • HR <120/min and improving');
    recs.push('   • Capillary refill <3 seconds');
    
    recs.push('');
    recs.push('✓ OXYGENATION:');
    recs.push(`   • SpO₂ ≥92% [Current: ${parseNumber(vitals.spO2) > 0 ? vitals.spO2 + '%' : 'Not measured'}]`);
    recs.push('   • Airway secured if needed');
    
    recs.push('');
    recs.push('✓ GLYCAEMIC CONTROL:');
    recs.push(`   • Glucose 8-15 mmol/L [Current: ${glucose > 0 ? glucose + ' mmol/L' : 'Not measured'}]`);
    recs.push('   • Downward trend if hyperglycaemic');
    recs.push('   • No DKA or treating DKA');
    
    recs.push('');
    recs.push('✓ ELECTROLYTE SAFETY:');
    recs.push(`   • K+ 3.0-6.0 mmol/L [Current: ${potassium > 0 ? potassium + ' mmol/L' : 'Not measured'}]`);
    recs.push('   • Na+ 125-155 mmol/L');
    recs.push('   • ECG: No acute changes');
    
    recs.push('');
    recs.push('✓ URINE OUTPUT:');
    recs.push('   • ≥0.5 mL/kg/hr (or improving)');
    recs.push('   • Catheter in place');
    
    recs.push('');
    recs.push('✓ MENTAL STATUS:');
    recs.push(`   • GCS assessed [Current: ${parseNumber(vitals.gcs) > 0 ? vitals.gcs : 'Not recorded'}]`);
    recs.push('   • Baseline documented');
    
    recs.push('');
    recs.push('✓ LACTATE:');
    recs.push(`   • <4 mmol/L or improving [Current: ${lactate > 0 ? lactate + ' mmol/L' : 'Not measured'}]`);
    
    recs.push('');
    recs.push('✓ HAEMOGLOBIN:');
    recs.push(`   • ≥7 g/dL [Current: ${hb > 0 ? hb + ' g/dL' : 'Not measured'}]`);
    recs.push('   • Blood available/transfusing');
    
    recs.push('');
    recs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    recs.push('⚠️ CRITICAL STATEMENT:');
    recs.push('"In life-threatening sepsis, surgery should NOT be');
    recs.push('delayed once minimum resuscitative targets are achieved.');
    recs.push('Source control is definitive treatment."');
    recs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return recs;
  };

  const generatePostOpRecommendations = (): string[] => {
    const recs: string[] = [];
    
    recs.push('IMMEDIATE POST-OPERATIVE PRIORITIES:');
    recs.push('');
    recs.push('1. MONITORING:');
    recs.push('   • ICU/HDU admission recommended');
    recs.push('   • Continuous cardiac monitoring');
    recs.push('   • Hourly urine output');
    recs.push('   • Vital signs every 15-30 minutes initially');
    recs.push('   • Blood glucose every 1-2 hours');
    
    recs.push('');
    recs.push('2. ONGOING SEPSIS CONTROL:');
    recs.push('   • Continue IV antibiotics (review cultures when available)');
    recs.push('   • Narrow spectrum based on sensitivities');
    recs.push('   • Assess need for repeat debridement (relook in 24-48 hours)');
    recs.push('   • Monitor for signs of ongoing sepsis');
    
    recs.push('');
    recs.push('3. GLYCAEMIC MANAGEMENT:');
    recs.push('   • Continue IV insulin infusion until eating');
    recs.push('   • Target glucose 8-12 mmol/L');
    recs.push('   • Transition to SC insulin when stable and eating');
    recs.push('   • Diabetes team review');
    
    recs.push('');
    recs.push('4. WOUND CARE:');
    recs.push('   • Leave wounds open/packed after debridement');
    recs.push('   • Daily inspection for progression');
    recs.push('   • Negative pressure wound therapy if available');
    recs.push('   • Plan for delayed closure/grafting/amputation');
    
    recs.push('');
    recs.push('5. NUTRITION:');
    recs.push('   • Early enteral nutrition when feasible');
    recs.push('   • High protein diet for wound healing');
    recs.push('   • Dietitian review');
    
    recs.push('');
    recs.push('6. VTE PROPHYLAXIS:');
    recs.push('   • Mechanical prophylaxis immediately');
    recs.push('   • Pharmacological prophylaxis when haemostasis secured');
    
    recs.push('');
    recs.push('7. REHABILITATION PLANNING:');
    recs.push('   • Early physiotherapy referral');
    recs.push('   • Occupational therapy if amputation');
    recs.push('   • Psychological support');
    
    return recs;
  };

  const assessSurgeryReadiness = (map: number, hb: number, potassium: number, glucose: number, gcs: number, score: SepsisScore): { canProceed: boolean; requirements: string[]; warnings: string[] } => {
    const requirements: string[] = [];
    const warnings: string[] = [];
    let canProceed = true;

    // MAP check
    if (map > 0 && map < 65) {
      requirements.push('MAP <65 mmHg - Continue resuscitation, consider vasopressors');
    }

    // Potassium check
    if (potassium > 0 && potassium < 2.5) {
      requirements.push('K+ <2.5 mmol/L - Correct before surgery (cardiac risk)');
      canProceed = false;
    } else if (potassium > 0 && potassium > 6.5) {
      requirements.push('K+ >6.5 mmol/L - Urgent correction required');
      canProceed = false;
    }

    // Haemoglobin check
    if (hb > 0 && hb < 6) {
      requirements.push('Hb <6 g/dL - Transfuse urgently');
    }

    // Glucose check
    if (glucose > 30) {
      requirements.push('Severe hyperglycaemia - Rule out DKA/HHS');
    }

    // GCS check
    if (gcs > 0 && gcs < 8) {
      requirements.push('GCS <8 - Secure airway before theatre');
    }

    // Warnings for high-risk features
    if (score.hasSepticShock) {
      warnings.push('Septic shock - High perioperative risk');
    }
    if (assessment.gangrenePresent) {
      warnings.push('Gangrene present - Expedite surgery');
    }
    if (assessment.woundExtent === 'necrotizing') {
      warnings.push('Necrotizing infection - Surgery within 6 hours');
    }

    if (requirements.length === 0) {
      requirements.push('Minimum resuscitation targets achieved');
      requirements.push('Patient may proceed to emergency surgery');
    }

    return { canProceed, requirements, warnings };
  };

  const handleCalculate = () => {
    const result = generateRecommendations();
    setResult(result);
  };

  const handleExportPDF = () => {
    if (result) {
      const exportData = {
        ...result,
        patientDemographics: {
          age,
          sex,
          weight
        },
        vitals,
        labs,
        assessment,
        clinicalNotes
      };
      generateEmergencyResuscitationPDF(exportData, patientInfo);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'URGENT': return 'bg-orange-500 text-white';
      case 'HIGH': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const renderRecommendationSection = (title: string, key: string, icon: React.ReactNode, recommendations: string[]) => {
    const isExpanded = expandedSections[key];
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-gray-800 text-sm sm:text-base">{title}</span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isExpanded && (
          <div className="p-3 bg-white">
            <div className="space-y-1">
              {recommendations.map((rec, idx) => (
                <p 
                  key={idx} 
                  className={`text-xs sm:text-sm ${
                    rec.includes('⚠️') ? 'text-red-700 font-semibold' : 
                    rec.includes('✓') ? 'text-green-700' :
                    rec.startsWith('•') || rec.startsWith('   •') ? 'text-gray-700 pl-2' :
                    rec.includes(':') && !rec.includes('mmol') ? 'font-medium text-gray-800 mt-2' :
                    'text-gray-700'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Emergency Resuscitation & Pre-Op Optimization
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Diabetic Foot Sepsis - WHO/SSC Aligned Protocol
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-red-800">
            <p className="font-bold mb-1">CLINICAL GOVERNANCE NOTICE</p>
            <p>This is decision-support only. Final decisions rest with the attending surgeon and anaesthetist. 
            All outputs are editable and overridable. Local protocols and resource availability must be considered.</p>
          </div>
        </div>
      </div>

      {/* Input Sections */}
      <div className="space-y-6 mb-6">
        {/* Demographics */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Patient Demographics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 55"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 70"
              />
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Vital Signs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.systolicBP}
                onChange={(e) => setVitals({ ...vitals, systolicBP: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 90"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={vitals.diastolicBP}
                onChange={(e) => setVitals({ ...vitals, diastolicBP: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Heart Rate (/min)</label>
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 110"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Resp. Rate (/min)</label>
              <input
                type="number"
                value={vitals.respiratoryRate}
                onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 24"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SpO₂ (%)</label>
              <input
                type="number"
                value={vitals.spO2}
                onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 94"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 38.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">GCS (3-15)</label>
              <input
                type="number"
                min="3"
                max="15"
                value={vitals.gcs}
                onChange={(e) => setVitals({ ...vitals, gcs: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 14"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">AVPU</label>
              <select
                value={vitals.avpu}
                onChange={(e) => setVitals({ ...vitals, avpu: e.target.value as 'A' | 'V' | 'P' | 'U' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
              >
                <option value="A">Alert</option>
                <option value="V">Voice</option>
                <option value="P">Pain</option>
                <option value="U">Unresponsive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Laboratory Values */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            Laboratory Values
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Glucose (mmol/L)</label>
              <input
                type="number"
                step="0.1"
                value={labs.glucose}
                onChange={(e) => setLabs({ ...labs, glucose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 22.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">HbA1c (%)</label>
              <input
                type="number"
                step="0.1"
                value={labs.hba1c}
                onChange={(e) => setLabs({ ...labs, hba1c: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 10.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sodium (mmol/L)</label>
              <input
                type="number"
                value={labs.sodium}
                onChange={(e) => setLabs({ ...labs, sodium: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 138"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Potassium (mmol/L)</label>
              <input
                type="number"
                step="0.1"
                value={labs.potassium}
                onChange={(e) => setLabs({ ...labs, potassium: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 4.2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bicarbonate (mmol/L)</label>
              <input
                type="number"
                value={labs.bicarbonate}
                onChange={(e) => setLabs({ ...labs, bicarbonate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 18"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Creatinine (μmol/L)</label>
              <input
                type="number"
                value={labs.creatinine}
                onChange={(e) => setLabs({ ...labs, creatinine: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 180"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Haemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                value={labs.hemoglobin}
                onChange={(e) => setLabs({ ...labs, hemoglobin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 8.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WBC (×10⁹/L)</label>
              <input
                type="number"
                step="0.1"
                value={labs.wbc}
                onChange={(e) => setLabs({ ...labs, wbc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 18.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lactate (mmol/L)</label>
              <input
                type="number"
                step="0.1"
                value={labs.lactate}
                onChange={(e) => setLabs({ ...labs, lactate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 3.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Urine Output (mL/hr)</label>
              <input
                type="number"
                value={labs.urineOutput}
                onChange={(e) => setLabs({ ...labs, urineOutput: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Urea (mmol/L)</label>
              <input
                type="number"
                step="0.1"
                value={labs.urea}
                onChange={(e) => setLabs({ ...labs, urea: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Platelets (×10⁹/L)</label>
              <input
                type="number"
                value={labs.platelets}
                onChange={(e) => setLabs({ ...labs, platelets: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
                placeholder="e.g., 180"
              />
            </div>
          </div>
        </div>

        {/* Clinical Assessment */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-green-600" />
            Clinical Assessment
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dehydration Severity</label>
              <select
                value={assessment.dehydrationSeverity}
                onChange={(e) => setAssessment({ ...assessment, dehydrationSeverity: e.target.value as 'mild' | 'moderate' | 'severe' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
              >
                <option value="mild">Mild (3% body weight)</option>
                <option value="moderate">Moderate (6% body weight)</option>
                <option value="severe">Severe (9% body weight)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Wound Extent</label>
              <select
                value={assessment.woundExtent}
                onChange={(e) => setAssessment({ ...assessment, woundExtent: e.target.value as 'localized' | 'extensive' | 'necrotizing' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
              >
                <option value="localized">Localized Infection</option>
                <option value="extensive">Extensive Infection</option>
                <option value="necrotizing">Necrotizing Fasciitis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'airwayCompromised', label: 'Airway Compromised' },
              { key: 'requiresOxygenSupport', label: 'Requires O₂ Support' },
              { key: 'signsOfShock', label: 'Signs of Shock' },
              { key: 'organDysfunction', label: 'Organ Dysfunction' },
              { key: 'acuteKidneyInjury', label: 'Acute Kidney Injury' },
              { key: 'alteredConsciousness', label: 'Altered Consciousness' },
              { key: 'gangrenePresent', label: 'Gangrene Present' },
              { key: 'osteomyelitisPresent', label: 'Osteomyelitis Suspected' }
            ].map((item) => (
              <label key={item.key} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded min-h-[44px]">
                <input
                  type="checkbox"
                  checked={assessment[item.key as keyof ClinicalAssessment] as boolean}
                  onChange={(e) => setAssessment({ ...assessment, [item.key]: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-600" />
            Surgeon's Clinical Notes (Editable)
          </h3>
          <textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[100px]"
            placeholder="Enter additional clinical observations, modifications to protocol, or override notes..."
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6 min-h-[50px]"
      >
        <AlertTriangle className="w-5 h-5" />
        Generate Resuscitation Protocol
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Priority Banner */}
          <div className={`${getPriorityColor(result.priorityLevel)} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <p className="font-bold text-lg">PRIORITY: {result.priorityLevel}</p>
                  <p className="text-sm opacity-90">
                    Generated: {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p>qSOFA: {result.sepsisScore.qSOFA}/3</p>
                <p>SIRS: {result.sepsisScore.sirs}/4</p>
              </div>
            </div>
          </div>

          {/* Sepsis Status */}
          <div className={`p-4 rounded-lg ${result.sepsisScore.hasSepticShock ? 'bg-red-100 border-2 border-red-500' : result.sepsisScore.hasSepsis ? 'bg-orange-100 border-2 border-orange-500' : 'bg-green-100 border-2 border-green-500'}`}>
            <div className="flex items-center gap-2">
              {result.sepsisScore.hasSepticShock ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : result.sepsisScore.hasSepsis ? (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              <div>
                <p className="font-bold text-gray-800">
                  {result.sepsisScore.hasSepticShock ? 'SEPTIC SHOCK' : result.sepsisScore.hasSepsis ? 'SEPSIS IDENTIFIED' : 'No Sepsis Criteria Met'}
                </p>
                <p className="text-sm text-gray-600">
                  MAP: {calculateMAP() || 'N/A'} mmHg | Lactate: {parseNumber(labs.lactate) || 'N/A'} mmol/L
                </p>
              </div>
            </div>
          </div>

          {/* Surgery Readiness */}
          <div className={`p-4 rounded-lg ${result.surgeryReadiness.canProceed ? 'bg-green-50 border-2 border-green-400' : 'bg-yellow-50 border-2 border-yellow-400'}`}>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Surgery Readiness Assessment
            </h3>
            <div className="space-y-1">
              {result.surgeryReadiness.requirements.map((req, idx) => (
                <p key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span>{result.surgeryReadiness.canProceed ? '✓' : '•'}</span>
                  {req}
                </p>
              ))}
              {result.surgeryReadiness.warnings.map((warn, idx) => (
                <p key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                  <span>⚠️</span>
                  {warn}
                </p>
              ))}
            </div>
          </div>

          {/* Fluid Calculations Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              Fluid Calculations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-white p-2 rounded">
                <p className="text-gray-500 text-xs">Fluid Deficit</p>
                <p className="font-bold text-blue-700">{result.fluidCalculations.fluidDeficit} mL</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-gray-500 text-xs">Bolus Volume</p>
                <p className="font-bold text-blue-700">{result.fluidCalculations.bolusVolume} mL</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-gray-500 text-xs">Maintenance</p>
                <p className="font-bold text-blue-700">{result.fluidCalculations.maintenanceRate} mL/hr</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-gray-500 text-xs">Deficit Correction</p>
                <p className="font-bold text-blue-700">{result.fluidCalculations.correctionRate} mL/hr</p>
              </div>
            </div>
          </div>

          {/* Targets Summary */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">Resuscitation Targets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
              {Object.entries(result.targets).map(([key, value]) => (
                <div key={key} className="bg-white p-2 rounded">
                  <p className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Recommendations */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 text-lg mb-3">Detailed Clinical Recommendations</h3>
            
            {renderRecommendationSection('1. TRIAGE & PRIORITIZATION', 'triage', <AlertTriangle className="w-4 h-4 text-red-500" />, result.recommendations.triage)}
            {renderRecommendationSection('2. AIRWAY MANAGEMENT', 'airway', <Stethoscope className="w-4 h-4 text-blue-500" />, result.recommendations.airway)}
            {renderRecommendationSection('3. BREATHING & OXYGENATION', 'breathing', <Activity className="w-4 h-4 text-cyan-500" />, result.recommendations.breathing)}
            {renderRecommendationSection('4. CIRCULATION & FLUID RESUSCITATION', 'circulation', <Heart className="w-4 h-4 text-red-500" />, result.recommendations.circulation)}
            {renderRecommendationSection('5. SEPSIS MANAGEMENT', 'sepsis', <Thermometer className="w-4 h-4 text-orange-500" />, result.recommendations.sepsis)}
            {renderRecommendationSection('6. GLYCAEMIC CONTROL', 'glycemic', <Syringe className="w-4 h-4 text-purple-500" />, result.recommendations.glycemic)}
            {renderRecommendationSection('7. FLUID & ELECTROLYTE CORRECTION', 'fluids', <Droplets className="w-4 h-4 text-blue-500" />, result.recommendations.fluids)}
            {renderRecommendationSection('8. ANAEMIA ASSESSMENT', 'anaemia', <Droplets className="w-4 h-4 text-red-400" />, result.recommendations.anaemia)}
            {renderRecommendationSection('9. RENAL & METABOLIC SUPPORT', 'renal', <Activity className="w-4 h-4 text-yellow-600" />, result.recommendations.renal)}
            {renderRecommendationSection('10. PRE-OPERATIVE PREPARATION', 'preOp', <ClipboardList className="w-4 h-4 text-green-600" />, result.recommendations.preOp)}
            {renderRecommendationSection('11. SURGERY ENDPOINTS', 'endpoints', <CheckCircle className="w-4 h-4 text-green-500" />, result.recommendations.endpoints)}
            {renderRecommendationSection('12. POST-OPERATIVE CARE', 'postOp', <Shield className="w-4 h-4 text-indigo-500" />, result.recommendations.postOp)}
          </div>

          {/* Clinical Notes Display */}
          {clinicalNotes && (
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                Surgeon's Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{clinicalNotes}</p>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            className="w-full bg-[#0f2240] hover:bg-[#1e3a5f] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[50px]"
          >
            <Download className="w-5 h-5" />
            Export PDF Report
          </button>

          {/* Audit Footer */}
          <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 text-center">
            <p>Protocol generated: {new Date(result.timestamp).toLocaleString()}</p>
            <p>WHO/SSC 2021 Guidelines | For healthcare professionals only</p>
            <p className="font-semibold mt-1">This output is decision-support. Clinical judgement overrides AI output.</p>
          </div>
        </div>
      )}
    </div>
  );
}
