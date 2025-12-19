'use client';

import { useState } from 'react';
import { Calculator, FileText, AlertCircle, Activity, Download } from 'lucide-react';
import { generateAcidBasePDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

type DisorderType = 'none' | 'metabolic-acidosis' | 'metabolic-alkalosis' | 'respiratory-acidosis' | 'respiratory-alkalosis';

export default function AcidBaseCalculator({ patientInfo }: PatientInfoProps) {
  const [ph, setPh] = useState<string>('');
  const [hco3, setHco3] = useState<string>('');
  const [pco2, setPco2] = useState<string>('');
  const [na, setNa] = useState<string>('');
  const [cl, setCl] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const calculateAcidBase = () => {
    const phVal = parseFloat(ph);
    const hco3Val = parseFloat(hco3);
    const pco2Val = parseFloat(pco2);
    const naVal = parseFloat(na);
    const clVal = parseFloat(cl);
    const wt = parseFloat(weight);

    if (isNaN(phVal) || isNaN(hco3Val) || isNaN(pco2Val)) {
      alert('Please enter pH, HCO3, and PCO2 at minimum');
      return;
    }

    // Determine primary disorder
    let disorder: DisorderType = 'none';
    let severity = 'Normal';
    let severityClass = 'text-green-600';

    if (phVal < 7.35) {
      // Acidosis
      if (hco3Val < 22) {
        disorder = 'metabolic-acidosis';
        severity = phVal < 7.1 ? 'Severe Metabolic Acidosis' : 'Metabolic Acidosis';
        severityClass = phVal < 7.1 ? 'text-danger-600' : 'text-orange-600';
      } else if (pco2Val > 45) {
        disorder = 'respiratory-acidosis';
        severity = 'Respiratory Acidosis';
        severityClass = 'text-orange-600';
      }
    } else if (phVal > 7.45) {
      // Alkalosis
      if (hco3Val > 26) {
        disorder = 'metabolic-alkalosis';
        severity = 'Metabolic Alkalosis';
        severityClass = 'text-orange-600';
      } else if (pco2Val < 35) {
        disorder = 'respiratory-alkalosis';
        severity = 'Respiratory Alkalosis';
        severityClass = 'text-yellow-600';
      }
    } else {
      severity = 'Normal pH';
    }

    // Calculate Anion Gap (if Na and Cl provided)
    let anionGap = null;
    let agCategory = '';
    if (!isNaN(naVal) && !isNaN(clVal)) {
      anionGap = naVal - (clVal + hco3Val);
      
      if (anionGap >= 8 && anionGap <= 12) {
        agCategory = 'Normal AG';
      } else if (anionGap > 12) {
        agCategory = 'High AG (GOLD MARK)';
      } else {
        agCategory = 'Low AG';
      }
    }

    // Calculate HCO3 requirement for severe metabolic acidosis
    let hco3Required = null;
    if (disorder === 'metabolic-acidosis' && phVal < 7.1 && !isNaN(wt)) {
      const desiredHco3 = 18;
      hco3Required = 0.5 * wt * (desiredHco3 - hco3Val);
    }

    // Determine causes
    let causes: string[] = [];
    if (disorder === 'metabolic-acidosis') {
      if (anionGap && anionGap > 12) {
        causes = [
          'Lactic acidosis (sepsis, shock)',
          'Ketoacidosis (DKA, alcoholic, starvation)',
          'Renal failure (uremia)',
          'Toxic ingestion (methanol, ethylene glycol, aspirin)',
        ];
      } else {
        causes = [
          'Diarrhea (GI HCO3 loss)',
          'Renal tubular acidosis',
          'Saline overload (dilutional)',
          'Carbonic anhydrase inhibitors',
        ];
      }
    } else if (disorder === 'metabolic-alkalosis') {
      causes = [
        'Vomiting / NG suction (H+ loss)',
        'Diuretic use (Cl- depletion)',
        'Hyperaldosteronism',
        'Severe hypokalemia',
      ];
    } else if (disorder === 'respiratory-acidosis') {
      causes = [
        'Hypoventilation (CNS depression)',
        'COPD / Airway obstruction',
        'Neuromuscular disease',
        'Severe obesity (OHS)',
      ];
    } else if (disorder === 'respiratory-alkalosis') {
      causes = [
        'Hyperventilation (anxiety, pain)',
        'Hypoxemia (PE, pneumonia)',
        'Sepsis',
        'Pregnancy',
      ];
    }

    // Treatment recommendations
    let treatment: string[] = [];
    
    if (disorder === 'metabolic-acidosis') {
      treatment.push('Treat underlying cause (PRIORITY)');
      if (phVal < 7.1 && hco3Required) {
        treatment.push(`Sodium bicarbonate: ${hco3Required.toFixed(0)} mmol (target HCO3 18-20)`);
        treatment.push('Give 50% of calculated dose over 30-60 min');
        treatment.push('Recheck ABG after 30 minutes');
      } else {
        treatment.push('Avoid bicarbonate unless pH <7.1');
      }
      if (anionGap && anionGap > 12) {
        treatment.push('Identify and treat cause of high AG');
        treatment.push('Lactate: fluid resuscitation, source control');
        treatment.push('DKA: insulin, fluids, K+ replacement');
      }
    } else if (disorder === 'metabolic-alkalosis') {
      treatment.push('0.9% Normal Saline for volume depletion');
      treatment.push('Correct hypokalemia aggressively');
      treatment.push('Consider acetazolamide 250-500mg if severe');
      treatment.push('Treat underlying cause (stop diuretics if possible)');
    } else if (disorder === 'respiratory-acidosis') {
      treatment.push('Improve ventilation (PRIORITY)');
      treatment.push('Non-invasive ventilation (BiPAP/CPAP)');
      treatment.push('Consider intubation if severe or worsening');
      treatment.push('Treat bronchospasm if present');
    } else if (disorder === 'respiratory-alkalosis') {
      treatment.push('Treat underlying cause');
      treatment.push('Manage pain/anxiety');
      treatment.push('Treat hypoxemia (oxygen therapy)');
      treatment.push('Antibiotics if sepsis/pneumonia');
    }

    const calculationResult = {
      ph: phVal,
      hco3: hco3Val,
      pco2: pco2Val,
      na: naVal,
      cl: clVal,
      weight: wt,
      disorder,
      severity,
      severityClass,
      anionGap: anionGap ? anionGap.toFixed(1) : null,
      agCategory,
      hco3Required: hco3Required ? hco3Required.toFixed(0) : null,
      causes,
      treatment,
    };

    setResult(calculationResult);
  };

  const handleExportPDF = () => {
    if (result) {
      generateAcidBasePDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-7 h-7 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">Acid-Base Disorder Calculator</h2>
      </div>

      {/* Alert Box */}
      <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">ABG Interpretation Guide</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Normal pH: 7.35-7.45 | HCO3: 22-26 | PCO2: 35-45</li>
              <li>Anion Gap = Na - (Cl + HCO3), Normal: 8-12</li>
              <li>High AG acidosis: GOLD MARK (Glycols, Oxoproline, L-lactate, D-lactate, Methanol, ASA, Renal failure, Ketones)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            pH
          </label>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 7.25"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            HCO₃⁻ (mmol/L)
          </label>
          <input
            type="number"
            value={hco3}
            onChange={(e) => setHco3(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 15"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PCO₂ (mmHg)
          </label>
          <input
            type="number"
            value={pco2}
            onChange={(e) => setPco2(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 32"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sodium (mmol/L) <span className="text-gray-500 text-xs">optional</span>
          </label>
          <input
            type="number"
            value={na}
            onChange={(e) => setNa(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 140"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chloride (mmol/L) <span className="text-gray-500 text-xs">optional</span>
          </label>
          <input
            type="number"
            value={cl}
            onChange={(e) => setCl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 105"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Body Weight (kg) <span className="text-gray-500 text-xs">for HCO₃ calc</span>
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 70"
            step="0.1"
          />
        </div>
      </div>

      <button
        onClick={calculateAcidBase}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Analyze Acid-Base Status
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Analysis Results
            </h3>

            {/* Severity Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${result.severityClass} bg-opacity-10`}>
                <AlertCircle className="w-5 h-5" />
                {result.severity}
              </span>
            </div>

            {/* ABG Values */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">pH</p>
                <p className="text-2xl font-bold text-gray-800">{result.ph.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Normal: 7.35-7.45</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">HCO₃⁻</p>
                <p className="text-2xl font-bold text-gray-800">{result.hco3.toFixed(1)} mmol/L</p>
                <p className="text-xs text-gray-500">Normal: 22-26</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">PCO₂</p>
                <p className="text-2xl font-bold text-gray-800">{result.pco2.toFixed(1)} mmHg</p>
                <p className="text-xs text-gray-500">Normal: 35-45</p>
              </div>

              {result.anionGap && (
                <div className={`rounded-lg p-4 ${result.agCategory.includes('High') ? 'bg-danger-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Anion Gap</p>
                  <p className={`text-2xl font-bold ${result.agCategory.includes('High') ? 'text-danger-600' : 'text-green-600'}`}>
                    {result.anionGap} mmol/L
                  </p>
                  <p className="text-xs font-semibold mt-1">{result.agCategory}</p>
                </div>
              )}

              {result.hco3Required && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">HCO₃⁻ Required</p>
                  <p className="text-2xl font-bold text-primary-600">{result.hco3Required} mmol</p>
                  <p className="text-xs text-gray-500">Target HCO₃: 18-20</p>
                </div>
              )}
            </div>

            {/* Possible Causes */}
            {result.causes.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="font-semibold text-gray-800 mb-2">Possible Causes:</p>
                <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                  {result.causes.map((cause: string, index: number) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment Plan */}
            <div className="bg-blue-50 border-l-4 border-primary-600 p-4">
              <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Treatment Protocol:
              </p>
              <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-700">
                {result.treatment.map((item: string, index: number) => (
                  <li key={index} className={item.includes('PRIORITY') ? 'font-bold text-danger-600' : ''}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {/* Monitoring */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
              <p className="font-semibold text-gray-800 mb-2">Monitoring:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                <li>Repeat ABG every 2-4 hours initially</li>
                <li>Continuous pulse oximetry</li>
                <li>Monitor electrolytes (K+, Ca++, Mg++)</li>
                <li>Assess respiratory rate and work of breathing</li>
                <li>Monitor mental status</li>
              </ul>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 no-print"
          >
            <Download className="w-5 h-5" />
            Export Analysis (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
