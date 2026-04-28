import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * setup-agents.js (Centralized Version)
 * Universal linker for Antigravity Agents.
 * Automatically determines PROJECT_NAME from package.json and flattens
 * the tree structure from `_shared_agents/common` and the respective project.
 */

const BASE_DIR = '_shared_agents';
const AGENTS_DIR = '.agents';

// Find project name from package.json
let PROJECT_NAME;
try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    PROJECT_NAME = pkg.name;
    if (!PROJECT_NAME) throw new Error("No name field in package.json");
} catch (e) {
    console.error('❌ Could not auto-detect PROJECT_NAME. Ensure you run this from a directory with a valid package.json');
    process.exit(1);
}

console.log(`\n🚀 Setting up Antigravity Agents for: ${PROJECT_NAME} (Including Common)`);
console.log('---------------------------------------------------');

// 1. Ensure git submodule is initialized
try {
    console.log('📦 Syncing Git submodules...');
    execSync('git submodule update --init --recursive', { stdio: 'inherit' });
} catch (e) {
    console.warn('⚠️  Could not update submodules. Ensure you have git installed and internet access.');
}

// 2. Clean up existing .agents folder
if (fs.existsSync(AGENTS_DIR)) {
    console.log(`🧹 Removing existing ${AGENTS_DIR}...`);
    fs.rmSync(AGENTS_DIR, { recursive: true, force: true });
}

// 3. Create a real .agents directory
fs.mkdirSync(AGENTS_DIR);
console.log(`📂 Created real ${AGENTS_DIR} directory.`);

const categories = ['rules', 'skills', 'workflows'];
const sources = ['common', PROJECT_NAME];

// 4. Flatten and Link items
categories.forEach(category => {
    const targetCategoryPath = path.join(AGENTS_DIR, category);
    if (!fs.existsSync(targetCategoryPath)) {
        fs.mkdirSync(targetCategoryPath, { recursive: true });
    }

    sources.forEach(source => {
        const sourceCategoryPath = path.join(BASE_DIR, source, category);
        
        if (fs.existsSync(sourceCategoryPath)) {
            const items = fs.readdirSync(sourceCategoryPath);
            
            items.forEach(item => {
                const sourceItemPath = path.join(sourceCategoryPath, item);
                const targetItemPath = path.join(targetCategoryPath, item);
                
                if (fs.existsSync(targetItemPath)) {
                    console.warn(`⚠️  Conflict: ${targetItemPath} already exists. Skipping ${source}/${item}.`);
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

console.log(`\n📍 Setup complete. Your unified agents are ready in ${path.resolve(AGENTS_DIR)}!\n`);
