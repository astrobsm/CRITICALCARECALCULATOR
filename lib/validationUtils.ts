// Utility functions for input validation and formatting

export const validateNumericInput = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const clampValue = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const getInputClassName = (isValid: boolean, hasValue: boolean): string => {
  const baseClasses = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2";
  
  if (!hasValue) {
    return `${baseClasses} border-gray-300 focus:border-primary-500 focus:ring-primary-200`;
  }
  
  if (isValid) {
    return `${baseClasses} border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200`;
  }
  
  return `${baseClasses} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200`;
};

export const getValidationMessage = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number,
  unit?: string
): string => {
  if (!value) return `${fieldName} is required`;
  
  const num = parseFloat(value);
  if (isNaN(num)) return `Please enter a valid number for ${fieldName}`;
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}${unit ? ' ' + unit : ''}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must not exceed ${max}${unit ? ' ' + unit : ''}`;
  }
  
  return '';
};

// Medical reference ranges
export const REFERENCE_RANGES = {
  sodium: {
    normal: { min: 135, max: 145 },
    mild: { min: 130, max: 134 },
    moderate: { min: 125, max: 129 },
    severe: { min: 0, max: 124 },
    hyperMild: { min: 146, max: 150 },
    hyperModerate: { min: 151, max: 155 },
    hyperSevere: { min: 156, max: 200 },
    unit: 'mEq/L'
  },
  potassium: {
    normal: { min: 3.5, max: 5.0 },
    mild: { min: 3.0, max: 3.4 },
    moderate: { min: 2.5, max: 2.9 },
    severe: { min: 0, max: 2.4 },
    hyperMild: { min: 5.1, max: 5.5 },
    hyperModerate: { min: 5.6, max: 6.0 },
    hyperSevere: { min: 6.1, max: 10 },
    unit: 'mEq/L'
  },
  pH: {
    normal: { min: 7.35, max: 7.45 },
    acidotic: { min: 6.8, max: 7.34 },
    alkalotic: { min: 7.46, max: 7.8 },
    unit: ''
  },
  paCO2: {
    normal: { min: 35, max: 45 },
    low: { min: 10, max: 34 },
    high: { min: 46, max: 100 },
    unit: 'mmHg'
  },
  hco3: {
    normal: { min: 22, max: 26 },
    low: { min: 5, max: 21 },
    high: { min: 27, max: 50 },
    unit: 'mEq/L'
  },
  gfr: {
    normal: { min: 90, max: 200 },
    mildReduction: { min: 60, max: 89 },
    moderate: { min: 30, max: 59 },
    severe: { min: 15, max: 29 },
    failure: { min: 0, max: 14 },
    unit: 'mL/min/1.73m²'
  },
  weight: {
    min: 1,
    max: 300,
    unit: 'kg'
  },
  height: {
    min: 50,
    max: 250,
    unit: 'cm'
  },
  age: {
    min: 0,
    max: 120,
    unit: 'years'
  },
  creatinine: {
    normal: { min: 0.6, max: 1.2 },
    min: 0.1,
    max: 20,
    unit: 'mg/dL'
  },
  tbsa: {
    min: 0,
    max: 100,
    unit: '%'
  }
};

export const getSeverityColor = (value: number, ranges: any): string => {
  if (value >= ranges.normal.min && value <= ranges.normal.max) {
    return 'text-green-600 bg-green-50 border-green-200';
  }
  if (value < ranges.normal.min) {
    if (ranges.severe && value <= ranges.severe.max) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (ranges.moderate && value <= ranges.moderate.max) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
  if (value > ranges.normal.max) {
    if (ranges.hyperSevere && value >= ranges.hyperSevere.min) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (ranges.hyperModerate && value >= ranges.hyperModerate.min) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

export const tooltips = {
  sodium: {
    current: "Current serum sodium level (Normal: 135-145 mEq/L)",
    target: "Desired sodium level - avoid rapid correction (max 8-10 mEq/L per 24h)",
    weight: "Patient body weight in kilograms",
    volume: "Clinical volume assessment: hypovolemic (dehydrated), euvolemic (normal), hypervolemic (fluid overloaded)",
    acute: "Onset <48 hours = acute, >48 hours = chronic. Affects safe correction rate."
  },
  potassium: {
    current: "Current serum potassium level (Normal: 3.5-5.0 mEq/L)",
    target: "Target potassium level - usually 4.0-4.5 mEq/L for most patients",
    ecg: "ECG changes indicate severe hyperkalemia - requires emergency treatment",
    renal: "Kidney function affects potassium excretion and dosing"
  },
  acidBase: {
    ph: "Arterial pH (Normal: 7.35-7.45). <7.35 = acidosis, >7.45 = alkalosis",
    paco2: "Partial pressure of CO₂ (Normal: 35-45 mmHg). Respiratory component",
    hco3: "Bicarbonate level (Normal: 22-26 mEq/L). Metabolic component",
    sodium: "Serum sodium for anion gap calculation",
    chloride: "Serum chloride for anion gap calculation"
  },
  gfr: {
    creatinine: "Serum creatinine level (Normal: 0.6-1.2 mg/dL)",
    age: "Patient age in years - affects GFR calculation",
    weight: "Current body weight - used for Cockcroft-Gault equation",
    height: "Patient height - used for body surface area calculation"
  },
  burns: {
    tbsa: "Total Body Surface Area burned (use Rule of Nines or Lund-Browder chart)",
    weight: "Patient weight for Parkland formula (4 mL/kg/%TBSA)",
    timeSince: "Hours since burn injury - first 8 hours critical for resuscitation"
  },
  nutrition: {
    stress: "Stress factor: Sepsis/ARDS (1.5-1.7), Major trauma (1.4-1.6), Burns (1.5-2.0)",
    activity: "Sedentary (1.2), Light (1.375), Moderate (1.55), Active (1.725), Very Active (1.9)"
  },
  dvt: {
    age: "Age >40 increases VTE risk, especially >75",
    surgery: "Recent major surgery is a significant risk factor",
    mobility: "Immobility/bed rest >3 days increases risk significantly"
  }
};

export const formatTime = (hours: number): string => {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
};

export const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 16) return 'Severely Underweight';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obese Class I';
  if (bmi < 40) return 'Obese Class II';
  return 'Obese Class III';
};

export const getCKDStage = (gfr: number): { stage: string; description: string; color: string } => {
  if (gfr >= 90) {
    return { stage: 'G1', description: 'Normal or High', color: 'text-green-600' };
  } else if (gfr >= 60) {
    return { stage: 'G2', description: 'Mild Reduction', color: 'text-yellow-600' };
  } else if (gfr >= 30) {
    return { stage: 'G3', description: 'Moderate Reduction', color: 'text-orange-600' };
  } else if (gfr >= 15) {
    return { stage: 'G4', description: 'Severe Reduction', color: 'text-red-600' };
  } else {
    return { stage: 'G5', description: 'Kidney Failure', color: 'text-red-800' };
  }
};
