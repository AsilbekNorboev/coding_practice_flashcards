// scripts/mergeData.js
import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve, extname, basename } from 'path';
import { fileURLToPath } from 'url';

async function merge() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataDir = resolve(__dirname, '../src/data');
  const files = await readdir(dataDir);

  // Parse --exclude flag: npm run merge-data -- --exclude=unit2,unit5
  const excludeArg = process.argv.find(arg => arg.startsWith('--exclude='));
  const excludes = excludeArg
    ? excludeArg.split('=')[1].split(',').map(name => name.trim())
    : [];

  // Only JSON unit files, minus excludes
  const unitFiles = files.filter(f => {
    if (!/^unit\d+\.json$/.test(f)) return false;
    const name = basename(f, extname(f)); // e.g. 'unit2'
    return !excludes.includes(name);
  });

  let allCards = [];
  for (const file of unitFiles) {
    const text = await readFile(join(dataDir, file), 'utf-8');
    const cards = JSON.parse(text);
    if (Array.isArray(cards)) {
      allCards = allCards.concat(cards);
    } else {
      console.warn(`Skipping ${file}: not an array`);
    }
  }

  const outPath = join(dataDir, 'flashcards.json');
  await writeFile(outPath, JSON.stringify(allCards, null, 2));
  console.log(`Merged ${unitFiles.length} files (excluded: ${excludes.join(',') || 'none'}) into flashcards.json (${allCards.length} cards)`);
}

merge().catch(err => {
  console.error(err);
  process.exit(1);
});