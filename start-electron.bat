@echo off
chcp 65001 >nul

echo ギャラガ風シューティングゲーム - Electron版を起動中...

REM Node.jsセットアップスクリプトを使用
if exist "electron-setup.js" (
    echo セットアップスクリプトを使用して起動中...
    node electron-setup.js
) else (
    REM フォールバック: 従来の方法
    echo フォールバック起動を実行中...
    
    REM Node.jsがインストールされているかチェック
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo エラー: Node.jsがインストールされていません
        echo https://nodejs.org からNode.jsをダウンロードしてインストールしてください
        pause
        exit /b 1
    )

    REM package.jsonが存在しない場合、electron-package.jsonを使用
    if not exist "package.json" (
        if exist "electron-package.json" (
            echo electron-package.jsonを使用してelectronをインストール中...
            copy electron-package.json package.json >nul
            npm install
        ) else (
            echo エラー: package.jsonまたはelectron-package.jsonが見つかりません
            pause
            exit /b 1
        )
    )

    REM electronがインストールされていない場合はインストール
    if not exist "node_modules\electron" (
        echo Electronをインストール中...
        npm install electron electron-builder
    )

    REM Electronアプリケーションを起動
    echo ゲームを起動中...
    npx electron electron-main.js
)