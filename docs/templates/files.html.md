<!-- Generated from docs/templates/files.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](files.html) · [llms.txt](../llms.txt)

木の葉制作室

# 共有ファイル

資料を選択して内容を確認できます。選択したファイルはまだアップロードされません。

ファイルをドロップ、または選択

画像・PDF / 1件5MB、最大5件

通信とサーバー側の検証はアプリ側で接続します。

選択したファイルを送信

## ファイル一覧

- [会場メモ.txt](#file-preview) 2KB · 11月3日更新
- 案内状.pdf 420KB · プレビュー未生成

## 会場メモ.txt

入口付近に案内を配置。作品の間隔は現地で確認します。

テキストプレビューの例

## コピー用HTML（共通ui.css / ui.jsを使用）

```
<div class="ui-page">
  <div class="ui-page-body">
    <header class="ui-page-header">
      <div class="ui-page-heading">
        <p class="ui-page-eyebrow">木の葉制作室</p>
        <h1 class="ui-page-title">共有ファイル</h1>
        <p class="ui-page-description">資料を選択して内容を確認できます。選択したファイルはまだアップロードされません。</p>
      </div>
    </header>
    <form class="ui-stack" action="/files" method="post" enctype="multipart/form-data">
      <div class="ui-file-drop" data-ui-file-drop data-ui-max-size="5242880" data-ui-max-files="5">
        <input class="form-control" type="file" id="attachments" name="attachments" accept="image/*,.pdf" multiple>
        <label class="ui-file-dropzone" data-ui-file-zone for="attachments"><strong>ファイルをドロップ、または選択</strong><span class="ui-file-hint">画像・PDF / 1件5MB、最大5件</span></label>
      </div>
      <p>通信とサーバー側の検証はアプリ側で接続します。</p>
      <button class="btn btn-primary" type="submit" >選択したファイルを送信</button>
    </form>
    <div class="ui-page ui-page-with-rail">
      <section class="ui-page-body">
        <h2>ファイル一覧</h2>
        <ul class="list-group">
          <li class="list-group-item">
            <a href="#file-preview">会場メモ.txt</a>
            <p class="type-caption">2KB · 11月3日更新</p>
          </li>
          <li class="list-group-item">
            <p>案内状.pdf</p>
            <p class="type-caption">420KB · プレビュー未生成</p>
          </li>
        </ul>
      </section>
      <aside class="ui-page-rail" id="file-preview" aria-label="選択したファイルのプレビュー">
        <h2 class="ui-aside-title">会場メモ.txt</h2>
        <p>入口付近に案内を配置。作品の間隔は現地で確認します。</p>
        <p class="type-caption">テキストプレビューの例</p>
      </aside>
    </div>
  </div>
</div>
```
