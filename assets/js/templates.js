/* Optional service template behavior; copy with templates.css when reusing a page. */
(() => {
  'use strict';
  const doc=document;
  const header=doc.querySelector('.ui-header');
  if(header) {
    const measure=()=>doc.body.style.setProperty('--template-header-height',header.getBoundingClientRect().height+'px');
    measure();if(window.ResizeObserver)new ResizeObserver(measure).observe(header);
  }
  const normalize=value=>value.normalize('NFKC').toLocaleLowerCase('ja-JP');
  const menu=doc.querySelector('.template-doc-menu');
  if(menu) {
    const mobile=matchMedia('(width < 768px)');
    const syncMenu=()=>{menu.open=!mobile.matches;};syncMenu();mobile.addEventListener('change',syncMenu);
    menu.addEventListener('click',event=>{if(event.target.closest('a') && mobile.matches)menu.open=false;});
    const search=doc.querySelector('[data-doc-search]'),sections=[...doc.querySelectorAll('[data-doc-section]')];
    search.addEventListener('input',()=>{
      const query=normalize(search.value.trim());let count=0;
      for(const section of sections) {
        section.hidden=!!query && !normalize(section.textContent).includes(query);
        if(!section.hidden)count++;
        doc.querySelectorAll('a[href="#'+section.id+'"]').forEach(link=>{link.hidden=section.hidden;});
      }
      doc.querySelector('[data-doc-results]').textContent=query?count+'件のセクションが一致':'すべてのセクションを表示';
      doc.querySelector('[data-doc-empty]').hidden=count>0;
    });
    doc.querySelectorAll('.ui-aside-nav a').forEach(link=>link.addEventListener('click',()=>{
      doc.querySelectorAll('.ui-aside-nav a').forEach(item=>item.removeAttribute('aria-current'));link.setAttribute('aria-current','location');
    }));
  }
  const period=doc.getElementById('dashboard-period');
  if(period) {
    const datasets={
      '7':{labels:['10/16','10/17','10/18','10/19','10/20','10/21','10/22'],values:[52000,64000,58000,81000,69000,74000,84000],orders:126,users:84,channels:[420,280,190,110]},
      '30':{labels:Array.from({length:30},(_,i)=>{const date=new Date(2026,8,23+i);return (date.getMonth()+1)+'/'+date.getDate();}),values:Array.from({length:30},(_,i)=>42000+(i%7)*4500+Math.floor(i/7)*3500),orders:498,users:312,channels:[1820,1120,760,430]}
    };
    const revenue=doc.getElementById('revenue-chart'),channels=doc.getElementById('channel-chart');
    function update() {
      const data=datasets[period.value] || datasets['7'],total=data.values.reduce((a,b)=>a+b,0);
      const currency=value=>'¥'+Math.round(value).toLocaleString('ja-JP');
      const metrics={revenue:currency(total),orders:data.orders.toLocaleString('ja-JP'),users:data.users.toLocaleString('ja-JP'),average:currency(total/data.orders)};
      for(const [key,value] of Object.entries(metrics))doc.querySelector('[data-metric="'+key+'"]').textContent=value;
      KavUI.chart(revenue,{type:'area',label:'売上の推移',unit:'円',labels:data.labels,series:[{name:'売上',values:data.values}]});
      KavUI.chart(channels,{type:'donut',label:'流入元',unit:'件',labels:['検索','直接アクセス','紹介','その他'],series:[{name:'訪問数',values:data.channels}]});
      doc.getElementById('dashboard-status').textContent='過去'+period.value+'日のサンプルデータを表示しました。';
    }
    period.addEventListener('change',update);update();
    doc.getElementById('dashboard-export').addEventListener('click',()=>{
      const data=datasets[period.value] || datasets['7'];
      const rows=[['日付','売上（円）'],...data.labels.map((label,index)=>[label,data.values[index]])];
      const csv='\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n');
      const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
      const link=doc.createElement('a');link.href=url;link.download='workspace-revenue-'+period.value+'days.csv';doc.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      KavUI.toast({title:'CSVを作成しました',body:'選択中の期間の売上サンプルデータです。',variant:'success'});
    });
  }
  const releases=[...doc.querySelectorAll('[data-release]')];
  if(releases.length) {
    let filter='all';const search=doc.querySelector('[data-release-search]');
    const apply=()=>{
      const query=normalize(search.value.trim());let count=0;
      for(const release of releases){release.hidden=(filter!=='all' && release.dataset.release!==filter) || !normalize(release.textContent).includes(query);if(!release.hidden)count++;}
      doc.querySelector('[data-release-results]').textContent=count+'件の更新';doc.querySelector('[data-release-empty]').hidden=count>0;
    };
    doc.querySelectorAll('[data-release-filter]').forEach(button=>button.addEventListener('click',()=>{
      filter=button.dataset.releaseFilter;doc.querySelectorAll('[data-release-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));apply();
    }));search.addEventListener('input',apply);
  }
})();
