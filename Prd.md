# Product Requirements Document (PRD)

## 1. Product Vision & Overview

**Weight Loss Percentage Calculator** (`weightlosspercentage.com`) is an online health intelligence platform and evidence-based clinical calculation suite. The platform provides free, instant, and medically verified tools for tracking body weight change, body composition, energy expenditure, and nutrition metrics across diverse populations—from adults pursuing weight management to pediatric care for newborns.

---

## 2. Target Audience & Personas

1. **Adult Weight Loss & Fitness Trackers:** Individuals looking for accurate weight loss percentage tracking, fat loss calculation, and calorie deficit planning without paywalls or required signups.
2. **Clinical Patients & Bariatric Patients:** Users needing precise percentage tracking following medical weight loss protocols or bariatric procedures.
3. **Parents & Pediatric Caregivers:** Caregivers monitoring newborn/infant weight change percentages against clinical thresholds (5%, 7%, 10%).
4. **Nutrition & Meal Planning Enthusiasts:** Fitness-conscious consumers comparing restaurant menu calories and macro ratios (Chipotle, Taco Bell, Subway, McDonald's).

---

## 3. Core Feature Specifications

### 3.1 Primary Calculators
* **Weight Loss Percentage Calculator (`/`):** Instant percentage lost tracker working in both Imperial (`lbs`) and Metric (`kg`).
* **Fat Loss Percentage Calculator (`/calculators/fat-loss/`):** Evaluates pure fat mass vs. lean mass changes based on starting weight, current body fat %, and target body fat %.
* **BMI Calculator (`/calculators/bmi/`):** Gender-aware Body Mass Index classification with health risk brackets.
* **Calorie & TDEE Calculator (`/calculators/calorie/`, `/calculators/tdee/`):** Total Daily Energy Expenditure and custom calorie deficit planner.
* **Newborn & Infant Weight Loss Calculator (`/calculators/newborn-weight-loss/`):** Pediatric weight change percentage calculator with clinical risk thresholds.

### 3.2 Nutrition & Restaurant Hub (`/nutrition/`)
* Calorie & Macro lookup calculators for major dining brands (Chipotle, Taco Bell, Subway, Dutch Bros, Starbucks, McDonald's, Dominos).
* Interactive meal assembly and custom nutrition totalizers.

### 3.3 Health & Fitness Glossary (`/glossary/`)
* Comprehensive terminology guide for metabolic rate, body composition metrics, and clinical guidelines.

---

## 4. E-E-A-T & Medical Authority Requirements

* **Lead Medical Reviewer:** Dr. Rekha Kumar, M.D., M.S. (Associate Professor of Clinical Medicine at Weill Cornell Medicine, Diplomate of the American Board of Obesity Medicine).
* **Clinical Verification:** All formulas must adhere to peer-reviewed guidelines from the American Diabetes Association (ADA), Endocrine Society, and American Academy of Pediatrics (AAP).
* **Structured Data:** Full Schema.org `Person`, `WebSite`, and `Organization` JSON-LD markup linking to official credentials and LinkedIn profile (`https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/`).

---

## 5. Regionalization & Localization (i18n)

* Supported locales: United States (`/`), United Kingdom (`/uk/`), Canada (`/ca/`), Australia (`/au/`), New Zealand (`/nz/`).
* Localized unit defaults (`lbs` vs `kg`) and regionalized language variations.
* Automated self-referential canonicals and cross-locale `hreflang` tags to guarantee 100% Google Search Console compliance.

---

## 6. Success Metrics & Performance Targets

* **Lighthouse Performance Score:** ≥ 95 on Desktop, ≥ 90 on Mobile.
* **Cumulative Layout Shift (CLS):** 0.00.
* **Page Load Time:** < 500ms on 4G networks.
* **Sitemap Cleanliness:** 0 duplicate URLs across index and sub-sitemaps.
