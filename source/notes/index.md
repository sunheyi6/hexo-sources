---
layout: page
title: 碎碎念
date: 2026-01-30 12:00:00
type: "notes"
lang: zh-cn
---

<div class="memos-container">
  <div class="memos-content">
    <!-- Notes content will be loaded from local JSON -->
    <div class="memos-loading">Loading...</div>
  </div>
</div>

<!-- Include markdown-it for Markdown rendering -->
<script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>
<!-- Include highlight.js for code syntax highlighting -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/atom-one-dark.min.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/languages/javascript.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/languages/python.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/languages/bash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/languages/json.min.js"></script>

<script>
// Initialize markdown-it
const md = window.markdownit({
  html: true,
  linkify: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
});

// Memos API Configuration (for image URL construction)
const MEMOS_CONFIG = {
  baseUrl: 'http://39.105.151.29:5230/api/v1',
  accessToken: '', // Leave empty for public access
  creatorId: 1, // User ID from Memos
  limit: 100, // Number of notes per request
  tag: '' // Optional tag filter
};

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Render tags
function renderTags(tags) {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => `<span class="memo-tag">${tag}</span>`).join(' ');
}

// Render images
function renderImages(resources) {
  if (!resources || resources.length === 0) {
    return '';
  }
  
  return resources
    .filter(r => r && r.type && r.type.startsWith('image/'))
    .map(resource => {
      // Use absolute URL for images
      let imageUrl = resource.url || '';
      
      // Handle different URL formats
      if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative path
        if (imageUrl.startsWith('/')) {
          // Absolute path relative to domain
          imageUrl = `${MEMOS_CONFIG.baseUrl.replace('/api/v1', '')}${imageUrl}`;
        } else {
          // Relative path
          imageUrl = `${MEMOS_CONFIG.baseUrl.replace('/api/v1', '')}/${imageUrl}`;
        }
      }
      
      // Ensure the URL is properly encoded
      try {
        if (imageUrl) {
          imageUrl = encodeURI(imageUrl);
        }
      } catch (e) {
        console.error('Error encoding image URL:', e);
      }
      
      const filename = resource.filename || 'Image';
      
      return imageUrl ? `<img src="${imageUrl}" class="memo-image" alt="${filename}" loading="lazy">` : '';
    })
    .join('');
}

// Render memo with Markdown support
function renderMemo(memo) {
  // Render markdown content
  const renderedContent = md.render(memo.content);
  
  // Use resourceList instead of resources
  const resources = memo.resourceList || memo.resources || [];
  const tags = memo.tags || [];
  
  return `
    <div class="memo-item">
      <div class="memo-time">${formatTime(memo.createdTs)}</div>
      <div class="memo-content">
        ${renderedContent}
        ${renderImages(resources)}
      </div>
      <div class="memo-tags">
        ${renderTags(tags)}
      </div>
    </div>
  `;
}

// Load memos from local JSON
async function loadMemos() {
  const container = document.querySelector('.memos-content');
  const loading = document.querySelector('.memos-loading');
  
  console.log('Loading memos...');
  console.log('Container:', container);
  console.log('Loading:', loading);
  
  if (!container || !loading) {
    console.error('Container or loading element not found');
    return;
  }
  
  try {
    // Show loading
    loading.style.display = 'block';
    
    // Fetch from local JSON file
    console.log('Fetching memos.json...');
    const response = await fetch('/_data/memos.json');
    console.log('Response:', response);
    
    if (!response.ok) {
      throw new Error(`Error fetching local memos: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Data:', data);
    
    const memos = data.memos || [];
    
    console.log(`Loaded ${memos.length} memos from local JSON`);
    
    if (memos.length === 0) {
      container.innerHTML = '<div class="memos-error"><h3>暂无数据</h3><p>没有找到任何memos记录</p></div>';
      return;
    }
    
    // Render memos
    const memosHtml = memos.map(renderMemo).join('');
    
    container.innerHTML = `
      <div class="memos-list">
        ${memosHtml}
      </div>
      <div class="memos-footer">
        <button id="refresh-memos" class="memo-button">刷新</button>
        <p class="memos-hint">数据来自本地JSON文件，最后同步时间：${new Date(data.lastSync).toLocaleString('zh-CN')}</p>
      </div>
    `;
    
    // Add refresh button event
    document.getElementById('refresh-memos').addEventListener('click', loadMemos);
    
    // Apply syntax highlighting to code blocks
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
    
  } catch (error) {
    console.error('Error loading memos:', error);
    
    container.innerHTML = `
      <div class="memos-error">
        <h3>加载失败</h3>
        <p>无法加载本地memos数据，请检查同步脚本是否正常运行</p>
        <pre>${error.message}</pre>
      </div>
    `;
  } finally {
    loading.style.display = 'none';
  }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', loadMemos);

// Also initialize on PJAX events (for page navigation without full reload)
document.addEventListener('pjax:complete', loadMemos);
document.addEventListener('pjax:end', loadMemos);
document.addEventListener('pjax:success', loadMemos);
document.addEventListener('pjax:ready', loadMemos);
document.addEventListener('DOMNodeInserted', function(e) {
  if (e.target && e.target.classList && e.target.classList.contains('memos-content')) {
    loadMemos();
  }
});
</script>
