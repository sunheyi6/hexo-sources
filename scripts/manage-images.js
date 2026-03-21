/**
 * Hexo 图片管理脚本
 * 功能：
 * 1. 扫描 _posts 目录下的图片文件
 * 2. 按日期自动分类移动到 source/images/年月/ 目录
 * 3. 自动重命名为日期格式（如 2026-03-20.png, 2026-03-20-1.png）
 * 4. 更新 Markdown 文件中的图片引用路径
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  postsDir: path.join(__dirname, '../source/_posts'),
  imagesDir: path.join(__dirname, '../source/images'),
  imageExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'],
};

/**
 * 获取今天的日期字符串
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return { year, month, day, dateStr: `${year}-${month}-${day}` };
}

/**
 * 获取指定目录下的所有图片文件
 */
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.imageExtensions.includes(ext);
  });
}

/**
 * 获取指定目录下的所有 Markdown 文件
 */
function getMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.md'));
}

/**
 * 检查文件名是否已经是日期格式
 */
function isDateFormatFilename(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  // 匹配格式：2026-03-20 或 2026-03-20-1
  return /^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(nameWithoutExt);
}

/**
 * 生成新的文件名
 */
function generateNewFilename(ext, imagesDir) {
  const { year, month, day, dateStr } = getTodayString();
  const targetDir = path.join(imagesDir, String(year), String(month));
  
  // 确保目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 检查当天已有的图片数量
  let counter = 0;
  let newFilename = `${dateStr}${ext}`;
  let newPath = path.join(targetDir, newFilename);
  
  while (fs.existsSync(newPath)) {
    counter++;
    newFilename = `${dateStr}-${counter}${ext}`;
    newPath = path.join(targetDir, newFilename);
  }
  
  return {
    filename: newFilename,
    fullPath: newPath,
    relativePath: `/images/${year}/${month}/${newFilename}`,
    targetDir
  };
}

/**
 * 移动图片到目标目录
 */
function moveImage(sourcePath, targetPath) {
  fs.renameSync(sourcePath, targetPath);
  console.log(`  移动: ${path.basename(sourcePath)} -> ${targetPath}`);
}

/**
 * 更新 Markdown 文件中的图片引用
 */
function updateMarkdownReferences(mdPath, oldName, newRelativePath) {
  let content = fs.readFileSync(mdPath, 'utf8');
  const oldPatterns = [
    new RegExp(`!\\[(.*?)\\]\\(${oldName}\\)`, 'g'),
    new RegExp(`!\\[(.*?)\\]\\(./${oldName}\\)`, 'g'),
    new RegExp(`src="${oldName}"`, 'g'),
    new RegExp(`src='${oldName}'`, 'g'),
  ];
  
  let updated = false;
  oldPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match, alt) => {
        if (match.startsWith('![')) {
          return `![${alt}](${newRelativePath})`;
        } else {
          return match.replace(oldName, newRelativePath);
        }
      });
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(mdPath, content, 'utf8');
    console.log(`  更新引用: ${path.basename(mdPath)}`);
    return true;
  }
  return false;
}

/**
 * 处理单个 Markdown 文件的图片
 */
function processMarkdownFile(mdPath, imagesDir) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const mdDir = path.dirname(mdPath);
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let updated = false;
  let newContent = content;
  
  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, alt, imagePath] = match;
    
    // 只处理相对路径的图片（不以 http 开头）
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      continue;
    }
    
    const imageName = path.basename(imagePath);
    const imageFullPath = path.join(mdDir, imagePath);
    
    // 检查图片是否存在
    if (!fs.existsSync(imageFullPath)) {
      console.log(`  警告: 图片不存在 ${imagePath}`);
      continue;
    }
    
    // 如果已经是日期格式且已经在 images 目录，跳过
    if (isDateFormatFilename(imageName) && imagePath.includes('/images/')) {
      continue;
    }
    
    // 生成新的文件名和路径
    const ext = path.extname(imageName);
    const newFileInfo = generateNewFilename(ext, imagesDir);
    
    // 移动图片
    moveImage(imageFullPath, newFileInfo.fullPath);
    
    // 更新 Markdown 内容
    newContent = newContent.replace(fullMatch, `![${alt}](${newFileInfo.relativePath})`);
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(mdPath, newContent, 'utf8');
    console.log(`  已更新: ${path.basename(mdPath)}`);
    return true;
  }
  return false;
}

/**
 * 整理 _posts 目录下的零散图片
 */
function organizeLooseImages() {
  console.log('\n📁 整理 _posts 目录下的零散图片...\n');
  
  const imageFiles = getImageFiles(CONFIG.postsDir);
  
  if (imageFiles.length === 0) {
    console.log('  没有找到需要整理的图片\n');
    return;
  }
  
  console.log(`  发现 ${imageFiles.length} 个图片文件:\n`);
  
  const mdFiles = getMarkdownFiles(CONFIG.postsDir);
  
  imageFiles.forEach(imageFile => {
    const imagePath = path.join(CONFIG.postsDir, imageFile);
    const ext = path.extname(imageFile);
    
    // 生成新的文件名
    const newFileInfo = generateNewFilename(ext, CONFIG.imagesDir);
    
    // 移动图片
    moveImage(imagePath, newFileInfo.fullPath);
    
    // 更新所有 Markdown 文件中的引用
    let referenced = false;
    mdFiles.forEach(mdFile => {
      const mdPath = path.join(CONFIG.postsDir, mdFile);
      if (updateMarkdownReferences(mdPath, imageFile, newFileInfo.relativePath)) {
        referenced = true;
      }
    });
    
    if (!referenced) {
      console.log(`  ⚠️  警告: ${imageFile} 未被任何文章引用`);
    }
  });
  
  console.log('\n✅ 零散图片整理完成\n');
}

/**
 * 处理所有 Markdown 文件中的图片引用
 */
function processAllMarkdownFiles() {
  console.log('\n📝 处理 Markdown 文件中的图片引用...\n');
  
  const mdFiles = getMarkdownFiles(CONFIG.postsDir);
  let processedCount = 0;
  
  mdFiles.forEach(mdFile => {
    const mdPath = path.join(CONFIG.postsDir, mdFile);
    console.log(`处理: ${mdFile}`);
    if (processMarkdownFile(mdPath, CONFIG.imagesDir)) {
      processedCount++;
    }
  });
  
  console.log(`\n✅ 处理了 ${processedCount} 个文件\n`);
}

/**
 * 创建 VS Code 粘贴图片的配置说明
 */
function showVscodeConfig() {
  console.log('\n💡 VS Code 粘贴图片配置建议:\n');
  console.log('  推荐安装插件: Paste Image (mushan.vscode-paste-image)');
  console.log('  然后在 settings.json 中添加以下配置:\n');
  console.log(`  {
    "pasteImage.path": "\${projectRoot}/source/images/\${currentFileYear}/\${currentFileMonth}",
    "pasteImage.namePrefix": "\${currentFileDate}-",
    "pasteImage.insertPattern": "![\${imageFileName}](\${imageFilePath})"
  }\n`);
  console.log('  注意: 这个插件需要配合自定义脚本来实现完全自动化的年月分类\n');
}

/**
 * 主函数
 */
function main() {
  const command = process.argv[2];
  
  console.log('\n🚀 Hexo 图片管理工具\n');
  
  switch (command) {
    case 'organize':
      // 只整理 _posts 目录下的零散图片
      organizeLooseImages();
      break;
      
    case 'process':
      // 只处理 Markdown 文件中的图片引用
      processAllMarkdownFiles();
      break;
      
    case 'all':
    default:
      // 执行全部操作
      organizeLooseImages();
      processAllMarkdownFiles();
      break;
  }
  
  showVscodeConfig();
  console.log('✨ 完成!\n');
}

// 运行主函数
main();
