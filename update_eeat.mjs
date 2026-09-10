import fs from 'fs';

const REKHA_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dr. Rekha Kumar, M.D., M.S.",
  "givenName": "Rekha",
  "familyName": "Kumar",
  "honorificPrefix": "Dr.",
  "honorificSuffix": "M.D., M.S.",
  "jobTitle": "Lead Medical Reviewer & Associate Professor of Clinical Medicine",
  "worksFor": [
    {
      "@type": "MedicalOrganization",
      "name": "Weill Cornell Medicine",
      "url": "https://weillcornell.org/"
    },
    {
      "@type": "Organization",
      "name": "Weight Loss Percentage",
      "url": "https://www.weightlosspercentage.com/"
    }
  ],
  "alumniOf": [
    { "@type": "CollegeOrUniversity", "name": "Duke University" },
    { "@type": "CollegeOrUniversity", "name": "Columbia University Institute of Human Nutrition" },
    { "@type": "MedicalSchool", "name": "New York Medical College" }
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Board Certification in Endocrinology, Diabetes & Metabolism",
      "credentialCategory": "Medical Board Certification"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Diplomate of the American Board of Obesity Medicine (ABOM)",
      "credentialCategory": "Medical Board Certification"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "Board Certification in Internal Medicine",
      "credentialCategory": "Medical Board Certification"
    }
  ],
  "knowsAbout": [
    "Clinical Obesity Medicine",
    "Endocrinology & Metabolic Health",
    "Weight Loss Percentage Calculation & Clinical Milestones",
    "GLP-1 Receptor Agonists & Medical Weight Management",
    "Pediatric & Adolescent Weight Trends",
    "Basal Metabolic Rate & Energy Expenditure"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/",
    "https://weillcornell.org/rkumar"
  ],
  "image": "https://www.weightlosspercentage.com/images/dr-rekha-kumar.png",
  "url": "https://www.weightlosspercentage.com/authors/dr-rekha-kumar/",
  "description": "Dr. Rekha Kumar, M.D., M.S. is an Associate Professor of Clinical Medicine at Weill Cornell Medicine, former Medical Director of the American Board of Obesity Medicine, and Lead Medical Reviewer at Weight Loss Percentage."
};

const ARTICLE_SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Weight Loss Percentage Calculator",
  "description": "Calculate your exact weight loss percentage instantly with our free tool. Track body weight trends, set healthy 5% & 10% goals, and plan safe weight loss.",
  "image": "https://www.weightlosspercentage.com/images/dr-rekha-kumar.png",
  "author": {
    "@type": "Person",
    "name": "Dr. Rekha Kumar, MS, RD",
    "url": "https://www.weightlosspercentage.com/authors/dr-rekha-kumar"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Weight Loss Percentage",
    "url": "https://www.weightlosspercentage.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.weightlosspercentage.com/favicon.svg"
    }
  },
  "reviewedBy": REKHA_SCHEMA
}, null, 2);

const clinical-review_BANNER_HTML = `<div style="margin-bottom: 1.75rem; font-size: 0.925rem; color: #64748b; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.875rem 1.25rem;">
          <a href="/authors/dr-rekha-kumar/" style="display: flex; align-items: center; text-decoration: none;">
            <img src="/images/dr-rekha-kumar.png" alt="Dr. Rekha Kumar, M.D., M.S." style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);" />
          </a>
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2px;">
              <span style="font-weight: 700; color: #0f172a;">Medically Reviewed by <a href="/authors/dr-rekha-kumar/" style="color: #4f46e5; text-decoration: none;">Dr. Rekha Kumar, M.D., M.S.</a></span>
              <a href="https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/" target="_blank" rel="noopener noreferrer" aria-label="Dr. Rekha Kumar LinkedIn" style="display: inline-flex; align-items: center; color: #0a66c2; text-decoration: none;">
                <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
            </div>
            <div style="font-size: 0.8rem; color: #64748b;">
              Assoc. Professor of Clinical Medicine, Weill Cornell • Former Medical Director, American Board of Obesity Medicine (ABOM)
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 6px; font-size: 0.775rem; font-weight: 600;">✓ Clinically Verified</span>
            <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 0.775rem; font-weight: 500;">Updated: September 2026</span>
          </div>
        </div>`;

// 1. Process index.html from clean index.html.backup
let indexHtml = fs.readFileSync('index.html.backup', 'utf-8');

// Replace Article Schema in indexHtml
indexHtml = indexHtml.replace(
  /<!-- Article Schema -->[\s\S]*?<\/script>/,
  `<!-- Article Schema with Dr. Rekha Kumar Reviewer -->\n    <script type="application/ld+json">\n${ARTICLE_SCHEMA_JSON}\n    </script>`
);

// Replace Byline in indexHtml (matches both variants)
indexHtml = indexHtml.replace(
  /<div style="margin-bottom: (?:1rem|1\.5rem); font-size: 0\.9rem;[\s\S]*?<\/div>/,
  clinical-review_BANNER_HTML
);

fs.writeFileSync('index.html', indexHtml, 'utf-8');
console.log('Updated index.html successfully');

// 2. Process dist3/index.html
let dist3IndexHtml = fs.readFileSync('dist3/index.html', 'utf-8');

dist3IndexHtml = dist3IndexHtml.replace(
  /\{[\s\n]*"@context":\s*"https:\/\/schema\.org",[\s\n]*"@type":\s*"Article",[\s\S]*?"@type":\s*"Person",\s*"name":\s*"Dr\.\s*John\s*Smith"[\s\S]*?\}/,
  ARTICLE_SCHEMA_JSON
);

dist3IndexHtml = dist3IndexHtml.replace(
  /<div style="margin-bottom: (?:1rem|1\.5rem); font-size: 0\.9rem;[\s\S]*?<\/div>/,
  clinical-review_BANNER_HTML
);

fs.writeFileSync('dist3/index.html', dist3IndexHtml, 'utf-8');
console.log('Updated dist3/index.html successfully');
