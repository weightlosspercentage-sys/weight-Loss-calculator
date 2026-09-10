
================================================================================
           WEBSITE SCORECARD  â€”  Weight Loss Percentage
================================================================================

  PERFORMANCE        75/100   Grade C
  SEO                98/100   Grade A
  ACCESSIBILITY      93/100   Grade A
  BEST PRACTICES     98/100   Grade A

  >>> OVERALL SCORE  91/100   Grade A

--------------------------------------------------------------------------------
  PER-PAGE DETAIL
--------------------------------------------------------------------------------
  Home                   P:50  SEO:100  A11y:100  BP:85  [HTTP 200]
  Calc: Weight Loss      P:70  SEO:97  A11y:100  BP:100  [HTTP 200]
  Calc: Newborn Weight Loss P:60  SEO:97  A11y:100  BP:100  [HTTP 200]
  Calc: BMI              P:80  SEO:97  A11y:90  BP:100  [HTTP 200]
  Calc: TDEE             P:70  SEO:97  A11y:90  BP:100  [HTTP 200]
  Calc: Calorie Deficit  P:90  SEO:100  A11y:75  BP:100  [HTTP 200]
  About                  P:80  SEO:100  A11y:95  BP:100  [HTTP 200]
  Contact                P:100  SEO:97  A11y:95  BP:100  [HTTP 200]

--------------------------------------------------------------------------------
  CALCULATOR FUNCTIONAL TEST (Weight Loss)
--------------------------------------------------------------------------------
  Inputs: Current=90kg, Goal=80kg, Deficit=500cal/day
  Expected ~154 days (22 weeks). Observed result: 22 weeks
  Verdict: COMPUTED A RESULT (manual verify against expected)

--------------------------------------------------------------------------------
  INFRASTRUCTURE
--------------------------------------------------------------------------------
  robots.txt: 200 (2286b)  sitemap.xml: 200 (3150521b)
  robots references sitemap: true   robots allows root: true

--------------------------------------------------------------------------------
  KEY FINDINGS / WARNINGS
--------------------------------------------------------------------------------
- 22 external 4xx/network failures (ads/analytics/fonts) â€” expected on localhost, verify in production.
- No next-gen image formats (WebP/AVIF) on: Home, Calc: Newborn Weight Loss, About.
- Single large JS bundle (no code-splitting) on: Home(997kb), Calc: Weight Loss(997kb), Calc: Newborn Weight Loss(997kb), Calc: BMI(997kb), Calc: TDEE(997kb) â€” main performance drag; consider lazy-loading/hydration splitting.
- Large page weight: Home(1502kb).

  Audited pages: Home, Calc: Weight Loss, Calc: Newborn Weight Loss, Calc: BMI, Calc: TDEE, Calc: Calorie Deficit, About, Contact
  Note: test ran on the LOCAL built site served over http://localhost:4321.
================================================================================