/**
 * Copy memos data to public directory after generate
 * Ensures /_data/memos.json exists for the notes (碎碎念) page in every build,
 * including local `hexo server` / `hexo generate` and CI deployments.
 * (hexo generate does NOT copy source/_data/memos.json to public/_data)
 *
 * Note: hexo's script loader injects `hexo` as an in-scope variable and executes
 * the file body directly (see hexo/dist/hexo/index.js loadPlugin), so filters
 * must be registered at top level.
 */
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('after_generate', function () {
  const src = path.join(hexo.source_dir, '_data', 'memos.json');
  const destDir = path.join(hexo.public_dir, '_data');
  const dest = path.join(destDir, 'memos.json');

  if (!fs.existsSync(src)) {
    hexo.log.warn('copy-memos: source/_data/memos.json not found, skip copy');
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  hexo.log.info('copy-memos: copied _data/memos.json to public/_data/memos.json');
});