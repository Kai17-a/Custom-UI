# 用途別の画面サンプル（HTML / Vue / Astro）

HTMLリンクは同梱のHTML断片です。ネットワークやカタログは不要です。アプリのmain要素内の`ui-container ui-layout`に配置し、共通のui.css / defer付きui.jsを読み込みます。フォームの送信先・リンク・IDとデータをアプリ用に変更してください。保存・認証・送信は実装していません。ウィザードの確認表示には断片末尾のscriptも必要です。

| 用途 | 組み合わせ | HTML | Vue SFC | Astroページ |
| --- | --- | --- | --- | --- |
| ワークスペース設定：チームの基本情報と通知の受け取り方を変更します。 | Forms・Section・Cluster | [settings.html](../samples/html/settings.html) | [settings.vue](../samples/vue/settings.vue) | [settings.astro](../samples/astro/settings.astro) |
| チームへようこそ：木の葉制作室の作業スペースにアクセスします。 | Tabs・Forms | [auth.html](../samples/html/auth.html) | [auth.vue](../samples/vue/auth.vue) | [auth.astro](../samples/astro/auth.astro) |
| プロジェクト一覧：名前や状態（進行中・完了・準備中）を入力して絞り込めます。 | Toolbar・Data table・Pagination | [list.html](../samples/html/list.html) | [list.vue](../samples/vue/list.vue) | [list.astro](../samples/astro/list.astro) |
| 秋の展示会：作品と制作の背景を紹介する、チームの共同プロジェクトです。 | Page header・Tabs・Page rail・Dialog | [detail.html](../samples/html/detail.html) | [detail.vue](../samples/vue/detail.vue) | [detail.astro](../samples/astro/detail.astro) |
| 制作依頼を作成：入力・予定・確認の順に進めます。タブは矢印キーでも移動できます。 | Tabs・Forms・Section | [wizard.html](../samples/html/wizard.html) | [wizard.vue](../samples/vue/wizard.vue) | [wizard.astro](../samples/astro/wizard.astro) |
| 制作タスク：カードをドラッグ、または移動先の選択で整理できます。変更の保存はアプリ側で接続します。 | Kanban board・Select | [kanban.html](../samples/html/kanban.html) | [kanban.vue](../samples/vue/kanban.vue) | [kanban.astro](../samples/astro/kanban.astro) |
| こもれび：架空の制作メンバーのプロフィールです。 | Avatar・Cards・Timeline | [profile.html](../samples/html/profile.html) | [profile.vue](../samples/vue/profile.vue) | [profile.astro](../samples/astro/profile.astro) |
| チームに合うプラン：月額料金は税込の架空の例です。契約と決済はアプリ側で接続します。 | Cards・Badge・Cluster | [pricing.html](../samples/html/pricing.html) | [pricing.vue](../samples/vue/pricing.vue) | [pricing.astro](../samples/astro/pricing.astro) |
| 通知：作業に関するお知らせを未読・既読で確認します。 | Tabs・List group・Badge | [notifications.html](../samples/html/notifications.html) | [notifications.vue](../samples/vue/notifications.vue) | [notifications.astro](../samples/astro/notifications.astro) |
| 制作アシスタント：回答は例示です。モデルへの接続と送信処理はアプリ側で接続します。 | AI message・Disclosure・Forms | [ai-chat.html](../samples/html/ai-chat.html) | [ai-chat.vue](../samples/vue/ai-chat.vue) | [ai-chat.astro](../samples/astro/ai-chat.astro) |
| 共有ファイル：資料を選択して内容を確認できます。選択したファイルはまだアップロードされません。 | File drop・List group・Page rail | [files.html](../samples/html/files.html) | [files.vue](../samples/vue/files.vue) | [files.astro](../samples/astro/files.astro) |
| 制作を始めましょう：最初のプロジェクトを作るまでの準備を案内します。チェックの保存はアプリ側で接続します。 | Section・Forms・Progress・Cards | [empty-onboarding.html](../samples/html/empty-onboarding.html) | [empty-onboarding.vue](../samples/vue/empty-onboarding.vue) | [empty-onboarding.astro](../samples/astro/empty-onboarding.astro) |

HTML版のコピー元はリポジトリのdocs/templates内にある同名HTMLのkav-sampleマーカー内です。配布版はbuild-docs.pyで抽出します。配布先で元リポジトリを探す必要はありません。

Vue版はVue 3.5以降のSFC、Astro版はページとしてコピーします。公開パッケージを導入し、[組み込み方](frameworks.md)を参照してください。リンクは例のルート構成に合わせてあるため、コピー先のルートへ調整してください。ローカルの操作だけを実装し、フォームは送信を抑止しています。

Vueのタブ（認証・詳細・手順・通知）はKavTabsとv-model、手順の確認内容は入力モデル、チャット送信はメッセージ配列で管理します。設定と準備チェックにもv-modelを使います。Data table・カンバン・ファイルドロップはVue版では信頼済み固定HTMLをKavWidgetへ渡します。Astro版では同じ部品を通常HTMLとProviderの共通ランタイムで動かします。mainのdata-kav-ui-widgetにより、未専用化のHTML部分も初期化・破棄の対象にします。アバター・タイムライン・通知リスト・AIメッセージは専用部品がないため既存クラスのHTMLです。

Vue/Astro版のコピー元はexamples/astro/src/components/samples/*.vueとexamples/astro/src/pages/samples/*.astroです。Vue版を表示するpages/samples/vue/*.astroも設け、build:examplesが24画面を実際にコンパイルします。SFCはclient:loadでハイドレーションします。Astro側のstrict tsconfigはsrc以下を含み、astro checkで両形式を確認できます。追加のCSSや専用コンポーネントは不要です。

build-docs.pyがコンパイル対象のソースをそのままskills内とdocs/skills内へコピーし、--checkで変更・欠落・余分なコピーを検出します。配布コピーを直接編集せず、examples内のソースを変更して同期してください。
