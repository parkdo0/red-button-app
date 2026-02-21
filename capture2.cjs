const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(DIR, { recursive: true });

async function capture(page, name) {
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(DIR, name + '.png'), fullPage: false });
  console.log('OK ' + name);
}

async function login(page, id, pw) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('input[placeholder="관리자 아이디"]', { timeout: 5000 });
  // Clear any existing values
  await page.evaluate(() => {
    document.querySelectorAll('input').forEach(i => i.value = '');
  });
  await page.type('input[placeholder="관리자 아이디"]', id);
  await page.type('input[placeholder="비밀번호"]', pw);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));
}

async function logout(page) {
  // Use fetch to POST to logout endpoint
  await page.evaluate(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  });
  await new Promise(r => setTimeout(r, 1000));
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // ====== Login Page ======
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1500));
  await capture(page, '00_login');

  // ====== Store Manager ======
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await login(page, 'suwon', 'store1234');
  console.log('>> Logged in as store manager');

  const storePages = [
    ['08_admin_store_dash', '/admin/store'],
    ['09_admin_store_orders', '/admin/store/orders'],
    ['10_admin_store_tables', '/admin/store/tables'],
    ['11_admin_store_games', '/admin/store/games'],
    ['12_admin_store_chat', '/admin/store/chat'],
    ['13_admin_store_menus', '/admin/store/menus'],
    ['14_admin_store_settings', '/admin/store/settings'],
  ];
  for (const [name, path_] of storePages) {
    try {
      await page.goto('http://localhost:3000' + path_, { waitUntil: 'networkidle2', timeout: 10000 });
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  // ====== HQ Admin ======
  await logout(page);
  await login(page, 'hq', 'admin1234');
  console.log('>> Logged in as HQ admin');

  const hqPages = [
    ['15_admin_hq_dash', '/admin/hq'],
    ['16_admin_hq_games', '/admin/hq/games'],
    ['17_admin_hq_menus', '/admin/hq/menus'],
    ['18_admin_hq_recommend', '/admin/hq/recommend'],
    ['19_admin_hq_events', '/admin/hq/events'],
    ['20_admin_hq_stores', '/admin/hq/stores'],
    ['21_admin_hq_tags', '/admin/hq/tags'],
  ];
  for (const [name, path_] of hqPages) {
    try {
      await page.goto('http://localhost:3000' + path_, { waitUntil: 'networkidle2', timeout: 10000 });
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  // ====== Customer (Table Session) ======
  await logout(page);
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click 테이블 tab
  const tabBtns = await page.$$('button[role="tab"], button');
  for (const btn of tabBtns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === '테이블') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Try to set up table session via API directly
  await page.evaluate(async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'table', storeId: 1, pin: '1234', tableNo: '31' })
    });
    const data = await res.json();
    console.log('Table login:', data);
  });
  await new Promise(r => setTimeout(r, 2000));

  // Navigate to customer pages
  const customerPages = [
    ['01_home', '/'],
    ['02_search', '/search'],
    ['03_order', '/order'],
    ['04_chat', '/chat'],
    ['05_info', '/info'],
    ['06_events', '/events'],
    ['07_kit', '/kit'],
  ];
  for (const [name, path_] of customerPages) {
    try {
      await page.goto('http://localhost:3000' + path_, { waitUntil: 'networkidle2', timeout: 10000 });
      await capture(page, name);
    } catch (e) { console.log('FAIL ' + name + ': ' + e.message); }
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
