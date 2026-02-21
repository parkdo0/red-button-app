const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(DIR, { recursive: true });

async function capture(page, name) {
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(DIR, name + '.png'), fullPage: false });
  console.log('OK ' + name);
}

async function loginAdmin(page, id, pw) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  
  // Use API directly to be safe
  const result = await page.evaluate(async (loginId, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'admin', loginId, password })
    });
    return await res.json();
  }, id, pw);
  
  await new Promise(r => setTimeout(r, 1000));
  return result;
}

async function logout(page) {
  await page.evaluate(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  });
  await new Promise(r => setTimeout(r, 1000));
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // ====== 0. Login Page ======
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));
  await capture(page, '00_login');

  // ====== 1. Store Manager Pages ======
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const storeLogin = await loginAdmin(page, 'suwon', 'store1234');
  console.log('>> Store login:', storeLogin.success ? 'OK' : storeLogin.error);

  const storePages = [
    ['08_admin_store_dash', '/admin/store'],
    ['09_admin_store_orders', '/admin/store/orders'],
    ['10_admin_store_tables', '/admin/store/tables'],
    ['11_admin_store_games', '/admin/store/games'],
    ['12_admin_store_chat', '/admin/store/chat'],
    ['13_admin_store_menus', '/admin/store/menus'],
    ['14_admin_store_settings', '/admin/store/settings'],
  ];
  for (const [name, p] of storePages) {
    try {
      await page.goto('http://localhost:3000' + p, { waitUntil: 'networkidle2', timeout: 15000 });
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  // ====== 2. HQ Admin Pages ======
  await logout(page);
  const hqLogin = await loginAdmin(page, 'hq', 'admin1234');
  console.log('>> HQ login:', hqLogin.success ? 'OK' : hqLogin.error);

  const hqPages = [
    ['15_admin_hq_dash', '/admin/hq'],
    ['16_admin_hq_games', '/admin/hq/games'],
    ['17_admin_hq_menus', '/admin/hq/menus'],
    ['18_admin_hq_recommend', '/admin/hq/recommend'],
    ['19_admin_hq_events', '/admin/hq/events'],
    ['20_admin_hq_stores', '/admin/hq/stores'],
    ['21_admin_hq_tags', '/admin/hq/tags'],
  ];
  for (const [name, p] of hqPages) {
    try {
      await page.goto('http://localhost:3000' + p, { waitUntil: 'networkidle2', timeout: 15000 });
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  // ====== 3. Customer Pages (Table Session) ======
  await logout(page);
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  // First, get a valid setupCode from the tables API
  // Login as store admin temporarily to query tables
  await loginAdmin(page, 'suwon', 'store1234');
  
  const setupCode = await page.evaluate(async () => {
    const res = await fetch('/api/tables');
    const data = await res.json();
    // Find table 31 or first active table with setupCode
    if (Array.isArray(data)) {
      const t31 = data.find(t => t.tableNo === '31' && t.setupCode);
      if (t31) return t31.setupCode;
      const anyTable = data.find(t => t.setupCode);
      if (anyTable) return anyTable.setupCode;
    }
    return null;
  });
  
  console.log('>> Found setupCode:', setupCode);
  
  await logout(page);
  
  if (setupCode) {
    // Login as table using setupCode
    const tableLogin = await page.evaluate(async (code) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'table', storeId: 1, setupCode: code })
      });
      return await res.json();
    }, setupCode);
    console.log('>> Table login:', tableLogin.success ? 'OK (' + tableLogin.table?.tableNo + ')' : tableLogin.error);
  } else {
    // Fallback: try setting session cookie directly
    console.log('>> No setupCode found, trying direct session...');
    await page.evaluate(async () => {
      // Try all possible setupCodes for table 31 by querying
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'table', storeId: 1, setupCode: 'SW31AA' })
      });
      const data = await res.json();
      console.log('Fallback login:', data);
    });
  }
  
  await new Promise(r => setTimeout(r, 2000));

  const customerPages = [
    ['01_home', '/'],
    ['02_search', '/search'],
    ['03_order', '/order'],
    ['04_chat', '/chat'],
    ['05_info', '/info'],
    ['06_events', '/events'],
    ['07_kit', '/kit'],
  ];
  for (const [name, p] of customerPages) {
    try {
      await page.goto('http://localhost:3000' + p, { waitUntil: 'networkidle2', timeout: 15000 });
      // Check if we got redirected to login
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('REDIRECT ' + name + ' -> login page');
      }
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
