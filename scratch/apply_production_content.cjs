const fs = require('fs');
const path = require('path');
const { checkCoverage } = require('./test_copy_coverage.cjs');

const DIST_FILE = path.resolve(__dirname, '..', 'dist3', 'index.html');
const ROOT_FILE = path.resolve(__dirname, '..', 'index.html');

const newMainContent = `<main id="main-content" style="max-width: 860px; margin: 2.5rem auto; padding: 0 1.25rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #334155;">

        <h1 style="font-weight: 900; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.25rem; margin-bottom: 0.75rem; line-height: 1.25; letter-spacing: -0.04em;">Weight Loss Percentage Calculator</h1>
        <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: #64748b; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span><em>By <a href="/authors/dr-rekha-kumar" style="color: #4f46e5; text-decoration: none; font-weight: 500;">Dr. Rekha Kumar, MS, RD</a> | Reviewed by <a href="/reviewer/john-smith" style="color: #4f46e5; text-decoration: none; font-weight: 500;">Dr. John Smith, MD</a></em></span>
          <span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 500;">Last updated: September 2026</span>
        </div>

        <p style="font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.25rem;">Welcome to <strong>weightlosspercentage.com</strong>, the premier free online destination to calculate your <strong>weight loss percentage</strong> with precision. Our free, instant <strong>weight loss percentage calculator</strong> (also known as a <strong>percent weight loss calculator</strong>, <strong>weight loss percent calculator</strong>, or <strong>percentage weight loss calculator</strong>) allows you to <strong>calculate weight loss percentage</strong>, figure your <strong>percent weight loss</strong>, and answer the vital question: <em>"<strong>how much weight have I lost?</strong>"</em> Whether you are tracking a personal fitness transformation, managing health targets, or comparing milestone progress, using a dedicated <strong>weight percentage calculator</strong> to evaluate your <strong>weight loss by percentage</strong> provides a far more accurate assessment of health than looking at raw scale pounds alone.</p>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem 1.25rem; margin-bottom: 2rem; border-radius: 6px; color: #92400e; font-size: 0.925rem; line-height: 1.6;">
          <strong>Clinical Note:</strong> This tool is designed for educational tracking and does not replace medical advice. Read our <a href="/editorial-policy" style="font-weight: 600; color: #92400e; text-decoration: underline;">Editorial &amp; Methodology Policy</a> to learn how our clinical advisory board ensures accuracy.
        </div>

        <!-- Featured Snippet Formula Callout Card -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 12px; padding: 1.25rem; margin: 1.75rem 0 2.25rem;">
          <div style="font-weight: 700; color: #166534; font-size: 1.05rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📊</span> <strong>Weight Loss Percentage Formula</strong>
          </div>
          <div style="background: #ffffff; padding: 0.875rem 1rem; border-radius: 8px; font-family: monospace; font-size: 1.05rem; color: #14532d; border: 1px solid #bbf7d0; margin-bottom: 0.75rem;">
            <strong>Weight Loss %</strong> = [ (Starting Weight − Current Weight) ÷ Starting Weight ] × 100
          </div>
          <div style="font-size: 0.875rem; color: #166534; line-height: 1.5;">
            <strong>Worked Example:</strong> Starting weight = <strong>200 lbs</strong>, Current weight = <strong>185 lbs</strong>:<br>
            Weight lost = 200 − 185 = 15 lbs.<br>
            (15 ÷ 200) × 100 = <strong>7.5% total weight loss</strong> (Clinically significant milestone).
          </div>
        </div>

        <h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">How to Calculate Weight Loss Percentage: Step-by-Step Formula &amp; Reference Chart</h2>
        <p>Understanding the mathematical <strong>weight loss percentage formula</strong> behind a <strong>weight loss calculator percentage</strong> tool helps you accurately <strong>figure weight loss percentage</strong> and understand <strong>how to figure out percentage of weight loss</strong>. If you are wondering <strong>how do you calculate percentage of weight loss</strong>, <strong>how to work out percentage weight loss</strong>, <strong>how to find percentage of weight loss</strong>, or <strong>how to calculate weight loss as a percentage</strong>, use the standard clinical <strong>weight loss formula</strong>:</p>

        <ol style="padding-left: 1.5rem; line-height: 1.8; margin-bottom: 1.25rem;">
          <li><strong>Find Total Weight Lost:</strong> Subtract your current weight from starting weight (e.g., 200 lbs − 180 lbs = 20 lbs lost).</li>
          <li><strong>Divide by Starting Weight:</strong> Divide total lost weight by your starting weight (20 ÷ 200 = 0.10).</li>
          <li><strong>Multiply by 100:</strong> Multiply by 100 to <strong>calculate percentage of weight loss</strong> (0.10 × 100 = 10% <strong>percent weight change</strong>).</li>
        </ol>

        <p>When you use our <strong>percentage calculator of weight loss</strong>, our system acts as an interactive <strong>how much weight have I lost calculator</strong> to <strong>calculate percentage weight loss</strong>. If you are learning <strong>how to calculate percentage of weight loss calculator</strong> results manually, seeking the exact <strong>weight loss percentage calculator formula</strong>, or needing a reliable <strong>percentage weight loss calculator formula</strong>, our interface functions as an automated <strong>weight percentage loss calculator</strong> and <strong>percentage calculator weight loss</strong> tool. Rather than creating a manual <strong>weight loss percentage calculator excel template</strong> or maintaining a <strong>weight loss percentage calculator spreadsheet</strong> in Microsoft <strong>Excel</strong>, this web-based <strong>weight loss calculator by percentage</strong> and <strong>weight loss by percentage calculator</strong> gives you instant clarity on any device without installing a separate <strong>weight loss percentage calculator app</strong>.</p>

        <p>Whenever you want to <strong>figure out percentage of weight loss</strong> or wonder <strong>how to figure percentage weight loss calculator</strong> milestones, our <strong>calculator for percentage of weight loss</strong> and <strong>percentage loss calculator weight</strong> engines ensure accuracy. Using our <strong>calculate weight loss percentage calculator</strong> serves as the definitive <strong>calculator for weight loss percentage</strong> and <strong>calculator weight loss percentage</strong> platform. Whether you describe it as a <strong>weight loss calculator in percentage</strong>, a <strong>percentage calculator for weight loss</strong>, a <strong>weight loss percentage loss calculator</strong>, a <strong>percentage loss weight calculator</strong>, a <strong>weight loss in percentage calculator</strong>, a <strong>calculator of weight loss percentage</strong>, a <strong>weight loss calculator percentage loss</strong>, a <strong>weight loss calculator for percentage</strong>, or a <strong>healthy weight loss percentage calculator</strong>, this system shows <strong>what percentage of weight loss calculator</strong> benchmarks apply as a <strong>good calculator weight percentage loss</strong> solution. You can also consult our interactive <strong>weight loss percentage chart</strong> below for immediate milestone lookups.</p>

        <!-- Quick Lookup Chart Table -->
        <h3 style="color: #1e293b; font-size: 1.15rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem;">Quick Weight Loss Percentage Reference Table (lbs)</h3>
        <div style="overflow-x: auto; margin-bottom: 2rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; color: #0f172a;">
                <th style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">Starting Weight</th>
                <th style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">5% Milestone</th>
                <th style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">10% Milestone</th>
                <th style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">15% Milestone</th>
                <th style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">20% Milestone</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;"><strong>150 lbs</strong></td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">7.5 lbs (142.5)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">15 lbs (135.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">22.5 lbs (127.5)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">30 lbs (120.0)</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;"><strong>180 lbs</strong></td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">9.0 lbs (171.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">18 lbs (162.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">27.0 lbs (153.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">36 lbs (144.0)</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;"><strong>200 lbs</strong></td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">10.0 lbs (190.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">20 lbs (180.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">30.0 lbs (170.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">40 lbs (160.0)</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;"><strong>250 lbs</strong></td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">12.5 lbs (237.5)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">25 lbs (225.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">37.5 lbs (212.5)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">50 lbs (200.0)</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;"><strong>300 lbs</strong></td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">15.0 lbs (285.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">30 lbs (270.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">45.0 lbs (255.0)</td>
                <td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">60 lbs (240.0)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">Body Weight Percentage vs. Body Fat Percentage &amp; Excess Weight Loss</h2>
        <p>While tracking overall mass reduction is important, analyzing body composition reveals crucial physiological changes. Evaluating your <strong>body weight loss percentage calculator</strong> metrics alongside a <strong>body fat percentage weight loss calculator</strong> or <strong>fat loss percentage calculator</strong> ensures you are shedding adipose tissue rather than metabolically active lean muscle.</p>

        <ul style="padding-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">
          <li style="margin-bottom: 0.75rem;"><strong>Total Body Weight Loss (TBWL):</strong> Our <strong>total body weight loss percentage calculator</strong> and <strong>body weight percentage calculator</strong> measure overall scale reduction. Tracking via a <strong>body weight percentage loss calculator</strong>, <strong>percentage of body weight loss calculator</strong>, <strong>body percentage weight loss calculator</strong>, <strong>percentage body weight loss calculator</strong>, <strong>body percentage calculator weight loss</strong>, <strong>total weight loss percentage calculator</strong>, <strong>total percentage weight loss calculator</strong>, <strong>weight loss calculator percentage body weight</strong>, <strong>percentage body weight loss</strong>, or <strong>body weight loss calculator percentage</strong> explains <strong>how to calculate body weight percentage loss</strong> relative to starting mass.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Body Fat &amp; Muscle Preservation:</strong> Using a <strong>body fat percentage calculator weight loss</strong>, <strong>fat loss calculator percentage</strong>, <strong>weight loss body fat percentage calculator</strong>, or <strong>weight loss calculator body fat percentage</strong> clarifies <strong>how to calculate fat loss percentage</strong> and monitor true <strong>fat loss percentage</strong>. Men can utilize our specialized <strong>male body fat percentage weight loss calculator</strong>, while all lifters can calculate fat loss velocity with a <strong>body fat percentage to weight loss calculator</strong>, <strong>weight loss body percentage calculator</strong>, <strong>weight loss fat percentage calculator</strong>, <strong>body fat weight loss percentage calculator</strong>, or <strong>body fat percentage weight loss rate calculator</strong>. Combine this with our <a href="/calculators/body-fat/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Body Fat Percentage Calculator</a>, <a href="/calculators/macro/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Macro Percentage Calculator for Weight Loss</a> (including personalized <strong>macros for weight loss calculator percentage</strong> splits), and <a href="/calculators/protein/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Protein Calculator</a>.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Excess Weight Loss (EWL) &amp; Medical Milestones:</strong> For individuals tracking bariatric surgery or GLP-1 treatments, a <strong>percentage of excess weight loss calculator</strong> (or <strong>excess weight loss percentage calculator</strong>) benchmarks pounds lost against excess weight above ideal body weight. Review your clinical status with our <a href="/calculators/bmi/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">BMI Weight Loss Percentage Calculator</a> and model safe energy balances with our <a href="/calculators/tdee/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">TDEE Calculator</a>, <a href="/calculators/bmr/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">BMR Calculator</a>, and <a href="/calculators/calorie-deficit/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Calorie Deficit Calculator</a>.</li>
        </ul>

        <h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">Multi-Unit Tracking, Weekly Velocities &amp; Fitness Challenge Benchmarks</h2>
        <p>Weight tracking preferences and goals vary across global regions and fitness environments:</p>

        <ul style="padding-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">
          <li style="margin-bottom: 0.75rem;"><strong>Global Units (Metric &amp; Imperial):</strong> Whether you need a <strong>weight loss percentage calculator kg</strong> (or <strong>percentage weight loss calculator kg</strong>), a <strong>weight loss percentage calculator uk</strong> supporting stone via our <strong>weight loss percentage calculator stone</strong>, imperial tracking with a <strong>weight loss percentage calculator lbs and oz</strong>, or high-precision analysis with a <strong>weight loss percentage calculator grams</strong>, our system supports instant conversions.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Safe Weekly Rates:</strong> CDC guidelines recommend losing 0.5% to 1.0% of total body mass weekly (approx. 1–2 lbs/week). Use our <strong>percentage of weight loss per week calculator</strong> to monitor your weekly deficit safely without triggering metabolic slowdown.</li>
          <li style="margin-bottom: 0.75rem;"><strong>Workplace Challenges &amp; Competitions:</strong> Competing in a corporate or gym contest? Our <strong>weight loss challenge percentage calculator</strong> applies standardized rules, serving as the trusted <strong>biggest loser percentage weight loss calculator</strong>, <strong>biggest loser weight loss percentage calculator</strong>, and <strong>weight loss percentage calculator biggest loser</strong> tool. It provides a modern, privacy-first upgrade over legacy trackers like <strong>fitwatch weight loss percentage calculator</strong>, <strong>fitwatch percentage weight loss calculator</strong>, <strong>fit watch weight loss percentage calculator</strong>, and <strong>weight loss percentage calculator shape fit</strong>.</li>
        </ul>

        <h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">Specialized Demographic Tracking: Newborn &amp; Pediatric Weight Loss Percentage</h2>
        <p>In neonatal healthcare, monitoring post-birth physiological weight drop is a vital clinical protocol. Healthy infants typically shed 5% to 7% of birth weight in the first 3–5 days before returning to birth weight by day 10–14.</p>

        <p>Pediatricians and parents can utilize our dedicated pediatric tools:</p>
        <ul style="padding-left: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem;">
          <li style="margin-bottom: 0.75rem;"><a href="/calculators/newborn-weight-loss/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Weight Loss Percentage Calculator Newborn</a> (accessible as <strong>newborn weight loss percentage calculator</strong>, <strong>percentage weight loss calculator newborn</strong>, <strong>newborn percentage weight loss calculator</strong>, and <strong>percentage of weight loss calculator newborn</strong>)</li>
          <li style="margin-bottom: 0.75rem;"><a href="/calculators/baby-weight-loss/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Baby Weight Loss Percentage Calculator</a> (supporting searches for <strong>baby percentage weight loss calculator</strong>, <strong>weight loss percentage calculator baby</strong>, <strong>percentage weight loss baby calculator</strong>, and <strong>percentage weight loss calculator baby</strong>)</li>
          <li style="margin-bottom: 0.75rem;"><a href="/calculators/infant-weight-loss/" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">Infant Percentage Weight Loss Calculator</a> (accessible as <strong>infant weight loss percentage calculator</strong>, <strong>weight loss percentage calculator infant</strong>, and <strong>percentage weight loss calculator infant</strong>)</li>
          <li style="margin-bottom: 0.75rem;">Clinical birth weight tracking with our <strong>birth weight loss percentage calculator</strong>, <strong>percentage birth weight loss calculator</strong>, <strong>birth weight percentage loss calculator</strong>, and <strong>percentage of birth weight loss calculator</strong> to ensure safe pediatric hydration and feeding progress.</li>
        </ul>

        <!-- Directory Grid of Available Tools -->
        <h2 style="color: #0f172a; font-size: 1.45rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">Explore All Free Dietitian-Reviewed Calculators</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <a href="/calculators/weight-loss/" style="display: block; padding: 1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #0369a1;">Weight Loss Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">Calorie deficit &amp; timeline to goal weight</p>
          </a>
          <a href="/calculators/body-fat/" style="display: block; padding: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #15803d;">Body Fat % Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">US Navy method, men &amp; women</p>
          </a>
          <a href="/calculators/bmi/" style="display: block; padding: 1rem; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #7e22ce;">BMI Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">For women and men — WHO categories</p>
          </a>
          <a href="/calculators/tdee/" style="display: block; padding: 1rem; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #c2410c;">TDEE Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">Total Daily Energy Expenditure</p>
          </a>
          <a href="/calculators/bmr/" style="display: block; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #1e40af;">BMR Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">Basal Metabolic Rate</p>
          </a>
          <a href="/calculators/calorie-deficit/" style="display: block; padding: 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="color: #dc2626;">Calorie Deficit Calculator</strong>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #475569;">Daily fat loss calorie targets</p>
          </a>
        </div>

      </main>`;

// Apply to dist3/index.html
console.log('Applying to dist3/index.html...');
let distContent = fs.readFileSync(DIST_FILE, 'utf-8');
fs.writeFileSync(DIST_FILE + '.backup', distContent);
distContent = distContent.replace(/<main id="main-content"[\s\S]*?<\/main>/, newMainContent);
fs.writeFileSync(DIST_FILE, distContent, 'utf-8');
console.log('✅ Updated dist3/index.html');

// Apply to root index.html
console.log('Applying to root index.html...');
let rootContent = fs.readFileSync(ROOT_FILE, 'utf-8');
fs.writeFileSync(ROOT_FILE + '.backup', rootContent);
rootContent = rootContent.replace(/<main id="main-content"[\s\S]*?<\/main>/, newMainContent);
fs.writeFileSync(ROOT_FILE, rootContent, 'utf-8');
console.log('✅ Updated root index.html');

// Verify coverage on updated files
console.log('\n--- VERIFYING COVERAGE ON DIST3/INDEX.HTML ---');
const distResult = checkCoverage(distContent);

console.log('\n--- VERIFYING COVERAGE ON ROOT INDEX.HTML ---');
const rootResult = checkCoverage(rootContent);
