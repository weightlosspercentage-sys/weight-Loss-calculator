import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push(String(e)));
  await p.goto("http://localhost:4321", { waitUntil: "networkidle", timeout: 30000 });
  await p.waitForTimeout(2500);
  const links = await p.$$eval("a", as => as.filter(a => /facebook\.com\/weightlossnewborn|x\.com\/weightlossperce|linkedin\.com\/in\/weightloss-percentage|instagram\.com\/weightlosspercentage/.test(a.href)).map(a => {
    const r = a.getBoundingClientRect();
    return { href: a.href, visible: r.width > 0 && r.height > 0 };
  }));
  const visible = links.filter(l => l.visible);
  console.log("TOTAL social anchors:", links.length);
  console.log("VISIBLE social anchors:", visible.length);
  visible.forEach(l => console.log("  VISIBLE:", l.href));
  console.log("PAGE ERRORS:", errs.length ? errs : "none");
  await p.screenshot({ path: "dist3/homepage-final.png", fullPage: true });
  console.log("screenshot saved dist3/homepage-final.png");
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
