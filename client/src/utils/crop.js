export const cropText = (value, size) => {
  if (typeof value !== 'string') return value;
  const strippedValue = stripHtmlTags(value);
  return strippedValue.length > size ? strippedValue.substring(0, size) + '...' : strippedValue;
}
export const stripHtmlTags = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};