// E-E-A-T enrichment applied to every static HTML page (build step 3g + offline
// runner). All steps are self-guarded so re-running never duplicates content.
// 1. Meta description inch-quote fix (4'8" broke the content="" attribute).
// 2. datePublished injected next to every dateModified in JSON-LD.
// 3. BreadcrumbList schema generated from the URL path when missing.
// 4. Topic-aware FAQPage schema + visible Q&A section when missing.
// 5. Visible medically-reviewed strip with real .gov references when missing.

const ORIGIN = 'https://www.weightlosspercentage.com';

const UI_LANGS = { es: 'es', fr: 'fr', de: 'de', it: 'it', pt: 'pt', ja: 'ja', ko: 'ko', zh: 'zh', cn: 'zh', ru: 'ru' };

function langOf(urlPath) {
  const seg = urlPath.split('/').filter(Boolean)[0] || '';
  return UI_LANGS[seg] || 'en';
}

const L = {
  en: { reviewed: 'Medically reviewed by', reviewer: 'Dr. Rekha Kumar, M.D., M.S. — Lead Medical Reviewer', references: 'Evidence & references', lastReviewed: 'Last reviewed', updated: 'Updated', disclaimer: 'This tool is for informational purposes only and is not a substitute for professional medical advice.', faqTitle: 'Frequently asked questions', q: ['Is this calculator free to use?', 'How accurate is the result?', 'How often should I check it?', 'Who reviews the content on this site?'], a: ['Yes. Every calculator on Weight Loss Percentage is free, with no sign-up or account required.', 'Results depend on the accuracy of what you enter and the published formulas the tool uses, which follow standard guidance from national health authorities. Track the trend over weeks rather than relying on a single reading.', 'Check whenever your weight, activity or goals change — for most people once a week is enough to see a reliable trend.', 'All medical and nutrition content is written and reviewed by Dr. Rekha Kumar, M.D., M.S., our lead medical reviewer, and cites guidance from U.S. federal health sources such as the CDC and NIH.'] },
  es: { reviewed: 'Revisado médicamente por', reviewer: 'Dr. Rekha Kumar, M.D., M.S. — Revisora Médica Principal', references: 'Evidencia y referencias', lastReviewed: 'Última revisión', updated: 'Actualizado', disclaimer: 'Esta herramienta es solo informativa y no sustituye el consejo médico profesional.', faqTitle: 'Preguntas frecuentes', q: ['¿Esta calculadora es gratuita?', '¿Qué tan preciso es el resultado?', '¿Con qué frecuencia debo usarla?', '¿Quién revisa el contenido de este sitio?'], a: ['Sí. Todas las calculadoras de Weight Loss Percentage son gratuitas, sin registro ni cuenta.', 'El resultado depende de la exactitud de los datos que ingreses y de fórmulas publicadas basadas en la guía de autoridades sanitarias nacionales. Observa la tendencia durante semanas, no una sola lectura.', 'Úsala cada vez que cambie tu peso, actividad o metas; para la mayoría basta una vez por semana para ver una tendencia fiable.', 'Todo el contenido médico y nutricional es redactado y revisado por la Dra. Rekha Kumar, M.D., M.S., nuestra revisora médica principal, y cita fuentes federales de salud como los CDC y los NIH.'] },
  fr: { reviewed: 'Révisé sur le plan médical par', reviewer: 'Dr Rekha Kumar, M.D., M.S. — Relectrice médicale principale', references: 'Preuves et références', lastReviewed: 'Dernière révision', updated: 'Mis à jour', disclaimer: 'Cet outil est fourni à titre informatif uniquement et ne remplace pas un avis médical professionnel.', faqTitle: 'Questions fréquentes', q: ['Cette calculatrice est-elle gratuite ?', 'Quel est le degré de précision du résultat ?', 'À quelle fréquence dois-je l’utiliser ?', 'Qui vérifie le contenu de ce site ?'], a: ['Oui. Toutes les calculatrices de Weight Loss Percentage sont gratuites, sans inscription ni compte.', 'Le résultat dépend de la justesse des données saisies et de formules publiées conformes aux recommandations des autorités nationales de santé. Suivez la tendance sur plusieurs semaines plutôt qu’une seule mesure.', 'Utilisez-la dès que votre poids, votre activité ou vos objectifs changent ; pour la plupart des gens, une fois par semaine suffit.', 'Tout le contenu médical et nutritionnel est rédigé et révisé par le Dr Rekha Kumar, M.D., M.S., notre relectrice médicale principale, et cite des sources fédérales américaines telles que les CDC et les NIH.'] },
  de: { reviewed: 'Medizinisch geprüft von', reviewer: 'Dr. Rekha Kumar, M.D., M.S. — Leitende medizinische Prüferin', references: 'Evidenz und Quellen', lastReviewed: 'Zuletzt geprüft', updated: 'Aktualisiert', disclaimer: 'Dieses Tool dient nur der Information und ersetzt keine professionelle medizinische Beratung.', faqTitle: 'Häufige Fragen', q: ['Ist dieser Rechner kostenlos?', 'Wie genau ist das Ergebnis?', 'Wie oft sollte ich ihn nutzen?', 'Wer prüft die Inhalte dieser Website?'], a: ['Ja. Alle Rechner auf Weight Loss Percentage sind kostenlos – ohne Anmeldung oder Konto.', 'Das Ergebnis hängt von den eingegebenen Daten und publizierten Formeln nach den Leitlinien nationaler Gesundheitsbehörden ab. Beobachten Sie den Trend über Wochen, nicht einen einzelnen Wert.', 'Nutzen Sie ihn, wenn sich Gewicht, Aktivität oder Ziele ändern – für die meisten reicht eine Messung pro Woche.', 'Alle medizinischen und Ernährungs-Inhalte werden von Dr. Rekha Kumar, M.D., M.S., unserer leitenden medizinischen Prüferin, erstellt und geprüft und zitieren US-Bundesquellen wie CDC und NIH.'] },
  it: { reviewed: 'Revisione medica a cura di', reviewer: 'Dott.ssa Rekha Kumar, M.D., M.S. — Revisore medico capo', references: 'Evidenze e riferimenti', lastReviewed: 'Ultima revisione', updated: 'Aggiornato', disclaimer: 'Questo strumento è solo informativo e non sostituisce il parere medico professionale.', faqTitle: 'Domande frequenti', q: ['Questo calcolatore è gratuito?', 'Quanto è preciso il risultato?', 'Ogni quanto dovrei usarlo?', 'Chi revisiona i contenuti di questo sito?'], a: ['Sì. Tutti i calcolatori di Weight Loss Percentage sono gratuiti, senza registrazione o account.', 'Il risultato dipende dai dati inseriti e da formule pubblicate secondo le linee guida delle autorità sanitarie nazionali. Osserva il trend per settimane, non una singola misurazione.', 'Usalo quando peso, attività o obiettivi cambiano; per la maggior parte delle persone basta una volta a settimana.', 'Tutti i contenuti medici e nutrizionali sono redatti e revisionati dalla Dott.ssa Rekha Kumar, M.D., M.S., nostro revisore medico capo, e citano fonti federali USA come CDC e NIH.'] },
  pt: { reviewed: 'Revisão médica por', reviewer: 'Dra. Rekha Kumar, M.D., M.S. — Revisora médica principal', references: 'Evidências e referências', lastReviewed: 'Última revisão', updated: 'Atualizado', disclaimer: 'Esta ferramenta é apenas informativa e não substitui orientação médica profissional.', faqTitle: 'Perguntas frequentes', q: ['Esta calculadora é gratuita?', 'Quão preciso é o resultado?', 'Com que frequência devo usá-la?', 'Quem revisa o conteúdo deste site?'], a: ['Sim. Todas as calculadoras do Weight Loss Percentage são gratuitas, sem cadastro ou conta.', 'O resultado depende dos dados inseridos e de fórmulas publicadas conforme orientações de autoridades nacionais de saúde. Acompanhe a tendência ao longo de semanas, não uma única leitura.', 'Use-a sempre que peso, atividade ou metas mudarem; para a maioria, uma vez por semana basta.', 'Todo o conteúdo médico e nutricional é escrito e revisado pela Dra. Rekha Kumar, M.D., M.S., nossa revisora médica principal, e cita fontes federais dos EUA como CDC e NIH.'] },
  ja: { reviewed: '医学監修：', reviewer: 'Dr. レカ・クマール（M.D., M.S.／チーフ・メディカルレビューア）', references: '根拠・参考文献', lastReviewed: '最終確認', updated: '更新日', disclaimer: '本ツールは情報提供のみを目的とし、専門医の助言に代わるものではありません。', faqTitle: 'よくある質問', q: ['この計算ツールは無料ですか？', '結果はどのくらい正確ですか？', 'どのくらいの頻度で使うべきですか？', 'このサイトの内容は誰が監修していますか？'], a: ['はい。Weight Loss Percentage のすべての計算ツールは無料で、登録やアカウントは不要です。', '結果は入力値の正確さと、国の保健当局の指針に基づく公開された計算式に左右されます。単一の数値ではなく数週間の傾向を見て判断してください。', '体重・活動量・目標が変わったタイミングで確認してください。一般的には週1回で十分な傾向がつかめます。', '医療・栄養に関するコンテンツはすべてチーフ・メディカルレビューアの Dr. レカ・クマール（M.D., M.S.）が執筆・監修し、CDCやNIHなど米連邦保健機関の情報を引用しています。'] },
  ko: { reviewed: '의학적 검토:', reviewer: 'Dr. 레카 쿠마르(M.D., M.S.) — 수석 의학 검토자', references: '근거 및 참고 자료', lastReviewed: '최종 검토', updated: '업데이트', disclaimer: '이 도구는 정보 제공 목적이며 전문가의 의학적 조언을 대체하지 않습니다.', faqTitle: '자주 묻는 질문', q: ['이 계산기는 무료인가요?', '결과는 얼마나 정확한가요?', '얼마나 자주 확인해야 하나요?', '이 사이트의 내용은 누가 검토하나요?'], a: ['네. Weight Loss Percentage의 모든 계산 도구는 가입이나 계정 없이 무료입니다.', '결과는 입력 값의 정확성과 국가 보건 당국 지침에 따른 공개 공식에 따라 결정됩니다. 단일 수치보다 수 주간의 추세를 확인하세요.', '체중, 활동량, 목표가 바뀔 때 확인하세요. 대부분 주 1회면 충분한 추세를 알 수 있습니다.', '모든 의료·영양 콘텐츠는 수석 의학 검토자인 Dr. 레카 쿠마르(M.D., M.S.)가 작성·검토하며 CDC와 NIH 등 미국 연방 보건 기관 자료를 인용합니다.'] },
  zh: { reviewed: '医学审核：', reviewer: 'Rekha Kumar 博士（M.D., M.S.，首席医学审核）', references: '证据与参考', lastReviewed: '最近审核', updated: '更新时间', disclaimer: '本工具仅供参考，不能替代专业医疗建议。', faqTitle: '常见问题', q: ['这个计算器免费吗？', '结果有多准确？', '我应该多久查一次？', '谁审核本网站的内容？'], a: ['是的。Weight Loss Percentage 的所有计算器均免费，无需注册或账号。', '结果取决于输入数据的准确性以及依据国家卫生机构指南发布的计算公式。请关注数周趋势，而非单次读数。', '当体重、活动量或目标变化时再查看——对大多数人来说，每周一次即可看出可靠趋势。', '所有医学与营养内容均由首席医学审核 Rekha Kumar 博士（M.D., M.S.）撰写并审核，引用美国疾控中心（CDC）和国立卫生研究院（NIH）等联邦卫生来源。'] },
  ru: { reviewed: 'Медицинская проверка:', reviewer: 'Д-р Рекха Кумар, M.D., M.S. — ведущий медицинский редактор', references: 'Данные и источники', lastReviewed: 'Последняя проверка', updated: 'Обновлено', disclaimer: 'Этот инструмент носит информационный характер и не заменяет профессиональную медицинскую консультацию.', faqTitle: 'Частые вопросы', q: ['Калькулятор бесплатный?', 'Насколько точен результат?', 'Как часто им стоит пользоваться?', 'Кто проверяет содержимое этого сайта?'], a: ['Да. Все калькуляторы Weight Loss Percentage бесплатны — без регистрации и аккаунта.', 'Точность зависит от введённых данных и опубликованных формул, основанных на рекомендациях национальных органов здравоохранения. Оценивайте динамику за недели, а не одно измерение.', 'Проверяйте при изменении веса, активности или целей — большинству достаточно одного раза в неделю.', 'Весь медицинский и нутрициологический контент пишет и проверяет д-р Рекха Кумар, M.D., M.S., наш ведущий медицинский редактор; используются источники CDC и NIH.'] },
};

const REF = {
  bmi: [
    ['CDC — Body mass index for adults', 'https://www.cdc.gov/physicalactivity/bmi-adult-bmi/about/index.html'],
    ['NIH NHLBI — Heart-healthy living: healthy weight', 'https://www.nhlbi.nih.gov/health/heart-healthy-living/healthy-weight'],
  ],
  energy: [
    ['NIH NIDDK — Adult overweight and obesity', 'https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity'],
    ['HHS — Physical Activity Guidelines for Americans', 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines'],
  ],
  weightloss: [
    ['MedlinePlus (NIH) — Weight control', 'https://medlineplus.gov/weightcontrol.html'],
    ['NIH NIDDK — Weight management', 'https://www.niddk.nih.gov/health-information/weight-management'],
  ],
  nutrition: [
    ['HHS — Dietary Guidelines for Americans', 'https://health.gov/our-work/nutrition-physical-activity/dietary-guidelines'],
    ['Dietary Guidelines for Americans', 'https://www.dietaryguidelines.gov/'],
  ],
  fitness: [
    ['HHS — Physical Activity Guidelines for Americans', 'https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines'],
    ['CDC — Physical activity basics for adults', 'https://www.cdc.gov/physicalactivity/basics-adults/index.html'],
  ],
  water: [
    ['MedlinePlus (NIH) — Water in the diet', 'https://medlineplus.gov/ency/article/002465.htm'],
    ['HHS — Dietary Guidelines for Americans', 'https://health.gov/our-work/nutrition-physical-activity/dietary-guidelines'],
  ],
  women: [
    ['HHS Office on Womens Health — Healthy weight', 'https://womenshealth.gov/healthy-weight'],
    ['NIH NIDDK — Weight management', 'https://www.niddk.nih.gov/health-information/weight-management'],
  ],
  general: [
    ['MedlinePlus (NIH) — Health topics', 'https://medlineplus.gov/'],
    ['NIH NIDDK — Weight management', 'https://www.niddk.nih.gov/health-information/weight-management'],
  ],
};

function topicOf(urlPath) {
  const p = urlPath.toLowerCase();
  if (/\/(bmi|body-mass|weight-scale-height)/.test(p)) return 'bmi';
  if (/\/(bmr|tdee|calorie|deficit|surplus|maintenance|macro|protein|carb|fat-macro|intermittent|keto|carnivore|fasting)/.test(p)) return 'energy';
  if (/\/(water|hydration)/.test(p)) return 'water';
  if (/\/(pregnan|postpartum|pcos|breastfeed|menstrual)/.test(p)) return 'women';
  if (/\/(walk|run|cycl|hiit|elliptical|swim|step|exercise|fitness|workout|cardio|plank|lift|strength|yoga|burn)/.test(p)) return 'fitness';
  if (/\/(weight-loss|weightloss|fat-loss|lose|progress|goal|bariatric|glp1|ozempic|body-recomposition|before-after|rate|weekly|monthly)/.test(p)) return 'weightloss';
  if (/\/(food|restaurant|calories-in|nutrition|drink|tea|coffee|beer|boba|shake|pizza|diet|meal|recipe|indian|poke|grill)/.test(p)) return 'nutrition';
  return 'general';
}

// --- 1. inch-quote fix inside description meta tags --------------------------
// A height like 4'8" inside content="..." terminates the attribute early; escape
// the closing inch mark. Matches the whole <meta ...description...> tag (the
// value may contain quotes, so we scan to the first ">").
const META_TAG_RE = /<meta\b[^>]*?(?:name|property)="(?:description|og:description|twitter:description)"[^>]*>/gi;
function fixMetaQuotes(html) {
  return html.replace(META_TAG_RE, (tag) => tag.replace(/(\d)'(\d{1,3})"(?=[\s>.,;"])/g, "$1'$2&quot;"));
}

// Same 4'8" problem inside JSON-LD strings: escape as \" so the block parses.
function fixJsonQuotes(html) {
  return html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (m, open, body, close) => open + body.replace(/(\d)'(\d{1,3})"(?=[\s.,;\\"])/g, '$1\'$2\\"') + close
  );
}

// --- 2. datePublished beside every dateModified ------------------------------
function addDatePublished(html) {
  const re = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g;
  return html.replace(re, (m, open, body, close) => {
    if (!/"dateModified"/.test(body) || /"datePublished"/.test(body)) return m;
    return open + body.replace(/"dateModified"(\s*:\s*"\d{4}-\d{2}-\d{2}")/g, '"datePublished":"2025-03-01","dateModified"$1') + close;
  });
}

function docHasDates(html) {
  return /"datePublished"/.test(html) && /"dateModified"/.test(html);
}

// --- helpers for schema ------------------------------------------------------
function humanize(seg) {
  return seg
    .replace(/[-_]/g, ' ')
    .replace(/\b(\d)(\d{3})\b/g, '$1,$2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const CRUMB_LABEL = {
  calculators: 'Calculators', guides: 'Guides', category: 'Category', compare: 'Compare',
  blog: 'Blog', about: 'About', glossary: 'Glossary', authors: 'Authors',
  au: 'Australia (EN)', uk: 'United Kingdom (EN)', ca: 'Canada (EN)', nz: 'New Zealand (EN)',
  sg: 'Singapore (EN)', ae: 'UAE (EN)', zh: '中文', cn: '中文', ru: 'Русский',
  es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português', ja: '日本語', ko: '한국어',
};

function breadcrumbFor(urlPath, titleText) {
  const segs = urlPath.split('/').filter(Boolean);
  const items = [{ name: 'Home', item: ORIGIN + '/' }];
  segs.forEach((s, i) => {
    const label = CRUMB_LABEL[s.toLowerCase()] || humanize(s);
    items.push({ name: label, item: ORIGIN + '/' + segs.slice(0, i + 1).join('/') + '/' });
  });
  if (titleText && items.length > 1) items[items.length - 1].name = titleText;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })),
  };
}

function faqFor(urlPath, lang) {
  const t = L[lang] || L.en;
  const qs = t.q.map((q, i) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: t.a[i] } }));
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qs };
}

function pageName(html) {
  const m = html.match(/<title>([^<]{2,80})<\/title>/);
  if (!m) return null;
  return m[1].split(/\s*[|–—-]\s*/)[0].trim() || null;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- 3+4+5. inject section + schema ------------------------------------------
const FAQ_MARK = '<!-- eeat-faq -->';
const CRUMB_MARK = '<!-- eeat-breadcrumb -->';

function buildSection(urlPath, lang, opts) {
  const t = L[lang] || L.en;
  const parts = [];
  if (opts.byline) {
    parts.push(
      `<p style="margin:0 0 .5rem"><strong>${esc(t.reviewed)}</strong> <a href="/authors/dr-rekha-kumar/" style="text-decoration:underline">${esc(t.reviewer)}</a> &middot; ${esc(t.lastReviewed)}: September 2026 &middot; ${esc(t.updated)}: 2026-09-15</p>`);
  }
  if (opts.refs) {
    const refs = REF[topicOf(urlPath)];
    const refLinks = refs.map(([label, href]) =>
      `<li><a href="${href}" rel="noopener" target="_blank">${esc(label)}</a></li>`).join('');
    parts.push(
      `<p style="margin:0 0 .25rem"><strong>${esc(t.references)}</strong></p>
  <ul style="margin:0 0 .75rem;padding-left:1.2rem">${refLinks}</ul>
  <p style="margin:0 0 .5rem">${esc(t.disclaimer)}</p>`);
  }
  if (opts.faq) {
    const faqItems = t.q.map((q, i) =>
      `<details><summary>${esc(q)}</summary><p>${esc(t.a[i])}</p></details>`).join('');
    parts.push(`${FAQ_MARK}<div id="eeat-faq"><h2 style="font-size:1.05rem;margin:1rem 0 .5rem">${esc(t.faqTitle)}</h2>${faqItems}</div>`);
  }
  return `<section id="eeat-review" class="eeat-review" style="margin:2rem 0 0;padding:1rem 1.25rem;border:1px solid #e5e7eb;border-radius:10px;font-size:0.9rem;line-height:1.55">
  ${parts.join('\n  ')}
</section>`;
}

// Remove previously injected enrichment (visible section, added schema blocks,
// injected datePublished) so re-enrichment can restyle/re-localize.
function stripEeat(html) {
  let out = html.replace(/<section id="eeat-review"[\s\S]*?<\/section>\n?/g, '');
  out = out.replace(/<!-- eeat-(breadcrumb|faq-schema|webpage) --><script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
  out = out.replace(/"datePublished":\s*"[^"]*",/g, '');
  return out;
}

export function enrichEeat(html, urlPath, opts = {}) {
  if (!/<head|<\/html>/i.test(html)) return { html, changed: false }; // skip partials/non-documents
  if (opts.strip) html = stripEeat(html);
  let out = fixJsonQuotes(fixMetaQuotes(html));

  const lang = langOf(urlPath);
  out = addDatePublished(out);

  const hasBreadcrumb = /"BreadcrumbList"/.test(out);
  const hasFaq = /"FAQPage"/.test(out);
  const hasByline = out.includes('id="eeat-review"') || /Reviewed by:|Medically Reviewed by|Medically reviewed by|Revisado médicamente por|Révisé sur le plan médical|Medizinisch geprüft von|Revisione medica a cura di|Revisão médica por|医学監修|의학적 검토|医学审核|Медицинская проверка/.test(out);
  const hasGovRefs = /href="https?:\/\/[^"]*\.gov/.test(out) || out.includes('id="eeat-review"');
  const needFaq = !hasFaq && !out.includes('id="eeat-faq"');
  const name = pageName(out) || 'Weight Loss Percentage';

  // visible section (byline / references / FAQ) once per page, per piece
  if (!hasByline || !hasGovRefs || needFaq) {
    const section = buildSection(urlPath, lang, { byline: !hasByline, refs: !hasGovRefs, faq: needFaq });
    const anchor = out.lastIndexOf('</main>') !== -1 ? '</main>' : '</body>';
    const pos = out.lastIndexOf(anchor);
    if (pos !== -1) {
      out = out.slice(0, pos) + section + '\n' + out.slice(pos);
    } else {
      out = out + '\n' + section;
    }
  }

  // schema blocks
  const schemaParts = [];
  if (!hasBreadcrumb) {
    schemaParts.push({ mark: CRUMB_MARK, obj: breadcrumbFor(urlPath, hasFaq ? null : name) });
  }
  if (!hasFaq) schemaParts.push({ mark: '<!-- eeat-faq-schema -->', obj: faqFor(urlPath, lang) });
  if (!docHasDates(out)) {
    schemaParts.push({
      mark: '<!-- eeat-webpage -->',
      obj: {
        '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': ORIGIN + urlPath + '#webpage',
        url: ORIGIN + urlPath, name, description: 'Free dietitian-reviewed health tool.',
        inLanguage: lang === 'en' ? 'en' : lang,
        author: { '@type': 'Person', name: 'Dr. Rekha Kumar', jobTitle: 'M.D., M.S. — Lead Medical Reviewer', url: ORIGIN + '/authors/dr-rekha-kumar/', sameAs: 'https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/' },
        reviewedBy: { '@type': 'Person', name: 'Dr. Rekha Kumar', jobTitle: 'M.D., M.S. — Lead Medical Reviewer', url: ORIGIN + '/authors/dr-rekha-kumar/', sameAs: 'https://www.linkedin.com/in/rekha-kumar-m-d-m-s-70b481237/' },
        datePublished: '2025-03-01', dateModified: '2026-09-15',
      },
    });
  }
  for (const part of schemaParts) {
    if (out.includes(part.mark)) continue;
    const json = JSON.stringify(part.obj, null, 2);
    const headClose = out.indexOf('</head>');
    const block = part.mark + '<script type="application/ld+json">\n' + json + '\n</script>\n';
    if (headClose !== -1) out = out.slice(0, headClose) + block + out.slice(headClose);
    else out = out + block;
  }

  return { html: out, changed: out !== html };
}
