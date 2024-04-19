/**
 * Download file to user's device.
 *
 * @param {Blob} blob Blob to be downloaded
 * @param {string} filename Name of the downloaded file
 */
export function downloadFile(blob: Blob, filename: string): void {
  // Create URL from the blob object
  const url: string = URL.createObjectURL(blob);
  // Create a temporary link element and append it to the document body
  const download: HTMLAnchorElement = document.createElement('a');
  download.href = url;
  download.download = filename;
  document.body.appendChild(download);
  // Trigger the download
  download.click();
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(download);
}
