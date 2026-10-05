import dns from 'dns';
dns.setServers(['8.8.8.8','8.8.4.4']);
import { createClerkClient } from '@clerk/backend';

const client = createClerkClient({
  secretKey: 'sk_test_2gL9fGRPEFvwX09mcqtyWa9ItbE9Tftrk8IFBOIb9r',
  publishableKey: 'pk_test_aG9uZXN0LWFtb2ViYS0yMzA5LmNsZXJrLmFjY291bnRzLmRldiQ',
});

const SESSION_ID = 'sess_3KHN9UWWvvbd4Ehu0mcMap1MkME';

try {
  const result = await client.sessions.getToken(SESSION_ID);
  const jwt = result.jwt;
  const fs = await import('fs');
  fs.writeFileSync('test-session.token', jwt);
  console.log('JWT saved (length:', jwt.length, ')');
} catch (e) {
  console.error('FAILED:', e.clerkError?.code, e.errors?.[0]?.message);
  if (e.errors?.[0]) console.error(JSON.stringify(e.errors?.[0], null, 2));
  throw e;
}
