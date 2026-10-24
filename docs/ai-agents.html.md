<!-- Generated from docs/ai-agents.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](ai-agents.html) · [llms.txt](llms.txt)

# AIエージェントで使う

Kav-UIのスキルとllms.txtを使って、導入方法やコンポーネントの仕様をAIエージェントへ渡せます。必要な資料だけを読み、既存のデザインとAPIに沿って実装するための入口です。

<a id="agent-resources"></a>

## スキルと資料の入口

- [Kav-UIスキル](skills/kav-ui/SKILL.md)：部品選択、通常HTML/Vue/Astro、テーマ、動的なDOMの扱い。
- [組み込みリファレンス](skills/kav-ui/references/integration.md)：スキルと一緒にコピーできる基本例。
- [llms.txt](llms.txt)：導入・用途別コンポーネント・パッケージの資料一覧。
- [このページのMarkdown版](ai-agents.html.md)：サイドバーを除いた本文。

スキルは[Agent Skillsの形式](https://agentskills.io/specification)、資料の入口は[llms.txtの提案](https://llmstxt.org/)を参考に用意しています。

<a id="agent-skill"></a>

## スキルを利用先へコピーする

`skills/kav-ui`を、利用するエージェントのスキル配置先へフォルダごとコピーします。スキルの取得元は[ソースZIPまたはGitHub](installation.html.md#installation-download)です。取得後は利用先にKav-UIのソースやカタログを置く必要はなく、同梱資料を使って別のプロジェクトでも実装できます。

```
skills/
  kav-ui/
    SKILL.md
    agents/openai.yaml
    references/
      integration.md
      styling.md
      forms-navigation.md
      feedback-data.md
      widgets.md
      frameworks.md
```

導入、レイアウト、フォーム、ナビゲーション、通知、表・チャートなどの部品、Vue/Astroの例を同梱しています。必要なファイルだけを読み、ネットワーク接続がない環境でも参照できます。登録先や呼び出し方は利用するエージェントの設定に合わせてください。個人の設定への自動インストールは行いません。

スキルは実装方法を案内する資料です。アプリ用のCSS/JSやパッケージは含まれないため、利用先へ別途導入します。スキルの配置先と、アプリで公開する資材の配置先は別です。

スキル名で呼び出せる環境では、例えば次のように依頼できます。

```
$kav-ui を使って、プロジェクト一覧の画面を実装してください。
既存のKav-UIの配色と余白に合わせ、Data tableの検索と行選択を使ってください。
```

ファイルを直接指定する場合は、次のように依頼します。

```
配置したKav-UIスキルのSKILL.mdを読み、このアプリの設定画面を作成してください。
スキル内の資料と、アプリに導入済みのCSS/JSを使ってください。
```

<a id="agent-llms"></a>

## llms.txtから必要な仕様を読む

このサイトの詳しい資料も参照する場合は、エージェントへ`llms.txt`のファイルパスまたはURLを渡します。スキル単独の利用にこのファイルは必須ではありません。導入資料と用途別のリンクがあり、リンク先の`.html.md`には本文とサンプルコードが入っています。

```
llms.txtを入口に、Kav-UIのData tableの仕様を確認してください。
検索・数値ソート・ページ送りのある一覧を、外部ライブラリを追加せず実装してください。
```

HTMLの各ページにはMarkdown版とllms.txtへのメタデータも付けています。Markdownの先頭にある「HTML版」から、対応する画面へ戻れます。

<a id="agent-conventions"></a>

## スキルが案内する実装方法

- 通常HTMLでは共通CSS・JSを読み込み、classとdata属性で部品を指定します。
- CSSフォルダの階層、動的DOMの初期化と後始末、カタログ専用の処理をアプリへ持ち込まないことを確認します。
- 明暗・質感・配色を分け、既存のトークンとレスポンシブ指定を使います。
- Vue/Astroでは導入済みのパッケージや汎用Widgetを選び、そのライフサイクルに合わせます。

[通常HTMLの導入方法](installation.html.md) / [Vue/Astroの導入方法](packages/README.md)

<a id="agent-maintenance"></a>

## HTMLの説明を更新したとき

本文の編集元は従来どおりHTMLです。資料を更新した後、リポジトリのルートで次を実行すると、公開用のCSS・JS・スキル資料と、Markdown・llms.txtを同期できます。Python標準ライブラリだけで動きます。

```
python3 scripts/build-docs.py
python3 scripts/build-docs.py --check
```

`--check`は書き換えずに同期を確認し、更新が必要なファイルがあれば終了コード1を返します。スキルの説明や参照資料は`skills/kav-ui`内を編集してください。
