window.catalogTestsDone = (() => {
  let passed = 0;
  const failures = [];
  const results = document.getElementById('results');
  const assert = (value, message) => { if (!value) throw new Error(message); };
  function test(name, fn) {
    const item = document.createElement('li');
    try { fn(); passed++; item.textContent = 'PASS: ' + name; }
    catch (error) { failures.push(name + ': ' + error.message); item.textContent = 'FAIL: ' + name; }
    results.append(item);
  }
  function sample(name) {
    const example = document.querySelector('[data-case="' + name + '"]');
    const text = example.nextElementSibling.querySelector('code').textContent;
    const parsed = document.createElement('template'); parsed.innerHTML = text;
    return {example, text, parsed:parsed.content};
  }
  test('階層を2スペースで字下げし、元のサンプルを変更しない', () => {
    const {example,text} = sample('nested');
    assert(text.includes('\n  <article') && text.includes('\n    <div') && text.includes('\n      <h2>見出し</h2>'), '入れ子を整形');
    assert(example.innerHTML === '<div class="fx-grid"><article class="ui-card"><div class="ui-card-body"><h2>見出し</h2><p>本文</p></div></article></div>', 'ライブDOMは元のまま');
  });
  test('長い開始タグは属性ごとに改行し、値を保持する', () => {
    const {example,text,parsed} = sample('attributes');
    assert(text.startsWith('<button\n') && text.includes('\n  data-ui-title='), '属性を整形');
    const original=example.querySelector('button'), copy=parsed.querySelector('button');
    for (const attr of original.attributes) assert(copy.getAttribute(attr.name)===attr.value,'値を保持: '+attr.name);
    assert(text.includes('&#10;') && text.includes('&quot;'), '属性内の改行と引用符を保護');
  });
  test('文章内のリンク・強調・記号の間隔を保つ', () => {
    const {example,parsed}=sample('mixed');
    assert(parsed.querySelector('p').innerHTML===example.querySelector('p').innerHTML,'インラインの境界に余分な空白を足さない');
  });
  test('textarea・pre・空白を保持する要素を壊さない', () => {
    const {example,parsed}=sample('whitespace');
    for(const selector of ['textarea','pre','div']) assert(example.querySelector(selector).textContent===parsed.querySelector(selector).textContent,'空白を保持: '+selector);
  });
  test('void要素・SVG・コメントを保持する', () => {
    const {text,parsed}=sample('void');
    assert(!text.includes('</input>') && !text.includes('</br>'),'void要素に閉じタグを生成しない');
    assert(parsed.querySelector('input').value==='A & B','エスケープを保持');
    assert(parsed.querySelector('svg').getAttribute('viewBox')==='0 0 24 24','SVGの属性名の大文字小文字を保持');
    assert(parsed.querySelector('path').namespaceURI==='http://www.w3.org/2000/svg','SVGの名前空間を保持');
    assert(text.includes('<!-- メモ -->'),'コメントを保持');
  });
  test('各サンプルは元HTMLのコピー操作と状態表示を持つ', () => {
    const {example,text}=sample('nested'),source=example.nextElementSibling;
    const copy=source.querySelector('[data-ui-copy]');
    assert(copy && copy.dataset.uiCopy===text,'表示コードと同じ元のHTMLをコピー');
    assert(source.querySelector('[data-ui-copy-status][role="status"]'),'コピー結果の出力先');
  });
  return {passed,failures};
})();
