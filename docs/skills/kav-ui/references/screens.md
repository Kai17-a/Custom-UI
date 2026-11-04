# 用途別の画面サンプル（HTML）

各リンクは同梱のHTML断片です。ネットワークやカタログは不要です。アプリのmain要素内の`ui-container ui-layout`に配置し、共通のui.css / defer付きui.jsを読み込みます。フォームの送信先・リンク・IDとデータをアプリ用に変更してください。保存・認証・送信は実装していません。ウィザードの確認表示には断片末尾のscriptも必要です。

| 用途 | 組み合わせ | 同梱サンプル |
| --- | --- | --- |
| ワークスペース設定：チームの基本情報と通知の受け取り方を変更します。 | Forms・Section・Cluster | [settings.html](../samples/html/settings.html) |
| チームへようこそ：木の葉制作室の作業スペースにアクセスします。 | Tabs・Forms | [auth.html](../samples/html/auth.html) |
| プロジェクト一覧：名前や状態（進行中・完了・準備中）を入力して絞り込めます。 | Toolbar・Data table・Pagination | [list.html](../samples/html/list.html) |
| 秋の展示会：作品と制作の背景を紹介する、チームの共同プロジェクトです。 | Page header・Tabs・Page rail・Dialog | [detail.html](../samples/html/detail.html) |
| 制作依頼を作成：入力・予定・確認の順に進めます。タブは矢印キーでも移動できます。 | Tabs・Forms・Section | [wizard.html](../samples/html/wizard.html) |
| 制作タスク：カードをドラッグ、または移動先の選択で整理できます。変更の保存はアプリ側で接続します。 | Kanban board・Select | [kanban.html](../samples/html/kanban.html) |
| こもれび：架空の制作メンバーのプロフィールです。 | Avatar・Cards・Timeline | [profile.html](../samples/html/profile.html) |
| チームに合うプラン：月額料金は税込の架空の例です。契約と決済はアプリ側で接続します。 | Cards・Badge・Cluster | [pricing.html](../samples/html/pricing.html) |
| 通知：作業に関するお知らせを未読・既読で確認します。 | Tabs・List group・Badge | [notifications.html](../samples/html/notifications.html) |
| 制作アシスタント：回答は例示です。モデルへの接続と送信処理はアプリ側で接続します。 | AI message・Disclosure・Forms | [ai-chat.html](../samples/html/ai-chat.html) |
| 共有ファイル：資料を選択して内容を確認できます。選択したファイルはまだアップロードされません。 | File drop・List group・Page rail | [files.html](../samples/html/files.html) |
| 制作を始めましょう：最初のプロジェクトを作るまでの準備を案内します。チェックの保存はアプリ側で接続します。 | Section・Forms・Progress・Cards | [empty-onboarding.html](../samples/html/empty-onboarding.html) |

コピー元はリポジトリのdocs/templates内にある同名HTMLのkav-sampleマーカー内です。配布版はbuild-docs.pyで抽出します。配布先で元リポジトリを探す必要はありません。
