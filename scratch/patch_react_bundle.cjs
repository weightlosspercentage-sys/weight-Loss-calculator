const fs = require('fs');
const path = require('path');
const { checkCoverage, topical } = require('./test_copy_coverage.cjs');

const JS_FILES = [
  path.resolve(__dirname, '..', 'assets', 'index-Ctp2HkQJ.js'),
  path.resolve(__dirname, '..', 'dist3', 'assets', 'index-Ctp2HkQJ.js')
];

// Let's create the React JSX structure corresponding to our new SEO content
// In the bundle, s.jsx is used for single element, s.jsxs for multiple children, Y is React Router Link
/*
Sections to include:
1. H2: How to Calculate Weight Loss Percentage: Step-by-Step Formula & Reference Chart
2. H2: Body Weight Percentage vs. Body Fat Percentage & Excess Weight Loss
3. H2: Multi-Unit Tracking, Weekly Velocities & Fitness Challenge Benchmarks
4. H2: Specialized Demographic Tracking: Newborn & Pediatric Weight Loss Percentage
*/

function buildReactProseBlock() {
  return `children:s.jsxs("div",{className:"prose prose-slate max-w-none",children:[
    s.jsx("h2",{className:"text-3xl font-extrabold text-slate-900 mb-6",children:"How to Calculate Weight Loss Percentage: Step-by-Step Formula & Reference Chart"}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"Understanding the mathematical weight loss percentage formula behind a weight loss calculator percentage tool helps you accurately figure weight loss percentage and understand how to figure out percentage of weight loss. If you are wondering how do you calculate percentage of weight loss, how to work out percentage weight loss, how to find percentage of weight loss, or how to calculate weight loss as a percentage, use the standard clinical weight loss formula:"}),
    s.jsx("div",{className:"bg-slate-50 border border-slate-200 rounded-xl p-4 my-6 font-mono text-center text-slate-800 text-lg font-semibold",children:"Weight Loss % = [ (Starting Weight - Current Weight) ÷ Starting Weight ] × 100"}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-4 font-semibold text-slate-900",children:"3 Simple Steps to Calculate Percentage Weight Loss:"}),
    s.jsxs("ol",{className:"list-decimal pl-6 space-y-2 mb-6 text-slate-600",children:[
      s.jsx("li",{children:"Find Total Weight Lost: Subtract your current weight from starting weight (e.g., 200 lbs - 180 lbs = 20 lbs lost)."}),
      s.jsx("li",{children:"Divide by Starting Weight: Divide total lost weight by your starting weight (20 ÷ 200 = 0.10)."}),
      s.jsx("li",{children:"Multiply by 100: Multiply by 100 to calculate percentage of weight loss (0.10 × 100 = 10% percent weight change)."})
    ]}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"When you use our percentage calculator of weight loss, our system acts as an interactive how much weight have I lost calculator to calculate percentage weight loss. If you are learning how to calculate percentage of weight loss calculator results manually, seeking the exact weight loss percentage calculator formula, or needing a reliable percentage weight loss calculator formula, our interface functions as an automated weight percentage loss calculator and percentage calculator weight loss tool. Rather than creating a manual weight loss percentage calculator excel template or maintaining a weight loss percentage calculator spreadsheet in Microsoft Excel, this web-based weight loss calculator by percentage and weight loss by percentage calculator gives you instant clarity on any device without installing a separate weight loss percentage calculator app."}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"Whenever you want to figure out percentage of weight loss or wonder how to figure percentage weight loss calculator milestones, our calculator for percentage of weight loss and percentage loss calculator weight engines ensure accuracy. Using our calculate weight loss percentage calculator serves as the definitive calculator for weight loss percentage and calculator weight loss percentage platform. Whether you describe it as a weight loss calculator in percentage, a percentage calculator for weight loss, a weight loss percentage loss calculator, a percentage loss weight calculator, a weight loss in percentage calculator, a calculator of weight loss percentage, a weight loss calculator percentage loss, a weight loss calculator for percentage, or a healthy weight loss percentage calculator, this system shows what percentage of weight loss calculator benchmarks apply as a good calculator weight percentage loss solution."}),
    
    s.jsx("h2",{className:"text-3xl font-extrabold text-slate-900 mt-10 mb-6",children:"Body Weight Percentage vs. Body Fat Percentage & Excess Weight Loss"}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"While tracking overall mass reduction is important, analyzing body composition reveals crucial physiological changes. Evaluating your body weight loss percentage calculator metrics alongside a body fat percentage weight loss calculator or fat loss percentage calculator ensures you are shedding adipose tissue rather than metabolically active lean muscle."}),
    s.jsxs("ul",{className:"list-disc pl-6 space-y-3 mb-6 text-slate-600",children:[
      s.jsxs("li",{children:[s.jsx("strong",{className:"text-slate-900",children:"Total Body Weight Loss (TBWL): "}),"Our total body weight loss percentage calculator and body weight percentage calculator measure overall scale reduction. Tracking via a body weight percentage loss calculator, percentage of body weight loss calculator, body percentage weight loss calculator, percentage body weight loss calculator, body percentage calculator weight loss, total weight loss percentage calculator, total percentage weight loss calculator, weight loss calculator percentage body weight, percentage body weight loss, or body weight loss calculator percentage explains how to calculate body weight percentage loss relative to starting mass."]}),
      s.jsxs("li",{children:[s.jsx("strong",{className:"text-slate-900",children:"Body Fat & Muscle Preservation: "}),"Using a body fat percentage calculator weight loss, fat loss calculator percentage, weight loss body fat percentage calculator, or weight loss calculator body fat percentage clarifies how to calculate fat loss percentage and monitor true fat loss percentage. Men can utilize our specialized male body fat percentage weight loss calculator, while all lifters can calculate fat loss velocity with a body fat percentage to weight loss calculator, weight loss body percentage calculator, weight loss fat percentage calculator, body fat weight loss percentage calculator, or body fat percentage weight loss rate calculator. Combine this with our ",s.jsx(Y,{to:"/calculators/body-fat/",className:"text-orange-600 font-semibold hover:underline",children:"Body Fat Percentage Calculator"}),", ",s.jsx(Y,{to:"/calculators/macro/",className:"text-orange-600 font-semibold hover:underline",children:"Macro Percentage Calculator for Weight Loss"})," (including personalized macros for weight loss calculator percentage splits), and ",s.jsx(Y,{to:"/calculators/protein/",className:"text-orange-600 font-semibold hover:underline",children:"Protein Calculator"}),"."]}),
      s.jsxs("li",{children:[s.jsx("strong",{className:"text-slate-900",children:"Excess Weight Loss (EWL) & Medical Milestones: "}),"For individuals tracking bariatric surgery or GLP-1 treatments, a percentage of excess weight loss calculator (or excess weight loss percentage calculator) benchmarks pounds lost against excess weight above ideal body weight. Review your clinical status with our ",s.jsx(Y,{to:"/calculators/bmi/",className:"text-orange-600 font-semibold hover:underline",children:"BMI Weight Loss Percentage Calculator"})," and model safe energy balances with our ",s.jsx(Y,{to:"/calculators/tdee/",className:"text-orange-600 font-semibold hover:underline",children:"TDEE Calculator"}),", ",s.jsx(Y,{to:"/calculators/bmr/",className:"text-orange-600 font-semibold hover:underline",children:"BMR Calculator"}),", and ",s.jsx(Y,{to:"/calculators/calorie-deficit/",className:"text-orange-600 font-semibold hover:underline",children:"Calorie Deficit Calculator"}),"."]})
    ]}),

    s.jsx("h2",{className:"text-3xl font-extrabold text-slate-900 mt-10 mb-6",children:"Multi-Unit Tracking, Weekly Velocities & Fitness Challenge Benchmarks"}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"Weight tracking preferences and goals vary across global regions and fitness environments:"}),
    s.jsxs("ul",{className:"list-disc pl-6 space-y-3 mb-6 text-slate-600",children:[
      s.jsx("li",{children:"Global Units (Metric & Imperial): Whether you need a weight loss percentage calculator kg (or percentage weight loss calculator kg), a weight loss percentage calculator uk supporting stone via our weight loss percentage calculator stone, imperial tracking with a weight loss percentage calculator lbs and oz, or high-precision analysis with a weight loss percentage calculator grams, our system supports instant conversions."}),
      s.jsx("li",{children:"Safe Weekly Rates: CDC guidelines recommend losing 0.5% to 1.0% of total body mass weekly (approx. 1–2 lbs/week). Use our percentage of weight loss per week calculator to monitor your weekly deficit safely without triggering metabolic slowdown."}),
      s.jsx("li",{children:"Workplace Challenges & Competitions: Competing in a corporate or gym contest? Our weight loss challenge percentage calculator applies standardized rules, serving as the trusted biggest loser percentage weight loss calculator, biggest loser weight loss percentage calculator, and weight loss percentage calculator biggest loser tool. It provides a modern, privacy-first upgrade over legacy trackers like fitwatch weight loss percentage calculator, fitwatch percentage weight loss calculator, fit watch weight loss percentage calculator, and weight loss percentage calculator shape fit."})
    ]}),

    s.jsx("h2",{className:"text-3xl font-extrabold text-slate-900 mt-10 mb-6",children:"Specialized Demographic Tracking: Newborn & Pediatric Weight Loss Percentage"}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-6",children:"In neonatal healthcare, monitoring post-birth physiological weight drop is a vital clinical protocol. Healthy infants typically shed 5% to 7% of birth weight in the first 3–5 days before returning to birth weight by day 10–14."}),
    s.jsx("p",{className:"text-slate-600 leading-relaxed mb-4",children:"Pediatricians and parents can utilize our dedicated pediatric tools:"}),
    s.jsxs("ul",{className:"list-disc pl-6 space-y-3 mb-6 text-slate-600",children:[
      s.jsxs("li",{children:[s.jsx(Y,{to:"/calculators/newborn-weight-loss/",className:"text-orange-600 font-semibold hover:underline",children:"Weight Loss Percentage Calculator Newborn"})," (accessible as newborn weight loss percentage calculator, percentage weight loss calculator newborn, newborn percentage weight loss calculator, and percentage of weight loss calculator newborn)"]}),
      s.jsxs("li",{children:[s.jsx(Y,{to:"/calculators/baby-weight-loss/",className:"text-orange-600 font-semibold hover:underline",children:"Baby Weight Loss Percentage Calculator"})," (supporting searches for baby percentage weight loss calculator, weight loss percentage calculator baby, percentage weight loss baby calculator, and percentage weight loss calculator baby)"]}),
      s.jsxs("li",{children:[s.jsx(Y,{to:"/calculators/infant-weight-loss/",className:"text-orange-600 font-semibold hover:underline",children:"Infant Percentage Weight Loss Calculator"})," (accessible as infant weight loss percentage calculator, weight loss percentage calculator infant, and percentage weight loss calculator infant)"]}),
      s.jsx("li",{children:"Clinical birth weight tracking with our birth weight loss percentage calculator, percentage birth weight loss calculator, birth weight percentage loss calculator, and percentage of birth weight loss calculator to ensure safe pediatric hydration and feeding progress."})
    ]})
  ]}`;
}

const newBlock = buildReactProseBlock().replace(/\s+/g, ' ');

JS_FILES.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Patching ${file}...`);
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find start and end of prose block
  // Pattern: children:s.jsxs("div",{className:"prose prose-slate max-w-none",children:[s.jsx("h2",{className:"text-3xl font-extrabold text-slate-900 mb-6",children:"Weight Loss Percentage Calculator: Science & Practical Guide" ... ]})})}),s.jsx("section",{id:"related"
  const startMarker = 'children:s.jsxs("div",{className:"prose prose-slate max-w-none",children:[';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`⚠️ Start marker not found in ${file}`);
    return;
  }
  
  const endMarker = ']})})}),s.jsx("section",{id:"related"';
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.log(`⚠️ End marker not found in ${file}`);
    return;
  }

  const oldProse = content.slice(startIdx, endIdx + 1);
  const updated = content.slice(0, startIdx) + newBlock + content.slice(endIdx + 1);
  
  fs.writeFileSync(file + '.bak_seo', content, 'utf-8');
  fs.writeFileSync(file, updated, 'utf-8');
  console.log(`✅ Successfully patched ${file}!`);
  
  // Verify keyword coverage on patched bundle
  console.log(`--- Checking coverage in ${path.basename(file)} ---`);
  checkCoverage(updated);
});
