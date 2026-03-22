# 🛡️ Solo Quest: MVP実装仕様書 (MVP_SPEC.md)

> **[Source of Truth]**
> このドキュメントはプロジェクトの現在の実装状態を反映した唯一の正解（真実のソース）です。
> Supabase MCP で実際のスキーマ・ポリシーを確認済み（2026-03-20）。
> AIツールは実装時に必ずこの仕様・命名規則・ガイドラインを遵守してください。

---

## 1. プロジェクト概要

- **プロジェクト名:** Solo Quest（ソロクエスト）
- **コンセプト:** 日常のルーチンをRPGのクエストに変換し、子供の自律的な成長を促す。
- **ビジョン:** 親の負担をゼロにし、AI鑑定を通じて子供の「自分でできた！」という達成感を最大化する。
- **ターゲット:** 3歳〜12歳の子供とその保護者。
- **プラットフォーム:** iOS 優先（App Store 申請済み）。Android は将来対応。

---

## 2. 技術スタック

| カテゴリ | 採用技術 | バージョン |
|----------|----------|------------|
| フレームワーク | React Native (Expo) | SDK 55 |
| 言語 | TypeScript | ~5.9.2 |
| ルーティング | Expo Router v4 (expo-router ~55.0.5) | ファイルベース |
| スタイリング | **React Native `StyleSheet`**（NativeWindは不使用） | RN 0.83.2 |
| バックエンド / DB | Supabase (Auth, Postgres) | @supabase/supabase-js ^2.89.0 |
| **AI統合** | **Google Gemini 2.5 Flash API**（OpenAIは不使用） | gemini-2.5-flash |
| 音声録音 | expo-audio ~55.0.8 | — |
| ローカルストレージ | @react-native-async-storage/async-storage 2.2.0 | — |
| JS エンジン | Hermes | RN 0.83.2 同梱 |

### セキュリティ対応状況

| 問題 | 状態 |
|------|------|
| `EXPO_PUBLIC_GEMINI_API_KEY` がバンドルに露出 | ✅ Edge Function 移行済み（2026-03-20） |
| RLS ポリシーが全テーブルで `USING (true)` | ✅ 修正済み（2026-03-20） |

---

## 3. Supabase プロジェクト

- **Project ID:** `irosahorhknyzchgwdtx`
- **Region:** ap-northeast-1（東京）
- **Postgres:** 17.6
- **Edge Functions デプロイ数:** 0（未デプロイ）
- **マイグレーション管理:** なし（スキーマは Supabase Dashboard から直接作成）

---

## 4. ルート構造

```
app/
├── _layout.tsx          # ルートレイアウト（Stack、ヘッダーなし）
├── index.tsx            # 認証ゲート（セッション確認 → ルーティング）
├── welcome.tsx          # 3スライドのオンボーディングカルーセル
├── onboarding.tsx       # 勇者作成（名前 + マナカラー選択）
├── admin.tsx            # ギルドマスター管理画面（数学クイズでアクセス）
├── auth/
│   ├── _layout.tsx
│   └── login.tsx        # メール/パスワード認証（サインアップ + サインイン）
└── drawer/
    ├── _layout.tsx      # Drawer ナビゲーター（CustomDrawerContent）
    ├── index.tsx        # ホーム画面（クエスト一覧 + XP + AI鑑定）
    ├── rewards.tsx      # ご褒美の宝物庫
    ├── profile.tsx      # ギルドカード（冒険者ステータス）
    └── legal.tsx        # 規約・設定（ドロワーメニューからは非表示）
```

### 認証ゲートのロジック（`app/index.tsx`）

```
セッションあり AND activePlayerId あり → /drawer
セッションあり AND activePlayerId なし → /onboarding
セッションなし → /welcome
```

---

## 5. データベース設計（実際のスキーマ・Supabase MCP確認済み）

```sql
-- 1. profiles: 親のアカウント情報（存在するが、アプリコードからの書き込みは未実装）
table profiles (
  id         uuid primary key,  -- auth.users.id と一致（FK）
  email      text,
  plan_type  text default 'free',
  created_at timestamptz default timezone('utc', now())
)
-- 現状: 1行のみ存在。アプリコードから INSERT していない。トリガーによる自動生成か手動作成と推定。
-- RLS: SELECT のみ "Users can view their own profile" (auth.uid() = id) — 適切

-- 2. players: 子供のプロフィール
table players (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid,              -- auth.users.id に FK
  name         text,
  display_name text,              -- 表示名（ホーム・管理画面で使用）
  mana_color   text default '#00D4FF',
  level        integer default 1,
  total_xp     integer default 0,
  goal_monthly text,              -- 今月の目標
  goal_yearly  text,              -- 今年の目標
  created_at   timestamptz default timezone('utc', now())
)
-- 現状: 4行。RLS: ⚠️ "Allow all access for now" (USING true) — 要修正

-- 3. quests: 親が設定したタスク
table quests (
  id           uuid primary key default gen_random_uuid(),
  player_id    uuid,              -- players.id に FK
  title        text,
  is_completed boolean default false,
  xp_reward    integer default 10,
  time_limit   integer,           -- タイムアタック用制限時間（分）。null = 制限なし
  created_at   timestamptz default timezone('utc', now())
)
-- 現状: 5行。RLS: ⚠️ "Allow all access for now" (USING true) — 要修正

-- 4. rewards: レベル達成時のご褒美
table rewards (
  id           uuid primary key default gen_random_uuid(),
  player_id    uuid,              -- players.id に FK
  title        text,
  target_level integer,
  is_unlocked  boolean default false,
  created_at   timestamptz default timezone('utc', now())
)
-- 現状: 3行。RLS: ⚠️ "Allow all access for now" (USING true) — 要修正

-- 5. appraisal_logs: AI鑑定ログ（テーブルは存在するがアプリから書き込み未実装）
table appraisal_logs (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid,              -- players.id に FK
  transcript text,              -- 音声の文字起こし
  ai_rank    text,              -- 'S', 'A', 'B', 'C', 'RETRY'
  ai_comment text,
  xp_awarded integer default 0,
  created_at timestamptz default timezone('utc', now())
)
-- 現状: 0行。アプリは鑑定結果をDBに保存せず、モーダル表示のみ。
-- RLS: ⚠️ "Allow all access for now" (USING true) — 要修正
```

---

## 6. RLS ポリシー現状と修正すべき内容

### 現状（Supabase MCP確認済み）

| テーブル | ポリシー名 | 対象操作 | 条件 | 問題 |
|----------|-----------|---------|------|------|
| profiles | Users can view their own profile. | SELECT | `auth.uid() = id` | ✅ 適切（ただし subselect にすべき） |
| players | Allow all access for now | ALL | `true` | 🚨 素通し |
| quests | Allow all access for now | ALL | `true` | 🚨 素通し |
| rewards | Allow all access for now | ALL | `true` | 🚨 素通し |
| appraisal_logs | Allow all access for now | ALL | `true` | 🚨 素通し |

### 修正すべきポリシー（SQLテンプレート）

```sql
-- players: 自分が親であるレコードのみ操作可
DROP POLICY "Allow all access for now" ON players;
CREATE POLICY "Players: own family only"
  ON players FOR ALL
  USING (parent_id = (SELECT auth.uid()))
  WITH CHECK (parent_id = (SELECT auth.uid()));

-- quests: players 経由で自分の家族のみ
DROP POLICY "Allow all access for now" ON quests;
CREATE POLICY "Quests: own family only"
  ON quests FOR ALL
  USING (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  );

-- rewards: quests と同様
DROP POLICY "Allow all access for now" ON rewards;
CREATE POLICY "Rewards: own family only"
  ON rewards FOR ALL
  USING (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  );

-- appraisal_logs: quests と同様
DROP POLICY "Allow all access for now" ON appraisal_logs;
CREATE POLICY "AppraisalLogs: own family only"
  ON appraisal_logs FOR ALL
  USING (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE parent_id = (SELECT auth.uid())
    )
  );

-- profiles: パフォーマンス改善（auth.uid() の再評価を避ける）
DROP POLICY "Users can view their own profile." ON profiles;
CREATE POLICY "Profiles: own record only"
  ON profiles FOR SELECT
  USING (id = (SELECT auth.uid()));
```

---

## 7. パフォーマンス課題（Supabase Advisor 確認済み）

| 問題 | 影響テーブル | 対応SQL |
|------|-------------|---------|
| FK カラムにインデックスなし | players, quests, rewards, appraisal_logs | 下記参照 |
| RLS で `auth.uid()` を行ごとに再評価 | profiles | `(SELECT auth.uid())` に変更で解決 |

```sql
-- FK インデックス追加
CREATE INDEX ON players (parent_id);
CREATE INDEX ON quests (player_id);
CREATE INDEX ON rewards (player_id);
CREATE INDEX ON appraisal_logs (player_id);
```

---

## 8. 成長ロジック

```typescript
// レベル計算式（drawer/index.tsx の giveExperience 関数）
const newTotalXp = (player.total_xp || 0) + amount;
const newLevel = Math.floor(newTotalXp / 100) + 1;

// XPバー進捗（0〜100%）
const progress = (player.total_xp % 100) || 0;
```

| ランク | XP | 意味 |
|--------|-----|------|
| S | 100 XP | 驚くべき自発性・利他的行動 |
| A | 50 XP | 自立的・前向きな行動 |
| B | 20 XP | 通常の努力・完了報告 |
| C | 10 XP | 最低限の努力 |
| RETRY | 0 XP | 聞き取れなかった・やり直し |

---

## 9. AI鑑定エンジン（現在の実装）

### フロー

```
音声録音（expo-audio）
  → base64エンコード（expo-file-system/legacy）
  → Gemini 2.5 Flash API に直接 fetch（⚠️ APIキーがクライアントに露出中）
  → Gemini が STT（文字起こし）と評価を1回のAPIコールで実施
  → JSON レスポンス解析
  → XP付与（players テーブル更新）+ モーダル表示
  ※ appraisal_logs への保存は未実装
```

### APIエンドポイント（Edge Function 経由）

```
${EXPO_PUBLIC_SUPABASE_URL}/functions/v1/appraise-audio
Authorization: Bearer <ユーザーのJWTトークン>
```

### レスポンス JSON スキーマ（Gemini structured output）

```typescript
{
  transcript: string,  // 音声の文字起こし
  rank:       "S" | "A" | "B" | "C" | "RETRY",
  comment:    string,  // 鑑定士キャラからのフィードバック
  xp:         number   // 付与するXP
}
```

### デイリー制限

- 1日3回（`DAILY_LIMIT = 3`）
- AsyncStorage の `lastUsageDate` / `dailyUsageCount` で管理（日付変更でリセット）
- DBへの保存なし

### アーキテクチャ（Edge Function 移行済み）

```
フロントエンド
  → POST /functions/v1/appraise-audio（Supabase JWT 付き）
  → Edge Function（Deno）: Supabase Secrets から GEMINI_API_KEY を取得
      - JWT でユーザーを認証
      - playerId が自分の子供か確認（不正アクセス防止）
      - Gemini 2.5 Flash API を呼び出し
      - appraisal_logs テーブルに保存（RETRY 以外）
  → レスポンスをフロントに返却
```

---

## 10. マナカラー定義

```typescript
const MANA_COLORS = [
  { label: 'ダーク',       value: '#1A1A2E' },  // Navy（デフォルト）
  { label: 'アクア',       value: '#00D4FF' },  // LightBlue
  { label: 'ピンク',       value: '#FF74B1' },  // Pink
  { label: 'ライム',       value: '#39FF14' },  // Green
  { label: 'スカーレット', value: '#FF3131' },  // Red
];
```

マナカラーは `players.mana_color` に保存。グローバルな Context は不使用。
各画面が AsyncStorage から `activePlayerId` を取得 → Supabase から `mana_color` をフェッチして適用。

---

## 11. UI/UXガイドライン

### カラーパレット（ホーム画面の定数）

```typescript
const COLORS = {
  background: '#0A0A15',  // 深いダークネイビー
  cardBg:     '#12121A',
  border:     '#1E1E2E',
  text:       '#FFFFFF',
  subText:    '#888899',
};
```

- **基本テーマ:** ダークモード
- **アクセント:** `mana_color` を使ったネオングロー効果
- **カード:** `borderRadius: 16` を基本
- **スタイリング:** `StyleSheet.create()` 一本化。NativeWind は不使用

---

## 12. ギルドマスターモード（管理者機能）

- **アクセス方法:** ホーム画面の設定アイコン → 掛け算クイズ（1〜9の乱数）
- **機能:**
  - 勇者切り替えタブ（1親アカウント複数 `players` 対応）
  - 目標設定（`goal_monthly`, `goal_yearly`）
  - クエスト CRUD（タイトル / XP報酬 / 目標時間）
  - ご褒美 CRUD（タイトル / 解放レベル）
- **ルート:** `/admin`（Stack 画面）

---

## 13. 優先度付き課題リスト

| 優先度 | 課題 | 内容 |
|--------|------|------|
| ~~🚨 最高~~ | ~~RLS ポリシー修正~~ | ✅ 2026-03-20 対応済み |
| ~~🚨 最高~~ | ~~Gemini APIキー → Edge Function 移行~~ | ✅ 2026-03-20 対応済み |
| ~~⚠️ 高~~ | ~~FK インデックス追加~~ | ✅ 2026-03-20 対応済み |
| ⚠️ 高 | Auth: Leaked Password Protection を有効化 | Supabase Dashboard > Auth > Settings で有効化 |
| 🔶 中 | appraisal_logs への書き込み実装 | Edge Function 移行と同時に対応 |
| 🔶 中 | Auth トークンを SecureStore に移行 | 現在は AsyncStorage（非暗号化） |
| 🔵 低 | profiles テーブルの書き込み実装 | サインアップ時に INSERT するトリガーまたはアプリコードを追加 |
| 🔵 低 | `any` 型の排除 | 全 State・Props・APIレスポンスに型定義 |
| 🔵 低 | お問い合わせフォームのDB保存 | `legal.tsx` の送信処理が現状 `console.log` のみ |

---

## 14. パッチ・既知の修正

- **`patches/@react-navigation+core+7.16.1.patch`**: Hermes GC クラッシュ修正済み。
  `getConfigsWithRegexes()` 内の `.map()` + `new RegExp()` を `for` ループに置換。
  `package.json` の `postinstall: "patch-package"` で `npm install` 後も自動適用される。
