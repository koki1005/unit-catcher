# Unit Catcher

大学の出席用QRコードを「単位を捕獲する」感覚でストックしていくWebアプリ。授業ごとに散らばる出席URLをカメラでスキャン、画像ドロップ、あるいは手打ちで貯めておき、次回以降はワンタップで開けるようにするのが目的。千葉工大の講義スタイル（毎回配布されるQRを講義開始と同時に読ませる方式）に合わせて設計されている。

「unit」は履修単位、「catcher」はそのQRを拾い集める人、というダジャレ。

## 技術スタック

Next.js 14.2.35 の App Router、React 18、TypeScript 5、Tailwind CSS 3.4、shadcn/ui、Radix UI、Base UI React。データ永続化は Supabase JS 2.104、QRデコードは html5-qrcode 2.3.8、ドラッグ＆ドロップは @dnd-kit。フォントは Geist と Inter を併用。デプロイターゲットは Vercel。

ゲスト時は localStorage、ログイン時は Supabase に切り替わる二段構成で、ログイン後はさらに `uc_folders_<uid>` `uc_urls_<uid>` の localStorage キャッシュを読み込み即座に画面を出しつつ裏でリモートを叩いて上書きする。

## 主な機能

QRの取り込みは3系統ある。カメラ（`facingMode: 'environment'` で背面固定、`qrbox` 250px）、画像アップロード（html5-qrcode の scanFile）、URLを手で貼るタブ。取り込んだURLに表示名と保存先フォルダを紐付けて登録する。

フォルダは無限ネスト可能で、`parent_id` と `position` を持つ木構造。並べ替えは @dnd-kit の Sortable で行い、フォルダへの投入は別モード（moveMode）でドラッグする二段運用。ソートモードはドラッグで並び替え、移動モードはドラッグでフォルダに投げ込む、という切り分け。

背景画像はグローバル・フォルダ単位・URL単位の三階層で設定でき、`bg_focal_x/y` と `bg_focal_x_pc/y_pc` を分けて持つことでスマホとPCで別のフォーカルポイントを保存できる。背景画像の輝度に応じて文字色を白黒自動切替する `useImageLuminance` フックがある。faviconはURLごとに各サイトのものを自動取得して表示。

## Supabaseスキーマ

RLSは有効だが、ユーザー認証はSupabase Authを使わず自前のアカウント名＋パスワード方式で、実処理は全て `SECURITY DEFINER` の RPC 経由。パスワードは `pgcrypto` の `crypt(..., gen_salt('bf'))` でBcryptハッシュ化。

```sql
users    (id, account_name UNIQUE 8+, password_hash, created_at, bg_*)
folders  (id, user_id, name, parent_id, position, created_at, bg_*)
urls     (id, user_id, folder_id, name, url, position, created_at, bg_*)
```

`users` テーブルは `deny direct on users` ポリシーで直接アクセス不能、`folders` / `urls` は `allow all` で開放しアプリ側の user_id フィルタで守っている。RPCは `register_user_with_password` `login_with_password` `set_user_password` `change_user_password` `set_user_background` など。

マイグレーションは `supabase/migrations/` にあり、背景画像対応・パスワード対応・PC別フォーカルポイント対応の順に追加された。

## ローカル起動

```bash
npm install
cp .env.example .env.local  # SUPABASE URL / ANON KEY を埋める
npm run dev                 # http://localhost:3000
npm run build
npm run lint
```

必要な環境変数。

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Supabase側では `supabase/schema.sql` と `supabase/migrations/*.sql` を順に流し込む。

## 認証フロー

アカウント名（8文字以上）とパスワードで登録・ログイン。セッションはlocalStorageの `uc_user` にユーザー情報を丸ごと保存する簡易方式で、Supabase Auth のセッション管理は使っていない。旧アカウント（password_hash が NULL）はログイン直後に `PasswordSetupRequired` 画面で強制的にパスワードを設定させられる。

## ディレクトリ構成

```
src/
  app/
    layout.tsx            ルートレイアウト、AppProvider を注入
    page.tsx              ホーム画面、DndContext とツールバー
    globals.css
    fonts/                Geist woff
  components/
    AppProvider.tsx       ユーザー状態とデータキャッシュ管理
    AppSkeleton.tsx       最低1秒表示のローディング
    FolderTree.tsx        ネスト表示・ドラッグ・並び替え本体
    AddSheet.tsx          追加シート（手貼り／カメラ／画像）
    QrCamera.tsx          html5-qrcode によるライブスキャン
    QrUpload.tsx          画像ファイルからのデコード
    AccountSheet.tsx      ログイン・登録・ログアウト
    PasswordSetupRequired.tsx
    PasswordChangeDialog.tsx
    CreateFolderDialog.tsx
    RenameDialog.tsx
    EditItemDialog.tsx
    GlobalBackgroundDialog.tsx
    FocalPointPicker.tsx  焦点ドラッグ（スマホ・PC別）
    Favicon.tsx           サイトfavicon取得
    ui/                   shadcn 由来のプリミティブ
  lib/
    supabase.ts           クライアント遅延生成
    supabase-storage.ts   RPC 呼び出しとリモートCRUD
    storage.ts            ゲスト用 localStorage 実装
    store.ts              AppContext 定義
    types.ts              Folder / UrlItem / User
    useImageLuminance.ts  背景輝度で文字色を切替
    utils.ts              cn ヘルパ
supabase/
  schema.sql
  migrations/
    2026-06-08_add_backgrounds.sql
    2026-06-08_add_password.sql
    2026-06-08_add_pc_focal.sql
public/
  rogo.jpg                ローディング画面のロゴ
```

## デプロイ

`.vercel/project.json` は作成済みで Vercel プロジェクトとリンクは済んでいるが、まだ本番デプロイはしていない。`vercel --prod` を叩けば公開される状態。

## 設計メモ

ゲストモードとログインモードで storage.ts / supabase-storage.ts の実装を切り替える二本立てで、コンポーネント側は `user` の有無で分岐して同じ関数名の別実装を呼ぶ。データ形状は同一で、ゲスト時のデータはログイン後に自動マージされない割り切り。

ドラッグ操作は「並び替え」と「フォルダ移動」を別モードに分けている。同時にやろうとしたが collision detection の設計が破綻したので分離した経緯が git log に残っている。

ローディング画面は最低1秒表示を保証する `Promise.all + 残り時間 setTimeout` パターンで、キャッシュヒットで一瞬で消えるチラつきを防いでいる。
