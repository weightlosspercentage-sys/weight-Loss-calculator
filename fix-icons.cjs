const fs = require('fs');
let content = fs.readFileSync('assets/index-Ctp2HkQJ.js.bak-mojibake', 'utf8');

// The Windows-1252 characters to actual emoji map
const replacements = {
  'ðŸ“Š': '📊',
  'ðŸ”¥': '🔥',
  'âš¡': '⚡',
  'ðŸŽ¯': '🎯',
  'ðŸ\x8DŽ': '🍎', // ðŸŽ
  'âš–ï¸\x8F': '⚖️',
  'ðŸ’ª': '💪',
  'ðŸ¥›': '🥛',
  'ðŸ’§': '💧',
  'ðŸ¥‘': '🥑',
};

// Also replace the lightning bolt if it appears as mojibake
for (const [mojibake, emoji] of Object.entries(replacements)) {
  // Global replace
  content = content.split(mojibake).join(emoji);
}

// Write the fixed content
fs.writeFileSync('assets/index-Ctp2HkQJ.js', content, 'utf8');
console.log('Fixed file generated!');
