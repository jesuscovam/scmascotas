import { createAuthClient } from 'better-auth/svelte';
import { passkeyClient } from '@better-auth/passkey/client';
import { apiKeyClient } from '@better-auth/api-key/client';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [passkeyClient(), apiKeyClient(), adminClient()]
});

export const { signIn, signOut, signUp, useSession } = authClient;
