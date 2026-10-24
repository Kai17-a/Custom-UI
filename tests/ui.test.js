/* Runs in a real browser; no npm packages or test framework required. */
window.uiTestsDone = (async () => {
  const fixture = document.getElementById('fixture');
  const results = document.getElementById('results');
  const failures = [];
  let passed = 0;
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const mount = html => { fixture.innerHTML = html; KavUI.init(fixture); };
  const find = selector => fixture.querySelector(selector);
  const many = selector => [...fixture.querySelectorAll(selector)];
  async function test(name, run) {
    try {
      await run();
      passed++;
      const line = document.createElement('li'); line.textContent = 'PASS: ' + name; results.append(line);
    } catch (error) {
      failures.push(name + ': ' + error.message);
      const line = document.createElement('li'); line.textContent = 'FAIL: ' + name + ': ' + error.message; results.append(line);
    } finally {
      for (const dialog of fixture.querySelectorAll('dialog[open]')) dialog.close();
      document.querySelectorAll('.ui-toasts').forEach(region => region.remove());
      fixture.replaceChildren();
      await wait(0);
    }
  }
  const fileDropMarkup = (attrs='multiple',options='') => '<form><div data-ui-file-drop '+options+'><input type="file" id="test-file-drop" name="files" '+attrs+'><label class="ui-file-dropzone" data-ui-file-zone for="test-file-drop">ファイルを選択</label></div><button type="reset">戻す</button></form>';
  const dropFiles = (files,zone=find('[data-ui-file-zone]')) => {
    const data=new DataTransfer();files.forEach(file=>data.items.add(file));
    zone.dispatchEvent(new DragEvent('dragenter',{bubbles:true,cancelable:true,dataTransfer:data}));
    const event=new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data});zone.dispatchEvent(event);return event;
  };
  const paletteState=()=>({mode:document.documentElement.dataset.uiColorPreference,design:document.body.dataset.uiTheme,stored:['kav-ui-palette','kav-ui-custom-palette'].map(key=>[key,localStorage.getItem(key)])});
  const restorePaletteState=state=>{KavUI.setPalette('default');KavUI.setColorTheme(state.mode);KavUI.setDesignTheme(state.design);for(const [key,value] of state.stored){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}};
  await test('Custom palette: 未定義・検証・コピー・同一値と更新イベント', () => {
    const state=paletteState();const events=[];const listener=event=>events.push(event.detail);
    try {
      assert(KavUI.getCustomPalette()===null && !KavUI.setPalette('custom'),'未定義では選べない');
      document.body.addEventListener('ui:palettechange',listener);
      assert(KavUI.setCustomPalette('#7D6B91',{chroma:24}),'HEXを正規化して生成');
      assert(document.documentElement.dataset.uiPalette==='custom' && KavUI.getCustomPalette().seed==='#7d6b91','現在の配色と設定');
      const settings=KavUI.getCustomPalette();settings.seed='#ff0000';assert(KavUI.getCustomPalette().seed==='#7d6b91','設定はコピー');
      assert(events.length===1 && events[0].palette==='custom' && events[0].seed==='#7d6b91' && events[0].chroma===24,'カスタムの詳細通知');
      KavUI.setCustomPalette('#7d6b91',{chroma:24});assert(events.length===1,'同じ設定では通知を増やさない');
      KavUI.setCustomPalette('#52796f',{chroma:20});assert(events.length===2 && events[1].seed==='#52796f','同じcustom内の色変更も通知');
      for(const [seed,chroma] of [['#ff0',24],['red',24],['#000000; color:red',24],['#123456',33],['#123456',-1],['#123456',NaN],['#123456',12.5],['#123456','24']])assert(!KavUI.setCustomPalette(seed,{chroma}),'不正な設定を拒否');
      assert(events.length===2 && KavUI.getCustomPalette().seed==='#52796f','不正な更新で色と通知を変えない');
      assert(document.querySelectorAll('style[data-ui-custom-palette-style]').length===1,'生成スタイルを重複しない');
    } finally {document.body.removeEventListener('ui:palettechange',listener);restorePaletteState(state);}
  });
  await test('Custom palette: 既存配色・明暗・質感との独立と保存', () => {
    const state=paletteState();
    try {
      mount('<select class="form-select" data-ui-palette-select><option value="default">標準</option><option value="sage">セージ</option></select>');
      localStorage.removeItem('kav-ui-custom-palette');KavUI.setDesignTheme('glass');KavUI.setColorTheme('light');KavUI.setCustomPalette('#52796f',{chroma:20});
      const primary=()=>getComputedStyle(document.documentElement).getPropertyValue('--bs-primary').trim();const light=primary();
      assert(!localStorage.getItem('kav-ui-custom-palette'),'APIは既定で保存しない');
      assert(find('select').value==='custom' && find('select [value=custom]') && find('.ui-select-trigger').textContent==='カスタム','既存selectへ選択肢を追加');
      KavUI.setPalette('sage');assert(primary()!==light && document.body.dataset.uiTheme==='glass','既存パレットへ戻せる');
      KavUI.setPalette('custom',{persist:true});assert(primary()===light,'保持したカスタムへ戻す');
      const cached=JSON.parse(localStorage.getItem('kav-ui-custom-palette'));assert(cached.seed==='#52796f' && cached.chroma===20 && cached.light['--bs-primary']===light && cached.dark['--bs-primary'],'再選択でも設定と初回描画用の両配色を保存');
      KavUI.setColorTheme('dark');assert(primary()!==light && document.body.dataset.uiTheme==='glass','明暗だけ変更');
      KavUI.setColorTheme('light');assert(primary()===light,'ライトの色へ復帰');
      KavUI.init(fixture);assert(find('select').querySelectorAll('[value=custom]').length===1,'再初期化で選択肢を増やさない');
    } finally {restorePaletteState(state);}
  });
  await test('Custom palette: 高彩度・無彩色・極端な基準色でも文字コントラストを保持', () => {
    const state=paletteState();
    const luminance=hex=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const contrast=(a,b)=>{const [lo,hi]=[luminance(a),luminance(b)].sort((a,b)=>a-b);return(hi+.05)/(lo+.05);};
    try {
      for(const seed of ['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ffffff','#000000','#808080','#7d6b91'])for(const chroma of [0,24,32]) {
        assert(KavUI.setCustomPalette(seed,{chroma}),'入力色を受け付ける');
        for(const mode of ['light','dark']) {
          KavUI.setColorTheme(mode);const css=getComputedStyle(document.documentElement),value=key=>css.getPropertyValue('--md-sys-color-'+key).trim();
          for(const role of ['primary','secondary','tertiary','error'])assert(contrast(value(role),value('on-'+role))>=4.5 && contrast(value(role+'-container'),value('on-'+role+'-container'))>=4.5,'Materialの前景・背景のトーン対');
          assert(contrast(value('surface'),value('on-surface'))>=7,'本文のトーン対');
          if(chroma===0 || ['#ffffff','#000000','#808080'].includes(seed)) {const p=value('primary');assert(p.slice(1,3)===p.slice(3,5) && p.slice(3,5)===p.slice(5,7),'グレーは無彩色を保つ');}
        }
      }
    } finally {restorePaletteState(state);}
  });
  await test('Custom palette editor: 適用前は保持・検証・複数フォーム同期・リセット・保存', async () => {
    const state=paletteState(),persist=document.body.hasAttribute('data-ui-theme-persist');
    const editor=id=>'<form data-ui-palette-editor><label for="seed-'+id+'">基準色</label><input id="seed-'+id+'" data-ui-palette-seed value="#52796f" required><input type="number" min="0" max="32" step="1" value="24" data-ui-palette-chroma><output data-ui-palette-chroma-output></output><button type="submit">適用</button><button type="reset">戻す</button><p role="status" data-ui-palette-status></p></form>';
    try {
      mount(editor('one')+editor('two'));document.body.setAttribute('data-ui-theme-persist','');
      const form=find('form'),seed=form.querySelector('[data-ui-palette-seed]'),chroma=form.querySelector('[data-ui-palette-chroma]');const before=document.documentElement.dataset.uiPalette;
      seed.value='#52796f';chroma.value='20';chroma.dispatchEvent(new Event('input',{bubbles:true}));assert(document.documentElement.dataset.uiPalette===before && form.querySelector('output').textContent==='20','編集中は全体の色を変えない');
      form.requestSubmit();assert(document.documentElement.dataset.uiPalette==='custom' && form.querySelector('[role=status]').textContent.includes('適用しました'),'送信せず適用');
      assert(many('[data-ui-palette-seed]').every(input=>input.value==='#52796f') && many('[data-ui-palette-chroma]').every(input=>input.value==='20'),'他のフォームも同期');
      assert(JSON.parse(localStorage.getItem('kav-ui-custom-palette')).seed==='#52796f','フォームからの保存');
      seed.value='invalid';form.requestSubmit();assert(form.querySelector('[data-ui-error]') && KavUI.getCustomPalette().seed==='#52796f','不正入力は配色を壊さない');
      seed.value='#ffffff';chroma.value='10';form.reset();await wait(10);assert(seed.value==='#52796f' && chroma.value==='20' && !form.querySelector('[data-ui-error]'),'最後に適用した値へ入力だけ戻す');
      KavUI.init(fixture);let changes=0;const listener=()=>changes++;document.body.addEventListener('ui:palettechange',listener);seed.value='#7d6b91';form.requestSubmit();document.body.removeEventListener('ui:palettechange',listener);assert(changes===1,'initを重ねても1回だけ適用');
    } finally {document.body.toggleAttribute('data-ui-theme-persist',persist);restorePaletteState(state);}
  });

  await test('Palette: APIの検証・独立性・イベント・同期・保存', () => {
    const saved=localStorage.getItem('kav-ui-palette'),design=document.body.dataset.uiTheme,mode=document.documentElement.dataset.uiColorPreference;
    try {
      mount('<div><button data-ui-palette-value="sage">セージ</button><button data-ui-palette-value="clay" disabled>クレイ</button><select class="form-select" data-ui-palette-select><option value="default">標準</option><option value="sage">セージ</option><option value="clay">クレイ</option></select><select data-ui-palette-select><option value="default">標準</option><option value="sage">セージ</option><option value="clay">クレイ</option></select></div>');
      let events=0;const onChange=event=>{events++;assert(event.detail.palette==='sage','通知に選択値');};document.body.addEventListener('ui:palettechange',onChange);
      try {
        localStorage.setItem('kav-ui-palette','clay');KavUI.setDesignTheme('glass');KavUI.setColorTheme('dark');
        assert(KavUI.setPalette('sage'),'有効なパレット');assert(document.documentElement.dataset.uiPalette==='sage' && document.body.dataset.uiTheme==='glass' && document.documentElement.dataset.bsTheme==='dark','配色だけを変更');
        assert(many('select').every(select=>select.value==='sage') && find('[data-ui-palette-value=sage]').getAttribute('aria-pressed')==='true' && find('.ui-select-trigger').textContent==='セージ','ネイティブとカスタムUIの同期');
        assert(events===1 && localStorage.getItem('kav-ui-palette')==='clay','APIは既定で保存しない');
        KavUI.setPalette('sage');assert(events===1,'同じ値では通知を重複させない');
        assert(!KavUI.setPalette('neon') && document.documentElement.dataset.uiPalette==='sage','不明な値では変更しない');
        find('[data-ui-palette-value=clay]').click();assert(document.documentElement.dataset.uiPalette==='sage','無効なボタンは操作できない');
        KavUI.setPalette('sage',{persist:true});assert(localStorage.getItem('kav-ui-palette')==='sage','明示した場合だけ保存');
        const newControl=document.createElement('button');newControl.dataset.uiPaletteValue='sage';fixture.append(newControl);KavUI.init(fixture);assert(newControl.getAttribute('aria-pressed')==='true' && events===1,'再初期化・動的追加でも選択状態を維持');
      } finally {document.body.removeEventListener('ui:palettechange',onChange);}
    } finally {KavUI.setPalette('default');KavUI.setDesignTheme(design);KavUI.setColorTheme(mode);if(saved===null)localStorage.removeItem('kav-ui-palette');else localStorage.setItem('kav-ui-palette',saved);}
  });
  await test('Palette: 属性から操作し、persistの指定と独立したキーを守る', () => {
    const saved=localStorage.getItem('kav-ui-palette'),persist=document.body.hasAttribute('data-ui-theme-persist');
    try {
      mount('<button data-ui-palette-value="teal">ティール</button><select data-ui-palette-select><option value="default">標準</option><option value="teal">ティール</option><option value="sand">サンド</option></select>');
      document.body.removeAttribute('data-ui-theme-persist');localStorage.removeItem('kav-ui-palette');find('button').click();assert(document.documentElement.dataset.uiPalette==='teal' && localStorage.getItem('kav-ui-palette')===null,'属性なしではページ内だけ変更');
      document.body.setAttribute('data-ui-theme-persist','');const design=localStorage.getItem('kav-ui-design-theme'),mode=localStorage.getItem('kav-ui-theme');
      find('select').value='sand';find('select').dispatchEvent(new Event('change',{bubbles:true}));assert(document.documentElement.dataset.uiPalette==='sand' && localStorage.getItem('kav-ui-palette')==='sand','selectから保存');
      assert(localStorage.getItem('kav-ui-design-theme')===design && localStorage.getItem('kav-ui-theme')===mode,'質感・明暗の保存値を変更しない');
      KavUI.setPalette('default');assert(!document.documentElement.style.getPropertyValue('--bs-primary'),'既定へ戻すためのインライン上書きは不要');
    } finally {KavUI.setPalette('default');document.body.toggleAttribute('data-ui-theme-persist',persist);if(saved===null)localStorage.removeItem('kav-ui-palette');else localStorage.setItem('kav-ui-palette',saved);}
  });
  await test('Palette: 6配色×明暗でロールの文字コントラストと意味色を確認', async () => {
    const design=document.body.dataset.uiTheme,mode=document.documentElement.dataset.uiColorPreference;
    const luminance=color=>{const c=color.match(/[\d.]+/g).slice(0,3).map(Number).map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (values[1]+.05)/(values[0]+.05);};
    try {
      mount('<button class="btn btn-primary">主要操作</button><button class="btn btn-success">成功</button><button class="btn btn-warning">警告</button><button class="btn btn-danger">エラー</button><button class="btn btn-info">情報</button><input class="form-control" value="入力"><input class="form-check-input" type="checkbox" checked>');KavUI.setDesignTheme('default');
      for(const colorMode of ['light','dark']) {
        let success=null;const colors=new Set();KavUI.setColorTheme(colorMode);
        for(const palette of ['slate','sage','teal','mauve','sand','clay']) {
          KavUI.setPalette(palette);await wait(180);colors.add(getComputedStyle(find('.btn-primary')).backgroundColor);
          for(const button of many('.btn')) {const css=getComputedStyle(button);assert(contrast(css.color,css.backgroundColor)>=4.5,palette+' '+colorMode+' '+button.textContent+'の文字コントラスト');}
          const background=getComputedStyle(find('.btn-success')).backgroundColor;if(success===null)success=background;else assert(success===background,'成功の色相はパレットに依存しない');
          const body=getComputedStyle(document.body);assert(contrast(body.color,body.backgroundColor)>=7,'本文と背景のコントラスト');
          assert(getComputedStyle(find('.form-check-input')).backgroundImage.includes('%23'),'チェックの前景SVG');
        }
        assert(colors.size===6,'6種類の主色を区別');
      }
    } finally {KavUI.setPalette('default');KavUI.setDesignTheme(design);KavUI.setColorTheme(mode);}
  });

  await test('Chart: 4種類のSVG・読み上げ名・正確なデータ表・安全な文字列', () => {
    mount('<figure id="chart-test" data-ui-chart="line"><figcaption>サンプル</figcaption><script type="application/json" data-ui-chart-data>{"labels":[],"series":[]}</script></figure>');
    const root=find('#chart-test');
    for(const type of ['line','area','bar','donut']) {
      const label='<img src=x onerror=alert(1)>',config={type,label:'比較',unit:'件',labels:[label,'B'],series:[{name:'<script>text</script>',values:[10.125,20]}]};
      assert(KavUI.chart(root,config),'有効な設定');
      const svg=root.querySelector('svg');assert(svg.getAttribute('role')==='img' && document.getElementById(svg.getAttribute('aria-labelledby')).textContent.includes('比較'),'SVGの読み上げ名');
      assert(root.querySelector('tbody th').textContent===label && root.querySelector('td').textContent==='10.125件' && !root.querySelector('img'),'値を丸めず安全なテキスト表示');
      assert(root.querySelector('figcaption').textContent==='サンプル','既存の見出しを維持');
      assert(!svg.outerHTML.includes('NaN') && !svg.outerHTML.includes('Infinity'),'有効な座標');
      if(type==='bar')assert(svg.querySelectorAll('rect').length===2,'項目ごとの棒');
      if(type==='area')assert(svg.querySelector('polygon'),'面の塗り');
      if(type==='donut')assert(svg.querySelectorAll('path').length===2 && svg.textContent.includes('30.13'),'合計と割合');
    }
  });
  await test('Chart: 負数・0・単一項目・再初期化・イベント', () => {
    mount('<div id="chart-signed"></div>');const root=find('#chart-signed');let updates=0,detail;
    root.addEventListener('ui:chartupdate',event=>{updates++;detail=event.detail;});
    const config={type:'bar',labels:['増加','減少'],series:[{name:'差分',values:[20,-10]}]};
    assert(KavUI.chart(root,config) && updates===1 && detail.series[0].values[1]===-10,'更新の通知');
    const bars=[...root.querySelectorAll('rect')];assert(bars.every(bar=>+bar.getAttribute('height')>0) && +bars[0].getAttribute('y')<+bars[1].getAttribute('y'),'負数はゼロ線の下へ');
    config.series[0].values[0]=999;detail.series[0].values[0]=999;KavUI.init(root);
    assert(root.querySelector('td').textContent==='20' && updates===1,'呼び出し元・イベントからの変更と再初期化は既存データを変えない');
    for(const type of ['line','area','bar']) {
      KavUI.chart(root,{type,labels:['A'],series:[{values:[0]}]});assert(root.querySelector('svg') && !root.querySelector('svg').outerHTML.includes('NaN'),'0の単一項目');
    }
  });
  await test('Chart: 空状態・不正JSON/値/種類を局所化し、正常なデータで復帰', () => {
    mount('<figure id="chart-errors" data-ui-chart="line"><script type="application/json" data-ui-chart-data>{broken}</script></figure>');
    const root=find('#chart-errors');assert(root.querySelector('[role=status]').textContent.includes('表示できません'),'不正JSONでも初期化を中断しない');let errors=0;root.addEventListener('ui:charterror',()=>errors++);
    const good={type:'bar',labels:['A'],series:[{values:[1]}]};
    for(const config of [{...good,type:'unknown'},{...good,series:[{values:[]}]},{...good,series:[{values:[NaN]}]},{...good,series:[{values:['1']}]},{...good,type:'donut',series:[{values:[-1]}]},{...good,series:[{values:[1e13]}]},null]) {
      assert(!KavUI.chart(root,config) && !root.querySelector('svg') && root.querySelector('[role=status]'),'無効な設定はfalseと説明');
    }
    assert(errors===7,'エラー通知は各更新につき1回');
    assert(KavUI.chart(root,good) && root.querySelector('svg') && !root.querySelector('[role=status]'),'正常な設定で復帰');
    KavUI.chart(root,{type:'line',labels:[],series:[]});assert(root.textContent.includes('データがありません') && !root.querySelector('svg'),'未登録データ');
    KavUI.chart(root,{type:'donut',labels:['A'],series:[{values:[0]}]});assert(!root.querySelector('svg') && root.querySelector('td').textContent==='0','合計0でもデータ表を用意');
    KavUI.chart(root,{type:'donut',labels:['全体'],series:[{values:[1]}]});assert(root.querySelectorAll('svg circle').length===2 && !root.querySelector('svg path'),'1項目100%でも完全な円');
    assert(!KavUI.chart('#missing-chart',good) && !KavUI.chart('[invalid',good),'不明な参照はfalse');
  });
  await test('Chart: 幅変更でもデータ表の開閉とフォーカスを維持', async () => {
    mount('<div id="chart-resize"></div>');const root=find('#chart-resize');root.style.width='260px';
    KavUI.chart(root,{type:'line',labels:['A','B'],series:[{name:'数値',values:[10,20]}]});
    const details=root.querySelector('details'),summary=root.querySelector('summary');details.open=true;summary.focus();
    root.style.width='245px';await wait(60);
    assert(root.querySelector('svg').getAttribute('viewBox').startsWith('0 0 245 '),'幅に応じて座標を再描画');
    assert(root.querySelector('details')===details && details.open && document.activeElement===summary,'表とフォーカスは保持');
    KavUI.chart(root,{type:'bar',labels:['更新'],series:[{values:[42]}]});assert(root.querySelector('details').open && root.querySelector('td').textContent==='42','更新後も表を開いた状態を保持');
  });

  const menuMarkup = () => '<button id="menu-open" data-ui-toggle="dropdown" data-ui-target="#test-menu">操作</button><div id="test-menu" data-ui-dropdown popover><button class="ui-dropdown-item" data-ui-value="first">最初</button><button class="ui-dropdown-item" disabled>無効</button><a class="ui-dropdown-item" href="#bad" aria-disabled="true">無効リンク</a><button class="ui-dropdown-item" data-ui-value="last">最後</button></div><button id="menu-after">次へ</button>';
  await test('メニューからモーダルを開いても見える操作へフォーカスを戻す', async () => {
    mount('<button id="menu-dialog-open" data-ui-toggle="dropdown" data-ui-target="#menu-dialog-menu">操作</button><div id="menu-dialog-menu" data-ui-dropdown popover><button class="ui-dropdown-item" data-ui-toggle="dialog" data-ui-target="#menu-dialog-modal">設定</button></div><dialog id="menu-dialog-modal" class="ui-dialog" data-ui-dialog aria-label="設定"><button data-ui-dismiss="dialog">閉じる</button></dialog>');
    find('#menu-dialog-open').click();find('.ui-dropdown-item').click();assert(find('dialog').open && !find('[popover]').matches(':popover-open'),'メニューを閉じてモーダルを開く');
    find('dialog button').click();await wait(0);assert(document.activeElement===find('#menu-dialog-open'),'非表示の項目ではなく元のメニューボタンへ復帰');
  });
  await test('DropdownのARIA・矢印・無効項目・選択・フォーカス復帰', () => {
    mount(menuMarkup());const trigger=find('#menu-open'),panel=find('#test-menu');let value='',count=0;
    panel.addEventListener('ui:menuselect',event=>{value=event.detail.value;count++;});
    KavUI.init(fixture);trigger.click();
    assert(panel.matches(':popover-open') && trigger.getAttribute('aria-expanded')==='true' && trigger.getAttribute('aria-haspopup')==='menu','メニューとトリガーのARIA');
    assert(document.activeElement===panel.querySelector('button'),'最初の項目へフォーカス');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiValue==='last','無効な項目を飛ばす');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiValue==='first','Homeで先頭');
    panel.querySelector('[aria-disabled]').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    assert(panel.matches(':popover-open') && !count,'無効リンクは選択しない');
    panel.querySelector('[data-ui-value=last]').click();assert(!panel.matches(':popover-open') && trigger.getAttribute('aria-expanded')==='false' && document.activeElement===trigger && value==='last' && count===1,'選択・閉じる・通知は各1回');
    trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));assert(document.activeElement.dataset.uiValue==='last','上矢印で最後から開く');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert(!panel.matches(':popover-open') && document.activeElement===trigger,'Escapeで復帰');
  });
  await test('Popoverのフォーム操作・API・複数トリガー・動的項目', () => {
    mount('<button id="pop-open" data-ui-toggle="popover" data-ui-target="#test-pop">説明</button><button id="pop-open-two" data-ui-toggle="popover" data-ui-target="#test-pop">別の説明</button><div id="test-pop" data-ui-popover popover aria-label="設定"><input aria-label="名前" autofocus><button data-ui-dismiss="popover">閉じる</button></div>'+menuMarkup());
    const trigger=find('#pop-open'),other=find('#pop-open-two'),panel=find('#test-pop');
    KavUI.show(panel,trigger);assert(panel.matches(':popover-open') && document.activeElement===panel.querySelector('input') && other.getAttribute('aria-expanded')==='true','自由な内容と複数トリガー');
    panel.querySelector('input').value='入力を維持';panel.querySelector('button').click();assert(!panel.matches(':popover-open') && document.activeElement===trigger && other.getAttribute('aria-expanded')==='false','閉じるボタンとARIA同期');
    other.click();assert(panel.querySelector('input').value==='入力を維持','閉じても入力値を維持');KavUI.hide(panel);assert(document.activeElement===other,'APIで閉じて開いた操作へ戻る');
    const menu=find('#test-menu'),added=document.createElement('button');added.className='ui-dropdown-item';added.textContent='追加';menu.append(added);KavUI.init(menu);assert(added.getAttribute('role')==='menuitem','動的に追加した項目を初期化');
  });
  await test('Drawerは画面内に収まり背景スクロールを止めて戻す', async () => {
    mount('<button id="drawer-open" data-ui-toggle="dialog" data-ui-target="#test-drawer">開く</button><dialog id="test-drawer" class="ui-dialog ui-drawer" data-ui-dialog aria-label="設定"><header class="ui-drawer-header"><h2>設定</h2></header><div class="ui-drawer-body"><input aria-label="名前"></div><footer class="ui-drawer-footer"><button data-ui-dismiss="dialog">閉じる</button></footer></dialog>');
    const trigger=find('#drawer-open'),panel=find('#test-drawer');trigger.focus();trigger.click();panel.getAnimations().forEach(animation=>animation.finish());
    const bounds=panel.getBoundingClientRect();assert(panel.open && bounds.left>=0 && bounds.right<=innerWidth+1 && bounds.height<=innerHeight+1,'画面幅と高さに収まる');
    assert(getComputedStyle(document.documentElement).overflow==='hidden','背景スクロールを止める');
    panel.querySelector('button').click();await wait(0);assert(!panel.open && getComputedStyle(document.documentElement).overflow!=='hidden' && document.activeElement===trigger,'閉じてスクロールとフォーカスを戻す');
  });
  await test('Input groupの値・標準radioグループ・チェック付きリスト', () => {
    mount('<form><div class="ui-input-group"><span class="ui-input-addon">@</span><input id="group-user" class="form-control" aria-label="ユーザー" name="user" value="kaito"><button class="btn" type="button">確認</button></div><div class="ui-button-group"><label class="btn"><input class="visually-hidden" type="radio" name="view" value="list" checked>一覧</label><label class="btn"><input class="visually-hidden" type="radio" name="view" value="cards">カード</label></div><div class="ui-list-group"><label class="ui-list-item"><input type="checkbox" class="form-check-input" name="notify">通知</label></div></form>');
    const input=find('#group-user'),rect=input.getBoundingClientRect(),group=find('.ui-input-group').getBoundingClientRect();assert(rect.width>0 && rect.right<=group.right,'入力欄は残りの幅に収まる');
    many('.ui-button-group label')[1].click();find('.ui-list-item').click();const values=new FormData(find('form'));assert(values.get('view')==='cards' && values.get('user')==='kaito' && values.has('notify'),'HTML標準の選択とフォーム値を維持');
  });
  await test('大きな画像は親幅に収まり縦横比を維持', async () => {
    mount('<div id="image-parent" class="ui-w-full"></div>');
    const image=new Image();image.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="gray"/></svg>';
    await image.decode();find('#image-parent').append(image);
    const rect=image.getBoundingClientRect();
    assert(rect.width<=find('#image-parent').clientWidth+.5 && Math.abs(rect.width/rect.height-2)<.01,'クラスなし画像の幅と比率を保つ');
  });
  await test('PC基本・タブレット・スマートフォンの列数／間隔／文字／表示', () => {
    mount('<div id="device-grid" class="fx-grid fx-grid-3 tablet:fx-grid-2 mobile:fx-grid-1 fx-gap-4 tablet:sp-gap-3 mobile:sp-gap-2"><div>1</div><div>2</div><div>3</div></div><p id="device-type" class="type-size-2xl tablet:type-size-xl mobile:type-size-lg">見出し</p><div id="device-space" class="sp-p-6 tablet:sp-p-4 mobile:sp-p-3"></div><span id="tablet-only" class="ui-hidden tablet:ui-block">タブレット</span><span id="mobile-hide" class="ui-block mobile:ui-hidden">PC・タブレット</span><span id="native-hidden" hidden class="ui-block tablet:ui-block mobile:ui-block">非表示を維持</span>');
    const phone=innerWidth<768,tablet=innerWidth>=768&&innerWidth<1024,cols=phone?1:tablet?2:3;
    const grid=find('#device-grid'),cells=[...grid.children],rect=cells.map(el=>el.getBoundingClientRect());
    assert(rect.slice(0,cols).every(r=>Math.abs(r.top-rect[0].top)<1) && (cols===3 || rect[cols].top>rect[0].top),'画面幅に応じて列数を変更');
    const gap=phone?8:tablet?12:16;
    assert(getComputedStyle(grid).gap===gap+'px' && Math.abs(rect[0].width*cols+gap*(cols-1)-grid.clientWidth)<2,'余白と列幅が一致');
    assert(getComputedStyle(find('#device-type')).fontSize===(phone?'16px':tablet?'18px':'24px'),'端末別の文字サイズ');
    assert(getComputedStyle(find('#device-space')).paddingTop===(phone?'12px':tablet?'16px':'24px'),'端末別の余白');
    assert((getComputedStyle(find('#tablet-only')).display!=='none')===tablet && (getComputedStyle(find('#mobile-hide')).display==='none')===phone,'表示・非表示の上書きと端末範囲');
    assert(getComputedStyle(find('#native-hidden')).display==='none','hidden属性は表示クラスで解除されない');
  });
  await test('明暗切り替えのアイコン・読み上げ・既存テキストボタン', () => {
    const original=document.documentElement.dataset.uiColorPreference;
    try {
      mount('<button data-ui-toggle="theme" data-ui-theme-icon></button><button data-ui-toggle="theme">テーマ</button>');
      const icon=find('[data-ui-theme-icon]'),text=many('button')[1];
      for(const mode of ['light','dark']) {
        KavUI.setColorTheme(mode);
        assert(icon.getAttribute('icon')===(mode==='light'?'mdi-weather-night':'mdi-weather-sunny'),'切り替え先のアイコン');
        assert(icon.getAttribute('aria-label')===(mode==='light'?'ダークに切替':'ライトに切替') && icon.title===icon.getAttribute('aria-label'),'読み上げとツールチップを同期');
        assert(icon.querySelectorAll('svg').length===1 && !icon.textContent && text.textContent===icon.getAttribute('aria-label'),'アイコンのみ表示、テキスト版も維持');
        icon.querySelector('path').dispatchEvent(new MouseEvent('click',{bubbles:true}));
        assert(document.documentElement.dataset.bsTheme!==mode,'SVGのクリックで切り替え');
      }
      KavUI.init(fixture);assert(icon.querySelectorAll('svg').length===1,'再初期化でアイコンを増やさない');
    } finally {KavUI.setColorTheme(original || 'system');}
  });
  await test('クラスなしHTMLの文字スタイルとクラスでの上書き', () => {
    mount('<article><h1>ページ</h1><h2>項目</h2><h3>詳細</h3><p>本文<strong>重要</strong><small>補足</small></p><ul><li>一覧</li></ul><blockquote><p>引用</p></blockquote><pre><code>const value = 1;</code></pre><h2 class="type-size-3xl type-weight-normal type-leading-loose">調整した見出し</h2></article>');
    assert(getComputedStyle(find('h1')).fontSize==='24px' && getComputedStyle(find('h1')).fontWeight==='600','ページ見出しの基準');
    assert(getComputedStyle(find('h2')).fontSize==='18px' && getComputedStyle(find('h3')).fontSize==='16px','見出しの階層');
    assert(getComputedStyle(find('p')).fontSize==='14px' && getComputedStyle(find('small')).fontSize==='13px' && getComputedStyle(find('strong')).fontWeight==='600','本文・補足・強調');
    assert(getComputedStyle(find('ul')).paddingInlineStart==='24px' && getComputedStyle(find('blockquote')).borderInlineStartWidth==='2px','リストと引用の共通スタイル');
    assert(getComputedStyle(find('pre code')).fontSize===getComputedStyle(find('pre')).fontSize,'コードの二重縮小を防ぐ');
    const adjusted=getComputedStyle(find('h2.type-size-3xl'));
    assert(adjusted.fontSize==='30px' && adjusted.fontWeight==='400' && adjusted.lineHeight==='60px','ユーティリティでベースを上書き可能');
  });
  await test('ファイルドロップ・FormData・削除・イベント・再初期化', () => {
    mount(fileDropMarkup());const root=find('[data-ui-file-drop]'),input=find('input');let changes=0,inputs=0,notices=0;
    input.addEventListener('change',()=>changes++);input.addEventListener('input',()=>inputs++);root.addEventListener('ui:filechange',()=>notices++);
    KavUI.init(root);assert(many('.ui-file-list').length===1,'再初期化で一覧を増やさない');
    assert(dropFiles([new File(['abc'],'<img src=x>.txt',{type:'text/plain'}),new File(['xyz'],'other.txt')]).defaultPrevented,'ブラウザのファイル表示を防止');
    assert(input.files.length===2 && new FormData(find('form')).getAll('files').length===2,'標準FileListとFormDataへ反映');
    assert(many('.ui-file-list li').length===2 && !find('.ui-file-list img') && find('.ui-file-name').textContent==='<img src=x>.txt','ファイル名を文字列として表示');
    assert(changes===1 && inputs===1 && notices===1 && !root.hasAttribute('data-ui-file-dragging'),'イベントは各1回、ドロップ強調解除');
    find('.ui-file-list button').click();assert(input.files.length===1 && input.files[0].name==='other.txt' && document.activeElement===input,'個別削除とフォーカス復帰');
    dropFiles([new File(['a'],'replace.txt')]);assert(input.files.length===1 && input.files[0].name==='replace.txt','再選択は一覧を置換');
  });
  await test('ファイルの形式・サイズ・件数エラーは既存選択を維持', () => {
    mount(fileDropMarkup('multiple accept=".txt,image/*"','data-ui-max-size="4" data-ui-max-files="2"'));const input=find('input');
    dropFiles([new File(['ok'],'good.txt')]);
    for(const files of [[new File(['x'],'bad.pdf',{type:'application/pdf'})],[new File(['12345'],'big.txt')],[new File(['1'],'1.txt'),new File(['2'],'2.txt'),new File(['3'],'3.txt')]]) {
      dropFiles(files);assert(!find('.ui-file-error').hidden && input.files.length===1 && input.files[0].name==='good.txt','拒否理由を表示して前の値を維持');
    }
    const transfer=new DataTransfer();transfer.items.add(new File(['x'],'native.pdf',{type:'application/pdf'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
    assert(input.files[0].name==='good.txt' && !find('.ui-file-error').hidden,'クリック選択にも制限を適用');
    dropFiles([new File(['1234'],'UPPER.TXT'),new File(['x'],'photo.png',{type:'image/png'})]);assert(input.files.length===2 && find('.ui-file-error').hidden,'境界値・拡張子の大文字・MIMEワイルドカード');
    assert(find('.ui-file-status').textContent.includes('2件'),'選択件数を読み上げ');
  });
  await test('単一・必須・disabled・リセット・リセット取り消し', async () => {
    mount(fileDropMarkup('required accept="text/plain"'));const input=find('input');assert(!input.checkValidity(),'未選択のrequired');
    dropFiles([new File(['x'],'one.txt',{type:'text/plain'}),new File(['y'],'two.txt',{type:'text/plain'})]);assert(!input.files.length,'multipleなしで複数ファイルを拒否');
    dropFiles([new File(['x'],'one.txt',{type:'text/plain'})]);assert(input.checkValidity(),'選択後のrequired');
    input.disabled=true;await wait(0);dropFiles([new File(['y'],'two.txt',{type:'text/plain'})]);assert(input.files[0].name==='one.txt' && find('.ui-file-list button').disabled,'disabledでは変更できない');
    input.disabled=false;find('form').addEventListener('reset',event=>event.preventDefault(),{once:true});find('form').reset();await wait(0);assert(input.files.length===1,'取り消したresetは維持');
    find('form').reset();await wait(0);assert(!input.files.length && find('.ui-file-list').hidden && find('.ui-file-error').hidden,'resetで一覧とエラーを戻す');
  });
  await test('属性アイコンのサイズ・色・ラベル・既存操作を維持', () => {
    mount('<button class="btn" icon="mdi-home" aria-label="ホーム"><span>戻る</span></button><span icon="mdi-star" class="ui-icon-lg" style="color:var(--bs-danger)" role="img" aria-label="お気に入り"></span>');
    const button=find('button'), svg=button.querySelector('svg');let clicks=0;button.addEventListener('click',()=>clicks++);
    svg.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    assert(clicks===1 && button.textContent==='戻る' && button.getAttribute('aria-label')==='ホーム','ラベルとクリックを維持');
    assert(svg.getAttribute('aria-hidden')==='true' && svg.getAttribute('focusable')==='false','装飾SVGは読み上げ・フォーカス対象外');
    const icon=find('[icon="mdi-star"]');
    assert(icon.querySelector('svg').getBoundingClientRect().width===32 && getComputedStyle(icon.querySelector('path')).fill===getComputedStyle(icon).color,'サイズと文字色を継承');
    KavUI.init(button);assert(button.querySelectorAll('svg').length===1 && button.firstChild===svg,'繰り返し初期化で重複しない');
  });
  await test('動的な属性アイコン・変更・削除・不明な名前と代替表示', async () => {
    mount('<span id="dynamic-icon">代替</span>');
    const host=find('#dynamic-icon');host.setAttribute('icon','mdi-home');await wait(0);
    const first=host.querySelector('path').getAttribute('d');
    host.setAttribute('icon','mdi-star');await wait(0);
    assert(host.querySelector('path').getAttribute('d')!==first && host.querySelectorAll('svg').length===1,'属性変更で置換');
    host.setAttribute('icon','__proto__');await wait(0);assert(!host.querySelector('svg') && host.textContent==='代替','不明な名前で例外を出さず代替を維持');
    host.setAttribute('icon','mdi-home');await wait(0);host.removeAttribute('icon');await wait(0);assert(!host.querySelector('svg'),'属性削除で生成SVGだけ削除');
    const added=document.createElement('div');added.innerHTML='<i icon="mdi-menu"></i>';fixture.append(added);await wait(0);assert(added.querySelector('svg path'),'動的追加を自動検出');
  });
  await test('複数の開閉領域・ARIA同期・繰り返し初期化', () => {
    mount('<button data-ui-toggle="collapse" data-ui-target="#one">開閉1</button><button data-ui-toggle="collapse" data-ui-target="#one">開閉1B</button><div id="one" hidden>1</div><button data-ui-toggle="collapse" data-ui-target="#two">開閉2</button><div id="two" hidden>2</div>');
    KavUI.init(fixture); KavUI.init(fixture);
    const buttons = many('button'); buttons[0].click();
    assert(!find('#one').hidden && find('#two').hidden, '他の領域へ影響しない');
    assert(buttons[1].getAttribute('aria-expanded') === 'true', '同じ領域の別ボタンも同期');
    buttons[1].click(); assert(find('#one').hidden, '二重ハンドラーを登録しない');
    assert(getComputedStyle(find('#one')).display === 'none', 'ui.cssだけでhiddenが有効');
  });
  await test('サイドバーのレイアウト・ラベル同期', () => {
    mount('<button data-ui-toggle="sidebar" data-ui-target="#side" data-ui-label-open="閉じる" data-ui-label-closed="開く">切替</button><div class="app-shell"><aside class="app-sidebar" id="side">メニュー</aside><div>本文</div></div>');
    find('button').click();
    assert(find('#side').hidden && find('.app-shell').dataset.sidebarCollapsed === 'true', '幅も閉じる');
    assert(find('button').textContent === '開く', 'ボタンのラベルを更新');
  });
  await test('ID不要のアラート・個別の閉じる操作・フォーカス', () => {
    mount('<div id="notice" class="alert alert-success"><button data-ui-dismiss="alert">閉じる1</button></div><button data-ui-toggle="show" data-ui-target="#notice">再表示</button><div class="alert alert-info"><button data-ui-dismiss="alert">閉じる2</button></div>');
    const close = find('[data-ui-dismiss]'); close.focus(); close.click();
    assert(find('#notice').hidden && !many('.alert')[1].hidden, '他のアラートは維持');
    assert(document.activeElement === find('[data-ui-toggle]'), '再表示ボタンへフォーカス');
    find('[data-ui-toggle]').click(); assert(!find('#notice').hidden, '再表示');
  });
  await test('動的ツールチップ・テキスト処理・Escape・ARIA復元', () => {
    mount('<span id="help">補足</span><button data-ui-tooltip="&lt;img src=x&gt;" aria-describedby="help">1</button><button data-ui-tooltip="別の説明">2</button>');
    const buttons = many('button'); buttons[0].focus();
    const bubble = document.querySelector('[role="tooltip"]');
    assert(bubble && bubble.textContent === '<img src=x>' && !bubble.querySelector('img'), 'HTMLとして実行しない');
    assert(buttons[0].getAttribute('aria-describedby').split(' ').length === 2, '元の補足参照を残す');
    const rect = bubble.getBoundingClientRect(); assert(rect.left >= 0 && rect.right <= innerWidth, '画面からはみ出さない');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(!document.querySelector('[role="tooltip"]') && buttons[0].getAttribute('aria-describedby') === 'help', 'Escapeで閉じて参照を戻す');
    buttons[1].click(); assert(document.querySelector('[role="tooltip"]').textContent === '別の説明', '2個目を独立して表示');
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    assert(!document.querySelector('[role="tooltip"]'), '領域外で閉じる');
  });
  await test('Vue境界: 祖先の初期化では変更せず、明示した範囲だけ初期化',()=>{
    mount('<div data-kav-ui-vue id="vue-owner"><select class="form-select"><option>選択</option></select></div>');
    const owner=find('#vue-owner');assert(!owner.querySelector('.ui-select-trigger'),'Vueの管理下を祖先から書き換えない');
    KavUI.init(owner);assert(owner.querySelectorAll('.ui-select-trigger').length===1,'不透明なアダプターでは明示して初期化できる');
    KavUI.destroy(fixture);assert(owner.querySelector('.ui-select-trigger'),'祖先の破棄でもVueが所有する部品を維持');
    KavUI.destroy(owner);assert(!owner.querySelector('.ui-select-trigger'),'所有者から明示的に破棄すると元へ戻す');
  });
  await test('Vueアイコン境界: 祖先の走査・ObserverはVue DOMに触れずHTMLアダプター内だけ更新',async()=>{
    mount('<section data-kav-ui-vue><button id="vue-raw-icon" icon="mdi-home">Vue text</button><div id="vue-html-icons" data-kav-ui-vue data-kav-ui-html><button icon="mdi-home">HTML text</button></div></section>');
    const raw=find('#vue-raw-icon'),html=find('#vue-html-icons'),trusted=html.querySelector('button');
    KavUI.init(html);await wait(0);
    assert(!raw.querySelector('svg')&&trusted.querySelector('svg'),'Vueの通常ノードを保護して不透明HTML内を初期化');
    const original=trusted.querySelector('path').getAttribute('d');raw.setAttribute('icon','mdi-check');trusted.setAttribute('icon','mdi-check');
    const child=document.createElement('button');child.setAttribute('icon','mdi-home');raw.parentNode.append(child);await wait(0);
    assert(!raw.querySelector('svg')&&!child.querySelector('svg'),'属性変更と動的追加でもVue側を変更しない');
    assert(trusted.querySelector('path').getAttribute('d')!==original,'不透明HTML内の属性変更は自動描画');
    KavUI.destroy(html);
  });
  await test('destroy: 選択欄・入力ピッカー・チャートの後始末と再初期化',()=>{
    mount('<div id="dispose-unit"><select class="form-select" aria-label="選択"><option value="one">1</option><option value="two">2</option></select><input class="form-control" type="color" value="#345678"><figure data-ui-chart><script type="application/json" data-ui-chart-data>{"labels":["月"],"series":[{"name":"値","values":[1]}]}</script></figure></div><div id="outside-unit"><select class="form-select"><option>外側</option></select></div>');
    const root=find('#dispose-unit'),select=root.querySelector('select'),input=root.querySelector('input[type=color]');
    select.value='two';root.querySelector('.ui-select-trigger').click();
    KavUI.destroy(root);
    assert(!root.querySelector('.ui-select-trigger')&&!root.querySelector('.ui-input-picker')&&!root.querySelector('.ui-chart-output'),'生成DOMを戻す');
    assert(select.value==='two'&&input.value==='#345678'&&root.querySelector('select')===select,'ネイティブの値とDOMを維持');
    assert(find('#outside-unit .ui-select-trigger'),'他の範囲を変更しない');
    KavUI.destroy(root);KavUI.init(root);
    assert(root.querySelectorAll('.ui-select-trigger').length===1&&root.querySelectorAll('.ui-chart-output').length===1,'再初期化で重複しない');
  });

  await test('destroy: 入力要素だけの初期化でもピッカー内部の選択欄を破棄',async()=>{
    mount('<form><fieldset><input class="form-control" type="time" value="09:30"></fieldset></form>');
    const input=find('input[type=time]');find('.ui-input-picker-trigger').click();
    const popup=find('.ui-input-popup'),select=popup.querySelector('select'),button=popup.querySelector('.ui-select-trigger');
    assert(select&&button,'時刻の内部選択欄を初期化');
    KavUI.destroy(input);
    assert(find('input[type=time]')===input&&!find('.ui-input-picker')&&!popup.querySelector('.ui-select-trigger'),'元inputと内部のnative selectへ復元');
    const label=button.textContent;select.selectedOptions[0].textContent='破棄後の変更';find('fieldset').disabled=true;await wait(0);
    assert(button.textContent===label,'外側fieldsetや古いselectを変更しても破棄済みUIは同期しない');
  });
  await test('destroy: 日付入力の生成UIを戻し、同じrootの再描画後に初期化',()=>{
    mount('<div id="date-dispose" data-ui-datepicker><input type="date" value="2026-10-01"></div>');
    const root=find('#date-dispose'),oldInput=root.querySelector('input');
    root.querySelector('[data-ui-datepicker-action="toggle"]').click();
    KavUI.destroy(root);
    assert(root.children.length===1&&root.firstElementChild===oldInput&&!root.classList.contains('ui-datepicker'),'入力を維持して生成DOMとクラスを戻す');
    root.innerHTML='<input type="date" value="2026-10-20">';KavUI.init(root);KavUI.init(root);
    assert(root.querySelectorAll('.ui-datepicker-toggle').length===1,'新しい入力に一度だけ生成');
    root.querySelector('[data-ui-datepicker-action="toggle"]').click();
    root.querySelector('[data-ui-calendar-date="2026-10-24"]').click();
    assert(root.querySelector('input').value==='2026-10-24'&&oldInput.value==='2026-10-01','新しい入力だけに選択を反映');
    KavUI.destroy(root);
  });
  await test('destroy: サイドバーの同じrootを再描画しても新しいpanelを制御',()=>{
    mount('<div id="sidebar-dispose" class="app-shell" data-ui-sidebar><aside class="app-sidebar">旧メニュー</aside><main>本文</main></div>');
    const root=find('#sidebar-dispose'),oldPanel=root.querySelector('aside');
    KavUI.sidebar(root,{open:true});KavUI.destroy(root);
    assert(!oldPanel.hidden&&!root.hasAttribute('data-ui-sidebar-state'),'初期状態へ戻す');
    root.innerHTML='<aside class="app-sidebar">新メニュー</aside><main>新本文</main>';KavUI.init(root);
    const panel=root.querySelector('aside');
    KavUI.sidebar(root,{open:true});KavUI.sidebar(root,{open:false});
    assert(panel.hidden&&!oldPanel.hidden,'新しいpanelだけを閉じる');
    KavUI.sidebar(root,{open:true});assert(!panel.hidden,'新しいpanelを再表示');
    KavUI.destroy(root);assert(!document.querySelector('.ui-sidebar-dialog'),'外側のダイアログも片付ける');
  });
  await test('destroy: indeterminateの外側form resetと予約済み処理を解除',async()=>{
    mount('<form><div id="mixed-dispose"><input type="checkbox" data-ui-indeterminate></div></form>');
    const root=find('#mixed-dispose'),input=root.querySelector('input'),form=find('form');
    form.reset();KavUI.destroy(root);input.indeterminate=false;await wait(10);
    assert(!input.indeterminate,'破棄前に予約したresetも取り消す');
    input.remove();form.reset();await wait(10);
    assert(!input.indeterminate,'取り外したinputには外側resetが作用しない');
    root.append(input);input.dataset.uiIndeterminate='false';KavUI.init(root);input.indeterminate=true;form.reset();await wait(10);
    assert(!input.indeterminate,'再初期化では現在の属性でresetを登録');
    KavUI.destroy(root);
  });

  await test('Responsive sidebar: API・同期・再初期化・無効ボタン',()=>{
    mount('<div class="app-shell" id="responsive-unit" data-ui-sidebar data-ui-sidebar-mobile="collapse"><aside class="app-sidebar"><a href="#">ページ</a></aside><div><button type="button" data-ui-toggle="sidebar-responsive" data-ui-target="#responsive-unit" icon="mdi-menu" data-ui-label-open="閉じる" data-ui-label-closed="開く"></button></div></div>');
    const root=find('#responsive-unit'),panel=find('.app-sidebar'),button=find('button');
    KavUI.sidebar(root,{open:true});assert(!panel.hidden&&button.getAttribute('aria-expanded')==='true','表示とARIA');
    let events=0;root.addEventListener('ui:sidebarchange',()=>events++);
    button.click();assert(panel.hidden&&button.getAttribute('aria-expanded')==='false'&&events===1,'一度だけ閉じる');
    assert(button.querySelector('svg')&&button.getAttribute('aria-label')==='開く','ラベル変更でアイコンを消さない');
    KavUI.init(root);assert(panel.hidden,'再初期化で開かない');
    button.disabled=true;button.click();assert(panel.hidden,'無効操作を無視');button.disabled=false;
    button.click();assert(!panel.hidden&&events===2,'再表示');
    assert(KavUI.sidebar('#does-not-exist')===false,'不正な対象');
  });
  await test('Responsive sidebar: レールでもリンク名・子メニューを維持',()=>{
    if(innerWidth<768)return;
    mount('<div class="app-shell" id="rail-unit" data-ui-sidebar data-ui-sidebar-tablet="rail" data-ui-sidebar-desktop="rail"><aside class="app-sidebar"><nav><a href="#"><span class="sidebar-icon" icon="mdi-home"></span><span class="sidebar-label">概要</span></a><details><summary><span class="sidebar-icon" icon="mdi-cog"></span><span class="sidebar-label">設定</span></summary><a href="#">詳細</a></details></nav></aside><div><button type="button" data-ui-toggle="sidebar-responsive" data-ui-target="#rail-unit">展開</button></div></div>');
    const root=find('#rail-unit'),panel=find('.app-sidebar'),link=find('a');
    assert(KavUI.sidebar(root).mode==='rail'&&!panel.hidden,'レールは表示を維持');
    assert(link.title==='概要'&&getComputedStyle(find('.sidebar-label')).position==='absolute','ラベルを視覚的に隠す');
    find('summary').click();assert(KavUI.sidebar(root).open&&find('details').open,'子メニューを開くと文字付きになる');
    assert(!link.hasAttribute('title'),'自動補完のtitleを戻す');
    find('button').click();assert(root.dataset.uiSidebarState==='rail'&&!panel.hidden,'レールへ戻す');
  });
  await test('Responsive sidebar: top/bottomを全画面区分で指定できる',async()=>{
    for(const edge of ['top','bottom']){
      mount('<div class="app-shell" id="edge-unit" data-ui-sidebar data-ui-sidebar-mobile="'+edge+'" data-ui-sidebar-tablet="'+edge+'" data-ui-sidebar-desktop="'+edge+'"><aside class="app-sidebar"><a href="#">ページ</a></aside><div><button type="button" data-ui-toggle="sidebar-responsive" data-ui-target="#edge-unit">開く</button></div></div>');
      const root=find('#edge-unit'),panel=find('.app-sidebar');
      assert(KavUI.sidebar(root).mode===edge&&panel.hidden,'端から開くモードを適用');
      find('button').click();const dialog=document.querySelector('.ui-sidebar-dialog');
      assert(dialog.open&&dialog.classList.contains('ui-drawer-'+edge)&&dialog.contains(panel),'上下のドロワーで開く');
      dialog.close();await wait(20);assert(panel.parentNode===root&&panel.hidden,'閉じたら戻す');
    }
  });
  await test('Responsive sidebar: drawerの同一DOM・入力状態・復帰',async()=>{
    if(innerWidth>=768)return;
    mount('<div class="app-shell" id="drawer-unit" data-ui-sidebar><aside class="app-sidebar" aria-label="テストメニュー"><label>検索<input value="保持"></label><a href="#">概要</a></aside><div><button type="button" data-ui-toggle="sidebar-responsive" data-ui-target="#drawer-unit">開く</button></div></div>');
    const root=find('#drawer-unit'),panel=find('.app-sidebar'),input=find('input'),button=find('button');
    button.focus();button.click();const dialog=document.querySelector('.ui-sidebar-dialog');
    assert(dialog?.open&&dialog.contains(panel)&&input.value==='保持','元のDOMでモーダル表示');
    input.value='編集中';dialog.close();await wait(30);
    assert(panel.parentNode===root&&panel.hidden&&input.value==='編集中'&&!dialog.isConnected,'閉じた後に入力状態を維持して戻す');
    assert(document.activeElement===button,'トリガーにフォーカス復帰');
    button.click();root.remove();await wait(30);
    assert(!document.querySelector('.ui-sidebar-dialog[open]'),'利用側が削除されてもモーダルを残さない');
  });

  await test('Banner: 近いバナーだけ閉じる・フォーカス復帰・再表示', () => {
    mount('<button type="button" data-ui-toggle="show" data-ui-target="#banner-unit">表示</button><div class="ui-banner ui-banner-info" id="banner-unit"><div class="ui-banner-inner"><p class="ui-banner-content">案内</p><button type="button" class="ui-banner-close" data-ui-dismiss="banner" aria-label="案内を閉じる">×</button></div></div><div class="ui-banner">別の案内</div>');
    const banner=find('#banner-unit'),close=find('[data-ui-dismiss=banner]');let hidden=0;banner.addEventListener('ui:hidden',()=>hidden++);
    close.focus();close.click();assert(banner.hidden && !many('.ui-banner')[1].hidden && hidden===1,'対象だけ閉じる');
    assert(document.activeElement===find('[data-ui-toggle=show]'),'外の表示ボタンへフォーカスを戻す');
    find('[data-ui-toggle=show]').click();assert(!banner.hidden,'既存showで再表示');
    close.disabled=true;close.click();assert(!banner.hidden,'無効な閉じるボタンは操作しない');
  });
  await test('親領域を閉じるとツールチップも消える', () => {
    mount('<button data-ui-toggle="collapse" data-ui-target="#tooltip-parent">開閉</button><div id="tooltip-parent"><button data-ui-tooltip="補足">説明</button></div>');
    find('[data-ui-tooltip]').focus();
    assert(document.querySelector('[role="tooltip"]'), '補足を開く');
    KavUI.hide('#tooltip-parent');
    assert(!document.querySelector('[role="tooltip"]'), '閉じた領域の補足を残さない');
  });
  const tabs = () => '<div data-ui-tabs><div class="tabs" role="tablist" aria-label="テスト"><button data-ui-toggle="tab" data-ui-target="a">A</button><button data-ui-toggle="tab" data-ui-target="disabled" disabled>無効</button><button data-ui-toggle="tab" data-ui-target="b">B</button></div><div data-ui-panel="a">A本文</div><div data-ui-panel="disabled">無効本文</div><div data-ui-panel="b">B本文</div></div>';
  await test('タブの複数グループ・キーボード・無効項目のスキップ', () => {
    mount(tabs() + tabs());
    const groups = many('[data-ui-tabs]'); const first = groups[0].querySelector('button');
    first.focus(); first.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(groups[0].querySelector('[data-ui-panel="a"]').hidden, '最初のグループを切替');
    assert(!groups[1].querySelector('[data-ui-panel="a"]').hidden, '別グループには影響しない');
    assert(document.activeElement.textContent === 'B', '無効項目を飛ばす');
    assert(groups[0].querySelector('[data-ui-panel="a"]').id !== groups[1].querySelector('[data-ui-panel="a"]').id, 'IDを一意に自動生成');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    assert(document.activeElement === first, 'Homeで先頭へ');
  });
  await test('ナビバー: レスポンシブ開閉・独立・Escape・無効リンク・再初期化', () => {
    const markup=()=>'<nav class="navbar" data-ui-navbar aria-label="テスト"><button type="button" data-ui-navbar-toggle>メニュー</button><div class="navbar-collapse" data-ui-navbar-panel><a class="nav-link" href="#nav-unit" id="nav-unit">概要</a><a class="nav-link" href="#disabled" aria-disabled="true" tabindex="-1">無効</a></div></nav>';
    mount(markup()+markup().replace('id="nav-unit"','id="nav-unit-2"'));
    const roots=many('[data-ui-navbar]'),root=roots[0],button=root.querySelector('button'),panel=root.querySelector('[data-ui-navbar-panel]');
    const collapsed=innerWidth<1024;
    assert(button.hidden===!collapsed && panel.hidden===collapsed,'PCは展開、小画面は折り畳み');
    assert(button.getAttribute('aria-controls')===panel.id,'パネルを関連付ける');
    let count=0;root.addEventListener('ui:navtoggle',()=>count++);KavUI.init(root);KavUI.init(root);
    if(collapsed) {
      button.click();assert(!panel.hidden && button.getAttribute('aria-expanded')==='true','開く');
      assert(roots[1].querySelector('[data-ui-navbar-panel]').hidden,'他のナビバーは閉じたまま');
      const disclosure=document.createElement('div');disclosure.hidden=true;disclosure.id=panel.id+'-section';const action=document.createElement('a');action.href='#'+disclosure.id;action.dataset.uiToggle='collapse';action.dataset.uiTarget='#'+disclosure.id;action.textContent='開閉';panel.append(action,disclosure);KavUI.init(root);action.click();
      assert(!disclosure.hidden && !panel.hidden,'開閉用リンクではナビバーを閉じない');
      const disabledLink=panel.querySelector('[aria-disabled]'),event=new MouseEvent('click',{bubbles:true,cancelable:true});disabledLink.dispatchEvent(event);
      assert(event.defaultPrevented && !panel.hidden,'無効リンクは遷移・閉鎖しない');
      panel.querySelector('a').focus();panel.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
      assert(panel.hidden && document.activeElement===button && count===2,'Escapeで閉じてトリガーに戻る・イベント重複なし');
      button.click();panel.querySelector('a').addEventListener('click',event=>event.preventDefault(),{once:true});panel.querySelector('a').click();
      assert(!panel.hidden,'アプリがキャンセルしたリンクでは閉じない');
    } else assert(button.getAttribute('aria-expanded')==='true','PCは常に展開');
  });
  await test('タブ: 縦配置・手動選択・RTL・無効項目スキップ', () => {
    mount(tabs().replace('data-ui-tabs>','data-ui-tabs data-ui-tab-activation="manual">').replace('role="tablist"','role="tablist" aria-orientation="vertical"'));
    const group=find('[data-ui-tabs]'),first=find('button'),last=many('button').at(-1);first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    assert(document.activeElement===last && first.getAttribute('aria-selected')==='true' && last.tabIndex===0 && first.tabIndex===-1,'矢印でフォーカスのみ移動');
    last.click();assert(last.getAttribute('aria-selected')==='true' && !find('[data-ui-panel="b"]').hidden,'クリック／Enterで選択');
    group.querySelector('[role=tablist]').removeAttribute('aria-orientation');group.dir='rtl';
    last.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(document.activeElement===first && last.getAttribute('aria-selected')==='true','RTLでは左右を逆にして手動選択を保つ');
    KavUI.init(group);assert(last.getAttribute('aria-selected')==='true','再初期化で選択を保持');
  });
  const splitMarkup=(extra='',panels='')=>'<div class="ui-splitter" data-ui-splitter '+extra+'>'+(panels || '<section data-ui-splitter-panel data-ui-size="30" data-ui-min="15" data-ui-max="60" data-ui-collapsible aria-label="一覧"><a href="#split-test">一覧リンク</a></section><section data-ui-splitter-panel data-ui-size="70" data-ui-min="20" aria-label="本文">本文</section>')+'</div>';
  await test('Splitter: destroyで通常コンテンツへ戻し、元の属性・サイズ・クラスを復元',()=>{
    fixture.innerHTML='<div data-ui-splitter><section class="author" data-ui-splitter-panel data-ui-size="30" data-ui-collapsible aria-hidden="false" style="--ui-splitter-size:17 !important;color:red"><a href="#split-restored">リンク</a></section><section class="ui-splitter-panel" id="original-split-panel" data-ui-splitter-panel data-ui-size="70" inert="inert" aria-hidden="true" data-ui-splitter-collapsed="original">本文</section></div>';
    const root=find('[data-ui-splitter]'),panels=many('[data-ui-splitter-panel]');KavUI.init(root);
    const oldHandle=root.querySelector('[role=separator]');KavUI.splitter(root,{sizes:[0,100]});
    assert(panels[0].inert&&panels[0].getAttribute('aria-hidden')==='true','実際に折り畳んでから破棄');
    KavUI.destroy(root);KavUI.destroy(root);
    assert(!root.querySelector('[role=separator]')&&!root.hasAttribute('class'),'生成ハンドルと追加ルートクラスを除く');
    assert(!panels[0].inert&&panels[0].getAttribute('aria-hidden')==='false'&&!panels[0].hasAttribute('data-ui-splitter-collapsed')&&!panels[0].hasAttribute('id')&&panels[0].className==='author','開閉属性・生成ID・パネルクラスを戻す');
    assert(panels[0].style.getPropertyValue('--ui-splitter-size')==='17'&&panels[0].style.getPropertyPriority('--ui-splitter-size')==='important'&&panels[0].style.color==='red','元のサイズと優先度・他のスタイルを維持');
    assert(panels[1].getAttribute('inert')==='inert'&&panels[1].getAttribute('aria-hidden')==='true'&&panels[1].getAttribute('data-ui-splitter-collapsed')==='original'&&panels[1].id==='original-split-panel'&&panels[1].className==='ui-splitter-panel'&&!panels[1].hasAttribute('style'),'初期状態で存在した属性は保持');
    const link=panels[0].querySelector('a');link.focus();assert(document.activeElement===link,'通常コンテンツとして再び操作できる');
    let changes=0;root.addEventListener('ui:splitterchange',()=>changes++);
    oldHandle.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    assert(changes===0&&!panels[0].inert,'破棄したハンドルのイベントも解除');
    KavUI.init(root);KavUI.init(root);
    assert(root.querySelectorAll('[role=separator]').length===1&&KavUI.splitter(root).join()==='30,70','同じパネルを初期サイズで一度だけ再初期化');
    root.innerHTML='<section data-ui-splitter-panel data-ui-size="40">新A</section><section data-ui-splitter-panel data-ui-size="60">新B</section>';KavUI.init(root);
    assert(KavUI.splitter(root).join()==='40,60','構造変更時も旧状態を破棄して初期化');
    KavUI.destroy(root);assert(!root.querySelector('[role=separator]')&&[...root.children].every(panel=>!panel.inert&&!panel.hasAttribute('style')&&!panel.hasAttribute('class')),'構造変更後も新しいパネルを復元');
  });
  await test('Splitter: 初期値・制約・API・独立・再初期化', () => {
    mount(splitMarkup()+splitMarkup());const roots=many('[data-ui-splitter]'),root=roots[0];
    assert(KavUI.splitter(root).join() === '30,70','初期サイズ');
    assert(KavUI.splitter(root,{sizes:[95,5]}).join()==='60,40','最小・最大の範囲へ調整');
    assert(KavUI.splitter(roots[1]).join()==='30,70','他のSplitterは変更しない');
    const copy=KavUI.splitter(root);copy[0]=1;assert(KavUI.splitter(root)[0]===60,'返り値はコピー');
    for(const sizes of [[-1,101],[20],[NaN,100],[0,0],['20',80]])assert(KavUI.splitter(root,{sizes})===false,'不正な入力を拒否');
    KavUI.init(root);KavUI.init(root);assert(root.querySelectorAll('[data-ui-splitter-handle]').length===1 && KavUI.splitter(root)[0]===60,'再初期化で増殖・リセットしない');
    const handle=root.querySelector('[role=separator]');assert(handle.getAttribute('aria-controls')===root.querySelector('[data-ui-splitter-panel]').id && handle.getAttribute('aria-orientation')==='vertical','ARIAの関連と向き');
  });
  await test('Splitter: キーボード・折り畳み・復元・リセット・無効', () => {
    mount(splitMarkup());const root=find('[data-ui-splitter]'),handle=find('[role=separator]'),pane=find('[data-ui-splitter-panel]');
    const press=(key,shiftKey=false)=>handle.dispatchEvent(new KeyboardEvent('keydown',{key,shiftKey,bubbles:true,cancelable:true}));
    press('ArrowRight');assert(KavUI.splitter(root)[0]===32,'矢印は2%');press('ArrowLeft',true);assert(KavUI.splitter(root)[0]===22,'Shiftは10%');
    pane.querySelector('a').focus();press('Enter');assert(KavUI.splitter(root)[0]===0 && pane.inert && pane.getAttribute('aria-hidden')==='true' && document.activeElement===handle,'折り畳むとフォーカスを戻す');
    press('Enter');assert(KavUI.splitter(root)[0]===22 && !pane.inert,'直前のサイズへ戻す');
    press('End');assert(KavUI.splitter(root)[0]===60,'Endで最大');press('Home');assert(KavUI.splitter(root)[0]===0,'Homeで折り畳み');press('ArrowRight');assert(KavUI.splitter(root)[0]===15,'折り畳みから最小幅へ展開');
    KavUI.splitter(root,{reset:true});assert(KavUI.splitter(root)[0]===30,'初期値へリセット');
    root.dir='rtl';press('ArrowLeft');assert(KavUI.splitter(root)[0]===32,'RTLでは左で拡大');
    root.dataset.uiSplitterDisabled='';KavUI.init(root);press('ArrowLeft');assert(KavUI.splitter(root)[0]===32 && handle.tabIndex===-1 && handle.getAttribute('aria-disabled')==='true','無効なハンドルは操作しない');
  });
  await test('Splitter: 縦分割・3領域・入れ子・合計100', () => {
    mount(splitMarkup('data-ui-orientation="vertical"','<section data-ui-splitter-panel data-ui-min="10" data-ui-size="20">上</section><section data-ui-splitter-panel data-ui-min="10" data-ui-size="30">中</section><section data-ui-splitter-panel data-ui-min="10" data-ui-size="50">下</section>'));
    const root=find('[data-ui-splitter]'),handles=many('[role=separator]');handles[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    assert(KavUI.splitter(root).join()==='22,28,50' && handles[0].getAttribute('aria-orientation')==='horizontal','隣接する2領域のみ縦方向で変更');
    root.querySelectorAll('[data-ui-splitter-panel]')[2].innerHTML=splitMarkup();KavUI.init(root);
    assert(root.querySelectorAll('[role=separator]').length===3 && KavUI.splitter(root).length===3,'入れ子のパネルを数えない');
    assert(Math.abs(KavUI.splitter(root).reduce((a,b)=>a+b,0)-100)<.001,'割合合計を維持');
  });
  await test('Splitter: スマートフォンの縦積みと操作方向・ARIA', () => {
    mount(splitMarkup());const root=find('[data-ui-splitter]');root.classList.add('ui-splitter-mobile-stack');KavUI.init(root);
    const mobile=innerWidth<768,handle=find('[role=separator]');assert(handle.getAttribute('aria-orientation')===(mobile?'horizontal':'vertical'),'境界の向きを同期');
    handle.dispatchEvent(new KeyboardEvent('keydown',{key:mobile?'ArrowDown':'ArrowRight',bubbles:true,cancelable:true}));assert(KavUI.splitter(root)[0]===32,'見た目に合うキーで変更');
  });
  await test('Splitter: 隣接パネルの折り畳み・ARIA範囲・DOM変更後の復元', () => {
    mount(splitMarkup('', '<section data-ui-splitter-panel data-ui-collapsible data-ui-size="20">A</section><section data-ui-splitter-panel data-ui-collapsible data-ui-size="30">B</section><section data-ui-splitter-panel data-ui-size="50">C</section>'));
    const root=find('[data-ui-splitter]');KavUI.splitter(root,{sizes:[0,0,100]});
    const handle=find('[role=separator]');assert(Number(handle.getAttribute('aria-valuemin'))<=Number(handle.getAttribute('aria-valuenow')) && Number(handle.getAttribute('aria-valuemax'))>=Number(handle.getAttribute('aria-valuenow')),'全て折り畳んだ境界でも有効なARIA範囲');
    handle.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert(KavUI.splitter(root)[0]===20,'他領域へ再配分して展開');
    KavUI.splitter(root,{sizes:[0,0,100]});root.append(Object.assign(document.createElement('section'),{textContent:'D'}));root.lastChild.dataset.uiSplitterPanel='';KavUI.init(root);
    assert(KavUI.splitter(root).length===4 && !root.querySelector('[data-ui-splitter-panel]').inert,'構造変更で古いinert状態を引き継がない');
  });
  await test('Splitter: 多数パネルの丸め誤差でも最後まで折り畳める', () => {
    mount(splitMarkup('',Array.from({length:6},(_,i)=>'<section data-ui-splitter-panel data-ui-collapsible>領域'+i+'</section>').join('')));
    const root=find('[data-ui-splitter]');for(const handle of many('[role=separator]'))handle.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    const sizes=KavUI.splitter(root);assert(sizes.slice(0,-1).every(value=>value===0) && sizes.at(-1)===100,'6領域の割合を一つへ集約');
    assert(Array.isArray(KavUI.splitter(root,{sizes})),'取得値を再設定できる');
  });
  await test('Splitter: 任意保存・復元・壊れた保存値・実現不能な制約', () => {
    const key='kav-ui-splitter:test-splitter',before=localStorage.getItem(key);
    try {
      localStorage.removeItem(key);mount(splitMarkup('data-ui-splitter-save="test-splitter"'));let root=find('[data-ui-splitter]');
      KavUI.splitter(root,{sizes:[45,55]});assert(JSON.parse(localStorage.getItem(key)).sizes[0]===45,'指定した場合だけ保存');
      mount(splitMarkup('data-ui-splitter-save="test-splitter"'));assert(KavUI.splitter(find('[data-ui-splitter]'))[0]===45,'サイズを復元');
      localStorage.setItem(key,'invalid');mount(splitMarkup('data-ui-splitter-save="test-splitter"'));assert(KavUI.splitter(find('[data-ui-splitter]'))[0]===30,'破損時は初期値');
      mount(splitMarkup('','<div data-ui-splitter-panel data-ui-min="70">A</div><div data-ui-splitter-panel data-ui-min="70">B</div>'));
      assert(KavUI.splitter(find('[data-ui-splitter]'))===false && !find('[role=separator]'),'成立しない制約では操作部品を追加しない');
    } finally {if(before===null)localStorage.removeItem(key);else localStorage.setItem(key,before);}
  });
  const pagination = () => '<div data-ui-pagination data-ui-page-size="2">' + [1,2,3].map(n=>'<p data-ui-page-item>'+n+'</p>').join('') + '<p data-ui-page-status></p><button data-ui-page="1">1</button><button data-ui-page="2">2</button><button data-ui-page-step="1">次へ</button></div>';
  await test('ページ送りの独立性・実際の項目表示・端のフォーカス', () => {
    mount(pagination() + pagination());
    const groups = many('[data-ui-pagination]'); const next = groups[0].querySelector('[data-ui-page-step]');
    next.focus(); next.click();
    assert(groups[0].querySelector('[data-ui-page-item]').hidden, '実際に先頭項目を隠す');
    assert(!groups[1].querySelector('[data-ui-page-item]').hidden, '他の一覧は維持');
    assert(next.disabled && document.activeElement.dataset.uiPage === '2', '終端では現在ページにフォーカス');
    assert(groups[0].querySelector('[data-ui-page-status]').textContent.includes('3–3'), '最終ページの件数');
  });
  await test('フォームの独立性・入力検証・有効イベントによる送信停止', () => {
    mount('<form data-ui-validate novalidate><div data-ui-field><label>名前<input required name="name"></label><small data-ui-error hidden></small></div></form><form data-ui-validate novalidate><label>別の名前<input required></label></form>');
    const forms = many('form');
    const first = new Event('submit',{bubbles:true,cancelable:true}); forms[0].dispatchEvent(first);
    assert(first.defaultPrevented && document.activeElement === forms[0].querySelector('input'), '不正な送信を止め、最初のエラーにフォーカス');
    assert(forms[0].querySelector('input').getAttribute('aria-invalid') === 'true', 'エラー状態');
    assert(!forms[1].querySelector('input').hasAttribute('aria-invalid'), '他のフォームは検証しない');
    const field = forms[0].querySelector('input'); field.value='My app'; field.dispatchEvent(new Event('input',{bubbles:true}));
    assert(forms[0].querySelector('[data-ui-error]').hidden, '修正したフィールドのエラーを消す');
    let valid = false; forms[0].addEventListener('ui:valid',event=>{valid=true;event.preventDefault();},{once:true});
    const second = new Event('submit',{bubbles:true,cancelable:true}); forms[0].dispatchEvent(second);
    assert(valid && second.defaultPrevented, 'アプリ側で有効送信を受け取って止められる');
    forms[1].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    forms[1].dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    assert(forms[1].querySelectorAll('[data-ui-error]').length === 1, '自動生成のエラーを重複しない');
  });
  await test('native dialogの複数配置・検証・フォーカス復帰', async () => {
    mount('<button data-ui-toggle="dialog" data-ui-target="#modal1">開く1</button><dialog data-ui-dialog class="ui-dialog" id="modal1" aria-label="入力"><form method="dialog" data-ui-validate novalidate><label>名前<input required></label><button type="submit">確認</button><button type="button" data-ui-dismiss="dialog">閉じる</button></form></dialog><button data-ui-toggle="dialog" data-ui-target="#modal2">開く2</button><dialog data-ui-dialog class="ui-dialog" id="modal2" aria-label="別の確認"><button data-ui-dismiss="dialog">閉じる</button></dialog>');
    const opener = find('[data-ui-target="#modal1"]'); opener.focus(); opener.click();
    assert(find('#modal1').open && !find('#modal2').open, '指定したダイアログだけ開く');
    find('form').requestSubmit(); assert(find('#modal1').open, '不正なら開いたまま');
    find('input').value='valid'; find('form').requestSubmit(); await wait(30);
    assert(!find('#modal1').open && document.activeElement === opener, '有効なら閉じ、元のボタンへ');
    find('[data-ui-target="#modal2"]').click(); assert(find('#modal2').open,'別のダイアログも開く');
    find('#modal2 button').click(); await wait(30); assert(!find('#modal2').open, '属性で閉じる');
  });
  const board = () => '<div data-ui-board><section data-ui-column="todo"><span data-ui-count></span><div data-ui-cards><article data-ui-card="sample" class="task-card"><label>移動先<select data-ui-move><option value="todo">Todo</option><option value="done">Done</option></select></label></article></div><p data-ui-empty>空</p></section><section data-ui-column="done"><span data-ui-count></span><div data-ui-cards></div><p data-ui-empty>空</p></section></div>';
  await test('カンバンの独立性・select移動・通知イベント', () => {
    mount(board()+board()); const boards=many('[data-ui-board]'); const select=boards[0].querySelector('select');
    let detail; boards[0].addEventListener('ui:move',event=>{detail=event.detail;});
    select.focus(); select.value='done';select.dispatchEvent(new Event('change',{bubbles:true}));
    assert(select.closest('[data-ui-column]').dataset.uiColumn==='done','正しい列へ移動');
    assert(boards[1].querySelector('select').closest('[data-ui-column]').dataset.uiColumn==='todo','別ボードは維持');
    assert(boards[0].querySelector('[data-ui-count]').textContent==='0','件数更新');
    assert(detail.from==='todo' && detail.to==='done' && detail.card.contains(select),'アプリへ移動を通知');
    assert(document.activeElement===select,'キーボード操作後もフォーカス維持');
  });
  await test('ドラッグ移動・他のボードへのドロップを拒否', () => {
    mount(board()+board()); const boards=many('[data-ui-board]');const card=find('[data-ui-card]');
    const dataTransfer=new DataTransfer();card.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));
    const external=new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer});boards[1].querySelector('[data-ui-column="done"]').dispatchEvent(external);
    assert(!external.defaultPrevented && card.closest('[data-ui-board]')===boards[0],'別ボードには移動しない');
    boards[0].querySelector('[data-ui-column="done"]').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}));
    assert(card.closest('[data-ui-column]').dataset.uiColumn==='done' && !card.classList.contains('dragged'),'同じボード内で移動しドラッグ表示を消す');
  });
  async function withClipboard(clipboard, run) {
    const previous=Object.getOwnPropertyDescriptor(navigator,'clipboard');
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:clipboard});
    try { await run(); } finally {
      if(previous)Object.defineProperty(navigator,'clipboard',previous);else delete navigator.clipboard;
    }
  }
  await test('クリップボードの直接指定・現在の入力値・改行・動的追加', async () => {
    const values=[];
    await withClipboard({writeText:async text=>{values.push(text);}},async()=>{
      mount('<form><div class="ui-clipboard"><button class="ui-copy-icon" data-ui-copy="&lt;b&gt;文字列&lt;/b&gt;">コピー</button><p data-ui-copy-status role="status"></p></div><textarea id="copy-source">初期値</textarea><button type="button" data-ui-copy-target="#copy-source">入力をコピー</button><pre id="copy-code">  code\n next</pre><button type="button" data-ui-copy-target="#copy-code">コードをコピー</button></form>');
      let submits=0,copied;find('form').addEventListener('submit',event=>{submits++;event.preventDefault();});
      find('button').addEventListener('ui:copy',event=>{copied=event.detail.text;});
      const originalGlyph=find('button path').getAttribute('d');
      assert(find('button').textContent==='' && getComputedStyle(find('button')).borderTopWidth==='0px','初期状態は枠のないアイコン');
      find('button').focus();find('button').click();await wait(0);
      assert(find('button').dataset.uiCopyState==='success' && find('button path').getAttribute('d')!==originalGlyph,'成功時にチェックマークへ切り替える');
      KavUI.init(fixture);assert(find('button').dataset.uiCopyState==='success' && find('button svg').getAttribute('aria-hidden')==='true','再初期化してもチェック表示を保ち、装飾を読み上げない');
      assert(values[0]==='<b>文字列</b>' && copied===values[0] && submits===0,'文字列をそのままコピーし、フォームを送信しない');
      assert(find('[data-ui-copy-status]').textContent==='コピーしました。' && document.activeElement===find('button'),'成功を伝え、フォーカスを保つ');
      find('textarea').value='変更後\n2行目';many('button')[1].click();await wait(0);
      many('button')[2].click();await wait(0);
      assert(values[1]==='変更後\n2行目' && values[2]==='  code\n next','現在の値・改行・空白を保持');
      assert(many('button')[1].textContent==='入力をコピー' && !many('button')[1].classList.contains('ui-copy-icon'),'文字付きボタンをアイコンに変換しない');
      assert(getComputedStyle(many('[data-ui-copy-status]')[1]).position!=='absolute','文字付きボタンの成功メッセージを表示');
      fixture.insertAdjacentHTML('beforeend','<button data-ui-copy="">空の文字列</button>');
      many('button')[3].click();await wait(0);
      assert(values[3]==='' && many('[data-ui-copy-status]').length===4,'動的な単独ボタンも動作し、結果を個別に生成');
      await KavUI.copy('API');assert(values[4]==='API','直接APIもPromiseで呼べる');
    });
  });
  await test('コピー拒否・未対応・対象なし・無効ボタン・失敗後の再試行', async () => {
    let reject=true,writes=0;
    await withClipboard({writeText:async()=>{writes++;if(reject)throw new Error('denied');}},async()=>{
      mount('<button data-ui-copy="retry" aria-busy="false">コピー</button><button data-ui-copy-target="[">不正な対象</button><button disabled data-ui-copy="disabled">無効</button>');
      let errors=0;find('button').addEventListener('ui:copyerror',()=>errors++);
      find('button').click();await wait(0);
      assert(errors===1 && find('[data-ui-copy-status]').dataset.uiCopyState==='error' && !find('button').hasAttribute('data-ui-copy-state'),'拒否を成功として扱わずコピーアイコンを保つ');
      assert(!find('button').hasAttribute('aria-disabled') && find('button').getAttribute('aria-busy')==='false','元のARIA状態へ戻す');
      reject=false;find('button').click();await wait(0);
      assert(find('[data-ui-copy-status]').dataset.uiCopyState==='success','同じボタンから再試行できる');
      many('button')[1].click();many('button')[2].click();await wait(0);
      assert(writes===2 && many('[data-ui-copy-status]')[1].dataset.uiCopyState==='error','対象なしは書き込まず、無効ボタンは動かない');
    });
    await withClipboard(undefined,async()=>{
      let failed=false;try {await KavUI.copy('unsupported');}catch {failed=true;}
      assert(failed,'未対応のAPIはrejectする');
    });
  });
  await test('トーストの任意コピー・本文と別の値・属性指定・互換性', async () => {
    const values=[];
    await withClipboard({writeText:async text=>{values.push(text);}},async()=>{
      assert(!KavUI.toast('従来の通知',{duration:0}).querySelector('[data-ui-copy]'),'指定しない通知は従来のまま');
      const body=KavUI.toast({title:'タイトル',body:'本文\n次の行',copy:true,duration:0});
      body.querySelector('[data-ui-copy]').click();await wait(0);
      assert(values[0]==='本文\n次の行' && body.querySelector('[data-ui-copy-status]').textContent==='コピーしました。','本文のみをコピーする');
      const title=KavUI.toast({title:'タイトルのみ',copy:true,duration:0});
      assert(title.querySelector('[data-ui-copy]').dataset.uiCopy==='タイトルのみ','本文がない通知はタイトルをコピーする');
      mount('<button data-ui-toast="説明文" data-ui-toast-copy data-ui-copy-text="ERR-001" data-ui-copy-label="IDをコピー" data-ui-duration="0">通知</button>');
      find('button').click();const note=document.querySelector('.ui-toast:last-child');
      assert(note.querySelector('[data-ui-copy]').textContent==='' && note.querySelector('[data-ui-copy]').getAttribute('aria-label')==='IDをコピー','文字を表示せずアイコンの読み上げ名を指定');
      note.querySelector('[data-ui-copy]').click();await wait(0);assert(values[1]==='ERR-001','本文と別の文字列をコピー');
      const empty=KavUI.toast({body:'本文',copy:true,copyText:'',duration:0});
      assert(empty.querySelector('[data-ui-copy]').dataset.uiCopy==='','空文字列の明示指定も保持');
    });
  });
  await test('トーストのコピーとチェックは全通知色・テーマを引き継ぐ', async () => {
    const theme=document.documentElement.dataset.bsTheme;
    try {
      await withClipboard({writeText:async()=>{}},async()=>{
        for(const selected of ['light','dark']) {
          document.documentElement.dataset.bsTheme=selected;
          for(const variant of ['success','info','warning','danger']) {
            const note=KavUI.toast({body:'通知',variant,copy:true,duration:0});
            const button=note.querySelector('[data-ui-copy]');
            assert(getComputedStyle(button).color===getComputedStyle(note).color,'コピーアイコンの色を通知に合わせる');
            button.click();await wait(0);
            assert(button.dataset.uiCopyState==='success' && getComputedStyle(button).color===getComputedStyle(note).color,'チェックマークも通知色を維持');
            note.remove();
          }
        }
      });
    } finally { document.documentElement.dataset.bsTheme=theme; }
  });
  await test('コピー待機中の重複操作とトースト自動消去を抑止', async () => {
    let complete,writes=0;
    await withClipboard({writeText:()=>{writes++;return new Promise(resolve=>{complete=resolve;});}},async()=>{
      const note=KavUI.toast({body:'コピーを待つ',copy:true,duration:35});
      const button=note.querySelector('[data-ui-copy]');button.click();button.click();
      await wait(100);
      assert(writes===1 && note.isConnected && button.getAttribute('aria-busy')==='true','コピー処理中は消去せず、二重操作もしない');
      complete();await wait(100);
      assert(!note.isConnected,'コピー完了後に自動消去を再開');
    });
  });
  await test('トーストの生成・安全な文言・自動消去・手動消去', async () => {
    const success=KavUI.toast('<strong>text</strong>',{duration:35});
    const error=KavUI.toast('error',{variant:'danger',duration:0});
    assert(success.textContent.includes('<strong>text</strong>') && !success.querySelector('strong'),'テキストとして表示');
    assert(error.getAttribute('role')==='alert','エラーを通知');
    await wait(100);assert(!success.isConnected && error.isConnected,'成功だけ自動消去');
    error.querySelector('button').click();assert(!error.isConnected,'共通属性で手動消去');
  });
  await test('構造化トースト・タイトルと本文と補足・文字列APIとの互換性', () => {
    const structured=KavUI.toast({title:'<b>保存完了</b>',body:'1行目\n2行目',meta:'たった今',variant:'info',duration:0});
    assert(structured.querySelector('.ui-toast-title').textContent==='<b>保存完了</b>' && !structured.querySelector('b'),'タイトルもHTMLとして実行しない');
    assert(structured.querySelector('.ui-toast-body').textContent==='1行目\n2行目','本文の改行を保持');
    assert(structured.querySelector('.ui-toast-meta').textContent==='たった今','補足を表示');
    assert(structured.getAttribute('aria-atomic')==='true','通知全体を読み上げる');
    const legacy=KavUI.toast('以前の本文',{title:'互換タイトル',duration:0});
    assert(legacy.querySelector('.ui-toast-body').textContent==='以前の本文','文字列形式を維持');
    const titleOnly=KavUI.toast({title:'タイトルだけ',duration:0});
    assert(!titleOnly.querySelector('.ui-toast-body'),'不要な本文領域を作らない');
    const explicit=KavUI.toast('fallback',{body:'明示した本文',duration:0});
    assert(explicit.querySelector('.ui-toast-body').textContent==='明示した本文','bodyを優先する');
  });
  await test('属性指定のトースト・固定幅・長い文字列の折り返し', () => {
    mount('<button data-ui-toast data-ui-title="保存しました" data-ui-body="プロジェクトの変更を保存しました。" data-ui-meta="たった今" data-ui-variant="success" data-ui-duration="0">通知</button>');
    find('button').click();
    const short=document.querySelector('.ui-toast');
    assert(short.querySelector('.ui-toast-title').textContent==='保存しました' && short.querySelector('.ui-toast-meta').textContent==='たった今','属性から生成');
    const long=KavUI.toast({title:'長いタイトル'.repeat(12),body:'https://example.test/'+ 'long-unbroken-project-identifier'.repeat(12),meta:'ログの更新',duration:0});
    const expected=Math.min(360,document.documentElement.clientWidth-32);
    const bounds=long.getBoundingClientRect();
    assert(Math.abs(bounds.width-expected)<1 && Math.abs(short.getBoundingClientRect().width-bounds.width)<1,'内容によらず同じ幅 '+JSON.stringify({expected,long:bounds.width,short:short.getBoundingClientRect().width,viewport:document.documentElement.clientWidth}));
    assert(bounds.left>=16 && bounds.right<=innerWidth-16+1,'狭い画面でも収める');
    for (const part of long.querySelectorAll('.ui-toast-title, .ui-toast-body')) assert(part.scrollWidth<=part.clientWidth+1,'長い英字や日本語を折り返す');
    const close=long.querySelector('.btn-close').getBoundingClientRect();
    assert(close.right<=bounds.right && close.left>=bounds.left,'閉じるボタンを収める');
    const root=document.documentElement;root.style.setProperty('--ui-toast-width','420px');
    try { assert(Math.abs(long.getBoundingClientRect().width-Math.min(420,document.documentElement.clientWidth-32))<1,'CSS変数で幅を変更'); }
    finally { root.style.removeProperty('--ui-toast-width'); }
  });
  await test('カレンダーの独立性・月切替・うるう年', () => {
    mount('<div data-ui-calendar data-ui-month="2024-02"></div><div data-ui-calendar data-ui-month="2025-02"></div>');
    const roots=many('[data-ui-calendar]');
    assert(roots[0].querySelector('[data-ui-calendar-date="2024-02-29"]') && !roots[1].querySelector('[data-ui-calendar-date="2025-02-29"]'),'うるう日を正しく描画');
    assert(roots[0].querySelectorAll('tbody tr').length===6,'6週のレイアウト');
    let detail;roots[0].addEventListener('ui:monthchange',event=>{detail=event.detail;});
    roots[0].querySelector('[data-ui-calendar-action="next"]').click();
    assert(roots[0].dataset.uiMonth==='2024-03' && roots[1].dataset.uiMonth==='2025-02','別のカレンダーに影響しない');
    assert(detail.month==='2024-03','表示月変更を通知');
    roots[0].querySelector('[data-ui-calendar-action="prev"]').click();assert(roots[0].dataset.uiMonth==='2024-02','前月へ戻る');
  });
  await test('カレンダーの日付選択・フォーム値・予定の安全な表示', () => {
    mount('<form><div data-ui-calendar data-ui-month="2026-10" data-ui-name="scheduled_date"><ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="success">10:00 レビュー</li><li data-ui-date="2026-10-21">&lt;img src=x&gt;</li></ul></div></form>');
    const root=find('[data-ui-calendar]');let detail;root.addEventListener('ui:datechange',event=>{detail=event.detail;});
    const button=root.querySelector('[data-ui-calendar-date="2026-10-21"]');button.click();
    assert(root.dataset.uiValue==='2026-10-21' && detail.value==='2026-10-21' && detail.previousValue==='','日付を選択して通知');
    assert(new FormData(find('form')).get('scheduled_date')==='2026-10-21','フォームへ値を連携');
    assert(root.querySelector('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-10-21','選択状態を伝える');
    assert(root.querySelectorAll('.ui-calendar-agenda-event').length===2 && !root.querySelector('.ui-calendar-agenda img'),'選択日の予定を安全に表示');
    root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();assert(root.querySelector('.ui-calendar-empty').textContent.includes('ありません'),'予定のない日');
    KavUI.init(root);assert(root.dataset.uiValue==='2026-10-22' && root.querySelectorAll('[data-ui-calendar-view]').length===1,'再初期化で状態を維持し、重複生成しない');
  });
  await test('カレンダーの選択範囲・月曜始まり・無効な範囲', () => {
    mount('<div data-ui-calendar data-ui-month="2026-10" data-ui-week-start="monday" data-ui-min="2026-10-10" data-ui-max="2026-10-25"></div>');
    const root=find('[data-ui-calendar]');
    assert(root.querySelector('th').textContent==='月','月曜から表示');
    assert(root.querySelector('[data-ui-calendar-date="2026-10-09"]').disabled && !root.querySelector('[data-ui-calendar-date="2026-10-10"]').disabled,'最小日付を守る');
    assert(root.querySelector('[data-ui-calendar-date="2026-10-26"]').disabled,'最大日付を守る');
    assert(root.querySelector('[data-ui-calendar-action="prev"]').disabled && root.querySelector('[data-ui-calendar-action="next"]').disabled,'範囲外の月へ移動しない');
    root.dataset.uiMin='2026-11-01';KavUI.init(root);assert(root.querySelector('[role="alert"]'),'矛盾する範囲を明示');
  });
  await test('カレンダーのキーボード・月末の移動・範囲の端', () => {
    mount('<div data-ui-calendar data-ui-value="2024-01-31"></div>');const root=find('[data-ui-calendar]');
    let button=root.querySelector('[tabindex="0"][data-ui-calendar-date]');button.focus();
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'PageDown',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2024-02' && document.activeElement.dataset.uiCalendarDate==='2024-02-29','31日から翌月末へ移動');
    assert(root.dataset.uiValue==='2024-01-31','移動だけでは選択値を変えない');
    document.activeElement.click();assert(root.dataset.uiValue==='2024-02-29','移動先を選択');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2024-03' && document.activeElement.dataset.uiCalendarDate==='2024-03-01','月をまたぐ移動');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiCalendarDate==='2024-02-25','週の先頭へ移動');
    assert(root.querySelectorAll('[data-ui-calendar-date][tabindex="0"]').length===1,'日付のTab移動先は1つ');
    root.dataset.uiMin='2024-02-29';root.dataset.uiMax='2024-02-29';KavUI.init(root);
    const last=root.querySelector('[data-ui-calendar-date="2024-02-29"]');last.focus();last.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    assert(document.activeElement.dataset.uiCalendarDate==='2024-02-29','選択範囲の端で止まる');
  });
  await test('カレンダーの今日へ移動・長い予定・狭い画面', () => {
    mount('<div data-ui-calendar data-ui-month="2024-01"><ul data-ui-calendar-events><li data-ui-date="2024-01-15">'+ 'LongUnbrokenEventTitle'.repeat(16)+'</li></ul></div>');
    const root=find('[data-ui-calendar]');root.querySelector('[data-ui-calendar-date="2024-01-15"]').click();
    assert(root.scrollWidth<=root.clientWidth+1,'長い予定でもはみ出さない');
    root.querySelector('[data-ui-calendar-action="today"]').click();const date=new Date();
    const today=String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
    assert(root.dataset.uiValue===today && root.querySelector('[aria-current="date"]').dataset.uiCalendarDate===today,'ローカルの今日を選択');
    const active=root.querySelector('[aria-pressed="true"]');assert(active.getAttribute('aria-label').includes('今日'),'今日をラベルでも示す');
  });
  const dateField=(name,attrs='')=>'<div class="field" data-ui-field><label for="'+name+'">日付</label><div class="ui-datepicker" data-ui-datepicker><input id="'+name+'" name="'+name+'" type="date" class="form-control" '+attrs+'></div><small data-ui-error hidden></small></div>';
  await test('日付フォームの選択・通常の送信値・複数配置', () => {
    mount('<form>'+dateField('first-date','value="2026-10-21"')+dateField('second-date','value="2026-10-25"')+'</form>');
    const roots=many('[data-ui-datepicker]');let inputs=0,changes=0,submits=0;
    const input=roots[0].querySelector('input');input.addEventListener('input',()=>inputs++);input.addEventListener('change',()=>changes++);find('form').addEventListener('submit',event=>{submits++;event.preventDefault();});
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    assert(roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open'),'カレンダーを開く');
    roots[0].querySelector('[data-ui-calendar-date="2026-10-21"]').click();
    assert(!roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open') && changes===0,'同じ日付でも閉じ、不要なchangeは出さない');
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    roots[0].querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(input.value==='2026-10-22' && roots[1].querySelector('input').value==='2026-10-25','選択した欄だけ更新');
    assert(new FormData(find('form')).get('first-date')==='2026-10-22' && new FormData(find('form')).getAll('first-date').length===1,'標準入力欄だけで送信');
    assert(inputs===1 && changes===1 && submits===0,'input/changeを発行し、開閉で送信しない');
    assert(!roots[0].querySelector('.ui-datepicker-popup').matches(':popover-open') && document.activeElement===input,'選択後は閉じて入力欄へ戻る');
  });
  await test('日付フォームの直接入力・クリア・必須検証・リセット', async () => {
    mount('<form data-ui-validate novalidate>'+dateField('required-date','value="2026-10-21" required')+'</form>');
    const input=find('input');input.value='2026-11-01';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    find('[data-ui-datepicker-action="toggle"]').click();assert(find('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-11-01','直接入力をカレンダーに反映');
    find('[data-ui-datepicker-action="clear"]').click();assert(input.value==='','クリアで未入力');
    const submit=new Event('submit',{bubbles:true,cancelable:true});find('form').dispatchEvent(submit);
    assert(submit.defaultPrevented && input.getAttribute('aria-invalid')==='true','requiredを検証');
    find('form').reset();await wait(0);assert(input.value==='2026-10-21' && !input.hasAttribute('aria-invalid'),'リセットで初期値と検証表示を復元');
    find('[data-ui-datepicker-action="toggle"]').click();assert(find('[aria-pressed="true"]').dataset.uiCalendarDate==='2026-10-21','再び開くと初期値を表示');
    find('[data-ui-datepicker-action="close"]').click();
  });
  await test('日付フォームのmin/max・ネイティブ制約・読み取り専用・disabled', () => {
    mount('<form>'+dateField('bounded-date','value="2026-10-21" min="2026-10-10" max="2026-10-25"')+dateField('fixed-date','value="2026-10-21" readonly')+dateField('disabled-date','value="2026-10-21" disabled')+'</form>');
    const roots=many('[data-ui-datepicker]');
    roots[0].querySelector('[data-ui-datepicker-action="toggle"]').click();
    assert(roots[0].querySelector('[data-ui-calendar-date="2026-10-09"]').disabled && roots[0].querySelector('[data-ui-calendar-date="2026-10-26"]').disabled,'範囲外は選択不可');
    roots[0].querySelector('[data-ui-datepicker-action="close"]').click();
    const input=roots[0].querySelector('input');input.value='2026-10-01';assert(!input.checkValidity(),'直接入力の範囲外も検証');
    assert(roots[1].querySelector('button').disabled && roots[2].querySelector('button').disabled,'読み取り専用・無効で開けない');
    const values=new FormData(find('form'));assert(values.has('fixed-date') && !values.has('disabled-date'),'標準の送信ルール');
    KavUI.init(fixture);assert(roots[0].querySelectorAll('.ui-datepicker-toggle').length===1,'再初期化で重複しない');
  });
  await test('日付フォームのEscape・Alt+矢印・フォーカス移動・領域外で閉じる', () => {
    mount(dateField('keyboard-date','value="2026-10-21"')+'<button id="next-control">次の項目</button>');
    const input=find('input'),toggle=find('.ui-datepicker-toggle'),popup=find('.ui-datepicker-popup');
    input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',altKey:true,bubbles:true,cancelable:true}));
    assert(popup.matches(':popover-open') && popup.contains(document.activeElement),'Alt+↓で開き日付にフォーカス');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(!popup.matches(':popover-open') && document.activeElement===input && toggle.getAttribute('aria-expanded')==='false','Escapeで入力へ戻る');
    toggle.click();find('#next-control').focus();assert(!popup.matches(':popover-open') && document.activeElement===find('#next-control'),'他の項目へ移動してもフォーカスを奪わない');
    toggle.click();document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));assert(!popup.matches(':popover-open'),'領域外で閉じる');
  });
  await test('日付フォームはダイアログ内でも開き、Escapeで親を閉じない', () => {
    mount('<dialog class="ui-dialog" data-ui-dialog aria-label="フォーム">'+dateField('dialog-date','value="2026-10-21"')+'</dialog>');
    find('dialog').showModal();find('.ui-datepicker-toggle').click();
    assert(find('.ui-datepicker-popup').matches(':popover-open'),'モーダル上で表示');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('dialog').open && !find('.ui-datepicker-popup').matches(':popover-open'),'日付選択だけ閉じる');
    find('dialog').close();
  });
  await test('日付フォームのポップアップが画面内に収まる', () => {
    mount(dateField('small-date','value="2026-10-21"'));find('.ui-datepicker-toggle').click();
    const popup=find('.ui-datepicker-popup'),box=popup.getBoundingClientRect();
    assert(box.left>=7 && box.right<=innerWidth-7,'横にはみ出さない');
    assert(box.top>=7 && box.bottom<=innerHeight-7,'縦にはみ出さない');
    assert(popup.scrollWidth<=popup.clientWidth+1,'中身の横はみ出しなし');
    find('[data-ui-datepicker-action="close"]').click();
  });
  await test('日付フォームのアイコンボタン・読み上げラベル・再初期化', () => {
    mount('<div class="field"><label for="icon-date">実施日</label><div data-ui-datepicker data-ui-datepicker-button="icon"><input id="icon-date" name="icon_date" type="date" value="2026-10-21"></div></div>');
    const root=find('[data-ui-datepicker]'),button=find('.ui-datepicker-toggle');
    assert(button.classList.contains('ui-datepicker-toggle-icon') && button.textContent==='','文字を出さずアイコンで表示');
    assert(button.getAttribute('aria-label')==='実施日のカレンダーを開く' && button.title===button.getAttribute('aria-label'),'名前とホバー時の説明を維持');
    assert(button.querySelector('svg').getAttribute('aria-hidden')==='true' && button.querySelector('svg').getAttribute('focusable')==='false','装飾アイコンを読み上げやTab移動の対象にしない');
    button.querySelector('path').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    assert(root.querySelector('.ui-datepicker-popup').matches(':popover-open'),'SVG内をクリックしても開く');
    root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(find('input').value==='2026-10-22' && document.activeElement===find('input'),'日付選択とフォーカス復帰');
    KavUI.init(root);assert(button.querySelectorAll('svg').length===1 && root.querySelectorAll('.ui-datepicker-toggle').length===1,'再初期化で重複しない');
    root.removeAttribute('data-ui-datepicker-button');KavUI.init(root);assert(button.textContent==='カレンダー' && !button.querySelector('svg'),'文字版へ戻せる');
    root.dataset.uiDatepickerButton='icon';find('input').readOnly=true;KavUI.init(root);assert(button.disabled && button.querySelector('svg'),'読み取り専用時もアイコン版を無効化');
  });
  await test('ローディングで二重操作を止め、ラベル・幅・状態を復元', async () => {
    mount('<button id="loading-button" type="button" class="btn btn-primary ui-loading-button"><span class="ui-loading-label">変更を保存する</span><span class="ui-spinner ui-spinner-sm ui-loading-indicator" aria-hidden="true"></span></button>');
    const button=find('button');let clicks=0;button.addEventListener('click',()=>clicks++);
    const width=button.getBoundingClientRect().width;
    assert(KavUI.loading('#loading-button',true),'セレクターを受け付ける');
    KavUI.loading(button,true);KavUI.init(fixture);
    button.click();
    assert(clicks===0 && button.disabled && button.getAttribute('aria-busy')==='true','二重操作を抑止');
    await wait(180);
    assert(getComputedStyle(find('.ui-loading-indicator')).display!=='none' && getComputedStyle(find('.ui-loading-label')).opacity==='0','スピナーに切り替える');
    assert(Math.abs(button.getBoundingClientRect().width-width)<1 && button.textContent==='変更を保存する','幅と読み上げ用の名前を保持');
    KavUI.loading(button,false);button.click();
    assert(clicks===1 && !button.disabled && !button.hasAttribute('aria-busy'),'複数回開始しても元に復元');
    assert(getComputedStyle(find('.ui-loading-indicator')).display==='none','終了後はスピナーを非表示');
    KavUI.loading(button,true);KavUI.loading(button,false);
    assert(!button.disabled,'再試行でも復元');
  });
  await test('ローディングの元の無効状態・パネル・不正な指定', () => {
    mount('<button disabled aria-busy="false">保存</button><div id="busy-panel" class="ui-card ui-loading-border" aria-busy="false">データ</div>');
    const button=find('button'),panel=find('#busy-panel');
    KavUI.loading(button,true);KavUI.loading(button,false);
    assert(button.disabled && button.getAttribute('aria-busy')==='false','元から無効なボタンを勝手に有効化しない');
    KavUI.loading(panel,true);
    assert(panel.getAttribute('aria-busy')==='true' && getComputedStyle(panel,'::after').content!=='none','パネルの枠線を有効化');
    KavUI.loading(panel,false);
    assert(panel.getAttribute('aria-busy')==='false' && getComputedStyle(panel,'::after').content==='none','パネルの状態を復元');
    assert(!KavUI.loading('[') && !KavUI.loading('#missing') && !KavUI.loading(null) && !KavUI.loading(button,false),'不正な指定・余分な終了は安全に無視');
  });
  await test('出現時のフェード・再表示・閉じる操作は即時', () => {
    mount('<button data-ui-tooltip="補足">説明</button><dialog class="ui-dialog" data-ui-dialog><button data-ui-dismiss="dialog">閉じる</button></dialog><div id="fade-panel" hidden>開閉パネル</div><div class="alert alert-info" hidden>通知</div>');
    const entrance=element=>element.getAnimations().find(animation=>animation.animationName==='ui-appear');
    const check=element=>{
      const animation=entrance(element);
      assert(animation,'追加指定なしでフェードが始まる');
      animation.pause();animation.currentTime=80;
      const opacity=Number(getComputedStyle(element).opacity);
      assert(opacity>0 && opacity<1,'実際に半透明で描画される');
      animation.finish();
      assert(getComputedStyle(element).opacity==='1','完了後は不透明になる');
      return animation;
    };
    const dialog=find('dialog');dialog.showModal();check(dialog);dialog.close();
    assert(!dialog.open && getComputedStyle(dialog).display==='none','閉じる操作を遅延させない');
    dialog.showModal();assert(entrance(dialog)?.playState==='running','ネイティブAPIでの再表示もフェード');dialog.close();
    const panel=find('#fade-panel');KavUI.show(panel);const first=check(panel);
    KavUI.show(panel);assert(!entrance(panel) && getComputedStyle(panel).opacity==='1','表示中のshowで点滅させない');
    KavUI.hide(panel);assert(panel.hidden && getComputedStyle(panel).display==='none','パネルも即時に閉じる');
    KavUI.show(panel);assert(entrance(panel)!==first,'開き直すと再びフェード');
    KavUI.show(find('.alert'));check(find('.alert'));
    const note=KavUI.toast('通知',{duration:0});check(note);
    find('[data-ui-tooltip]').focus();check(document.querySelector('.ui-tooltip'));
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  });
  await test('閉じる動きは操作・ARIA・IDを残さず、再表示で打ち消せる', async () => {
    await wait(200);
    mount('<button data-ui-toggle="show" data-ui-target="#exit-alert">再表示</button><div id="exit-alert" class="alert alert-info"><span id="exit-label">通知</span><button data-ui-dismiss="alert">閉じる</button></div>');
    const panel=find('#exit-alert');panel.getAnimations().forEach(animation=>animation.finish());
    find('[data-ui-dismiss]').focus();KavUI.hide(panel);
    assert(panel.hidden && document.activeElement===find('[data-ui-toggle]'),'状態とフォーカスを即座に更新');
    const ghost=document.querySelector('[data-ui-motion-ghost]');
    assert(ghost && ghost.inert && ghost.getAttribute('aria-hidden')==='true' && !ghost.shadowRoot,'見た目のコピーは非操作・非読み上げで閉じる');
    assert(document.querySelectorAll('#exit-label').length===1 && document.querySelectorAll('[data-ui-dismiss="alert"]').length===1,'アプリにIDや操作対象を重複させない');
    KavUI.show(panel);assert(!ghost.isConnected && !panel.hidden,'開き直したら古い閉じる動きを破棄');
    panel.getAnimations().forEach(animation=>animation.finish());KavUI.hide(panel);
    await wait(200);assert(!document.querySelector('[data-ui-motion-ghost]'),'閉じる描画を完了後に片付ける');
  });
  await test('汎用の表示操作でもスピナー本来の回転を維持する', () => {
    mount('<span class="ui-spinner" hidden aria-label="読み込み中"></span>');
    const spinner=find('.ui-spinner');KavUI.show(spinner);
    assert(!spinner.hidden && getComputedStyle(spinner).animationName==='ui-spinner-turn','出現の演出で回転を置き換えない');
    assert(spinner.getAnimations().some(animation=>animation.animationName==='ui-spinner-turn'),'スピナーが実際に回転し続ける');
  });
  await test('ページ送りは状態を即座に変えてから動く', () => {
    mount('<div data-ui-pagination data-ui-page-size="1"><p data-ui-page-item>1</p><p data-ui-page-item>2</p><button data-ui-page="2">2</button></div>');
    find('[data-ui-page]').click();
    const visible=many('[data-ui-page-item]')[1];
    assert(!visible.hidden && many('[data-ui-page-item]')[0].hidden && visible.getAnimations().length,'ページ状態を待たずに反映し、表示をアニメーション');
  });
  await test('不正・不存在のターゲットで例外を出さない', () => {
    mount('<button data-ui-toggle="dialog" data-ui-target="[">不正</button><button data-ui-toggle="collapse" data-ui-target="#absent">不存在</button>');
    many('button').forEach(button=>button.click());
    assert(!find('dialog'),'余計な部品を生成しない');
  });
  await test('未挿入DOMの初期化・動的追加・再初期化', () => {
    const element=document.createElement('div');element.innerHTML=tabs();
    KavUI.init(element);fixture.append(element);KavUI.init(element);
    element.querySelector('[data-ui-target="b"]').click();assert(!element.querySelector('[data-ui-panel="b"]').hidden,'追加後も操作できる');
    assert(element.querySelector('[role="tab"]'),'ARIAも初期化');
  });
  await test('デザインテーマの選択同期・動的初期化・明暗との独立性', () => {
    const before=document.body.dataset.uiTheme;
    const mode=document.documentElement.dataset.bsTheme;
    try {
      const options='<option value="default">標準</option><option value="glass">ガラス</option><option value="glassmorphism">グラスモーフィズム</option><option value="flat">フラット</option><option value="soft">ソフト</option>';
      mount('<select data-ui-theme-select>'+options+'</select><select data-ui-theme-select>'+options+'</select><button data-ui-toggle="theme">明暗</button>');
      let detail;const listener=event=>{detail=event.detail;};document.body.addEventListener('ui:designchange',listener,{once:true});
      many('select')[0].value='glass';many('select')[0].dispatchEvent(new Event('change',{bubbles:true}));
      assert(document.body.dataset.uiTheme==='glass' && many('select').every(select=>select.value==='glass'),'すべての選択欄に反映');
      assert(detail.theme==='glass' && document.documentElement.dataset.bsTheme===mode,'変更を通知し、明暗は変えない');
      find('button').click();assert(document.body.dataset.uiTheme==='glass','明暗を変えてもデザインを保つ');
      assert(!KavUI.setDesignTheme('unknown') && document.body.dataset.uiTheme==='glass','不正な値は反映しない');
      const select=document.createElement('select');select.setAttribute('data-ui-theme-select','');select.innerHTML=options;fixture.append(select);KavUI.init(select);
      assert(select.value==='glass','追加した選択欄も現在のテーマに同期');
      KavUI.setDesignTheme('soft');assert(many('select').every(item=>item.value==='soft'),'APIからの変更も同期');
    } finally { KavUI.setDesignTheme(before);document.documentElement.dataset.bsTheme=mode; }
  });
  await test('デザインテーマの静的指定・標準への復帰・意味のある色', () => {
    const before=document.body.dataset.uiTheme;
    try {
      KavUI.setDesignTheme('default');
      mount('<article class="ui-card"><div class="ui-card-body">カード</div></article><div class="alert alert-danger">エラー</div>');
      const card=find('.ui-card'),alert=find('.alert');
      const original=getComputedStyle(card).borderRadius;const color=getComputedStyle(alert).color;
      document.body.dataset.uiTheme='glass';
      assert(getComputedStyle(card).borderRadius!==original && getComputedStyle(card).backdropFilter!=='none','body属性の変更だけでガラス表示');
      for(const theme of ['glass','glassmorphism','flat','soft']) {
        KavUI.setDesignTheme(theme);assert(getComputedStyle(alert).color===color,'意味のある通知色を維持');
      }
      KavUI.setDesignTheme('flat');assert(getComputedStyle(card).boxShadow==='none','フラットでは影を抑える');
      KavUI.setDesignTheme('default');assert(getComputedStyle(card).borderRadius===original,'標準へ戻すと元のデザイン');
    } finally { KavUI.setDesignTheme(before); }
  });
  await test('ガラス背景画像: 任意指定・薄さ・モードとテーマの独立・解除', () => {
    const body=document.body,beforeTheme=body.dataset.uiTheme,beforeMode=document.documentElement.dataset.bsTheme;
    const keys=['--ui-theme-background-image','--ui-theme-background-opacity','--ui-theme-background-position'];
    const saved=keys.map(key=>[key,body.style.getPropertyValue(key)]);
    try {
      const image='url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222%22 height=%222%22%3E%3Cpath fill=%22%238fa9b5%22 d=%22M0 0h2v2H0z%22/%3E%3C/svg%3E")';
      body.style.setProperty(keys[0],image);body.style.setProperty(keys[1],'22%');body.style.setProperty(keys[2],'right top');
      for(const theme of ['glass','glassmorphism'])for(const mode of ['light','dark']) {
        body.dataset.uiTheme=theme;document.documentElement.dataset.bsTheme=mode;
        const css=getComputedStyle(body);
        assert(css.backgroundImage.includes('data:image/svg+xml'),'画像を最背面へ追加');
        assert(css.backgroundImage.includes('color(srgb') || css.backgroundImage.includes('color-mix('),'テーマ色で薄く重ねる');
        assert(css.backgroundAttachment.split(',').every(value=>value.trim()==='fixed'),'全レイヤーを画面へ固定');
        assert(css.backgroundSize.split(',').at(-1).trim()==='cover','画像だけcover');
        assert(css.backgroundPosition.split(',').at(-1).trim()==='100% 0%','画像の表示位置を指定');
      }
      for(const theme of ['default','flat','soft']) {KavUI.setDesignTheme(theme);assert(!getComputedStyle(body).backgroundImage.includes('data:image/svg+xml'),'他のテーマに画像を出さない');}
      body.dataset.uiTheme='glass';body.style.removeProperty(keys[0]);
      assert(!getComputedStyle(body).backgroundImage.includes('url(') && getComputedStyle(body).backgroundImage.includes('radial-gradient'),'解除後は既存のグラデーションを保つ');
    } finally {for(const [key,value] of saved){if(value)body.style.setProperty(key,value);else body.style.removeProperty(key);}KavUI.setDesignTheme(beforeTheme);document.documentElement.dataset.bsTheme=beforeMode;}
  });
  await test('テーマ切替を複数ボタンへ同期', () => {
    mount('<button data-ui-toggle="theme">1</button><button data-ui-toggle="theme">2</button>');
    const before=document.documentElement.dataset.bsTheme;find('button').click();
    assert(document.documentElement.dataset.bsTheme!==before,'テーマを切り替え');
    assert(many('button')[0].textContent===many('button')[1].textContent,'全ボタンのラベルを同期');
  });
  await test('select: 選択・フォーム値・通知・無効項目・Escape', () => {
    mount('<form><label for="pick">プラン</label><select id="pick" class="form-select" name="plan"><option value="free">無料</option><option disabled value="off">無効</option><option value="paid">有料</option></select></form>');
    const select=find('select'),button=find('.ui-select-trigger');let changes=0;select.addEventListener('change',()=>changes++);
    button.click();assert(find('.ui-select-menu').matches(':popover-open'),'独自の選択肢を開く');
    find('[data-index="1"]').click();assert(select.value==='free','無効項目は選択できない');
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    assert(select.value==='paid' && changes===1,'無効項目を飛ばして確定・changeは1回');
    assert(new FormData(find('form')).get('plan')==='paid','元のnameで送信する');
    assert(button.textContent==='有料' && document.activeElement===button,'表示・フォーカスを同期');
    button.click();button.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(select.value==='paid' && button.getAttribute('aria-expanded')==='false','Escapeは値を変えず閉じる');
    KavUI.init(fixture);assert(many('.ui-select-trigger').length===1,'再初期化しても重複しない');
  });
  await test('select: リセット・動的項目・ラベル・必須・disabled', async () => {
    mount('<form><label>種類<select class="form-select" name="kind" required><option value="">選択してください</option><optgroup label="候補"><option value="one">One</option></optgroup></select></label></form>');
    const select=find('select'),button=find('.ui-select-trigger');
    assert(button.getAttribute('aria-label')==='種類','ラベルに選択肢を混ぜない');
    assert(!select.checkValidity() && button.getAttribute('aria-invalid')==='true','必須の検証と表示');
    select.value='one';select.dispatchEvent(new Event('change',{bubbles:true}));
    assert(button.textContent==='One' && !button.hasAttribute('aria-invalid'),'外部changeとエラー解除');
    find('form').reset();await wait(10);assert(button.textContent==='選択してください','フォームリセットを表示に反映');
    const option=new Option('Two','two');select.append(option);select.disabled=true;await wait(0);
    assert(button.disabled,'disabledを動的に反映');
    select.disabled=false;await wait(0);button.click();
    assert(many('[role="option"]').some(item=>item.textContent==='Two'),'追加した選択肢を反映');
    select.focus();assert(document.activeElement===button,'既存のfocusを引き継ぐ');
    button.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
    assert(!find('.ui-select-menu').matches(':popover-open'),'Tabで閉じる');
  });
  await test('テーマ選択ボタン: 同期・明暗独立・無効操作', () => {
    const design=document.body.dataset.uiTheme,mode=document.documentElement.dataset.bsTheme;
    try {
      mount('<button data-ui-design="glass">ガラス</button><button data-ui-design="flat">フラット</button><button data-ui-design="soft" disabled>無効</button><button data-ui-color-mode="light">明</button><button data-ui-color-mode="dark">暗</button><select class="form-select" data-ui-theme-select><option value="glass">ガラス</option><option value="flat">フラット</option></select>');
      find('[data-ui-design="glass"]').click();
      assert(document.body.dataset.uiTheme==='glass' && find('.ui-select-trigger').textContent==='ガラス','ボタンとselectを同期');
      assert(find('[data-ui-design="glass"]').getAttribute('aria-pressed')==='true','選択状態');
      find('[data-ui-color-mode="dark"]').click();assert(document.documentElement.dataset.bsTheme==='dark' && document.body.dataset.uiTheme==='glass','明暗だけ変更');
      find('[data-ui-design="soft"]').click();assert(document.body.dataset.uiTheme==='glass','無効ボタンは変更しない');
      KavUI.setColorTheme('light');assert(find('[data-ui-color-mode="light"]').getAttribute('aria-pressed')==='true','APIから同期');
      assert(!KavUI.setColorTheme('invalid'),'未知の明暗を拒否');
    } finally {KavUI.setDesignTheme(design);KavUI.setColorTheme(mode);}
  });
  await test('余白: 既存値の維持・組み合わせ・トークン・RTL', () => {
    mount('<div class="inset sp-px-2 sp-p-6" id="padding">余白</div><div class="px-3" id="legacy"></div><div class="gap-3" id="legacy-gap"></div><div class="sp-px-3 sp-gap-3" id="modern"></div><div dir="rtl" class="sp-ps-8 sp-pe-2" id="rtl"></div><div class="sp-m-auto sp-mx-4" id="margin"></div>');
    const box=getComputedStyle(find('#padding'));
    assert(box.paddingTop==='24px' && box.paddingLeft==='8px','クラス記述順に依存せず、全方向を左右で上書き');
    assert(getComputedStyle(find('#legacy')).paddingLeft==='16px' && getComputedStyle(find('#legacy-gap')).gap==='16px','既存の番号の意味を維持');
    assert(getComputedStyle(find('#modern')).paddingLeft==='12px' && getComputedStyle(find('#modern')).gap==='12px','新しい系列は統一スケール');
    assert(getComputedStyle(find('#rtl')).paddingRight==='32px' && getComputedStyle(find('#rtl')).paddingLeft==='8px','開始側・終了側はRTLに追従');
    assert(getComputedStyle(find('#margin')).marginLeft==='16px','autoと方向指定も全方向から軸方向の順に上書き');
    find('#padding').style.setProperty('--space-2','10px');assert(getComputedStyle(find('#padding')).paddingLeft==='10px','共有トークンから値を解決する');
  });
  await test('余白: flexグリッドの列幅・入れ子・レスポンシブ', () => {
    mount('<div class="fx-grid fx-grid-2 sp-gap-4 sp-gap-x-2 md:sp-gap-6 lg:sp-gap-x-8" id="space-grid"><div><div class="fx-grid fx-grid-2 fx-gap-1" id="inner-grid"><div>A</div><div>B</div></div></div><div>2</div><div>3</div><div>4</div></div>');
    const grid=find('#space-grid'),children=[...grid.children],style=getComputedStyle(grid);
    const expected=innerWidth>=1024?32:innerWidth>=768?24:8;
    assert(parseFloat(style.columnGap)===expected,'画面幅に応じた列間隔');
    const rects=children.map(item=>item.getBoundingClientRect());
    assert(Math.abs(rects[1].top-rects[0].top)<1 && rects[2].top>rects[0].top,'幅を差し引いて2列を維持');
    assert(Math.abs(rects[1].left-rects[0].right-expected)<1,'実際の列間隔も一致');
    const inner=find('#inner-grid'),items=[...inner.children].map(item=>item.getBoundingClientRect());
    assert(getComputedStyle(inner).columnGap==='4px' && Math.abs(items[0].top-items[1].top)<1,'入れ子の既存fx-gapを独立させる');
  });
  await test('入力選択パネル: 型・フォーム値・確定・キャンセル・二重初期化', () => {
    mount('<form><label>時刻<input type="time" class="form-control" name="time" value="09:00"></label><label>月<input type="month" class="form-control" name="month" value="2026-10"></label><label>週<input type="week" class="form-control" name="week" value="2026-W43"></label><label>日時<input type="datetime-local" class="form-control" name="datetime" value="2026-10-21T09:00"></label><label>色<input type="color" class="form-control" name="color" value="#2f6fc4"></label></form>');
    const root=find('input[name=time]').closest('.ui-input-picker'),button=root.querySelector('.ui-input-picker-trigger');let changed=0;find('input[name=time]').addEventListener('change',()=>changed++);
    button.click();root.querySelector('[data-ui-picker-part=hour]').value='15';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=time]').value==='15:00' && changed===1,'元の値とchangeを確定時だけ更新');
    button.click();root.querySelector('[data-ui-picker-part=hour]').value='18';root.querySelector('.ui-input-popup').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('input[name=time]').value==='15:00' && document.activeElement===button,'Escapeは値を保持しフォーカスを戻す');
    const data=new FormData(find('form'));assert(data.get('time')==='15:00' && [...data.keys()].length===5,'補助入力を送信データに混ぜない');
    KavUI.init(fixture);assert(many('.ui-input-picker').length===5,'繰り返し初期化しても増えない');
  });
  await test('入力選択パネル: min/max・step・週数・リセット・disabled', async () => {
    mount('<form><label>月<input type="month" class="form-control" name="month" min="2026-04" max="2026-10" value="2026-06"></label><label>週<input type="week" class="form-control" name="week" value="2026-W53"></label><input aria-label="秒数" type="time" class="form-control" name="time" step="0.1" value="09:00:01.5"></form>');
    const root=find('input[name=month]').closest('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-picker-part=month]').value='12';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=month]').value==='2026-06' && !root.querySelector('.ui-picker-error').hidden,'範囲外の値を確定しない');
    root.querySelector('[data-ui-picker-part=month]').value='8';root.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=month]').value==='2026-08','範囲内を確定');
    const week=find('input[name=week]').closest('.ui-input-picker');week.querySelector('button').click();assert(week.querySelector('[data-ui-picker-part=week]').options.length===53,'ISOの53週の年');
    const year=week.querySelector('[data-ui-picker-part=year]');year.value='2027';year.dispatchEvent(new Event('input',{bubbles:true}));assert(week.querySelector('[data-ui-picker-part=week]').options.length===52,'年変更で週数を調整');
    const time=find('input[name=time]').closest('.ui-input-picker');time.querySelector('button').click();time.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=time]').value==='09:00:01.5','小数秒を維持');
    find('form').reset();await wait(10);assert(find('input[name=month]').value==='2026-06' && root.querySelector('button').textContent==='2026-06','リセットと表示同期');
    find('input[name=month]').disabled=true;await wait(0);assert(root.querySelector('button').disabled,'動的disabled');
  });
  await test('入力選択パネル: 色の検証とdatetimeのカレンダー', () => {
    mount('<form data-ui-validate><label>色<input type="color" class="form-control" name="color" value="#2f6fc4"></label><label>日時<input type="datetime-local" class="form-control" name="datetime" value="2026-10-21T09:00"></label></form>');
    const color=find('input[name=color]').closest('.ui-input-picker');color.querySelector('button').click();color.querySelector('[data-ui-picker-part=hex]').value='invalid';color.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=color]').value==='#2f6fc4' && !color.querySelector('.ui-picker-error').hidden,'不正な色は確定しない');
    color.querySelector('[data-ui-picker-part=hex]').value='#aabbcc';color.querySelector('[data-ui-picker-apply]').click();assert(find('input[name=color]').value==='#aabbcc','任意のカラーコード');
    const root=find('input[name=datetime]').closest('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();root.querySelector('[data-ui-picker-part=minute]').value='30';root.querySelector('[data-ui-picker-apply]').click();
    assert(find('input[name=datetime]').value==='2026-10-22T09:30','カレンダーと時刻をまとめて確定');
  });
  await test('入力選択パネル: 下書きは標準フォーム検証に混ぜない', () => {
    mount('<form><label>対象月<input type="month" class="form-control" name="month" value="2026-10" required></label></form>');
    const root=find('.ui-input-picker');root.querySelector('button').click();root.querySelector('[data-ui-picker-part=year]').value='0';
    root.querySelector('.ui-input-popup').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
    assert(find('form').checkValidity() && new FormData(find('form')).get('month')==='2026-10','未確定の不正な下書きでフォーム送信を妨げない');
  });
  await test('Checkbox・Radio: 一部選択・フォーム値・無効・リセット', async () => {
    mount('<form><label class="form-check"><input id="mixed-check" type="checkbox" class="form-check-input" data-ui-indeterminate name="notify" value="yes">通知</label><label><input type="checkbox" class="form-check-input" disabled name="disabled" checked>無効</label><input type="radio" class="form-check-input" name="plan" value="a" checked><input type="radio" class="form-check-input" name="plan" value="b"></form>');
    const mixed=find('#mixed-check');assert(mixed.indeterminate && !mixed.checked,'一部選択で初期化');
    mixed.click();assert(!mixed.indeterminate && mixed.checked && new FormData(find('form')).get('notify')==='yes','クリックで通常選択になり値を送信');
    KavUI.init(fixture);assert(!mixed.indeterminate,'再初期化で操作状態を戻さない');
    const radio=many('input[type=radio]');radio[1].click();assert(!radio[0].checked && radio[1].checked && new FormData(find('form')).get('plan')==='b','同じnameのラジオは排他選択');
    assert(!new FormData(find('form')).has('disabled'),'disabledは送信しない');
    find('form').reset();await wait(10);assert(mixed.indeterminate && !mixed.checked && radio[0].checked,'リセットで初期状態に戻る');
    mixed.click();find('form').addEventListener('reset',event=>event.preventDefault(),{once:true});find('form').reset();await wait(10);assert(mixed.checked && !mixed.indeterminate,'キャンセルしたresetでは状態を変えない');
  });
  await test('表示モード: system選択・同期・イベント・明暗と質感の独立', () => {
    const before=document.documentElement.dataset.uiColorPreference || 'system';
    try {
      mount('<div class="ui-color-switcher"><button data-ui-color-mode="light">明</button><button data-ui-color-mode="dark">暗</button><button data-ui-color-mode="system">OS</button></div><button data-ui-color-mode="system">OS別</button><select class="form-select" data-ui-color-select><option value="light">ライト</option><option value="dark">ダーク</option><option value="system">システム</option></select>');
      KavUI.setColorTheme('light');let changes=0,detail=null;
      const listen=event=>{changes++;detail=event.detail;};document.addEventListener('ui:colorchange',listen);
      try {
        const design=document.body.dataset.uiTheme;find('[data-ui-color-mode=system]').click();
        assert(document.documentElement.dataset.uiColorPreference==='system' && document.documentElement.dataset.bsTheme===(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),'選択と実際の明暗を別に管理');
        assert(many('[data-ui-color-mode=system]').every(button=>button.getAttribute('aria-pressed')==='true') && find('select').value==='system' && find('.ui-select-trigger').textContent==='システム','全形式を同期');
        assert(detail.mode==='system' && changes===1 && document.body.dataset.uiTheme===design,'変更を通知し、質感は維持');
        KavUI.setColorTheme('system');assert(changes===1,'同じ状態では重複通知しない');
        find('select').value='dark';find('select').dispatchEvent(new Event('change',{bubbles:true}));
        assert(document.documentElement.dataset.uiColorPreference==='dark' && find('[data-ui-color-mode=dark]').getAttribute('aria-pressed')==='true','selectからも同期');
      } finally {document.removeEventListener('ui:colorchange',listen);}
    } finally {KavUI.setColorTheme(before);}
  });
  await test('カレンダーの日付モーダル: 同日・空の予定・安全な表示・フォーム・フォーカス', async () => {
    mount('<form><div id="modal-calendar" data-ui-calendar data-ui-calendar-modal data-ui-month="2026-10" data-ui-value="2026-10-21" data-ui-name="day"><ul data-ui-calendar-events><li data-ui-date="2026-10-21" data-ui-variant="success">10:00 レビュー</li><li data-ui-date="2026-10-21">&lt;img src=x&gt;</li></ul></div></form><div id="plain-calendar" data-ui-calendar data-ui-month="2026-10"></div>');
    const root=find('#modal-calendar');let detail;root.addEventListener('ui:dayopen',event=>{detail=event.detail;});
    assert(!root.querySelector('dialog'),'初期選択では開かず遅延生成');
    root.querySelector('[data-ui-calendar-action=next]').click();assert(!root.querySelector('dialog'),'月移動でも開かない');root.querySelector('[data-ui-calendar-action=prev]').click();
    root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();const dialog=root.querySelector('dialog');
    assert(dialog.open && dialog.dataset.uiCalendarModalValue==='2026-10-21' && dialog.querySelector('h2').textContent.includes('10月21日'),'既に選択済みの日も開く');
    assert(dialog.querySelectorAll('.ui-calendar-agenda-event').length===2 && !dialog.querySelector('img') && dialog.textContent.includes('<img src=x>'),'予定はテキストで安全に表示');
    assert(detail.value==='2026-10-21' && detail.dialog===dialog && detail.events.length===2,'選択日・モーダル・予定を通知');
    assert(root.querySelector('.ui-calendar-agenda').hidden,'下部の予定欄を置き換える');
    dialog.querySelector('[data-ui-dismiss]').click();await wait(20);
    assert(!dialog.open && document.activeElement===root.querySelector('[data-ui-calendar-date="2026-10-21"]'),'再描画した日付ボタンにフォーカスが戻る');
    KavUI.init(root);root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(root.querySelectorAll('dialog').length===1 && dialog.open && dialog.querySelector('.ui-calendar-empty') && !dialog.querySelector('.ui-calendar-agenda-list'),'別日で内容を更新し予定なしを表示');
    assert(new FormData(find('form')).get('day')==='2026-10-22','フォーム値も維持');
    dialog.querySelector('[data-ui-dismiss]').click();await wait(0);
    find('#plain-calendar [data-ui-calendar-date="2026-10-21"]').click();assert(!find('#plain-calendar dialog') && !find('#plain-calendar .ui-calendar-agenda').hidden,'オプションなしの既存表示を維持');
  });
  await test('カレンダーの日付モーダル: 既存dialog・無効日・false・不正な参照', async () => {
    mount('<div id="custom-calendar" data-ui-calendar data-ui-calendar-modal="#day-details" data-ui-month="2026-10" data-ui-min="2026-10-20" data-ui-max="2026-10-23"><ul data-ui-calendar-events><li data-ui-date="2026-10-21">会議</li></ul></div><dialog id="day-details" class="ui-dialog" aria-labelledby="day-title"><h2 id="day-title" data-ui-calendar-modal-title></h2><div data-ui-calendar-modal-events></div><p id="day-note">独自の説明</p><button data-ui-dismiss="dialog">閉じる</button></dialog>');
    const root=find('#custom-calendar'),dialog=find('#day-details');
    root.querySelector('[data-ui-calendar-date="2026-10-19"]').click();assert(!dialog.open,'範囲外の日付は開かない');
    root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();assert(dialog.open && dialog.querySelector('.ui-calendar-agenda-event').textContent==='会議' && find('#day-note').textContent==='独自の説明','指定したdialogの対象領域だけ更新');
    dialog.querySelector('button').click();await wait(0);
    root.dataset.uiCalendarModal='false';root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();assert(!dialog.open && !root.querySelector('.ui-calendar-agenda').hidden,'falseで従来表示');
    root.dataset.uiCalendarModal='#missing-dialog';root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();assert(!dialog.open && !root.querySelector('.ui-calendar-agenda').hidden && root.querySelector('[role=status]').textContent.includes('見つかりません'),'参照不備でも予定を確認できる');
  });
  await test('カレンダーの月・日付切り替えは動かさず、状態・フォーカス・通知を維持', () => {
    mount('<div data-ui-calendar data-ui-month="2026-10" data-ui-value="2026-10-21"></div>'+dateField('still-date','value="2026-10-21"'));
    const root=find('[data-ui-calendar]');let months=0,dates=0;
    root.addEventListener('ui:monthchange',()=>months++);root.addEventListener('ui:datechange',()=>dates++);
    root.querySelector('[data-ui-calendar-action=next]').click();
    assert(root.dataset.uiMonth==='2026-11' && months===1,'月とイベントを即時更新');
    assert(!root.getAnimations({subtree:true}).length,'月切り替えで移動・フェードしない');
    root.querySelector('[data-ui-calendar-date="2026-11-10"]').click();
    assert(root.dataset.uiValue==='2026-11-10' && dates===1 && document.activeElement.dataset.uiCalendarDate==='2026-11-10','選択とフォーカスを維持');
    assert(!root.getAnimations({subtree:true}).length,'選択日に拡縮を付けない');
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'PageDown',bubbles:true,cancelable:true}));
    assert(root.dataset.uiMonth==='2026-12' && !root.getAnimations({subtree:true}).length,'キーボードの月切り替えも即時');
    find('[data-ui-datepicker-action=toggle]').click();
    const calendar=find('.ui-datepicker-popup [data-ui-calendar]');
    calendar.querySelector('[data-ui-calendar-action=next]').click();
    assert(calendar.dataset.uiMonth==='2026-11' && !calendar.getAnimations({subtree:true}).length,'フォーム用も同じ表示方式');
    calendar.querySelector('[data-ui-calendar-date="2026-11-11"]').click();
    assert(find('#still-date').value==='2026-11-11' && document.activeElement===find('#still-date'),'フォームへの反映とフォーカス復帰を維持');
  });
  await test('Calendar destroy: 同じrootの再初期化・再描画と生成DOMの後始末', () => {
    mount('<div data-ui-calendar data-ui-name="day" data-ui-month="2026-10" data-ui-calendar-modal><ul data-ui-calendar-events><li data-ui-date="2026-10-21">会議</li></ul></div>');
    const root=find('[data-ui-calendar]'),events=root.querySelector('ul');
    root.querySelector('[data-ui-calendar-date="2026-10-21"]').click();
    assert(root.querySelector('dialog[open]'),'日付モーダルを開く');KavUI.destroy(root);
    assert(!root.querySelector('[data-ui-calendar-view],dialog,[data-ui-calendar-input]')&&!events.hidden,'生成UIを除去しイベント一覧の表示を戻す');
    KavUI.init(root);assert(root.querySelectorAll('[data-ui-calendar-date]').length===42,'同じDOMへ再初期化できる');
    KavUI.destroy(root);root.replaceChildren();KavUI.init(root);
    assert(root.querySelectorAll('[data-ui-calendar-date]').length===42,'rootの内部再描画後も日付を生成');
    root.querySelector('[data-ui-calendar-date="2026-10-22"]').click();
    assert(root.dataset.uiValue==='2026-10-22'&&root.querySelector('input').value==='2026-10-22','再生成後の操作とフォーム値');
    KavUI.destroy(root);
  });
  await test('Command: 検索・空結果・無効項目・キーボード選択・IME', () => {
    mount('<div data-ui-command><input data-ui-command-input aria-label="操作を検索"><div data-ui-command-list><section data-ui-command-group="ページ"><button type="button" data-ui-command-item data-ui-value="docs" data-ui-keywords="ガイド guide">ドキュメント</button><button type="button" data-ui-command-item disabled>管理</button><button type="button" data-ui-command-item data-ui-value="settings">設定</button></section></div><p data-ui-command-empty hidden>該当なし</p><p data-ui-command-status></p></div>');
    const root=find('[data-ui-command]'),input=find('input');let selected=[];root.addEventListener('ui:commandselect',e=>selected.push(e.detail.value));
    assert(input.getAttribute('role')==='combobox' && input.getAttribute('aria-controls')===find('[data-ui-command-list]').id,'検索と一覧のARIA関連付け');
    input.value='ＧＵＩＤＥ';input.dispatchEvent(new Event('input',{bubbles:true}));
    assert(!find('[data-ui-value=docs]').hidden && find('[data-ui-value=settings]').hidden,'全角英数字・キーワードの部分一致');
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true}));assert(selected.length===0,'IME確定では実行しない');
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert(selected[0]==='docs','Enterで選択イベント');
    input.value='一致しない';input.dispatchEvent(new Event('input',{bubbles:true}));assert(!find('[data-ui-command-empty]').hidden&&!input.hasAttribute('aria-activedescendant'),'0件の表示とアクティブ解除');
    input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
    assert(input.getAttribute('aria-activedescendant')===find('[data-ui-value=settings]').id,'無効項目を飛ばして選ぶ');KavUI.destroy(root);
  });
  await test('Command: ダイアログ・ショートカット・破棄・動的項目', async () => {
    mount('<button id="command-opener" type="button">Open</button><dialog class="ui-dialog" data-ui-dialog data-ui-command data-ui-command-shortcut="k"><input data-ui-command-input aria-label="検索"><div data-ui-command-list><button type="button" data-ui-command-item data-ui-value="first">First</button></div><p data-ui-command-empty hidden>Empty</p></dialog>');
    const root=find('dialog'),input=find('input');find('#command-opener').focus();
    const shortcut=()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));shortcut();assert(root.open&&document.activeElement===input,'任意のCtrl+Kで開き入力へフォーカス');
    find('[data-ui-command-item]').click();await wait(40);assert(!root.open&&document.activeElement===find('#command-opener'),'選択で閉じフォーカス復帰');
    const item=document.createElement('button');item.type='button';item.dataset.uiCommandItem='';item.textContent='Second';root.querySelector('[data-ui-command-list]').append(item);KavUI.init(root);
    assert(item.getAttribute('role')==='option','追加項目を再初期化');KavUI.destroy(root);shortcut();assert(!root.open&&!input.hasAttribute('role')&&!item.hasAttribute('role'),'破棄でイベント・ARIAを戻す');
    KavUI.init(root);shortcut();assert(root.open,'同じDOMに再初期化');KavUI.destroy(root);assert(!root.open,'破棄でモーダルを残さない');
  });
  await test('Carousel: 前後・ループ・キーボード・ARIA・破棄', async () => {
    mount('<div class="ui-carousel" data-ui-carousel aria-label="紹介" style="width:300px;max-width:100%"><div class="ui-carousel-viewport" data-ui-carousel-viewport><section class="ui-carousel-slide"><a href="#one">One</a></section><section class="ui-carousel-slide">Two</section><section class="ui-carousel-slide">Three</section></div><button type="button" data-ui-carousel-prev>Prev</button><button type="button" data-ui-carousel-next>Next</button><button type="button" data-ui-carousel-to="2">Third</button><span data-ui-carousel-status></span></div>');
    const root=find('[data-ui-carousel]'),viewport=find('[data-ui-carousel-viewport]'),slides=many('.ui-carousel-slide');let changes=0;root.addEventListener('ui:carouselchange',()=>changes++);
    assert(find('[data-ui-carousel-prev]').disabled&&slides[1].inert&&viewport.tabIndex===0,'初期状態と画面外のフォーカス抑止');
    find('[data-ui-carousel-next]').click();assert(root.dataset.uiCarouselIndex==='1'&&!slides[1].inert&&slides[0].inert&&changes===1,'次へと選択状態');
    find('[data-ui-carousel-to]').click();assert(root.dataset.uiCarouselIndex==='2'&&find('[data-ui-carousel-next]').disabled,'直接指定と終端');
    root.dataset.uiCarouselLoop='';KavUI.init(root);find('[data-ui-carousel-next]').click();assert(root.dataset.uiCarouselIndex==='0','任意のループ');
    viewport.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));assert(root.dataset.uiCarouselIndex==='2','キーボードで最後へ');
    const added=document.createElement('section');added.className='ui-carousel-slide';added.textContent='Four';viewport.append(added);KavUI.init(root);assert(slides[0].getAttribute('aria-label')==='1 / 4'&&added.getAttribute('aria-label')==='4 / 4','追加後に位置の読み上げを更新');
    KavUI.destroy(root);assert(!root.hasAttribute('data-ui-carousel-ready')&&!viewport.hasAttribute('tabindex')&&slides.every(s=>!s.inert&&!s.hasAttribute('aria-hidden')),'破棄で属性と操作を復元');
    const value=root.dataset.uiCarouselIndex;find('[data-ui-carousel-next]').click();assert(root.dataset.uiCarouselIndex===value,'破棄後に操作しない');KavUI.init(root);assert(root.hasAttribute('data-ui-carousel-ready'),'再初期化');KavUI.destroy(root);
  });
  await test('Rating: ネイティブradioの送信値・reset・無効状態', () => {
    mount('<form><fieldset class="ui-rating"><legend>評価</legend><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="1">1</label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="2" checked>2</label><label class="ui-rating-choice"><input class="ui-rating-input" type="radio" name="rating" value="3" disabled>3</label></fieldset><button type="reset">Reset</button></form>');
    find('[value="1"]').click();assert(new FormData(find('form')).get('rating')==='1','標準のフォーム値');find('[value="3"]').click();assert(new FormData(find('form')).get('rating')==='1','無効値を選択しない');find('form').reset();assert(new FormData(find('form')).get('rating')==='2','初期値へreset');
  });
  await test('Scroll: 現在地を領域内だけ移動・状態変更・破棄', async () => {
    mount('<div data-ui-scroll-active style="height:70px;width:220px;overflow:auto"><a aria-current="">Unset</a><div style="height:180px"></div><a href="#scroll-last" aria-current="page" id="scroll-current">Current</a><div style="height:180px"></div><a href="#scroll-first" id="scroll-other">Other</a></div>');
    const root=find('[data-ui-scroll-active]'),current=find('#scroll-current'),other=find('#scroll-other'),before=scrollY;
    await wait(50);assert(root.scrollTop>0,'初期の現在地を表示');assert(scrollY===before,'本文をスクロールしない');
    const first=root.scrollTop;current.removeAttribute('aria-current');other.setAttribute('aria-current','page');await wait(50);assert(root.scrollTop>first,'現在地の変更を追跡');
    KavUI.init(root);KavUI.init(root);await wait(30);KavUI.destroy(root);root.scrollTop=0;current.setAttribute('aria-current','page');other.removeAttribute('aria-current');await wait(50);assert(root.scrollTop===0,'破棄で監視と予約処理を停止');
    KavUI.init(root);await wait(50);assert(root.scrollTop>0,'同じDOMへ再初期化');KavUI.destroy(root);
  });
  await test('Toast: コピーアイコンが本文・タイトル末尾で文字サイズに揃う', () => {
    for(const options of [{title:'通知',body:'本文の末尾'},{title:'タイトルのみ'},{body:'長い本文'.repeat(40)}]) {
      const note=KavUI.toast({...options,copy:true,duration:0}),button=note.querySelector('[data-ui-copy]');
      const message=note.querySelector(options.body?'.ui-toast-body':'.ui-toast-title');
      assert(button.closest('.ui-toast-body, .ui-toast-title')===message&&message.lastElementChild.contains(button),'メッセージ末尾へ配置');
      assert(!note.querySelector('.ui-toast-actions'),'独立した操作行は作らない');
      assert(Math.abs(parseFloat(getComputedStyle(button.querySelector('svg')).width)-parseFloat(getComputedStyle(message).fontSize))<.5,'アイコンは本文/タイトルの1em');
    }
  });
  await test('Light surfaces: 明るさを抑えた標準背景とMaterial・カスタム配色', () => {
    const state=paletteState();
    try {
      KavUI.setColorTheme('light');KavUI.setPalette('default');
      assert(getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg').trim()==='#f4f3f0','標準は柔らかいオフホワイト');
      for(const palette of ['slate','sage','teal','mauve','sand','clay']){
        KavUI.setPalette(palette);const style=getComputedStyle(document.documentElement);
        assert(style.getPropertyValue('--md-sys-color-surface').trim()===style.getPropertyValue('--md-sys-color-surface-container-low').trim(),'Surfaceは既存のHCT tone96');
        assert(style.getPropertyValue('--md-sys-color-surface-container-lowest').trim()!=='#ffffff','最も明るい面も純白を抑える');
      }
      KavUI.setCustomPalette('#52796f',{chroma:20,persist:true});const cached=JSON.parse(localStorage.getItem('kav-ui-custom-palette'));
      assert(cached.version===2&&cached.light['--bs-body-bg']===cached.light['--md-sys-color-surface-container-low'],'カスタムも同じ明度・保存形式');
      KavUI.setPalette('default');KavUI.setColorTheme('dark');assert(getComputedStyle(document.documentElement).getPropertyValue('--bs-body-bg').trim()==='#1b1c1e','ダーク背景は維持');
    } finally {restorePaletteState(state);}
  });
  const dataTableMarkup=()=>`<div class="ui-data-table" data-ui-data-table data-ui-page-size="2">
    <input data-ui-table-search type="search" aria-label="検索"><select data-ui-table-page-size aria-label="表示件数"><option value="2">2</option><option value="3">3</option><option value="0">すべて</option></select>
    <table class="table"><thead><tr><th><input type="checkbox" data-ui-table-select-all aria-label="表示行を選択"></th><th scope="col"><button type="button" data-ui-table-sort="text">名前</button></th><th scope="col"><button type="button" data-ui-table-sort="number">数値</button></th><th scope="col"><button type="button" data-ui-table-sort="date">日付</button></th></tr></thead><tbody>
    ${[['a','Alpha','10','2026-10-20'],['b','Beta','2','2026-10-22'],['c','Gamma','10','2026-10-21'],['d','Guide','100',''],['e','Delta','','2026-10-19'],['h','Hidden','0','2020-01-01']].map(([key,label,value,date])=>`<tr data-ui-row-id="${key}" ${key==='h'?'hidden':''} ${key==='d'?'data-ui-table-keywords="日本語 ドキュメント"':''}><td><input type="checkbox" data-ui-row-select aria-label="${label}を選択" ${key==='e'?'disabled':''}></td><td>${label}</td><td data-ui-sort-value="${value}">${value?value+' units':'未設定'}</td><td>${date}</td></tr>`).join('')}
    </tbody></table><p data-ui-table-status role="status"></p><p data-ui-table-selection role="status"></p><button type="button" data-ui-table-prev>前へ</button><span data-ui-table-page-status></span><button type="button" data-ui-table-next>次へ</button>
  </div>`;
  const visibleDataRows=()=>many('tbody tr[data-ui-row-id]').filter(row=>!row.hidden).map(row=>row.dataset.uiRowId).join(',');
  await test('Data table: 検索・ページ送り・表示件数・空結果', () => {
    mount(dataTableMarkup());const search=find('[data-ui-table-search]');
    assert(visibleDataRows()==='a,b'&&find('[data-ui-table-prev]').disabled,'初期ページ2件');
    find('[data-ui-table-next]').click();assert(visibleDataRows()==='c,d','次の2件');
    search.value='ＧＵＩＤＥ';search.dispatchEvent(new Event('input',{bubbles:true}));assert(visibleDataRows()==='d'&&find('[data-ui-table-next]').disabled,'全角検索で最初のページへ');
    search.value='日本語';search.dispatchEvent(new Event('input',{bubbles:true}));assert(visibleDataRows()==='d','追加キーワード');
    search.value='存在しない';search.dispatchEvent(new Event('input',{bubbles:true}));assert(!find('[data-ui-table-empty]').hidden&&visibleDataRows()===''&&find('[data-ui-table-status]').textContent.includes('0'),'空の表示');
    search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));const size=find('[data-ui-table-page-size]');size.value='0';size.dispatchEvent(new Event('change',{bubbles:true}));assert(visibleDataRows()==='a,b,c,d,e'&&find('[data-ui-row-id=h]').hidden,'全件でも元のhiddenを維持');
  });
  await test('Data table: 数値・日付・安定ソートと元の順番', () => {
    mount(dataTableMarkup());const size=find('[data-ui-table-page-size]');size.value='0';size.dispatchEvent(new Event('change',{bubbles:true}));
    const number=find('[data-ui-table-sort=number]');number.click();assert(visibleDataRows()==='b,a,c,d,e'&&number.closest('th').getAttribute('aria-sort')==='ascending','数値は表示文字列と分離し同値の順序を維持');
    number.click();assert(visibleDataRows()==='d,a,c,b,e','降順でも欠損は末尾');number.click();assert(visibleDataRows()==='a,b,c,d,e','3回目は元の順序');
    find('[data-ui-table-sort=date]').click();assert(visibleDataRows()==='e,a,c,b,d','日付と欠損を比較');
    find('[data-ui-table-sort=text]').click();assert(visibleDataRows()==='a,b,e,c,d','文字列の昇順');
  });
  await test('Data table: 選択・現在ページの一括選択・無効行・イベント', () => {
    mount(dataTableMarkup());const root=find('[data-ui-data-table]'),all=find('[data-ui-table-select-all]');let selected=[];root.addEventListener('ui:tableselect',event=>selected=event.detail.selected);
    find('[data-ui-row-id=a] [data-ui-row-select]').click();assert(all.indeterminate&&!all.checked&&selected.join()==='a','一部選択');all.click();assert(all.checked&&!all.indeterminate&&selected.join()==='a,b','現在の2行を選択');
    find('[data-ui-table-next]').click();assert(!all.checked&&!all.indeterminate,'次のページのチェック状態');find('[data-ui-row-id=c] [data-ui-row-select]').click();assert(selected.join()==='a,b,c','前ページの選択を保持');
    const search=find('[data-ui-table-search]');search.value='Gamma';search.dispatchEvent(new Event('input',{bubbles:true}));assert(all.checked,'検索結果の一括選択状態');all.click();assert(selected.join()==='a,b','絞り込んだ表示行だけ解除');
    search.value='Delta';search.dispatchEvent(new Event('input',{bubbles:true}));assert(all.disabled,'選択できない行しかない場合');KavUI.destroy(root);
  });
  await test('Data table: 追加・削除・再初期化・破棄と複数表の独立', () => {
    mount(dataTableMarkup()+dataTableMarkup());const root=many('[data-ui-data-table]')[0],other=many('[data-ui-data-table]')[1],body=root.querySelector('tbody');
    root.querySelector('[data-ui-table-sort=number]').click();assert([...other.querySelectorAll('tbody tr[data-ui-row-id]')].filter(row=>!row.hidden).map(row=>row.dataset.uiRowId).join()==='a,b','他の表を変更しない');
    const added=document.createElement('tr');added.dataset.uiRowId='new';added.innerHTML='<td></td><td>New</td><td data-ui-sort-value="1">1</td><td>2026-10-23</td>';body.append(added);KavUI.init(root);assert(!added.hidden,'追加行を現在の並び順に反映');
    const removed=body.querySelector('[data-ui-row-id=b]');removed.remove();KavUI.init(root);KavUI.init(root);assert(root.querySelectorAll('[data-ui-table-empty]').length===1,'繰り返しても空表示は1件');
    KavUI.destroy(root);assert(!root.hasAttribute('data-ui-table-ready')&&!root.querySelector('[data-ui-table-empty]')&&[...body.rows].map(row=>row.dataset.uiRowId).join()==='a,c,d,e,h,new','破棄で順序を戻し削除行を復活させない');
    assert(!body.querySelector('[data-ui-row-id=c]').hidden&&body.querySelector('[data-ui-row-id=h]').hidden&&!root.querySelector('th[aria-sort]'),'表示とARIAを復元');
    root.querySelector('[data-ui-table-sort=number]').click();assert([...body.rows].map(row=>row.dataset.uiRowId).join()==='a,c,d,e,h,new','破棄後に操作しない');KavUI.init(root);assert(root.hasAttribute('data-ui-table-ready'),'再利用');KavUI.destroy(root);KavUI.destroy(other);
  });
  await test('Data table: フォームresetとキャンセル・フォーカス保持', async () => {
    mount('<form>'+dataTableMarkup()+'</form>');const root=find('[data-ui-data-table]'),form=find('form'),search=find('[data-ui-table-search]'),size=find('[data-ui-table-page-size]');
    find('[data-ui-table-sort=number]').click();const check=find('[data-ui-row-id=a] [data-ui-row-select]');check.focus();check.click();assert(document.activeElement===check,'行選択でフォーカスを失わない');
    search.value='Guide';search.dispatchEvent(new Event('input',{bubbles:true}));size.value='3';size.dispatchEvent(new Event('change',{bubbles:true}));form.reset();await wait(30);
    assert(search.value===''&&size.value==='2'&&visibleDataRows()==='a,b'&&!check.checked&&!find('th[aria-sort]'),'フォームの初期値と元の並びへ戻す');
    search.value='Gamma';search.dispatchEvent(new Event('input',{bubbles:true}));form.addEventListener('reset',event=>event.preventDefault(),{once:true});form.reset();await wait(30);assert(search.value==='Gamma'&&visibleDataRows()==='c','キャンセルしたresetは反映しない');KavUI.destroy(root);
  });
  await test('Data table: 表そのものへの指定・空の表・不正な件数', () => {
    mount('<table data-ui-data-table data-ui-page-size="invalid"><thead><tr><th><button type="button" data-ui-table-sort="number">数</button></th></tr></thead><tbody></tbody></table>');
    const root=find('table');assert(root.hasAttribute('data-ui-table-ready')&&!find('[data-ui-table-empty]').hidden&&find('[data-ui-table-empty] td').colSpan===1,'0件でも操作可能な空表示');KavUI.destroy(root);assert(!root.id&&!root.hasAttribute('data-ui-table-ready')&&!find('[data-ui-table-empty]'),'生成したIDと空表示も復元');
  });
  await test('Scroll once: 初回だけ現在地を表示し開閉では位置を保持', async () => {
    mount('<div data-ui-scroll-active="once" style="height:80px;width:220px;overflow:auto"><details><summary>展開する</summary><div style="height:150px">子メニュー</div></details><div style="height:200px"></div><a aria-current="page" href="#current">現在のページ</a></div>');
    const root=find('[data-ui-scroll-active]'),summary=find('summary');await wait(60);assert(root.scrollTop>0,'初回の現在地表示は行う');
    root.scrollTop=0;summary.focus({preventScroll:true});summary.click();await wait(60);assert(root.scrollTop===0&&document.activeElement===summary,'展開しても現在地へ戻さない');
    summary.click();await wait(60);assert(root.scrollTop===0&&document.activeElement===summary,'閉じるときも位置とフォーカスを保つ');
    find('a').setAttribute('aria-current','page');KavUI.init(root);await wait(60);assert(root.scrollTop===0,'同じDOMの再初期化でも引き戻さない');
    KavUI.destroy(root);KavUI.init(root);await wait(60);assert(root.scrollTop>0,'破棄後は新しい初期表示として扱う');KavUI.destroy(root);
  });
  document.title = failures.length ? 'FAIL — UI tests' : 'PASS — UI tests';
  return {passed, failures};
})();
