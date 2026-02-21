// Screenshot capture script using puppeteer-core + existing Chrome
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const SCREENSHOTS_DIR = './screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const pages = [
  { name: '01_home', url: 'http://localhost:3000/', wait: 2000 },
  { name: '02_search', url: 'http://localhost:3000/search', wait: 2000 },
  { name: '03_order', url: 'http://localhost:3000/order', wait: 2000 },
  { name: '04_chat', url: 'http://localhost:3000/chat', wait: 2000 },
  { name: '05_info', url: 'http://localhost:3000/info', wait: 2000 },
  { name: '06_events', url: 'http://localhost:3000/events', wait: 2000 },
  { name: '07_kit', url: 'http://localhost:3000/kit', wait: 2000 },
  { name: '08_admin_store', url: 'http://localhost:3000/admin/store', wait: 2000 },
  { name: '09_admin_store_orders', url: 'http://localhost:3000/admin/store/orders', wait: 2000 },
  { name: '10_admin_store_tables', url: 'http://localhost:3000/admin/store/tables', wait: 2000 },
  { name: '11_admin_store_games', url: 'http://localhost:3000/admin/store/games', wait: 2000 },
  { name: '12_admin_store_chat', url: 'http://localhost:3000/admin/store/chat', wait: 2000 },
  { name: '13_admin_hq', url: 'http://localhost:3000/admin/hq', wait: 2000 },
  { name: '14_admin_hq_games', url: 'http://localhost:3000/admin/hq/games', wait: 2000 },
  { name: '15_admin_hq_menus', url: 'http://localhost:3000/admin/hq/menus', wait: 2000 },
  { name: '16_admin_hq_recommend', url: 'http://localhost:3000/admin/hq/recommend', wait: 2000 },
  { name: '17_admin_hq_events', url: 'http://localhost:3000/admin/hq/events', wait: 2000 },
];

async function main() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  for (const p of pages) {
    // Customer pages: tablet-like viewport (landscape)
    if (!p.url.includes('/admin/')) {
      await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    } else {
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    }
    
    try {
      await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise(r => setTimeout(r, p.wait));
      await page.screenshot({ 
        path: `${SCREENSHOTS_DIR}/${p.name}.png`, 
        fullPage: false 
      });
      console.log(`✅ ${p.name}`);
    } catch (err) {
      console.log(`❌ ${p.name}: ${err.message}`);
    }
  }
  
  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

main();
