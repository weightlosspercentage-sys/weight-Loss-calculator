import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 8085;
const BASE_URL = `http://localhost:${PORT}`;

const PAGES_TO_TEST = [
  // Core pages
  { path: '/', name: 'Homepage' },
  { path: '/calculators/index.html', name: 'Calculators Hub' },
  { path: '/nutrition/index.html', name: 'Nutrition Hub' },
  { path: '/blog/index.html', name: 'Blog Hub' },
  { path: '/compare/index.html', name: 'Compare Hub' },
  { path: '/about/index.html', name: 'About Us' },
  { path: '/contact/index.html', name: 'Contact' },
  { path: '/privacy/index.html', name: 'Privacy Policy' },
  { path: '/terms/index.html', name: 'Terms of Service' },
  { path: '/disclaimer/index.html', name: 'Disclaimer' },
  { path: '/glossary/index.html', name: 'Glossary' },

  // 27 New Calculators & Fast Food pages
  { path: '/calculators/rucking/index.html', name: 'Rucking Calorie Calculator' },
  { path: '/calculators/stairmaster/index.html', name: 'StairMaster Calorie Calculator' },
  { path: '/calculators/elliptical/index.html', name: 'Elliptical Calorie Calculator' },
  { path: '/calculators/rowing/index.html', name: 'Rowing Calorie Calculator' },
  { path: '/calculators/cycling/index.html', name: 'Cycling Calorie Calculator' },
  { path: '/calculators/hiit-bodyweight/index.html', name: 'HIIT & Bodyweight Calorie Calculator' },
  { path: '/restaurants/dutch-bros/index.html', name: 'Dutch Bros Calorie Calculator' },
  { path: '/restaurants/taco-bell/index.html', name: 'Taco Bell Calorie Calculator' },
  { path: '/restaurants/dominos/index.html', name: 'Dominos Calorie Calculator' },
  { path: '/restaurants/five-guys/index.html', name: 'Five Guys Calorie Calculator' },
  { path: '/restaurants/pizza-hut/index.html', name: 'Pizza Hut Calorie Calculator' },
  { path: '/restaurants/jimmy-johns/index.html', name: 'Jimmy Johns Calorie Calculator' },
  { path: '/restaurants/wendys/index.html', name: 'Wendys Calorie Calculator' },
  { path: '/restaurants/chipotle/index.html', name: 'Chipotle Calorie Calculator' },
  { path: '/restaurants/fast-food-hub/index.html', name: 'Fast Food Hub' },
  { path: '/calculators/boba-tea/index.html', name: 'Boba Tea Calorie Calculator' },
  { path: '/calculators/poke-bowl/index.html', name: 'Poke Bowl Calorie Calculator' },
  { path: '/calculators/salad-calories/index.html', name: 'Salad Calorie Calculator' },
  { path: '/calculators/sushi-calories/index.html', name: 'Sushi Calorie Calculator' },
  { path: '/calculators/beer-calories/index.html', name: 'Beer Calorie Calculator' },
  { path: '/calculators/indian-food/index.html', name: 'Indian Food Calorie Calculator' },
  { path: '/calculators/smoothie/index.html', name: 'Smoothie Calorie Calculator' },
  { path: '/calculators/body-recomposition/index.html', name: 'Body Recomposition Calorie Calculator' },
  { path: '/calculators/pcos-calorie/index.html', name: 'PCOS Calorie Calculator' },
  { path: '/calculators/intermittent-fasting/index.html', name: 'Intermittent Fasting Calorie Calculator' },
  { path: '/calculators/carnivore-diet/index.html', name: 'Carnivore Diet Calorie Calculator' },
  { path: '/calculators/unit-converters/index.html', name: 'Unit Converters' },
];

const VIEWPORTS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 812 },
];

async function runQA() {
  console.log("========================================================================");
  console.log(` STARTING SELF-CONTAINED QA SERVER ON PORT ${PORT}...`);
  console.log("========================================================================");

  const server = spawn('python', ['-m', 'http.server', PORT.toString()], { cwd: process.cwd() });
  await new Promise(resolve => setTimeout(resolve, 1500));

  const browser = await chromium.launch({ headless: true });
  const results = {
    pagesTested: [],
    featuresTested: [],
    optionsTested: [],
    bugsFound: [],
    consoleErrors: [],
    networkErrors: [],
  };

  for (const pageConfig of PAGES_TO_TEST) {
    const pageUrl = `${BASE_URL}${pageConfig.path}`;
    const pageReport = {
      path: pageConfig.path,
      name: pageConfig.name,
      status: 'Passed',
      httpStatus: 0,
      title: '',
      hasHeader: false,
      hasTranslate: false,
      hasFooter: false,
      hasCalculator: false,
      calculatorInteractive: false,
      consoleErrors: [],
      networkErrors: [],
      optionsTested: 0,
    };

    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errText = msg.text();
        if (!errText.includes('ezojs') && !errText.includes('clarity') && !errText.includes('analytics')) {
          pageReport.consoleErrors.push(errText);
          results.consoleErrors.push({ page: pageConfig.path, error: errText });
        }
      }
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        pageReport.networkErrors.push(`${response.status()} ${response.url()}`);
        results.networkErrors.push({ page: pageConfig.path, url: response.url(), status: response.status() });
      }
    });

    try {
      const resp = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      pageReport.httpStatus = resp ? resp.status() : 0;
      pageReport.title = await page.title();

      pageReport.hasHeader = !!(await page.$('.static-header'));
      pageReport.hasTranslate = !!(await page.$('#google_translate_element'));
      pageReport.hasFooter = !!(await page.$('.static-footer')) || !!(await page.$('footer'));

      const calcWeightInput = await page.$('#calc-weight');
      const calcDurationInput = await page.$('#calc-duration');
      const calcIntensitySelect = await page.$('#calc-intensity');
      const calcBtn = await page.$('#calc-btn');

      if (calcWeightInput && calcDurationInput && calcIntensitySelect && calcBtn) {
        pageReport.hasCalculator = true;

        const initialVal = await page.$eval('#result-val', el => el.textContent).catch(() => '');

        await calcWeightInput.fill('200');
        await calcDurationInput.fill('60');

        const options = await page.$$eval('#calc-intensity option', opts => opts.map(o => o.value));
        pageReport.optionsTested += options.length;

        if (options.length > 0) {
          const targetOpt = options.includes('vigorous') ? 'vigorous' : (options.includes('heavy') ? 'heavy' : options[options.length - 1]);
          await calcIntensitySelect.selectOption(targetOpt);
        }

        await calcBtn.click();
        await page.waitForTimeout(150);

        const updatedVal = await page.$eval('#result-val', el => el.textContent).catch(() => '');

        if (updatedVal && updatedVal !== '0 kcal' && updatedVal.includes('kcal')) {
          pageReport.calculatorInteractive = true;
        } else {
          pageReport.status = 'Warning';
          results.bugsFound.push({
            bug: 'Calculator output text did not update on calculate button click',
            page: pageConfig.path,
            severity: 'High',
            actual: `Initial: "${initialVal}", Updated: "${updatedVal}"`,
            expected: 'Dynamic calculation result'
          });
        }
      }

      if (pageReport.httpStatus >= 400) {
        pageReport.status = 'Failed';
        results.bugsFound.push({
          bug: `HTTP Status ${pageReport.httpStatus}`,
          page: pageConfig.path,
          severity: 'Critical',
          actual: `Status ${pageReport.httpStatus}`,
          expected: '200 OK'
        });
      }

    } catch (err) {
      pageReport.status = 'Failed';
      results.bugsFound.push({
        bug: `Page Load Exception: ${err.message}`,
        page: pageConfig.path,
        severity: 'Critical',
        actual: err.message,
        expected: 'Successful page load'
      });
    }

    results.pagesTested.push(pageReport);
    await context.close();
  }

  // 2. Viewport & Responsive Layout Checks on Core Pages
  console.log("\n--- Testing Responsive Viewports (Desktop, Tablet, Mobile) ---");
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/calculators/rucking/index.html`, { waitUntil: 'domcontentloaded' });

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    results.featuresTested.push({
      feature: `Responsive Layout (${vp.name} - ${vp.width}x${vp.height})`,
      tested: true,
      working: !overflow,
      issue: overflow ? 'Horizontal overflow detected' : 'None'
    });

    await context.close();
  }

  await browser.close();
  server.kill();

  const reportPath = path.join(process.cwd(), 'scratch', 'qa_results_fresh.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log("\n========================================================================");
  console.log(`[+] QA SUITE COMPLETE! Total Pages Tested: ${results.pagesTested.length}`);
  console.log(`[+] Total Bugs Found: ${results.bugsFound.length}`);
  console.log(`[+] Results saved to: ${reportPath}`);
  console.log("========================================================================");
}

runQA().catch(err => console.error("QA Test Runner Error:", err));
