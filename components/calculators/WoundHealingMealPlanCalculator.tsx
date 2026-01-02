'use client';

import { useState } from 'react';
import { Download, AlertCircle, Info, Utensils } from 'lucide-react';
import { generateWoundHealingMealPlanPDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function WoundHealingMealPlanCalculator({ patientInfo }: PatientInfoProps) {
  const [weight, setWeight] = useState('');
  const [woundType, setWoundType] = useState('');
  const [woundSeverity, setWoundSeverity] = useState('');
  
  // Comorbidities
  const [diabetes, setDiabetes] = useState(false);
  const [ckd, setCkd] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [heartDisease, setHeartDisease] = useState(false);
  const [liverDisease, setLiverDisease] = useState(false);
  const [obesity, setObesity] = useState(false);
  
  // Additional factors
  const [albumin, setAlbumin] = useState('');
  const [mobilityStatus, setMobilityStatus] = useState('');
  
  const [result, setResult] = useState<any>(null);

  const calculateMealPlan = () => {
    const weightNum = parseFloat(weight);
    const albuminNum = albumin ? parseFloat(albumin) : null;

    // Calculate nutritional requirements
    let proteinRequirement = 1.2; // g/kg/day baseline for wound healing
    let calorieRequirement = 30; // kcal/kg/day baseline
    let fluidRequirement = 30; // ml/kg/day

    // Adjust based on wound severity
    if (woundSeverity === 'severe' || woundSeverity === 'multiple') {
      proteinRequirement = 1.5;
      calorieRequirement = 35;
      fluidRequirement = 35;
    } else if (woundSeverity === 'moderate') {
      proteinRequirement = 1.5;
      calorieRequirement = 32;
    }

    // Adjust for malnutrition
    if (albuminNum && albuminNum < 3.0) {
      proteinRequirement = 1.8;
      calorieRequirement = 35;
    }

    const totalProtein = Math.round(proteinRequirement * weightNum);
    const totalCalories = Math.round(calorieRequirement * weightNum);
    const totalFluid = Math.round(fluidRequirement * weightNum);

    // Generate comprehensive recommendations
    const nutritionalGoals: string[] = [];
    const keyNutrients: string[] = [];
    const sampleMealPlan: any = {};
    const foodRecommendations: string[] = [];
    const supplementRecommendations: string[] = [];
    const foodsToAvoid: string[] = [];
    const hydrationProtocol: string[] = [];
    const monitoringParameters: string[] = [];

    // Nutritional goals
    nutritionalGoals.push(`DAILY CALORIC TARGET: ${totalCalories} kcal/day (${calorieRequirement} kcal/kg)`);
    nutritionalGoals.push(`PROTEIN TARGET: ${totalProtein}g/day (${proteinRequirement} g/kg)`);
    nutritionalGoals.push(`  - Distribute protein evenly across meals (${Math.round(totalProtein/3)}g per main meal)`);
    nutritionalGoals.push(`FLUID TARGET: ${totalFluid} ml/day (${fluidRequirement} ml/kg)`);
    
    // Key nutrients for wound healing
    keyNutrients.push('ESSENTIAL NUTRIENTS FOR WOUND HEALING:');
    keyNutrients.push('');
    keyNutrients.push('1. PROTEIN (Collagen synthesis, tissue repair):');
    keyNutrients.push(`   Target: ${totalProtein}g/day`);
    keyNutrients.push('   Sources: Fish, chicken, eggs, beans, milk, Greek yogurt');
    keyNutrients.push('');
    keyNutrients.push('2. VITAMIN C (Collagen formation, immune function):');
    keyNutrients.push('   Target: 500-1000mg/day');
    keyNutrients.push('   Sources: Oranges, guava, pawpaw, tomatoes, bell peppers');
    keyNutrients.push('');
    keyNutrients.push('3. ZINC (Cell proliferation, immune function):');
    keyNutrients.push('   Target: 15-25mg/day');
    keyNutrients.push('   Sources: Red meat, seafood, pumpkin seeds, beans, groundnuts');
    keyNutrients.push('');
    keyNutrients.push('4. VITAMIN A (Epithelialization, immune function):');
    keyNutrients.push('   Target: 900-3000 IU/day');
    keyNutrients.push('   Sources: Carrots, ugu (fluted pumpkin), red palm oil, liver');
    keyNutrients.push('');
    keyNutrients.push('5. VITAMIN E (Antioxidant, membrane protection):');
    keyNutrients.push('   Sources: Groundnuts, palm oil, avocado, spinach');
    keyNutrients.push('');
    keyNutrients.push('6. B-VITAMINS (Energy metabolism, cell growth):');
    keyNutrients.push('   Sources: Whole grains, eggs, meat, beans, vegetables');
    keyNutrients.push('');
    keyNutrients.push('7. IRON (Oxygen transport, collagen synthesis):');
    keyNutrients.push('   Sources: Red meat, liver, beans, dark green vegetables');

    // Sample 7-day meal plan
    sampleMealPlan.title = 'COMPREHENSIVE 7-DAY WOUND HEALING MEAL PLAN';
    sampleMealPlan.subtitle = 'Nigerian-Adapted High-Protein, Nutrient-Dense Menu';
    sampleMealPlan.days = [];

    // Day 1
    sampleMealPlan.days.push({
      day: 'DAY 1',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• 3 boiled eggs or scrambled eggs with vegetables',
            '• 2 slices whole wheat bread with avocado spread',
            '• Fresh orange juice (2 oranges)',
            '• 1 cup Greek yogurt or unsweetened natural yogurt',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Handful of groundnuts (roasted, unsalted)',
            '• 1 medium-sized guava or pawpaw',
            '• Water (500ml)',
            'Protein: ~10g | Calories: ~200'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Grilled fish (mackerel/tilapia) - 150-200g',
            '• Egusi soup with ugu and waterleaf (rich in vitamins)',
            '• Small portion of pounded yam or eba',
            '• Fresh vegetable salad with tomatoes, cucumbers, carrots',
            '• 1 cup water',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Protein smoothie: milk + banana + groundnut butter + honey',
            '• Boiled groundnuts (1 cup)',
            'Protein: ~15g | Calories: ~250'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Jollof rice with grilled chicken (skinless) - 150g',
            '• Steamed vegetables (carrots, green beans, broccoli)',
            '• Garden egg sauce',
            '• Fresh fruit salad (oranges, pawpaw, pineapple)',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        },
        {
          time: 'EVENING SNACK (9:00 PM - Optional)',
          items: [
            '• 1 cup warm milk or Greek yogurt',
            '• 4-5 dates or banana',
            'Protein: ~8g | Calories: ~150'
          ]
        }
      ]
    });

    // Day 2
    sampleMealPlan.days.push({
      day: 'DAY 2',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Akamu (pap) fortified with milk powder + groundnut paste',
            '• Bean cake (akara) - 4-5 pieces',
            '• Fresh fruit juice (orange or pineapple)',
            '• Boiled eggs (2)',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Cashew nuts (handful)',
            '• Apple or orange',
            '• Water (500ml)',
            'Protein: ~8g | Calories: ~200'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Chicken pepper soup (with vegetables)',
            '• Boiled yam or sweet potato',
            '• Vegetable salad with olive oil dressing',
            '• Fresh pawpaw',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Greek yogurt with honey and sliced fruits',
            '• Handful of almonds or walnuts',
            'Protein: ~12g | Calories: ~220'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Beans porridge with fish and vegetables',
            '• Plantain (boiled or roasted)',
            '• Garden egg with groundnut paste',
            '• Fresh fruit',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Day 3
    sampleMealPlan.days.push({
      day: 'DAY 3',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Oatmeal made with milk, topped with nuts and fruits',
            '• Boiled eggs (2-3)',
            '• Fresh orange juice',
            '• Slice of whole wheat bread with peanut butter',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Coconut chunks with groundnuts',
            '• Guava or watermelon',
            '• Water (500ml)',
            'Protein: ~8g | Calories: ~180'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Grilled turkey or chicken (200g)',
            '• Vegetable soup (efo riro) with stockfish',
            '• Amala or wheat fufu (small portion)',
            '• Fresh vegetables',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Protein shake (soy milk + banana + dates)',
            '• Roasted chickpeas',
            'Protein: ~15g | Calories: ~250'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Fried rice with liver sauce and grilled fish',
            '• Coleslaw (cabbage, carrots, mayo)',
            '• Fresh fruit salad',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Day 4
    sampleMealPlan.days.push({
      day: 'DAY 4',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Yam porridge with fish and vegetables',
            '• Boiled eggs (2)',
            '• Fresh fruit juice',
            '• Greek yogurt',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Mixed nuts and seeds (pumpkin seeds, cashews)',
            '• Orange or tangerine',
            '• Water (500ml)',
            'Protein: ~10g | Calories: ~200'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Catfish pepper soup with yam',
            '• Okra soup with seafood',
            '• Vegetable salad',
            '• Fresh pawpaw',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Cottage cheese or Greek yogurt with fruits',
            '• Almonds (handful)',
            'Protein: ~12g | Calories: ~220'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• White rice with chicken stew (tomato-based)',
            '• Steamed vegetables',
            '• Moi moi (bean pudding)',
            '• Fresh fruit',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Day 5
    sampleMealPlan.days.push({
      day: 'DAY 5',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Bread with sardine/mackerel spread',
            '• Scrambled eggs with vegetables',
            '• Fresh orange juice',
            '• Milk or yogurt',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Boiled groundnuts (1 cup)',
            '• Banana or apple',
            '• Water (500ml)',
            'Protein: ~10g | Calories: ~200'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Ofada rice with ayamase sauce and assorted meat',
            '• Vegetable salad',
            '• Plantain (fried or boiled)',
            '• Fresh fruit',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Protein smoothie with milk, banana, groundnut butter',
            '• Dates (4-5)',
            'Protein: ~15g | Calories: ~250'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Spaghetti with fish sauce',
            '• Grilled chicken breast',
            '• Vegetable salad with avocado',
            '• Fresh fruit salad',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Day 6
    sampleMealPlan.days.push({
      day: 'DAY 6',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Beans porridge with plantain',
            '• Boiled eggs (2-3)',
            '• Fresh fruit juice',
            '• Greek yogurt',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Roasted cashews and walnuts',
            '• Guava or orange',
            '• Water (500ml)',
            'Protein: ~8g | Calories: ~200'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Jollof spaghetti with grilled fish',
            '• Vegetable soup with assorted meat',
            '• Garden egg salad',
            '• Fresh pawpaw',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Milk with groundnut butter and banana',
            '• Boiled eggs (1-2)',
            'Protein: ~15g | Calories: ~250'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Tuwo with miyan kuka (baobab soup) and fish',
            '• Steamed vegetables',
            '• Fresh fruit',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Day 7
    sampleMealPlan.days.push({
      day: 'DAY 7',
      meals: [
        {
          time: 'BREAKFAST (7:00 AM)',
          items: [
            '• Akamu fortified with milk + groundnut paste',
            '• Moi moi (bean pudding)',
            '• Fresh orange juice',
            '• Boiled eggs (2)',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.25)}`
          ]
        },
        {
          time: 'MID-MORNING SNACK (10:00 AM)',
          items: [
            '• Mixed nuts (groundnuts, cashews)',
            '• Watermelon or pineapple',
            '• Water (500ml)',
            'Protein: ~8g | Calories: ~180'
          ]
        },
        {
          time: 'LUNCH (1:00 PM)',
          items: [
            '• Rice and stew with chicken',
            '• Egusi soup with fish and stockfish',
            '• Vegetable salad',
            '• Fresh fruit',
            `Protein: ~${Math.round(totalProtein * 0.35)}g | Calories: ~${Math.round(totalCalories * 0.35)}`
          ]
        },
        {
          time: 'AFTERNOON SNACK (4:00 PM)',
          items: [
            '• Greek yogurt with honey and nuts',
            '• Banana',
            'Protein: ~12g | Calories: ~220'
          ]
        },
        {
          time: 'DINNER (7:00 PM)',
          items: [
            '• Yam porridge with vegetables and fish',
            '• Boiled plantain',
            '• Garden egg with groundnut sauce',
            '• Fresh fruit salad',
            `Protein: ~${Math.round(totalProtein * 0.3)}g | Calories: ~${Math.round(totalCalories * 0.3)}`
          ]
        }
      ]
    });

    // Food recommendations based on wound type
    foodRecommendations.push('HIGH-PROTEIN NIGERIAN FOODS (Priority):');
    foodRecommendations.push('• Fish: Mackerel, titus, croaker, catfish, tilapia');
    foodRecommendations.push('• Poultry: Chicken, turkey (skinless preferred)');
    foodRecommendations.push('• Eggs: Boiled, scrambled, poached (2-3 per day)');
    foodRecommendations.push('• Legumes: Beans, moi moi, akara, lentils');
    foodRecommendations.push('• Dairy: Greek yogurt, milk, cheese (if tolerated)');
    foodRecommendations.push('• Nuts: Groundnuts, cashews, walnuts, almonds');
    foodRecommendations.push('');
    foodRecommendations.push('VITAMIN C-RICH FOODS (Collagen synthesis):');
    foodRecommendations.push('• Citrus: Oranges, tangerines, grapefruits');
    foodRecommendations.push('• Fruits: Guava, pawpaw, pineapple, mango');
    foodRecommendations.push('• Vegetables: Tomatoes, bell peppers, garden egg');
    foodRecommendations.push('');
    foodRecommendations.push('VITAMIN A-RICH FOODS (Epithelialization):');
    foodRecommendations.push('• Vegetables: Carrots, ugu, waterleaf, spinach');
    foodRecommendations.push('• Oils: Red palm oil (in moderation)');
    foodRecommendations.push('• Animal sources: Liver, eggs, fish');
    foodRecommendations.push('');
    foodRecommendations.push('ZINC-RICH FOODS (Cell proliferation):');
    foodRecommendations.push('• Meats: Beef, chicken, turkey');
    foodRecommendations.push('• Seafood: Fish, crayfish, periwinkle');
    foodRecommendations.push('• Seeds: Pumpkin seeds, sesame seeds');
    foodRecommendations.push('• Legumes: Beans, lentils, chickpeas');

    // Comorbidity-specific modifications
    if (diabetes) {
      foodRecommendations.push('');
      foodRecommendations.push('DIABETIC MODIFICATIONS:');
      foodRecommendations.push('• Choose whole grains over refined (brown rice, whole wheat)');
      foodRecommendations.push('• Limit high-GI foods (white rice, white bread, sugary fruits)');
      foodRecommendations.push('• Monitor portion sizes of carbohydrates');
      foodRecommendations.push('• Pair carbs with protein to slow absorption');
      foodRecommendations.push('• Avoid added sugars, sweetened drinks');
      foodRecommendations.push('• Check blood sugar before and after meals');
      
      foodsToAvoid.push('• White rice in large quantities');
      foodsToAvoid.push('• White bread, pastries, cakes');
      foodsToAvoid.push('• Sugary drinks (soft drinks, fruit juice with added sugar)');
      foodsToAvoid.push('• Fried foods (reduce frequency)');
      foodsToAvoid.push('• Honey in large amounts');
    }

    if (ckd) {
      foodRecommendations.push('');
      foodRecommendations.push('CHRONIC KIDNEY DISEASE MODIFICATIONS:');
      foodRecommendations.push('• Moderate protein: 0.8-1.0 g/kg (consult nephrologist)');
      foodRecommendations.push('• Low potassium: Limit bananas, oranges, tomatoes');
      foodRecommendations.push('• Low phosphorus: Limit dairy, nuts, beans');
      foodRecommendations.push('• Fluid restriction if advised by doctor');
      foodRecommendations.push('• Low sodium: Avoid processed foods, reduce salt');
      
      foodsToAvoid.push('• High-potassium fruits (bananas, oranges in large amounts)');
      foodsToAvoid.push('• Dark leafy vegetables in excess');
      foodsToAvoid.push('• Dairy products in excess (phosphorus)');
      foodsToAvoid.push('• Processed foods (high sodium, phosphorus)');
      foodsToAvoid.push('• Beans and nuts in large quantities (phosphorus)');
    }

    if (hypertension) {
      foodRecommendations.push('');
      foodRecommendations.push('HYPERTENSION MODIFICATIONS:');
      foodRecommendations.push('• DASH diet principles');
      foodRecommendations.push('• Low sodium: <2000mg/day (reduce salt)');
      foodRecommendations.push('• High potassium: Bananas, oranges, beans');
      foodRecommendations.push('• Avoid processed, canned foods');
      foodRecommendations.push('• Use herbs and spices instead of salt');
      
      foodsToAvoid.push('• Processed/canned foods');
      foodsToAvoid.push('• Salted fish, stock cubes (Maggi, Knorr)');
      foodsToAvoid.push('• Fried foods in excess');
      foodsToAvoid.push('• High-sodium condiments');
    }

    if (heartDisease) {
      foodRecommendations.push('');
      foodRecommendations.push('HEART DISEASE MODIFICATIONS:');
      foodRecommendations.push('• Low saturated fat (limit red meat, palm oil)');
      foodRecommendations.push('• Choose fish over red meat (omega-3)');
      foodRecommendations.push('• Use olive oil, canola oil for cooking');
      foodRecommendations.push('• Increase fiber (whole grains, vegetables)');
      foodRecommendations.push('• Limit cholesterol-rich foods');
      
      foodsToAvoid.push('• Fried foods in excess');
      foodsToAvoid.push('• Red palm oil in large amounts');
      foodsToAvoid.push('• Fatty meats, organ meats in excess');
      foodsToAvoid.push('• Trans fats (margarine, processed foods)');
    }

    if (liverDisease) {
      foodRecommendations.push('');
      foodRecommendations.push('LIVER DISEASE MODIFICATIONS:');
      foodRecommendations.push('• Moderate protein (consult hepatologist)');
      foodRecommendations.push('• Small frequent meals (5-6 per day)');
      foodRecommendations.push('• Avoid alcohol completely');
      foodRecommendations.push('• Low sodium if ascites present');
      foodRecommendations.push('• Supplement with branched-chain amino acids if needed');
    }

    // Supplement recommendations
    supplementRecommendations.push('RECOMMENDED SUPPLEMENTS (Consult physician first):');
    supplementRecommendations.push('');
    supplementRecommendations.push('1. MULTIVITAMIN with minerals');
    supplementRecommendations.push('   - Centrum, Pharmaton, or generic multivitamin');
    supplementRecommendations.push('   - Once daily with food');
    supplementRecommendations.push('');
    supplementRecommendations.push('2. VITAMIN C:');
    supplementRecommendations.push('   - 500-1000mg daily');
    supplementRecommendations.push('   - Divided doses (500mg twice daily)');
    supplementRecommendations.push('   - Essential for collagen synthesis');
    supplementRecommendations.push('');
    supplementRecommendations.push('3. ZINC:');
    supplementRecommendations.push('   - 15-25mg elemental zinc daily');
    supplementRecommendations.push('   - Zinc sulfate or zinc gluconate');
    supplementRecommendations.push('   - Take with food to reduce nausea');
    supplementRecommendations.push('');
    supplementRecommendations.push('4. PROTEIN POWDER (if needed):');
    supplementRecommendations.push('   - Whey protein or soy protein isolate');
    supplementRecommendations.push('   - 20-30g per serving, 1-2 times daily');
    supplementRecommendations.push('   - Mix with milk or water');
    supplementRecommendations.push('');
    supplementRecommendations.push('5. VITAMIN D:');
    supplementRecommendations.push('   - 1000-2000 IU daily');
    supplementRecommendations.push('   - Especially if limited sun exposure');
    supplementRecommendations.push('');
    supplementRecommendations.push('6. OMEGA-3 FATTY ACIDS:');
    supplementRecommendations.push('   - 1000mg EPA/DHA daily');
    supplementRecommendations.push('   - Fish oil capsules');
    supplementRecommendations.push('   - Anti-inflammatory properties');

    if (albuminNum && albuminNum < 3.0) {
      supplementRecommendations.push('');
      supplementRecommendations.push('SEVERE MALNUTRITION PROTOCOL:');
      supplementRecommendations.push('⚠️ Albumin <3.0 g/dL indicates severe protein deficiency');
      supplementRecommendations.push('• Consider medical nutrition therapy');
      supplementRecommendations.push('• Oral nutritional supplements (Ensure, Boost, Nutren)');
      supplementRecommendations.push('• 2-3 servings daily between meals');
      supplementRecommendations.push('• Monitor albumin, prealbumin weekly');
      supplementRecommendations.push('• May need enteral feeding if unable to meet needs orally');
    }

    // Hydration protocol
    hydrationProtocol.push(`DAILY FLUID TARGET: ${totalFluid}ml (${fluidRequirement}ml/kg)`);
    hydrationProtocol.push('');
    hydrationProtocol.push('FLUID DISTRIBUTION:');
    hydrationProtocol.push(`• Upon waking: 500ml water`);
    hydrationProtocol.push(`• Between meals: 250ml every 2 hours`);
    hydrationProtocol.push(`• With meals: 250ml per meal`);
    hydrationProtocol.push(`• Before bed: 250ml`);
    hydrationProtocol.push('');
    hydrationProtocol.push('RECOMMENDED FLUIDS:');
    hydrationProtocol.push('• Water (primary choice)');
    hydrationProtocol.push('• Coconut water (natural electrolytes)');
    hydrationProtocol.push('• Herbal teas (unsweetened)');
    hydrationProtocol.push('• Fresh fruit juices (diluted, unsweetened)');
    hydrationProtocol.push('• Soups, broths');
    hydrationProtocol.push('');
    hydrationProtocol.push('AVOID:');
    hydrationProtocol.push('• Sugary drinks (soft drinks, energy drinks)');
    hydrationProtocol.push('• Alcohol (impairs wound healing)');
    hydrationProtocol.push('• Excessive caffeine (>2 cups/day)');

    if (ckd) {
      hydrationProtocol.push('');
      hydrationProtocol.push('⚠️ CKD MODIFICATION:');
      hydrationProtocol.push('• Fluid restriction may apply - follow nephrologist advice');
      hydrationProtocol.push('• Monitor daily weight and urine output');
      hydrationProtocol.push('• Limit fluids if on dialysis');
    }

    // Monitoring parameters
    monitoringParameters.push('WEEKLY MONITORING:');
    monitoringParameters.push('• Body weight (track trends)');
    monitoringParameters.push('• Wound measurements (length, width, depth)');
    monitoringParameters.push('• Wound appearance (granulation, exudate, infection signs)');
    monitoringParameters.push('• Dietary intake log (calories, protein)');
    monitoringParameters.push('• Hydration status (urine color, skin turgor)');
    monitoringParameters.push('');
    monitoringParameters.push('LABORATORY MONITORING (Monthly or as advised):');
    monitoringParameters.push('• Serum albumin (goal >3.5 g/dL)');
    monitoringParameters.push('• Prealbumin (more sensitive marker)');
    monitoringParameters.push('• Hemoglobin/hematocrit (anemia assessment)');
    monitoringParameters.push('• Blood glucose (if diabetic)');
    monitoringParameters.push('• Renal function (if CKD)');
    monitoringParameters.push('• Vitamin D, B12 levels (if deficiency suspected)');
    monitoringParameters.push('');
    monitoringParameters.push('SIGNS OF IMPROVEMENT:');
    monitoringParameters.push('✓ Wound size decreasing');
    monitoringParameters.push('✓ Healthy granulation tissue');
    monitoringParameters.push('✓ Reduced exudate');
    monitoringParameters.push('✓ Weight stabilization or gain (if malnourished)');
    monitoringParameters.push('✓ Improved albumin levels');
    monitoringParameters.push('✓ Increased energy and appetite');

    setResult({
      totalCalories,
      totalProtein,
      totalFluid,
      proteinRequirement,
      calorieRequirement,
      fluidRequirement,
      nutritionalGoals,
      keyNutrients,
      sampleMealPlan,
      foodRecommendations,
      supplementRecommendations,
      foodsToAvoid,
      hydrationProtocol,
      monitoringParameters,
      hasComorbidities: diabetes || ckd || hypertension || heartDisease || liverDisease,
      comorbidityList: [
        diabetes && 'Diabetes Mellitus',
        ckd && 'Chronic Kidney Disease',
        hypertension && 'Hypertension',
        heartDisease && 'Heart Disease',
        liverDisease && 'Liver Disease',
        obesity && 'Obesity'
      ].filter(Boolean)
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generateWoundHealingMealPlanPDF(result, patientInfo, weight, woundType, woundSeverity, albumin);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        <Utensils className="inline-block mr-2 mb-1" />
        Comprehensive Wound Healing Meal Plan
      </h2>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold text-blue-900">Enhanced Nutrition for Wound Healing</p>
            <p className="text-blue-800">Personalized meal plans to support tissue repair, immune function, and recovery. Includes Nigerian-adapted high-protein, nutrient-dense menus with comorbidity modifications.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Patient Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Body Weight (kg) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="Enter weight in kg"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Serum Albumin (g/dL)</label>
            <input
              type="number"
              inputMode="decimal"
              value={albumin}
              onChange={(e) => setAlbumin(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
              placeholder="Enter albumin level (optional)"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Normal: 3.5-5.0 g/dL</p>
          </div>
        </div>

        {/* Wound Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Type of Wound *</label>
            <select
              value={woundType}
              onChange={(e) => setWoundType(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="">Select wound type</option>
              <option value="surgical">Post-Surgical Wound</option>
              <option value="pressure">Pressure Ulcer/Bedsore</option>
              <option value="diabetic">Diabetic Foot Ulcer</option>
              <option value="traumatic">Traumatic Wound</option>
              <option value="venous">Venous Leg Ulcer</option>
              <option value="arterial">Arterial Ulcer</option>
              <option value="other">Other Chronic Wound</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Wound Severity *</label>
            <select
              value={woundSeverity}
              onChange={(e) => setWoundSeverity(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded text-sm sm:text-base text-gray-900 min-h-[44px] touch-manipulation"
            >
              <option value="">Select severity</option>
              <option value="mild">Mild (Small, superficial)</option>
              <option value="moderate">Moderate (Medium size, partial thickness)</option>
              <option value="severe">Severe (Large, deep, full thickness)</option>
              <option value="multiple">Multiple Wounds</option>
            </select>
          </div>
        </div>

        {/* Mobility Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Mobility Status</label>
          <select
            value={mobilityStatus}
            onChange={(e) => setMobilityStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select mobility status</option>
            <option value="ambulatory">Ambulatory (Walking independently)</option>
            <option value="assisted">Assisted Ambulation (Walking with help)</option>
            <option value="wheelchair">Wheelchair Bound</option>
            <option value="bedbound">Bed Bound</option>
          </select>
        </div>

        {/* Comorbidities */}
        <div className="border-2 border-orange-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-bold text-sm sm:text-base text-orange-700 mb-2 sm:mb-3">Comorbidities (Check all that apply)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={diabetes} onChange={(e) => setDiabetes(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Diabetes Mellitus</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={ckd} onChange={(e) => setCkd(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Chronic Kidney Disease</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={hypertension} onChange={(e) => setHypertension(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Hypertension</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={heartDisease} onChange={(e) => setHeartDisease(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Heart Disease</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={liverDisease} onChange={(e) => setLiverDisease(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Liver Disease</span>
            </label>

            <label className="flex items-center space-x-2 p-2 hover:bg-orange-50 active:bg-orange-100 rounded cursor-pointer touch-manipulation min-h-[40px]">
              <input type="checkbox" checked={obesity} onChange={(e) => setObesity(e.target.checked)} className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Obesity (BMI &gt; 30)</span>
            </label>
          </div>
        </div>

        <button
          onClick={calculateMealPlan}
          disabled={!weight || !woundType || !woundSeverity}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 active:bg-green-800 font-bold text-sm sm:text-base lg:text-lg disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
        >
          Generate Comprehensive Meal Plan
        </button>

        {result && (
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {/* Nutritional Goals Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-green-700">Daily Nutritional Goals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Calories</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{result.totalCalories}</p>
                  <p className="text-xs text-gray-500">kcal/day</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded shadow">
                  <p className="text-xs sm:text-sm text-gray-600">Protein</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{result.totalProtein}g</p>
                  <p className="text-xs text-gray-500">/day</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded shadow col-span-2 sm:col-span-1">
                  <p className="text-sm text-gray-600">Fluids</p>
                  <p className="text-3xl font-bold text-cyan-600">{result.totalFluid}</p>
                  <p className="text-xs text-gray-500">ml/day ({result.fluidRequirement} ml/kg)</p>
                </div>
              </div>
            </div>

            {/* Comorbidities Alert */}
            {result.hasComorbidities && (
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <h3 className="font-bold text-lg mb-2 flex items-center text-yellow-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Active Comorbidities
                </h3>
                <p className="text-sm mb-2">Meal plan includes modifications for:</p>
                <ul className="list-disc pl-5 text-sm">
                  {result.comorbidityList.map((condition: string, index: number) => (
                    <li key={index} className="text-yellow-800">{condition}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Nutrients */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Essential Nutrients for Wound Healing</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.keyNutrients.map((nutrient: string, index: number) => (
                  <div key={index} className={nutrient.startsWith('ESSENTIAL') || nutrient.match(/^\d\./) ? 'font-semibold mt-2' : ''}>{nutrient}</div>
                ))}
              </div>
            </div>

            {/* 7-Day Meal Plan */}
            <div className="bg-white p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-2xl mb-4 text-green-700 text-center">{result.sampleMealPlan.title}</h3>
              <p className="text-center text-gray-600 mb-6 italic">{result.sampleMealPlan.subtitle}</p>
              
              {result.sampleMealPlan.days.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="mb-6 border-b pb-4 last:border-b-0">
                  <h4 className="font-bold text-xl mb-3 text-blue-700 bg-blue-50 p-2 rounded">{day.day}</h4>
                  {day.meals.map((meal: any, mealIndex: number) => (
                    <div key={mealIndex} className="mb-4 ml-4">
                      <p className="font-semibold text-green-600 mb-1">{meal.time}</p>
                      <ul className="text-sm space-y-1 ml-4">
                        {meal.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className={item.includes('Protein:') ? 'font-semibold text-blue-600 mt-1' : ''}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Food Recommendations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Nigerian Food Recommendations</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.foodRecommendations.map((food: string, index: number) => (
                  <div key={index} className={food.includes('FOODS') || food.includes('MODIFICATIONS') ? 'font-semibold mt-2 text-green-700' : ''}>{food}</div>
                ))}
              </div>
            </div>

            {/* Foods to Avoid */}
            {result.foodsToAvoid.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                <h3 className="font-bold text-lg mb-2 text-red-700">Foods to Limit or Avoid</h3>
                <ul className="text-sm space-y-1">
                  {result.foodsToAvoid.map((food: string, index: number) => (
                    <li key={index}>{food}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supplement Recommendations */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Supplement Recommendations</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.supplementRecommendations.map((supp: string, index: number) => (
                  <div key={index} className={supp.match(/^\d\./) || supp.includes('PROTOCOL') || supp.includes('SUPPLEMENTS') ? 'font-semibold mt-2 text-indigo-700' : supp.includes('⚠️') ? 'font-bold text-red-600' : ''}>{supp}</div>
                ))}
              </div>
            </div>

            {/* Hydration Protocol */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Hydration Protocol</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.hydrationProtocol.map((hydration: string, index: number) => (
                  <div key={index} className={hydration.includes('TARGET') || hydration.includes('DISTRIBUTION') || hydration.includes('RECOMMENDED') || hydration.includes('AVOID') || hydration.includes('MODIFICATION') ? 'font-semibold mt-2 text-cyan-700' : hydration.includes('⚠️') ? 'font-bold text-red-600' : ''}>{hydration}</div>
                ))}
              </div>
            </div>

            {/* Monitoring Parameters */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Monitoring & Follow-up</h3>
              <div className="whitespace-pre-line text-sm space-y-1">
                {result.monitoringParameters.map((param: string, index: number) => (
                  <div key={index} className={param.includes('MONITORING') || param.includes('SIGNS') ? 'font-semibold mt-2 text-yellow-700' : param.startsWith('✓') ? 'text-green-600' : ''}>{param}</div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-bold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Complete Meal Plan PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
