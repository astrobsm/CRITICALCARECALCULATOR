'use client';

import { useState } from 'react';
import { Calculator, UtensilsCrossed, Apple, Download, Info, AlertCircle } from 'lucide-react';
import { generateNutritionPDF } from '@/lib/pdfGenerator';
import { PatientInfoProps } from '@/lib/types';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
}

// Nigerian/African food composition data
const nigerianFoods: FoodItem[] = [
  // Staples
  { name: 'Rice (white, cooked)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: '100g' },
  { name: 'Jollof Rice', calories: 180, protein: 4, carbs: 32, fats: 4, serving: '100g' },
  { name: 'Fufu (cassava)', calories: 267, protein: 0.6, carbs: 65, fats: 0.2, serving: '100g' },
  { name: 'Eba (garri)', calories: 360, protein: 1.6, carbs: 88, fats: 0.5, serving: '100g' },
  { name: 'Pounded Yam', calories: 118, protein: 1.5, carbs: 28, fats: 0.2, serving: '100g' },
  { name: 'Plantain (boiled)', calories: 116, protein: 1.0, carbs: 31, fats: 0.2, serving: '100g' },
  { name: 'Yam (boiled)', calories: 116, protein: 1.5, carbs: 27.5, fats: 0.1, serving: '100g' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g' },
  
  // Proteins
  { name: 'Chicken (grilled)', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g' },
  { name: 'Beef (lean)', calories: 250, protein: 26, carbs: 0, fats: 17, serving: '100g' },
  { name: 'Fish (Tilapia)', calories: 128, protein: 26, carbs: 0, fats: 2.7, serving: '100g' },
  { name: 'Catfish (grilled)', calories: 105, protein: 18, carbs: 0, fats: 2.9, serving: '100g' },
  { name: 'Eggs (boiled)', calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: '100g (2 eggs)' },
  { name: 'Beans (cooked)', calories: 127, protein: 8.7, carbs: 22.8, fats: 0.5, serving: '100g' },
  { name: 'Moi Moi (bean pudding)', calories: 180, protein: 10, carbs: 20, fats: 6, serving: '100g' },
  { name: 'Groundnut (peanuts)', calories: 567, protein: 25.8, carbs: 16.1, fats: 49.2, serving: '100g' },
  
  // Soups & Stews
  { name: 'Egusi Soup', calories: 320, protein: 12, carbs: 8, fats: 28, serving: '250ml' },
  { name: 'Okro Soup', calories: 150, protein: 8, carbs: 10, fats: 10, serving: '250ml' },
  { name: 'Efo Riro (vegetable soup)', calories: 200, protein: 10, carbs: 8, fats: 15, serving: '250ml' },
  { name: 'Pepper Soup', calories: 120, protein: 15, carbs: 5, fats: 4, serving: '250ml' },
  { name: 'Groundnut Soup', calories: 280, protein: 12, carbs: 12, fats: 22, serving: '250ml' },
  
  // Vegetables
  { name: 'Ugwu (fluted pumpkin leaves)', calories: 30, protein: 3.8, carbs: 5.4, fats: 0.5, serving: '100g' },
  { name: 'Waterleaf', calories: 22, protein: 2.5, carbs: 3.8, fats: 0.3, serving: '100g' },
  { name: 'Bitter Leaf', calories: 25, protein: 3.2, carbs: 4.5, fats: 0.4, serving: '100g' },
  { name: 'Okro (okra)', calories: 33, protein: 1.9, carbs: 7.5, fats: 0.2, serving: '100g' },
  { name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, serving: '100g' },
  
  // Fruits
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving: '100g' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '100g' },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, serving: '100g' },
  { name: 'Papaya (pawpaw)', calories: 43, protein: 0.5, carbs: 11, fats: 0.3, serving: '100g' },
  { name: 'Pineapple', calories: 50, protein: 0.5, carbs: 13, fats: 0.1, serving: '100g' },
  
  // Beverages & Others
  { name: 'Palm Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
  { name: 'Groundnut Oil', calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
  { name: 'Milk (whole)', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, serving: '100ml' },
  { name: 'Yogurt', calories: 59, protein: 3.5, carbs: 4.7, fats: 3.3, serving: '100ml' },
];

interface MealPlan {
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

export default function NutritionCalculator({ patientInfo }: PatientInfoProps) {
  const [burnBSA, setBurnBSA] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate'>('light');
  const [result, setResult] = useState<any>(null);

  const calculateNutrition = () => {
    const bsa = parseFloat(burnBSA);
    const wt = parseFloat(weight);
    const patientAge = parseFloat(age);

    if (isNaN(bsa) || isNaN(wt) || bsa < 0 || bsa > 100) {
      alert('Please enter valid burn BSA (0-100%) and weight');
      return;
    }

    // Check comorbidities for dietary modifications
    const hasDiabetes = patientInfo.comorbidities.includes('Diabetes Mellitus');
    const hasCKD = patientInfo.comorbidities.includes('Chronic Kidney Disease');
    const hasHeartFailure = patientInfo.comorbidities.includes('Heart Failure');
    const hasHypertension = patientInfo.comorbidities.includes('Hypertension');
    
    // Curreri Formula for burns
    const basalCalories = 25 * wt;
    const burnCalories = 40 * bsa;
    const activityMultiplier = activityLevel === 'sedentary' ? 1.0 : activityLevel === 'light' ? 1.2 : 1.4;
    const totalCalories = (basalCalories + burnCalories) * activityMultiplier;

    // Protein requirements (burns require high protein, adjust for CKD)
    let proteinRequirement = bsa < 20 ? 1.5 * wt : bsa < 40 ? 2.0 * wt : 2.5 * wt;
    if (hasCKD) {
      proteinRequirement = Math.min(proteinRequirement, 1.2 * wt); // Restrict in CKD
    }
    
    // Macronutrient distribution
    const proteinCalories = proteinRequirement * 4; // 4 kcal/g protein
    const fatCalories = totalCalories * 0.30; // 30% from fats
    const carbCalories = totalCalories - proteinCalories - fatCalories;
    
    const carbsGrams = carbCalories / 4; // 4 kcal/g carbs
    const fatsGrams = fatCalories / 9; // 9 kcal/g fats

    // Micronutrients (increased needs in burns)
    const vitaminC = bsa > 20 ? 2000 : 1000; // mg/day
    const zinc = bsa > 20 ? 40 : 25; // mg/day
    const vitaminA = 5000; // IU/day

    // Dietary warnings based on comorbidities
    let dietaryWarnings = [];
    if (hasDiabetes) {
      dietaryWarnings.push('DIABETES: Monitor blood glucose. Prefer low glycemic index foods. Avoid concentrated sweets.');
    }
    if (hasCKD) {
      dietaryWarnings.push('CKD: Limit protein, potassium, phosphorus, and sodium. Monitor fluid intake.');
    }
    if (hasHeartFailure || hasHypertension) {
      dietaryWarnings.push('CARDIOVASCULAR: Low sodium diet (<2g/day). Limit fluids if heart failure.');
    }

    // Generate weekly meal plan
    const mealPlan = generateWeeklyMealPlan(totalCalories, proteinRequirement, carbsGrams, fatsGrams, hasDiabetes, hasCKD);

    const calculationResult = {
      weight: wt,
      age: patientAge,
      burnBSA: bsa,
      activityLevel,
      totalCalories: totalCalories.toFixed(0),
      proteinRequirement: proteinRequirement.toFixed(0),
      carbsGrams: carbsGrams.toFixed(0),
      fatsGrams: fatsGrams.toFixed(0),
      vitaminC,
      zinc,
      vitaminA,
      mealPlan,
      mealsPerDay: 6, // Small frequent meals for burns
      fluidRequirement: (30 * wt).toFixed(0), // 30ml/kg baseline
      dietaryWarnings,
      comorbidities: patientInfo.comorbidities,
    };

    setResult(calculationResult);
  };

  const generateWeeklyMealPlan = (calories: number, protein: number, carbs: number, fats: number, hasDiabetes: boolean = false, hasCKD: boolean = false): MealPlan[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Calculate target per meal (6 meals: 3 main + 3 snacks)
    const breakfastCal = calories * 0.25;
    const lunchCal = calories * 0.35;
    const dinnerCal = calories * 0.25;
    const snacksCal = calories * 0.15;
    
    const breakfastProtein = protein * 0.25;
    const lunchProtein = protein * 0.35;
    const dinnerProtein = protein * 0.25;
    
    // Helper function to calculate portion size
    const calcPortion = (food: FoodItem, targetCal: number): string => {
      const grams = Math.round((targetCal / food.calories) * 100);
      return `${grams}g ${food.name}`;
    };
    
    const calcProteinPortion = (food: FoodItem, targetProtein: number): string => {
      const grams = Math.round((targetProtein / food.protein) * 100);
      return `${grams}g ${food.name}`;
    };
    
    // Find foods by name helper
    const getFood = (name: string) => nigerianFoods.find(f => f.name === name) || nigerianFoods[0];
    
    const breakfastPlans = [
      [
        calcPortion(getFood('Yam (boiled)'), breakfastCal * 0.5),
        calcProteinPortion(getFood('Eggs (boiled)'), breakfastProtein * 0.6),
        '200ml Orange juice',
        '150ml Milk (whole)'
      ],
      [
        calcPortion(getFood('Moi Moi (bean pudding)'), breakfastCal * 0.4),
        '2 slices Bread (80g)',
        '200ml Tea with milk',
        '1 medium Banana'
      ],
      [
        '200g Akara (bean cakes)',
        '300ml Pap (ogi)',
        calcPortion(getFood('Banana'), breakfastCal * 0.15)
      ],
      [
        calcProteinPortion(getFood('Eggs (boiled)'), breakfastProtein),
        '100g Bread with margarine',
        calcPortion(getFood('Mango'), breakfastCal * 0.15),
        '200ml Mango juice'
      ],
      [
        calcPortion(getFood('Plantain (boiled)'), breakfastCal * 0.45),
        calcProteinPortion(getFood('Eggs (boiled)'), breakfastProtein * 0.7),
        calcPortion(getFood('Papaya (pawpaw)'), breakfastCal * 0.15)
      ],
      [
        '250g Rice porridge',
        calcProteinPortion(getFood('Eggs (boiled)'), breakfastProtein),
        '150ml Milk (whole)',
        '1 medium Orange'
      ],
      [
        calcPortion(getFood('Sweet Potato'), breakfastCal * 0.45),
        '100g Groundnut sauce',
        calcPortion(getFood('Orange'), breakfastCal * 0.15)
      ],
    ];

    const lunchPlans = [
      [
        calcPortion(getFood('Jollof Rice'), lunchCal * 0.45),
        calcProteinPortion(getFood('Chicken (grilled)'), lunchProtein * 0.7),
        '100g Vegetable salad',
        calcPortion(getFood('Plantain (boiled)'), lunchCal * 0.15)
      ],
      [
        calcPortion(getFood('Pounded Yam'), lunchCal * 0.4),
        `${Math.round(lunchCal * 0.3 / 1.28)}ml Egusi Soup`,
        calcProteinPortion(getFood('Fish (Tilapia)'), lunchProtein * 0.6),
        calcPortion(getFood('Ugwu (fluted pumpkin leaves)'), 50)
      ],
      [
        calcPortion(getFood('Rice (white, cooked)'), lunchCal * 0.4),
        `${Math.round(lunchCal * 0.35 / 1.12)}ml Groundnut Soup`,
        calcProteinPortion(getFood('Beef (lean)'), lunchProtein * 0.7),
        calcPortion(getFood('Waterleaf'), 80)
      ],
      [
        calcPortion(getFood('Eba (garri)'), lunchCal * 0.35),
        `${Math.round(lunchCal * 0.3 / 0.6)}ml Okro Soup`,
        calcProteinPortion(getFood('Catfish (grilled)'), lunchProtein * 0.7),
        calcPortion(getFood('Bitter Leaf'), 80)
      ],
      [
        calcPortion(getFood('Yam (boiled)'), lunchCal * 0.4),
        `${Math.round(lunchCal * 0.35 / 0.8)}ml Efo Riro (vegetable soup)`,
        calcProteinPortion(getFood('Chicken (grilled)'), lunchProtein * 0.65),
        '100g Tomato stew'
      ],
      [
        calcPortion(getFood('Jollof Rice'), lunchCal * 0.45),
        calcProteinPortion(getFood('Fish (Tilapia)'), lunchProtein * 0.6),
        '100g Coleslaw',
        calcPortion(getFood('Moi Moi (bean pudding)'), lunchCal * 0.15)
      ],
      [
        calcPortion(getFood('Fufu (cassava)'), lunchCal * 0.35),
        `${Math.round(lunchCal * 0.3 / 0.48)}ml Pepper Soup`,
        '150g Assorted meat',
        '100g Mixed vegetables'
      ],
    ];

    const dinnerPlans = [
      [
        calcPortion(getFood('Beans (cooked)'), dinnerCal * 0.4),
        calcPortion(getFood('Plantain (boiled)'), dinnerCal * 0.3),
        '100g Fish sauce',
        calcPortion(getFood('Orange'), dinnerCal * 0.1)
      ],
      [
        '250g Yam porridge with vegetables',
        calcProteinPortion(getFood('Eggs (boiled)'), dinnerProtein * 0.8),
        '100ml Vegetable soup'
      ],
      [
        calcPortion(getFood('Rice (white, cooked)'), dinnerCal * 0.45),
        '150g Vegetable stew',
        calcProteinPortion(getFood('Chicken (grilled)'), dinnerProtein * 0.7),
        '80g Salad'
      ],
      [
        calcPortion(getFood('Eba (garri)'), dinnerCal * 0.4),
        `${Math.round(dinnerCal * 0.3 / 0.8)}ml Efo Riro`,
        calcProteinPortion(getFood('Beef (lean)'), dinnerProtein * 0.65),
        calcPortion(getFood('Waterleaf'), 80)
      ],
      [
        calcPortion(getFood('Moi Moi (bean pudding)'), dinnerCal * 0.45),
        '200ml Pap (ogi)',
        calcProteinPortion(getFood('Fish (Tilapia)'), dinnerProtein * 0.5)
      ],
      [
        calcPortion(getFood('Jollof Rice'), dinnerCal * 0.5),
        calcProteinPortion(getFood('Chicken (grilled)'), dinnerProtein * 0.7),
        '100g Coleslaw'
      ],
      [
        calcPortion(getFood('Yam (boiled)'), dinnerCal * 0.45),
        '120g Egg sauce',
        '150ml Vegetable soup'
      ],
    ];

    const snackPlans = [
      [
        calcPortion(getFood('Groundnut (peanuts)'), snacksCal * 0.5),
        calcPortion(getFood('Banana'), snacksCal * 0.3),
        '150ml Yogurt'
      ],
      [
        '100g Chin-chin',
        '200ml Milk (whole)',
        '1 medium Apple'
      ],
      [
        '150g Boiled groundnuts',
        calcPortion(getFood('Orange'), snacksCal * 0.4)
      ],
      [
        '150g Fruit salad (mango, pineapple, banana)',
        '150ml Yogurt',
        '50g Mixed nuts'
      ],
      [
        '120g Akara',
        '200ml Zobo drink',
        '1 medium Banana'
      ],
      [
        calcPortion(getFood('Plantain (boiled)'), snacksCal * 0.6),
        calcPortion(getFood('Groundnut (peanuts)'), snacksCal * 0.3)
      ],
      [
        '100g Coconut chunks',
        '200ml Orange juice',
        '50g Cashew nuts'
      ],
    ];

    return days.map((day, index) => ({
      day,
      breakfast: breakfastPlans[index],
      lunch: lunchPlans[index],
      dinner: dinnerPlans[index],
      snacks: snackPlans[index],
    }));
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateNutritionPDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Burn Nutrition Calculator</h2>
      </div>

      <div className="bg-green-50 p-4 rounded-md mb-6 flex items-start gap-2">
        <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">Nutritional Support in Burns:</p>
          <p>Burns dramatically increase metabolic demands. High-protein, high-calorie diet is essential for wound healing and recovery.
          This calculator uses Nigerian/African food composition data to create culturally appropriate meal plans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Total Burn BSA (%) *
            </label>
            <input
              type="number"
              step="0.5"
              value={burnBSA}
              onChange={(e) => setBurnBSA(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 25"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from Burns Calculator
            </p>
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

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="e.g., 35"
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="sedentary">Bedbound/Sedentary</option>
              <option value="light">Light Activity (sitting, limited movement)</option>
              <option value="moderate">Moderate Activity (physiotherapy, mobilizing)</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-md">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Nigerian Food Database</p>
            <p className="text-xs text-gray-600">
              This calculator uses {nigerianFoods.length} common Nigerian/African foods including:
              rice, yam, plantain, egusi, okro, fish, chicken, beans, vegetables, and local fruits.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={calculateNutrition}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate Nutrition Plan
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Nutritional Requirements */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Apple className="w-6 h-6 text-green-600" />
              Daily Nutritional Requirements
            </h3>

            {/* Dietary Warnings */}
            {result.dietaryWarnings && result.dietaryWarnings.length > 0 && (
              <div className="mb-4 space-y-2">
                {result.dietaryWarnings.map((warning: string, index: number) => (
                  <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded">
                    <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {warning}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">Total Calories</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{result.totalCalories} kcal</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">Protein</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{result.proteinRequirement} g</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">Carbohydrates</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{result.carbsGrams} g</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-md">
                <p className="text-xs sm:text-sm text-gray-600">Fats</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{result.fatsGrams} g</p>
              </div>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-orange-50 p-2 sm:p-3 rounded-md">
                <p className="text-xs text-gray-600">Vitamin C</p>
                <p className="text-base sm:text-lg font-bold text-orange-700">{result.vitaminC} mg/day</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-md">
                <p className="text-xs text-gray-600">Zinc</p>
                <p className="text-base sm:text-lg font-bold text-blue-700">{result.zinc} mg/day</p>
              </div>
              <div className="bg-yellow-50 p-2 sm:p-3 rounded-md">
                <p className="text-xs text-gray-600">Vitamin A</p>
                <p className="text-base sm:text-lg font-bold text-yellow-700">{result.vitaminA} IU/day</p>
              </div>
            </div>

            <div className="mt-4 bg-white p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Fluid Requirement:</strong> {result.fluidRequirement} mL/day (baseline) + burn losses
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Meal Frequency:</strong> 6 small meals per day to meet high caloric needs
              </p>
            </div>
          </div>

          {/* Weekly Meal Plan */}
          <div className="bg-white border-2 border-green-600 rounded-lg p-3 sm:p-4 md:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">7-Day Nigerian Meal Plan</h3>
            
            <div className="space-y-4 sm:space-y-6">
              {result.mealPlan.map((day: MealPlan, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-bold text-base sm:text-lg text-primary-600 mb-2 sm:mb-3">{day.day}</h4>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-yellow-50 p-2 sm:p-3 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 mb-1">🌅 BREAKFAST</p>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                        {day.breakfast.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-2 sm:p-3 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 mb-1">🌞 LUNCH</p>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                        {day.lunch.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-2 sm:p-3 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 mb-1">🌙 DINNER</p>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                        {day.dinner.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>

                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-xs font-semibold text-gray-700 mb-1">🍎 SNACKS</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {day.snacks.map((item, i) => <li key={i}>• {item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutritional Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Special Nutritional Considerations for Burns</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>High Protein:</strong> Essential for wound healing - aim for 2-2.5g/kg in major burns</li>
              <li>• <strong>Frequent meals:</strong> 6 small meals better tolerated than 3 large meals</li>
              <li>• <strong>Vitamin C:</strong> Crucial for collagen synthesis - increase to 2000mg/day in severe burns</li>
              <li>• <strong>Zinc supplementation:</strong> Promotes wound healing and immune function</li>
              <li>• <strong>Enteral feeding preferred:</strong> Start within 24-48 hours if possible</li>
              <li>• <strong>Monitor weight daily:</strong> Prevent malnutrition and muscle wasting</li>
              <li>• <strong>Hydration:</strong> Adequate fluid intake crucial - monitor urine output</li>
              <li>• <strong>Avoid:</strong> Excessive sugar, processed foods, low-protein options</li>
            </ul>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Nutrition Plan PDF
          </button>
        </div>
      )}
    </div>
  );
}
