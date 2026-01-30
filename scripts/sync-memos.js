/**
 * Memos Sync Script
 * Syncs memos from Memos API to local JSON file with incremental sync and image download
 * Optimized for static site deployment (GitHub Pages + Vercel)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Memos API Configuration
const MEMOS_CONFIG = {
  baseUrl: 'http://39.105.151.29:5230/api/v1',
  accessToken: '', // Leave empty for public access
  creatorId: 1, // User ID from Memos
  limit: 100, // Number of notes per request
  tag: '' // Optional tag filter
};

// Output directories for JSON file
const SOURCE_OUTPUT_DIR = path.join(__dirname, '../source/_data');
const SOURCE_OUTPUT_FILE = path.join(SOURCE_OUTPUT_DIR, 'memos.json');
const PUBLIC_OUTPUT_DIR = path.join(__dirname, '../public/_data');
const PUBLIC_OUTPUT_FILE = path.join(PUBLIC_OUTPUT_DIR, 'memos.json');

// Image storage directory
const IMAGE_STORAGE_DIR = path.join(__dirname, '../source/images/memos');
const IMAGE_PUBLIC_PATH = '/images/memos';

/**
 * Get last sync timestamp from existing data
 */
function getLastSyncTimestamp() {
  try {
    if (fs.existsSync(SOURCE_OUTPUT_FILE)) {
      const existingData = JSON.parse(fs.readFileSync(SOURCE_OUTPUT_FILE, 'utf8'));
      if (existingData.lastSync) {
        return Math.floor(new Date(existingData.lastSync).getTime() / 1000);
      }
    }
  } catch (error) {
    console.error('Error reading last sync timestamp:', error);
  }
  return 0;
}

/**
 * Download image and save to local
 */
async function downloadImage(url, memoId, timestamp) {
  try {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Create directory structure
    const imageDir = path.join(IMAGE_STORAGE_DIR, year.toString(), month, day);
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    
    // Get filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${memoId}_${Date.now()}_${safeFilename}`;
    const savePath = path.join(imageDir, uniqueFilename);
    
    // Download image
    const buffer = await downloadUrl(url);
    
    // Save image to local
    fs.writeFileSync(savePath, buffer);
    
    console.log(`Downloaded image: ${url} -> ${savePath}`);
    
    // Return relative public path
    return `${IMAGE_PUBLIC_PATH}/${year}/${month}/${day}/${uniqueFilename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    return url; // Return original URL if download fails
  }
}

/**
 * Process images in memo
 */
async function processImages(memo) {
  if (!memo.resourceList || memo.resourceList.length === 0) {
    return memo;
  }
  
  const processedMemo = { ...memo };
  processedMemo.resourceList = [];
  
  for (const resource of memo.resourceList) {
    if (resource.type && resource.type.startsWith('image/') && resource.url) {
      const localImagePath = await downloadImage(resource.url, memo.id, memo.createdTs);
      processedMemo.resourceList.push({
        ...resource,
        url: localImagePath
      });
      
      // Also replace image URLs in content
      if (processedMemo.content) {
        processedMemo.content = processedMemo.content.replace(new RegExp(resource.url, 'g'), localImagePath);
      }
    } else {
      processedMemo.resourceList.push(resource);
    }
  }
  
  return processedMemo;
}

/**
 * Fetch data from URL using http/https module
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          async json() {
            try {
              return JSON.parse(data);
            } catch (error) {
              throw new Error(`Error parsing JSON: ${error.message}`);
            }
          },
          async text() {
            return data;
          }
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Download image using http/https module
 */
function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const chunks = [];
    
    const req = protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Fetch data from Memos API with incremental sync
 */
async function fetchMemos() {
  console.log('Fetching memos from Memos API...');
  
  // Get last sync timestamp
  const lastSyncTimestamp = getLastSyncTimestamp();
  console.log(`Last sync timestamp: ${lastSyncTimestamp}`);
  
  // Build API endpoint with startTs for incremental sync
  let endpoint = `${MEMOS_CONFIG.baseUrl}/memo?creatorId=${MEMOS_CONFIG.creatorId}&limit=${MEMOS_CONFIG.limit}`;
  if (lastSyncTimestamp > 0) {
    endpoint += `&startTs=${lastSyncTimestamp}`;
  }
  if (MEMOS_CONFIG.tag) {
    endpoint += `&tag=${encodeURIComponent(MEMOS_CONFIG.tag)}`;
  }
  
  console.log(`Fetching from: ${endpoint}`);
  
  try {
    const response = await fetchUrl(endpoint);
    if (!response.ok) {
      throw new Error(`Error fetching memos: ${response.status} ${response.statusText}`);
    }
    
    const memos = await response.json();
    console.log(`Fetched ${memos.length} new memos`);
    
    // Process images for each memo
    const processedMemos = [];
    for (const memo of memos) {
      const processedMemo = await processImages(memo);
      processedMemos.push(processedMemo);
    }
    
    return processedMemos;
  } catch (error) {
    console.error('Error fetching memos:', error);
    throw error;
  }
}

/**
 * Save memos to local JSON file with incremental sync
 */
async function saveMemos(newMemos) {
  console.log('Saving memos to local JSON file...');
  
  // Read existing memos if file exists
  let existingMemos = [];
  try {
    if (fs.existsSync(SOURCE_OUTPUT_FILE)) {
      const existingData = JSON.parse(fs.readFileSync(SOURCE_OUTPUT_FILE, 'utf8'));
      existingMemos = existingData.memos || [];
      console.log(`Found ${existingMemos.length} existing memos`);
    }
  } catch (error) {
    console.error('Error reading existing memos:', error);
    existingMemos = [];
  }
  
  // Merge new memos with existing ones
  // Use a Set to avoid duplicates based on memo ID
  const memoMap = new Map();
  
  // Add existing memos to map
  for (const memo of existingMemos) {
    if (memo.id) {
      memoMap.set(memo.id, memo);
    }
  }
  
  // Add new memos to map (will overwrite existing ones with same ID)
  for (const memo of newMemos) {
    if (memo.id) {
      memoMap.set(memo.id, memo);
    }
  }
  
  // Convert map back to array and sort by createdTs descending
  const mergedMemos = Array.from(memoMap.values())
    .sort((a, b) => b.createdTs - a.createdTs);
  
  console.log(`Merged ${mergedMemos.length} total memos`);
  
  // Add timestamp for last sync
  const data = {
    lastSync: new Date().toISOString(),
    memos: mergedMemos
  };
  
  const jsonData = JSON.stringify(data, null, 2);
  
  // Ensure source output directory exists
  if (!fs.existsSync(SOURCE_OUTPUT_DIR)) {
    fs.mkdirSync(SOURCE_OUTPUT_DIR, { recursive: true });
    console.log(`Created source output directory: ${SOURCE_OUTPUT_DIR}`);
  }
  
  // Write to source JSON file
  fs.writeFileSync(SOURCE_OUTPUT_FILE, jsonData);
  console.log(`Saved memos to ${SOURCE_OUTPUT_FILE}`);
  
  // Ensure public output directory exists
  if (!fs.existsSync(PUBLIC_OUTPUT_DIR)) {
    fs.mkdirSync(PUBLIC_OUTPUT_DIR, { recursive: true });
    console.log(`Created public output directory: ${PUBLIC_OUTPUT_DIR}`);
  }
  
  // Write to public JSON file
  fs.writeFileSync(PUBLIC_OUTPUT_FILE, jsonData);
  console.log(`Saved memos to ${PUBLIC_OUTPUT_FILE}`);
}

/**
 * Main function
 */
async function main() {
  try {
    const memos = await fetchMemos();
    await saveMemos(memos);
    console.log('Memos sync completed successfully!');
  } catch (error) {
    console.error('Error syncing memos:', error);
    process.exit(1);
  }
}

// Run main function if script is executed directly
if (require.main === module) {
  main();
}

module.exports = { fetchMemos, saveMemos, main };
