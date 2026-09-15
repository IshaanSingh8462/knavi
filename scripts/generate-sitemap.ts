// Regenerates public/sitemap.xml from the same blogPosts.ts list the site
// itself reads. Runs automatically as part of `npm run build` (see
// package.json), so publishing a new post never requires hand-editing XML.
//
// Run manually with: npm run generate-sitemap

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts } from '../src/content/blogPosts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://getstrail.me';

interface SitemapUrl {
  loc: string;
  changefreq: string;
  priority: string;
}

const staticUrls: SitemapUrl[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
];

const postUrls: SitemapUrl[] = blogPosts.map((post) => ({
  loc: `/blog/${post.slug}`,
  changefreq: 'monthly',
  priority: '0.7',
}));

const urls = [...staticUrls, ...postUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`Wrote sitemap.xml with ${urls.length} URLs (${postUrls.length} blog posts).`);
