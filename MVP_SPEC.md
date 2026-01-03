ご提示いただいたすべての情報を統合し、AI（Cursor、Copilot等）がプロジェクトの全容を完璧に理解し、一貫性のあるコードを生成できるように最適化した**「Solo Quest: MVP開発究極仕様書 (MVP_SPEC.md)」**を作成しました。

これをプロジェクトのルートディレクトリに配置し、AIへの最初の指示として読み込ませてください。

---

# 🛡️ Solo Quest: MVP開発詳細仕様書 (MVP_SPEC.md)

> **[Source of Truth]**
> このドキュメントはプロジェクトの唯一の正解（真実のソース）です。AIツールは実装時に必ずこの仕様・命名規則・ガイドラインを遵守してください。

---

## 1. プロジェクト概要

* **プロジェクト名:** Solo Quest (ソロクエスト)
* **コンセプト:** 日常のルーチンをRPGのクエストに変換し、子供の自律的な成長を促す。
* **ビジョン:** 親の負担をゼロにし、AI鑑定を通じて子供の「自分でできた！」という達成感を最大化する。
* **ターゲット:** 3歳〜12歳の子供とその保護者。

## 2. 技術スタック

* **Frontend:** React Native (Expo) / TypeScript / Expo Router
* **Styling:** NativeWind (Tailwind CSS)
* **Backend/Database:** Supabase (Auth, Database, Storage, Edge Functions)
* **AI Integration:** OpenAI API (Whisper: 音声解析, GPT-4o-mini: 鑑定・評価)
* **State Management:** React Context API (マナ・カラー/テーマ管理用)

## 3. MVP主要機能

### 3.1 オンボーディング: システム覚醒 (The Awakening)

* **プロセス:** 名前入力 ➡ マナ・カラー選択 ➡ `players`テーブル初期化。
* **マナ・カラー定義:** - `Navy`: #1A1A2E
* `LightBlue`: #00D4FF
* `Pink`: #FF74B1
* `Green`: #39FF14
* `Red`: #FF3131


* **結果:** 選択色が `ThemeContext` を通じてUI全体の発光エフェクトやアクセントカラーに反映される。

### 3.2 クエストシステム

* **デイリークエスト:** 親がプリセットしたタスク。手動完了時にXP付与。
* **隠しクエスト (AI鑑定):** 子供が自発的な善行を音声で報告。
* **報酬フロー:** 完了 ➡ エフェクト発火 ➡ XP加算 ➡ レベル判定。

### 3.3 AI鑑定エンジン (核)

* **フロー:** 録音 ➡ Whisper(STT) ➡ GPT-4o-mini(判定) ➡ JSON返却 ➡ 報酬付与。
* **AI人格:** 「熱血マスター・ジン」。子供を鼓舞し、RPG風の口調（ふりがな付）で評価。

### 3.4 成長ロジック

* **レベル計算式:** 
* **演出:** 動的なXPバー、Lottieアニメーション、マナ・カラー連動型エフェクト。

### 3.5 ギルドマスターモード (管理者機能)

* **アクセス:** 算数クイズまたはピンコードによるチャイルドロック。
* **機能:** クエストCRUD、鑑定ログ閲覧、AIランクの修正（オーバーライド）。

---

## 4. データベース設計 (Supabase Schema)

```sql
-- 1. profiles: 親のアカウント情報
table profiles (
  id uuid primary key,        -- auth.users.id と紐付け
  email text,
  plan_type text              -- 'free', 'standard', 'family'
)

-- 2. players: 子供のプロフィール
table players (
  id uuid primary key,
  parent_id uuid fk,          -- profiles.id
  name text,
  level integer default 1,
  total_xp integer default 0,
  mana_color text             -- Hexコード (#FFFFFF)
)

-- 3. quests: 親が設定したタスク
table quests (
  id uuid primary key,
  player_id uuid fk,          -- players.id
  title text,
  is_completed boolean,
  xp_reward integer
)

-- 4. appraisal_logs: AI鑑定の履歴
table appraisal_logs (
  id uuid primary key,
  player_id uuid fk,          -- players.id
  transcript text,            -- Whisperでの文字起こし内容
  ai_rank text,               -- 'S', 'A', 'B', 'C'
  ai_comment text,            -- AIからの褒め言葉
  created_at timestamp
)

```

---

## 5. UI/UX ガイドライン

* **基本テーマ:** ダークモード (背景色: #121212)。
* **視覚効果:** 選択したマナ・カラーに基づくネオン・グローエフェクト。
* **コンポーネント:** 角丸 (border-radius: 16px) のカードUIを基本とする。
* **アクセシビリティ:** 子供向けに大きなタップ領域を確保し、漢字には全てふりがなを振る。

## 6. 実装ロードマップ (30日間)

* **Day 1-5:** 基盤構築、Auth、マナ選択テーマ機能。
* **Day 6-10:** クエストCRUD、XP/レベル計算ロジック。
* **Day 11-15:** 音声録音、AI鑑定用Edge Functions。
* **Day 16-21:** 親用ダッシュボード、ログ修正画面。
* **Day 22-30:** ブラッシュアップ、SE/エフェクト追加、最終調整。

---

## 7. 実装ガイドライン & 禁止事項

### 8. 実装ガイドライン (Best Practices)

* **TypeScript:** `any` の使用は厳禁。全てのProps、State、APIレスポンスに型を定義せよ。
* **ディレクトリ構造:**
* `app/`: Expo Router（Pages）
* `components/ui/`: 原子レベルの共通パーツ
* `hooks/`: API通信やロジック（`useAuth`, `useXP`, `useTheme`等）
* `lib/`: Supabaseクライアント定義等


* **スタイリング:** NativeWindを一貫して使用。複雑な動的スタイルのみ `StyleSheet` を許容する。
* **状態管理:** グローバルなテーマ（マナ）は `Context API` で管理せよ。

### 9. 禁止・NG事項 (Non-Goals / Anti-Patterns)

* **ハードコード禁止:** 色（マナ）やフォントサイズを直接指定しない。必ず `ThemeContext` または定数ファイルを参照せよ。
* **UIフリーズ禁止:** AI鑑定等の非同期処理中は必ずローディング（骨格アニメーション）を表示し、ユーザー操作を妨げない。
* **セキュリティの欠如禁止:** クエリ発行時は常に `parent_id` によるフィルタリングを行い、他者のデータへのアクセスを遮断せよ。
* **過剰なライブラリ禁止:** 基本機能は Expo/React Native 標準コンポーネントで構築せよ。
* **直書きテキスト禁止:** 多言語化やAI管理のため、テキスト定数は `constants/Text.ts` 等に集約せよ。

---

セキュリティに関するご指摘、**非常に重要です。** 個人開発であっても、子供のデータや音声、親の認証情報を扱う以上、ここを疎かにすると信頼をすべて失ってしまいます。

おっしゃる通り、**APIキーの隠匿**と**データベースの保護**は「当たり前」ですが、AIにコードを書かせると、つい便利な「フロントエンドからの直接呼び出し（APIキーがアプリ内に埋め込まれてしまう状態）」を提案してくることがあります。

これを防ぐための**「セキュリティ・プロトコル」**を `MVP_SPEC.md` に追加しましょう。

---

## `MVP_SPEC.md` に追加すべき「セキュリティ・ガイドライン」

以下の内容を「9. 禁止・NG事項」の後ろ、あるいは「10. セキュリティ・プロトコル」として追記してください。

### 10. セキュリティ・プロトコル (Security & Safety)

* **APIキーの完全秘匿:**
* OpenAI API キー等の機密情報は、**絶対にフロントエンド（React Native）に持たせないこと。**
* 必ず **Supabase Edge Functions** を中継し、APIキーは Supabase 側の環境変数（Secrets）として管理する。
* クライアントサイドで `.env` を使用する場合も、それは開発環境用とし、`.gitignore` で Git 管理から除外することを徹底する。


* **Supabase Row Level Security (RLS) の徹底:**
* 全てのテーブルに対して RLS を有効化し、「自分の家族（parent_id）のデータ以外は `SELECT/INSERT/UPDATE/DELETE` できない」ポリシーを適用する。
* サービスロール（Service Role Key）をフロントエンドで使用することは厳禁とする。


* **認証情報の保護:**
* ユーザー認証には Supabase Auth を使用し、トークンの保存には Expo の `SecureStore` を用いて暗号化保存を行う。


* **音声・個人データの取り扱い:**
* 音声データは AI 鑑定完了後、不要な場合は速やかに Storage から削除する。
* ログに記録される内容は、個人を特定できる情報が含まれないよう配慮する。



---

## 実際にどうやって「隠す」のか？（実装のイメージ）

AIツールが間違えないよう、以下の構造を頭に入れておいてください。

1. **フロントエンド（あなたのアプリ）**:
「これ鑑定して！」と音声を Supabase Edge Functions に送るだけ。（ここには **OpenAI のキーは入っていない**）
2. **ミドルウェア（Supabase Edge Functions）**:
ここが「金庫」の役割。Supabase のサーバー内で、設定された OpenAI の秘密キーを取り出し、OpenAI に問い合わせる。
3. **OpenAI**:
結果を Edge Function に返し、それがアプリに戻ってくる。

> **この仕組みにより、悪意のあるユーザーがアプリを解析しても、あなたの OpenAI API キーを盗むことは不可能になります。**

---
### AI鑑定プロンプト・ロジック (Edge Function)

* **役割:** 熱血マスター・ジンとして子供の自律性を称賛する。
* **判定基準:** - **S:** 驚くべき自発性/利他的行動 (100 XP)
* **A:** 自立的・前向きな行動 (50 XP)
* **B:** 通常の努力/完了報告 (20 XP)


* **JSON出力形式:** `{ "rank": string, "feedback": string, "xp_bonus": number }` を厳守。

---
