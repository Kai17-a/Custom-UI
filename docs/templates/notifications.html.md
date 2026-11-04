<!-- Generated from docs/templates/notifications.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](notifications.html) · [llms.txt](../llms.txt)

木の葉制作室

# 通知

作業に関するお知らせを未読・既読で確認します。

すべて

未読（2）

既読

## すべての通知

- 未読：展示案へのコメント 制作チームから展示案の確認依頼が届きました。 11月4日 9:00 [関連プロジェクトを見る](detail.html.md)
- 未読：締め切りのお知らせ 案内状の確認期限は明日です。 11月4日 9:00 [関連プロジェクトを見る](detail.html.md)
- 既読：資料の共有 会場の資料が共有されました。 11月4日 9:00 [関連プロジェクトを見る](detail.html.md)

## コピー用HTML（共通ui.css / ui.jsを使用）

```
<div class="ui-page">
  <div class="ui-page-body">
    <header class="ui-page-header">
      <div class="ui-page-heading">
        <p class="ui-page-eyebrow">木の葉制作室</p>
        <h1 class="ui-page-title">通知</h1>
        <p class="ui-page-description">作業に関するお知らせを未読・既読で確認します。</p>
      </div>
    </header>
    <div data-ui-tabs>
      <div class="tabs" role="tablist" aria-label="通知の絞り込み">
        <button type="button" data-ui-toggle="tab" data-ui-target="all" aria-selected="true">すべて</button>
        <button type="button" data-ui-toggle="tab" data-ui-target="unread">未読（2）</button>
        <button type="button" data-ui-toggle="tab" data-ui-target="read">既読</button>
      </div>
      <section class="tab-panel ui-stack" data-ui-panel="all">
        <h2>すべての通知</h2>
        <ul class="list-group">
          <li class="list-group-item">
            <h3>未読：展示案へのコメント</h3>
            <p>制作チームから展示案の確認依頼が届きました。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
          <li class="list-group-item">
            <h3>未読：締め切りのお知らせ</h3>
            <p>案内状の確認期限は明日です。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
          <li class="list-group-item">
            <h3>既読：資料の共有</h3>
            <p>会場の資料が共有されました。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
        </ul>
      </section>
      <section class="tab-panel ui-stack" data-ui-panel="unread" hidden>
        <h2>未読の通知</h2>
        <ul class="list-group">
          <li class="list-group-item">
            <h3>未読：展示案へのコメント</h3>
            <p>制作チームから展示案の確認依頼が届きました。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
          <li class="list-group-item">
            <h3>未読：締め切りのお知らせ</h3>
            <p>案内状の確認期限は明日です。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
        </ul>
      </section>
      <section class="tab-panel ui-stack" data-ui-panel="read" hidden>
        <h2>既読の通知</h2>
        <ul class="list-group">
          <li class="list-group-item">
            <h3>既読：資料の共有</h3>
            <p>会場の資料が共有されました。</p>
            <p class="type-caption"><time datetime="2026-11-04T09:00:00+09:00">11月4日 9:00</time></p>
            <a href="detail.html">関連プロジェクトを見る</a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</div>
```
