<!-- Generated from docs/templates/auth.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](auth.html) · [llms.txt](../llms.txt)

木の葉制作室

# チームへようこそ

木の葉制作室の作業スペースにアクセスします。

ログイン

新規登録

## ログイン

メールアドレス

パスワード

ログイン

## コピー用HTML（共通ui.css / ui.jsを使用）

```
<div class="ui-container ui-container-sm ui-page">
  <div class="fx-grid fx-justify-center">
    <article class="ui-card fx-col-md-8">
      <div class="ui-card-body ui-page-body">
        <header class="ui-page-header">
          <div class="ui-page-heading">
            <p class="ui-page-eyebrow">木の葉制作室</p>
            <h1 class="ui-page-title">チームへようこそ</h1>
            <p class="ui-page-description">木の葉制作室の作業スペースにアクセスします。</p>
          </div>
        </header>
        <!-- 認証・登録・エラー表示はアプリ側で接続します。 -->
        <div data-ui-tabs>
          <div class="tabs" role="tablist" aria-label="アカウント">
            <button type="button" data-ui-toggle="tab" data-ui-target="signin" aria-selected="true">ログイン</button>
            <button type="button" data-ui-toggle="tab" data-ui-target="signup">新規登録</button>
          </div>
          <section class="tab-panel ui-stack" data-ui-panel="signin">
            <h2>ログイン</h2>
            <form class="ui-stack" data-ui-validate action="/session" method="post">
              <div class="field">
                <label for="login-email">メールアドレス</label>
                <input class="form-control" id="login-email" name="login-email" type="email" value="" required autocomplete="username">
              </div>
              <div class="field">
                <label for="login-password">パスワード</label>
                <input class="form-control" id="login-password" name="login-password" type="password" value="" required autocomplete="current-password">
              </div>
              <div class="ui-cluster"><button class="btn btn-primary" type="submit">ログイン</button></div>
            </form>
          </section>
          <section class="tab-panel ui-stack" data-ui-panel="signup" hidden>
            <h2>新規登録</h2>
            <form class="ui-stack" data-ui-validate action="/accounts" method="post">
              <div class="field">
                <label for="signup-name">表示名</label>
                <input class="form-control" id="signup-name" name="signup-name" type="text" value="" required autocomplete="nickname">
              </div>
              <div class="field">
                <label for="signup-email">メールアドレス</label>
                <input class="form-control" id="signup-email" name="signup-email" type="email" value="" required autocomplete="email">
              </div>
              <div class="field">
                <label for="signup-password">パスワード（12文字以上）</label>
                <input class="form-control" id="signup-password" name="signup-password" type="password" value="" required minlength="12" autocomplete="new-password">
              </div>
              <div class="ui-cluster"><button class="btn btn-primary" type="submit">アカウントを作成</button></div>
            </form>
          </section>
        </div>
      </div>
    </article>
  </div>
</div>
```
