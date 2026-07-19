const DAY_MS = 24 * 60 * 60 * 1000;

const dateKey = (date) => date.toISOString().slice(0, 10);

/**
 * Buckets an array of { createdAt } rows into daily counts for the last 7 days,
 * plus a delta comparing this week's count to the prior 7-day window.
 */
const buildTrend = (rows, { days = 7, now = new Date() } = {}) => {
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    buckets.push({ date: dateKey(d), count: 0 });
  }
  const bucketIndex = new Map(buckets.map((b, i) => [b.date, i]));

  const windowStart = now.getTime() - days * DAY_MS;
  const priorWindowStart = now.getTime() - 2 * days * DAY_MS;

  let currentWindowCount = 0;
  let priorWindowCount = 0;

  for (const row of rows) {
    const t = row.createdAt.getTime();
    if (t >= windowStart) {
      currentWindowCount += 1;
      const idx = bucketIndex.get(dateKey(row.createdAt));
      if (idx !== undefined) buckets[idx].count += 1;
    } else if (t >= priorWindowStart) {
      priorWindowCount += 1;
    }
  }

  return { series: buckets, delta: currentWindowCount - priorWindowCount };
};

module.exports = { buildTrend, DAY_MS };
