#!/bin/bash

# Electronアプリケーション起動スクリプト

echo "ギャラガ風シューティングゲーム - Electron版を起動中..."

# Node.jsセットアップスクリプトを使用
if [ -f "electron-setup.js" ]; then
    echo "セットアップスクリプトを使用して起動中..."
    node electron-setup.js
else
    # フォールバック: 従来の方法
    echo "フォールバック起動を実行中..."
    
    # Node.jsとelectronがインストールされているかチェック
    if ! command -v node &> /dev/null; then
        echo "エラー: Node.jsがインストールされていません"
        echo "https://nodejs.org からNode.jsをダウンロードしてインストールしてください"
        exit 1
    fi

    # package.jsonが存在しない場合、electron-package.jsonを使用
    if [ ! -f "package.json" ]; then
        if [ -f "electron-package.json" ]; then
            echo "electron-package.jsonを使用してelectronをインストール中..."
            cp electron-package.json package.json
            npm install
        else
            echo "エラー: package.jsonまたはelectron-package.jsonが見つかりません"
            exit 1
        fi
    fi

    # electronがインストールされていない場合はインストール
    if [ ! -d "node_modules/electron" ]; then
        echo "Electronをインストール中..."
        npm install electron electron-builder
    fi

    # Electronアプリケーションを起動
    echo "ゲームを起動中..."
    npx electron electron-main.js
fi