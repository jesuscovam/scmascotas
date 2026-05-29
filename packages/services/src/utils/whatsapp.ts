export type WhatsappLocation = { lat: number; lng: number };

/**
 * Build a `wa.me` deep-link with an optional pre-filled message and an
 * optional Google Maps location line. Centralising this avoids drift
 * between the half-dozen places that hand-craft `https://wa.me/...` URLs.
 *
 * Location formatting matches `googleMapsUrl` from ./location.ts so the
 * recipient lands at the same spot whether they tap WhatsApp or the
 * "Cómo llegar" button.
 */
export function whatsappUrl(
  phone: string,
  message?: string,
  location?: WhatsappLocation
): string {
  const num = phone.replace(/\D/g, '');
  const lines: string[] = [];
  if (message) lines.push(message);
  if (location) {
    lines.push(
      `📍 https://www.google.com/maps?q=${location.lat.toFixed(6)},${location.lng.toFixed(6)}`
    );
  }
  const text = lines.join('\n');
  return text ? `https://wa.me/${num}?text=${encodeURIComponent(text)}` : `https://wa.me/${num}`;
}
