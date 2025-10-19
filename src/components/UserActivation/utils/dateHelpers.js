export const formatDateTime = (value) => {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};