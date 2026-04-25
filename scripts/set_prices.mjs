#!/usr/bin/env node
/**
 * One-time maintenance script: injects a `price` field into each book's
 * frontmatter based on the mapping below.
 *
 * - If the book already has a `price:` line, it is updated in place.
 * - If not, a `price:` line is inserted just before the closing `---`.
 * - Currency defaults to INR (schema default).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BOOKS_DIR = 'src/content/books';

// slug (without .md) → price in INR
const PRICES = {
  // Feature items
  'amrta-vani-audio-box-en': 2500,
  'srila-gour-govinda-swami-calendar-en': 500,

  // Sri Krishna Kathamrita Publications (English)
  'guru-tattva-en': 60,
  'suddha-naam-bhajan-soft-en': 150,
  'suddha-naam-bhajan-new-cover-en': 200,
  'naam-tattva-en': 200,
  'nrisimha-chaturdasi-en': 30,
  'sri-guru-i-en': 300,
  'sri-guru-ii-en': 300,
  'sri-guru-iii-en': 300,
  'only-by-mercy-of-a-sadhu-en': 70,
  'the-meaning-of-vyas-puja-booklet-en': 60,
  'sri-guru-charan-padma-en': 100,
  'solid-gold-guru-tattva-en': 60,
  'vedic-dharma-i-grhastha-ashram-soft-en': 300,
  'vedic-dharma-ii-varnashrama-system-en': 400,
  'vrindavan-1975-en': 30,
  'trinad-api-sunicena-soft-bound-en': 300,
  'sri-radha-vol-i-en': 350,
  'sri-radha-vol-ii-en': 350,
  'envy-en': 600,
  'sri-gauranga-samaj-en': 50,

  // Gopal Jiu (English)
  'after-disappearance-of-sri-guru-en': 30,
  'mathura-meets-vrindavan-en': 200,
  'embankment-of-seperation-en': 150,
  'formidable-foe-en': 50,
  'gopal-jiu-en': 80,
  'kk-bindu-6-en': 200,
  'krnsa-kathamrita-vol-09-secret-of-gaura-s-sannyas-en': 150,
  'krnsa-kathamrita-vol-10-putana-false-guru-and-institutions-en': 150,
  'krnsa-kathamrita-vol-11-glories-of-srimad-bhagavatam-en': 150,
  'krnsa-kathamrita-vol-12-hidden-identity-of-lord-jagannath-en': 150,
  'krnsa-kathamrita-vol-13-most-merciful-lord-en': 150,
  'krnsa-kathamrita-vol-14-glories-of-mahaprasad-en': 200,
  'krnsa-kathamrita-vol-15-giri-gowardhan-en': 300,
  'krsna-kathamrita-issue-543-understanding-the-mood-of-sri-chaitanya-en': 100,
  'process-of-inquiry-en': 200,
  'when-good-fortune-arises-en': 300,
  'worship-of-sri-guru-en': 150,
  'how-to-find-guru-en': 30,
  'vaisanav-institution-en': 30,
  'auspicious-invocation-en': 30,
  'three-logs-of-woods-en': 30,
  'tattva-darshan-en': 150,

  // Hindi
  'gopal-jiu-hi': 80,
  'sri-guru-vandana-hi': 100,
  'after-disappearance-of-sri-guru-hi': 30,
  'prem-bhikhari-hi': 100,

  // Russian
  'flow-of-nectar-ru': 100,
  'last-limit-of-bhakti-ru': 100,
  'my-revered-spiritual-master-ru': 250,
  'process-of-inquiry-ru': 100,
  'when-good-fortune-arises-ru': 200,
  'guru-tattva-ru': 60,

  // Bengali
  'asanti-kena-be': 110,
  'bhagavan-ke-janar-upay-be': 150,
  'gour-krishna-jagannath-be': 150,
  'sadhu-sanga-be': 130,
  'suddha-naam-bhajan-be': 60,
  'sukhi-grihastha-jivan-be': 100,
  'virahini-sri-radhika-be': 150,
  'how-to-find-guru-be': 20,
};

const files = readdirSync(BOOKS_DIR).filter((f) => f.endsWith('.md'));
let updated = 0, created = 0, missing = 0, unchanged = 0;

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  if (!(slug in PRICES)) {
    missing++;
    console.warn(`⚠ no price mapping: ${slug}`);
    continue;
  }
  const price = PRICES[slug];
  const path = join(BOOKS_DIR, file);
  const raw = readFileSync(path, 'utf8');

  // Find closing --- of frontmatter
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---(\s*\n?)([\s\S]*)$/);
  if (!m) {
    console.error(`✗ no frontmatter: ${slug}`);
    continue;
  }
  const [, frontmatter, breakAfter, body] = m;

  let newFrontmatter;
  if (/^price:\s*.*$/m.test(frontmatter)) {
    const prev = frontmatter.match(/^price:\s*(.*)$/m)[1].trim();
    if (prev === String(price)) {
      unchanged++;
      continue;
    }
    newFrontmatter = frontmatter.replace(/^price:\s*.*$/m, `price: ${price}`);
    updated++;
  } else {
    // Insert price: line right after language: if present, otherwise at end
    if (/^language:\s*.*$/m.test(frontmatter)) {
      newFrontmatter = frontmatter.replace(/^(language:\s*.*)$/m, `$1\nprice: ${price}`);
    } else {
      newFrontmatter = frontmatter.trimEnd() + `\nprice: ${price}`;
    }
    created++;
  }

  const out = `---\n${newFrontmatter}\n---${breakAfter}${body}`;
  writeFileSync(path, out, 'utf8');
}

console.log('\nDone.');
console.log(`  added:     ${created}`);
console.log(`  updated:   ${updated}`);
console.log(`  unchanged: ${unchanged}`);
console.log(`  missing price mapping: ${missing}`);
