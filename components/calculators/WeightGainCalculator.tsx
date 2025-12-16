'use client';

import { useState } from 'react';
import { Download, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { generateWeightGainPDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function WeightGainCalculator({ patientInfo }: PatientInfoProps) {
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [appetiteLevel, setAppetiteLevel] = useState('');
  
  const [result, setResult] = useState<any>(null);

  const calculateMealPlan = () => {
    const currentWt = parseFloat(currentWeight);
    const heightM = parseFloat(height) / 100;
    const targetWt = parseFloat(targetWeight);
    const weeks = parseInt(timeframe);

    const currentBMI = currentWt / (heightM * heightM);
    const targetBMI = targetWt / (heightM * heightM);
    const weightToGain = targetWt - currentWt;
    const weeklyWeightGain = weightToGain / weeks;

    let safetyRating = 'Safe';
    let weeklyTarget = weeklyWeightGain;
    if (weeklyWeightGain > 0.5) {
      safetyRating = 'Too Aggressive - Risk of excessive fat gain';
      weeklyTarget = 0.5;
    } else {
      safetyRating = 'Safe and Sustainable - Good lean muscle gain';
    }

    let bmr = 0;
    if (patientInfo?.gender === 'female') {
      bmr = 655 + (9.6 * currentWt) + (1.8 * parseFloat(height)) - (4.7 * parseFloat(patientInfo.age || '25'));
    } else {
      bmr = 66 + (13.7 * currentWt) + (5 * parseFloat(height)) - (6.8 * parseFloat(patientInfo.age || '25'));
    }

    let activityMultiplier = 1.2;
    switch(activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
    }

    const tdee = Math.round(bmr * activityMultiplier);
    const targetCalories = Math.round(tdee + 500); // 500 kcal surplus
    const proteinGrams = Math.round(currentWt * 2.0);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const carbGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);

    const nutritionalTargets = [
      `DAILY CALORIC TARGET: ${targetCalories} kcal/day (Surplus: +500 kcal)`,
      `PROTEIN: ${proteinGrams}g/day (2.0g/kg for muscle growth)`,
      `CARBOHYDRATES: ${carbGrams}g/day (Energy for workouts)`,
      `FATS: ${fatGrams}g/day (Hormone production)`,
      '',
      `PROJECTED WEIGHT GAIN: ${weightToGain.toFixed(1)}kg in ${weeks} weeks`,
      `WEEKLY TARGET: ${weeklyTarget.toFixed(2)}kg/week (${safetyRating})`
    ];

    const guidelines = [
      'MUSCLE-BUILDING NUTRITION PRINCIPLES:',
      '',
      '1. CALORIC SURPLUS (500 kcal above maintenance)',
      '2. HIGH PROTEIN (2g/kg body weight)',
      '3. FREQUENT MEALS (5-6 meals daily)',
      '4. NUTRIENT TIMING (Pre/post workout nutrition)',
      '5. STRENGTH TRAINING (Progressive overload)'
    ];

    setResult({
      currentWeight: currentWt,
      currentBMI: currentBMI.toFixed(1),
      targetWeight: targetWt,
      targetBMI: targetBMI.toFixed(1),
      weightToGain: weightToGain.toFixed(1),
      weeks,
      weeklyWeightGain: weeklyTarget.toFixed(2),
      safetyRating,
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinGrams,
      carbGrams,
      fatGrams,
      nutritionalTargets,
      guidelines
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateWeightGainPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        <TrendingUp className="inline-block mr-2 mb-1" />
        Targeted Weight Gain Meal Plan
      </h2>
      
      <div className="bg-green-50 p-4 rounded mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-green-900">Healthy Weight Gain Program</p>
            <p className="text-green-800">Safe muscle building through caloric surplus, high protein, and resistance training.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Weight (kg) *</label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (cm) *</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Weight (kg) *</label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Timeframe (weeks) *</label>
            <input
              type="number"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Activity Level *</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full p-2 border rounded">
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Appetite Level</label>
            <select value={appetiteLevel} onChange={(e) => setAppetiteLevel(e.target.value)} className="w-full p-2 border rounded">
              <option value="">Select</option>
              <option value="poor">Poor (Struggle to eat)</option>
              <option value="normal">Normal</option>
              <option value="good">Good</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateMealPlan}
          disabled={!currentWeight || !height || !targetWeight || !timeframe || !activityLevel}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400"
        >
          Generate Weight Gain Plan
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded border-2 border-blue-300">
                <p className="text-sm">Current BMI</p>
                <p className="text-3xl font-bold text-blue-600">{result.currentBMI}</p>
              </div>
              <div className="bg-green-50 p-4 rounded border-2 border-green-300">
                <p className="text-sm">Target BMI</p>
                <p className="text-3xl font-bold text-green-600">{result.targetBMI}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded border-2 border-orange-300">
                <p className="text-sm">To Gain</p>
                <p className="text-3xl font-bold text-orange-600">{result.weightToGain}kg</p>
              </div>
              <div className="bg-purple-50 p-4 rounded border-2 border-purple-300">
                <p className="text-sm">Per Week</p>
                <p className="text-3xl font-bold text-purple-600">{result.weeklyWeightGain}kg</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-2xl mb-4">Daily Nutritional Targets</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded">
                  <p className="text-sm">Calories</p>
                  <p className="text-3xl font-bold text-green-600">{result.targetCalories}</p>
                  <p className="text-xs">kcal/day</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <p className="text-sm">Protein</p>
                  <p className="text-3xl font-bold text-red-600">{result.proteinGrams}g</p>
                  <p className="text-xs">High for muscle</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <p className="text-sm">Carbs</p>
                  <p className="text-3xl font-bold text-yellow-600">{result.carbGrams}g</p>
                  <p className="text-xs">Energy source</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <p className="text-sm">Fats</p>
                  <p className="text-3xl font-bold text-orange-600">{result.fatGrams}g</p>
                  <p className="text-xs">Hormones</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold mb-2">Guidelines</h3>
              {result.guidelines.map((g: string, i: number) => (
                <div key={i} className={g.includes('PRINCIPLES') || g.match(/^\d\./) ? 'font-semibold mt-2' : ''}>{g}</div>
              ))}
            </div>

            <button onClick={handleDownloadPDF} className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 flex items-center justify-center font-bold">
              <Download className="w-5 h-5 mr-2" />
              Download Weight Gain Plan PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
