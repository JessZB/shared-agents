import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * setup-agents.js (Centralized Version)
 * Universal linker for Antigravity Agents.
 * Automatically determines PROJECT_NAME from the nearest package.json
 * and flattens the tree structure from `_shared_agents/common` and the respective project.
 */

// Function to find the nearest root directory with a package.json
function findProjectRoot(currentDir) {
  const rootPath = path.parse(currentDir).root;
  let dir = currentDir;
  
  while (dir !== rootPath) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

const rootDir = findProjectRoot(process.cwd());

if (!rootDir) {
  console.error('❌ Could not auto-detect the project root. Ensure you run this from within a project directory containing a package.json.');
  process.exit(1);
}

// Find project name from package.json
let PROJECT_NAME;
try {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  PROJECT_NAME = pkg.name;
  if (!PROJECT_NAME) throw new Error('No name field in package.json');
} catch (e) {
  console.error('❌ Could not parse package.json or missing "name" field.');
  process.exit(1);
}

console.log(`\n🚀 Setting up Antigravity Agents for: ${PROJECT_NAME} (Including Common)`);
console.log('---------------------------------------------------');

// Define core paths intelligently based on the discovered root
const BASE_DIR = path.join(rootDir, '_shared_agents');
const AGENTS_DIR = path.join(rootDir, '.agents');

// 1. Ensure git submodule is initialized
try {
  console.log('📦 Syncing Git submodules...');
  if (fs.existsSync(path.join(rootDir, '.git'))) {
    execSync('git submodule update --init --recursive', { stdio: 'inherit', cwd: rootDir });
  } else {
    console.warn('⚠️  Not a git repository, skipping submodule sync.');
  }
} catch (e) {
  console.warn(`⚠️  Could not update submodules. Ensure you have git installed and internet access: ${e.message}`);
}

// 2. Clean up existing .agents folder
if (fs.existsSync(AGENTS_DIR)) {
  console.log(`🧹 Removing existing .agents directory...`);
  fs.rmSync(AGENTS_DIR, { recursive: true, force: true });
}

// 3. Create a real .agents directory
fs.mkdirSync(AGENTS_DIR);
console.log(`📂 Created real .agents directory at project root.`);

const categories = ['rules', 'skills', 'workflows'];
const sources = ['common', PROJECT_NAME];

// 4. Flatten and Link items
categories.forEach(category => {
  const targetCategoryPath = path.join(AGENTS_DIR, category);
  
  sources.forEach(source => {
    const sourceCategoryPath = path.join(BASE_DIR, source, category);
    
    if (fs.existsSync(sourceCategoryPath)) {
      if (!fs.existsSync(targetCategoryPath)) {
        fs.mkdirSync(targetCategoryPath, { recursive: true });
      }

      const items = fs.readdirSync(sourceCategoryPath);
      
      items.forEach(item => {
        const sourceItemPath = path.join(sourceCategoryPath, item);
        const targetItemPath = path.join(targetCategoryPath, item);
        
        if (fs.existsSync(targetItemPath)) {
          console.warn(`⚠️  Conflict: ${item} already exists in ${category}. Skipping from ${source}.`);
          return;
        }

        try {
          const absSource = path.resolve(sourceItemPath);
          const absTarget = path.resolve(targetItemPath);
          const stats = fs.lstatSync(sourceItemPath);
          
          if (stats.isDirectory()) {
            const typeDir = process.platform === 'win32' ? 'junction' : 'dir';
            fs.symlinkSync(absSource, absTarget, typeDir);
          } else {
            if (process.platform === 'win32') {
              fs.linkSync(absSource, absTarget);
            } else {
              fs.symlinkSync(absSource, absTarget, 'file');
            }
          }
          console.log(`✅ Linked ${category}/${item} (from ${source})`);
        } catch (e) {
          console.error(`❌ Failed to link ${category}/${item}: ${e.message}`);
        }
      });
    }
  });
});

console.log(`\n📍 Setup complete. Your unified agents are ready in ${AGENTS_DIR}!\n`);
