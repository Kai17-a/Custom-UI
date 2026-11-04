# 用途別の画面サンプル（HTML / Vue / Astro）

HTMLリンクは同梱のHTML断片です。ネットワークやカタログは不要です。アプリのmain要素内の`ui-container ui-layout`に配置し、共通のui.css / defer付きui.jsを読み込みます。フォームの送信先・リンク・IDとデータをアプリ用に変更してください。保存・認証・送信は実装していません。ウィザードの手順移動と確認表示には断片末尾のscriptも必要です。

| 用途 | 組み合わせ | HTML | Vue SFC | Astroページ |
| --- | --- | --- | --- | --- |
| 設定画面 | Forms・Section・Cluster | [settings.html](../samples/html/settings.html) | [settings.vue](../samples/vue/settings.vue) | [settings.astro](../samples/astro/settings.astro) |
| ログイン・新規登録 | Tabs・Forms | [auth.html](../samples/html/auth.html) | [auth.vue](../samples/vue/auth.vue) | [auth.astro](../samples/astro/auth.astro) |
| 一覧（検索・絞り込み・表） | Toolbar・Data table・Pagination | [list.html](../samples/html/list.html) | [list.vue](../samples/vue/list.vue) | [list.astro](../samples/astro/list.astro) |
| 詳細（タブ・補足） | Page header・Tabs・Page rail・Dialog | [detail.html](../samples/html/detail.html) | [detail.vue](../samples/vue/detail.vue) | [detail.astro](../samples/astro/detail.astro) |
| 入力の手順（ステップ・確認） | Tabs・Forms・Section | [wizard.html](../samples/html/wizard.html) | [wizard.vue](../samples/vue/wizard.vue) | [wizard.astro](../samples/astro/wizard.astro) |
| カンバン | Kanban board・Select | [kanban.html](../samples/html/kanban.html) | [kanban.vue](../samples/vue/kanban.vue) | [kanban.astro](../samples/astro/kanban.astro) |
| プロフィール | Avatar・Cards・Timeline | [profile.html](../samples/html/profile.html) | [profile.vue](../samples/vue/profile.vue) | [profile.astro](../samples/astro/profile.astro) |
| 料金プラン | Cards・Badge・Cluster | [pricing.html](../samples/html/pricing.html) | [pricing.vue](../samples/vue/pricing.vue) | [pricing.astro](../samples/astro/pricing.astro) |
| 通知一覧 | Tabs・List group・Badge | [notifications.html](../samples/html/notifications.html) | [notifications.vue](../samples/vue/notifications.vue) | [notifications.astro](../samples/astro/notifications.astro) |
| AIチャット | AI message・Disclosure・Forms | [ai-chat.html](../samples/html/ai-chat.html) | [ai-chat.vue](../samples/vue/ai-chat.vue) | [ai-chat.astro](../samples/astro/ai-chat.astro) |
| ファイル管理 | File drop・List group・Page rail | [files.html](../samples/html/files.html) | [files.vue](../samples/vue/files.vue) | [files.astro](../samples/astro/files.astro) |
| 空の状態・オンボーディング | Section・Forms・Progress・Cards | [empty-onboarding.html](../samples/html/empty-onboarding.html) | [empty-onboarding.vue](../samples/vue/empty-onboarding.vue) | [empty-onboarding.astro](../samples/astro/empty-onboarding.astro) |

HTML版のコピー元はリポジトリのdocs/templates内にある同名HTMLのkav-sampleマーカー内です。配布版はbuild-docs.pyで抽出します。配布先で元リポジトリを探す必要はありません。

Vue版はVue 3.5以降のSFC、Astro版はページとしてコピーします。公開パッケージを導入し、[組み込み方](frameworks.md)を参照してください。リンクは例のルート構成に合わせてあるため、コピー先のルートへ調整してください。ローカルの操作だけを実装し、フォームは送信を抑止しています。

Vueのタブ（認証・詳細・手順・通知）はKavTabsとv-model、手順の確認内容は入力モデル、チャット送信はメッセージ配列で管理します。設定と準備チェックにもv-modelを使います。Data table・カンバン・ファイルドロップはVue版では信頼済み固定HTMLをKavWidgetへ渡します。Astro版では同じ部品を通常HTMLとProviderの共通ランタイムで動かします。通常HTMLのタブ・表・カンバン・ファイルドロップのルートにdata-kav-ui-widgetを付け、初期化・破棄の対象にします。アバター・タイムライン・通知リスト・AIメッセージは専用部品がないため既存クラスのHTMLです。

Vue/Astro版のコピー元はexamples/astro/src/components/samples/*.vueとexamples/astro/src/pages/samples/*.astroです。Vue版を表示するpages/samples/vue/*.astroも設け、build:examplesが24画面を実際にコンパイルします。SFCはclient:loadでハイドレーションします。Astro側のstrict tsconfigはsrc以下を含み、astro checkで両形式を確認できます。追加のCSSや専用コンポーネントは不要です。

build-docs.pyがコンパイル対象のソースをそのままskills内とdocs/skills内へコピーし、--checkで変更・欠落・余分なコピーを検出します。配布コピーを直接編集せず、examples内のソースを変更して同期してください。
