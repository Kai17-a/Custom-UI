# @kav-ui/core

Kav-UIの共通CSS・MDIのSVGパス・ブラウザ用API。CSSとランタイムは既存HTML版のassetsから生成します。

```js
import '@kav-ui/core/style.css';
import {mdiPaths,loadRuntime,mount,toast} from '@kav-ui/core';
```

import自体はSSRで安全です。`loadRuntime` / `mount` / `toast` はブラウザのマウント後に呼びます。`mount(element)` は非同期に初期化し、監視・イベント・生成UIを片付ける関数を返します。`{signal}` によるキャンセルにも対応します。従来のHTML版と異なり、パッケージの共通JSはページ内の全部品を自動で初期化しません。

CSSより前に保存済みテーマを復元する場合は、公開した `@kav-ui/core/theme-init.js` をアプリの静的資産として配信し、同期scriptで読み込めます。相対URLは配信先に合わせて指定してください。

MDIとMaterial Color UtilitiesはApache-2.0です。`dist/MDI-LICENSE`・`dist/Apache-2.0.txt`・`dist/MDI-README.md`・`dist/licenses/` とJS内の著作権表示を保持してください。Kav-UI自体のレジストリ公開とライセンスは未確定のため、現在はprivateなローカルtarballです。

詳しい構成・開発手順・Vue/Astroの例はソースリポジトリの `packages/README.md` を参照してください。
