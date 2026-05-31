import { describe, it, expect } from 'vitest';
import { decideNotification, NOTIFY_THRESHOLD } from './notifications/decide.js';
import { EmailChannel, WhatsappChannel } from './notifications/channels.js';

describe('decideNotification', () => {
	it('sends a match alert when the score clears the threshold (any level ≠ off)', () => {
		expect(decideNotification({ score: NOTIFY_THRESHOLD, notifyLevel: 'matches', sameColonia: false })).toBe('match');
		expect(decideNotification({ score: 80, notifyLevel: 'colonia', sameColonia: false })).toBe('match');
	});

	it('does not send a match alert just below the threshold on matches level', () => {
		expect(decideNotification({ score: NOTIFY_THRESHOLD - 1, notifyLevel: 'matches', sameColonia: true })).toBeNull();
	});

	it('sends a colonia_activity alert for same-colonia sightings under threshold on colonia level', () => {
		expect(decideNotification({ score: 35, notifyLevel: 'colonia', sameColonia: true })).toBe('colonia_activity');
	});

	it('does not send colonia_activity for a different colonia', () => {
		expect(decideNotification({ score: 35, notifyLevel: 'colonia', sameColonia: false })).toBeNull();
	});

	it('never sends anything when alerts are off, even for a strong match', () => {
		expect(decideNotification({ score: 100, notifyLevel: 'off', sameColonia: true })).toBeNull();
	});

	it('matches level ignores same-colonia activity below threshold', () => {
		expect(decideNotification({ score: 40, notifyLevel: 'matches', sameColonia: true })).toBeNull();
	});
});

describe('EmailChannel.isEnabled', () => {
	const recipient = { userId: 'u1', email: 'a@b.com', emailVerified: true, name: null };
	const prefs = { channelEmail: true, channelWhatsapp: false, unsubscribeToken: 't' };

	it('enabled when opted-in and email verified', () => {
		expect(EmailChannel.isEnabled(prefs, recipient)).toBe(true);
	});

	it('disabled when email turned off', () => {
		expect(EmailChannel.isEnabled({ ...prefs, channelEmail: false }, recipient)).toBe(false);
	});

	it('disabled when email not verified', () => {
		expect(EmailChannel.isEnabled(prefs, { ...recipient, emailVerified: false })).toBe(false);
	});
});

describe('WhatsappChannel (cost-gated seam)', () => {
	const recipient = { userId: 'u1', email: 'a@b.com', emailVerified: true, name: null };

	it('stays disabled while the server flag is unset, even if the user opted in', () => {
		// NOTIFY_WHATSAPP_ENABLED is not 'true' in the test env.
		expect(WhatsappChannel.isEnabled({ channelEmail: true, channelWhatsapp: true, unsubscribeToken: 't' }, recipient)).toBe(false);
	});

	it('send() never throws (no-op stub)', async () => {
		await expect(
			WhatsappChannel.send(recipient, { channelEmail: true, channelWhatsapp: true, unsubscribeToken: 't' }, {
				type: 'match',
				title: 't',
				body: 'b',
			}),
		).resolves.toBeUndefined();
	});
});
