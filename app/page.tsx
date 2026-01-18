'use client';

import { useState, useEffect } from 'react';
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
import SickleCellManagementCalculator from '@/components/calculators/SickleCellManagementCalculator';
import EmergencyResuscitationCalculator from '@/components/calculators/EmergencyResuscitationCalculator';
import InstallPrompt from '@/components/InstallPrompt';
import { Activity, Droplet, Zap, FlaskConical, Pill, Flame, UtensilsCrossed, User, Heart, Bed, Apple, Soup, TrendingDown, TrendingUp, WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { PatientInfo } from '@/lib/types';

type CalculatorTab = 'sodium' | 'potassium' | 'acidbase' | 'gfr' | 'bnf' | 'burns' | 'nutrition' | 'dvt' | 'pressuresore' | 'nutritionalassessment' | 'woundmealplan' | 'weightloss' | 'weightgain' | 'sicklecell' | 'emergency';

// LocalStorage key for patient info
const PATIENT_INFO_KEY = 'ccc_patient_info';
const ACTIVE_TAB_KEY = 'ccc_active_tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('sodium');
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
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

  // Hydration check - ensures client-side code is loaded
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load patient info from localStorage on mount
  useEffect(() => {
    if (!isHydrated) return;
    
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Load saved patient info
    try {
      const savedPatientInfo = localStorage.getItem(PATIENT_INFO_KEY);
      if (savedPatientInfo) {
        const parsed = JSON.parse(savedPatientInfo);
        setPatientInfo(parsed);
      }
    } catch (e) {
      console.log('Could not load saved patient info');
    }

    // Load saved active tab
    try {
      const savedTab = localStorage.getItem(ACTIVE_TAB_KEY);
      if (savedTab && isValidTab(savedTab)) {
        setActiveTab(savedTab as CalculatorTab);
      }
    } catch (e) {
      console.log('Could not load saved tab');
    }

    // Online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isHydrated]);

  // Helper to validate tab
  const isValidTab = (tab: string): boolean => {
    const validTabs = ['sodium', 'potassium', 'acidbase', 'gfr', 'bnf', 'burns', 'nutrition', 'dvt', 'pressuresore', 'nutritionalassessment', 'woundmealplan', 'weightloss', 'weightgain', 'sicklecell', 'emergency'];
    return validTabs.includes(tab);
  };

  // Tab change handler with immediate feedback
  const handleTabChange = (tabId: CalculatorTab) => {
    setActiveTab(tabId);
  };

  // Save patient info to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PATIENT_INFO_KEY, JSON.stringify(patientInfo));
    } catch (e) {
      console.log('Could not save patient info');
    }
  }, [patientInfo]);

  // Save active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
    } catch (e) {
      console.log('Could not save active tab');
    }
  }, [activeTab]);

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
    'Immunosuppression',
    'Sickle Cell Disease'
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
    { id: 'sicklecell' as CalculatorTab, label: 'Sickle Cell', icon: Heart },
    { id: 'emergency' as CalculatorTab, label: 'Emergency CDS', icon: AlertTriangle },
  ];

  return (
    <main className="min-h-screen bg-[#1e3a5f] overflow-x-hidden">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-500 text-black px-3 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 safe-area-top">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Offline - All calculators work! Data saved locally.</span>
        </div>
      )}

      {/* Header - Navy Blue Theme */}
      <header className="bg-[#0f2240] text-white shadow-lg safe-area-top border-b border-sky-400">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image 
                src="/icon-192.png" 
                alt="Clinical Critical Calculator Logo" 
                width={48} 
                height={48}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain flex-shrink-0 rounded-lg"
                priority
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-heading font-bold truncate text-white">Clinical Critical Calculator</h1>
                <p className="text-xs sm:text-sm text-sky-200 mt-0.5 hidden sm:block">WHO-Aligned Critical Care Management</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              {isOnline ? (
                <span className="flex items-center gap-1 text-green-400">
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-400">
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Patient Information Banner */}
      {patientInfo.name && (
        <div className="bg-[#234b7a] border-b-2 border-sky-400 no-print">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4 md:gap-6 text-xs sm:text-sm min-w-0 text-white">
                <div className="truncate"><strong className="font-clinical text-sky-300">Patient:</strong> {patientInfo.name}</div>
                {patientInfo.hospital && <div className="truncate hidden sm:block"><strong className="font-clinical text-sky-300">Hospital:</strong> {patientInfo.hospital}</div>}
                <div><strong className="font-clinical text-sky-300">Age:</strong> <span className="font-mono">{patientInfo.age}y</span></div>
                <div><strong className="font-clinical text-sky-300">Gender:</strong> {patientInfo.gender === 'male' ? 'M' : 'F'}</div>
                <div className="truncate"><strong className="font-clinical text-sky-300">MRN:</strong> <span className="font-mono">{patientInfo.hospitalNumber}</span></div>
                {patientInfo.diagnosis && <div className="truncate col-span-2 sm:col-span-1"><strong className="font-clinical text-sky-300">Dx:</strong> {patientInfo.diagnosis}</div>}
              </div>
              <button
                type="button"
                onClick={() => setShowPatientForm(true)}
                className="text-xs text-sky-300 hover:text-sky-100 underline flex-shrink-0 touch-manipulation min-h-[32px] flex items-center font-medium"
              >
                Edit
              </button>
            </div>
            {patientInfo.comorbidities.length > 0 && (
              <div className="mt-1 sm:mt-2 text-xs line-clamp-2 text-white">
                <strong className="font-clinical text-sky-300">Comorbidities:</strong> {patientInfo.comorbidities.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation - Navy Theme with White Text */}
      <nav className="bg-[#162d4d] shadow-md sticky top-0 z-10 no-print border-b border-sky-500">
        <div className="container mx-auto px-0 sm:px-4">
          <div className="flex overflow-x-auto scrollbar-hide -webkit-overflow-scrolling-touch">
            <button
              type="button"
              onClick={() => setShowPatientForm(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium sm:font-semibold text-sky-300 hover:bg-[#234b7a] transition-all whitespace-nowrap border-r border-sky-600 touch-manipulation text-xs sm:text-sm min-h-[48px]"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Patient</span>
              <span className="xs:hidden">Info</span>
            </button>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 py-3 sm:py-4 font-medium sm:font-semibold transition-all whitespace-nowrap touch-manipulation text-xs sm:text-sm min-h-[48px] ${
                    activeTab === tab.id
                      ? 'text-white border-b-3 border-sky-400 bg-[#234b7a]'
                      : 'text-sky-200 hover:text-white hover:bg-[#234b7a] active:bg-[#0f2240]'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Patient Information Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#1e3a5f] rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-sky-400">
            <div className="sticky top-0 bg-[#0f2240] text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-lg flex-shrink-0 border-b border-sky-400">
              <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-white">Patient Information</h2>
              <p className="text-xs sm:text-sm text-sky-200 mt-0.5 sm:mt-1">Enter patient details for all calculators</p>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black touch-manipulation placeholder-gray-600"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                    Hospital *
                  </label>
                  <select
                    value={patientInfo.hospital}
                    onChange={(e) => setPatientInfo({...patientInfo, hospital: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black touch-manipulation"
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
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                    Hospital Number *
                  </label>
                  <input
                    type="text"
                    value={patientInfo.hospitalNumber}
                    onChange={(e) => setPatientInfo({...patientInfo, hospitalNumber: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black font-mono touch-manipulation placeholder-gray-600"
                    placeholder="e.g., MRN123456"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black font-mono touch-manipulation placeholder-gray-600"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                    Gender *
                  </label>
                  <select
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black touch-manipulation"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={patientInfo.diagnosis}
                  onChange={(e) => setPatientInfo({...patientInfo, diagnosis: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-sky-400 rounded-md focus:ring-2 focus:ring-sky-300 focus:border-sky-300 bg-sky-200 text-black touch-manipulation placeholder-gray-600"
                  placeholder="Primary diagnosis"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5 sm:mb-2">
                  Comorbidities
                  <span className="text-xs text-sky-200 ml-1 sm:ml-2 block sm:inline">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2 max-h-48 sm:max-h-60 overflow-y-auto border border-sky-400 rounded-md p-2 sm:p-3 bg-[#162d4d]">
                  {availableComorbidities.map((comorbidity) => (
                    <label key={comorbidity} className="flex items-center space-x-2 cursor-pointer hover:bg-[#234b7a] active:bg-[#0f2240] p-1.5 sm:p-1 rounded touch-manipulation min-h-[36px]">
                      <input
                        type="checkbox"
                        checked={patientInfo.comorbidities.includes(comorbidity)}
                        onChange={() => toggleComorbidity(comorbidity)}
                        className="w-5 h-5 sm:w-4 sm:h-4 text-sky-400 border-sky-400 rounded focus:ring-sky-300 bg-sky-200"
                      />
                      <span className="text-xs sm:text-sm text-white">{comorbidity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0f2240] px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg flex gap-2 sm:gap-3 border-t border-sky-400 safe-area-bottom">
              <button
                type="button"
                onClick={() => setShowPatientForm(false)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-2 bg-sky-500 text-black text-sm sm:text-base font-semibold rounded-md hover:bg-sky-400 active:bg-sky-600 transition-colors touch-manipulation min-h-[44px]"
              >
                Save & Continue
              </button>
              <button
                onClick={() => setShowPatientForm(false)}
                className="px-4 sm:px-6 py-3 sm:py-2 border border-sky-400 text-white text-sm sm:text-base font-semibold rounded-md hover:bg-[#234b7a] active:bg-[#162d4d] transition-colors touch-manipulation min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
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
          {activeTab === 'sicklecell' && <SickleCellManagementCalculator patientInfo={patientInfo} />}
          {activeTab === 'emergency' && <EmergencyResuscitationCalculator patientInfo={patientInfo} />}
        </div>
      </div>

      {/* Footer - Navy Blue Theme */}
      <footer className="bg-[#0f2240] text-white py-4 sm:py-6 mt-8 sm:mt-16 no-print safe-area-bottom border-t border-sky-400">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm sm:text-lg font-heading font-semibold text-sky-300 mb-2 sm:mb-3">
            POWERED BY BONNESANTE MEDICALS
          </p>
          <p className="text-xs sm:text-sm italic text-sky-200 mb-3 sm:mb-4">
            Caring for and healing with passion
          </p>
          <p className="text-xs sm:text-sm text-white">
            Clinical Critical Calculator - For healthcare professionals only
          </p>
          <p className="text-xs text-sky-200 mt-1 sm:mt-2 px-2">
            Based on WHO guidelines and standard ICU protocols. Always verify calculations and use clinical judgment.
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </main>
  );
}
