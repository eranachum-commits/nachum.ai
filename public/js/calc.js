// Capacity / opportunity scenario maths. Shared by the browser and by tests.
export const LIMITS = { tasks: [1, 1000000], minutes: [0.5, 600], saved: [1, 80], rate: [0, 5000] };
export const DEFAULTS = { tasks: 400, minutes: 12, saved: 30, rate: '' };

export function validate(v) {
  const err = {};
  const num = (k) => (v[k] === '' || v[k] == null ? NaN : Number(v[k]));
  for (const k of ['tasks', 'minutes', 'saved']) {
    const n = num(k);
    if (!Number.isFinite(n) || n < LIMITS[k][0] || n > LIMITS[k][1]) err[k] = true;
  }
  if (v.rate !== '' && v.rate != null) {
    const n = Number(v.rate);
    if (!Number.isFinite(n) || n < LIMITS.rate[0] || n > LIMITS.rate[1]) err.rate = true;
  }
  return err;
}

export function compute(v) {
  if (Object.keys(validate(v)).length) return null;
  const tasks = Number(v.tasks), minutes = Number(v.minutes), s = Number(v.saved) / 100;
  const baseHours = (tasks * minutes) / 60;
  const freedHours = baseHours * s;
  const out = {
    baseHours,
    freedHours,
    workdays: freedHours / 8,
    // same hours, shorter task time => extra tasks the same team could absorb
    extraTasks: tasks * (s / (1 - s)),
    value: null,
  };
  if (v.rate !== '' && v.rate != null && Number(v.rate) > 0) out.value = freedHours * Number(v.rate);
  return out;
}
