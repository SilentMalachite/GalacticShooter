#!/usr/bin/env node

// Electron launcher for Galaga game (CommonJS)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('ギャラガ風シューティングゲーム - Electronランチャー');
console.log('======================================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error(`Node.js 16.0.0以上が必要です。現在のバージョン: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✓ Node.js ${nodeVersion} 検出`);

// Check required files
const requiredFiles = ['galaga-game.html', 'game.js', 'game.css'];
const electronFiles = ['electron-main.js', 'electron-simple.js'];

const missingGameFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingGameFiles.length > 0) {
    console.error('ゲームファイルが見つかりません:', missingGameFiles.join(', '));
    process.exit(1);
}

const availableElectronFile = electronFiles.find(file => fs.existsSync(file));
if (!availableElectronFile) {
    console.error('Electronメインファイルが見つかりません');
    process.exit(1);
}

console.log(`✓ 必要なファイルを確認`);
console.log(`✓ Electronファイル: ${availableElectronFile}`);

// Function to install Electron if needed
function installElectron() {
    return new Promise((resolve, reject) => {
        console.log('Electronをインストール中...');
        
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const install = spawn(npm, ['install', 'electron'], {
            stdio: 'inherit',
            shell: true
        });

        install.on('close', (code) => {
            if (code === 0) {
                console.log('✓ Electronインストール完了');
                resolve();
            } else {
                reject(new Error(`npm install failed with code ${code}`));
            }
        });

        install.on('error', (err) => {
            reject(err);
        });
    });
}

// Function to start Electron
function startElectron() {
    return new Promise((resolve, reject) => {
        console.log('Electronアプリを起動中...');
        
        let electronCmd;
        
        // Try different ways to run electron
        if (fs.existsSync('node_modules/.bin/electron') || fs.existsSync('node_modules\\.bin\\electron.cmd')) {
            electronCmd = path.join('node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
        } else {
            electronCmd = 'npx';
        }

        const args = electronCmd === 'npx' ? ['electron', availableElectronFile] : [availableElectronFile];
        
        const app = spawn(electronCmd, args, {
            stdio: 'inherit',
            shell: true
        });

        app.on('close', (code) => {
            console.log(`アプリケーション終了 (コード: ${code})`);
            resolve();
        });

        app.on('error', (err) => {
            console.error('起動エラー:', err.message);
            reject(err);
        });
    });
}

// Main execution
async function main() {
    try {
        // Check if electron is available
        let electronAvailable = false;
        
        try {
            require.resolve('electron');
            electronAvailable = true;
            console.log('✓ Electron利用可能');
        } catch (e) {
            console.log('Electronが見つかりません、インストールします...');
        }

        // Install electron if not available
        if (!electronAvailable) {
            await installElectron();
        }

        // Start the application
        await startElectron();

    } catch (error) {
        console.error('\nエラーが発生しました:', error.message);
        console.log('\n手動での対処法:');
        console.log('1. npm install electron');
        console.log(`2. npx electron ${availableElectronFile}`);
        console.log('\nまたは、Webブラウザで galaga-game.html を直接開いてください');
        process.exit(1);
    }
}

// Run if this script is executed directly
if (require.main === module) {
    main();
}