(() => {
  const form = document.getElementById('flex-controls');
  const preview = document.getElementById('flex-preview');
  const viewport = document.getElementById('flex-viewport');
  const code = document.getElementById('flex-output');
  const size = document.getElementById('flex-width-value');
  const controls = form.elements;
  function render() {
    const width = Number(controls.namedItem('width').value);
    const gap = Number(controls.namedItem('gap').value);
    const properties = {
      'flex-direction': controls.namedItem('direction').value,
      'flex-wrap': controls.namedItem('wrap').value,
      'justify-content': controls.namedItem('justify').value,
      'align-items': controls.namedItem('items').value,
      'align-content': controls.namedItem('content').value,
      gap: gap + 'px',
    };
    for (const [property, value] of Object.entries(properties)) preview.style.setProperty(property, value);
    viewport.style.setProperty('--preview-width', width + 'px');
    size.textContent = width + 'px（表示幅は親要素の幅まで）';
    const children = [...preview.children];
    children.forEach(child => {
      child.style.flex = controls.namedItem('sizing').value;
    });
    children[1].style.alignSelf = controls.namedItem('self').value;
    const declarations = Object.entries({display:'flex', ...properties}).map(([key, value]) => `  ${key}: ${value};`).join('\n');
    code.textContent = `.container {\n${declarations}\n  min-height: 240px;\n}\n.item {\n  flex: ${controls.namedItem('sizing').value};\n  padding: 12px;\n}\n.item:nth-child(2) {\n  align-self: ${controls.namedItem('self').value};\n}`;
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  document.getElementById('flex-reset').addEventListener('click', () => { form.reset(); render(); });
  render();
})();
