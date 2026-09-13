const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function applyFixes(filePath) {
    console.log(`Applying fixes to ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.log("File not found.");
        return;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    let modified = false;

    // Phase 1: Inject MedicalWebPage Schema
    const medicalSchema = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": "https://www.weightlosspercentage.com/#webpage",
        "url": "https://www.weightlosspercentage.com/",
        "name": "Weight Loss Percentage Calculator & Medical Progress Guide",
        "description": "Accurately compute percentage of body weight lost over time with scientific health benchmarks.",
        "medicalAudience": "Patients, Athletes, General Public",
        "aspect": "Diagnosis and Evaluation"
    };
    
    let schemaExists = false;
    $('script[type="application/ld+json"]').each((i, el) => {
        if ($(el).html().includes('MedicalWebPage')) {
            schemaExists = true;
        }
    });

    if (!schemaExists) {
        $('head').append(`\n<script type="application/ld+json">\n${JSON.stringify(medicalSchema, null, 4)}\n</script>\n`);
        modified = true;
    }

    // Phase 1: Fix heading hierarchy
    const h1s = $('h1');
    if (h1s.length > 1) {
        h1s.each((i, el) => {
            if (i > 0) {
                el.tagName = 'h2';
                modified = true;
            }
        });
    }

    // Phase 1: Accessibility Patch Script for React Inputs
    const patchScriptContent = `
      (function() {
        if(typeof MutationObserver !== 'undefined') {
          const observer = new MutationObserver((mutations) => {
            const inputs = document.querySelectorAll('#root input');
            inputs.forEach(input => {
              if (!input.hasAttribute('role')) {
                input.setAttribute('role', 'spinbutton');
              }
            });
            const formWrappers = document.querySelectorAll('#root .calculator-container, #root .grid');
            formWrappers.forEach(wrap => {
              if (!wrap.hasAttribute('role')) {
                wrap.setAttribute('role', 'form');
                wrap.setAttribute('aria-label', 'Weight Loss Calculator');
              }
            });
          });
          if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
          }
        }
      })();
    `;
    
    let patchExists = false;
    $('script').each((i, el) => {
        if ($(el).html() && $(el).html().includes('spinbutton') && $(el).html().includes('MutationObserver')) {
            patchExists = true;
        }
    });

    if (!patchExists) {
        $('body').append(`\n<script>\n${patchScriptContent}\n</script>\n`);
        modified = true;
    }

    // Phase 2: Scientific References Section
    const referencesHtml = `
    <section class="scientific-references" style="margin-top: 3rem; margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; font-size: 1.3rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem;">Scientific References & Clinical Guidelines</h2>
      <ul style="padding-left: 1.5rem; line-height: 1.6; color: #475569; font-size: 0.95rem;">
        <li style="margin-bottom: 0.5rem;"><a href="https://www.cdc.gov/healthyweight/losing_weight/index.html" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">CDC Healthy Weight Guidelines</a> - Centers for Disease Control and Prevention</li>
        <li style="margin-bottom: 0.5rem;"><a href="https://www.nhlbi.nih.gov/health/educational/lose_wt/index.htm" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">NIH National Heart, Lung, and Blood Institute (NHLBI) Obesity Guidelines</a></li>
        <li style="margin-bottom: 0.5rem;"><a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer nofollow" style="color: #4f46e5;">PubMed studies on rate of fat mass vs. lean mass loss</a></li>
      </ul>
    </section>
    `;
    
    if ($('.scientific-references').length === 0) {
        let inserted = false;
        $('h2').each((i, el) => {
            if ($(el).text().includes("All Calculators") && !inserted) {
                $(referencesHtml).insertBefore($(el));
                inserted = true;
                modified = true;
            }
        });
        if (!inserted) {
            if ($('main').length > 0) {
                $('main').append(referencesHtml);
                modified = true;
            }
        }
    }

    // Phase 2: Clean up duplicate reviewer blocks
    const reviewers = [];
    $('div').each((i, el) => {
        if ($(el).text().includes("Medically Reviewed by") && $(el).text().includes("Dr. Rekha Kumar")) {
            const style = $(el).attr('style') || '';
            // Just check if it's a block-level container for the review
            if ($(el).find('p').length > 0 || style.includes('background')) {
                // Ensure we don't pick up a huge parent wrapper
                if ($(el).text().length < 500) {
                    reviewers.push(el);
                }
            }
        }
    });

    if (reviewers.length > 1) {
        for (let i = 1; i < reviewers.length; i++) {
            $(reviewers[i]).remove();
            modified = true;
        }
    }

    // Phase 3: Topical Clusters HTML Section
    const clustersHtml = `
    <section class="topical-clusters" style="margin-top: 3rem; margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; font-size: 1.4rem; font-weight: 700; margin-top: 0; margin-bottom: 1.5rem;">Related Clinical & Fitness Hubs</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Formulas & Math</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/body-fat/" style="color: #475569; text-decoration: none;">Body fat percentage vs Total weight</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/bmi/" style="color: #475569; text-decoration: none;">BMI Calculation Formulas</a></li>
          </ul>
        </div>

        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Challenge & Group Rules</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/weight-loss/" style="color: #475569; text-decoration: none;">Weight loss percentage contest goals</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/calorie-deficit/" style="color: #475569; text-decoration: none;">Deficit planning for groups</a></li>
          </ul>
        </div>

        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 0.75rem;">Clinical & Safety Benchmarks</h3>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/tdee/" style="color: #475569; text-decoration: none;">Metabolic adaptation (TDEE)</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/calculators/bmr/" style="color: #475569; text-decoration: none;">Healthy baseline energy rates</a></li>
          </ul>
        </div>

      </div>
    </section>
    `;
    
    if ($('.topical-clusters').length === 0) {
        if ($('main').length > 0) {
            $('main').append(clustersHtml);
            modified = true;
        }
    }

    // Phase 3: Update explanatory text with contextual internal links
    $('p').each((i, el) => {
        let pHtml = $(el).html();
        if (pHtml && pHtml.includes('Body Mass Index') && !pHtml.includes('/calculators/bmi/')) {
            $(el).html(pHtml.replace(/\b(Body Mass Index)\b/, '<a href="/calculators/bmi/" style="color: #2563eb; text-decoration: underline;">$1</a>'));
            modified = true;
        }
        pHtml = $(el).html();
        if (pHtml && pHtml.includes('Basal Metabolic Rate') && !pHtml.includes('/calculators/bmr/')) {
            $(el).html(pHtml.replace(/\b(Basal Metabolic Rate)\b/, '<a href="/calculators/bmr/" style="color: #2563eb; text-decoration: underline;">$1</a>'));
            modified = true;
        }
        pHtml = $(el).html();
        if (pHtml && pHtml.includes('Total Daily Energy Expenditure') && !pHtml.includes('/calculators/tdee/')) {
            $(el).html(pHtml.replace(/\b(Total Daily Energy Expenditure)\b/, '<a href="/calculators/tdee/" style="color: #2563eb; text-decoration: underline;">$1</a>'));
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html());
        console.log(`✅ Successfully updated ${filePath}`);
    } else {
        console.log(`No changes needed for ${filePath}`);
    }
}

applyFixes("index.html");
if (fs.existsSync("dist3/index.html")) {
    applyFixes("dist3/index.html");
}

const calculatorsDir = "calculators";
if (fs.existsSync(calculatorsDir)) {
    const calcs = fs.readdirSync(calculatorsDir);
    for (const calc of calcs) {
        const calcPath = path.join(calculatorsDir, calc, "index.html");
        if (fs.existsSync(calcPath)) {
            applyFixes(calcPath);
        }
    }
}

const dist3CalculatorsDir = path.join("dist3", "calculators");
if (fs.existsSync(dist3CalculatorsDir)) {
    const calcs = fs.readdirSync(dist3CalculatorsDir);
    for (const calc of calcs) {
        const calcPath = path.join(dist3CalculatorsDir, calc, "index.html");
        if (fs.existsSync(calcPath)) {
            applyFixes(calcPath);
        }
    }
}
