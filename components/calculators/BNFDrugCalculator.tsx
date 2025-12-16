'use client';

import { useState } from 'react';
import { Calculator, Pill, AlertTriangle, CheckCircle, Download, Info } from 'lucide-react';
import { generateBNFPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

interface DrugDosing {
  drug: string;
  indication: string;
  normal: string;
  mild: string;
  moderate: string;
  severe: string;
  dialysis: string;
  notes: string;
}

const commonDrugs: DrugDosing[] = [
  // ANTIBIOTICS - Aminoglycosides
  {
    drug: 'Gentamicin',
    indication: 'Serious Gram-negative infections',
    normal: '5-7 mg/kg/day',
    mild: '5-7 mg/kg q24-36h',
    moderate: '5-7 mg/kg q48h',
    severe: '3-5 mg/kg q48-72h',
    dialysis: 'Load 2-3 mg/kg, then levels',
    notes: 'Monitor levels. Target peak 5-10 mcg/mL, trough <2 mcg/mL'
  },
  {
    drug: 'Amikacin',
    indication: 'Severe Gram-negative infections',
    normal: '15-20 mg/kg/day',
    mild: '15-20 mg/kg q24-36h',
    moderate: '15-20 mg/kg q48h',
    severe: '7.5mg/kg q48-72h',
    dialysis: 'Load, then monitor levels',
    notes: 'Monitor levels. Target peak 25-30 mcg/mL, trough <5 mcg/mL'
  },
  {
    drug: 'Tobramycin',
    indication: 'Pseudomonas infections',
    normal: '5-7 mg/kg/day',
    mild: '5-7 mg/kg q24-36h',
    moderate: '5-7 mg/kg q48h',
    severe: '3-5 mg/kg q48-72h',
    dialysis: 'Load, monitor levels',
    notes: 'Similar to gentamicin. Monitor levels closely'
  },
  
  // ANTIBIOTICS - Glycopeptides
  {
    drug: 'Vancomycin',
    indication: 'MRSA, Gram-positive infections',
    normal: '15-20 mg/kg q8-12h',
    mild: '15-20 mg/kg q12-24h',
    moderate: '15-20 mg/kg q24-48h',
    severe: 'Load 25-30 mg/kg, then levels',
    dialysis: 'Load, redose based on levels',
    notes: 'Target trough 15-20 mcg/mL for serious infections'
  },
  {
    drug: 'Teicoplanin',
    indication: 'MRSA, Gram-positive infections',
    normal: 'Load 6-12mg/kg q12h x3, then 6-12mg/kg daily',
    mild: 'Load 6-12mg/kg q12h x3, then 6-12mg/kg daily',
    moderate: 'Load then 6-12mg/kg q24-48h',
    severe: 'Load then monitor levels',
    dialysis: 'Load then monitor levels',
    notes: 'Less nephrotoxic than vancomycin. Monitor levels'
  },
  
  // ANTIBIOTICS - Cephalosporins
  {
    drug: 'Ceftriaxone',
    indication: 'Broad-spectrum infections',
    normal: '1-2g q12-24h',
    mild: '1-2g q12-24h',
    moderate: '1-2g q12-24h',
    severe: '1-2g q24h (max 2g/day)',
    dialysis: '1-2g q24h',
    notes: 'No dose adjustment needed except in severe renal + hepatic impairment'
  },
  {
    drug: 'Ceftazidime',
    indication: 'Pseudomonas, Gram-negative infections',
    normal: '1-2g q8-12h',
    mild: '1-2g q12h',
    moderate: '1g q12-24h',
    severe: '500mg-1g q24-48h',
    dialysis: '500mg-1g post-dialysis',
    notes: 'Dose reduction needed. Monitor for accumulation'
  },
  {
    drug: 'Cefuroxime',
    indication: 'Respiratory, UTI',
    normal: '750mg-1.5g q8h',
    mild: '750mg-1.5g q8-12h',
    moderate: '750mg q12h',
    severe: '750mg q24h',
    dialysis: 'Extra dose post-dialysis',
    notes: 'Reduce dose in moderate-severe impairment'
  },
  {
    drug: 'Cefepime',
    indication: 'Severe Gram-negative, febrile neutropenia',
    normal: '1-2g q8-12h',
    mild: '1-2g q12h',
    moderate: '1-2g q24h',
    severe: '500mg-1g q24h',
    dialysis: 'Supplemental dose post-dialysis',
    notes: 'Neurotoxicity risk with accumulation'
  },
  
  // ANTIBIOTICS - Carbapenems
  {
    drug: 'Meropenem',
    indication: 'Severe/resistant infections',
    normal: '1g q8h',
    mild: '1g q8h',
    moderate: '500mg-1g q12h',
    severe: '500mg q12-24h',
    dialysis: '500mg q24h',
    notes: 'Reduce dose with GFR <50. Seizure risk with high doses'
  },
  {
    drug: 'Imipenem',
    indication: 'Severe polymicrobial infections',
    normal: '500mg q6h',
    mild: '500mg q6-8h',
    moderate: '250-500mg q6-12h',
    severe: '250mg q12h',
    dialysis: '250mg q12h, dose post-dialysis',
    notes: 'Seizure risk. Reduce dose in renal impairment'
  },
  {
    drug: 'Ertapenem',
    indication: 'Community-acquired infections',
    normal: '1g daily',
    mild: '1g daily',
    moderate: '1g daily',
    severe: '500mg daily',
    dialysis: '500mg daily (post-dialysis)',
    notes: 'Once-daily dosing. Adjust dose if GFR <30'
  },
  
  // ANTIBIOTICS - Penicillins
  {
    drug: 'Piperacillin-Tazobactam',
    indication: 'Severe infections, sepsis',
    normal: '4.5g q6-8h',
    mild: '4.5g q6-8h',
    moderate: '3.375-4.5g q8h',
    severe: '2.25g q8h',
    dialysis: '2.25g q8h, extra dose post-dialysis',
    notes: 'Reduce dose in severe impairment'
  },
  {
    drug: 'Amoxicillin',
    indication: 'Respiratory, UTI',
    normal: '250-500mg q8h',
    mild: '250-500mg q8h',
    moderate: '250-500mg q12h',
    severe: '250-500mg q24h',
    dialysis: 'Extra dose post-dialysis',
    notes: 'Extend interval in renal impairment'
  },
  {
    drug: 'Co-amoxiclav',
    indication: 'Mixed infections',
    normal: '625mg q8h or 1.2g q8h IV',
    mild: '625mg q8h',
    moderate: '625mg q12h',
    severe: '625mg q24h',
    dialysis: 'Extra dose post-dialysis',
    notes: 'Adjust based on amoxicillin component'
  },
  {
    drug: 'Benzylpenicillin',
    indication: 'Streptococcal infections, meningitis',
    normal: '1.2-2.4g q4-6h',
    mild: '1.2-2.4g q4-6h',
    moderate: '1.2-2.4g q6-8h',
    severe: '1.2-2.4g q8-12h',
    dialysis: 'Dose post-dialysis',
    notes: 'High doses in meningitis. Reduce frequency in renal impairment'
  },
  
  // ANTIBIOTICS - Fluoroquinolones
  {
    drug: 'Ciprofloxacin',
    indication: 'UTI, respiratory, GI infections',
    normal: '500-750mg q12h PO, 400mg q8-12h IV',
    mild: '500-750mg q12h',
    moderate: '250-500mg q12h',
    severe: '250-500mg q24h',
    dialysis: '250-500mg post-dialysis',
    notes: 'IV and PO doses need reduction with GFR <30'
  },
  {
    drug: 'Levofloxacin',
    indication: 'Respiratory, UTI',
    normal: '500-750mg daily',
    mild: '500-750mg daily',
    moderate: '250-500mg daily',
    severe: '250mg q48h',
    dialysis: '250mg q48h',
    notes: 'Once-daily dosing. Reduce dose if GFR <50'
  },
  {
    drug: 'Moxifloxacin',
    indication: 'Respiratory infections',
    normal: '400mg daily',
    mild: '400mg daily',
    moderate: '400mg daily',
    severe: '400mg daily',
    dialysis: '400mg daily',
    notes: 'No dose adjustment needed. Hepatic metabolism'
  },
  
  // ANTIBIOTICS - Macrolides
  {
    drug: 'Azithromycin',
    indication: 'Atypical pneumonia, STIs',
    normal: '500mg daily',
    mild: '500mg daily',
    moderate: '500mg daily',
    severe: '500mg daily',
    dialysis: '500mg daily',
    notes: 'No dose adjustment needed'
  },
  {
    drug: 'Clarithromycin',
    indication: 'Respiratory infections, H. pylori',
    normal: '500mg q12h',
    mild: '500mg q12h',
    moderate: '250-500mg q12h',
    severe: '250mg q12-24h',
    dialysis: '250mg daily',
    notes: 'Reduce dose if GFR <30. Check drug interactions'
  },
  
  // ANTIBIOTICS - Others
  {
    drug: 'Metronidazole',
    indication: 'Anaerobic infections, C. diff',
    normal: '400-500mg q8h',
    mild: '400-500mg q8h',
    moderate: '400-500mg q8h',
    severe: '400-500mg q12h',
    dialysis: 'Dose post-dialysis',
    notes: 'Reduce frequency in severe impairment'
  },
  {
    drug: 'Linezolid',
    indication: 'MRSA, VRE',
    normal: '600mg q12h',
    mild: '600mg q12h',
    moderate: '600mg q12h',
    severe: '600mg q12h',
    dialysis: '600mg post-dialysis',
    notes: 'No dose adjustment. Dialyzable - dose after dialysis'
  },
  {
    drug: 'Doxycycline',
    indication: 'Atypical infections, tick-borne diseases',
    normal: '100-200mg daily',
    mild: '100-200mg daily',
    moderate: '100-200mg daily',
    severe: '100-200mg daily',
    dialysis: '100-200mg daily',
    notes: 'No dose adjustment needed'
  },
  {
    drug: 'Trimethoprim',
    indication: 'UTI prophylaxis',
    normal: '200mg q12h or 100mg daily',
    mild: '200mg q12h',
    moderate: '100mg q12h',
    severe: 'Avoid or 100mg daily',
    dialysis: 'Avoid',
    notes: 'Reduce dose. Avoid in severe impairment'
  },
  {
    drug: 'Co-trimoxazole',
    indication: 'PCP, UTI, nocardia',
    normal: '960mg q12h (IV) or 1920mg q12h (PCP)',
    mild: '960mg q12h',
    moderate: '480-960mg q12h',
    severe: 'Avoid or reduce to 480mg q12-24h',
    dialysis: 'Avoid or dose post-dialysis',
    notes: 'High dose for PCP. Reduce in renal impairment'
  },
  
  // ANTIVIRALS
  {
    drug: 'Aciclovir',
    indication: 'HSV, VZV, encephalitis',
    normal: '5-10mg/kg q8h IV',
    mild: '5-10mg/kg q8-12h',
    moderate: '5-10mg/kg q12-24h',
    severe: '2.5-5mg/kg q24h',
    dialysis: 'Dose post-dialysis',
    notes: 'Adjust dose and frequency. Maintain hydration'
  },
  {
    drug: 'Oseltamivir',
    indication: 'Influenza',
    normal: '75mg q12h',
    mild: '75mg q12h',
    moderate: '30-75mg q12h',
    severe: '30mg daily',
    dialysis: '30mg post-dialysis',
    notes: 'Reduce dose if GFR <60. Start within 48h of symptoms'
  },
  
  // ANTIFUNGALS
  {
    drug: 'Fluconazole',
    indication: 'Candida, cryptococcal infections',
    normal: 'Load 400-800mg, then 200-400mg daily',
    mild: 'Load 400-800mg, then 200-400mg daily',
    moderate: '50% dose',
    severe: '25-50% dose',
    dialysis: '100% dose post-dialysis',
    notes: 'Reduce dose by 50% if GFR <50'
  },
  {
    drug: 'Amphotericin B',
    indication: 'Severe fungal infections',
    normal: '0.5-1.5mg/kg daily',
    mild: '0.5-1.5mg/kg daily',
    moderate: '0.5-1.5mg/kg daily',
    severe: '0.5-1.5mg/kg daily (monitor closely)',
    dialysis: 'Not dialyzed',
    notes: 'Nephrotoxic. Monitor renal function closely. Liposomal form preferred'
  },
  
  // CARDIOVASCULAR - Beta Blockers
  {
    drug: 'Atenolol',
    indication: 'Hypertension, angina, AF',
    normal: '25-100mg daily',
    mild: '25-50mg daily',
    moderate: '25mg daily or q48h',
    severe: '25mg q48h',
    dialysis: '25-50mg post-dialysis',
    notes: 'Primarily renally excreted. Consider alternative beta-blocker'
  },
  {
    drug: 'Bisoprolol',
    indication: 'Heart failure, hypertension',
    normal: '2.5-10mg daily',
    mild: '2.5-10mg daily',
    moderate: '2.5-5mg daily',
    severe: 'Start 1.25mg, max 10mg',
    dialysis: 'Start 1.25mg',
    notes: 'Caution in severe impairment. Dose adjustment not usually needed'
  },
  {
    drug: 'Metoprolol',
    indication: 'Hypertension, MI, AF',
    normal: '50-200mg daily',
    mild: '50-200mg daily',
    moderate: '50-200mg daily',
    severe: '50-200mg daily',
    dialysis: 'Not dialyzed',
    notes: 'No dose adjustment needed. Hepatic metabolism'
  },
  
  // CARDIOVASCULAR - ACE Inhibitors
  {
    drug: 'Ramipril',
    indication: 'Hypertension, heart failure',
    normal: '2.5-10mg daily',
    mild: '2.5-10mg daily',
    moderate: 'Start 1.25mg, max 5mg',
    severe: 'Start 1.25mg, max 5mg',
    dialysis: 'Avoid or start 1.25mg',
    notes: 'Monitor K+ and creatinine. Reduce dose in impairment'
  },
  {
    drug: 'Enalapril',
    indication: 'Hypertension, heart failure',
    normal: '5-40mg daily',
    mild: '5-40mg daily',
    moderate: '2.5-5mg initially',
    severe: '2.5mg initially',
    dialysis: '2.5mg post-dialysis',
    notes: 'Start low. Monitor renal function and K+'
  },
  {
    drug: 'Lisinopril',
    indication: 'Hypertension, heart failure',
    normal: '10-40mg daily',
    mild: '5-10mg initially',
    moderate: '2.5-5mg initially',
    severe: '2.5mg initially',
    dialysis: '2.5mg post-dialysis',
    notes: 'Renally excreted. Reduce dose in impairment'
  },
  
  // CARDIOVASCULAR - Diuretics
  {
    drug: 'Furosemide',
    indication: 'Edema, heart failure',
    normal: '20-80mg daily',
    mild: '20-80mg daily',
    moderate: '40-160mg daily',
    severe: '80-240mg daily (higher doses)',
    dialysis: 'High doses, limited effect',
    notes: 'Higher doses needed in renal impairment. Monitor electrolytes'
  },
  {
    drug: 'Bumetanide',
    indication: 'Edema, heart failure',
    normal: '0.5-2mg daily',
    mild: '0.5-2mg daily',
    moderate: '1-4mg daily',
    severe: '2-5mg daily',
    dialysis: 'Not effectively dialyzed',
    notes: 'More potent than furosemide. Higher doses in renal impairment'
  },
  {
    drug: 'Spironolactone',
    indication: 'Heart failure, ascites',
    normal: '25-200mg daily',
    mild: '25-100mg daily',
    moderate: '25-50mg daily, monitor K+',
    severe: 'Avoid or 25mg alternate days',
    dialysis: 'Avoid',
    notes: 'Risk of hyperkalemia. Monitor K+ closely'
  },
  
  // CARDIOVASCULAR - Others
  {
    drug: 'Digoxin',
    indication: 'Heart failure, AF',
    normal: '0.125-0.25mg daily',
    mild: '0.0625-0.125mg daily',
    moderate: '0.0625mg daily',
    severe: '0.0625mg alternate days',
    dialysis: 'Monitor levels',
    notes: 'Reduce dose by 50%. Target level 0.5-1.0 ng/mL'
  },
  {
    drug: 'Amiodarone',
    indication: 'Arrhythmias',
    normal: 'Load 200mg tds x1wk, then 200mg daily',
    mild: 'No adjustment',
    moderate: 'No adjustment',
    severe: 'No adjustment',
    dialysis: 'Not dialyzed',
    notes: 'No dose adjustment needed. Monitor thyroid and liver'
  },
  
  // DIABETES
  {
    drug: 'Metformin',
    indication: 'Type 2 Diabetes',
    normal: '500-2000mg/day in divided doses',
    mild: '500-1000mg/day',
    moderate: 'CONTRAINDICATED',
    severe: 'CONTRAINDICATED',
    dialysis: 'CONTRAINDICATED',
    notes: 'Stop if GFR <30. Risk of lactic acidosis'
  },
  {
    drug: 'Gliclazide',
    indication: 'Type 2 Diabetes',
    normal: '40-320mg daily',
    mild: '40-320mg daily',
    moderate: '40-160mg daily',
    severe: 'Start 40mg, caution',
    dialysis: 'Avoid or use with caution',
    notes: 'Risk of hypoglycemia. Reduce dose in impairment'
  },
  {
    drug: 'Sitagliptin',
    indication: 'Type 2 Diabetes',
    normal: '100mg daily',
    mild: '100mg daily',
    moderate: '50mg daily',
    severe: '25mg daily',
    dialysis: '25mg daily',
    notes: 'Dose reduction required if GFR <50'
  },
  
  // ANTICOAGULANTS
  {
    drug: 'Enoxaparin',
    indication: 'DVT prophylaxis/treatment',
    normal: '40mg daily (prophylaxis), 1mg/kg q12h (treatment)',
    mild: '40mg daily',
    moderate: '30mg daily or monitor anti-Xa',
    severe: 'Avoid or use UFH instead',
    dialysis: 'Avoid - use UFH',
    notes: 'Treatment dose: 1mg/kg q12h (reduce to daily if GFR<30)'
  },
  {
    drug: 'Rivaroxaban',
    indication: 'DVT, PE, AF',
    normal: '15-20mg daily',
    mild: '15-20mg daily',
    moderate: '15mg daily',
    severe: 'Avoid',
    dialysis: 'CONTRAINDICATED',
    notes: 'Contraindicated if GFR <15. Reduce to 15mg if GFR 15-49'
  },
  {
    drug: 'Apixaban',
    indication: 'DVT, PE, AF',
    normal: '5mg q12h or 2.5mg q12h',
    mild: '5mg q12h',
    moderate: '5mg q12h (2.5mg if 2+ risk factors)',
    severe: 'Use with caution',
    dialysis: 'Avoid',
    notes: 'Reduce to 2.5mg q12h if SCr >133 + age >80 or weight <60kg'
  },
  {
    drug: 'Dabigatran',
    indication: 'DVT, PE, AF',
    normal: '150mg q12h',
    mild: '150mg q12h or 110mg q12h',
    moderate: '110mg q12h',
    severe: 'CONTRAINDICATED',
    dialysis: 'CONTRAINDICATED',
    notes: 'Contraindicated if GFR <30. Primarily renally excreted'
  },
  
  // ANALGESICS
  {
    drug: 'Morphine',
    indication: 'Severe pain',
    normal: '5-10mg q4h PRN',
    mild: '5-10mg q4-6h',
    moderate: '2.5-5mg q6-8h',
    severe: 'Avoid or use alternative',
    dialysis: 'Avoid - metabolites accumulate',
    notes: 'Active metabolite accumulates. Consider oxycodone/fentanyl'
  },
  {
    drug: 'Oxycodone',
    indication: 'Moderate-severe pain',
    normal: '5-10mg q4-6h',
    mild: '5-10mg q6h',
    moderate: 'Start low, 50-75% dose',
    severe: 'Start low, 50% dose',
    dialysis: 'Use with caution',
    notes: 'Safer than morphine in renal impairment. Start low'
  },
  {
    drug: 'Fentanyl',
    indication: 'Severe pain, anesthesia',
    normal: '25-100mcg/hr patch or titrate IV',
    mild: 'No adjustment',
    moderate: 'No adjustment',
    severe: 'No adjustment but monitor',
    dialysis: 'Not dialyzed',
    notes: 'Safest opioid in renal impairment. Hepatic metabolism'
  },
  {
    drug: 'Tramadol',
    indication: 'Moderate pain',
    normal: '50-100mg q6h, max 400mg/day',
    mild: '50-100mg q6h',
    moderate: '50mg q8-12h',
    severe: '50mg q12h',
    dialysis: 'Avoid or 50mg q12h',
    notes: 'Reduce dose and frequency. Seizure risk'
  },
  {
    drug: 'Paracetamol',
    indication: 'Pain, fever',
    normal: '1g q4-6h, max 4g/day',
    mild: '1g q4-6h',
    moderate: '1g q4-6h',
    severe: '1g q6h',
    dialysis: '1g q6h',
    notes: 'Extend interval to q6h in severe impairment'
  },
  
  // ANTICONVULSANTS
  {
    drug: 'Gabapentin',
    indication: 'Neuropathic pain, epilepsy',
    normal: '300-3600mg/day in divided doses',
    mild: '200-700mg q12h',
    moderate: '100-300mg q12-24h',
    severe: '100-300mg daily',
    dialysis: '100-300mg post-dialysis',
    notes: 'Significant dose reduction required. Renally excreted'
  },
  {
    drug: 'Pregabalin',
    indication: 'Neuropathic pain, epilepsy',
    normal: '150-600mg/day in divided doses',
    mild: '75-300mg q12h',
    moderate: '25-150mg q12-24h',
    severe: '25-75mg daily',
    dialysis: 'Supplemental dose post-dialysis',
    notes: 'Renally excreted. Significant dose reduction needed'
  },
  {
    drug: 'Levetiracetam',
    indication: 'Epilepsy',
    normal: '500-1500mg q12h',
    mild: '500-1500mg q12h',
    moderate: '250-750mg q12h',
    severe: '250-500mg q12h',
    dialysis: 'Supplemental dose post-dialysis',
    notes: 'Reduce dose if GFR <80. Minimal drug interactions'
  },
  {
    drug: 'Phenytoin',
    indication: 'Seizures, status epilepticus',
    normal: 'Load 15-20mg/kg, maintain 300mg daily',
    mild: 'No adjustment',
    moderate: 'No adjustment',
    severe: 'Monitor free levels',
    dialysis: 'Monitor free levels',
    notes: 'Protein binding altered. Monitor free drug levels in severe impairment'
  },
  
  // GASTROINTESTINAL
  {
    drug: 'Omeprazole',
    indication: 'GERD, PUD, stress ulcer prophylaxis',
    normal: '20-40mg daily',
    mild: '20-40mg daily',
    moderate: '20-40mg daily',
    severe: '20-40mg daily',
    dialysis: 'No adjustment',
    notes: 'No dose adjustment needed. Hepatic metabolism'
  },
  {
    drug: 'Lansoprazole',
    indication: 'GERD, PUD',
    normal: '15-30mg daily',
    mild: '15-30mg daily',
    moderate: '15-30mg daily',
    severe: '15-30mg daily',
    dialysis: 'No adjustment',
    notes: 'No dose adjustment needed'
  },
  {
    drug: 'Ranitidine (if available)',
    indication: 'GERD, PUD',
    normal: '150mg q12h or 300mg at night',
    mild: '150mg q12h',
    moderate: '150mg daily',
    severe: '150mg alternate days',
    dialysis: 'Dose post-dialysis',
    notes: 'Reduce dose if GFR <50. Many regions discontinued'
  },
  
  // PSYCHIATRIC
  {
    drug: 'Quetiapine',
    indication: 'Psychosis, bipolar, agitation',
    normal: '25-800mg/day in divided doses',
    mild: 'No adjustment',
    moderate: 'No adjustment',
    severe: 'Start low, titrate carefully',
    dialysis: 'Not dialyzed',
    notes: 'No dose adjustment but start low and titrate'
  },
  {
    drug: 'Haloperidol',
    indication: 'Acute agitation, delirium',
    normal: '0.5-5mg q2-8h PRN',
    mild: 'No adjustment',
    moderate: 'No adjustment',
    severe: 'No adjustment',
    dialysis: 'Not dialyzed',
    notes: 'No dose adjustment needed. Monitor QTc'
  },
  {
    drug: 'Lithium',
    indication: 'Bipolar disorder',
    normal: '400-1200mg daily (target 0.6-1.0 mmol/L)',
    mild: 'Reduce dose, monitor levels',
    moderate: 'Avoid or 50% dose with frequent monitoring',
    severe: 'CONTRAINDICATED',
    dialysis: 'CONTRAINDICATED (dialyzable)',
    notes: 'Narrow therapeutic index. Contraindicated in moderate-severe impairment'
  }
];

export default function BNFDrugCalculator({ patientInfo }: PatientInfoProps) {
  const [gfr, setGfr] = useState<string>('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const calculateDosing = () => {
    const gfrValue = parseFloat(gfr);
    
    if (isNaN(gfrValue) || gfrValue < 0) {
      alert('Please enter a valid GFR value');
      return;
    }

    if (selectedDrugs.length === 0) {
      alert('Please select at least one medication');
      return;
    }

    // Check for drug-comorbidity interactions
    const hasDiabetes = patientInfo.comorbidities.includes('Diabetes Mellitus');
    const hasHeartFailure = patientInfo.comorbidities.includes('Heart Failure');
    const hasLiverDisease = patientInfo.comorbidities.includes('Liver Cirrhosis');
    const hasCOPD = patientInfo.comorbidities.includes('COPD');

    let drugWarnings: string[] = [];
    
    selectedDrugs.forEach(drug => {
      if (drug.includes('Metformin') && gfrValue < 30) {
        drugWarnings.push('METFORMIN: CONTRAINDICATED with GFR <30. Use alternative.');
      }
      if (drug.includes('NSAID') && hasHeartFailure) {
        drugWarnings.push('NSAIDs: CAUTION in heart failure - may cause fluid retention.');
      }
      if (drug.includes('Gentamicin') || drug.includes('Amikacin')) {
        drugWarnings.push('Aminoglycosides: Monitor levels closely. Nephrotoxic.');
      }
      if (hasLiverDisease && (drug.includes('Paracetamol') || drug.includes('Rifampicin'))) {
        drugWarnings.push(`${drug}: Reduce dose in liver disease. Monitor LFTs.`);
      }
      if (hasCOPD && drug.includes('Propranolol')) {
        drugWarnings.push('Beta-blockers: AVOID non-selective in COPD. Use cardioselective.');
      }
    });

    // Determine renal function category
    let category = 'normal';
    let categoryLabel = 'Normal Renal Function';
    let categoryClass = 'text-green-600';
    let ckdStage = 'G1/G2';

    if (gfrValue >= 60) {
      category = 'normal';
      categoryLabel = 'Normal/Mild Impairment';
      categoryClass = 'text-green-600';
      ckdStage = 'G1/G2';
    } else if (gfrValue >= 30) {
      category = 'moderate';
      categoryLabel = 'Moderate Impairment';
      categoryClass = 'text-orange-600';
      ckdStage = 'G3';
    } else if (gfrValue >= 15) {
      category = 'severe';
      categoryLabel = 'Severe Impairment';
      categoryClass = 'text-danger-600';
      ckdStage = 'G4';
    } else {
      category = 'dialysis';
      categoryLabel = 'Kidney Failure';
      categoryClass = 'text-danger-600';
      ckdStage = 'G5';
    }

    const recommendations = selectedDrugs.map(drugName => {
      const drug = commonDrugs.find(d => d.drug === drugName);
      if (!drug) return null;

      let recommendedDose = '';
      if (gfrValue >= 60) {
        recommendedDose = drug.mild || drug.normal;
      } else if (gfrValue >= 30) {
        recommendedDose = drug.moderate;
      } else if (gfrValue >= 15) {
        recommendedDose = drug.severe;
      } else {
        recommendedDose = drug.dialysis;
      }

      return {
        ...drug,
        recommendedDose,
        requiresAdjustment: recommendedDose !== drug.normal
      };
    }).filter(Boolean);

    setResult({
      gfr: gfrValue,
      category,
      categoryLabel,
      categoryClass,
      ckdStage,
      recommendations,
      drugWarnings,
      comorbidities: patientInfo.comorbidities
    });
  };

  const toggleDrug = (drugName: string) => {
    if (selectedDrugs.includes(drugName)) {
      setSelectedDrugs(selectedDrugs.filter(d => d !== drugName));
    } else {
      setSelectedDrugs([...selectedDrugs, drugName]);
    }
  };

  const filteredDrugs = commonDrugs.filter(drug => 
    drug.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.indication.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = () => {
    if (result) {
      generateBNFPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">BNF Drug Dosing Calculator</h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-6 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700">
          <strong>Important:</strong> This calculator provides general guidance for renal dose adjustment based on BNF guidelines.
          Always check current BNF/local formulary, consider individual patient factors, and monitor drug levels where appropriate.
        </p>
      </div>

      {/* GFR Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Patient's eGFR (mL/min/1.73m²) *
        </label>
        <input
          type="number"
          step="0.1"
          value={gfr}
          onChange={(e) => setGfr(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter GFR value (e.g., 45)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Calculate GFR using the GFR Calculator tab if needed
        </p>
      </div>

      {/* Drug Search */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Medications
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search by drug name or indication..."
        />
      </div>

      {/* Drug Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Medications ({selectedDrugs.length} selected)
        </label>
        <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
          {filteredDrugs.map((drug) => (
            <label
              key={drug.drug}
              className={`flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                selectedDrugs.includes(drug.drug) ? 'bg-primary-50 border border-primary-300' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedDrugs.includes(drug.drug)}
                onChange={() => toggleDrug(drug.drug)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-sm">{drug.drug}</div>
                <div className="text-xs text-gray-600">{drug.indication}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={calculateDosing}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate Dosing Recommendations
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Renal Function Status */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg border-l-4 border-primary-600">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Renal Function Assessment</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">eGFR</p>
                <p className="text-2xl font-bold text-primary-600">{result.gfr} mL/min/1.73m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CKD Stage</p>
                <p className={`text-2xl font-bold ${result.categoryClass}`}>{result.ckdStage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Classification</p>
                <p className={`text-lg font-bold ${result.categoryClass}`}>{result.categoryLabel}</p>
              </div>
            </div>
          </div>

          {/* Drug Warnings */}
          {result.drugWarnings && result.drugWarnings.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Drug-Comorbidity Warnings
              </h4>
              <ul className="space-y-2">
                {result.drugWarnings.map((warning: string, index: number) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dosing Recommendations */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="w-6 h-6 text-primary-600" />
              Dosing Recommendations
            </h3>
            <div className="space-y-4">
              {result.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    rec.requiresAdjustment ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{rec.drug}</h4>
                      <p className="text-sm text-gray-600">{rec.indication}</p>
                    </div>
                    {rec.requiresAdjustment ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Normal Dose</p>
                      <p className="font-semibold text-gray-700">{rec.normal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Recommended Dose for GFR {result.gfr}</p>
                      <p className={`font-bold ${rec.requiresAdjustment ? 'text-yellow-700' : 'text-green-700'}`}>
                        {rec.recommendedDose}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Clinical Notes:</p>
                    <p className="text-sm text-gray-700">{rec.notes}</p>
                  </div>

                  {rec.recommendedDose.includes('CONTRAINDICATED') && (
                    <div className="mt-2 bg-red-100 border border-red-300 p-2 rounded flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-sm font-bold text-red-700">
                        CONTRAINDICATED in this level of renal impairment
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Guidance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">General Prescribing Guidance in Renal Impairment</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Always check current BNF or local formulary for latest guidance</li>
              <li>• Monitor renal function regularly - deterioration may require further dose adjustment</li>
              <li>• Consider drug interactions and other patient factors (age, weight, comorbidities)</li>
              <li>• For drugs with narrow therapeutic index (digoxin, gentamicin, vancomycin), monitor levels</li>
              <li>• Avoid nephrotoxic drugs when possible (NSAIDs, aminoglycosides)</li>
              <li>• Monitor for adverse effects - increased risk with renal impairment</li>
              <li>• Consult pharmacist or renal specialist for complex cases</li>
            </ul>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Dosing Report PDF
          </button>
        </div>
      )}
    </div>
  );
}
