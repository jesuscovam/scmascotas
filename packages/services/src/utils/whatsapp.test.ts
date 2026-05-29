import { describe, it, expect } from 'vitest';
import { whatsappUrl } from './whatsapp.js';

describe('whatsappUrl', () => {
  it('strips non-digits from the phone number', () => {
    expect(whatsappUrl('+52 (967) 123-4567')).toBe('https://wa.me/529671234567');
  });

  it('encodes a message into the text query param', () => {
    const url = whatsappUrl('+52 967 123 4567', 'Hola — creo que vi a tu perrito');
    expect(url).toMatch(/^https:\/\/wa\.me\/529671234567\?text=/);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(
      'Hola — creo que vi a tu perrito'
    );
  });

  it('appends a Google Maps line when location is provided', () => {
    const url = whatsappUrl('+52 967 123 4567', 'Hola', { lat: 16.737, lng: -92.6376 });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('Hola');
    expect(decoded).toContain('📍 https://www.google.com/maps?q=16.737000,-92.637600');
    expect(decoded.split('\n')).toHaveLength(2);
  });

  it('emits just the maps line if no message is given', () => {
    const url = whatsappUrl('5219671234567', undefined, { lat: 16.737, lng: -92.6376 });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toBe('📍 https://www.google.com/maps?q=16.737000,-92.637600');
  });

  it('produces a bare wa.me URL when neither message nor location is given', () => {
    expect(whatsappUrl('+529671234567')).toBe('https://wa.me/529671234567');
  });
});
