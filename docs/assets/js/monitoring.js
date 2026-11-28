/* Fixed telemetry for the service monitoring templates. */
(function () {
  const initialize = () => {
    'use strict';
    const get = id => document.getElementById('monitor-' + id);
    const range = get('range');
    if (!range) return;
    const service = get('service');
    const logsPage = Boolean(get('log-rows'));
    const levels = ['ERROR', 'WARN', 'INFO'];
    const number = new Intl.NumberFormat('ja-JP');
    const labels = ['13:30', '13:35', '13:40', '13:45', '13:50', '13:55',
      '14:00', '14:05', '14:10', '14:15', '14:20', '14:25'];

    // Each position represents one five-minute interval. Latencies are precomputed p95s.
    const telemetry = {
      gateway: {
        requests: [842, 910, 864, 956, 884, 1043, 1021, 1129, 1240, 1316, 1141, 1057],
        failures: [2, 3, 1, 4, 2, 3, 2, 4, 10, 68, 9, 4],
        latency: [152, 165, 148, 177, 165, 172, 184, 197, 286, 742, 261, 179]
      },
      worker: {
        requests: [294, 320, 348, 312, 381, 346, 342, 364, 457, 492, 391, 362],
        failures: [1, 0, 2, 2, 1, 2, 1, 2, 8, 21, 4, 1],
        latency: [231, 226, 248, 238, 259, 252, 270, 263, 419, 581, 343, 260]
      }
    };
    const services = Object.keys(telemetry);
    const messages = {
      gateway: {
        ERROR: '上流サービスへの接続がタイムアウトしました',
        WARN: '上流サービスの応答時間が閾値を超えました',
        INFO: 'カタログAPIのリクエストが完了しました'
      },
      worker: {
        ERROR: 'ジョブの実行中にキューとの接続が切断されました',
        WARN: 'キューの待機時間が閾値を超えました',
        INFO: 'インデックス更新ジョブが完了しました'
      }
    };
    const events = labels.flatMap((label, bucket) => services.flatMap(name => {
      const count = bucket === 9 ? {ERROR: 7, WARN: 4, INFO: 3} :
        {ERROR: bucket === 8 || bucket === 10 ? 1 : 0, WARN: bucket % 3 === 0 ? 1 : 0, INFO: 2 + bucket % 3};
      let offset = 0;
      return levels.flatMap(level => Array.from({length: count[level]}, () => {
        const sequence = ++offset;
        const seconds = String(sequence * 3 + services.indexOf(name)).padStart(2, '0');
        return {bucket, name, level, time: label + ':' + seconds,
          message: messages[name][level], id: name.slice(0, 2) + '-' + (1000 + bucket * 20 + sequence)};
      }));
    })).sort((a, b) => b.time.localeCompare(a.time));

    const put = (id, value) => { get(id).textContent = value; };
    const sum = values => values.reduce((total, value) => total + value, 0);
    const start = () => labels.length - Number(range.value) / 5;
    const selected = () => service.value === 'all' ? services : [service.value];
    const chart = (key, type, label, unit, series) => {
      KavUI.chart(get(key + '-chart'), {type, label, unit, labels: labels.slice(start()), series});
    };

    function renderMetrics() {
      const names = selected();
      const series = (key, value) => names.map(name => ({
        name, values: telemetry[name][key].slice(start()).map((point, index) => value(point, name, start() + index))
      }));
      const identity = value => value;
      const requests = series('requests', identity);
      const total = sum(requests.flatMap(item => item.values));
      const failures = sum(names.flatMap(name => telemetry[name].failures.slice(start())));
      const rates = series('failures', (value, name, index) =>
        Number((100 * value / telemetry[name].requests[index]).toFixed(2)));
      const latency = series('latency', identity);
      put('requests', number.format(total));
      put('error-rate', (100 * failures / total).toFixed(2) + '%');
      put('latency', number.format(Math.max(...latency.flatMap(item => item.values))) + ' ms');
      chart('requests', 'area', 'リクエスト数', '件', requests);
      chart('error-rate', 'line', 'エラー率', '%', rates);
      chart('latency', 'line', 'p95 応答時間', 'ms', latency);
    }

    const logLevel = get('level');
    const query = get('query');
    const normalize = value => value.normalize('NFKC').toLowerCase();
    const matchingEvents = () => events.filter(event => event.bucket >= start() && selected().includes(event.name));
    const badgeStyles = {ERROR: 'text-bg-danger', WARN: 'text-bg-warning', INFO: 'text-bg-secondary'};

    function renderLogRows() {
      const term = normalize(query.value.trim());
      const filtered = matchingEvents().filter(event =>
        (logLevel.value === 'all' || event.level === logLevel.value) &&
        normalize(event.message + ' ' + event.id).includes(term));
      const rows = filtered.map(event => {
        const row = document.createElement('tr');
        row.insertCell().textContent = event.time;
        const badge = document.createElement('span');
        badge.className = 'badge ' + badgeStyles[event.level];
        badge.textContent = event.level;
        row.insertCell().append(badge);
        row.insertCell().textContent = event.name;
        row.insertCell().textContent = event.message;
        row.insertCell().textContent = event.id;
        return row;
      });
      get('log-rows').replaceChildren(...rows);
      get('log-table').hidden = rows.length === 0;
      get('empty').hidden = rows.length > 0;
      put('result', number.format(rows.length) + '件のイベント');
    }

    function renderLogs() {
      const source = matchingEvents();
      const counts = levels.map(name => {
        const values = labels.slice(start()).map(() => 0);
        for (const event of source) {
          if (event.level === name) values[event.bucket - start()]++;
        }
        put(name.toLowerCase(), number.format(sum(values)));
        return {name, values};
      });
      put('total', number.format(source.length));
      chart('logs', 'bar', 'レベル別ログ件数', '件', counts);
      renderLogRows();
    }

    if (logsPage) {
      logLevel.addEventListener('change', renderLogRows);
      query.addEventListener('input', renderLogRows);
      get('clear').addEventListener('click', () => {
        logLevel.value = 'all';
        query.value = '';
        renderLogRows();
        query.focus();
      });
    }
    const render = logsPage ? renderLogs : renderMetrics;
    range.addEventListener('change', render);
    service.addEventListener('change', render);
    render();
  };
  if (window.KavDocsPage) window.KavDocsPage.register(initialize);
  else initialize();
})();
