# Electronアプリセットアップガイド

## 完了したElectron対応

✅ **実装済み機能:**
- Electronメインプロセス (`electron-main.js`)
- 簡単起動版 (`electron-simple.js`) 
- 自動セットアップスクリプト (`electron-launcher.cjs`)
- Windows用バッチファイル (`start-electron.bat`)
- Linux/Mac用シェルスクリプト (`start-electron.sh`)
- ビルド設定 (`electron-package.json`)

## 動作確認済み設定

### セキュリティ設定
```javascript
webPreferences: {
    nodeIntegration: false,     // セキュリティ強化
    contextIsolation: true,     // コンテキスト分離
    webSecurity: false          // ローカルファイル読み込み許可
}
```

### オーディオ対応
- Electronでの音声コンテキスト自動再開
- ブラウザ制限回避コード実装

### UI最適化
- 日本語メニュー完全対応
- キーボードショートカット
- ウィンドウサイズとアイコン設定

## 起動方法

### 推奨方法 1: ランチャースクリプト
```bash
node electron-launcher.cjs
```

### 推奨方法 2: プラットフォーム別スクリプト
**Windows:**
```cmd
start-electron.bat
```

**Linux/Mac:**
```bash
./start-electron.sh
```

### 手動起動
```bash
# 依存関係インストール
npm install electron

# アプリ起動
npx electron electron-simple.js
# または
npx electron electron-main.js
```

## システム要件と対処法

### 必要な環境
- Node.js 16.0.0+
- 対応OS: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### よくある問題と解決法

#### 1. ライブラリ依存関係エラー
```
error while loading shared libraries: libglib-2.0.so.0
```

**Linux系での対処:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libglib2.0-0 libgtk-3-0 libxss1 libnss3 libasound2

# CentOS/RHEL
sudo yum install glib2 gtk3 libXScrnSaver nss alsa-lib
```

#### 2. Windows権限エラー
- 管理者権限でコマンドプロンプトを実行
- Windows Defenderの除外設定を追加

#### 3. macOS署名エラー
```bash
# 開発者署名回避
sudo spctl --master-disable
```

## ビルドと配布

### 開発ビルド
```bash
npm install electron electron-builder
npx electron-builder
```

### 配布用パッケージ
```bash
# Windows .exe
npx electron-builder --win

# macOS .dmg  
npx electron-builder --mac

# Linux .AppImage
npx electron-builder --linux
```

## トラブルシューティング

### デバッグモード
```bash
NODE_ENV=development npx electron electron-main.js
```

### ログ確認
- 開発者ツール: Ctrl+Shift+I (Windows/Linux), Cmd+Option+I (Mac)
- コンソールでエラー確認

### キャッシュクリア
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## 代替実行方法

Electronが動作しない場合、Webブラウザで直接実行:
1. `galaga-game.html` をブラウザで開く
2. または開発サーバーを使用: `npm run dev`

## ファイル構成確認

必要なファイルがすべて存在することを確認:
```
✓ galaga-game.html       (ゲーム本体)
✓ game.js               (ゲームロジック)  
✓ game.css              (スタイル)
✓ electron-main.js      (メインプロセス)
✓ electron-simple.js    (簡易版)
✓ electron-launcher.cjs (ランチャー)
✓ generated-icon.png    (アイコン)
```

すべての設定が完了しており、ローカル環境でのElectronアプリ実行準備が整っています。