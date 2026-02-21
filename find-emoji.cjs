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

const srcDir = path.join(__dirname, 'src');
const prismaDir = path.join(__dirname, 'prisma');
const files = [...walk(srcDir), ...walk(prismaDir)];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const matches = line.match(emojiRegex);
    if (matches) {
      const rel = path.relative(__dirname, f);
      console.log(`${rel}:${i+1}: ${matches.join(', ')} | ${line.trim().substring(0, 120)}`);
    }
  });
}
