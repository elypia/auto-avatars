/**
 * @typedef {Object} ParsedDnsName
 * @property {string} name
 * @property {number} loc
 */

/** Bytes for the header field in DNS-over-HTTPS queries. */
const DNS_HEADER_BYTES = [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0];

/** Bytes for "_avatars-sec._tcp" pre-encoded for DNS-over-HTTPS queries. */
const SRV_SUBDOMAIN_BYTES = [12, 95, 97, 118, 97, 116, 97, 114, 115, 45, 115, 101, 99, 4, 95, 116, 99, 112];

/**
 * Type code for SRV records.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc2782
 * @see https://wikipedia.org/wiki/List_of_DNS_record_types
 */
const SRV_RECORD_ID = 33;

/**
 * Short lived cache to store DNS responses. This won't persist for long, but
 * will help in cases where the queries are just seconds part.
 *
 * @type {Map<string, [number, object]>}
 */
const dnsCache = new Map();

const textDecoder = new TextDecoder();

/**
 * Uses DNS-over-HTTPS (DoH) to query for a Libravatar SRV record using DNS
 * Wireformat. Doesn't use `messenger.dns` as that only supports A and TXT records.
 *
 * @param {string} domain
 * @param {string} dohServer
 */
export async function queryAvatarService(domain, dohServer) {
  const cached = dnsCache.get(domain);

  if (cached) {
    const [ timestamp, record ] = cached;

    if (timestamp + record.record.ttl * 1000 > Date.now()) {
      return record;
    }
  }

  const messageBytes = [
    ...DNS_HEADER_BYTES,
    ...SRV_SUBDOMAIN_BYTES
  ]
  domain.split('.').forEach((val) => {
    messageBytes.push(val.length);
    val.split('').forEach((c) => {
      messageBytes.push(c.charCodeAt(0));
    });
  });
  messageBytes.push(0, 0, SRV_RECORD_ID, 0, 1);

  const messageString = messageBytes.map((b) => String.fromCharCode(b)).join('');
  let messageBase64 = btoa(messageString);
  while (messageBase64.endsWith('=')) {
    messageBase64 = messageBase64.slice(0, -1);
  }

  const resp = await fetch(
    `https://${dohServer}/dns-query?dns=${messageBase64}`,
    {
      headers: {
        accept: 'application/dns-message'
      }
    }
  );

  const blob = await resp.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const record = await decode(bytes);

  if (record.record) {
    dnsCache.set(domain, [Date.now(), record]);
  }

  return record;
}

/**
 * Decodes the response from an SRV DNS query.
 *
 * @param {Uint8Array} bytes
 * @see https://datatracker.ietf.org/doc/html/rfc1035#section-4.1.3
 */
export async function decode(bytes) {
  const header = {
    id: parseBytesToNumber(bytes, 0, 2),
    flags: parseBytesToNumber(bytes, 2, 2),
    questionCount: parseBytesToNumber(bytes, 4, 2),
    answerCount: parseBytesToNumber(bytes, 6, 2),
    authoritiesCount: parseBytesToNumber(bytes, 8, 2),
    additionalsCount: parseBytesToNumber(bytes, 10, 2),
  }

  const nameMemo = new Map();
  const { name: qName, loc: qLoc } = parseName(bytes, 12, nameMemo);

  let i = qLoc;
  const question = {
    name: qName,
    type: parseBytesToNumber(bytes, i, 2),
    class: parseBytesToNumber(bytes, i + 2, 2)
  }
  i += 4;

  if (header.answerCount === 0) {
    return {
      header,
      question,
      data: null
    }
  }

  const { name: aName, loc: aLoc } = parseName(bytes, i, nameMemo);
  i = aLoc;
  const record = {
    name: aName,
    type: parseBytesToNumber(bytes, i, 2),
    class: parseBytesToNumber(bytes, i + 2, 2),
    ttl: parseBytesToNumber(bytes, i + 4, 4),
    dataLength: parseBytesToNumber(bytes, i + 8, 2),
  }
  i += 10;

  const data = {
    port: parseBytesToNumber(bytes, i + 4, 2),
    target: parseName(bytes, i + 6, nameMemo).name
  };

  return {
    header,
    question,
    record,
    data
  };
}

/**
 * @param {Uint8Array} bytes
 * @param {number} start
 * @param {number} length
 * @returns {number}
 */
export function parseBytesToNumber(bytes, start = 0, length = bytes.byteLength - start) {
  let result = 0;
  const end = start + length;

  for (let i = start; i < end; i++) {
    result = result * 256 + bytes[i];
  }

  return result;
};

/**
 * @param {Uint8Array} bytes
 * @param {number} i
 * @param {Map<number, string>} memo
 * @returns {ParsedDnsName} Decoded domain name with the index to continue parsing from.
 */
export function parseName(bytes, i, memo) {
  if (bytes[i] & 192) {
    const pointerBytes = new Uint8Array([bytes[i] & 63, bytes[i + 1]]);
    const pointer = parseBytesToNumber(pointerBytes);
    const name = memo.get(pointer);

    if (!name) {
      throw new Error('Malformed DNS record, backing off.');
    }

    return { name, loc: i + 2 };
  }

  const start = i;
  const domainSegments = [];

  while (bytes[i] !== 0) {
    const length = bytes[i++];
    const segmentBytes = bytes.slice(i, i + length);
    i += length;
    const segment = textDecoder.decode(segmentBytes);
    domainSegments.push(segment);
  }

  const name = domainSegments.join('.');
  memo.set(start, name);
  return { name, loc: i + 1 };
}
