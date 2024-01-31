import { describe, expect, test } from '@jest/globals';
import { decode, parseBytesToNumber, parseName } from '../../src/background/dns';

describe('convert byte array to unsigned integers', () => {

  test('can parse SRV type', () => {
    const bytes = new Uint8Array([0, 33]);
    expect(parseBytesToNumber(bytes)).toStrictEqual(33);
  });

  test('can parse DLV type (uses significant byte)', () => {
    const bytes = new Uint8Array([128, 1]);
    expect(parseBytesToNumber(bytes)).toStrictEqual(32769);
  });

  test('can parse class', () => {
    const bytes = new Uint8Array([0, 1]);
    expect(parseBytesToNumber(bytes)).toStrictEqual(1);
  });
});

describe('encode and decode dns responses', () => {

  test('can decode literal domain name', () => {
    const bytes = new Uint8Array([
      0, 0, 129, 128, 0, 1, 0, 1, 0, 0, 0, 0, 12, 95, 97, 118, 97, 116, 97, 114, 115, 45, 115, 101, 99, 4, 95, 116, 99, 112, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0, 0, 33, 0, 1, 192, 12, 0, 33, 0, 1, 0, 0, 14, 16, 0, 29, 0, 0, 0, 0, 1, 187, 6, 115, 101, 99, 99, 100, 110, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0
    ]);
    const memo = new Map();

    expect(parseName(bytes, 12, memo)).toStrictEqual({
      name: '_avatars-sec._tcp.libravatar.org',
      loc: 46
    });
  });

  test('can decode compressed domain name', () => {
    const bytes = new Uint8Array([
      0, 0, 129, 128, 0, 1, 0, 1, 0, 0, 0, 0, 12, 95, 97, 118, 97, 116, 97, 114, 115, 45, 115, 101, 99, 4, 95, 116, 99, 112, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0, 0, 33, 0, 1, 192, 12, 0, 33, 0, 1, 0, 0, 14, 16, 0, 29, 0, 0, 0, 0, 1, 187, 6, 115, 101, 99, 99, 100, 110, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0
    ]);
    const memo = new Map([[12, '_avatars-sec._tcp.libravatar.org']]);

    expect(parseName(bytes, 50, memo)).toStrictEqual({
      name: '_avatars-sec._tcp.libravatar.org',
      loc: 52
    });
  });

  test('can decode response with answer', async () => {
    const bytes = new Uint8Array([
      0, 0, 129, 128, 0, 1, 0, 1, 0, 0, 0, 0, 12, 95, 97, 118, 97, 116, 97, 114, 115, 45, 115, 101, 99, 4, 95, 116, 99, 112, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0, 0, 33, 0, 1, 192, 12, 0, 33, 0, 1, 0, 0, 14, 16, 0, 29, 0, 0, 0, 0, 1, 187, 6, 115, 101, 99, 99, 100, 110, 10, 108, 105, 98, 114, 97, 118, 97, 116, 97, 114, 3, 111, 114, 103, 0
    ]);

    const record = await decode(bytes);
    expect(record).toStrictEqual({
      header: {
        id: 0,
        flags: 33152,
        questionCount: 1,
        answerCount: 1,
        authoritiesCount: 0,
        additionalsCount: 0,
      },
      question: {
        name: '_avatars-sec._tcp.libravatar.org',
        type: 33,
        class: 1
      },
      record: {
        name: '_avatars-sec._tcp.libravatar.org',
        type: 33,
        class: 1,
        ttl: 3600,
        dataLength: 29
      },
      data: {
        port: 443,
        target: 'seccdn.libravatar.org'
      }
    })
  });

  test('handles decode response without answer', async () => {
    const bytes = new Uint8Array([
      0, 0, 129, 131, 0, 1, 0, 0, 0, 1, 0, 0, 12, 95, 97, 118, 97, 116, 97, 114, 115, 45, 115, 101, 99, 4, 95, 116, 99, 112, 10, 112, 114, 111, 116, 111, 110, 109, 97, 105, 108, 3, 99, 111, 109, 0, 0, 33, 0, 1, 192, 30, 0, 6, 0, 1, 0, 0, 4, 176, 0, 49, 3, 110, 115, 49, 192, 30, 7, 115, 117, 112, 112, 111, 114, 116, 10, 112, 114, 111, 116, 111, 110, 109, 97, 105, 108, 2, 99, 104, 0, 137, 195, 170, 14, 0, 0, 4, 176, 0, 0, 0, 144, 0, 27, 175, 128, 0, 0, 28, 32
    ]);

    const record = await decode(bytes);
    expect(record).toStrictEqual({
      header: {
        id: 0,
        flags: 33155,
        questionCount: 1,
        answerCount: 0,
        authoritiesCount: 1,
        additionalsCount: 0,
      },
      question: {
        name: '_avatars-sec._tcp.protonmail.com',
        type: 33,
        class: 1
      },
      data: null
    })
  });
});
