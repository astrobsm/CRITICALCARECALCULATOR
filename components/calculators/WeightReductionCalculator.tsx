'use client';

import { useState } from 'react';
import { Download, AlertCircle, Info, TrendingDown } from 'lucide-react';
import { generateWeightReductionPDF } from '@/lib/pdfGenerator';
import ExportButtons from '@/components/ExportButtons';
import { ThermalContent, ShareContent } from '@/lib/exportUtils';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function WeightReductionCalculator({ patientInfo }: PatientInfoProps) {
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  
  // Comorbidities
  const [diabetes, setDiabetes] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [pcos, setPcos] = useState(false);
  const [thyroid, setThyroid] = useState(false);
  
  const [result, setResult] = useState<any>(null);

  const calculateMealPlan = () => {
    const currentWt = parseFloat(currentWeight);
    const heightM = parseFloat(height) / 100;
    const targetWt = parseFloat(targetWeight);
    const weeks = parseInt(timeframe);

    // Calculate BMI
    const currentBMI = currentWt / (heightM * heightM);
    const targetBMI = targetWt / (heightM * heightM);

    // Calculate weight to lose
    const weightToLose = currentWt - targetWt;
    const weeklyWeightLoss = weightToLose / weeks;

    // Determine safe weight loss rate
    let safeWeightLoss = 'Safe';
    let weeklyTarget = weeklyWeightLoss;
    if (weeklyWeightLoss > 1.0) {
      safeWeightLoss = 'Too Aggressive - Risk of muscle loss and metabolic slowdown';
      weeklyTarget = 0.5;
    } else if (weeklyWeightLoss > 0.5) {
      safeWeightLoss = 'Moderate - Good balance';
    } else {
      safeWeightLoss = 'Conservative - Very sustainable';
    }

    // Calculate caloric needs
    let bmr = 0;
    if (patientInfo?.gender === 'female') {
      bmr = 655 + (9.6 * currentWt) + (1.8 * parseFloat(height)) - (4.7 * parseFloat(patientInfo.age || '30'));
    } else {
      bmr = 66 + (13.7 * currentWt) + (5 * parseFloat(height)) - (6.8 * parseFloat(patientInfo.age || '30'));
    }

    // Activity multiplier
    let activityMultiplier = 1.2;
    switch(activityLevel) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'very-active': activityMultiplier = 1.9; break;
    }

    const tdee = Math.round(bmr * activityMultiplier);
    const targetCalories = Math.round(tdee - 500); // 500 kcal deficit for ~0.5kg/week loss
    const minCalories = patientInfo?.gender === 'female' ? 1200 : 1500;
    const finalCalories = Math.max(targetCalories, minCalories);

    // Macronutrient distribution
    const proteinGrams = Math.round(currentWt * 1.6); // High protein to preserve muscle
    const fatGrams = Math.round((finalCalories * 0.25) / 9);
    const carbGrams = Math.round((finalCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4);

    const nutritionalTargets: string[] = [];
    const guidelines: string[] = [];
    const mealPlan: any = {};
    const foodRecommendations: string[] = [];
    const foodsToLimit: string[] = [];
    const exerciseRecommendations: string[] = [];
    const supplementRecommendations: string[] = [];
    const monitoringParameters: string[] = [];

    // Nutritional targets
    nutritionalTargets.push(`DAILY CALORIC TARGET: ${finalCalories} kcal/day`);
    nutritionalTargets.push(`  (TDEE: ${tdee} kcal - Deficit: ${tdee - finalCalories} kcal)`);
    nutritionalTargets.push(`PROTEIN: ${proteinGrams}g/day (${Math.round((proteinGrams * 4 / finalCalories) * 100)}% of calories)`);
    nutritionalTargets.push(`CARBOHYDRATES: ${carbGrams}g/day (${Math.round((carbGrams * 4 / finalCalories) * 100)}% of calories)`);
    nutritionalTargets.push(`FATS: ${fatGrams}g/day (${Math.round((fatGrams * 9 / finalCalories) * 100)}% of calories)`);
    nutritionalTargets.push(`WATER: ${Math.round(currentWt * 35)}ml/day minimum`);
    nutritionalTargets.push('');
    nutritionalTargets.push(`PROJECTED WEIGHT LOSS: ${weightToLose.toFixed(1)}kg in ${weeks} weeks`);
    nutritionalTargets.push(`WEEKLY TARGET: ${weeklyTarget.toFixed(2)}kg/week (${safeWeightLoss})`);

    // Guidelines
    guidelines.push('CORE PRINCIPLES FOR SUSTAINABLE WEIGHT LOSS:');
    guidelines.push('');
    guidelines.push('1. CALORIC DEFICIT:');
    guidelines.push('   • Maintain consistent 500 kcal daily deficit');
    guidelines.push('   • Never go below minimum safe calories');
    guidelines.push('   • Track food intake honestly and accurately');
    guidelines.push('');
    guidelines.push('2. HIGH PROTEIN INTAKE:');
    guidelines.push('   • Preserves lean muscle mass during weight loss');
    guidelines.push('   • Increases satiety and reduces hunger');
    guidelines.push('   • Higher thermic effect (burns more calories)');
    guidelines.push(`   • Target: ${Math.round(proteinGrams/3)}g per main meal`);
    guidelines.push('');
    guidelines.push('3. MEAL TIMING:');
    guidelines.push('   • Eat 3 main meals + 2 small snacks');
    guidelines.push('   • Don\'t skip breakfast (prevents overeating later)');
    guidelines.push('   • Last meal 3 hours before bed');
    guidelines.push('   • Consistent meal times daily');
    guidelines.push('');
    guidelines.push('4. PORTION CONTROL:');
    guidelines.push('   • Use smaller plates (9-inch diameter)');
    guidelines.push('   • Fill half plate with vegetables');
    guidelines.push('   • Quarter plate lean protein');
    guidelines.push('   • Quarter plate whole grains');
    guidelines.push('');
    guidelines.push('5. HYDRATION:');
    guidelines.push(`   • Drink ${Math.round(currentWt * 35)}ml water daily`);
    guidelines.push('   • 2 glasses before each meal (increases satiety)');
    guidelines.push('   • Avoid sugary drinks completely');
    guidelines.push('   • Herbal teas allowed (unsweetened)');

    // Sample meal plan
    mealPlan.title = '7-DAY WEIGHT REDUCTION MEAL PLAN';
    mealPlan.subtitle = `Nigerian-Adapted | ${finalCalories} kcal/day | High Protein, Low Glycemic Index`;
    mealPlan.days = [];

    // Day 1
    mealPlan.days.push({
      day: 'DAY 1',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• 3 boiled egg whites + 1 whole egg',
            '• 2 slices whole wheat bread',
            '• 1 medium avocado (half)',
            '• Fresh tomato and cucumber slices',
            '• Unsweetened tea or black coffee',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• 1 medium apple or orange',
            '• Small handful almonds (10-12 nuts)',
            '• Water (500ml)',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~5g`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Grilled fish (tilapia/mackerel) - 150g',
            '• Vegetable soup (waterleaf/ugu) - oil-free',
            '• Small portion wheat swallow (100g)',
            '• Large vegetable salad with lemon dressing',
            '• Water (500ml)',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Low-fat Greek yogurt (150g)',
            '• 5-6 strawberries or berries',
            '• Water',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~10g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled chicken breast (120g, skinless)',
            '• Steamed vegetables (broccoli, carrots, green beans)',
            '• Small portion brown rice (80g cooked)',
            '• Garden egg sauce (minimal oil)',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 2
    mealPlan.days.push({
      day: 'DAY 2',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Oatmeal (50g dry) made with water',
            '• 1 scoop protein powder or 2 egg whites mixed in',
            '• Banana (small)',
            '• Cinnamon and stevia for taste',
            '• Green tea',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Carrot sticks with 2 tbsp hummus',
            '• Water (500ml)',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Chicken pepper soup (lean chicken)',
            '• Unripe plantain (boiled, 1 medium)',
            '• Ugwu (fluted pumpkin) vegetable',
            '• Fresh salad',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Boiled eggs (2 whites, 1 yolk)',
            '• Cucumber slices',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~10g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled fish with vegetables',
            '• Cauliflower rice or small portion brown rice',
            '• Tomato-based sauce (minimal oil)',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 3
    mealPlan.days.push({
      day: 'DAY 3',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Bean porridge (50g dry beans)',
            '• Small portion unripe plantain',
            '• Minimal palm oil',
            '• Green tea',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Pear or apple',
            '• 10 almonds',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Turkey or chicken (150g, grilled)',
            '• Vegetable stir-fry (minimal oil)',
            '• Small sweet potato (100g)',
            '• Large salad',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Protein shake (whey + water + berries)',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~20g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled mackerel or sardines',
            '• Steamed vegetables',
            '• Small portion yam (80g)',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 4
    mealPlan.days.push({
      day: 'DAY 4',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Scrambled egg whites (4 whites + 1 yolk)',
            '• 1 slice whole wheat toast',
            '• Half avocado',
            '• Tomato slices',
            '• Green tea',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Cucumber and carrot sticks',
            '• 2 tbsp hummus or bean dip',
            '• Water',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Banga soup with minimal oil',
            '• Small portion wheat swallow (100g)',
            '• Grilled catfish',
            '• Steamed vegetables',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Sugar-free protein bar',
            '• Small apple',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~12g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled turkey breast (120g)',
            '• Cauliflower mash',
            '• Green beans and carrots (steamed)',
            '• Light vegetable soup',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 5
    mealPlan.days.push({
      day: 'DAY 5',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Protein smoothie (whey + spinach + berries + water)',
            '• 1 boiled egg',
            '• Small banana',
            '• 10 almonds',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Watermelon slices (200g)',
            '• Handful of pumpkin seeds',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Edikang ikong soup (minimal oil)',
            '• Small portion eba (100g)',
            '• Grilled fish and snail',
            '• Large cucumber salad',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• 2 boiled egg whites',
            '• Cherry tomatoes',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~10g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled chicken salad (large)',
            '• Lemon and olive oil dressing (light)',
            '• Small sweet potato (80g)',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 6
    mealPlan.days.push({
      day: 'DAY 6',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Moi-moi (1 wrap, oil-free)',
            '• 2 boiled eggs (1 yolk only)',
            '• Pawpaw slices',
            '• Unsweetened zobo',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Orange',
            '• 6 cashew nuts',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Ofada rice (small portion, 100g)',
            '• Ayamase sauce (reduced oil)',
            '• Grilled assorted meat (lean cuts)',
            '• Garden egg and ugwu salad',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Low-fat yogurt (plain)',
            '• Blueberries',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~10g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Pepper soup (chicken, lean)',
            '• Unripe plantain (1 small, boiled)',
            '• Vegetable side',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Day 7
    mealPlan.days.push({
      day: 'DAY 7',
      totalCalories: finalCalories,
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          calories: Math.round(finalCalories * 0.25),
          items: [
            '• Vegetable omelet (3 eggs, spinach, tomatoes, onions)',
            '• 1 slice whole grain bread',
            '• Grapefruit (half)',
            '• Black coffee or green tea',
            `Calories: ~${Math.round(finalCalories * 0.25)} | Protein: ~${Math.round(proteinGrams * 0.3)}g`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:30 AM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Celery sticks with almond butter (1 tbsp)',
            '• Water with lemon',
            `Calories: ~${Math.round(finalCalories * 0.1)}`
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          calories: Math.round(finalCalories * 0.35),
          items: [
            '• Grilled fish (tilapia, 200g)',
            '• Nigerian salad (cabbage, carrots, green beans)',
            '• Small portion brown rice (80g)',
            '• Light tomato sauce',
            `Calories: ~${Math.round(finalCalories * 0.35)} | Protein: ~${Math.round(proteinGrams * 0.35)}g`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          calories: Math.round(finalCalories * 0.1),
          items: [
            '• Protein shake (whey + water)',
            '• Small handful berries',
            `Calories: ~${Math.round(finalCalories * 0.1)} | Protein: ~20g`
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          calories: Math.round(finalCalories * 0.2),
          items: [
            '• Grilled chicken breast (120g)',
            '• Roasted vegetables (zucchini, bell peppers, eggplant)',
            '• Small portion quinoa or cauliflower rice',
            `Calories: ~${Math.round(finalCalories * 0.2)} | Protein: ~${Math.round(proteinGrams * 0.25)}g`
          ]
        }
      ]
    });

    // Food recommendations
    foodRecommendations.push('HIGH-PROTEIN, LOW-CALORIE NIGERIAN FOODS:');
    foodRecommendations.push('');
    foodRecommendations.push('LEAN PROTEINS (Priority):');
    foodRecommendations.push('• Fish: Tilapia, mackerel, titus, croaker (grilled/steamed)');
    foodRecommendations.push('• Poultry: Chicken breast, turkey (skinless, grilled)');
    foodRecommendations.push('• Egg whites: Unlimited, whole eggs: 2-3/day');
    foodRecommendations.push('• Beans and lentils: High protein, high fiber');
    foodRecommendations.push('• Greek yogurt: Low-fat, unsweetened');
    foodRecommendations.push('');
    foodRecommendations.push('LOW-GLYCEMIC CARBOHYDRATES:');
    foodRecommendations.push('• Unripe plantain: Lower GI than ripe');
    foodRecommendations.push('• Sweet potato: Small portions');
    foodRecommendations.push('• Brown rice: Better than white rice');
    foodRecommendations.push('• Oats: Steel-cut or rolled');
    foodRecommendations.push('• Whole wheat bread: 2 slices max/day');
    foodRecommendations.push('• Beans, lentils');
    foodRecommendations.push('');
    foodRecommendations.push('UNLIMITED VEGETABLES:');
    foodRecommendations.push('• Ugwu (fluted pumpkin), waterleaf, spinach');
    foodRecommendations.push('• Cucumber, lettuce, cabbage');
    foodRecommendations.push('• Tomatoes, bell peppers, carrots');
    foodRecommendations.push('• Broccoli, cauliflower, green beans');
    foodRecommendations.push('• Garden egg, okra');
    foodRecommendations.push('');
    foodRecommendations.push('HEALTHY FATS (Controlled portions):');
    foodRecommendations.push('• Avocado: ½ medium per day');
    foodRecommendations.push('• Nuts: 10-15 nuts/day (almonds, walnuts)');
    foodRecommendations.push('• Olive oil: 1-2 tbsp/day for cooking');
    foodRecommendations.push('• Groundnut paste: 1 tbsp/day max');

    // Foods to limit
    foodsToLimit.push('FOODS TO STRICTLY AVOID OR MINIMIZE:');
    foodsToLimit.push('');
    foodsToLimit.push('⛔ COMPLETELY AVOID:');
    foodsToLimit.push('• Soft drinks, fruit juice with added sugar');
    foodsToLimit.push('• White bread, pastries, cakes, biscuits');
    foodsToLimit.push('• Fried foods (puff-puff, akara, fried plantain)');
    foodsToLimit.push('• Processed meats (sausages, hot dogs)');
    foodsToLimit.push('• Fast food, junk food');
    foodsToLimit.push('• Candy, chocolate, sweets');
    foodsToLimit.push('• Alcohol');
    foodsToLimit.push('');
    foodsToLimit.push('⚠️ STRICTLY LIMIT:');
    foodsToLimit.push('• White rice: Max 100g cooked/day');
    foodsToLimit.push('• Swallow foods (eba, fufu, amala): Small portions');
    foodsToLimit.push('• Ripe plantain: 1 small piece/day max');
    foodsToLimit.push('• Red palm oil: Use sparingly (1 tsp)');
    foodsToLimit.push('• Yam, cassava: Small portions (100g)');
    foodsToLimit.push('• Stock cubes: Reduce for less sodium');
    foodsToLimit.push('• Coconut oil: Use minimally');

    if (diabetes) {
      foodsToLimit.push('');
      foodsToLimit.push('🔴 DIABETIC RESTRICTIONS:');
      foodsToLimit.push('• Avoid all sugary foods and drinks');
      foodsToLimit.push('• No ripe fruits (very ripe plantain, mango, pineapple)');
      foodsToLimit.push('• Focus on low-GI foods only');
      foodsToLimit.push('• Monitor blood sugar before/after meals');
    }

    // Exercise recommendations
    exerciseRecommendations.push('COMPREHENSIVE EXERCISE PROTOCOL:');
    exerciseRecommendations.push('');
    exerciseRecommendations.push('1. CARDIO (For fat burning):');
    exerciseRecommendations.push('   • Frequency: 5-6 days/week');
    exerciseRecommendations.push('   • Duration: 30-45 minutes');
    exerciseRecommendations.push('   • Intensity: Moderate (can talk but not sing)');
    exerciseRecommendations.push('   • Options: Brisk walking, jogging, cycling, swimming, dancing');
    exerciseRecommendations.push('   • Best time: Morning before breakfast (fat burning mode)');
    exerciseRecommendations.push('');
    exerciseRecommendations.push('2. RESISTANCE TRAINING (Preserves muscle):');
    exerciseRecommendations.push('   • Frequency: 3 days/week');
    exerciseRecommendations.push('   • Full body workouts or split routine');
    exerciseRecommendations.push('   • Bodyweight: Squats, push-ups, lunges, planks');
    exerciseRecommendations.push('   • Weights: If available, compound movements');
    exerciseRecommendations.push('   • Important: Prevents metabolic slowdown');
    exerciseRecommendations.push('');
    exerciseRecommendations.push('3. DAILY ACTIVITY (NEAT):');
    exerciseRecommendations.push('   • 10,000 steps daily (use pedometer)');
    exerciseRecommendations.push('   • Take stairs instead of elevator');
    exerciseRecommendations.push('   • Walk during breaks');
    exerciseRecommendations.push('   • Stand while working if possible');
    exerciseRecommendations.push('   • Active hobbies (gardening, cleaning)');

    // Supplements
    supplementRecommendations.push('RECOMMENDED SUPPLEMENTS:');
    supplementRecommendations.push('');
    supplementRecommendations.push('1. MULTIVITAMIN:');
    supplementRecommendations.push('   • Daily during caloric restriction');
    supplementRecommendations.push('   • Ensures micronutrient adequacy');
    supplementRecommendations.push('');
    supplementRecommendations.push('2. PROTEIN POWDER (Optional but helpful):');
    supplementRecommendations.push('   • Whey or plant-based');
    supplementRecommendations.push('   • 1 scoop post-workout or as snack');
    supplementRecommendations.push('   • Helps meet protein targets');
    supplementRecommendations.push('');
    supplementRecommendations.push('3. OMEGA-3 FISH OIL:');
    supplementRecommendations.push('   • 1000mg EPA/DHA daily');
    supplementRecommendations.push('   • Supports heart health, reduces inflammation');
    supplementRecommendations.push('');
    supplementRecommendations.push('4. VITAMIN D:');
    supplementRecommendations.push('   • 1000-2000 IU daily');
    supplementRecommendations.push('   • Especially if limited sun exposure');
    supplementRecommendations.push('');
    supplementRecommendations.push('5. FIBER SUPPLEMENT (If needed):');
    supplementRecommendations.push('   • Psyllium husk');
    supplementRecommendations.push('   • Increases satiety, aids digestion');

    // Monitoring
    monitoringParameters.push('WEEKLY MONITORING CHECKLIST:');
    monitoringParameters.push('');
    monitoringParameters.push('📊 BODY MEASUREMENTS (Same time, same conditions):');
    monitoringParameters.push('• Weight: Every Monday morning (after bathroom, before breakfast)');
    monitoringParameters.push('• Waist circumference: At navel level');
    monitoringParameters.push('• Hip circumference');
    monitoringParameters.push('• Progress photos: Front, side, back (monthly)');
    monitoringParameters.push('');
    monitoringParameters.push('📝 DAILY TRACKING:');
    monitoringParameters.push('• Food diary: All meals and snacks');
    monitoringParameters.push('• Calorie intake (use app like MyFitnessPal)');
    monitoringParameters.push('• Water intake');
    monitoringParameters.push('• Exercise/activity minutes');
    monitoringParameters.push('• Sleep hours (aim for 7-8 hours)');
    monitoringParameters.push('• Mood and energy levels');
    monitoringParameters.push('');
    monitoringParameters.push('⚠️ WARNING SIGNS - STOP AND CONSULT DOCTOR:');
    monitoringParameters.push('• Weight loss >1kg per week consistently');
    monitoringParameters.push('• Extreme fatigue or dizziness');
    monitoringParameters.push('• Hair loss');
    monitoringParameters.push('• Irregular menstrual cycles (women)');
    monitoringParameters.push('• Persistent hunger or food obsession');
    monitoringParameters.push('• Muscle weakness');
    monitoringParameters.push('');
    monitoringParameters.push('✅ SIGNS OF SUCCESS:');
    monitoringParameters.push('• Steady weight loss (0.5-1kg/week)');
    monitoringParameters.push('• Increased energy levels');
    monitoringParameters.push('• Better sleep quality');
    monitoringParameters.push('• Clothes fitting better');
    monitoringParameters.push('• Improved mood and confidence');
    monitoringParameters.push('• Better blood pressure/glucose (if applicable)');

    setResult({
      currentWeight: currentWt,
      currentBMI: currentBMI.toFixed(1),
      targetWeight: targetWt,
      targetBMI: targetBMI.toFixed(1),
      weightToLose: weightToLose.toFixed(1),
      weeks,
      weeklyWeightLoss: weeklyTarget.toFixed(2),
      safetyRating: safeWeightLoss,
      bmr: Math.round(bmr),
      tdee,
      targetCalories: finalCalories,
      proteinGrams,
      carbGrams,
      fatGrams,
      waterML: Math.round(currentWt * 35),
      nutritionalTargets,
      guidelines,
      mealPlan,
      foodRecommendations,
      foodsToLimit,
      exerciseRecommendations,
      supplementRecommendations,
      monitoringParameters,
      hasComorbidities: diabetes || hypertension || heartDisease || pcos || thyroid,
      comorbidityList: [
        diabetes && 'Diabetes Mellitus',
        hypertension && 'Hypertension',
        heartDisease && 'Heart Disease',
        pcos && 'PCOS',
        thyroid && 'Thyroid Disorder'
      ].filter(Boolean)
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateWeightReductionPDF(result, patientInfo, currentWeight, height, targetWeight, timeframe, activityLevel);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        <TrendingDown className="inline-block mr-2 mb-1" />
        Targeted Weight Reduction Meal Plan
      </h2>
      
      <div className="bg-blue-50 p-3 sm:p-4 rounded mb-4 sm:mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold text-blue-900">Evidence-Based Weight Loss Program</p>
            <p className="text-blue-800">Safe, sustainable weight reduction through caloric deficit, high protein intake, and lifestyle modification. Nigerian-adapted meal plans with portion control.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Body Measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Current Weight (kg) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="Current weight"
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
              placeholder="Height in cm"
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
              placeholder="Goal weight"
              step="0.1"
            />
          </div>
        </div>

        {/* Timeframe and Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Timeframe (weeks) *</label>
            <input
              type="number"
              inputMode="numeric"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="Number of weeks"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum recommended: 8 weeks</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Activity Level *</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very-active">Very Active (Physical job + exercise)</option>
            </select>
          </div>
        </div>

        {/* Comorbidities */}
        <div className="border-2 border-orange-200 rounded-lg p-4">
          <h3 className="font-bold text-orange-700 mb-3">Medical Conditions (Check all that apply)</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Diabetes Mellitus</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={hypertension} onChange={(e) => setHypertension(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Hypertension</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={heartDisease} onChange={(e) => setHeartDisease(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Heart Disease</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={pcos} onChange={(e) => setPcos(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">PCOS (Polycystic Ovary Syndrome)</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
              <input type="checkbox" checked={thyroid} onChange={(e) => setThyroid(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Thyroid Disorder</span>
            </label>
          </div>
        </div>

        <button
          onClick={calculateMealPlan}
          disabled={!currentWeight || !height || !targetWeight || !timeframe || !activityLevel}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Generate Weight Loss Plan
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <p className="text-sm text-gray-600">Current BMI</p>
                <p className="text-3xl font-bold text-blue-600">{result.currentBMI}</p>
                <p className="text-xs text-gray-500">{result.currentWeight}kg</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300">
                <p className="text-sm text-gray-600">Target BMI</p>
                <p className="text-3xl font-bold text-green-600">{result.targetBMI}</p>
                <p className="text-xs text-gray-500">{result.targetWeight}kg</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-300">
                <p className="text-sm text-gray-600">To Lose</p>
                <p className="text-3xl font-bold text-orange-600">{result.weightToLose}kg</p>
                <p className="text-xs text-gray-500">in {result.weeks} weeks</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-300">
                <p className="text-sm text-gray-600">Weekly Target</p>
                <p className="text-3xl font-bold text-purple-600">{result.weeklyWeightLoss}kg</p>
                <p className="text-xs text-gray-500">/week</p>
              </div>
            </div>

            {/* Safety Rating */}
            <div className={`p-4 rounded-lg border-2 ${
              result.safetyRating.includes('Too Aggressive') ? 'bg-red-50 border-red-300' :
              result.safetyRating.includes('Moderate') ? 'bg-yellow-50 border-yellow-300' :
              'bg-green-50 border-green-300'
            }`}>
              <h3 className="font-bold text-lg mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Safety Assessment
              </h3>
              <p className="font-semibold">{result.safetyRating}</p>
              {result.safetyRating.includes('Too Aggressive') && (
                <p className="text-sm mt-2 text-red-700">⚠️ Recommended weekly target adjusted to 0.5kg for sustainable, healthy weight loss.</p>
              )}
            </div>

            {/* Caloric Breakdown */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-300">
              <h3 className="font-bold text-2xl mb-4 text-indigo-700">Daily Nutritional Targets</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-3xl font-bold text-indigo-600">{result.targetCalories}</p>
                  <p className="text-xs text-gray-500">kcal/day (TDEE: {result.tdee})</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Protein (High!)</p>
                  <p className="text-3xl font-bold text-red-600">{result.proteinGrams}g</p>
                  <p className="text-xs text-gray-500">Preserves muscle mass</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Carbs (Controlled)</p>
                  <p className="text-3xl font-bold text-yellow-600">{result.carbGrams}g</p>
                  <p className="text-xs text-gray-500">Low-GI sources</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Fats (Healthy)</p>
                  <p className="text-3xl font-bold text-green-600">{result.fatGrams}g</p>
                  <p className="text-xs text-gray-500">Essential fatty acids</p>
                </div>
              </div>
            </div>

            {/* Comorbidities Alert */}
            {result.hasComorbidities && (
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <h3 className="font-bold text-lg mb-2 flex items-center text-yellow-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Medical Conditions Noted
                </h3>
                <p className="text-sm mb-2">Plan includes considerations for:</p>
                <ul className="list-disc pl-5 text-sm">
                  {result.comorbidityList.map((condition: string, index: number) => (
                    <li key={index} className="text-yellow-800">{condition}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Core Principles</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.guidelines.map((guideline: string, index: number) => (
                  <div key={index} className={guideline.includes('PRINCIPLES') || guideline.match(/^\d\./) ? 'font-semibold mt-2 text-blue-700' : ''}>{guideline}</div>
                ))}
              </div>
            </div>

            {/* 7-Day Meal Plan */}
            <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
              <h3 className="font-bold text-2xl mb-2 text-blue-700 text-center">{result.mealPlan.title}</h3>
              <p className="text-center text-gray-600 mb-6 italic">{result.mealPlan.subtitle}</p>
              
              {result.mealPlan.days.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="mb-6 border-b pb-4 last:border-b-0">
                  <h4 className="font-bold text-xl mb-3 text-green-700 bg-green-50 p-2 rounded">{day.day}</h4>
                  {day.meals.map((meal: any, mealIndex: number) => (
                    <div key={mealIndex} className="mb-4 ml-4">
                      <p className="font-semibold text-blue-600 mb-1">{meal.time}</p>
                      <ul className="text-sm space-y-1 ml-4">
                        {meal.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className={item.includes('Calories:') ? 'font-semibold text-green-600 mt-1' : ''}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Food Recommendations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Recommended Foods</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.foodRecommendations.map((food: string, index: number) => (
                  <div key={index} className={food.includes('FOODS') || food.includes('PROTEINS') || food.includes('CARBOHYDRATES') || food.includes('VEGETABLES') || food.includes('FATS') ? 'font-semibold mt-2 text-green-700' : ''}>{food}</div>
                ))}
              </div>
            </div>

            {/* Foods to Limit */}
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <h3 className="font-bold text-lg mb-2 text-red-700">Foods to Avoid/Limit</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.foodsToLimit.map((food: string, index: number) => (
                  <div key={index} className={food.includes('AVOID') || food.includes('LIMIT') || food.includes('RESTRICTIONS') ? 'font-bold mt-2 text-red-700' : food.includes('⛔') || food.includes('⚠️') || food.includes('🔴') ? 'font-semibold text-red-600' : ''}>{food}</div>
                ))}
              </div>
            </div>

            {/* Exercise Recommendations */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Exercise Protocol</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.exerciseRecommendations.map((exercise: string, index: number) => (
                  <div key={index} className={exercise.includes('PROTOCOL') || exercise.match(/^\d\./) ? 'font-semibold mt-2 text-purple-700' : ''}>{exercise}</div>
                ))}
              </div>
            </div>

            {/* Supplements */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Supplement Recommendations</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.supplementRecommendations.map((supp: string, index: number) => (
                  <div key={index} className={supp.match(/^\d\./) || supp.includes('RECOMMENDED') ? 'font-semibold mt-2 text-indigo-700' : ''}>{supp}</div>
                ))}
              </div>
            </div>

            {/* Monitoring */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Monitoring & Progress Tracking</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.monitoringParameters.map((param: string, index: number) => (
                  <div key={index} className={param.includes('CHECKLIST') || param.includes('TRACKING') || param.includes('WARNING') || param.includes('SUCCESS') ? 'font-semibold mt-2 text-yellow-700' : param.startsWith('📊') || param.startsWith('📝') || param.startsWith('⚠️') || param.startsWith('✅') ? 'font-semibold text-yellow-800' : ''}>{param}</div>
                ))}
              </div>
            </div>

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
                      `BMI: ${result.currentBMI?.toFixed(1)}`,
                      `Duration: ${timeframe} weeks`,
                    ]
                  },
                  {
                    title: 'Daily Targets',
                    items: [
                      `Calories: ${result.dailyCalories} kcal`,
                      `Deficit: ${result.calorieDeficit} kcal`,
                      `Weekly Loss: ${result.weeklyTarget?.toFixed(2)} kg`,
                    ]
                  }
                ],
                mealPlan: result.mealPlan || [],
                summary: [
                  { label: 'Calories', value: `${result.dailyCalories} kcal` },
                  { label: 'Deficit', value: `${result.calorieDeficit} kcal` },
                  { label: 'Target', value: `${targetWeight} kg` },
                ]
              } as ThermalContent}
              thermalTitle="WEIGHT LOSS PLAN"
              thermalFilename={`WeightLoss_Plan_${patientInfo?.name || 'Patient'}_Thermal.pdf`}
              shareContent={{
                title: '⚖️ Weight Loss Meal Plan',
                patientInfo: patientInfo,
                summary: [
                  `Current Weight: ${currentWeight} kg`,
                  `Target Weight: ${targetWeight} kg`,
                  `Duration: ${timeframe} weeks`,
                  `Daily Calories: ${result.dailyCalories} kcal`,
                  `Weekly Target: ${result.weeklyTarget?.toFixed(2)} kg loss`,
                ],
                mealPlan: result.mealPlan?.slice(0, 3) || [],
                recommendations: [
                  'Caloric deficit for weight loss',
                  'High protein to preserve muscle',
                  'Regular exercise recommended',
                  'Stay hydrated',
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
