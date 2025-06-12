const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Setup script for Electron application
class ElectronSetup {
    constructor() {
        this.requiredFiles = [
            'galaga-game.html',
            'game.js', 
            'game.css',
            'electron-main.js'
        ];
        this.optionalFiles = [
            'generated-icon.png'
        ];
    }

    checkFiles() {
        console.log('ファイルの存在確認中...');
        
        const missingRequired = this.requiredFiles.filter(file => 
            !fs.existsSync(path.join(__dirname, file))
        );
        
        if (missingRequired.length > 0) {
            console.error('必須ファイルが見つかりません:', missingRequired);
            return false;
        }

        const missingOptional = this.optionalFiles.filter(file => 
            !fs.existsSync(path.join(__dirname, file))
        );
        
        if (missingOptional.length > 0) {
            console.warn('オプションファイルが見つかりません:', missingOptional);
        }

        console.log('✓ 必要なファイルが揃っています');
        return true;
    }

    checkNodeVersion() {
        console.log('Node.jsバージョンを確認中...');
        
        const version = process.version;
        const majorVersion = parseInt(version.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            console.error(`Node.js 16.0.0以上が必要です。現在のバージョン: ${version}`);
            return false;
        }
        
        console.log(`✓ Node.js ${version} が利用可能です`);
        return true;
    }

    installDependencies() {
        return new Promise((resolve, reject) => {
            console.log('依存関係をインストール中...');
            
            // Check if electron is already installed
            try {
                require.resolve('electron');
                console.log('✓ Electronは既にインストールされています');
                resolve();
                return;
            } catch (e) {
                // Electron not found, install it
            }

            const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const install = spawn(npm, ['install', 'electron', 'electron-builder'], {
                stdio: 'inherit',
                cwd: __dirname
            });

            install.on('close', (code) => {
                if (code === 0) {
                    console.log('✓ 依存関係のインストールが完了しました');
                    resolve();
                } else {
                    console.error('依存関係のインストールに失敗しました');
                    reject(new Error(`npm install failed with code ${code}`));
                }
            });

            install.on('error', (err) => {
                console.error('npmコマンドの実行に失敗しました:', err.message);
                reject(err);
            });
        });
    }

    startElectron() {
        return new Promise((resolve, reject) => {
            console.log('Electronアプリケーションを起動中...');
            
            try {
                const electronPath = require('electron');
                const app = spawn(electronPath, ['electron-main.js'], {
                    stdio: 'inherit',
                    cwd: __dirname
                });

                app.on('close', (code) => {
                    console.log(`アプリケーションが終了しました (終了コード: ${code})`);
                    resolve();
                });

                app.on('error', (err) => {
                    console.error('アプリケーションの起動に失敗しました:', err.message);
                    reject(err);
                });

            } catch (err) {
                console.error('Electronが見つかりません:', err.message);
                reject(err);
            }
        });
    }

    async run() {
        try {
            console.log('=== ギャラガ風シューティングゲーム - Electronセットアップ ===\n');
            
            // Check Node.js version
            if (!this.checkNodeVersion()) {
                process.exit(1);
            }

            // Check required files
            if (!this.checkFiles()) {
                process.exit(1);
            }

            // Install dependencies
            await this.installDependencies();

            // Start Electron app
            await this.startElectron();

        } catch (error) {
            console.error('\nセットアップエラー:', error.message);
            console.log('\nトラブルシューティング:');
            console.log('1. Node.js 16.0.0以上がインストールされているか確認してください');
            console.log('2. 必要なファイルが同じディレクトリにあるか確認してください');
            console.log('3. インターネット接続を確認してください');
            process.exit(1);
        }
    }
}

// Run setup if this script is executed directly
if (require.main === module) {
    const setup = new ElectronSetup();
    setup.run();
}

module.exports = ElectronSetup;