# 通知とデータ表示

## ダイアログ・ドロワー

```html
<button type="button" class="btn btn-outline-primary" data-ui-toggle="dialog" data-ui-target="#confirm-dialog">確認する</button>
<dialog id="confirm-dialog" class="ui-dialog" data-ui-dialog aria-label="保存の確認">
  <p>この内容で保存しますか？</p>
  <button type="button" class="btn btn-primary" data-ui-dismiss="dialog">閉じる</button>
</dialog>
```

開閉、Escape、フォーカス復帰、出現・退出モーションはJSが扱う。IDは一意にする。ドロワーは同じdialogへ`ui-drawer ui-drawer-end`を追加する。位置はstart / end / top / bottom、内部領域は`ui-drawer-header`・`ui-drawer-body`・`ui-drawer-footer`で構成できる。

## トースト・画面内アラート・コピー

```html
<button class="btn btn-primary" type="button" data-ui-toast="変更内容を保存しました。" data-ui-title="保存完了" data-ui-variant="success" data-ui-toast-copy>通知を表示</button>
<div class="ui-clipboard">
  <div class="ui-clipboard-row">
    <code class="ui-clipboard-value">project-001</code>
    <button class="ui-copy-icon" type="button" data-ui-copy="project-001" aria-label="IDをコピー" title="IDをコピー"></button>
  </div>
  <p class="ui-copy-status" data-ui-copy-status role="status"></p>
</div>
```

```javascript
KavUI.toast({title:'保存しました', body:'プロジェクトを更新しました。',
  variant:'success', duration:6000, copy:true});
```

トーストは固定幅で長文を折り返す。copyは任意で、本文の末尾へ文字サイズに合わせたアイコンを付け、成功時にチェックへ変わる。durationの0は自動で閉じない。標準トーストは成功6秒・エラー自動消去なし。

独立したコピーには`data-ui-copy="文字列"`、または`data-ui-copy-target="#対象ID"`を使う。ボタン表示は上記の`ui-copy-icon`を`btn btn-outline-secondary`などへ変えてラベルを入れる。アプリのHTTP/HTTPS・ブラウザ設定によってクリップボードの許可が必要になる。

画面内に残す通知は`alert alert-info`などのalert系を選ぶ。短いヒントには`data-ui-tooltip="説明"`を使える。操作できる補足は[Popover](forms-navigation.md)を選ぶ。

## 検索・並べ替え・ページ送り

```html
<div class="ui-data-table" data-ui-data-table data-ui-page-size="5">
  <label>商品を検索<input class="form-control" type="search" data-ui-table-search></label>
  <div class="ui-table-scroll" tabindex="0" role="region" aria-label="在庫一覧">
    <table class="table"><caption>在庫一覧</caption>
      <thead><tr>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="text">商品</button></th>
        <th scope="col"><button class="ui-data-table-sort" type="button" data-ui-table-sort="number">在庫</button></th>
      </tr></thead>
      <tbody>
        <tr data-ui-row-id="note"><td>ノート</td><td data-ui-sort-value="10">10個</td></tr>
        <tr data-ui-row-id="pen"><td>ペン</td><td data-ui-sort-value="2">2個</td></tr>
      </tbody>
    </table>
  </div>
  <p data-ui-table-status role="status"></p>
  <nav class="ui-data-table-pagination" aria-label="在庫のページ送り">
    <button class="btn btn-outline-secondary" type="button" data-ui-table-prev>前へ</button>
    <span data-ui-table-page-status></span>
    <button class="btn btn-outline-secondary" type="button" data-ui-table-next>次へ</button>
  </nav>
</div>
```

| 必要な機能 | 指定 |
| --- | --- |
| 全行表示 | ルートの`data-ui-page-size="0"` |
| 件数の選択 | selectの`data-ui-table-page-size`、optionの値に件数。0は全件 |
| 日付のソート | th内buttonの`data-ui-table-sort="date"`。比較値は`data-ui-sort-value`へISO日付を指定 |
| 一部選択 | 行のcheckboxへ`data-ui-row-select`、行の識別子はtrの`data-ui-row-id` |
| 現在ページの一括選択 | ヘッダーのcheckboxへ`data-ui-table-select-all` |
| 選択数の表示 | 出力先の`data-ui-table-selection` |
| 検索語の追加・除外 | trの`data-ui-table-keywords`、tdの`data-ui-table-ignore` |

数値の表示と比較値は分離でき、ソートは昇順→降順→元の順に循環する。検索・ページ送り・行選択は表ごとに独立する。

`ui:tablechange`のevent.detailにsearch / page / pageSize / total / filtered / pageCount / sort、`ui:tableselect`に選択の情報が入る。詳細な型は利用版に合わせる。行の追加・削除後は`KavUI.init(tableRoot)`で再同期する。検索もページ送りもローカルの行だけが対象で、APIリクエストは送らない。

## ローディング・静的な状態

```html
<span class="ui-loading-status" role="status"><span class="ui-spinner ui-spinner-sm" aria-hidden="true"></span>読み込み中</span>
<label for="upload-progress">アップロード</label>
<progress id="upload-progress" class="ui-progress" max="100" value="60">60%</progress>
<div aria-busy="true" aria-label="内容を読み込み中"><div class="skeleton skeleton-shimmer" aria-hidden="true"></div></div>
```

progressはvalueを省略すると進捗未確定。完了時にaria-busyとプレースホルダーを解除する。Badge・Avatar・List group・TimelineはCSSだけの表示を選べる。空データやエラーの文面、再試行の処理はアプリ側で用意する。
