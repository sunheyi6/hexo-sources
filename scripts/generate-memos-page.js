/**
 * Generate the "碎碎念" (notes) page as fully static HTML at build time.
 *
 * Memos data comes from source/_data/memos.json (synced by scripts/sync-memos.js).
 * Everything is baked into the generated HTML, so the page needs NO runtime fetch
 * and works identically on any static host (local server, GitHub Pages, Vercel...).
 *
 * In hexo generators, the `locals` object includes `data` (from source/_data),
 * confirmed reachable as locals.data.memos.memos.
 */
function formatTime(unixSeconds) {
  const d = new Date((unixSeconds || 0) * 1000);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

hexo.extend.generator.register('memos-page', function (locals) {
  const data = locals.data && locals.data.memos;
  const memos = data && Array.isArray(data.memos) ? data.memos : [];

  const items = memos.map((memo) => {
    const contentHtml = hexo.render.renderSync({
      text: memo.content || '',
      engine: 'markdown'
    });
    const time = formatTime(memo.displayTs || memo.createdTs);
    return [
      '<div class="memo-item">',
      `  <div class="memo-time">${time}</div>`,
      `  <div class="memo-content">${contentHtml}</div>`,
      '</div>'
    ].join('\n');
  }).join('\n');

  const content = [
    '<div class="memos-container">',
    '  <div class="memos-content">',
    items
      ? `    <div class="memos-list">\n${items}\n    </div>\n` +
        `    <div class="memos-footer"><p class="memos-hint">共 ${memos.length} 条 · 数据同步自 Memos</p></div>`
      : '    <div class="memos-error"><h3>暂无数据</h3><p>还没有任何说说记录，先同步一下 memos 吧。</p></div>',
    '  </div>',
    '</div>'
  ].join('\n');

  return {
    path: 'notes/index.html',
    layout: ['page'],
    data: {
      title: '碎碎念',
      lang: 'zh-cn',
      content,
      type: 'notes'
    }
  };
});