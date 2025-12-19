'use client';

import { useState } from 'react';
import { Download, AlertCircle, Info } from 'lucide-react';
import { generateDVTRiskPDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function DVTRiskCalculator({ patientInfo }: PatientInfoProps) {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
  // 1 Point Risk Factors
  const [minorSurgery, setMinorSurgery] = useState(false);
  const [varicoseVeins, setVaricoseVeins] = useState(false);
  const [swollenLegs, setSwollenLegs] = useState(false);
  const [pregnancy, setPregnancy] = useState(false);
  const [bedRest, setBedRest] = useState(false);
  const [plasterCast, setPlasterCast] = useState(false);
  const [sepsis, setSepsis] = useState(false);
  const [lungDisease, setLungDisease] = useState(false);
  const [abnormalPulmonary, setAbnormalPulmonary] = useState(false);
  const [mi, setMi] = useState(false);
  const [chf, setChf] = useState(false);
  const [inflammatory, setInflammatory] = useState(false);
  
  // 2 Point Risk Factors
  const [arthroscopic, setArthroscopic] = useState(false);
  const [majorSurgery, setMajorSurgery] = useState(false);
  const [laparoscopic, setLaparoscopic] = useState(false);
  const [centralLine, setCentralLine] = useState(false);
  const [bedridden, setBedridden] = useState(false);
  const [paralysis, setParalysis] = useState(false);
  
  // 3 Point Risk Factors
  const [previousDVT, setPreviousDVT] = useState(false);
  const [familyHistory, setFamilyHistory] = useState(false);
  const [thrombophilia, setThrombophilia] = useState(false);
  const [elevatedHomocysteine, setElevatedHomocysteine] = useState(false);
  const [heparinThrombocytopenia, setHeparinThrombocytopenia] = useState(false);
  
  // 5 Point Risk Factors
  const [stroke, setStroke] = useState(false);
  const [elective, setElective] = useState(false);
  const [hipPelvisFracture, setHipPelvisFracture] = useState(false);
  const [acuteSpinal, setAcuteSpinal] = useState(false);
  
  // Cancer/Chemotherapy
  const [cancer, setCancer] = useState(false);
  const [chemotherapy, setChemotherapy] = useState(false);
  
  const [result, setResult] = useState<any>(null);

  const calculateRisk = () => {
    let score = 0;
    let scoreBreakdown: any = {
      '1-point': [],
      '2-point': [],
      '3-point': [],
      '5-point': []
    };

    // Age scoring
    const ageNum = parseInt(age);
    if (ageNum >= 75) {
      score += 5;
      scoreBreakdown['5-point'].push('Age ≥75 years');
    } else if (ageNum >= 61) {
      score += 3;
      scoreBreakdown['3-point'].push('Age 61-74 years');
    } else if (ageNum >= 41) {
      score += 2;
      scoreBreakdown['2-point'].push('Age 41-60 years');
    }

    // BMI scoring
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100;
    const bmiNum = weightKg / (heightM * heightM);
    if (!isNaN(bmiNum) && bmiNum >= 25) {
      score += 1;
      scoreBreakdown['1-point'].push(`Obesity (BMI ${bmiNum.toFixed(1)})`);
    }

    // 1 Point Factors
    if (minorSurgery) { score += 1; scoreBreakdown['1-point'].push('Minor surgery planned'); }
    if (varicoseVeins) { score += 1; scoreBreakdown['1-point'].push('Varicose veins'); }
    if (swollenLegs) { score += 1; scoreBreakdown['1-point'].push('Swollen legs (current)'); }
    if (pregnancy) { score += 1; scoreBreakdown['1-point'].push('Pregnancy or postpartum'); }
    if (bedRest) { score += 1; scoreBreakdown['1-point'].push('Confined to bed >72 hours'); }
    if (plasterCast) { score += 1; scoreBreakdown['1-point'].push('Plaster cast or brace'); }
    if (sepsis) { score += 1; scoreBreakdown['1-point'].push('Sepsis <1 month'); }
    if (lungDisease) { score += 1; scoreBreakdown['1-point'].push('Serious lung disease'); }
    if (abnormalPulmonary) { score += 1; scoreBreakdown['1-point'].push('Abnormal pulmonary function'); }
    if (mi) { score += 1; scoreBreakdown['1-point'].push('Acute MI'); }
    if (chf) { score += 1; scoreBreakdown['1-point'].push('Congestive heart failure'); }
    if (inflammatory) { score += 1; scoreBreakdown['1-point'].push('Inflammatory bowel disease'); }

    // 2 Point Factors
    if (arthroscopic) { score += 2; scoreBreakdown['2-point'].push('Arthroscopic surgery'); }
    if (majorSurgery) { score += 2; scoreBreakdown['2-point'].push('Major surgery >45 minutes'); }
    if (laparoscopic) { score += 2; scoreBreakdown['2-point'].push('Laparoscopic surgery >45 minutes'); }
    if (centralLine) { score += 2; scoreBreakdown['2-point'].push('Central venous access'); }
    if (bedridden) { score += 2; scoreBreakdown['2-point'].push('Immobilizing plaster cast'); }
    if (paralysis) { score += 2; scoreBreakdown['2-point'].push('Paralysis, paresis, recent cast'); }

    // 3 Point Factors
    if (previousDVT) { score += 3; scoreBreakdown['3-point'].push('History of DVT/PE'); }
    if (familyHistory) { score += 3; scoreBreakdown['3-point'].push('Family history of thrombosis'); }
    if (thrombophilia) { score += 3; scoreBreakdown['3-point'].push('Known thrombophilia'); }
    if (elevatedHomocysteine) { score += 3; scoreBreakdown['3-point'].push('Elevated serum homocysteine'); }
    if (heparinThrombocytopenia) { score += 3; scoreBreakdown['3-point'].push('Heparin-induced thrombocytopenia'); }

    // 5 Point Factors
    if (stroke) { score += 5; scoreBreakdown['5-point'].push('Stroke (<1 month)'); }
    if (elective) { score += 5; scoreBreakdown['5-point'].push('Elective major lower extremity arthroplasty'); }
    if (hipPelvisFracture) { score += 5; scoreBreakdown['5-point'].push('Hip, pelvis, or leg fracture'); }
    if (acuteSpinal) { score += 5; scoreBreakdown['5-point'].push('Acute spinal cord injury'); }

    // Cancer
    if (cancer && chemotherapy) { 
      score += 3; 
      scoreBreakdown['3-point'].push('Cancer with chemotherapy');
    } else if (cancer) { 
      score += 2; 
      scoreBreakdown['2-point'].push('Cancer (present or previous)');
    }

    let riskLevel = '';
    let riskPercentage = '';
    let recommendations: string[] = [];
    let prophylaxis: string[] = [];
    let specificProtocols: string[] = [];
    let additionalRecommendations: string[] = [];
    let availableMedications: string[] = [];
    let warningSigns: string[] = [];
    let educationPoints: string[] = [];

    if (score === 0) {
      riskLevel = 'Very Low Risk';
      riskPercentage = '<0.5%';
      recommendations = [
        'No specific prophylaxis required',
        'Early mobilization and ambulation',
        'Adequate hydration',
        'Patient education on DVT signs/symptoms'
      ];
      prophylaxis = [
        'MOBILIZATION:',
        '  - Ambulate within 24 hours if possible',
        '  - Active ankle/calf exercises every 2 hours',
        '  - Avoid prolonged sitting/standing',
        '',
        'HYDRATION:',
        '  - 2-3 liters fluid/day (unless contraindicated)',
        '',
        'MONITORING:',
        '  - Daily assessment for risk factor changes'
      ];
    } else if (score >= 1 && score <= 2) {
      riskLevel = 'Low Risk';
      riskPercentage = '0.5-1.5%';
      recommendations = [
        'Early mobilization strongly encouraged',
        'Mechanical prophylaxis if surgery planned',
        'Consider pharmacological prophylaxis if multiple risk factors',
        'Reassess risk daily'
      ];
      prophylaxis = [
        'MECHANICAL PROPHYLAXIS (Choose one):',
        '  - Graduated compression stockings (GCS) 15-20 mmHg',
        '  - Intermittent pneumatic compression (IPC) devices',
        '',
        'MOBILIZATION:',
        '  - Early ambulation essential',
        '  - Leg exercises every 2 hours while awake',
        '  - Avoid leg crossing and prolonged immobility',
        '',
        'PHARMACOLOGICAL (if surgery or hospitalization):',
        '  Consider if:',
        '    - Patient unable to mobilize',
        '    - Additional risk factors develop',
        '    - Prolonged procedure expected',
        '',
        '  Options:',
        '    - Enoxaparin 40mg SC once daily',
        '    - Dalteparin 2500-5000 units SC once daily',
        '    - UFH 5000 units SC 8-12 hourly'
      ];
    } else if (score >= 3 && score <= 4) {
      riskLevel = 'Moderate Risk';
      riskPercentage = '1.5-3%';
      recommendations = [
        'Mechanical prophylaxis REQUIRED',
        'Pharmacological prophylaxis STRONGLY RECOMMENDED',
        'Combined approach often needed',
        'Extended duration prophylaxis',
        'Daily monitoring for DVT signs'
      ];
      prophylaxis = [
        'COMBINATION THERAPY (Mechanical + Pharmacological):',
        '',
        'MECHANICAL:',
        '  - Graduated compression stockings (GCS) AND/OR',
        '  - Sequential compression devices (SCD)',
        '  - Apply before surgery and continue until fully mobile',
        '',
        'PHARMACOLOGICAL - LMWH (PREFERRED):',
        '  First-line options:',
        '    - Enoxaparin 40mg SC once daily (start 12h pre-op or 6-12h post-op)',
        '    - Dalteparin 5000 units SC once daily',
        '',
        '  Alternative:',
        '    - UFH 5000 units SC every 8-12 hours',
        '',
        'DURATION:',
        '  - Minimum 7-10 days',
        '  - Continue until patient fully mobile',
        '  - Extended to 28-35 days for:',
        '    • Abdominal/pelvic cancer surgery',
        '    • Reduced mobility expected',
        '',
        'MONITORING:',
        '  - Platelet count: Day 0, Day 3, Day 5, Day 7 (HIT screening)',
        '  - Renal function for dose adjustment',
        '  - Daily bleeding assessment',
        '  - Calf circumference measurements if suspicion'
      ];
      specificProtocols = [
        'RENAL DOSING ADJUSTMENTS:',
        '  CrCl <30 mL/min:',
        '    - Enoxaparin: 30mg SC once daily',
        '    - Dalteparin: 2500 units SC once daily',
        '    - Consider UFH (no dose adjustment needed)',
        '',
        'BLEEDING RISK CONSIDERATIONS:',
        '  High bleeding risk (delay pharmacological prophylaxis):',
        '    - Active bleeding',
        '    - Platelets <50,000',
        '    - Recent neurosurgery/spinal/eye surgery',
        '    - Uncontrolled severe hypertension',
        '  Use mechanical prophylaxis only until bleeding risk improves'
      ];
    } else if (score >= 5 && score <= 8) {
      riskLevel = 'High Risk';
      riskPercentage = '3-6%';
      recommendations = [
        'AGGRESSIVE prophylaxis MANDATORY',
        'Combined mechanical and pharmacological prophylaxis REQUIRED',
        'Higher-dose LMWH regimens',
        'Extended duration prophylaxis (minimum 28-35 days)',
        'Consider IVC filter if anticoagulation contraindicated',
        'Twice daily monitoring for DVT/PE signs',
        'Duplex ultrasound if any clinical suspicion'
      ];
      prophylaxis = [
        'INTENSIVE COMBINATION THERAPY (MANDATORY):',
        '',
        'MECHANICAL (BOTH recommended):',
        '  - Graduated compression stockings (knee or thigh-high)',
        '  - Sequential compression devices (SCD) - continuous use',
        '  - Start immediately on admission/pre-operatively',
        '',
        'PHARMACOLOGICAL - ENHANCED DOSING:',
        '',
        '  LMWH Options (choose one):',
        '    1. Enoxaparin (PREFERRED):',
        '       - Medical patients: 40mg SC once daily',
        '       - Surgical/trauma: 30mg SC twice daily OR 40mg once daily',
        '       - Cancer patients: 40mg SC once daily',
        '',
        '    2. Dalteparin:',
        '       - 5000 units SC once daily (general)',
        '       - Cancer patients: 200 units/kg SC once daily (max 18,000 units)',
        '',
        '    3. Tinzaparin:',
        '       - 4500 units SC once daily (<70kg)',
        '       - 75 units/kg SC once daily (≥70kg)',
        '',
        '  Unfractionated Heparin (if LMWH unavailable or renal failure):',
        '    - 5000 units SC every 8 hours',
        '    - Monitor anti-Xa levels if available (target 0.2-0.4)',
        '',
        'ALTERNATIVE AGENTS (if heparin contraindicated):',
        '    - Fondaparinux: 2.5mg SC once daily',
        '    - Rivaroxaban: 10mg PO once daily (orthopedic surgery)',
        '    - Apixaban: 2.5mg PO twice daily',
        '',
        'TIMING:',
        '  - Pre-operative: Start 12 hours before surgery (if low bleeding risk)',
        '  - Post-operative: Start 6-12 hours after surgery',
        '  - Medical patients: Start immediately on admission',
        '',
        'DURATION:',
        '  Standard: Minimum 10-14 days',
        '  Extended (28-35 days) for:',
        '    • Major cancer surgery (abdominal/pelvic)',
        '    • Hip/knee replacement',
        '    • Hip fracture surgery',
        '    • Limited mobility expected',
        '    • Previous VTE',
        '',
        'MONITORING (INTENSIVE):',
        '  - CBC with platelets: Baseline, Days 3, 5, 7, 10, 14 (HIT protocol)',
        '  - Renal function: Baseline, Day 3, weekly',
        '  - LFTs if using rivaroxaban/apixaban',
        '  - PT/INR baseline',
        '  - Daily leg examination (measure calf circumference)',
        '  - Twice daily vital signs (watch for tachycardia/tachypnea)',
        '  - Bleeding assessment with each patient contact',
        '',
        'SPECIAL CONSIDERATIONS:',
        '  - Consider duplex ultrasound surveillance in very high-risk patients',
        '  - IVC filter if anticoagulation absolutely contraindicated',
        '  - Consultation with hematology/vascular surgery'
      ];
      specificProtocols = [
        'RENAL DOSING (CRITICAL):',
        '  CrCl 15-30 mL/min:',
        '    - Enoxaparin: 30mg SC once daily',
        '    - Dalteparin: 2500-5000 units SC once daily',
        '    - Fondaparinux: CONTRAINDICATED',
        '',
        '  CrCl <15 mL/min or on dialysis:',
        '    - UFH 5000 units SC q8-12h (PREFERRED)',
        '    - Monitor anti-Xa levels if available',
        '    - Avoid LMWH and fondaparinux',
        '',
        'OBESITY DOSING (BMI >40 or weight >150kg):',
        '  - Enoxaparin: 0.5mg/kg SC twice daily',
        '  - Dalteparin: 5000-7500 units SC twice daily',
        '  - Consider anti-Xa monitoring (peak 0.6-1.0 IU/mL)',
        '',
        'CONTRAINDICATIONS TO ANTICOAGULATION:',
        '  Absolute:',
        '    - Active major bleeding',
        '    - Severe thrombocytopenia (<20,000)',
        '    - Recent CNS/spinal/ocular bleeding',
        '  Relative:',
        '    - Platelets 20,000-50,000',
        '    - Recent major surgery (<48h)',
        '    - Epidural catheter in situ',
        '',
        '  If contraindicated → Use mechanical prophylaxis + consider IVC filter'
      ];
    } else {
      riskLevel = 'Very High Risk / Extreme Risk';
      riskPercentage = '>6%';
      recommendations = [
        '⚠️ CRITICAL - IMMEDIATE intervention required',
        'MAXIMAL prophylaxis protocol MANDATORY',
        'Consider therapeutic anticoagulation in some cases',
        'IVC filter strongly considered if anticoagulation contraindicated',
        'Extended duration prophylaxis (minimum 35 days, up to 3 months)',
        'Hematology/vascular surgery consultation REQUIRED',
        'Continuous monitoring and surveillance',
        'Duplex ultrasound screening protocol may be indicated'
      ];
      prophylaxis = [
        '⚠️ MAXIMAL PROPHYLAXIS PROTOCOL:',
        '',
        'MECHANICAL (MANDATORY - ALL):',
        '  - Thigh-high graduated compression stockings (20-30 mmHg)',
        '  - Sequential compression devices - CONTINUOUS use',
        '  - Elevate legs when in bed (15-20 degrees)',
        '  - Passive/active ROM exercises every hour',
        '',
        'PHARMACOLOGICAL - MAXIMUM INTENSITY:',
        '',
        '  PREFERRED REGIMENS:',
        '    1. Enoxaparin 30mg SC TWICE DAILY (preferred for very high risk)',
        '       OR Enoxaparin 40mg SC once daily with close monitoring',
        '',
        '    2. Dalteparin:',
        '       - 5000 units SC twice daily OR',
        '       - 200 units/kg SC once daily (for cancer patients)',
        '',
        '    3. Fondaparinux 2.5mg SC once daily (if no renal impairment)',
        '',
        '    4. Consider THERAPEUTIC anticoagulation for:',
        '       - Previous proximal DVT/PE',
        '       - Known severe thrombophilia',
        '       - Active cancer with very high VTE risk',
        '       Therapeutic dosing:',
        '         • Enoxaparin 1mg/kg SC twice daily',
        '         • Dalteparin 200 units/kg SC once daily',
        '',
        'IVC FILTER CONSIDERATION:',
        '  Indications:',
        '    - Absolute contraindication to anticoagulation',
        '    - Recent VTE despite adequate anticoagulation',
        '    - Massive PE with hemodynamic compromise',
        '  Type: Retrievable filter preferred',
        '  Remove when anticoagulation safe (typically 3-6 months)',
        '',
        'TIMING:',
        '  - Pre-operative: 12 hours before (if very low bleeding risk)',
        '  - Post-operative: 6-12 hours after hemostasis achieved',
        '  - Medical: IMMEDIATE on admission',
        '',
        'EXTENDED DURATION:',
        '  Minimum: 35 days',
        '  Extended to 3-6 months for:',
        '    • Active cancer',
        '    • Previous VTE',
        '    • Persistent immobility',
        '    • Multiple ongoing risk factors',
        '',
        'INTENSIVE MONITORING:',
        '  Daily:',
        '    - Leg examination (calf/thigh circumference)',
        '    - Vital signs QID (HR, RR, SpO2)',
        '    - Bleeding assessment',
        '    - Wells score if any new leg symptoms',
        '',
        '  Laboratory:',
        '    - CBC/platelets: Baseline, Days 1, 3, 5, 7, 10, 14, weekly',
        '    - Renal function: Baseline, Day 3, weekly',
        '    - PT/INR, aPTT: Baseline',
        '    - Anti-Xa levels if:',
        '      • Renal impairment',
        '      • Obesity (BMI >40)',
        '      • Pregnancy',
        '      • Recurrent VTE on prophylaxis',
        '    Target anti-Xa: 0.2-0.4 IU/mL (prophylactic)',
        '',
        '  Imaging surveillance (consider):',
        '    - Bilateral lower extremity duplex ultrasound',
        '    - Frequency: Weekly for first 2 weeks if very high risk',
        '',
        'MANDATORY CONSULTATIONS:',
        '  - Hematology service',
        '  - Vascular surgery (for IVC filter consideration)',
        '  - Consider thrombophilia testing'
      ];
      specificProtocols = [
        'SPECIAL POPULATIONS:',
        '',
        'CANCER PATIENTS:',
        '  - Extended prophylaxis: 3-6 months',
        '  - Higher LMWH doses: Dalteparin 200 units/kg daily',
        '  - Consider therapeutic anticoagulation if:',
        '    • Pancreatic cancer',
        '    • Metastatic disease',
        '    • Recent chemotherapy',
        '',
        'PREGNANCY/POSTPARTUM:',
        '  - Enoxaparin: 40mg SC once daily OR',
        '  - Dalteparin: 5000 units SC once daily',
        '  - Start early in pregnancy if prior VTE',
        '  - Continue 6 weeks postpartum',
        '  - Anti-Xa monitoring recommended',
        '',
        'TRAUMA PATIENTS:',
        '  - Start prophylaxis within 24-36 hours',
        '  - Higher doses often needed: Enoxaparin 30mg SC bid',
        '  - IVC filter if anticoagulation contraindicated',
        '  - Duplex surveillance protocol',
        '',
        'CRITICAL CARE/ICU:',
        '  - Enoxaparin 40mg SC daily OR 30mg bid',
        '  - UFH 5000 units SC tid if renal failure',
        '  - Continuous mechanical compression',
        '  - Daily assessment',
        '',
        'ORTHOPEDIC SURGERY (Hip/Knee):',
        '  Options:',
        '    - Enoxaparin 30mg SC bid (start 12-24h post-op)',
        '    - Rivaroxaban 10mg PO daily (start 6-10h post-op)',
        '    - Apixaban 2.5mg PO bid (start 12-24h post-op)',
        '  Duration: Minimum 35 days (up to 12 weeks for THR)',
        '',
        'CONTRAINDICATION MANAGEMENT:',
        '  If CANNOT use anticoagulation:',
        '    1. Mechanical prophylaxis (maximal)',
        '    2. IVC filter (retrievable)',
        '    3. Aspirin 325mg daily (if no other options)',
        '    4. Consider early mobilization/ambulation',
        '    5. Aggressive hydration',
        '    6. Re-evaluate anticoagulation contraindication daily'
      ];
    }

    // Additional recommendations - already declared above
    
    if (cancer) {
      additionalRecommendations.push('CANCER-ASSOCIATED VTE: Very high risk - extended prophylaxis 3-6 months mandatory');
      additionalRecommendations.push('Consider outpatient LMWH if discharged before completing prophylaxis');
      additionalRecommendations.push('Risk highest during chemotherapy - continue prophylaxis throughout treatment');
    }
    
    if (previousDVT || familyHistory || thrombophilia) {
      additionalRecommendations.push('THROMBOPHILIA WORKUP recommended if not already done:');
      additionalRecommendations.push('  - Factor V Leiden, Prothrombin G20210A mutation');
      additionalRecommendations.push('  - Protein C, Protein S, Antithrombin III deficiency');
      additionalRecommendations.push('  - Antiphospholipid antibodies');
      additionalRecommendations.push('Lifelong prophylaxis may be needed for high-risk procedures');
    }
    
    if (majorSurgery || elective || hipPelvisFracture) {
      additionalRecommendations.push('SURGICAL PROPHYLAXIS:');
      additionalRecommendations.push('  - Pre-op: Discuss VTE risk and prophylaxis plan');
      additionalRecommendations.push('  - Intra-op: Minimize operative time, avoid prolonged tourniquet');
      additionalRecommendations.push('  - Post-op: Early mobilization protocol within 24 hours');
      additionalRecommendations.push('Extended prophylaxis: Minimum 28-35 days for major orthopedic/cancer surgery');
    }

    if (bedridden || paralysis || stroke) {
      additionalRecommendations.push('IMMOBILE PATIENTS: Dual modality (mechanical + pharmacological) MANDATORY');
      additionalRecommendations.push('Physical therapy: Passive/active ROM exercises every 2 hours');
      additionalRecommendations.push('Occupational therapy: Early mobilization plan');
      additionalRecommendations.push('Continue prophylaxis until patient fully ambulatory');
    }

    if (centralLine) {
      additionalRecommendations.push('CENTRAL LINE: Upper extremity DVT risk - monitor arm swelling/pain');
      additionalRecommendations.push('Remove line as soon as possible');
      additionalRecommendations.push('Consider alternative access if long-term need');
    }

    // Nigerian-specific medications and availability
    availableMedications = [
      'LOW MOLECULAR WEIGHT HEPARIN (LMWH):',
      '  - Enoxaparin (Clexane) - 20mg, 40mg, 60mg pre-filled syringes',
      '  - Enoxaparin (Clexane) - 80mg, 100mg, 120mg pre-filled syringes',
      '  - Dalteparin (Fragmin) - 2500 IU, 5000 IU, 7500 IU syringes',
      '  - Tinzaparin (Innohep) - 10,000 IU, 14,000 IU vials',
      '',
      'UNFRACTIONATED HEPARIN:',
      '  - Heparin sodium - 5000 IU/mL vials (5mL, 10mL)',
      '  - Heparin sodium - 25,000 IU/5mL vials',
      '',
      'ORAL ANTICOAGULANTS:',
      '  - Rivaroxaban (Xarelto) - 10mg, 15mg, 20mg tablets',
      '  - Apixaban (Eliquis) - 2.5mg, 5mg tablets',
      '  - Warfarin (Coumadin) - 2mg, 5mg tablets',
      '',
      'MECHANICAL DEVICES:',
      '  - TED stockings (knee-high, thigh-high) - Various sizes',
      '  - Sequential compression devices (SCD) - Available in major centers',
      '',
      'FONDAPARINUX:',
      '  - Arixtra - 2.5mg pre-filled syringes (limited availability)',
      '',
      'STORAGE: All heparin products require refrigeration (2-8°C)',
      'AVAILABILITY: Most major hospitals and pharmacies stock Clexane and UFH',
      'COST CONSIDERATION: LMWH more expensive than UFH - discuss with patient/family'
    ];

    // Warning signs
    warningSigns = [
      'DEEP VEIN THROMBOSIS (DVT) Signs:',
      '  - Calf or thigh pain, tenderness',
      '  - Leg swelling (measure calf circumference)',
      '  - Warmth, redness over affected vein',
      '  - Positive Homans sign (pain with dorsiflexion)',
      '  - Leg circumference difference >2cm between legs',
      '  - Dilated superficial veins',
      '',
      'PULMONARY EMBOLISM (PE) Signs - EMERGENCY:',
      '  - Sudden dyspnea or tachypnea',
      '  - Chest pain (pleuritic)',
      '  - Hemoptysis',
      '  - Tachycardia (HR >100)',
      '  - Hypoxia (SpO2 <90%)',
      '  - Syncope or pre-syncope',
      '  - Hypotension',
      '  - Signs of right heart strain',
      '',
      '⚠️ IF ANY PE SIGNS: IMMEDIATE RESUSCITATION + CT PULMONARY ANGIOGRAPHY',
      '',
      'BLEEDING COMPLICATIONS (notify physician):',
      '  - Bruising or hematoma at injection site',
      '  - Hematuria (blood in urine)',
      '  - Melena or hematochezia (GI bleeding)',
      '  - Hematemesis (vomiting blood)',
      '  - Epistaxis (nosebleed) not stopping',
      '  - Hemoptysis (coughing blood)',
      '  - CNS symptoms (headache, confusion - ? intracranial hemorrhage)',
      '  - Hemoglobin drop >2g/dL',
      '',
      'HEPARIN-INDUCED THROMBOCYTOPENIA (HIT):',
      '  - Platelet count drop >50% from baseline',
      '  - New thrombosis while on heparin',
      '  - Skin necrosis at injection sites',
      '  - Typically occurs Day 5-10 of therapy',
      '  → STOP HEPARIN IMMEDIATELY if suspected'
    ];

    // Patient education points
    educationPoints.push('PATIENT/FAMILY EDUCATION:');
    educationPoints.push('  • Explain VTE risk and importance of prophylaxis');
    educationPoints.push('  • Teach warning signs of DVT and PE');
    educationPoints.push('  • Demonstrate leg exercises');
    educationPoints.push('  • Emphasize importance of mobilization');
    educationPoints.push('  • Injection technique if outpatient LMWH prescribed');
    educationPoints.push('  • Storage of LMWH (refrigeration required)');
    educationPoints.push('  • Bleeding precautions (soft toothbrush, electric razor)');
    educationPoints.push('  • When to seek emergency care');
    educationPoints.push('  • Importance of compliance with prophylaxis duration');

    setResult({
      score,
      scoreBreakdown,
      riskLevel,
      riskPercentage,
      recommendations,
      prophylaxis,
      specificProtocols,
      additionalRecommendations,
      availableMedications,
      warningSigns,
      educationPoints
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateDVTRiskPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">DVT Risk Assessment - Comprehensive Caprini Score</h2>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Complete VTE Risk Stratification Tool</p>
            <p className="text-blue-800">Select all applicable risk factors. The Caprini score predicts venous thromboembolism (VTE) risk with validated scoring (0-40+ points).</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Age, Weight, Height (BMI auto-calculated) */}
        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium mb-2">Patient Age (years) *</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              placeholder="Enter age"
            />
            <p className="text-xs text-gray-500 mt-1">41-60: +2, 61-74: +3, ≥75: +5 points</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              placeholder="Enter weight"
            />
            {weight && height && (
              <p className="text-xs text-green-600 mt-1">BMI: {(parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)).toFixed(1)}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border rounded text-gray-900"
              placeholder="Enter height"
            />
            <p className="text-xs text-gray-500 mt-1">BMI ≥25: +1 point</p>
          </div>
        </div>

        {/* 1 Point Risk Factors */}
        <div className="border-2 border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Risk Factors Worth 1 Point Each
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={minorSurgery} onChange={(e) => setMinorSurgery(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Minor surgery planned</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={varicoseVeins} onChange={(e) => setVaricoseVeins(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">History of varicose veins</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={swollenLegs} onChange={(e) => setSwollenLegs(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Swollen legs (current)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={pregnancy} onChange={(e) => setPregnancy(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Pregnancy or &lt;1 month postpartum</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={bedRest} onChange={(e) => setBedRest(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Confined to bed &gt;72 hours</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={plasterCast} onChange={(e) => setPlasterCast(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Plaster cast or brace</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={sepsis} onChange={(e) => setSepsis(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Sepsis (&lt;1 month)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={lungDisease} onChange={(e) => setLungDisease(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Serious lung disease (COPD)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={abnormalPulmonary} onChange={(e) => setAbnormalPulmonary(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Abnormal pulmonary function</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={mi} onChange={(e) => setMi(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Acute myocardial infarction</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={chf} onChange={(e) => setChf(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Congestive heart failure (&lt;1 month)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
              <input type="checkbox" checked={inflammatory} onChange={(e) => setInflammatory(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Inflammatory bowel disease</span>
            </label>
          </div>
        </div>

        {/* 2 Point Risk Factors */}
        <div className="border-2 border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
            <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Risk Factors Worth 2 Points Each
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={arthroscopic} onChange={(e) => setArthroscopic(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Arthroscopic surgery</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={majorSurgery} onChange={(e) => setMajorSurgery(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Major surgery &gt;45 minutes</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={laparoscopic} onChange={(e) => setLaparoscopic(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Laparoscopic surgery &gt;45 minutes</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={centralLine} onChange={(e) => setCentralLine(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Central venous access</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={bedridden} onChange={(e) => setBedridden(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Immobilizing plaster cast &lt;1 month</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-yellow-50 rounded cursor-pointer">
              <input type="checkbox" checked={paralysis} onChange={(e) => setParalysis(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Paralysis, paresis, or recent plaster cast</span>
            </label>
          </div>
        </div>

        {/* 3 Point Risk Factors */}
        <div className="border-2 border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
            <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Risk Factors Worth 3 Points Each
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-start space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={previousDVT} onChange={(e) => setPreviousDVT(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">History of DVT/PE</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={familyHistory} onChange={(e) => setFamilyHistory(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Family history of thrombosis</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={thrombophilia} onChange={(e) => setThrombophilia(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Positive Factor V Leiden, prothrombin mutation, etc.</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={elevatedHomocysteine} onChange={(e) => setElevatedHomocysteine(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Elevated serum homocysteine</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={heparinThrombocytopenia} onChange={(e) => setHeparinThrombocytopenia(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Heparin-induced thrombocytopenia (HIT)</span>
            </label>
          </div>
        </div>

        {/* 5 Point Risk Factors */}
        <div className="border-2 border-red-300 rounded-lg p-4">
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
            Risk Factors Worth 5 Points Each
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-start space-x-2 p-2 hover:bg-red-50 rounded cursor-pointer">
              <input type="checkbox" checked={stroke} onChange={(e) => setStroke(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Stroke (&lt;1 month)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-red-50 rounded cursor-pointer">
              <input type="checkbox" checked={elective} onChange={(e) => setElective(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Elective major lower extremity arthroplasty</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-red-50 rounded cursor-pointer">
              <input type="checkbox" checked={hipPelvisFracture} onChange={(e) => setHipPelvisFracture(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Hip, pelvis, or leg fracture (&lt;1 month)</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-red-50 rounded cursor-pointer">
              <input type="checkbox" checked={acuteSpinal} onChange={(e) => setAcuteSpinal(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Acute spinal cord injury (paralysis) &lt;1 month</span>
            </label>
          </div>
        </div>

        {/* Cancer */}
        <div className="border-2 border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-purple-700 mb-3">Cancer Status</h3>
          <div className="space-y-2">
            <label className="flex items-start space-x-2 p-2 hover:bg-purple-50 rounded cursor-pointer">
              <input type="checkbox" checked={cancer} onChange={(e) => setCancer(e.target.checked)} className="w-4 h-4 mt-1" />
              <span className="text-sm">Cancer (present or previous within 6 months) - 2 points</span>
            </label>
            
            <label className="flex items-start space-x-2 p-2 hover:bg-purple-50 rounded cursor-pointer">
              <input type="checkbox" checked={chemotherapy} onChange={(e) => setChemotherapy(e.target.checked)} className="w-4 h-4 mt-1" disabled={!cancer} />
              <span className="text-sm">Currently on chemotherapy - Additional +1 point (total 3 if cancer selected)</span>
            </label>
          </div>
        </div>

        <button
          onClick={calculateRisk}
          disabled={!age}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Calculate DVT Risk Score
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Score Breakdown */}
            <div className={`p-6 rounded-lg border-2 ${
              result.score === 0 ? 'bg-green-50 border-green-300' :
              result.score <= 2 ? 'bg-blue-50 border-blue-300' :
              result.score <= 4 ? 'bg-yellow-50 border-yellow-300' :
              result.score <= 8 ? 'bg-orange-50 border-orange-300' :
              'bg-red-50 border-red-400'
            }`}>
              <h3 className="font-bold text-2xl mb-2">Caprini Risk Assessment</h3>
              <p className="text-4xl font-bold mb-2" style={{color: 
                result.score === 0 ? '#059669' :
                result.score <= 2 ? '#2563eb' :
                result.score <= 4 ? '#d97706' :
                result.score <= 8 ? '#ea580c' : '#dc2626'
              }}>Score: {result.score}</p>
              <p className="text-2xl font-bold">{result.riskLevel}</p>
              <p className="text-lg mt-1">VTE Risk: {result.riskPercentage}</p>
              
              {/* Score breakdown */}
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="font-semibold mb-2">Score Breakdown:</p>
                {result.scoreBreakdown['5-point'].length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-red-700">5-Point Factors:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {result.scoreBreakdown['5-point'].map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {result.scoreBreakdown['3-point'].length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-orange-700">3-Point Factors:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {result.scoreBreakdown['3-point'].map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {result.scoreBreakdown['2-point'].length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium text-yellow-700">2-Point Factors:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {result.scoreBreakdown['2-point'].map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {result.scoreBreakdown['1-point'].length > 0 && (
                  <div>
                    <p className="font-medium text-blue-700">1-Point Factors:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {result.scoreBreakdown['1-point'].map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Clinical Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>

            {/* Prophylaxis Protocol */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Prophylaxis Protocol</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.prophylaxis.map((item: string, index: number) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
            </div>

            {/* Specific Protocols */}
            {result.specificProtocols && result.specificProtocols.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Special Dosing & Protocols</h3>
                <div className="whitespace-pre-line text-sm space-y-1">
                  {result.specificProtocols.map((item: string, index: number) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Recommendations */}
            {result.additionalRecommendations.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Additional Considerations
                </h3>
                <div className="space-y-1 text-sm">
                  {result.additionalRecommendations.map((rec: string, index: number) => (
                    <div key={index}>{rec}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Medications */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Available Medications (Nigeria)</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.availableMedications.map((med: string, index: number) => (
                  <div key={index}>{med}</div>
                ))}
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                Warning Signs - Emergency Evaluation Required
              </h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.warningSigns.map((sign: string, index: number) => (
                  <div key={index} className={sign.includes('⚠️') || sign.includes('EMERGENCY') ? 'font-bold text-red-700' : ''}>{sign}</div>
                ))}
              </div>
            </div>

            {/* Patient Education */}
            {result.educationPoints && result.educationPoints.length > 0 && (
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Patient & Family Education</h3>
                <div className="whitespace-pre-line text-sm space-y-1">
                  {result.educationPoints.map((point: string, index: number) => (
                    <div key={index}>{point}</div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleDownloadPDF}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Comprehensive PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
