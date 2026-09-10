import { parseHtmlPageV2 } from './src/utils/parser_v2.ts';
const parsed = parseHtmlPageV2('nutrition/index.html', false);
console.log('Body length:', parsed.bodyContent.length);
console.log('Contains Fast Food:', parsed.bodyContent.includes('Fast Food'));
