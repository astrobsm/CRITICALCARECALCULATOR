'use client';

import { useState } from 'react';
import { Calculator, FileText, AlertCircle, Heart, Download } from 'lucide-react';
import { generatePotassiumPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

export default function PotassiumCalculator({ patientInfo }: PatientInfoProps) {
  const [currentK, setCurrentK] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hasMg, setHasMg] = useState<boolean>(true);
  const [hasECGChanges, setHasECGChanges] = useState<boolean>(false);
  const [ecgFinding, setEcgFinding] = useState<string>('none');
  const [result, setResult] = useState<any>(null);

  const calculatePotassium = () => {
    const current = parseFloat(currentK);
    const wt = parseFloat(weight);

    if (isNaN(current) || isNaN(wt)) {
      alert('Please enter valid numbers');
      return;
    }

    const normalK = 4.0;
    let severity = 'Normal';
    let severityClass = 'text-green-600';
    let isHypo = current < 3.5;
    let isHyper = current > 5.5;
    let deficit = 0;
    let urgency = 'routine';

    // Hypokalemia
    if (isHypo) {
      if (current >= 3.0) {
        severity = 'Mild Hypokalemia';
        severityClass = 'text-yellow-600';
      } else if (current >= 2.5) {
        severity = 'Moderate Hypokalemia';
        severityClass = 'text-orange-600';
        urgency = 'urgent';
      } else {
        severity = 'Severe Hypokalemia';
        severityClass = 'text-danger-600';
        urgency = 'emergency';
      }

      // Calculate deficit: 0.3 mmol/L drop ≈ 100 mmol deficit
      const drop = normalK - current;
      deficit = (drop / 0.3) * 100;
    }

    // Hyperkalemia
    if (isHyper) {
      severity = 'Hyperkalemia';
      severityClass = 'text-danger-600';
      
      if (current > 6.5 || hasECGChanges) {
        urgency = 'emergency';
      } else if (current > 6.0) {
        urgency = 'urgent';
      }
    }

    // Treatment recommendations
    let treatment = [];
    let monitoring = [];

    if (isHypo) {
      if (current < 2.5 || hasECGChanges) {
        treatment.push('IV Potassium: 10-20 mmol/hr via central line');
        treatment.push('Maximum 40 mmol/hr in extreme emergency');
        monitoring.push('Continuous ECG monitoring');
      } else if (current < 3.0) {
        treatment.push('IV Potassium: 10 mmol/hr via peripheral line');
      } else {
        treatment.push('Oral KCl: 40-80 mmol/day divided doses');
      }

      if (!hasMg) {
        treatment.push('⚠️ CRITICAL: Correct magnesium deficiency first');
        treatment.push('Magnesium sulfate 2g IV over 10-20 minutes');
      }

      monitoring.push('Check K+ every 2-4 hours until >3.5 mmol/L');
      monitoring.push('Monitor urine output');
    }

    if (isHyper) {
      if (hasECGChanges || ecgFinding !== 'none') {
        treatment.push('🚨 CARDIAC EMERGENCY');
        treatment.push('1. Calcium Gluconate 10% 10mL IV over 5-10 min');
        treatment.push('2. Insulin 10 units IV + 25g glucose');
        treatment.push('3. Nebulized Salbutamol 10-20mg');
        if (current > 6.5) {
          treatment.push('4. Sodium bicarbonate 50 mmol IV (if acidotic)');
          treatment.push('5. Prepare for emergency dialysis');
        }
        monitoring.push('Continuous cardiac monitoring');
        monitoring.push('Check K+ every 1-2 hours');
      } else if (current > 6.0) {
        treatment.push('Insulin 10 units IV + 25g glucose');
        treatment.push('Loop diuretic (if urine output adequate)');
        monitoring.push('ECG every 2 hours');
        monitoring.push('Check K+ every 2-4 hours');
      } else {
        treatment.push('Stop K+ supplements and K+-sparing diuretics');
        treatment.push('Loop diuretic 40-80mg IV');
        treatment.push('Consider sodium polystyrene sulfonate');
        monitoring.push('Repeat K+ in 4-6 hours');
      }
    }

    const calculationResult = {
      current,
      weight: wt,
      severity,
      severityClass,
      isHypo,
      isHyper,
      deficit: isHypo ? deficit.toFixed(0) : null,
      urgency,
      treatment,
      monitoring,
      hasMg,
      hasECGChanges,
      ecgFinding,
    };

    setResult(calculationResult);
  };

  const handleExportPDF = () => {
    if (result) {
      generatePotassiumPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-danger-600" />
        <h2 className="text-2xl font-bold text-gray-800">Potassium Disorder Calculator</h2>
      </div>

      {/* Alert Box */}
      <div className="bg-red-50 border-l-4 border-danger-600 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-danger-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">CRITICAL Safety Warning</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>ECG changes = CARDIAC EMERGENCY</li>
              <li>Maximum IV rate: 10 mmol/hr peripheral, 20 mmol/hr central</li>
              <li>Always check and correct magnesium first in hypokalemia</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current Potassium (mmol/L)
          </label>
          <input
            type="number"
            value={currentK}
            onChange={(e) => setCurrentK(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 2.8"
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
            ECG Findings
          </label>
          <select
            value={ecgFinding}
            onChange={(e) => {
              setEcgFinding(e.target.value);
              setHasECGChanges(e.target.value !== 'none');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="none">No ECG changes</option>
            <option value="peaked-t">Peaked T waves (Early)</option>
            <option value="wide-qrs">Wide QRS complex (Severe)</option>
            <option value="sine-wave">Sine wave pattern (Critical)</option>
            <option value="u-waves">U waves / Flat T (Hypokalemia)</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="magnesium"
            checked={hasMg}
            onChange={(e) => setHasMg(e.target.checked)}
            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="magnesium" className="ml-2 text-sm font-medium text-gray-700">
            Magnesium level normal (≥0.7 mmol/L)
          </label>
        </div>
      </div>

      <button
        onClick={calculatePotassium}
        className="w-full bg-danger-600 hover:bg-danger-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate Treatment Plan
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-danger-600" />
              Treatment Plan
            </h3>

            {/* Severity Badge */}
            <div className="mb-4 flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${result.severityClass} bg-opacity-10`}>
                <AlertCircle className="w-5 h-5" />
                {result.severity}
              </span>
              
              {result.urgency === 'emergency' && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-danger-600 animate-pulse">
                  🚨 EMERGENCY
                </span>
              )}
            </div>

            {/* Deficit for Hypokalemia */}
            {result.isHypo && result.deficit && (
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Estimated Potassium Deficit</p>
                <p className="text-2xl font-bold text-orange-600">~{result.deficit} mmol</p>
                <p className="text-xs text-gray-600 mt-1">Based on rule: 0.3 mmol/L drop ≈ 100 mmol deficit</p>
              </div>
            )}

            {/* Treatment Protocol */}
            <div className={`border-l-4 p-4 mb-4 ${result.urgency === 'emergency' ? 'bg-red-50 border-danger-600' : 'bg-blue-50 border-primary-600'}`}>
              <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Treatment Protocol:
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-700">
                {result.treatment.map((item: string, index: number) => (
                  <li key={index} className={item.includes('🚨') || item.includes('⚠️') ? 'font-bold text-danger-600' : ''}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* Monitoring */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="font-semibold text-gray-800 mb-3">Monitoring Requirements:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                {result.monitoring.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
                <li>Assess neuromuscular function</li>
                <li>Monitor for arrhythmias</li>
              </ul>
            </div>

            {/* ECG Warning */}
            {result.hasECGChanges && (
              <div className="bg-danger-100 border-2 border-danger-600 rounded-lg p-4 mt-4">
                <p className="font-bold text-danger-700 text-lg mb-2">⚠️ ECG CHANGES DETECTED</p>
                <p className="text-sm text-danger-600">
                  Finding: <span className="font-semibold">{result.ecgFinding.replace(/-/g, ' ').toUpperCase()}</span>
                </p>
                <p className="text-sm text-danger-600 mt-2">
                  Immediate action required. Consider ICU admission and cardiology consult.
                </p>
              </div>
            )}
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
