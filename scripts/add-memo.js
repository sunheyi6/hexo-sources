/**
 * Add memo(s) to source/_data/memos.json
 *
 * Usage:
 *   node scripts/add-memo.js "今天天气挺好，骑车上班贼舒服"
 *   node scripts/add-memo.js "第一条" "第二条" "第三条"
 *
 * Each positional argument becomes one memo. New entries reuse the exact
 * same fields as synced ones (creator 流殃/shy), ids increment by 1 from the
 * current max id, timestamps use the current Unix time, and the list is
 * sorted by createdTs descending (newest first) like scripts/sync-memos.js.
 *
 * Notes:
 * - Locally added memos are NOT pushed back to the Memos server; the
 *   incremental sync (scripts/sync-memos.js) only pulls new remote memos
 *   and never overwrites/removes local ids.
 * - The 碎碎念 page (/notes/) is rendered at build time from this file
 *   by scripts/generate-memos-page.js — no extra step needed.
 */
const fs = require('fs');
const path = require('path');

// IMPORTANT: hexo auto-loads every .js under scripts/ as a plugin via
// runInThisContext (lib/hexo/index.js loadPlugin), injecting a `hexo` variable.
// So ONLY a direct `node scripts/add-memo.js "..."` run has no `hexo` variable
// AND require.main === module — that is the case in which we execute.
if (typeof hexo === 'undefined' && require.main === module) {
  main();
}

function main() {
  const contents = process.argv.slice(2).filter((s) => s.trim() !== '');
  if (contents.length === 0) {
    console.error('用法: node scripts/add-memo.js "<内容>" [更多内容...]');
    process.exit(1);
  }

  let data = { lastSync: null, memos: [] };
  if (fs.existsSync(FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch (err) {
      console.error('解析 memos.json 失败:', err.message);
      process.exit(1);
    }
  }
  if (!Array.isArray(data.memos)) data.memos = [];

  const now = Math.floor(Date.now() / 1000);
  let nextId = data.memos.length
    ? Math.max(...data.memos.map((m) => m.id || 0)) + 1
    : 1;

  const addedIds = [];
  for (const content of contents) {
    addedIds.push(nextId);
    data.memos.push({
      id: nextId++,
      rowStatus: 'NORMAL',
      creatorId: 1,
      createdTs: now,
      updatedTs: now,
      displayTs: now,
      content,
      visibility: 'PUBLIC',
      pinned: false,
      parent: null,
      creatorName: '流殃',
      creatorUsername: 'shy',
      resourceList: [],
      relationList: []
    });
  }

  // Keep newest first, same as scripts/sync-memos.js
  data.memos.sort((a, b) => b.createdTs - a.createdTs);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

  for (let i = 0; i < contents.length; i++) {
    console.log(`✓ id=${addedIds[i]} 已添加: ${contents[i]}`);
  }
  console.log(`当前共 ${data.memos.length} 条 memo`);
}