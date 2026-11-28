/* Fixed daily usage and illustrative USD pricing for the LLM Gateway template. */
(function () {
  const initialize = () => {
    'use strict';
    const get = id => document.getElementById('llm-' + id);
    const days = Array.from({length: 14}, (_, index) => '11/' + (14 + index));
    const models = [
      {id: 'atlas-mini', name: 'Atlas Mini', rates: {input: 2, cached: 1, output: 8}},
      {id: 'atlas-pro', name: 'Atlas Pro', rates: {input: 5, cached: 2, output: 15}}
    ];
    const users = ['user-1042', 'user-1086', 'user-1123', 'user-1170'];
    const counts = new Intl.NumberFormat('ja-JP');
    const usd = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
    const percent = new Intl.NumberFormat('ja-JP', {style: 'percent', maximumFractionDigits: 1});
    const load = [84, 102, 93, 77, 130, 115, 121, 97, 148, 110, 123, 85, 162, 131];

    // Rates per million tokens are also microdollars per token.
    const usage = days.flatMap((day, dayIndex) => models.flatMap((model, modelIndex) =>
      users.map((user, userIndex) => {
        const requests = Math.round(load[dayIndex] * (4 - userIndex) / (modelIndex + 1) + (dayIndex * 13 + userIndex * 11 + modelIndex * 7) % 41);
        const failures = Math.floor(requests / (66 + userIndex * 8)) + (dayIndex === 12 ? modelIndex * 7 : 0);
        const completed = requests - failures;
        const input = completed * (480 + (dayIndex * 91 + userIndex * 103) % 990 + modelIndex * 320);
        const cached = Math.floor(input * (20 + (dayIndex * 5 + userIndex * 7) % 31) / 100);
        const output = completed * (126 + (dayIndex * 33 + userIndex * 63) % 310 + modelIndex * 95);
        const cost = (input - cached) * model.rates.input + cached * model.rates.cached + output * model.rates.output;
        return {day, model: model.id, user, requests, failures, input, cached, output, cost};
      })
    ));
    const fields = ['requests', 'failures', 'input', 'cached', 'output', 'cost'];
    function summarize(rows) {
      const totals = {requests: 0, failures: 0, input: 0, cached: 0, output: 0, cost: 0};
      for (const row of rows) {
        for (const key of fields) totals[key] += row[key];
      }
      return totals;
    }
    const money = microdollars => usd.format(microdollars / 1e6);
    const set = (id, value) => { get(id).textContent = value; };
    function row(label, values) {
      const element = document.createElement('tr');
      const title = document.createElement('th');
      title.scope = 'row';
      title.textContent = label;
      element.append(title);
      for (const value of values) {
        const cell = element.insertCell();
        cell.className = 'template-number';
        cell.textContent = value;
      }
      return element;
    }

    const period = get('period');
    if (!period) return;
    const modelSelect = get('model');
    function render() {
      const activeDays = days.slice(-Number(period.value));
      const activeModels = models.filter(model => modelSelect.value === 'all' || model.id === modelSelect.value);
      const data = usage.filter(entry =>
        activeDays.includes(entry.day) && (modelSelect.value === 'all' || entry.model === modelSelect.value));
      const totals = summarize(data);
      set('tokens', counts.format(totals.input + totals.output));
      set('cost', money(totals.cost));
      set('requests', counts.format(totals.requests));
      set('cache', percent.format(totals.cached / totals.input));
      set('errors', percent.format(totals.failures / totals.requests));

      const daily = activeDays.map(day => summarize(data.filter(entry => entry.day === day)));
      KavUI.chart(get('token-chart'), {
        type: 'line', label: 'トークン消費の推移', unit: 'トークン', labels: activeDays,
        series: [
          {name: '通常入力', values: daily.map(day => day.input - day.cached)},
          {name: 'キャッシュ入力', values: daily.map(day => day.cached)},
          {name: '出力', values: daily.map(day => day.output)}
        ]
      });
      KavUI.chart(get('cost-chart'), {
        type: 'bar', label: 'モデル別の推定料金', unit: 'USD', labels: activeDays,
        series: activeModels.map(model => ({
          name: model.name,
          values: activeDays.map(day =>
            summarize(data.filter(entry => entry.day === day && entry.model === model.id)).cost / 1e6)
        }))
      });

      const byUser = users.map(user => ({user, ...summarize(data.filter(entry => entry.user === user))}));
      byUser.sort((a, b) => b.cost - a.cost);
      get('users').replaceChildren(...byUser.map(entry => row(entry.user, [
        counts.format(entry.requests), counts.format(entry.input), counts.format(entry.cached),
        counts.format(entry.output), money(entry.cost)
      ])));
    }

    get('prices').replaceChildren(...models.map(model => row(model.name,
      [model.rates.input, model.rates.cached, model.rates.output].map(value => usd.format(value)))));
    period.addEventListener('change', render);
    modelSelect.addEventListener('change', render);
    render();
  };
  if (window.KavDocsPage) window.KavDocsPage.register(initialize);
  else initialize();
})();
