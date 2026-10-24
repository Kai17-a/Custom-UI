# 対話的な部品

追加のライブラリや個別importは不要で、HTML版の共通CSS/JSが初期化する。動的DOMの扱いは[組み込み](integration.md)、Vue/Astroの汎用HTML境界は[フレームワーク連携](frameworks.md)を参照する。

## カレンダー・チャート

```html
<div class="ui-calendar" data-ui-calendar data-ui-calendar-modal aria-label="予定を確認">
  <ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="info">10:00 打ち合わせ</li></ul>
</div>
<figure class="ui-chart" data-ui-chart="line">
  <figcaption>週ごとの件数</figcaption>
  <script type="application/json" data-ui-chart-data>
{"label":"週ごとの件数","labels":["第1週","第2週"],"series":[{"name":"完了","values":[12,18]}],"unit":"件"}
  </script>
</figure>
```

カレンダーは現在月から始まり、`data-ui-month="YYYY-MM"`で指定もできる。日付選択の詳細は`ui:datechange`のdetailへ通知される。予定のモーダルが不要なら`data-ui-calendar-modal`を省略する。フォームの入力には[Date picker](forms-navigation.md)を使う。

チャートはline / area / bar / donutに対応する。上の例はline用。型ごとのデータ構造は利用版で確認する。JSONへ動的な値を入れるときはscript終了タグを作らないよう適切にエスケープし、利用者の文字列をHTMLへ連結しない。

## Splitter

```html
<div class="ui-splitter ui-splitter-sm" data-ui-splitter id="project-splitter">
  <section data-ui-splitter-panel data-ui-size="30" data-ui-min="15" data-ui-max="60" aria-label="一覧">
    <div class="ui-splitter-content">プロジェクト一覧</div>
  </section>
  <section data-ui-splitter-panel data-ui-size="70" data-ui-min="20" aria-label="本文">
    <div class="ui-splitter-content">選択した内容</div>
  </section>
</div>
<button class="btn btn-outline-secondary" type="button" data-ui-splitter-reset="#project-splitter">幅を戻す</button>
```

panelのsize / min / maxは割合。JSが仕切りとキーボード操作を用意する。画面全体と部品内でどちらがスクロールするかをアプリ側で決める。

## Command menu

```html
<div class="ui-command" data-ui-command aria-label="操作を検索">
  <div class="ui-command-search"><input class="ui-command-input" data-ui-command-input type="search" aria-label="操作名"></div>
  <div class="ui-command-list" data-ui-command-list>
    <button class="ui-command-item" type="button" data-ui-command-item data-ui-value="projects" data-ui-keywords="プロジェクト">一覧を開く</button>
    <button class="ui-command-item" type="button" data-ui-command-item data-ui-value="settings">設定を開く</button>
  </div>
  <p class="ui-command-empty" data-ui-command-empty hidden>一致する操作がありません。</p>
  <span data-ui-command-status role="status"></span>
</div>
```

検索・矢印・Enterで選択し、`ui:commandselect`のdetail.valueをアプリの処理へ接続する。全画面検索はこの部品をdialogへ入れる。キーワードを追加する属性と値を混同しない。

## Carousel

```html
<div class="ui-carousel" data-ui-carousel aria-label="機能紹介">
  <div class="ui-carousel-viewport" data-ui-carousel-viewport>
    <section class="ui-carousel-slide sp-p-6"><h2>プロジェクト管理</h2><p>作業をまとめます。</p></section>
    <section class="ui-carousel-slide sp-p-6"><h2>進捗の共有</h2><p>更新を確認できます。</p></section>
  </div>
  <div class="ui-carousel-controls">
    <button class="btn btn-outline-secondary" type="button" data-ui-carousel-prev>前へ</button>
    <span class="ui-carousel-status" data-ui-carousel-status></span>
    <button class="btn btn-outline-secondary" type="button" data-ui-carousel-next>次へ</button>
  </div>
</div>
```

スワイプ・キーボード・前後ボタンに対応する。任意の`data-ui-carousel-loop`で循環する。自動再生はない。
