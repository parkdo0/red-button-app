const puppeteer = require('puppeteer');
const { mkdirSync } = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const pages = [
  // Customer pages
  { name: '01_home', url: 'http://localhost:3000/', w: 1280, h: 800 },
  { name: '02_search', url: 'http://localhost:3000/search', w: 1280, h: 800 },
  { name: '03_order', url: 'http://localhost:3000/order', w: 1280, h: 800 },
  { name: '04_chat', url: 'http://localhost:3000/chat', w: 1280, h: 800 },
  { name: '05_info', url: 'http://localhost:3000/info', w: 1280, h: 800 },
  { name: '06_events', url: 'http://localhost:3000/events', w: 1280, h: 800 },
  { name: '07_kit', url: 'http://localhost:3000/kit', w: 1280, h: 800 },
  // Admin store pages
  { name: '08_admin_store_dash', url: 'http://localhost:3000/admin/store', w: 1440, h: 900 },
  { name: '09_admin_store_orders', url: 'http://localhost:3000/admin/store/orders', w: 1440, h: 900 },
  { name: '10_admin_store_tables', url: 'http://localhost:3000/admin/store/tables', w: 1440, h: 900 },
  { name: '11_admin_store_games', url: 'http://localhost:3000/admin/store/games', w: 1440, h: 900 },
  { name: '12_admin_store_chat', url: 'http://localhost:3000/admin/store/chat', w: 1440, h: 900 },
  { name: '13_admin_store_menus', url: 'http://localhost:3000/admin/store/menus', w: 1440, h: 900 },
  // Admin HQ pages
  { name: '14_admin_hq_dash', url: 'http://localhost:3000/admin/hq', w: 1440, h: 900 },
  { name: '15_admin_hq_games', url: 'http://localhost:3000/admin/hq/games', w: 1440, h: 900 },
  { name: '16_admin_hq_menus', url: 'http://localhost:3000/admin/hq/menus', w: 1440, h: 900 },
  { name: '17_admin_hq_recommend', url: 'http://localhost:3000/admin/hq/recommend', w: 1440, h: 900 },
  { name: '18_admin_hq_events', url: 'http://localhost:3000/admin/hq/events', w: 1440, h: 900 },
  { name: '19_admin_hq_stores', url: 'http://localhost:3000/admin/hq/stores', w: 1440, h: 900 },
  { name: '20_admin_hq_tags', url: 'http://localhost:3000/admin/hq/tags', w: 1440, h: 900 },
];

async function main() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  
  const page = await browser.newPage();
  
  for (const p of pages) {
    await page.setViewport({ width: p.w, height: p.h, deviceScaleFactor: 2 });
    
    try {
      await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${p.name}.png`), 
        fullPage: false,
        type: 'png'
      });
      console.log(`OK ${p.name}`);
    } catch (err) {
      console.log(`FAIL ${p.name}: ${err.message.substring(0, 80)}`);
    }
  }
  
  await browser.close();
  console.log('Done!');
}

main();
