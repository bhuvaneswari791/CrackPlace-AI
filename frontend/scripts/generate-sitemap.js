import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://bhuvaneswari791.github.io/CrackPlace-AI';

// List of all indexable pages on our site
const staticRoutes = [
  '',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/faq'
];

const blogSlugs = [
  '/blog',
  '/blog/top-100-java-questions',
  '/blog/dbms-interview-guide',
  '/blog/how-to-crack-tcs-placement',
  '/blog/google-interview-experience',
  '/blog/react-interview-questions',
  '/blog/ai-placement-preparation-tips'
];

const companySlugs = [
  '/company',
  '/company/google',
  '/company/amazon',
  '/company/tcs',
  '/company/infosys',
  '/company/zoho',
  '/company/microsoft'
];

const notesSlugs = [
  '/notes',
  '/notes/dsa',
  '/notes/dbms',
  '/notes/os',
  '/notes/aptitude'
];

const allRoutes = [
  ...staticRoutes,
  ...blogSlugs,
  ...companySlugs,
  ...notesSlugs
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];

  const xmlUrls = allRoutes.map(route => {
    let priority = '0.5';
    let freq = 'monthly';

    if (route === '') {
      priority = '1.0';
      freq = 'daily';
    } else if (route.startsWith('/blog') || route.startsWith('/company') || route.startsWith('/notes')) {
      priority = '0.8';
      freq = 'weekly';
    } else if (route === '/faq' || route === '/contact' || route === '/about') {
      priority = '0.7';
      freq = 'monthly';
    }

    return `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, sitemapXml, 'utf8');
  console.log(`[SITEMAP] Successfully generated sitemap.xml with ${allRoutes.length} routes at: ${outputPath}`);
};

generateSitemap();
