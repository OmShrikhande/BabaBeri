export function resolveLiveUserCode(source, fallback = '') {
  if (!source) return String(fallback || '').trim();

  const candidates = [
    source.usercode,
    source.userCode,
    source.UserCode,
    source.code,
    source.hostId,
    fallback,
  ];

  for (const value of candidates) {
    const trimmed = String(value ?? '').trim();
    if (trimmed) return trimmed;
  }

  return '';
}

export function normalizeLiveFormRecord(data, fallbackCode = '') {
  if (!data || typeof data !== 'object') return data;

  const usercode = resolveLiveUserCode(data, fallbackCode);
  return {
    ...data,
    usercode,
  };
}

export function parseApiErrorMessage(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message.trim();
    }
    if (typeof parsed?.error === 'string' && parsed.error.trim()) {
      return parsed.error.trim();
    }
  } catch {
    const trimmed = String(raw).trim();
    if (trimmed && !trimmed.startsWith('{')) return trimmed;
  }
  return fallback;
}
