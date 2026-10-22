import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from '@astrojs/compiler-rs';
import {experimental_AstroContainer as AstroContainer} from 'astro/container';

test('Astro: chart SSR keeps external labels inside its JSON script and preserves their values',async()=>{
  const sourceURL=new URL('../../packages/astro/src/components/KavChart.astro',import.meta.url);
  const source=await readFile(sourceURL,'utf8');
  const {code}=transform(source,{
    filename:sourceURL.pathname,
    internalURL:import.meta.resolve('astro/compiler-runtime'),
    resolvePath:specifier=>specifier
  });
  const {default:KavChart}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const container=await AstroContainer.create();
  const config={
    type:'bar',
    labels:['</script><img src=x onerror=alert(1)>','</ScRiPt><script>alert(2)</script>','日本語 < & " \\'],
    series:[{name:'<利用者>',values:[1,2,3]}]
  };
  const html=await container.renderToString(KavChart,{props:{config}});
  const match=html.match(/<script type="application\/json" data-ui-chart-data>([\s\S]*?)<\/script>/i);
  assert.ok(match,'the SSR output contains chart JSON');
  assert.doesNotMatch(match[1],/</,'JSON cannot contain an HTML script closing tag or injected markup');
  assert.deepEqual(JSON.parse(match[1]),config,'JSON decoding preserves labels and series names');
  assert.doesNotMatch(html,/<img\b|<script>alert/i,'external labels do not become HTML elements');
});
