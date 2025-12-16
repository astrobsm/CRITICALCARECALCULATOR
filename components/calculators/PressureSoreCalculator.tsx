'use client';

import { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { generatePressureSorePDF } from '@/lib/pdfGenerator';

interface PatientInfoProps {
  patientInfo?: any;
}

export default function PressureSoreCalculator({ patientInfo }: PatientInfoProps) {
  const [sensoryPerception, setSensoryPerception] = useState('4');
  const [moisture, setMoisture] = useState('4');
  const [activity, setActivity] = useState('4');
  const [mobility, setMobility] = useState('4');
  const [nutrition, setNutrition] = useState('4');
  const [frictionShear, setFrictionShear] = useState('3');
  const [result, setResult] = useState<any>(null);

  const calculateRisk = () => {
    const score = parseInt(sensoryPerception) + parseInt(moisture) + 
                  parseInt(activity) + parseInt(mobility) + 
                  parseInt(nutrition) + parseInt(frictionShear);

    let riskLevel = '';
    let riskDescription = '';
    let preventionProtocol: string[] = [];
    let turningSchedule: string[] = [];
    let skinCareProtocol: string[] = [];
    let nutritionalSupport: string[] = [];
    let equipmentNeeded: string[] = [];

    if (score <= 9) {
      riskLevel = 'Severe Risk';
      riskDescription = 'Extreme risk - Pressure ulcer development highly likely without aggressive intervention';
      
      preventionProtocol = [
        'IMMEDIATE ACTION REQUIRED',
        'Turn patient every 1-2 hours around the clock',
        'Use pressure-relieving mattress (air or foam)',
        'NO direct pressure on bony prominences',
        'Elevate heels off bed using pillow under calves',
        'Use pillows between knees when side-lying',
        'Assess skin every shift (8-hourly minimum)',
        'Document all pressure areas with photographs',
        'Consult wound care specialist/plastic surgery'
      ];

      turningSchedule = [
        '00:00 - Supine (30° head elevation)',
        '02:00 - Right lateral (30° tilt, pillows support)',
        '04:00 - Supine',
        '06:00 - Left lateral (30° tilt)',
        '08:00 - Supine',
        '10:00 - Right lateral',
        '12:00 - Supine or chair (if tolerated, max 1 hour)',
        '14:00 - Left lateral',
        '16:00 - Supine',
        '18:00 - Right lateral',
        '20:00 - Supine',
        '22:00 - Left lateral',
        '',
        'NEVER position directly on trochanter or bony prominences',
        'Use 30° lateral tilt technique',
        'Document position changes on turning chart'
      ];

      skinCareProtocol = [
        'Gentle cleansing with pH-balanced cleanser (avoid soap)',
        'Pat dry, do NOT rub',
        'Apply barrier cream to at-risk areas:',
        '  - Sacrum, coccyx',
        '  - Heels (keep OFF bed surface)',
        '  - Shoulder blades',
        '  - Elbows',
        '  - Hips/trochanters',
        '  - Occiput (back of head)',
        '',
        'Moisture barrier creams (Nigerian available):',
        '  - Zinc oxide cream',
        '  - Petroleum jelly (Vaseline)',
        '  - Sudocrem',
        '',
        'Manage incontinence aggressively:',
        '  - Urinary catheter if needed',
        '  - Absorbent pads changed immediately when wet',
        '  - Barrier cream after each incontinence episode'
      ];

      nutritionalSupport = [
        'HIGH-PROTEIN DIET ESSENTIAL',
        'Target: 1.25-1.5g protein/kg/day',
        'Calories: 30-35 kcal/kg/day',
        '',
        'Protein-rich Nigerian foods:',
        '  - Eggs (2-3 per day)',
        '  - Fish (mackerel, tilapia) - 100-150g/day',
        '  - Chicken - 100-150g/day',
        '  - Beans, lentils',
        '  - Milk, yogurt',
        '',
        'Supplements if oral intake poor:',
        '  - Ensure/Pediasure drinks',
        '  - Protein powder in pap/custard',
        '  - Multivitamins with zinc',
        '  - Vitamin C 500mg daily (wound healing)',
        '',
        'Hydration: 2-3 liters/day unless contraindicated',
        '',
        'Consider NGT feeding if cannot meet oral requirements'
      ];

      equipmentNeeded = [
        'MANDATORY Equipment:',
        '  - Pressure-relieving mattress (air or high-spec foam)',
        '  - Heel protectors or pillow under calves',
        '  - Bed cradle to keep sheets off feet',
        '  - Slide sheets for repositioning (avoid dragging)',
        '',
        'Chair/Wheelchair:',
        '  - Pressure-relieving cushion',
        '  - Limit sitting to <1 hour at a time',
        '',
        'Nigerian-available alternatives:',
        '  - Egg crate foam mattress overlay',
        '  - Multiple pillows for positioning',
        '  - Foam wedges',
        '  - Sheepskin/fleece pads (if available)'
      ];

    } else if (score <= 12) {
      riskLevel = 'High Risk';
      riskDescription = 'High probability of pressure ulcer development - intensive prevention needed';
      
      preventionProtocol = [
        'Turn every 2 hours during day, 3 hours at night',
        'Pressure-relieving mattress or overlay recommended',
        'Protect heels - keep off bed surface',
        'Skin assessment twice daily',
        'Use positioning aids (pillows, wedges)',
        'Minimize head elevation when possible',
        'Active prevention of moisture damage'
      ];

      turningSchedule = [
        '06:00 - Supine',
        '08:00 - Right lateral',
        '10:00 - Supine',
        '12:00 - Left lateral or chair',
        '14:00 - Supine',
        '16:00 - Right lateral',
        '18:00 - Supine',
        '20:00 - Left lateral',
        '22:00 - Supine',
        '01:00 - Right lateral',
        '04:00 - Left lateral',
        '',
        'Use 30° tilt technique',
        'Alternate pressure points'
      ];

      skinCareProtocol = [
        'Daily skin inspection of all pressure points',
        'Keep skin clean and dry',
        'Use barrier cream on at-risk areas',
        'Moisturize dry skin (avoid over bony prominences)',
        'Manage incontinence promptly',
        'Avoid massage over bony prominences',
        'Report any skin changes immediately'
      ];

      nutritionalSupport = [
        'Protein: 1.0-1.25g/kg/day',
        'Adequate calories: 25-30 kcal/kg/day',
        'Encourage protein-rich foods each meal',
        'Multivitamin supplement',
        'Ensure adequate hydration',
        'Monitor weight weekly'
      ];

      equipmentNeeded = [
        'Pressure-relieving overlay or mattress',
        'Positioning pillows',
        'Heel protectors or pillow under calves',
        'Consider pressure-relieving chair cushion'
      ];

    } else if (score <= 14) {
      riskLevel = 'Moderate Risk';
      riskDescription = 'Some risk factors present - preventive measures important';
      
      preventionProtocol = [
        'Turn every 3-4 hours',
        'Regular skin assessment daily',
        'Encourage mobility and repositioning',
        'Protect vulnerable areas',
        'Maintain good nutrition and hydration'
      ];

      turningSchedule = [
        '06:00 - Supine',
        '09:00 - Right lateral',
        '12:00 - Chair or supine',
        '15:00 - Left lateral',
        '18:00 - Supine',
        '21:00 - Right lateral',
        '03:00 - Left lateral'
      ];

      skinCareProtocol = [
        'Daily skin checks',
        'Keep skin clean and dry',
        'Moisturize as needed',
        'Barrier cream if incontinent',
        'Report any redness lasting >30 minutes'
      ];

      nutritionalSupport = [
        'Balanced diet with adequate protein',
        'Encourage 3 meals + snacks',
        'Hydration: 1.5-2 liters/day',
        'Monitor nutritional intake'
      ];

      equipmentNeeded = [
        'Standard hospital mattress acceptable',
        'Positioning pillows helpful',
        'Consider foam overlay if comfort issue'
      ];

    } else {
      riskLevel = 'Low Risk';
      riskDescription = 'Minimal risk with current condition';
      
      preventionProtocol = [
        'Encourage regular movement and position changes',
        'Patient education on pressure ulcer prevention',
        'Maintain skin hygiene',
        'Good nutrition and hydration',
        'Monitor for changes in condition'
      ];

      turningSchedule = [
        'Encourage self-repositioning',
        'Change position every 4-6 hours or as comfortable',
        'Mobilize out of bed regularly'
      ];

      skinCareProtocol = [
        'Regular bathing/showering',
        'Keep skin clean and dry',
        'Moisturize dry areas',
        'Monitor for any skin changes'
      ];

      nutritionalSupport = [
        'Maintain balanced diet',
        'Adequate protein intake',
        'Regular hydration'
      ];

      equipmentNeeded = [
        'Standard equipment adequate',
        'No special pressure-relieving devices needed currently'
      ];
    }

    // Risk factors breakdown
    const riskFactors: string[] = [];
    if (parseInt(sensoryPerception) <= 2) riskFactors.push('Severely impaired sensory perception');
    if (parseInt(moisture) <= 2) riskFactors.push('Skin frequently/constantly moist');
    if (parseInt(activity) <= 2) riskFactors.push('Bedfast or chairfast');
    if (parseInt(mobility) <= 2) riskFactors.push('Very limited or completely immobile');
    if (parseInt(nutrition) <= 2) riskFactors.push('Very poor or inadequate nutrition');
    if (parseInt(frictionShear) <= 2) riskFactors.push('Problem with friction and shear');

    setResult({
      score,
      riskLevel,
      riskDescription,
      preventionProtocol,
      turningSchedule,
      skinCareProtocol,
      nutritionalSupport,
      equipmentNeeded,
      riskFactors,
      sensoryScore: parseInt(sensoryPerception),
      moistureScore: parseInt(moisture),
      activityScore: parseInt(activity),
      mobilityScore: parseInt(mobility),
      nutritionScore: parseInt(nutrition),
      frictionScore: parseInt(frictionShear)
    });
  };

  const handleDownloadPDF = () => {
    if (result) {
      generatePressureSorePDF(result, patientInfo);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Pressure Sore Risk Assessment (Braden Scale)</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">1. Sensory Perception</label>
          <select
            value={sensoryPerception}
            onChange={(e) => setSensoryPerception(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="4">Completely limited - Unresponsive to painful stimuli</option>
            <option value="3">Very limited - Responds only to painful stimuli</option>
            <option value="2">Slightly limited - Responds to verbal commands</option>
            <option value="1">No impairment - Responds to verbal commands</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">2. Moisture (Skin exposure to moisture)</label>
          <select
            value={moisture}
            onChange={(e) => setMoisture(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="4">Constantly moist - Skin always wet</option>
            <option value="3">Very moist - Skin often but not always wet</option>
            <option value="2">Occasionally moist - Skin occasionally moist</option>
            <option value="1">Rarely moist - Skin usually dry</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">3. Activity (Physical activity level)</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="4">Bedfast - Confined to bed</option>
            <option value="3">Chairfast - Ability to walk severely limited</option>
            <option value="2">Walks occasionally - Walks occasionally during day</option>
            <option value="1">Walks frequently - Walks outside room at least twice daily</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">4. Mobility (Ability to change and control body position)</label>
          <select
            value={mobility}
            onChange={(e) => setMobility(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="4">Completely immobile - Cannot make any position change</option>
            <option value="3">Very limited - Makes occasional slight changes</option>
            <option value="2">Slightly limited - Makes frequent slight changes</option>
            <option value="1">No limitation - Makes major and frequent changes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">5. Nutrition (Usual food intake pattern)</label>
          <select
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="4">Very poor - Never eats complete meal, rarely eats &gt;1/3</option>
            <option value="3">Probably inadequate - Rarely eats complete meal, eats about 1/2</option>
            <option value="2">Adequate - Eats over half of most meals</option>
            <option value="1">Excellent - Eats most of every meal, never refuses meal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">6. Friction and Shear</label>
          <select
            value={frictionShear}
            onChange={(e) => setFrictionShear(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="3">Problem - Requires moderate to maximum assistance, slides down</option>
            <option value="2">Potential problem - Moves feebly, requires minimum assistance</option>
            <option value="1">No apparent problem - Moves independently, maintains position</option>
          </select>
        </div>

        <button
          onClick={calculateRisk}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Calculate Pressure Sore Risk
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded ${
              result.score <= 9 ? 'bg-red-50' : 
              result.score <= 12 ? 'bg-orange-50' : 
              result.score <= 14 ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <h3 className="font-bold text-lg">Braden Scale Assessment</h3>
              <p className="text-2xl font-bold">{result.riskLevel}</p>
              <p className="text-xl font-bold">Score: {result.score}/23</p>
              <p className="mt-2">{result.riskDescription}</p>
              
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>Sensory: {result.sensoryScore}</div>
                <div>Moisture: {result.moistureScore}</div>
                <div>Activity: {result.activityScore}</div>
                <div>Mobility: {result.mobilityScore}</div>
                <div>Nutrition: {result.nutritionScore}</div>
                <div>Friction/Shear: {result.frictionScore}</div>
              </div>
            </div>

            {result.riskFactors.length > 0 && (
              <div className="bg-red-50 p-4 rounded">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Critical Risk Factors Identified
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.riskFactors.map((factor: string, index: number) => (
                    <li key={index} className="font-semibold text-red-700">{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Prevention Protocol</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.preventionProtocol.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Turning Schedule</h3>
              <div className="space-y-1 font-mono text-sm">
                {result.turningSchedule.map((item: string, index: number) => (
                  <div key={index} className={item === '' ? '' : 'ml-2'}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Skin Care Protocol</h3>
              <div className="space-y-1">
                {result.skinCareProtocol.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Nutritional Support</h3>
              <div className="space-y-1">
                {result.nutritionalSupport.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">Equipment Needed</h3>
              <div className="space-y-1">
                {result.equipmentNeeded.map((item: string, index: number) => (
                  <div key={index}>{item || <br />}</div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
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
