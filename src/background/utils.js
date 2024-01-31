/**
 * Generates a SHA256 hash from a given string.
 *
 * @param {string} body
 * @returns {Promise<string>}
 */
export async function sha256sum(body) {
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Build an HTTPS URL using the given domain and port.
 *
 * @param {string} domain
 * @param {number} port
 * @return {string}
 */
export function buildSecureUrl(domain, port) {
  const portString = (port === 443) ? '' : `:${port}`;
  return `https://${domain}${portString}`;
}

/**
 * Check if the blob starts and ends with the respective signature and tail
 * bytes. This is for checking if file signature or magic numbers match a
 * desires file format.
 *
 * @param {Blob} blob
 * @param {?number[] | undefined} signatureBytes
 * @param {?number[] | undefined} tailBytes
 * @returns {Promise<boolean>}
 */
export async function doSignaturesMatch(blob, signatureBytes, tailBytes) {
  if (signatureBytes) {
    const blobStart = await blob.slice(0, signatureBytes.length)
      .stream()
      .getReader()
      .read();

    if (!blobStart.value) {
      return false;
    }

    for (let i = 0; i < blobStart.value.length; i++) {
      if (blobStart.value[i] !== signatureBytes[i]) {
        return false;
      }
    }
  }

  if (tailBytes) {
    const blobEnd = await blob.slice(blob.size - tailBytes.length)
      .stream()
      .getReader()
      .read();

    if (!blobEnd.value) {
      return false;
    }

    for (let i = 0; i < blobEnd.value.length; i++) {
      if (blobEnd.value[i] !== tailBytes[i]) {
        return false;
      }
    }
  }

  return true;
}
