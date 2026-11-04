# 用途別の画面サンプル（HTML）

各リンクは同梱のHTML断片です。ネットワークやカタログは不要です。アプリのmain要素内の`ui-container ui-layout`に配置し、共通のui.css / defer付きui.jsを読み込みます。フォームの送信先・リンク・IDとデータをアプリ用に変更してください。保存・認証・送信は実装していません。ウィザードの手順移動と確認表示には断片末尾のscriptも必要です。

| 用途 | 組み合わせ | 同梱サンプル |
| --- | --- | --- |
| 設定画面 | Forms・Section・Cluster | [settings.html](../samples/html/settings.html) |
| ログイン・新規登録 | Tabs・Forms | [auth.html](../samples/html/auth.html) |
| 一覧（検索・絞り込み・表） | Toolbar・Data table・Pagination | [list.html](../samples/html/list.html) |
| 詳細（タブ・補足） | Page header・Tabs・Page rail・Dialog | [detail.html](../samples/html/detail.html) |
| 入力の手順（ステップ・確認） | Tabs・Forms・Section | [wizard.html](../samples/html/wizard.html) |
| カンバン | Kanban board・Select | [kanban.html](../samples/html/kanban.html) |
| プロフィール | Avatar・Cards・Timeline | [profile.html](../samples/html/profile.html) |
| 料金プラン | Cards・Badge・Cluster | [pricing.html](../samples/html/pricing.html) |
| 通知一覧 | Tabs・List group・Badge | [notifications.html](../samples/html/notifications.html) |
| AIチャット | AI message・Disclosure・Forms | [ai-chat.html](../samples/html/ai-chat.html) |
| ファイル管理 | File drop・List group・Page rail | [files.html](../samples/html/files.html) |
| 空の状態・オンボーディング | Section・Forms・Progress・Cards | [empty-onboarding.html](../samples/html/empty-onboarding.html) |

コピー元はリポジトリのdocs/templates内にある同名HTMLのkav-sampleマーカー内です。配布版はbuild-docs.pyで抽出します。配布先で元リポジトリを探す必要はありません。
