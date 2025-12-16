'use client';

import { useState } from 'react';
import { Calculator, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { generateSodiumPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

type VolumeStatus = 'hypovolemic' | 'euvolemic' | 'hypervolemic';
type Gender = 'male' | 'female' | 'elderly-male' | 'elderly-female';

export default function SodiumCalculator({ patientInfo }: PatientInfoProps) {
  const [currentNa, setCurrentNa] = useState<string>('');
  const [targetNa, setTargetNa] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [volumeStatus, setVolumeStatus] = useState<VolumeStatus>('euvolemic');
  const [isAcute, setIsAcute] = useState<boolean>(false);
  const [hasSymptoms, setHasSymptoms] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const calculateSodium = () => {
    const current = parseFloat(currentNa);
    const target = parseFloat(targetNa);
    const wt = parseFloat(weight);

    if (isNaN(current) || isNaN(target) || isNaN(wt)) {
      alert('Please enter valid numbers');
      return;
    }

    // Calculate TBW
    let tbwFactor = 0.6;
    if (gender === 'female') tbwFactor = 0.5;
    if (gender === 'elderly-male') tbwFactor = 0.5;
    if (gender === 'elderly-female') tbwFactor = 0.45;

    const tbw = tbwFactor * wt;
    const sodiumDeficit = (target - current) * tbw;

    // Determine severity
    let severity = 'Normal';
    let severityClass = 'text-green-600';
    if (current < 135) {
      if (current >= 130) {
        severity = 'Mild Hyponatremia';
        severityClass = 'text-yellow-600';
      } else if (current >= 125) {
        severity = 'Moderate Hyponatremia';
        severityClass = 'text-orange-600';
      } else {
        severity = 'Severe Hyponatremia';
        severityClass = 'text-danger-600';
      }
    } else if (current > 145) {
      severity = 'Hypernatremia';
      severityClass = 'text-danger-600';
    }

    // Determine correction rate
    let maxCorrection = 8;
    let correctionTime = 24;
    if (!isAcute || volumeStatus === 'hypervolemic') {
      maxCorrection = 6;
    }
    if (hasSymptoms && isAcute && current < 125) {
      maxCorrection = 6;
      correctionTime = 6;
    }

    // Recommend fluid
    let fluidType = '0.9% Normal Saline';
    if (current < 120 && hasSymptoms) {
      fluidType = '3% Hypertonic Saline (100mL bolus over 10 min, max 3 doses)';
    } else if (current > 145) {
      if (volumeStatus === 'hypovolemic') {
        fluidType = '0.9% NS initially, then 5% Dextrose';
      } else {
        fluidType = '5% Dextrose ± Loop Diuretic';
      }
    } else if (volumeStatus === 'euvolemic' && current < 125) {
      fluidType = 'Fluid restriction ± 3% Saline';
    }

    // Calculate water deficit for hypernatremia
    let waterDeficit = 0;
    if (current > 145) {
      waterDeficit = tbw * ((current / 140) - 1);
    }

    const calculationResult = {
      current,
      target,
      weight: wt,
      tbw: tbw.toFixed(1),
      sodiumDeficit: Math.abs(sodiumDeficit).toFixed(0),
      severity,
      severityClass,
      maxCorrection,
      correctionTime,
      fluidType,
      waterDeficit: waterDeficit > 0 ? waterDeficit.toFixed(1) : null,
      isHypo: current < 135,
      isHyper: current > 145,
      volumeStatus,
      isAcute,
      hasSymptoms,
      gender,
    };

    setResult(calculationResult);
  };

  const handleExportPDF = () => {
    if (result) {
      generateSodiumPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-7 h-7 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">Sodium Disorder Calculator</h2>
      </div>

      {/* Alert Box */}
      <div className="bg-blue-50 border-l-4 border-primary-600 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">WHO Safety Guidelines</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Max correction: 8 mmol/L per 24 hours (chronic)</li>
              <li>High risk patients: ≤6 mmol/L per 24 hours</li>
              <li>Monitor labs every 2-4 hours during correction</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Sodium (mmol/L)
          </label>
          <input
            type="number"
            value={currentNa}
            onChange={(e) => setCurrentNa(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 118"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Sodium (mmol/L)
          </label>
          <input
            type="number"
            value={targetNa}
            onChange={(e) => setTargetNa(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 124"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Body Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 70"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Patient Category
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="male">Adult Male (TBW: 60%)</option>
            <option value="female">Adult Female (TBW: 50%)</option>
            <option value="elderly-male">Elderly Male (TBW: 50%)</option>
            <option value="elderly-female">Elderly Female (TBW: 45%)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Volume Status
          </label>
          <select
            value={volumeStatus}
            onChange={(e) => setVolumeStatus(e.target.value as VolumeStatus)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="hypovolemic">Hypovolemic</option>
            <option value="euvolemic">Euvolemic</option>
            <option value="hypervolemic">Hypervolemic</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="acute"
              checked={isAcute}
              onChange={(e) => setIsAcute(e.target.checked)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="acute" className="ml-2 text-sm font-medium text-gray-700">
              Acute onset (&lt;48 hours)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="symptoms"
              checked={hasSymptoms}
              onChange={(e) => setHasSymptoms(e.target.checked)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="symptoms" className="ml-2 text-sm font-medium text-gray-700">
              Severe symptoms (seizures/coma)
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={calculateSodium}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate Treatment Plan
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Treatment Plan
            </h3>

            {/* Severity Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${result.severityClass} bg-opacity-10`}>
                <AlertCircle className="w-5 h-5" />
                {result.severity}
              </span>
            </div>

            {/* Calculations */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Body Water</p>
                <p className="text-2xl font-bold text-gray-800">{result.tbw} L</p>
              </div>

              {result.isHypo && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Sodium Deficit</p>
                  <p className="text-2xl font-bold text-primary-600">{result.sodiumDeficit} mmol</p>
                </div>
              )}

              {result.waterDeficit && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Free Water Deficit</p>
                  <p className="text-2xl font-bold text-primary-600">{result.waterDeficit} L</p>
                </div>
              )}

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Max Correction Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.maxCorrection} mmol/L per {result.correctionTime}h
                </p>
              </div>
            </div>

            {/* Fluid Recommendation */}
            <div className="bg-blue-50 border-l-4 border-primary-600 p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">Recommended Fluid:</p>
              <p className="text-gray-700">{result.fluidType}</p>
            </div>

            {/* Clinical Recommendations */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                Clinical Actions:
              </p>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                <li>Monitor serum sodium every 2-4 hours</li>
                <li>Continuous ECG monitoring if potassium abnormal</li>
                <li>Strict fluid balance charting</li>
                <li>Neurological observations hourly</li>
                {result.hasSymptoms && <li className="font-semibold text-danger-600">EMERGENCY: Consider ICU admission</li>}
                {result.current < 120 && <li className="font-semibold text-danger-600">Risk of seizures - prepare emergency medications</li>}
              </ul>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 no-print"
          >
            <Download className="w-5 h-5" />
            Export Treatment Plan (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
