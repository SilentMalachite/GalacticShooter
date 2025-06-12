#!/usr/bin/env node

// Quick start script for Galaga Electron app
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('ギャラガ風シューティングゲーム - クイックスタート');

// Check if files exist
const requiredFiles = ['galaga-game.html', 'game.js', 'game.css'];
const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length > 0) {
    console.error('必要なファイルが見つかりません:', missing.join(', '));
    process.exit(1);
}

// Try to run with npx electron directly
console.log('Electronで起動中...');

const args = fs.existsSync('electron-simple.js') ? ['electron-simple.js'] : ['electron-main.js'];
const electronProcess = spawn('npx', ['electron', ...args], {
    stdio: 'inherit',
    shell: true
});

electronProcess.on('error', (error) => {
    console.error('起動エラー:', error.message);
    console.log('\n手動でのインストールが必要な場合:');
    console.log('npm install electron');
    console.log('npx electron electron-simple.js');
});

electronProcess.on('close', (code) => {
    if (code !== 0) {
        console.log(`\n終了コード: ${code}`);
    }
});