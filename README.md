# Clinical Critical Calculator (CCC)

A **robust, mobile-first Progressive Web App (PWA)** for critical care calculations aligned with **WHO principles** and **standard ICU protocols**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Medical](https://img.shields.io/badge/use-healthcare_professionals_only-red.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-blueviolet.svg)
![Calculators](https://img.shields.io/badge/calculators-13-blue.svg)

## 🏥 Features

### Core Calculators

1. **Sodium Disorder Management**
   - Hyponatremia and Hypernatremia assessment
   - Automatic severity classification
   - TBW (Total Body Water) calculation
   - Sodium deficit/water deficit calculations
   - Safe correction rate recommendations (WHO guidelines)
   - Volume status-based fluid recommendations

2. **Potassium Disorder Management**
   - Hypokalemia and Hyperkalemia assessment
   - ECG-based risk stratification
   - Potassium deficit estimation
   - Emergency protocol for cardiac changes
   - Magnesium co-factor checking
   - Route-specific replacement rates

3. **Acid-Base Disorder Analysis**
   - Metabolic and Respiratory acidosis/alkalosis
   - Anion Gap calculation (GOLD MARK mnemonic)
   - HCO₃⁻ replacement calculations
   - Differential diagnosis support
   - Treatment protocols for each disorder type

### Key Capabilities

✅ **Mobile-First Design** - Optimized for smartphones and tablets  
✅ **PWA Support** - Install on device, works offline  
✅ **PDF Export** - Generate professional treatment plans  
✅ **WHO-Aligned** - Based on international guidelines  
✅ **Safety-Focused** - Built-in warnings and correction limits  
✅ **Responsive UI** - Works on all screen sizes  
✅ **No Backend Required** - Fully client-side, privacy-focused  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "CRITICAL CARE CALCULATOR"

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository at [vercel.com](https://vercel.com)
3. Vercel will auto-detect Next.js and deploy

**Or use Vercel CLI:**

```bash
npm install -g vercel
vercel
```

### Manual Deployment

The app can be deployed to any platform supporting Next.js:
- **Netlify**: Connect GitHub repo
- **AWS Amplify**: Deploy from Git
- **Digital Ocean App Platform**: Deploy from GitHub

## 📋 Usage Guidelines

### ⚠️ Important Disclaimers

- **For Healthcare Professionals Only**
- This is a clinical decision support tool
- Always verify calculations manually
- Use clinical judgment alongside calculator results
- Not a substitute for clinical assessment
- Check local protocols and guidelines

### Clinical Workflows

#### Sodium Management
1. Enter current sodium level and patient weight
2. Select patient category (gender/age for TBW calculation)
3. Assess volume status and acuity
4. Review calculated deficit and correction rate
5. Follow fluid recommendations
6. Export PDF treatment plan
7. Monitor per protocol (every 2-4 hours)

#### Potassium Management
1. Enter potassium level
2. **Check ECG first** - select findings
3. Verify magnesium status
4. Review urgency and treatment protocol
5. Follow route-specific infusion rates
6. Export treatment plan
7. Monitor per severity

#### Acid-Base Analysis
1. Enter ABG values (pH, HCO₃, PCO₂)
2. Add electrolytes for anion gap
3. Review disorder classification
4. Check possible causes
5. Follow treatment protocol
6. Monitor ABG per protocol

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF + autotable
- **Icons**: Lucide React
- **PWA**: Custom Service Worker
- **Deployment**: Vercel-optimized

## 📂 Project Structure

```
CRITICAL CARE CALCULATOR/
├── app/
│   ├── layout.tsx          # Root layout with PWA metadata
│   ├── page.tsx            # Main page with tab navigation
│   └── globals.css         # Global styles
├── components/
│   └── calculators/
│       ├── SodiumCalculator.tsx
│       ├── PotassiumCalculator.tsx
│       └── AcidBaseCalculator.tsx
├── lib/
│   └── pdfGenerator.ts     # PDF export functions
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service worker
└── package.json
```

## 🎨 Customization

### Modify Reference Ranges

Edit calculator components in `components/calculators/`:

```typescript
// Example: Update normal sodium range
const normalRange = { min: 135, max: 145 }; // mmol/L
```

### Add New Calculators

1. Create new component in `components/calculators/`
2. Add to tab navigation in `app/page.tsx`
3. Create PDF generator function in `lib/pdfGenerator.ts`

### Styling

Tailwind configuration in `tailwind.config.ts`:

```typescript
colors: {
  primary: { /* your brand colors */ },
  danger: { /* alert colors */ },
}
```

## 🔒 Privacy & Security

- **No Data Storage**: All calculations client-side
- **No Analytics**: No tracking by default
- **HIPAA Consideration**: No PHI transmitted or stored
- **Offline Capable**: Works without internet after install

## 📖 Clinical References

This calculator implements:

- WHO electrolyte management guidelines
- Standard ICU protocols for acid-base disorders
- Evidence-based correction rates
- GOLD MARK mnemonic for anion gap
- Established TBW calculation formulas

### Key Safety Limits

| Parameter | Limit | Rationale |
|-----------|-------|-----------|
| Sodium correction | ≤8 mmol/L per 24h | Prevent osmotic demyelination |
| High-risk Na correction | ≤6 mmol/L per 24h | Alcoholism, malnutrition |
| K⁺ IV (peripheral) | ≤10 mmol/hr | Prevent phlebitis |
| K⁺ IV (central) | ≤20 mmol/hr | Prevent arrhythmia |
| HCO₃⁻ therapy threshold | pH <7.1 | Limited benefit above this |

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewCalculator`)
3. Commit changes (`git commit -m 'Add new calculator'`)
4. Push to branch (`git push origin feature/NewCalculator`)
5. Open Pull Request

### Development Guidelines

- Maintain WHO/ICU protocol alignment
- Add comprehensive safety warnings
- Include unit tests for calculations
- Update PDF generators for new features
- Keep mobile-first design principles

## 📄 License

MIT License - see LICENSE file

## ⚕️ Medical Disclaimer

**FOR HEALTHCARE PROFESSIONALS ONLY**

This software is provided "as is" without warranty. The developers assume no liability for clinical decisions made using this tool. Always:

- Verify calculations independently
- Use clinical judgment
- Follow institutional protocols
- Consult specialists when appropriate
- Monitor patients per standard of care

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review clinical references

---

**Built for critical care teams worldwide** 🌍

*Last updated: December 2025*
