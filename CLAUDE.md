# Solo Quest - CLAUDE.md

## プロジェクト概要
**「親の『早くしなさい』をAIが『すごい！』に変える」**

4歳〜小学校低学年の子ども向けRPGテーマの日課管理アプリ（solo-quest.jp）。
日常の生活習慣（宿題・歯磨きなど）をクエストに変え、音声で達成報告するとAIギルドマスターが即座にRPG口調で褒めてXPを付与。命令する親子関係から「報告を聞いて喜ぶ」関係への転換がコンセプト。

**主な機能:**
- 専属AI応援団（Gemini による音声評価）
- ご褒美チケット（XP → リアルな報酬交換）
- 集中シールドモード（クエスト中に他アプリをブロック）
- ホームウィジェット
- プライバシー設計（音声データ非保存・広告なし・完全無料）

Expo (React Native) + Supabase + Gemini AI 構成。

## コマンド
```bash
npm start          # Expo dev server 起動
npm run ios        # iOS シミュレーター起動
npm run android    # Android エミュレーター起動
npm run web        # Web 版起動
npm run lint       # ESLint チェック（テストは未整備）
```

## 技術スタック
- **Framework:** React Native 0.83.2 + Expo SDK 55
- **ルーティング:** Expo Router（ファイルベース）
- **バックエンド:** Supabase（Auth + PostgreSQL + RLS）
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **ナビゲーション:** Drawer + Stack（React Navigation 7）

## ディレクトリ構成
```
app/               # Expo Router ページ（ファイル = ルート）
  _layout.tsx      # ルートレイアウト
  index.tsx        # 認証リダイレクト
  welcome.tsx      # ウェルカム画面
  onboarding.tsx   # 勇者作成フロー
  admin.tsx        # 管理者（親）画面
  auth/            # ログイン系
  drawer/          # メインアプリ（ホーム・報酬・プロフィール）
components/        # UIコンポーネント
  ui/              # 汎用アトミックコンポーネント
hooks/             # カスタムフック
lib/
  supabase.ts      # Supabase クライアント
  gemini.ts        # Gemini AI 統合
constants/
  theme.ts         # カラー・フォント定数
```

## コーディング規約
- **TypeScript 厳格モード**（`any` 型禁止）
- パスエイリアス: `@/` → プロジェクトルート
- コンポーネントは関数コンポーネント + Hooks
- スタイリングは React Native `StyleSheet` API（NativeWind/Tailwind は不使用）
- プラットフォーム分岐は `.ios.ts` / `.web.ts` ファイルで対応

## テーマシステム
- **ベースカラー:** ダークネイビー `#0A0A15`
- **マナカラー（動的）:** Context 経由でアプリ全体に適用
  - Navy: `#1A1A2E` / LightBlue: `#00D4FF` / Pink: `#FF74B1`
  - Green: `#39FF14` / Red: `#FF3131`
- カラーは `constants/theme.ts` で一元管理

## データベーススキーマ（Supabase）
| テーブル | 用途 |
|---|---|
| `profiles` | 親アカウント |
| `players` | 子ども（勇者）プロフィール |
| `quests` | 日課クエスト |
| `appraisal_logs` | AI評価ログ |

## AI評価ロジック
- 音声録音 → base64 変換 → Gemini API 送信
- レスポンス: `{ transcript, rank, comment, xp_bonus }`
- ランク: S(+100XP) / A(+50XP) / B(+30XP) / C(+10XP) / RETRY(0XP)
- キャラクター: 熱血マスター・ジン

## 環境変数（`.env` - git 管理外）
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GEMINI_API_KEY   # セキュリティ上は Edge Function 経由を推奨
```

## 注意事項
- Gemini API キーがフロントエンドに露出しているため、将来的に Supabase Edge Function 経由に移行予定
- Row Level Security (RLS) を Supabase で設定済み
- 音声録音には iOS/Android のマイク権限が必要（`app.json` に設定済み）
- `MVP_SPEC.md` がプロジェクトの仕様書（AI ツール連携の単一ソース）
