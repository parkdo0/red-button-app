import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
  const stores = await p.store.count();
  const tables = await p.table.count();
  const games = await p.game.count();
  const menus = await p.menu.count();
  const orders = await p.order.count();
  const tags = await p.tag.count();
  const sessions = await p.tableSession.count();
  const chats = await p.chatMessage.count();
  const events = await p.event.count();
  console.log({stores, tables, games, menus, orders, tags, sessions, chats, events});
  await p.$disconnect();
}
run();
