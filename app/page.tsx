'use client';

import { useState } from 'react';
import Image from 'next/image';
import SodiumCalculator from '@/components/calculators/SodiumCalculator';
import PotassiumCalculator from '@/components/calculators/PotassiumCalculator';
import AcidBaseCalculator from '@/components/calculators/AcidBaseCalculator';
import GFRCalculator from '@/components/calculators/GFRCalculator';
import BNFDrugCalculator from '@/components/calculators/BNFDrugCalculator';
import BurnsCalculator from '@/components/calculators/BurnsCalculator';
import NutritionCalculator from '@/components/calculators/NutritionCalculator';
import DVTRiskCalculator from '@/components/calculators/DVTRiskCalculator';
import PressureSoreCalculator from '@/components/calculators/PressureSoreCalculator';
import NutritionalAssessmentCalculator from '@/components/calculators/NutritionalAssessmentCalculator';
import WoundHealingMealPlanCalculator from '@/components/calculators/WoundHealingMealPlanCalculator';
import WeightReductionCalculator from '@/components/calculators/WeightReductionCalculator';
import WeightGainCalculator from '@/components/calculators/WeightGainCalculator';
import InstallPrompt from '@/components/InstallPrompt';
import { Activity, Droplet, Zap, FlaskConical, Pill, Flame, UtensilsCrossed, User, Heart, Bed, Apple, Soup, TrendingDown, TrendingUp } from 'lucide-react';
import { PatientInfo } from '@/lib/types';

type CalculatorTab = 'sodium' | 'potassium' | 'acidbase' | 'gfr' | 'bnf' | 'burns' | 'nutrition' | 'dvt' | 'pressuresore' | 'nutritionalassessment' | 'woundmealplan' | 'weightloss' | 'weightgain';

export default function Home() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('sodium');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    gender: 'male',
    hospital: '',
    hospitalNumber: '',
    diagnosis: '',
    comorbidities: []
  });
  const [showPatientForm, setShowPatientForm] = useState(false);

  const availableComorbidities = [
    'Diabetes Mellitus',
    'Hypertension',
    'Chronic Kidney Disease',
    'Heart Failure',
    'COPD',
    'Asthma',
    'Liver Cirrhosis',
    'Coronary Artery Disease',
    'Atrial Fibrillation',
    'Stroke/CVA',
    'Obesity',
    'Malnutrition',
    'HIV/AIDS',
    'Cancer',
    'Immunosuppression'
  ];

  const toggleComorbidity = (comorbidity: string) => {
    setPatientInfo(prev => ({
      ...prev,
      comorbidities: prev.comorbidities.includes(comorbidity)
        ? prev.comorbidities.filter(c => c !== comorbidity)
        : [...prev.comorbidities, comorbidity]
    }));
  };

  const tabs = [
    { id: 'sodium' as CalculatorTab, label: 'Sodium', icon: Droplet },
    { id: 'potassium' as CalculatorTab, label: 'Potassium', icon: Zap },
    { id: 'acidbase' as CalculatorTab, label: 'Acid-Base', icon: FlaskConical },
    { id: 'gfr' as CalculatorTab, label: 'GFR', icon: Activity },
    { id: 'bnf' as CalculatorTab, label: 'BNF Drugs', icon: Pill },
    { id: 'burns' as CalculatorTab, label: 'Burns', icon: Flame },
    { id: 'nutrition' as CalculatorTab, label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'dvt' as CalculatorTab, label: 'DVT Risk', icon: Heart },
    { id: 'pressuresore' as CalculatorTab, label: 'Pressure Sore', icon: Bed },
    { id: 'nutritionalassessment' as CalculatorTab, label: 'MUST Score', icon: Apple },
    { id: 'woundmealplan' as CalculatorTab, label: 'Wound Meal Plan', icon: Soup },
    { id: 'weightloss' as CalculatorTab, label: 'Weight Loss', icon: TrendingDown },
    { id: 'weightgain' as CalculatorTab, label: 'Weight Gain', icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="CCC Logo" 
              width={48} 
              height={48}
              className="w-12 h-12 object-contain"
              priority
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Clinical Critical Calculator</h1>
              <p className="text-sm text-primary-100 mt-1">WHO-Aligned Critical Care Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Information Banner */}
      {patientInfo.name && (
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-b-2 border-blue-300 no-print">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div><strong>Patient:</strong> {patientInfo.name}</div>
                {patientInfo.hospital && <div><strong>Hospital:</strong> {patientInfo.hospital}</div>}
                <div><strong>Age:</strong> {patientInfo.age} years</div>
                <div><strong>Gender:</strong> {patientInfo.gender === 'male' ? 'Male' : 'Female'}</div>
                <div><strong>Hospital #:</strong> {patientInfo.hospitalNumber}</div>
                {patientInfo.diagnosis && <div><strong>Dx:</strong> {patientInfo.diagnosis}</div>}
              </div>
              <button
                onClick={() => setShowPatientForm(true)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Edit
              </button>
            </div>
            {patientInfo.comorbidities.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Comorbidities:</strong> {patientInfo.comorbidities.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10 no-print">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setShowPatientForm(true)}
              className="flex items-center gap-2 px-4 py-4 font-semibold text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap border-r border-gray-200"
            >
              <User className="w-5 h-5" />
              Patient Info
            </button>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Patient Information Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold">Patient Information</h2>
              <p className="text-sm text-blue-100 mt-1">Enter patient details for all calculators</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital *
                  </label>
                  <select
                    value={patientInfo.hospital}
                    onChange={(e) => setPatientInfo({...patientInfo, hospital: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Hospital</option>
                    <option value="St Marys Hospital">St Marys Hospital</option>
                    <option value="Niger Foundation Hospital">Niger Foundation Hospital</option>
                    <option value="Raymond Anikwe Hospital">Raymond Anikwe Hospital</option>
                    <option value="St Patrics Hospital">St Patrics Hospital</option>
                    <option value="Penoks Hospital">Penoks Hospital</option>
                    <option value="UNTH Ituku Ozalla">UNTH Ituku Ozalla</option>
                    <option value="Mercy Hospital">Mercy Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Number *
                  </label>
                  <input
                    type="text"
                    value={patientInfo.hospitalNumber}
                    onChange={(e) => setPatientInfo({...patientInfo, hospitalNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., MRN123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={patientInfo.diagnosis}
                  onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="Primary diagnosis"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comorbidities
                  <span className="text-xs text-gray-500 ml-2">(Select all that apply - affects drug dosing, fluid management, and nutrition)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {availableComorbidities.map((comorbidity) => (
                    <label key={comorbidity} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={patientInfo.comorbidities.includes(comorbidity)}
                        onChange={() => toggleComorbidity(comorbidity)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{comorbidity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3 border-t">
              <button
                onClick={() => setShowPatientForm(false)}
                className="flex-1 px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
              >
                Save & Continue
              </button>
              <button
                onClick={() => setShowPatientForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'sodium' && <SodiumCalculator patientInfo={patientInfo} />}
          {activeTab === 'potassium' && <PotassiumCalculator patientInfo={patientInfo} />}
          {activeTab === 'acidbase' && <AcidBaseCalculator patientInfo={patientInfo} />}
          {activeTab === 'gfr' && <GFRCalculator patientInfo={patientInfo} />}
          {activeTab === 'bnf' && <BNFDrugCalculator patientInfo={patientInfo} />}
          {activeTab === 'burns' && <BurnsCalculator patientInfo={patientInfo} />}
          {activeTab === 'nutrition' && <NutritionCalculator patientInfo={patientInfo} />}
          {activeTab === 'dvt' && <DVTRiskCalculator patientInfo={patientInfo} />}
          {activeTab === 'pressuresore' && <PressureSoreCalculator patientInfo={patientInfo} />}
          {activeTab === 'nutritionalassessment' && <NutritionalAssessmentCalculator patientInfo={patientInfo} />}
          {activeTab === 'woundmealplan' && <WoundHealingMealPlanCalculator patientInfo={patientInfo} />}
          {activeTab === 'weightloss' && <WeightReductionCalculator patientInfo={patientInfo} />}
          {activeTab === 'weightgain' && <WeightGainCalculator patientInfo={patientInfo} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16 no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            Clinical Critical Calculator - For healthcare professionals only
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Based on WHO guidelines and standard ICU protocols. Always verify calculations and use clinical judgment.
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </main>
  );
}
