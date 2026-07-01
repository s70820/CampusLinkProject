export function buildDownloadUrl(url) {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}download=1`;
}

export async function downloadFileFromUrl(url, filename = 'download') {
  if (!url) return;

  const downloadUrl = buildDownloadUrl(url);
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.location.assign(downloadUrl);
  }
}
