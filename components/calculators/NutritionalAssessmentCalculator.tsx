'use client';

import { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { generateNutritionalAssessmentPDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function NutritionalAssessmentCalculator({ patientInfo }: PatientInfoProps) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [weightLoss, setWeightLoss] = useState('0');
  const [acuteDisease, setAcuteDisease] = useState('0');
  const [result, setResult] = useState<any>(null);

  const calculateMUST = () => {
    let score = 0;
    
    // BMI Score - calculate from weight and height
    const weightKg = parseFloat(weight);
    const heightM = parseFloat(height) / 100;
    const bmiValue = weightKg / (heightM * heightM);
    let bmiScore = 0;
    if (!isNaN(bmiValue)) {
      if (bmiValue < 18.5) {
        bmiScore = 2;
      } else if (bmiValue >= 18.5 && bmiValue <= 20) {
        bmiScore = 1;
      } else {
        bmiScore = 0;
      }
    }
    
    score = bmiScore + parseInt(weightLoss) + parseInt(acuteDisease);
    
    let riskLevel = '';
    let interventions: string[] = [];
    let dietaryPlan: string[] = [];
    let supplements: string[] = [];
    let monitoring: string[] = [];
    let nigerianFoods: string[] = [];

    if (score === 0) {
      riskLevel = 'Low Risk';
      
      interventions = [
        'Routine clinical care',
        'Repeat screening: Weekly for inpatients, Monthly for outpatients',
        'Encourage healthy balanced diet',
        'No specific nutritional intervention needed'
      ];
      
      dietaryPlan = [
        'Balanced Nigerian diet - 3 meals + 2 snacks',
        'Include all food groups daily',
        'Target: 25-30 kcal/kg/day',
        'Protein: 0.8-1.0 g/kg/day'
      ];
      
      supplements = [
        'Generally not needed',
        'Multivitamin if dietary variety limited'
      ];
      
      monitoring = [
        'Weekly weight for inpatients',
        'Monthly weight for outpatients',
        'Food intake observation'
      ];

    } else if (score === 1) {
      riskLevel = 'Medium Risk';
      
      interventions = [
        'Observe and document food intake for 3 days',
        'Repeat screening: Weekly',
        'Increase dietary intake',
        'Consider oral nutritional supplements',
        'Set nutritional goals and monitor'
      ];
      
      dietaryPlan = [
        'FORTIFIED Nigerian Diet - HIGH CALORIE',
        'Target: 30-35 kcal/kg/day',
        'Protein: 1.0-1.2 g/kg/day',
        '',
        'Meal Plan (6 meals daily):',
        'Breakfast: Fortified pap/custard + eggs + milk',
        'Mid-morning: Fruit + groundnuts',
        'Lunch: Rice/yam + protein + vegetable + oil',
        'Afternoon: Milkshake/yogurt + biscuits',
        'Dinner: Eba/fufu + soup (high protein) + fish/meat',
        'Bedtime: Milk drink + bread with groundnut butter',
        '',
        'FORTIFICATION STRATEGIES:',
        '- Add powdered milk to pap, tea, soups',
        '- Add groundnut/soya powder to meals',
        '- Use extra cooking oil/butter',
        '- Add eggs to rice, noodles',
        '- Blend banana/avocado into drinks'
      ];
      
      supplements = [
        'Oral Nutritional Supplements (ONS) - 1-2 servings/day:',
        '  Nigerian available:',
        '  - Ensure Plus (400 kcal per bottle)',
        '  - Pediasure (for children)',
        '  - Glucerna (if diabetic)',
        '',
        'Alternative homemade supplements:',
        '  - Groundnut/soya milk smoothies',
        '  - Fortified custard (add milk powder, eggs, sugar)',
        '  - Avocado-banana-milk shake',
        '',
        'Micronutrients:',
        '  - Multivitamin daily',
        '  - Vitamin C 500mg',
        '  - Zinc 15-20mg (wound healing)'
      ];
      
      monitoring = [
        'Weigh 2-3 times weekly',
        'Food intake charts daily',
        'Weekly nutritional reassessment',
        'Monitor for improvement in 2 weeks'
      ];

    } else {
      riskLevel = 'High Risk';
      
      interventions = [
        'URGENT NUTRITIONAL INTERVENTION REQUIRED',
        'Refer to dietitian/nutrition team',
        'Treat underlying causes',
        'Improve and increase overall nutritional intake',
        'Daily monitoring of food intake',
        'Consider enteral feeding if oral intake inadequate',
        'Repeat screening: Daily until improving, then weekly'
      ];
      
      dietaryPlan = [
        'AGGRESSIVE NUTRITIONAL THERAPY',
        'Target: 35-40 kcal/kg/day (hypercaloric)',
        'Protein: 1.5-2.0 g/kg/day (high protein)',
        '',
        'HIGH-CALORIE Nigerian Meal Plan (8+ meals daily):',
        '',
        '06:00 - Fortified pap with:',
        '  - 3 tablespoons milk powder',
        '  - 2 eggs (boiled/scrambled)',
        '  - Sugar/honey',
        '  - Groundnut paste (2 tbsp)',
        '',
        '09:00 - Snack:',
        '  - Yogurt or milkshake',
        '  - Plantain chips or chin-chin',
        '  - Groundnuts (50g)',
        '',
        '12:00 - Lunch:',
        '  - Large portion rice/yam (2 cups)',
        '  - Protein (fish/chicken/beef) 150g',
        '  - Vegetable soup with extra palm oil',
        '  - Avocado',
        '',
        '15:00 - Afternoon snack:',
        '  - Ensure Plus drink OR',
        '  - Fortified custard with banana',
        '  - Biscuits with peanut butter',
        '',
        '18:00 - Dinner:',
        '  - Eba/fufu/semovita (large portion)',
        '  - Protein-rich soup (egusi, ogbono)',
        '  - Extra fish/meat (100-150g)',
        '  - Vegetables cooked in oil',
        '',
        '20:00 - Evening snack:',
        '  - Bread (3-4 slices) with butter + sardines',
        '  - Hot chocolate made with full-cream milk',
        '',
        '22:00 - Bedtime:',
        '  - Ensure Plus OR homemade protein shake',
        '',
        'OVERNIGHT (if awake):',
        '  - Milk drink + biscuits',
        '',
        'FORTIFICATION (add to every meal):',
        '  - Milk powder',
        '  - Cooking oil/butter',
        '  - Groundnut/soya powder',
        '  - Eggs (where possible)',
        '  - Sugar/honey for energy'
      ];
      
      supplements = [
        'MANDATORY Oral Nutritional Supplements:',
        '  - Ensure Plus: 2-3 bottles daily (800-1200 kcal)',
        '  - OR Pediasure: 2-3 servings (for pediatrics)',
        '  - Take between meals, not instead of meals',
        '',
        'If oral supplements unavailable - Homemade HIGH-CALORIE drinks:',
        '',
        'Recipe 1: Power Shake (500+ kcal)',
        '  - 300ml full-cream milk',
        '  - 1 banana',
        '  - 1 avocado',
        '  - 3 tbsp groundnut butter',
        '  - 2 tbsp milk powder',
        '  - 2 tbsp honey',
        '  - 1 raw egg (if safe)',
        '',
        'Recipe 2: Fortified Custard (400+ kcal)',
        '  - Regular custard',
        '  - Add 3 tbsp milk powder',
        '  - Add 2 raw eggs (mix after cooking)',
        '  - Add 2 tbsp sugar',
        '  - Add banana/mango',
        '',
        'Micronutrient Support:',
        '  - Multivitamin with minerals - DAILY',
        '  - Vitamin C 1000mg daily',
        '  - Zinc 20-30mg daily',
        '  - Vitamin D 1000-2000 IU',
        '  - Iron if anemic',
        '',
        'Consider Enteral Feeding if:',
        '  - Cannot achieve >60% target orally within 3 days',
        '  - Persistent weight loss despite oral support',
        '  - Severe dysphagia',
        '  Options: Nasogastric tube, PEG tube'
      ];
      
      monitoring = [
        'INTENSIVE MONITORING:',
        '  - Daily weight (same time, same scale)',
        '  - Strict food intake documentation (calorie count)',
        '  - Fluid balance chart',
        '  - Supplement consumption tracking',
        '',
        'Weekly Labs:',
        '  - Albumin, prealbumin',
        '  - Hemoglobin',
        '  - Electrolytes',
        '',
        'Reassessment:',
        '  - Daily MUST score until stable',
        '  - Weekly after improvement',
        '',
        'Target Goals:',
        '  - Weight gain 0.5-1 kg/week',
        '  - Improved muscle strength',
        '  - Increased activity tolerance',
        '  - Wound healing (if applicable)',
        '',
        'Refer to Dietitian/Nutrition Support Team',
        'Consider underlying causes: Cancer, HIV, TB, malabsorption'
      ];
    }

    // Nigerian High-Calorie, High-Protein Foods
    nigerianFoods = [
      'HIGH-PROTEIN FOODS (Eat liberally):',
      '  - Fish: Mackerel, tilapia, catfish (100-150g per meal)',
      '  - Meat: Chicken, beef, goat meat',
      '  - Eggs: 2-3 daily',
      '  - Beans, lentils, moin-moin',
      '  - Milk, yogurt, cheese',
      '  - Groundnuts, soya beans',
      '',
      'HIGH-CALORIE FOODS (Add extra):',
      '  - Cooking oils: Palm oil, groundnut oil, butter',
      '  - Groundnut butter/paste',
      '  - Avocado',
      '  - Full-cream milk powder',
      '  - Coconut milk',
      '',
      'CARBOHYDRATES (Energy):',
      '  - Rice, yam, cassava',
      '  - Eba, fufu, semovita, amala',
      '  - Bread, biscuits',
      '  - Plantain, potatoes',
      '',
      'FRUITS & VEGETABLES (Vitamins):',
      '  - Banana, mango, papaya, orange',
      '  - Dark leafy greens (ugwu, waterleaf)',
      '  - Tomatoes, carrots',
      '',
      'TRADITIONAL HIGH-CALORIE SOUPS:',
      '  - Egusi soup (high fat from melon seeds)',
      '  - Ogbono soup',
      '  - Oha soup',
      '  - Banga soup',
      '  All with generous palm oil and protein'
    ];

    // Additional recommendations based on BMI and weight loss
    const additionalConcerns: string[] = [];
    
    if (bmiValue < 16) {
      additionalConcerns.push('SEVERE MALNUTRITION: BMI <16 - Consider hospital admission for refeeding');
      additionalConcerns.push('Risk of refeeding syndrome - Monitor electrolytes closely');
    }
    
    if (parseInt(weightLoss) === 2) {
      additionalConcerns.push('Significant unintentional weight loss - Investigate underlying cause');
      additionalConcerns.push('Screen for: Cancer, HIV, TB, diabetes, hyperthyroidism, depression');
    }
    
    if (parseInt(acuteDisease) === 2) {
      additionalConcerns.push('Acute disease with no nutritional intake - High metabolic demand');
      additionalConcerns.push('Nutritional support URGENT to prevent further deterioration');
    }

    setResult({
      score,
      riskLevel,
      bmiScore,
      weightLossScore: parseInt(weightLoss),
      acuteDiseaseScore: parseInt(acuteDisease),
      bmiValue,
      interventions,
      dietaryPlan,
      supplements,
      monitoring,
      nigerianFoods,
      additionalConcerns
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">Nutritional Risk Assessment (MUST Score)</h2>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter weight in kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (cm) *</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter height in cm"
            />
          </div>
        </div>
        {weight && height && (
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              Calculated BMI: {(parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)).toFixed(1)}
              {(parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)) < 18.5 && ' (Underweight - 2 points)'}
              {(parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)) >= 18.5 && 
               (parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)) <= 20 && ' (Low normal - 1 point)'}
              {(parseFloat(weight) / Math.pow(parseFloat(height)/100, 2)) > 20 && ' (Normal - 0 points)'}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Unplanned Weight Loss in last 3-6 months</label>
          <select
            value={weightLoss}
            onChange={(e) => setWeightLoss(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="0">0 = &lt;5% weight loss</option>
            <option value="1">1 = 5-10% weight loss</option>
            <option value="2">2 = &gt;10% weight loss</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Acute Disease Effect</label>
          <select
            value={acuteDisease}
            onChange={(e) => setAcuteDisease(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="0">0 = No acute disease or nutritional intake unaffected</option>
            <option value="2">2 = Acutely ill AND no nutritional intake for &gt;5 days (or likely)</option>
          </select>
        </div>

        <button
          onClick={calculateMUST}
          disabled={!weight || !height}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:bg-gray-400"
        >
          Calculate Nutritional Risk
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded ${
              result.score === 0 ? 'bg-green-50' : 
              result.score === 1 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h3 className="font-bold text-lg">MUST Score Assessment</h3>
              <p className="text-2xl font-bold">{result.riskLevel}</p>
              <p className="text-xl font-bold">Total Score: {result.score}</p>
              
              <div className="mt-3 space-y-1 text-sm">
                <div>BMI Score: {result.bmiScore} (BMI: {result.bmiValue})</div>
                <div>Weight Loss Score: {result.weightLossScore}</div>
                <div>Acute Disease Score: {result.acuteDiseaseScore}</div>
              </div>
            </div>

            {result.additionalConcerns.length > 0 && (
              <div className="bg-red-50 p-4 rounded border-2 border-red-500">
                <h3 className="font-bold text-lg mb-2 flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  CRITICAL CONCERNS
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.additionalConcerns.map((concern: string, index: number) => (
                    <li key={index} className="font-semibold text-red-700">{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Interventions Required</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.interventions.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Dietary Plan</h3>
              <div className="space-y-1 whitespace-pre-line">
                {result.dietaryPlan.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Nutritional Supplements</h3>
              <div className="space-y-1 whitespace-pre-line">
                {result.supplements.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Nigerian High-Calorie Foods</h3>
              <div className="space-y-1 whitespace-pre-line">
                {result.nigerianFoods.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Monitoring Plan</h3>
              <div className="space-y-1 whitespace-pre-line">
                {result.monitoring.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateNutritionalAssessmentPDF(result, patientInfo)}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
