import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

type Action = 'create_pet' | 'upload_photo' | 'contact' | 'create_sighting' | 'create_spotted_pet';

const LIMITS: Record<Action, number> = {
	create_pet: 5,
	upload_photo: 15,
	contact: 3,
	create_sighting: 20,
	create_spotted_pet: 5
};

let limiters: Record<Action, Ratelimit> | null = null;

function getLimiters() {
	if (!limiters) {
		const redis = Redis.fromEnv();
		limiters = {
			create_pet: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(LIMITS.create_pet, '24 h'),
				prefix: 'rl:create_pet'
			}),
			upload_photo: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(LIMITS.upload_photo, '24 h'),
				prefix: 'rl:upload_photo'
			}),
			contact: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(LIMITS.contact, '24 h'),
				prefix: 'rl:contact'
			}),
			create_sighting: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(LIMITS.create_sighting, '24 h'),
				prefix: 'rl:create_sighting'
			}),
			create_spotted_pet: new Ratelimit({
				redis,
				limiter: Ratelimit.slidingWindow(LIMITS.create_spotted_pet, '24 h'),
				prefix: 'rl:create_spotted_pet'
			})
		};
	}
	return limiters;
}

export async function checkLimit(action: Action, ipHash: string | undefined): Promise<boolean> {
	if (env.VERCEL_ENV !== 'production' || !ipHash) return true;
	const { success } = await getLimiters()[action].limit(ipHash);
	return success;
}
