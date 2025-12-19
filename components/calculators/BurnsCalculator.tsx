'use client';

import { useState } from 'react';
import { Calculator, Flame, Droplets, AlertCircle, CheckCircle, Download, Info } from 'lucide-react';
import { generateBurnsPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

interface BurnArea {
  area: string;
  percentage: number;
}

export default function BurnsCalculator({ patientInfo }: PatientInfoProps) {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<'adult' | 'child'>('adult');
  const [burnType, setBurnType] = useState<'thermal' | 'electrical' | 'chemical'>('thermal');
  const [chemicalAgent, setChemicalAgent] = useState<string>('');
  const [electricalVoltage, setElectricalVoltage] = useState<string>('');
  
  // Body areas for Rule of Nines
  const [head, setHead] = useState<number>(0);
  const [torsoFront, setTorsoFront] = useState<number>(0);
  const [torsoBack, setTorsoBack] = useState<number>(0);
  const [armRight, setArmRight] = useState<number>(0);
  const [armLeft, setArmLeft] = useState<number>(0);
  const [legRight, setLegRight] = useState<number>(0);
  const [legLeft, setLegLeft] = useState<number>(0);
  const [perineum, setPerineum] = useState<number>(0);
  
  // Sepsis monitoring
  const [temperature, setTemperature] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [respiratoryRate, setRespiratoryRate] = useState<string>('');
  const [wbcCount, setWbcCount] = useState<string>('');
  const [hasSepsisSign, setHasSepsisSign] = useState<boolean>(false);

  const [result, setResult] = useState<any>(null);

  const calculateBurns = () => {
    const wt = parseFloat(weight);
    const patientAge = parseFloat(age);

    if (isNaN(wt) || wt <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    // Calculate total BSA burned
    const totalBSA = head + torsoFront + torsoBack + armRight + armLeft + legRight + legLeft + perineum;

    if (totalBSA === 0) {
      alert('Please select at least one burned area');
      return;
    }

    // Parkland Formula: 4ml × weight(kg) × %BSA burned
    const totalFluid24h = 4 * wt * totalBSA;
    const first8h = totalFluid24h / 2;
    const next16h = totalFluid24h / 2;
    const hourlyRateFirst8h = first8h / 8;
    const hourlyRateNext16h = next16h / 16;

    // Maintenance fluids (Day 2 onwards) - Holliday-Segar formula
    let maintenanceFluid24h = 0;
    if (gender === 'child') {
      if (wt <= 10) {
        maintenanceFluid24h = 100 * wt;
      } else if (wt <= 20) {
        maintenanceFluid24h = 1000 + (50 * (wt - 10));
      } else {
        maintenanceFluid24h = 1500 + (20 * (wt - 20));
      }
    } else {
      // Adult maintenance: 25-30ml/kg/day
      maintenanceFluid24h = 30 * wt;
    }

    // Calculate Body Surface Area (BSA) using simplified DuBois formula
    // Assuming average height: Adult male ~170cm, child height by age
    const estimatedHeight = gender === 'child' ? (patientAge * 6 + 77) : 170;
    const bsaM2 = 0.007184 * Math.pow(wt, 0.425) * Math.pow(estimatedHeight, 0.725);
    
    // Evaporative losses from burn wound: (25 + %TBSA) × BSA(m²) per hour
    const evaporativeLossPerHour = (25 + totalBSA) * bsaM2;
    const evaporativeLosses = evaporativeLossPerHour * 24;
    
    // Total Day 2+ fluid requirement
    const day2FluidTotal = maintenanceFluid24h + evaporativeLosses;
    const day2HourlyRate = Math.round(day2FluidTotal / 24);

    // Day 3-7 fluids (gradual reduction)
    const day3to7Fluid = maintenanceFluid24h + (evaporativeLosses * 0.75);
    const day3to7HourlyRate = Math.round(day3to7Fluid / 24);

    // Colloid requirements (from 8-24 hours onwards)
    const colloidVolume8to24h = totalBSA > 30 ? (0.3 * wt * totalBSA) : 0;
    const colloidDay2 = totalBSA > 30 ? (0.3 * wt * totalBSA * 0.5) : 0;

    // Consider comorbidities for fluid adjustments
    const hasHeartFailure = patientInfo.comorbidities.includes('Heart Failure');
    const hasCKD = patientInfo.comorbidities.includes('Chronic Kidney Disease');
    const hasDiabetes = patientInfo.comorbidities.includes('Diabetes Mellitus');
    
    let fluidWarning = '';
    if (hasHeartFailure) {
      fluidWarning = 'CAUTION: Heart failure - Monitor closely for fluid overload. Consider reduced rates.';
    } else if (hasCKD) {
      fluidWarning = 'CAUTION: Chronic kidney disease - Monitor urine output, electrolytes, and fluid balance closely.';
    }

    // Determine burn severity
    let severity = 'Minor';
    let severityClass = 'text-green-600';
    let admission = 'Outpatient management possible';

    if (totalBSA > 20 || (totalBSA > 10 && gender === 'child')) {
      severity = 'Major';
      severityClass = 'text-danger-600';
      admission = 'IMMEDIATE ICU/Burns Unit admission required';
    } else if (totalBSA > 10) {
      severity = 'Moderate';
      severityClass = 'text-orange-600';
      admission = 'Hospital admission recommended';
    }

    // Nutritional requirements (Curreri formula)
    const basalCalories = gender === 'child' ? 60 * wt : 25 * wt;
    const burnCalories = 40 * totalBSA;
    const totalCalories = basalCalories + burnCalories;
    const proteinRequirement = (totalBSA < 20) ? 1.5 * wt : 2.5 * wt;

    // Monitor urine output target
    const urineOutputTarget = gender === 'child' ? 1.0 * wt : 0.5 * wt;

    const calculationResult = {
      weight: wt,
      age: patientAge,
      gender,
      totalBSA: totalBSA.toFixed(1),
      severity,
      severityClass,
      admission,
      totalFluid24h: totalFluid24h.toFixed(0),
      first8h: first8h.toFixed(0),
      next16h: next16h.toFixed(0),
      hourlyRateFirst8h: hourlyRateFirst8h.toFixed(0),
      hourlyRateNext16h: hourlyRateNext16h.toFixed(0),
      colloidVolume8to24h: colloidVolume8to24h.toFixed(0),
      colloidDay2: colloidDay2.toFixed(0),
      maintenanceFluid24h: maintenanceFluid24h.toFixed(0),
      evaporativeLosses: evaporativeLosses.toFixed(0),
      day2FluidTotal: day2FluidTotal.toFixed(0),
      day2HourlyRate: day2HourlyRate.toFixed(0),
      day3to7Fluid: day3to7Fluid.toFixed(0),
      day3to7HourlyRate: day3to7HourlyRate.toFixed(0),
      totalCalories: totalCalories.toFixed(0),
      proteinRequirement: proteinRequirement.toFixed(0),
      urineOutputTarget: urineOutputTarget.toFixed(1),
      fluidWarning,
      comorbidities: patientInfo.comorbidities,
      hasDiabetes,
      burnAreas: [
        { area: 'Head', percentage: head },
        { area: 'Torso (Front)', percentage: torsoFront },
        { area: 'Torso (Back)', percentage: torsoBack },
        { area: 'Right Arm', percentage: armRight },
        { area: 'Left Arm', percentage: armLeft },
        { area: 'Right Leg', percentage: legRight },
        { area: 'Left Leg', percentage: legLeft },
        { area: 'Perineum', percentage: perineum },
      ].filter(area => area.percentage > 0)
    };

    setResult(calculationResult);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateBurnsPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-800">Burns Assessment & Fluid Calculator</h2>
      </div>

      <div className="bg-orange-50 p-4 rounded-md mb-6 flex items-start gap-2">
        <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">Parkland Formula for Fluid Resuscitation:</p>
          <p>First 24 hours: 4ml × weight(kg) × %BSA burned</p>
          <p className="mt-1"><strong>Give half in first 8 hours, remaining half over next 16 hours</strong></p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Patient Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="e.g., 70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="e.g., 35"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Patient Type *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'adult' | 'child')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </div>
        </div>

        {/* Rule of Nines - Upper Body */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Burned Areas - Upper Body</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Head & Neck ({gender === 'child' ? '18%' : '9%'})
            </label>
            <input
              type="number"
              step="0.5"
              max={gender === 'child' ? 18 : 9}
              value={head}
              onChange={(e) => setHead(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Torso - Front (18%)
            </label>
            <input
              type="number"
              step="0.5"
              max="18"
              value={torsoFront}
              onChange={(e) => setTorsoFront(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Torso - Back (18%)
            </label>
            <input
              type="number"
              step="0.5"
              max="18"
              value={torsoBack}
              onChange={(e) => setTorsoBack(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>
        </div>

        {/* Rule of Nines - Lower Body */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Burned Areas - Limbs</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Right Arm (9%)
            </label>
            <input
              type="number"
              step="0.5"
              max="9"
              value={armRight}
              onChange={(e) => setArmRight(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Left Arm (9%)
            </label>
            <input
              type="number"
              step="0.5"
              max="9"
              value={armLeft}
              onChange={(e) => setArmLeft(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Right Leg ({gender === 'child' ? '13.5%' : '18%'})
            </label>
            <input
              type="number"
              step="0.5"
              max={gender === 'child' ? 13.5 : 18}
              value={legRight}
              onChange={(e) => setLegRight(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Left Leg ({gender === 'child' ? '13.5%' : '18%'})
            </label>
            <input
              type="number"
              step="0.5"
              max={gender === 'child' ? 13.5 : 18}
              value={legLeft}
              onChange={(e) => setLegLeft(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Perineum (1%)
            </label>
            <input
              type="number"
              step="0.5"
              max="1"
              value={perineum}
              onChange={(e) => setPerineum(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <button
        onClick={calculateBurns}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate Fluid Requirements
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Burn Assessment */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-l-4 border-orange-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-600" />
              Burn Assessment
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm text-gray-600">Total BSA Burned</p>
                <p className="text-3xl font-bold text-orange-600">{result.totalBSA}%</p>
              </div>
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm text-gray-600">Severity</p>
                <p className={`text-2xl font-bold ${result.severityClass}`}>{result.severity}</p>
              </div>
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm text-gray-600">Patient Weight</p>
                <p className="text-2xl font-bold text-gray-700">{result.weight} kg</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md">
              <p className="font-semibold text-gray-700 mb-2">Affected Areas:</p>
              <div className="grid md:grid-cols-2 gap-2">
                {result.burnAreas.map((area: BurnArea, index: number) => (
                  <div key={index} className="text-sm text-gray-700">
                    • {area.area}: <strong>{area.percentage}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={`mt-4 p-3 rounded border-l-4 ${
              result.severity === 'Major' ? 'bg-red-100 border-red-600' : 
              result.severity === 'Moderate' ? 'bg-orange-100 border-orange-600' : 
              'bg-green-100 border-green-600'
            }`}>
              <p className="font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {result.admission}
              </p>
            </div>
          </div>

          {/* Fluid Resuscitation */}
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-blue-600" />
              Fluid Resuscitation Protocol
            </h3>

            {/* Comorbidity Warning */}
            {result.fluidWarning && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-600 rounded">
                <p className="font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {result.fluidWarning}
                </p>
              </div>
            )}

            {/* Diabetes Warning */}
            {result.hasDiabetes && (
              <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded">
                <p className="font-bold text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  DIABETES: Monitor blood glucose closely. Target 6-10 mmol/L. May need insulin infusion.
                </p>
              </div>
            )}

            {/* Day 1 - Parkland Formula */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">DAY 1 (First 24 hours) - Parkland Formula</h4>
              
              <div className="bg-white p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600 mb-2">Total Fluid Required (First 24 hours)</p>
                <p className="text-3xl font-bold text-blue-600">{result.totalFluid24h} mL</p>
                <p className="text-xs text-gray-500 mt-1">Preferred Fluid: <strong>Ringer's Lactate</strong> (Hartmann's solution)</p>
                <p className="text-xs text-gray-400 mt-1">Parkland Formula: 4mL × {result.weight}kg × {result.totalBSA}% BSA</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-md border-2 border-yellow-400">
                  <p className="font-bold text-gray-800 mb-2">FIRST 8 HOURS (from time of burn):</p>
                  <p className="text-2xl font-bold text-yellow-700">{result.first8h} mL</p>
                  <p className="text-sm text-gray-700 mt-2">Rate: <strong>{result.hourlyRateFirst8h} mL/hour</strong></p>
                </div>

                <div className="bg-blue-100 p-4 rounded-md border-2 border-blue-400">
                  <p className="font-bold text-gray-800 mb-2">NEXT 16 HOURS:</p>
                  <p className="text-2xl font-bold text-blue-700">{result.next16h} mL</p>
                  <p className="text-sm text-gray-700 mt-2">Rate: <strong>{result.hourlyRateNext16h} mL/hour</strong></p>
                </div>
              </div>

              {parseFloat(result.colloidVolume8to24h) > 0 && (
                <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-300">
                  <p className="font-bold text-gray-800 mb-2">COLLOID (Hours 8-24 for severe burns):</p>
                  <p className="text-lg font-bold text-purple-700">{result.colloidVolume8to24h} mL Albumin 5% or FFP</p>
                  <p className="text-xs text-gray-600 mt-1">Indicated for burns {'>'}30% BSA to maintain oncotic pressure</p>
                </div>
              )}
            </div>

            {/* Day 2 */}
            <div className="mb-6 border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">DAY 2 (24-48 hours post-burn)</h4>
              
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="bg-white p-4 rounded-md border border-blue-300">
                  <p className="text-sm text-gray-600 mb-1">Total Daily Fluid</p>
                  <p className="text-2xl font-bold text-blue-600">{result.day2FluidTotal} mL/day</p>
                  <p className="text-sm text-gray-700 mt-2">Rate: <strong>{result.day2HourlyRate} mL/hour</strong></p>
                </div>

                <div className="bg-white p-4 rounded-md border border-blue-300">
                  <p className="text-sm text-gray-600 mb-1">Breakdown</p>
                  <p className="text-sm text-gray-700">Maintenance: {result.maintenanceFluid24h} mL</p>
                  <p className="text-sm text-gray-700">Evaporative loss: {result.evaporativeLosses} mL</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-md border border-green-300">
                <p className="font-bold text-gray-800 mb-2">Fluid Types for Day 2:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Crystalloid:</strong> 0.45% Saline or 5% Dextrose in 0.45% Saline (2/3 of total)</li>
                  <li>• <strong>Colloid:</strong> {result.colloidDay2} mL Albumin 5% or FFP (1/3 of total, if BSA {'>'}30%)</li>
                  <li>• Transition from resuscitation to maintenance + evaporative losses</li>
                </ul>
              </div>
            </div>

            {/* Days 3-7 */}
            <div className="mb-4 border-t-2 border-gray-300 pt-4">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">DAYS 3-7 (Maintenance Phase)</h4>
              
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="bg-white p-4 rounded-md border border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Total Daily Fluid</p>
                  <p className="text-2xl font-bold text-green-600">{result.day3to7Fluid} mL/day</p>
                  <p className="text-sm text-gray-700 mt-2">Rate: <strong>{result.day3to7HourlyRate} mL/hour</strong></p>
                </div>

                <div className="bg-white p-4 rounded-md border border-green-300">
                  <p className="text-sm text-gray-600 mb-1">Evaporative Loss Reduction</p>
                  <p className="text-sm text-gray-700">75% of Day 2 evaporative loss</p>
                  <p className="text-sm text-gray-700">As wound healing progresses</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-md border border-indigo-300">
                <p className="font-bold text-gray-800 mb-2">Fluid Types for Days 3-7:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Primary:</strong> 5% Dextrose in 0.45% Saline or 0.9% Normal Saline</li>
                  <li>• <strong>Colloid:</strong> Consider if serum albumin {'<'}2.5 g/dL</li>
                  <li>• <strong>Enteral fluids:</strong> Encourage oral intake as tolerated</li>
                  <li>• Adjust based on urine output, electrolytes, and clinical status</li>
                </ul>
              </div>
            </div>

            {/* Monitoring Parameters */}
            <div className="mt-4 bg-white p-4 rounded-md border-2 border-orange-400">
              <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Critical Monitoring Throughout
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>Target urine output:</strong> {result.urineOutputTarget} mL/hour</li>
                <li>• <strong>Hourly monitoring:</strong> Adjust rate by ±20% based on urine output</li>
                <li>• If urine output {'<'} 0.5 mL/kg/hr: INCREASE fluid rate by 20%</li>
                <li>• If urine output {'>'} 1 mL/kg/hr: DECREASE fluid rate by 20%</li>
                <li>• <strong>Monitor:</strong> Heart rate, BP, CVP, lactate, base deficit, Hct</li>
                <li>• <strong>Electrolytes:</strong> Check Na⁺, K⁺, Cl⁻, HCO₃⁻ every 6-12 hours</li>
                <li>• <strong>Albumin:</strong> Monitor daily, replace if {'<'}2.5 g/dL</li>
                <li>• Watch for compartment syndrome in circumferential burns</li>
              </ul>
            </div>
          </div>

          {/* Nutritional Requirements */}
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nutritional Requirements</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm text-gray-600">Daily Caloric Need</p>
                <p className="text-2xl font-bold text-green-600">{result.totalCalories} kcal/day</p>
              </div>
              <div className="bg-white p-4 rounded-md">
                <p className="text-sm text-gray-600">Protein Requirement</p>
                <p className="text-2xl font-bold text-green-600">{result.proteinRequirement} g/day</p>
              </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Start enteral nutrition within 24-48 hours if possible. 
                High-protein, high-calorie diet essential for wound healing. Consider specialized burn nutrition formulas.
                See Nutrition Calculator for detailed meal planning.
              </p>
            </div>
          </div>

          {/* Clinical Management */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Additional Management Considerations</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Pain management:</strong> IV opioids initially, regular reassessment</li>
              <li>• <strong>Wound care:</strong> 
                <ul className="ml-4 mt-1 space-y-1">
                  <li>- Clean with <strong>Wound-Clex solution</strong></li>
                  <li>- <strong>Face:</strong> Apply Gentamicin ointment</li>
                  <li>- <strong>Other body parts:</strong> Hera gel, Sofratulle, or Honey care gauze</li>
                  <li>- Change dressings daily or when saturated</li>
                  <li>- Monitor for infection (increased pain, purulent discharge, fever)</li>
                </ul>
              </li>
              <li>• <strong>Infection prevention:</strong> Sterile technique, monitor for sepsis</li>
              <li>• <strong>Escharotomy:</strong> Consider if circumferential burns with vascular compromise</li>
              <li>• <strong>Tetanus prophylaxis:</strong> Update vaccination if needed</li>
              <li>• <strong>Early mobilization:</strong> Prevent contractures and improve outcomes</li>
              <li>• <strong>Psychological support:</strong> Essential for recovery</li>
              <li>• <strong>Transfer criteria:</strong> BSA {'>'}10% (child) or {'>'}20% (adult) → Burns center</li>
            </ul>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Burns Management Plan PDF
          </button>
        </div>
      )}
    </div>
  );
}
