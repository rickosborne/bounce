import {expect} from 'chai';
import {describe, it} from 'mocha';

import {htmlEncode, jsEscapeString} from './HTML';

describe('HTML', () => {
  describe('htmlEncode', () => {
    it('handles null', () => expect(htmlEncode(null)).equals(''));
    it('handles undefined', () => expect(htmlEncode()).equals(''));
    it('handles ""', () => expect(htmlEncode('')).equals(''));
    it('encodes &', () => expect(htmlEncode('a&b&c')).equals('a&amp;b&amp;c'));
    it('encodes <', () => expect(htmlEncode('a<b<c')).equals('a&lt;b&lt;c'));
    it('encodes "', () => expect(htmlEncode('a>b>c')).equals('a&gt;b&gt;c'));
    it('encodes &', () => expect(htmlEncode('a"b"c')).equals('a&quot;b&quot;c'));
    it('encodes \'', () => expect(htmlEncode("a'b'c")).equals('a&apos;b&apos;c'));
    it('encodes =', () => expect(htmlEncode('a=b=c')).equals('a&equals;b&equals;c'));
    it('encodes multiples', () => expect(htmlEncode('a&b>c&&d<e')).equals('a&amp;b&gt;c&amp;&amp;d&lt;e'));
  });
  describe('jsEscapeString', () => {
    it('handles null', () => expect(jsEscapeString(null)).equals(''));
    it('handles undefined', () => expect(jsEscapeString()).equals(''));
    it('handles ""', () => expect(jsEscapeString('')).equals(''));
    it('escapes \'', () => expect(jsEscapeString('a\'b\'c')).equals('a\\\'b\\\'c'));
    it('escapes "', () => expect(jsEscapeString('a"b"c')).equals('a\\"b\\"c'));
    it('escapes `', () => expect(jsEscapeString('a`b`c')).equals('a\\`b\\`c'));
    it('escapes $', () => expect(jsEscapeString('a$b$c')).equals('a\\$b\\$c'));
    it('escapes NULL', () => expect(jsEscapeString('a\u0000b\u0000c')).equals('a\\0b\\0c'));
    it('escapes multiple', () => expect(jsEscapeString('a\nb${c}`d')).equals('a\nb\\${c}\\`d'));
  });
});
