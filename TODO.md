# TODO

## Vue・Astro向けパッケージ化

- [x] 既存のnpm・ビルド不要のHTML版を維持し、Vue・Astro向けパッケージを追加する。
- [x] 共通CSS・デザイントークン・テーマ・アイコン・共通処理を整理する。
- [x] 以下のパッケージ構成を検討する（名前は仮）。
  - `@kav-ui/core`：共通スタイルと処理。
  - `@kav-ui/vue`：Vueコンポーネント。
  - `@kav-ui/astro`：Astroコンポーネントとブラウザ側の処理。
- [x] Vue版を属性・スロット・イベント・`v-model`で操作できる形にする。
- [x] Vueの描画と既存JSのDOM操作を整理し、初期化・更新・破棄、イベント解除に対応する。
- [x] SSR・ハイドレーションに対応し、ブラウザ専用処理をサーバーで実行しないようにする。
- [x] Astro版は静的HTMLと必要なクライアント側JSを組み合わせ、クライアント側のページ遷移時の再初期化・後始末にも対応する。
- [x] Astroの公式Vue連携を使ってVue版を利用する方法も用意する。
- [x] パッケージの公開範囲・依存関係・型定義・CSSの読み込み方法を決める。
- [x] 各環境の導入例・カタログ・動作テストを用意する。
- [x] 共通基盤 → Vue版 → Astro専用版の順で進める。

参考：

- [Vue：カスタムディレクティブのライフサイクル](https://vuejs.org/guide/reusability/custom-directives.html#directive-hooks)
- [Astro：クライアント側スクリプト](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro：Vue連携](https://docs.astro.build/en/guides/integrations-guide/vue/)

## 実装・検証結果

- `@kav-ui/core`・`@kav-ui/vue`・`@kav-ui/astro` を追加。バージョンは `0.1.0`、現在はローカルtarball用のprivateパッケージ。
- Vueの専用部品24種、Astroの専用部品23種と、未専用化の既存部品を使う `KavWidget` を用意。
- [導入・対応範囲・検証手順](packages/README.md)、[Vue例](examples/vue)、[Astro/Vue連携例](examples/astro) を追加。
- パッケージテスト8件、型チェック、Vue SSR、Astroビルド、390/820/1440pxでの実操作、既存HTML版105件、ZIP配布テスト10件に成功。
- リポジトリ外へtarballをインストールし、Vue SSRとAstroビルドを確認。
- GitHub Issue: https://github.com/Kai17-a/Custom-UI/issues/1

## 独立レビューでの修正

新しいサブエージェントによるレビューと修正を10巡実施。最終レビューでは追加の指摘なし。

- Vueフォームのreset・イベント転送・aria-label継承、Pickerの下書きと適用の分離、外部フォームへのSelect送信を修正。
- 動的なタブ項目、初期状態で開いたサイドバー、Widgetのタグ変更に対応。
- Datepicker・Calendar・Sidebar・Splitter・入力Pickerの破棄と再初期化、外側フォーム・fieldsetの監視解除を修正。
- VueのDOM所有境界をinit・destroy・アイコンObserverで維持。アプリ全体を保護するルート属性を導入例へ追加。
- Astroの初回テーマ、ClientRouter遷移時のテーマ・カスタム配色、永続Vueアイランドを修正。
- Astro ChartのJSONからHTMLへ脱出できる問題と、公開runtimeのloading・copyの型定義漏れを修正。
- SSR・型・3画面幅の操作・後始末・永続アイランド・下書きキャンセルの回帰テストを追加。
- Safari・Firefoxは未確認。

## 公開前に残す作業

- [ ] npmスコープ・パッケージ名の利用権と、Kav-UI本体のライセンス・公開方針を確定する。
- [ ] 公開する場合はprivate設定を変更し、レジストリ公開・バージョン管理の手順を整える。

レジストリへの公開、リリースActionsの実行は行っていない。

## ライブラリ用GitHub Releasesワークフロー

- [x] HTML版とは別に、`libraries-vVERSION` タグと手動実行による3パッケージ公開を追加。
- [x] バージョン・依存一致、ビルド・テスト、SHA-256、draft経由の公開と再実行保護に対応。
- [x] 操作手順とローカルの非公開テストを追加。
- 公開先はGitHub Releases。npmレジストリへの公開、タグ作成、Actionsの実行、実リリースは行っていない。
- GitHub Issue: https://github.com/Kai17-a/Custom-UI/issues/2
