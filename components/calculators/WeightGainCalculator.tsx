'use client';

import { useState } from 'react';
import { Download, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { generateWeightGainPDF } from '@/lib/pdfGenerator';
import ExportButtons from '@/components/ExportButtons';
import { ThermalContent, ShareContent } from '@/lib/exportUtils';

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

    // 7-Day Detailed Meal Plan
    const mealPlan = {
      title: '7-DAY WEIGHT GAIN MEAL PLAN',
      subtitle: `Nigerian-Adapted | ${targetCalories} kcal/day | High Protein for Muscle Growth`,
      days: [] as any[]
    };

    // Day 1
    mealPlan.days.push({
      day: 'DAY 1',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Yam porridge with fish (200g yam)',
            '• 3 whole eggs (scrambled)',
            '• 1 medium avocado',
            '• Fresh orange juice (homemade)',
            '• Handful of groundnuts',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Protein shake: Whey + banana + peanut butter + full-fat milk',
            '• 2 slices whole wheat bread with butter',
            '• Water (500ml)',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~30g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Large portion rice (250g cooked)',
            '• Beef stew with plenty of meat (200g)',
            '• Fried ripe plantain (2 medium)',
            '• Mixed vegetable salad with olive oil dressing',
            '• Zobo drink (with honey)',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• 2 bananas',
            '• Handful of dates',
            '• Water',
            `Calories: ~${Math.round(targetCalories * 0.10)} | Quick energy`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Grilled chicken (250g)',
            '• Large portion yam or sweet potato (200g)',
            '• Ugwu (fluted pumpkin) soup with palm oil',
            '• Protein shake if needed',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Greek yogurt (full-fat, 200g)',
            '• Handful of almonds or walnuts',
            '• Casein protein shake (optional)',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~15g`
          ]
        }
      ]
    });

    // Day 2
    mealPlan.days.push({
      day: 'DAY 2',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Plantain porridge with mackerel (3 ripe plantains)',
            '• 2 whole eggs (boiled)',
            '• Full-fat milk (500ml)',
            '• Bread with peanut butter',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Akara (bean cakes) - 6 pieces',
            '• Pap (ogi) with full-fat milk and sugar',
            '• Banana',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~25g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Jollof rice (large portion, 250g)',
            '• Grilled tilapia fish (whole, 300g)',
            '• Coleslaw with mayonnaise',
            '• Fried plantain',
            '• Fruit juice',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Energy bar or granola bar',
            '• Apple with peanut butter',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Pounded yam (large portion)',
            '• Egusi soup with assorted meat and fish',
            '• Extra protein shake (whey + milk)',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Cottage cheese (200g)',
            '• Mixed nuts (30g)',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~20g`
          ]
        }
      ]
    });

    // Day 3
    mealPlan.days.push({
      day: 'DAY 3',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Oatmeal (100g dry) with full-fat milk',
            '• 3 scrambled eggs with cheese',
            '• Sliced banana and berries',
            '• Honey and almonds on top',
            '• Orange juice',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Meat pie or sausage roll (2 pieces)',
            '• Banana smoothie with protein powder',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~28g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Fried rice with chicken (large portion)',
            '• Beef kebab (suya, 200g)',
            '• Moi-moi (bean pudding)',
            '• Chapman drink',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Peanut butter sandwich (2 slices)',
            '• Glass of milk',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Grilled turkey (250g)',
            '• Boiled yam with vegetable sauce (200g yam)',
            '• Waterleaf soup',
            '• Protein shake',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Protein pudding (whey + Greek yogurt)',
            '• Cashew nuts (handful)',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~18g`
          ]
        }
      ]
    });

    // Day 4
    mealPlan.days.push({
      day: 'DAY 4',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Bean porridge with plantain and fish',
            '• 2 boiled eggs',
            '• Bread with butter',
            '• Full-fat yogurt',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Chin-chin or coconut candy',
            '• Protein shake (whey + peanut butter + banana)',
            '• Boiled groundnuts',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~30g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• White rice and stew (250g rice)',
            '• Assorted meat (goat meat, beef, chicken)',
            '• Fried plantain (2 medium)',
            '• Coleslaw',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Dates and nuts mix',
            '• Banana',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Amala with ewedu and gbegiri soup',
            '• Assorted meat and fish',
            '• Large portion (300g swallow)',
            '• Post-workout shake',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Full-fat milk (500ml)',
            '• Digestive biscuits',
            `Calories: ~${Math.round(targetCalories * 0.05)}`
          ]
        }
      ]
    });

    // Day 5
    mealPlan.days.push({
      day: 'DAY 5',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Pancakes (5 pieces) with honey and butter',
            '• Scrambled eggs (3 eggs)',
            '• Sausages (3 pieces)',
            '• Fresh fruit salad',
            '• Chocolate milk',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Puff-puff (6 pieces)',
            '• Protein smoothie',
            '• Boiled peanuts',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~25g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Coconut rice (large portion)',
            '• Grilled fish (whole tilapia)',
            '• Gizdodo (gizzard and plantain)',
            '• Vegetable salad',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Granola bar',
            '• Apple',
            '• Water',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Eba with afang soup',
            '• Plenty of meat and fish',
            '• Large portion (250g eba)',
            '• Protein shake',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Greek yogurt with granola',
            '• Mixed nuts',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~17g`
          ]
        }
      ]
    });

    // Day 6
    mealPlan.days.push({
      day: 'DAY 6',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Bread with egg and sardine sauce',
            '• Fried plantain',
            '• Full-fat milk',
            '• Orange',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Moi-moi (2 wraps)',
            '• Banana smoothie with protein',
            '• Groundnut cake',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~28g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Spaghetti with chicken sauce (large portion)',
            '• Grilled chicken (2 pieces)',
            '• Coleslaw',
            '• Soft drink or juice',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Energy drink (natural)',
            '• Trail mix (nuts and dried fruit)',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Fufu with oha soup',
            '• Stockfish, dry fish, and beef',
            '• Large portion',
            '• Protein shake',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Cottage cheese',
            '• Honey and almonds',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~19g`
          ]
        }
      ]
    });

    // Day 7
    mealPlan.days.push({
      day: 'DAY 7',
      totalCalories: targetCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Indomie noodles (2 packs) with eggs (3 eggs)',
            '• Sausages',
            '• Fried plantain',
            '• Orange juice',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.2)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(targetCalories * 0.15),
          items: [
            '• Protein shake (double scoop)',
            '• Banana and peanut butter',
            '• Boiled eggs (2)',
            `Calories: ~${Math.round(targetCalories * 0.15)} | Protein: ~35g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(targetCalories * 0.30),
          items: [
            '• Party jollof rice (large portion)',
            '• Fried chicken (2 pieces)',
            '• Moi-moi',
            '• Fried plantain',
            '• Coleslaw',
            '• Zobo drink',
            `Calories: ~${Math.round(targetCalories * 0.30)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'PRE-WORKOUT SNACK (3:30 PM)',
          calories: Math.round(targetCalories * 0.10),
          items: [
            '• Sweet potato (boiled, 200g)',
            '• Honey',
            `Calories: ~${Math.round(targetCalories * 0.10)}`
          ]
        },
        {
          time: 'POST-WORKOUT/DINNER (6:30 PM)',
          calories: Math.round(targetCalories * 0.20),
          items: [
            '• Semovita with okro soup',
            '• Assorted meat and fish',
            '• Palm oil base',
            '• Post-workout protein shake',
            `Calories: ~${Math.round(targetCalories * 0.20)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'BEFORE BED (9:30 PM)',
          calories: Math.round(targetCalories * 0.05),
          items: [
            '• Casein protein shake',
            '• Walnuts',
            `Calories: ~${Math.round(targetCalories * 0.05)} | Protein: ~20g`
          ]
        }
      ]
    });

    const foodRecommendations = [
      'HIGH-CALORIE, HIGH-PROTEIN NIGERIAN FOODS:',
      '',
      'PROTEIN SOURCES (Eat abundantly):',
      '• Fish: Mackerel, tilapia, catfish, stockfish',
      '• Meat: Beef, goat meat, chicken (with skin)',
      '• Eggs: 3-5 whole eggs daily',
      '• Beans and lentils: Protein and calories',
      '• Full-fat dairy: Milk, yogurt, cheese',
      '',
      'CALORIE-DENSE CARBOHYDRATES:',
      '• Rice: White rice, jollof rice, fried rice',
      '• Yam: Pounded, boiled, porridge',
      '• Plantain: Ripe plantain (higher calories)',
      '• Swallow foods: Eba, fufu, amala, semovita',
      '• Bread and pasta: Whole wheat preferred',
      '',
      'HEALTHY FATS (Essential for weight gain):',
      '• Palm oil: Traditional, healthy, calorie-dense',
      '• Groundnut: Raw, boiled, or as paste',
      '• Avocado: Very calorie-dense',
      '• Coconut: Oil and fresh coconut',
      '• Nuts: Cashews, almonds, walnuts',
      '',
      'CALORIE BOOSTERS:',
      '• Add peanut butter to shakes',
      '• Use full-fat milk instead of water',
      '• Cook with generous palm oil',
      '• Add cheese to meals',
      '• Dried fruits for snacks'
    ];

    const trainingGuidelines = [
      'STRENGTH TRAINING PROTOCOL:',
      '',
      '1. FREQUENCY: 4-5 days per week',
      '2. FOCUS: Compound movements (squats, deadlifts, bench press)',
      '3. INTENSITY: Progressive overload - increase weight weekly',
      '4. REP RANGE: 8-12 reps for muscle growth',
      '5. REST: 48 hours between same muscle groups',
      '',
      'CARDIO: Minimal',
      '• Only 2 days/week, 20 minutes light',
      '• Focus on weights, not cardio',
      '',
      'RECOVERY:',
      '• Sleep 8-9 hours nightly',
      '• Rest days are muscle-building days',
      '• Stretching and mobility work'
    ];

    const supplementRecommendations = [
      'RECOMMENDED SUPPLEMENTS:',
      '',
      '1. WHEY PROTEIN:',
      '   • 2 scoops daily (post-workout + snack)',
      '   • Helps reach protein targets',
      '',
      '2. CREATINE MONOHYDRATE:',
      '   • 5g daily',
      '   • Proven muscle and strength gains',
      '',
      '3. MASS GAINER (If poor appetite):',
      '   • 1-2 servings between meals',
      '   • Easy way to add 500-1000 calories',
      '',
      '4. MULTIVITAMIN:',
      '   • Daily for overall health',
      '',
      '5. FISH OIL:',
      '   • Omega-3 for recovery and health'
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
      guidelines,
      mealPlan,
      foodRecommendations,
      trainingGuidelines,
      supplementRecommendations
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
      
      <div className="bg-green-50 p-3 sm:p-4 rounded mb-4 sm:mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold text-green-900">Healthy Weight Gain Program</p>
            <p className="text-green-800">Safe muscle building through caloric surplus, high protein, and resistance training.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Current Weight (kg) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Height (cm) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Target Weight (kg) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Timeframe (weeks) *</label>
            <input
              type="number"
              inputMode="numeric"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Activity Level *</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation">
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
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded border-2 border-blue-300">
                <p className="text-xs sm:text-sm">Current BMI</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{result.currentBMI}</p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded border-2 border-green-300">
                <p className="text-xs sm:text-sm">Target BMI</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{result.targetBMI}</p>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 rounded border-2 border-orange-300">
                <p className="text-xs sm:text-sm">To Gain</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{result.weightToGain}kg</p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded border-2 border-purple-300">
                <p className="text-xs sm:text-sm">Per Week</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{result.weeklyWeightGain}kg</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Daily Nutritional Targets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded">
                  <p className="text-xs sm:text-sm">Calories</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{result.targetCalories}</p>
                  <p className="text-xs">kcal/day</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded">
                  <p className="text-xs sm:text-sm">Protein</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{result.proteinGrams}g</p>
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

            {result.mealPlan && (
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-lg border-2 border-green-400">
                <h3 className="text-2xl font-bold text-green-800 mb-2">{result.mealPlan.title}</h3>
                <p className="text-sm text-green-700 mb-4">{result.mealPlan.subtitle}</p>
                
                {result.mealPlan.days.map((dayPlan: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-white rounded-lg p-4 mb-4 border-2 border-green-300">
                    <h4 className="text-xl font-bold text-green-700 mb-3">{dayPlan.day}</h4>
                    <p className="text-sm text-gray-600 mb-3">Total: ~{dayPlan.totalCalories} kcal</p>
                    
                    {dayPlan.meals.map((meal: any, mealIndex: number) => (
                      <div key={mealIndex} className="mb-4 bg-green-50 p-3 rounded">
                        <p className="font-bold text-green-800">{meal.time}</p>
                        <ul className="mt-2 space-y-1">
                          {meal.items.map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="text-sm text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {result.foodRecommendations && (
              <div className="bg-yellow-50 p-4 rounded border-2 border-yellow-300">
                <h3 className="font-bold text-lg mb-2 text-yellow-900">Food Recommendations</h3>
                {result.foodRecommendations.map((rec: string, i: number) => (
                  <div key={i} className={rec.includes(':') && !rec.includes('•') ? 'font-semibold mt-3 text-yellow-900' : 'text-sm text-gray-700'}>{rec}</div>
                ))}
              </div>
            )}

            {result.trainingGuidelines && (
              <div className="bg-purple-50 p-4 rounded border-2 border-purple-300">
                <h3 className="font-bold text-lg mb-2 text-purple-900">Training Guidelines</h3>
                {result.trainingGuidelines.map((guide: string, i: number) => (
                  <div key={i} className={guide.includes(':') && !guide.includes('•') ? 'font-semibold mt-3 text-purple-900' : 'text-sm text-gray-700'}>{guide}</div>
                ))}
              </div>
            )}

            {result.supplementRecommendations && (
              <div className="bg-orange-50 p-4 rounded border-2 border-orange-300">
                <h3 className="font-bold text-lg mb-2 text-orange-900">Supplement Recommendations</h3>
                {result.supplementRecommendations.map((supp: string, i: number) => (
                  <div key={i} className={supp.includes('SUPPLEMENTS') || supp.match(/^\d\./) ? 'font-semibold mt-2 text-orange-900' : 'text-sm text-gray-700'}>{supp}</div>
                ))}
              </div>
            )}

            <ExportButtons
              onExportPDFA4={handleDownloadPDF}
              thermalContent={{
                patientInfo: patientInfo,
                sections: [
                  {
                    title: 'Weight Goals',
                    items: [
                      `Current: ${currentWeight} kg`,
                      `Target: ${targetWeight} kg`,
                      `Duration: ${timeframe} weeks`,
                    ]
                  },
                  {
                    title: 'Daily Targets',
                    items: [
                      `Calories: ${result.dailyCalories} kcal`,
                      `Surplus: ${result.calorieSurplus} kcal`,
                      `Weekly Gain: ${result.weeklyTarget?.toFixed(2)} kg`,
                    ]
                  }
                ],
                mealPlan: result.mealPlan || [],
                summary: [
                  { label: 'Calories', value: `${result.dailyCalories} kcal` },
                  { label: 'Surplus', value: `${result.calorieSurplus} kcal` },
                  { label: 'Target', value: `${targetWeight} kg` },
                ]
              } as ThermalContent}
              thermalTitle="WEIGHT GAIN PLAN"
              thermalFilename={`WeightGain_Plan_${patientInfo?.name || 'Patient'}_Thermal.pdf`}
              shareContent={{
                title: '💪 Weight Gain Meal Plan',
                patientInfo: patientInfo,
                summary: [
                  `Current Weight: ${currentWeight} kg`,
                  `Target Weight: ${targetWeight} kg`,
                  `Duration: ${timeframe} weeks`,
                  `Daily Calories: ${result.dailyCalories} kcal`,
                  `Weekly Target: ${result.weeklyTarget?.toFixed(2)} kg gain`,
                ],
                mealPlan: result.mealPlan?.slice(0, 3) || [],
                recommendations: [
                  'Caloric surplus for healthy weight gain',
                  'High protein for muscle building',
                  'Strength training recommended',
                  'Eat calorie-dense foods',
                  'Weekly weight monitoring',
                ],
                warnings: result.healthWarnings || [],
              } as ShareContent}
              pdfLabel="Download Plan"
            />
          </div>
        )}
      </div>
    </div>
  );
}
