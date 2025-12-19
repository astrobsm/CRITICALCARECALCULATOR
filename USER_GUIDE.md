# Clinical Critical Calculator - User Guide

## Overview

The Clinical Critical Calculator (CCC) is a comprehensive medical calculation tool designed for healthcare professionals. It provides 13 specialized calculators aligned with WHO guidelines for critical care management.

## Features

### 1. **Sodium Disorder Calculator**
- **Purpose**: Calculate sodium correction strategies for hypo/hypernatremia
- **Inputs**:
  - Current sodium level (mEq/L)
  - Target sodium level (mEq/L)
  - Patient weight (kg)
  - Gender and age category
  - Volume status (hypovolemic/euvolemic/hypervolemic)
  - Symptom severity and onset (acute/chronic)
- **Outputs**:
  - Sodium deficit/excess calculation
  - Treatment recommendations
  - Fluid type and rate
  - Safety guidelines (max correction rates)
  - Monitoring requirements

### 2. **Potassium Disorder Calculator**
- **Purpose**: Manage hypo/hyperkalemia treatment
- **Inputs**:
  - Current potassium level (mEq/L)
  - Target potassium level (mEq/L)
  - Patient weight (kg)
  - Renal function status
  - ECG changes present (Yes/No)
- **Outputs**:
  - Potassium deficit/excess
  - Treatment protocol
  - Route and rate of administration
  - ECG monitoring requirements

### 3. **Acid-Base Calculator**
- **Purpose**: Interpret ABG results and diagnose acid-base disorders
- **Inputs**:
  - pH
  - PaCO₂ (mmHg)
  - HCO₃⁻ (mEq/L)
  - PaO₂ (mmHg)
  - Na⁺, Cl⁻ (mEq/L)
- **Outputs**:
  - Primary disorder diagnosis
  - Anion gap calculation
  - Expected compensation
  - Treatment recommendations

### 4. **GFR Calculator**
- **Purpose**: Estimate kidney function using multiple equations
- **Inputs**:
  - Serum creatinine (mg/dL)
  - Age, weight, height
  - Gender and ethnicity
- **Outputs**:
  - CKD-EPI eGFR
  - MDRD eGFR
  - Cockcroft-Gault CrCl
  - CKD stage classification
  - Drug dosing recommendations

### 5. **BNF Drug Calculator**
- **Purpose**: Evidence-based drug dosing for common ICU medications
- **Drugs Included**:
  - Antibiotics (Vancomycin, Gentamicin, Piperacillin-Tazobactam)
  - Sedatives (Propofol, Midazolam, Dexmedetomidine)
  - Vasopressors (Noradrenaline, Adrenaline, Vasopressin, Dobutamine)
  - Analgesics (Morphine, Fentanyl)
- **Features**:
  - Renal dosing adjustments
  - Loading and maintenance doses
  - Infusion rate calculations
  - Therapeutic monitoring guidance

### 6. **Burns Calculator (Parkland Formula)**
- **Purpose**: Calculate fluid resuscitation for burn patients
- **Inputs**:
  - Total body surface area (TBSA) burned (%)
  - Patient weight (kg)
  - Time since injury (hours)
- **Outputs**:
  - First 24-hour fluid requirement
  - Hourly infusion rates
  - Second 24-hour maintenance fluids
  - Monitoring parameters
  - Adjustment criteria

### 7. **Nutrition Calculator**
- **Purpose**: Calculate nutritional requirements for critically ill patients
- **Inputs**:
  - Weight, height
  - Age, gender
  - Stress factor (sepsis, trauma, burns, etc.)
  - Activity level
- **Outputs**:
  - Basal metabolic rate (BMR)
  - Total energy expenditure (TEE)
  - Protein requirements (g/kg/day)
  - Caloric targets
  - Feed preparation guide

### 8. **DVT Risk Calculator (Caprini Score)**
- **Purpose**: Assess venous thromboembolism risk
- **Risk Factors Assessed**:
  - Age
  - Surgical history
  - Mobility status
  - Medical history (MI, CHF, DVT, etc.)
  - Pregnancy/hormonal therapy
  - Malignancy
- **Outputs**:
  - Risk score (0-40+)
  - Risk stratification (Low/Moderate/High/Very High)
  - Prophylaxis recommendations
  - Duration of therapy

### 9. **Pressure Sore Risk Calculator (Braden Scale)**
- **Purpose**: Predict pressure ulcer risk
- **Domains Assessed**:
  - Sensory perception
  - Skin moisture
  - Activity level
  - Mobility
  - Nutrition status
  - Friction/shear
- **Outputs**:
  - Braden score (6-23)
  - Risk level
  - Prevention strategies
  - Turning schedule
  - Support surface recommendations

### 10. **MUST Score (Malnutrition Universal Screening Tool)**
- **Purpose**: Screen for malnutrition risk
- **Inputs**:
  - Current BMI
  - Unplanned weight loss (%)
  - Acute disease effect
- **Outputs**:
  - MUST score (0-6)
  - Malnutrition risk level
  - Nutritional care plan
  - Referral criteria

### 11. **Wound Healing Meal Plan**
- **Purpose**: Optimize nutrition for wound healing
- **Inputs**:
  - Wound type and severity
  - Patient weight
  - Comorbidities
- **Outputs**:
  - Enhanced protein requirements
  - Micronutrient supplementation
  - Sample meal plans
  - Hydration targets

### 12. **Weight Loss Calculator**
- **Purpose**: Create safe, sustainable weight reduction plans
- **Inputs**:
  - Current weight and BMI
  - Target weight
  - Timeframe (weeks)
  - Activity level
- **Outputs**:
  - Safe weekly weight loss target
  - Caloric deficit calculation
  - Macronutrient distribution
  - Sample meal plan
  - Exercise recommendations

### 13. **Weight Gain Calculator**
- **Purpose**: Structured weight gain for underweight patients
- **Inputs**:
  - Current BMI
  - Target weight
  - Appetite level
  - Activity level
- **Outputs**:
  - Safe weekly weight gain target
  - Caloric surplus calculation
  - High-calorie meal suggestions
  - Monitoring schedule

## Patient Information Management

### Adding Patient Details
1. Click "Patient Information" button at the top
2. Fill in required fields:
   - Patient name
   - Age
   - Gender
   - Hospital name
   - Hospital number
   - Primary diagnosis
3. Select relevant comorbidities from checklist:
   - Diabetes Mellitus
   - Hypertension
   - Chronic Kidney Disease
   - Heart Failure
   - COPD
   - And 10 more options
4. Click "Save" to apply to all calculations

### Benefits
- Patient details auto-populate in all calculators
- PDF reports include complete patient information
- Comorbidities influence drug dosing and nutrition calculations

## PDF Export Feature

Every calculator includes a "Download PDF Report" button that generates a comprehensive medical document containing:

1. **Patient Demographics**
2. **Calculation Parameters**
3. **Results and Interpretations**
4. **Treatment Recommendations**
5. **Monitoring Guidelines**
6. **References and Guidelines**
7. **Timestamp and Provider Information**

### Using PDF Reports
- Click the download button after performing calculations
- PDF saves automatically to your device
- Suitable for medical records
- Can be printed for ward rounds

## Progressive Web App (PWA) Features

### Installation
**Desktop (Chrome/Edge)**:
1. Visit the application URL
2. Click the install icon in the address bar
3. Click "Install"

**Mobile (Android/iOS)**:
1. Open in browser
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. Confirm installation

### Offline Capabilities
- All calculators work without internet
- Results are cached locally
- Service worker enables offline functionality
- Updates sync when connection restored

### App Shortcuts
Long-press the app icon for quick access to:
- Sodium Calculator
- DVT Risk Assessment
- Burns Calculator
- Weight Management

## Best Practices

### Clinical Use
1. ✅ **Always verify calculations** - Use clinical judgment
2. ✅ **Cross-reference with local protocols** - Guidelines may vary
3. ✅ **Monitor patient response** - Adjust based on labs/vitals
4. ✅ **Document thoroughly** - Save PDF reports
5. ✅ **Update patient information** - Ensure accuracy

### Safety Considerations
- ⚠️ **For healthcare professionals only**
- ⚠️ **Not a replacement for clinical assessment**
- ⚠️ **Verify critical values before administration**
- ⚠️ **Follow your institution's protocols**
- ⚠️ **Consult pharmacy for complex dosing**

## Technical Requirements

### Supported Browsers
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Minimum Specifications
- Screen: 320px width minimum (mobile-responsive)
- Internet: Required for initial load only
- Storage: ~5MB for offline cache

## Troubleshooting

### Calculator Not Loading
1. Clear browser cache
2. Refresh page (Ctrl+R / Cmd+R)
3. Check internet connection
4. Try incognito/private mode

### PDF Not Downloading
1. Allow popups/downloads in browser
2. Check download folder permissions
3. Try different browser
4. Disable browser extensions temporarily

### Offline Mode Not Working
1. Visit app while online first
2. Wait for "Ready for offline use" message
3. Check service worker in browser DevTools
4. Clear cache and reload

## Updates and Version History

The app automatically updates when connected to the internet. To check for updates:
1. Pull down to refresh on mobile
2. Hard refresh on desktop (Ctrl+Shift+R)

## Support and Feedback

For issues, suggestions, or questions:
- Check this documentation first
- Review deployment guides (DEPLOYMENT.md)
- Submit issues via your project repository

## Medical Disclaimer

⚠️ **IMPORTANT MEDICAL DISCLAIMER**

This application is designed as a clinical decision support tool for qualified healthcare professionals. It is NOT a substitute for:
- Professional medical judgment
- Clinical assessment
- Patient examination
- Laboratory confirmation
- Senior/specialist consultation

**Users must:**
- Have appropriate medical training
- Verify all calculations independently
- Follow local protocols and guidelines
- Document clinical decision-making
- Monitor patient outcomes

**The developers assume NO LIABILITY for:**
- Clinical outcomes
- Medication errors
- Calculation misuse
- Data entry mistakes
- System failures

Always prioritize patient safety and use multiple verification methods for critical decisions.

---

## Quick Reference Card

| Calculator | Primary Use | Key Output |
|------------|-------------|------------|
| Sodium | Hypo/hypernatremia | Correction rate |
| Potassium | K⁺ disorders | Replacement dose |
| Acid-Base | ABG interpretation | Disorder type |
| GFR | Renal function | CKD stage |
| BNF Drugs | ICU medications | Dosing regimen |
| Burns | Fluid resuscitation | Parkland formula |
| Nutrition | Caloric needs | kcal/protein targets |
| DVT Risk | VTE prophylaxis | Caprini score |
| Pressure Sore | Ulcer prevention | Braden score |
| MUST | Malnutrition screening | Nutrition plan |
| Wound Healing | Recovery nutrition | Enhanced diet |
| Weight Loss | Safe reduction | Meal plan |
| Weight Gain | Healthy gain | Caloric surplus |

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Alignment**: WHO Critical Care Guidelines
