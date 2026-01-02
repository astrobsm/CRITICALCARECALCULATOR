'use client';

import { useState } from 'react';
import { Calculator, FileText, AlertCircle, CheckCircle, Download, Activity, Mail } from 'lucide-react';
import { generateGFRPDF, generateConsultLetterPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

type Gender = 'male' | 'female';
type Race = 'black' | 'other';

export default function GFRCalculator({ patientInfo }: PatientInfoProps) {
  const [creatinine, setCreatinine] = useState<string>('');
  const [urea, setUrea] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [race, setRace] = useState<Race>('other');
  const [result, setResult] = useState<any>(null);

  // Consult Letter State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [consultReason, setConsultReason] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const calculateGFR = () => {
    const cr = parseFloat(creatinine);
    const u = parseFloat(urea);
    const a = parseFloat(age);
    const wt = parseFloat(weight);

    if (isNaN(cr) || isNaN(a) || isNaN(wt)) {
      alert('Please enter valid values for creatinine, age, and weight');
      return;
    }

    // CKD-EPI Formula (2021)
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const crKappa = cr / kappa;
    const minCrKappa = Math.min(crKappa, 1);
    const maxCrKappa = Math.max(crKappa, 1);
    
    let ckdEpi = 142 * Math.pow(minCrKappa, alpha) * Math.pow(maxCrKappa, -1.200) * Math.pow(0.9938, a);
    if (gender === 'female') ckdEpi *= 1.012;
    
    // Cockcroft-Gault Formula
    let cockcroftGault = ((140 - a) * wt) / (72 * cr);
    if (gender === 'female') cockcroftGault *= 0.85;

    // MDRD Formula
    let mdrd = 175 * Math.pow(cr, -1.154) * Math.pow(a, -0.203);
    if (gender === 'female') mdrd *= 0.742;
    if (race === 'black') mdrd *= 1.212;

    // Determine CKD stage based on CKD-EPI
    let stage = '';
    let stageClass = '';
    let description = '';
    let recommendation = '';

    if (ckdEpi >= 90) {
      stage = 'G1';
      stageClass = 'text-green-600';
      description = 'Normal or High';
      recommendation = 'No CKD if no other evidence of kidney damage. Monitor if risk factors present.';
    } else if (ckdEpi >= 60) {
      stage = 'G2';
      stageClass = 'text-green-600';
      description = 'Mild Reduction';
      recommendation = 'CKD if persistent kidney damage. Monitor annually.';
    } else if (ckdEpi >= 45) {
      stage = 'G3a';
      stageClass = 'text-yellow-600';
      description = 'Mild to Moderate Reduction';
      recommendation = 'Monitor 6-12 monthly. Address cardiovascular risk factors. Consider nephrology referral.';
    } else if (ckdEpi >= 30) {
      stage = 'G3b';
      stageClass = 'text-orange-600';
      description = 'Moderate to Severe Reduction';
      recommendation = 'Monitor 3-6 monthly. Nephrology referral advised. Adjust medications. Screen for complications.';
    } else if (ckdEpi >= 15) {
      stage = 'G4';
      stageClass = 'text-danger-600';
      description = 'Severe Reduction';
      recommendation = 'Nephrology referral URGENT. Prepare for renal replacement therapy. Monitor monthly.';
    } else {
      stage = 'G5';
      stageClass = 'text-danger-600';
      description = 'Kidney Failure';
      recommendation = 'Nephrology referral IMMEDIATE. Renal replacement therapy indicated. Daily monitoring.';
    }

    // Calculate BUN (if urea provided)
    let bun = null;
    let bunCreatRatio = null;
    let bunInterpretation = '';
    
    if (!isNaN(u) && u > 0) {
      bun = u * 2.8; // Convert urea to BUN (mg/dL)
      bunCreatRatio = bun / cr;
      
      if (bunCreatRatio < 10) {
        bunInterpretation = 'Low ratio - suggests low protein intake, liver disease, or overhydration';
      } else if (bunCreatRatio > 20) {
        bunInterpretation = 'High ratio - suggests prerenal azotemia (dehydration, heart failure) or GI bleeding';
      } else {
        bunInterpretation = 'Normal ratio - consistent with intrinsic renal disease if GFR is low';
      }
    }

    const calculationResult = {
      creatinine: cr,
      urea: u,
      age: a,
      weight: wt,
      gender,
      race,
      ckdEpi: ckdEpi.toFixed(1),
      cockcroftGault: cockcroftGault.toFixed(1),
      mdrd: mdrd.toFixed(1),
      stage,
      stageClass,
      description,
      recommendation,
      bun: bun ? bun.toFixed(1) : null,
      bunCreatRatio: bunCreatRatio ? bunCreatRatio.toFixed(1) : null,
      bunInterpretation,
    };

    setResult(calculationResult);
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateGFRPDF(result, patientInfo);
    }
  };

  const handleConsultLetter = () => {
    if (!result) {
      alert('Please calculate GFR first');
      return;
    }
    setShowConsultModal(true);
  };

  const handleGenerateConsultLetter = () => {
    if (!fromUnit || !toUnit || !consultReason) {
      alert('Please fill in all required fields (From Unit, To Unit, and Reason for Consultation)');
      return;
    }

    const calculatorResultsText = `
GFR Assessment Results:
- CKD-EPI GFR: ${result.ckdEpi} mL/min/1.73m²
- Cockcroft-Gault: ${result.cockcroftGault} mL/min
- MDRD: ${result.mdrd} mL/min/1.73m²
- CKD Stage: ${result.stage} (${result.description})
- Serum Creatinine: ${result.creatinine} mg/dL
${result.bun ? `- BUN: ${result.bun} mg/dL` : ''}
${result.bunCreatRatio ? `- BUN/Creatinine Ratio: ${result.bunCreatRatio}` : ''}
${result.bunInterpretation ? `- Interpretation: ${result.bunInterpretation}` : ''}
    `.trim();

    generateConsultLetterPDF(
      patientInfo,
      fromUnit,
      toUnit,
      consultReason,
      clinicalFindings || calculatorResultsText,
      recommendations,
      'GFR_Assessment',
      calculatorResultsText
    );

    setShowConsultModal(false);
    // Reset form
    setFromUnit('');
    setToUnit('');
    setConsultReason('');
    setClinicalFindings('');
    setRecommendations('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">GFR Calculator</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* Left Column */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Serum Creatinine (mg/dL) *
            </label>
            <input
              type="number"
              step="0.1"
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 1.2"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Blood Urea (mg/dL) - Optional
            </label>
            <input
              type="number"
              step="0.1"
              value={urea}
              onChange={(e) => setUrea(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 20"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Age (years) *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 65"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 70"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Race/Ethnicity
            </label>
            <select
              value={race}
              onChange={(e) => setRace(e.target.value as Race)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="other">Non-Black</option>
              <option value="black">Black/African American</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-md">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Note:</strong> GFR formulas provide estimates. CKD-EPI is most accurate for adults. 
              Results should be interpreted with clinical context.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={calculateGFR}
        className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3 px-4 sm:px-6 rounded-md transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
      >
        <Calculator className="w-5 h-5" />
        Calculate GFR
      </button>

      {result && (
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {/* GFR Results */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-primary-600">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              GFR Calculation Results
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">CKD-EPI (Recommended)</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-600">{result.ckdEpi} mL/min/1.73m²</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">Cockcroft-Gault</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-600">{result.cockcroftGault} mL/min</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">MDRD</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-600">{result.mdrd} mL/min/1.73m²</p>
              </div>
            </div>

            <div className={`bg-white p-4 rounded-md border-l-4 ${result.stageClass === 'text-green-600' ? 'border-green-600' : result.stageClass === 'text-yellow-600' ? 'border-yellow-600' : result.stageClass === 'text-orange-600' ? 'border-orange-600' : 'border-danger-600'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`w-5 h-5 ${result.stageClass}`} />
                <p className={`text-lg font-bold ${result.stageClass}`}>
                  CKD Stage {result.stage}: {result.description}
                </p>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>eGFR:</strong> {result.ckdEpi} mL/min/1.73m²
              </p>
              <p className="text-sm text-gray-700">
                <strong>Recommendation:</strong> {result.recommendation}
              </p>
            </div>
          </div>

          {/* BUN/Creatinine Ratio */}
          {result.bun && (
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-600">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                BUN/Creatinine Ratio Analysis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-700">
                    <strong>BUN:</strong> {result.bun} mg/dL
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700">
                    <strong>BUN/Creatinine Ratio:</strong> {result.bunCreatRatio}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-700">
                    <strong>Interpretation:</strong> {result.bunInterpretation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">CKD Stage Guidelines</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>G1 (≥90):</strong> Normal kidney function (if kidney damage present)</p>
              <p><strong>G2 (60-89):</strong> Mild reduction in kidney function</p>
              <p><strong>G3a (45-59):</strong> Mild to moderate reduction</p>
              <p><strong>G3b (30-44):</strong> Moderate to severe reduction</p>
              <p><strong>G4 (15-29):</strong> Severe reduction - prepare for dialysis</p>
              <p><strong>G5 (&lt;15):</strong> Kidney failure - dialysis or transplant needed</p>
            </div>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF Report
          </button>

          {/* Generate Consult Letter */}
          <button
            onClick={handleConsultLetter}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Generate Consultation Letter
          </button>
        </div>
      )}

      {/* Consultation Letter Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                Generate Consultation Letter
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Unit (Consulting Unit) *
                  </label>
                  <input
                    type="text"
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Internal Medicine Ward"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Unit (Unit Being Consulted) *
                  </label>
                  <input
                    type="text"
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Nephrology Department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Consultation *
                  </label>
                  <textarea
                    value={consultReason}
                    onChange={(e) => setConsultReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="e.g., Evaluation and management of declining renal function"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Clinical Findings (Optional - GFR results will be included automatically)
                  </label>
                  <textarea
                    value={clinicalFindings}
                    onChange={(e) => setClinicalFindings(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={4}
                    placeholder="e.g., Patient presented with progressive fatigue, nausea, and elevated blood pressure..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Specific Recommendations Requested (Optional)
                  </label>
                  <textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="e.g., Please advise on further investigation, medication adjustments, and follow-up plan"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleGenerateConsultLetter}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  Generate Letter
                </button>
                <button
                  onClick={() => setShowConsultModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
