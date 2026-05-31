// Pure notification-decision logic — intentionally free of any @scmascotas/db
// import so it can be unit-tested without a database connection (the project
// tests scoring/decision logic this way; see matching/score.test.ts).

// Owner-alert threshold. Higher than the display threshold (30 in matches.ts)
// so we only proactively ping owners on high-confidence structured matches.
// Aligns with PLAN.md §11.2 ("≥60: notify owner").
export const NOTIFY_THRESHOLD = 60;

/**
 * Given a structured match score, the pet's chosen aggressiveness, and whether
 * the sighting is in the same colonia, decide what (if anything) to send.
 */
export function decideNotification(opts: {
	score: number;
	notifyLevel: 'off' | 'matches' | 'colonia';
	sameColonia: boolean;
}): 'match' | 'colonia_activity' | null {
	if (opts.notifyLevel === 'off') return null;
	if (opts.score >= NOTIFY_THRESHOLD) return 'match';
	if (opts.notifyLevel === 'colonia' && opts.sameColonia) return 'colonia_activity';
	return null;
}
