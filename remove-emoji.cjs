const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}\u{2702}-\u{27B0}\u{E0020}-\u{E007F}]/gu;

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
      results.push(...walk(full));
    } else if (entry.isFile() && /\.(tsx?|json)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const root = __dirname;
const files = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'prisma'))];

let totalChanges = 0;

for (const f of files) {
  const original = fs.readFileSync(f, 'utf-8');
  // Remove emojis + trailing space if emoji was followed by a space
  const cleaned = original.replace(new RegExp(emojiRegex.source + '\\s?', 'gu'), '');
  
  if (cleaned !== original) {
    const rel = path.relative(root, f);
    const origEmojis = original.match(emojiRegex) || [];
    console.log(`${rel}: removed ${origEmojis.length} emoji(s)`);
    fs.writeFileSync(f, cleaned, 'utf-8');
    totalChanges++;
  }
}

console.log(`\nDone! ${totalChanges} files modified.`);
