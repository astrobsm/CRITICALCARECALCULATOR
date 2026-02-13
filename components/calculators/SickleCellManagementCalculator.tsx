'use client';

import { useState } from 'react';
import { Download, AlertCircle, Heart, Droplet, Apple, Activity, Shield, TrendingUp, Info, Mail } from 'lucide-react';
import { generateSickleCellPDF, generateConsultLetterPDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function SickleCellManagementCalculator({ patientInfo }: PatientInfoProps) {
  const [hasUlcers, setHasUlcers] = useState<boolean>(false);
  const [ulcerLocation, setUlcerLocation] = useState<string>('');
  const [ulcerSize, setUlcerSize] = useState<string>('');
  const [ulcerDuration, setUlcerDuration] = useState<string>('');
  const [painLevel, setPainLevel] = useState<string>('');
  const [crisisFrequency, setCrisisFrequency] = useState<string>('');
  const [lastCrisis, setLastCrisis] = useState<string>('');
  const [currentHb, setCurrentHb] = useState<string>('');
  const [hydrationLevel, setHydrationLevel] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  
  const [result, setResult] = useState<any>(null);

  // Consult Letter State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [consultReason, setConsultReason] = useState('');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const calculateManagementPlan = () => {
    const wt = parseFloat(weight);
    const hb = parseFloat(currentHb);
    const ulcerSizeCm = parseFloat(ulcerSize);
    const ulcerWeeks = parseInt(ulcerDuration);
    const crisisPerYear = parseInt(crisisFrequency);

    // Daily fluid requirement (WHO: 2-3L/day minimum for SCD)
    const baseFluidML = wt * 40; // 40ml/kg
    const recommendedFluidML = Math.max(baseFluidML, 2500);
    const fluidLiters = (recommendedFluidML / 1000).toFixed(1);

    // Caloric needs (higher for healing)
    const bmr = wt * 25; // Simplified
    const stressFactor = hasUlcers ? 1.3 : 1.2; // Wound healing increases needs
    const totalCalories = Math.round(bmr * stressFactor);

    // Protein needs (WHO: 1.5-2.0 g/kg for wound healing)
    const proteinGrams = hasUlcers ? Math.round(wt * 1.8) : Math.round(wt * 1.2);

    // Crisis risk stratification
    let crisisRisk = 'Low';
    let riskColor = 'text-green-600';
    if (crisisPerYear >= 6) {
      crisisRisk = 'Very High';
      riskColor = 'text-red-600';
    } else if (crisisPerYear >= 3) {
      crisisRisk = 'High';
      riskColor = 'text-orange-600';
    } else if (crisisPerYear >= 1) {
      crisisRisk = 'Moderate';
      riskColor = 'text-yellow-600';
    }

    // Ulcer healing timeline estimate
    let healingWeeks = 0;
    let healingPrognosis = '';
    if (hasUlcers && ulcerSizeCm > 0) {
      // Estimate: 0.1cm/week reduction with optimal management
      healingWeeks = Math.ceil(ulcerSizeCm / 0.1);
      if (healingWeeks <= 8) {
        healingPrognosis = 'Good - Small ulcer with optimal healing potential';
      } else if (healingWeeks <= 16) {
        healingPrognosis = 'Fair - Moderate size requiring intensive wound care';
      } else {
        healingPrognosis = 'Guarded - Large ulcer, may require advanced interventions';
      }
    }

    setResult({
      crisisRisk,
      riskColor,
      crisisPerYear,
      fluidLiters,
      recommendedFluidML,
      totalCalories,
      proteinGrams,
      healingWeeks,
      healingPrognosis,
      hb,
      hasUlcers,
      ulcerLocation,
      ulcerSizeCm,
      ulcerWeeks,
      painLevel,
      hydrationLevel,
      
      // Evidence-based recommendations
      lifestyleChanges: [
        'Avoid smoking and secondhand smoke (vasoconstriction)',
        'Avoid extreme cold exposure (triggers sickling)',
        'Avoid high altitude >1500m (hypoxia trigger)',
        'Use supplemental O2 on flights >2 hours',
        'Maintain warm environment (18-24 degrees C optimal)',
        'Ensure 8-9 hours sleep nightly (stress reduction)',
        'Practice stress management (meditation, yoga)',
        'Moderate exercise only - avoid overexertion',
        'Regular medical follow-up every 3-6 months',
        'Ensure up-to-date vaccinations (pneumococcal, meningococcal, influenza)'
      ],

      hydrationProtocol: [
        `Target: ${fluidLiters}L daily (minimum 2.5L)`,
        'Drink 200-300ml every 2 hours while awake',
        'Increase by 500-1000ml in hot weather',
        'Extra 500ml for every 30 min exercise',
        'During crisis: 3-4L/day or IV hydration',
        'Prefer water, coconut water, diluted fruit juice',
        'Avoid: Alcohol, excessive caffeine, energy drinks',
        'Monitor: Urine should be pale yellow',
        'Track daily weight (dehydration indicator)',
        'Increase fluids with fever or infection'
      ],

      nutritionPlan: [
        `Protein: ${proteinGrams}g/day (lean meats, fish, eggs, legumes)`,
        `Calories: ${totalCalories} kcal/day`,
        'Folate-rich: Dark leafy greens, beans, fortified cereals (5mg/day)',
        'Iron sources: Red meat, liver, fortified foods',
        'Vitamin C: Citrus fruits (enhances iron absorption)',
        'Zinc: Nuts, seeds, shellfish (15-25mg/day for wound healing)',
        'Omega-3: Fatty fish 2-3x/week (anti-inflammatory)',
        'Vitamin D: Dairy, sunlight exposure (target >30ng/mL)',
        'Vitamin A: Carrots, sweet potatoes (wound healing)',
        'Vitamin E: Nuts, seeds (antioxidant, 400 IU/day)'
      ],

      supplements: [
        'Folic Acid: 5mg daily (mandatory - prevents megaloblastic crisis)',
        'Vitamin D: 2000-4000 IU daily if deficient',
        'Zinc: 15-25mg daily (wound healing, immune support)',
        'L-Arginine: 5-10g/day (improves NO bioavailability)',
        'Omega-3: 1000-2000mg EPA/DHA daily',
        'Vitamin C: 500-1000mg daily (collagen synthesis)',
        'Multivitamin: Daily comprehensive formula',
        'Probiotics: For gut health if on antibiotics',
        'Iron: Only if proven deficient (can worsen oxidative stress)',
        'Hydroxyurea: If >=3 crises/year (consult hematologist)'
      ],

      crisisPrevention: [
        'Treat infections promptly (common trigger)',
        'Maintain hydration constantly',
        'Dress warmly in cold weather',
        'Avoid sleep deprivation',
        'Avoid alcohol and recreational drugs',
        'Take prescribed medications regularly (hydroxyurea if indicated)',
        'Regular penicillin prophylaxis if prescribed',
        'Monitor temperature - seek care if >38 degrees C',
        'Recognize early crisis signs: Severe pain, fever, difficulty breathing',
        'Have crisis action plan and emergency contacts ready'
      ],

      ulcerManagement: hasUlcers ? [
        `Current ulcer: ${ulcerSizeCm}cm at ${ulcerLocation}`,
        `Estimated healing: ${healingWeeks} weeks with optimal care`,
        'Daily cleansing: Normal saline or mild soap/water',
        'Debridement: Remove necrotic tissue (by healthcare provider)',
        'Moisture balance: Hydrocolloid or foam dressings',
        'Infection control: Monitor for cellulitis, purulent discharge',
        'Consider: Arginine supplementation for NO production',
        'Compression: Graduated 20-30 mmHg if venous component',
        'Elevation: Leg elevation when resting',
        'Mobility: Gentle walking to improve circulation',
        'Pain control: NSAIDs with caution, opioids if severe',
        'Advanced: Consider HBO therapy, skin substitutes if not healing',
        'Specialist referral if: >3 months duration or >5cm diameter'
      ] : ['No active ulcers - Continue preventive measures'],

      woundHealingNutrients: [
        'Protein: 1.5-2.0 g/kg/day (building blocks for tissue)',
        'Vitamin C: 500-1000mg/day (collagen synthesis)',
        'Zinc: 20-25mg/day (cell proliferation, immune function)',
        'Vitamin A: 10,000 IU/day (epithelialization)',
        'Calcium: 1000-1200mg/day (cell signaling)',
        'Arginine: 5-10g/day (NO production, collagen)',
        'Vitamin E: 400 IU/day (antioxidant)',
        'Copper: 2mg/day (collagen cross-linking)',
        'B-Complex: All B vitamins (energy metabolism)',
        'Hydration: Essential for tissue perfusion'
      ],

      monitoringSchedule: [
        'Hematology review: Every 3-6 months',
        'CBC + reticulocyte count: Every 3 months',
        'Liver function, renal function: Every 6 months',
        'Ophthalmology: Annually (retinopathy screening)',
        'Pulmonary function: Annually if symptoms',
        'Echocardiogram: Every 1-2 years (pulmonary HTN)',
        'Bone density: Every 2 years',
        'Physical exam: Every visit for organomegaly',
        'Transcranial Doppler: Annually in children',
        'Wound assessment: Weekly if active ulcers'
      ],

      urgentWarnings: [
        'Seek immediate care if:',
        'Severe pain not relieved by home medications',
        'Difficulty breathing or chest pain (acute chest syndrome)',
        'Fever >38.5 degrees C (infection risk)',
        'Severe headache, weakness, seizures (stroke)',
        'Sudden vision changes',
        'Priapism lasting >2 hours',
        'Persistent vomiting or inability to drink',
        'Jaundice worsening rapidly',
        'Ulcer: Severe pain, spreading redness, pus, fever',
        'Any concerning new symptom in SCD patient'
      ]
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateSickleCellPDF(result, patientInfo);
    }
  };

  const handleConsultLetter = () => {
    if (!result) {
      alert('Please generate management plan first');
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
Sickle Cell Disease Management Assessment:

Crisis Risk: ${result.crisisRisk}
Annual Crisis Frequency: ${crisisFrequency} times per year
Current Hemoglobin: ${currentHb} g/dL

Nutritional Requirements:
- Daily Fluid: ${result.fluidLiters}L (minimum)
- Total Calories: ${result.totalCalories} kcal/day
- Protein: ${result.proteinGrams}g/day
- Folic Acid: 5mg daily

${hasUlcers ? `
Ulcer Assessment:
- Location: ${ulcerLocation}
- Size: ${ulcerSize} cm
- Duration: ${ulcerDuration} weeks
- Pain Level: ${painLevel}/10
` : 'No active ulcers reported'}

Hydration Status: ${hydrationLevel}
    `.trim();

    generateConsultLetterPDF(
      patientInfo,
      fromUnit,
      toUnit,
      consultReason,
      clinicalFindings || calculatorResultsText,
      recommendations,
      'Sickle_Cell_Management',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Sickle Cell Disease Management</h2>
        </div>
        <p className="text-red-100">
          Comprehensive crisis prevention, ulcer healing & WHO-aligned management strategies
        </p>
      </div>

      {/* WHO Disclaimer */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>WHO Guidelines:</strong> Management based on WHO Sickle Cell Disease Guidelines and international best practices for haemoglobinopathic ulcer management.
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          Patient Assessment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Current Hemoglobin (g/dL) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={currentHb}
              onChange={(e) => setCurrentHb(e.target.value)}
              step="0.1"
              min="4"
              max="12"
              placeholder="e.g., 8.5"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            />
            <p className="text-xs text-gray-500 mt-1">Normal SCD: 6-9 g/dL</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Body Weight (kg) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              placeholder="e.g., 65"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Crisis Frequency (per year) *
            </label>
            <select
              value={crisisFrequency}
              onChange={(e) => setCrisisFrequency(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="">Select frequency</option>
              <option value="0">No crises this year</option>
              <option value="1">1-2 crises/year</option>
              <option value="3">3-5 crises/year</option>
              <option value="6">6-10 crises/year</option>
              <option value="12">&gt;10 crises/year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Crisis
            </label>
            <select
              value={lastCrisis}
              onChange={(e) => setLastCrisis(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
            >
              <option value="">Select timeframe</option>
              <option value="current">Currently in crisis</option>
              <option value="week">&lt;1 week ago</option>
              <option value="month">1-4 weeks ago</option>
              <option value="3months">1-3 months ago</option>
              <option value="6months">3-6 months ago</option>
              <option value="year">&gt;6 months ago</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hydration Level *
            </label>
            <select
              value={hydrationLevel}
              onChange={(e) => setHydrationLevel(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
            >
              <option value="">Select level</option>
              <option value="poor">Poor (&lt;1.5L/day)</option>
              <option value="fair">Fair (1.5-2.5L/day)</option>
              <option value="good">Good (2.5-3.5L/day)</option>
              <option value="excellent">Excellent (&gt;3.5L/day)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Pain Level (0-10)
            </label>
            <input
              type="number"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              min="0"
              max="10"
              placeholder="0 = No pain, 10 = Worst"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Ulcer Assessment */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Leg Ulcer Assessment
          </h4>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasUlcers}
                onChange={(e) => setHasUlcers(e.target.checked)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Patient has active leg ulcer(s)
              </span>
            </label>
          </div>

          {hasUlcers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-orange-50 p-3 sm:p-4 rounded-lg">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Ulcer Location *
                </label>
                <select
                  value={ulcerLocation}
                  onChange={(e) => setUlcerLocation(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
                >
                  <option value="">Select location</option>
                  <option value="Medial malleolus">Medial malleolus (most common)</option>
                  <option value="Lateral malleolus">Lateral malleolus</option>
                  <option value="Anterior shin">Anterior shin</option>
                  <option value="Posterior leg">Posterior leg</option>
                  <option value="Foot">Foot</option>
                  <option value="Multiple sites">Multiple sites</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Ulcer Size (diameter in cm) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={ulcerSize}
                  onChange={(e) => setUlcerSize(e.target.value)}
                  step="0.1"
                  min="0.5"
                  placeholder="e.g., 3.5"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks) *
                </label>
                <input
                  type="number"
                  value={ulcerDuration}
                  onChange={(e) => setUlcerDuration(e.target.value)}
                  min="1"
                  placeholder="e.g., 8"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={calculateManagementPlan}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          Generate Management Plan
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Crisis Risk */}
          <div className={`p-6 rounded-lg shadow-md border-l-4 ${
            result.riskColor === 'text-red-600' ? 'bg-red-50 border-red-500' :
            result.riskColor === 'text-orange-600' ? 'bg-orange-50 border-orange-500' :
            result.riskColor === 'text-yellow-600' ? 'bg-yellow-50 border-yellow-500' :
            'bg-green-50 border-green-500'
          }`}>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Crisis Risk Assessment
            </h3>
            <p className={`text-2xl font-bold ${result.riskColor}`}>
              {result.crisisRisk} Risk
            </p>
            <p className="text-sm text-gray-700 mt-2">
              {result.crisisPerYear} crises per year
            </p>
            {result.crisisPerYear >= 3 && (
              <p className="text-sm text-red-700 mt-2 font-semibold">
                ⚕️ Consider hydroxyurea therapy - Consult hematologist
              </p>
            )}
          </div>

          {/* Ulcer Healing Prognosis */}
          {result.hasUlcers && (
            <div className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                Ulcer Healing Prognosis
              </h3>
              <div className="space-y-2">
                <p className="text-gray-800">
                  <strong>Location:</strong> {result.ulcerLocation}
                </p>
                <p className="text-gray-800">
                  <strong>Size:</strong> {result.ulcerSizeCm} cm diameter
                </p>
                <p className="text-gray-800">
                  <strong>Duration:</strong> {result.ulcerWeeks} weeks
                </p>
                <p className="text-gray-800">
                  <strong>Estimated healing time:</strong> {result.healingWeeks} weeks with optimal care
                </p>
                <p className="text-orange-800 font-semibold mt-3">
                  {result.healingPrognosis}
                </p>
              </div>
            </div>
          )}

          {/* Daily Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h4 className="font-semibold text-sm sm:text-base text-gray-800">Hydration</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{result.fluidLiters}L</p>
              <p className="text-xs sm:text-sm text-gray-600">Daily minimum</p>
            </div>

            <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <h4 className="font-semibold text-sm sm:text-base text-gray-800">Calories</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{result.totalCalories}</p>
              <p className="text-xs sm:text-sm text-gray-600">kcal/day</p>
            </div>

            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <h4 className="font-semibold text-sm sm:text-base text-gray-800">Protein</h4>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{result.proteinGrams}g</p>
              <p className="text-xs sm:text-sm text-gray-600">Per day</p>
            </div>
          </div>

          {/* Detailed Recommendations */}
          {[
            { title: 'Lifestyle Modifications', icon: Heart, data: result.lifestyleChanges, color: 'red' },
            { title: 'Hydration Protocol', icon: Droplet, data: result.hydrationProtocol, color: 'blue' },
            { title: 'Nutrition Plan', icon: Apple, data: result.nutritionPlan, color: 'green' },
            { title: 'Essential Supplements', icon: Shield, data: result.supplements, color: 'purple' },
            { title: 'Crisis Prevention Strategies', icon: AlertCircle, data: result.crisisPrevention, color: 'orange' },
            { title: 'Wound Healing Nutrients', icon: TrendingUp, data: result.woundHealingNutrients, color: 'pink' },
            { title: 'Ulcer Management Protocol', icon: Activity, data: result.ulcerManagement, color: 'indigo' },
            { title: 'Monitoring Schedule', icon: Activity, data: result.monitoringSchedule, color: 'teal' },
          ].map((section, idx) => (
            <div key={idx} className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${section.color}-500`}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.data.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className={`text-${section.color}-500 mt-1`}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Urgent Warnings */}
          <div className="bg-red-50 p-6 rounded-lg shadow-md border-2 border-red-500">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-800">
              <AlertCircle className="w-6 h-6" />
              Emergency Warning Signs
            </h3>
            <ul className="space-y-2">
              {result.urgentWarnings.map((warning: string, i: number) => (
                <li key={i} className="text-red-900 font-semibold text-sm flex items-start gap-2">
                  <span className="text-red-600 mt-1">⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Comprehensive Management Plan (PDF)
          </button>

          {/* Generate Consult Letter */}
          <button
            onClick={handleConsultLetter}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
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
                    placeholder="e.g., Hematology Department"
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
                    placeholder="e.g., Management of recurrent sickle cell crises and leg ulcers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Clinical Findings (Optional - Management plan will be included automatically)
                  </label>
                  <textarea
                    value={clinicalFindings}
                    onChange={(e) => setClinicalFindings(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={4}
                    placeholder="e.g., Patient with frequent painful crises, current Hb 7.5 g/dL, bilateral leg ulcers..."
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
                    placeholder="e.g., Please advise on hydroxyurea therapy, transfusion requirements, and ulcer management"
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

      {/* Medical Disclaimer */}
      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 text-sm text-gray-700">
        <strong>Medical Disclaimer:</strong> This tool provides evidence-based guidance for sickle cell disease management based on WHO guidelines. Individual patient needs may vary. Always consult with a qualified hematologist or healthcare provider for personalized care. Emergency situations require immediate medical attention.
      </div>
    </div>
  );
}
