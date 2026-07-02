import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../static/sitemap.xml', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const xml = readFileSync(path, 'utf8').replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${today}</lastmod>`);
writeFileSync(path, xml);
console.log(`sitemap.xml lastmod → ${today}`);
