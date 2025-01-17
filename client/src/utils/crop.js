export const cropText = (value, size) => {
  if (typeof value !== 'string') return value;
  return value.length > size ? value.substring(0, size) + '...' : value;
}