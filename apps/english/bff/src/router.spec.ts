import { createBffApp, signAuthToken } from '@learn-english/bff';
import { createTRPCClient, httpLink, TRPCClientError } from '@trpc/client';
import { afterAll, describe, expect, it } from 'vitest';
import { createAppContainer } from './container.js';
import { materialsRoutes } from './materials/materials.routes.js';
import { type AppRouter, appRouter } from './router.js';

const container = createAppContainer();

const app = createBffApp({
  project: 'english-bff',
  container,
  router: appRouter,
  routes: materialsRoutes(container),
});

afterAll(() => container.dispose());

function clientWith(token?: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://bff.test/trpc',
        headers: token ? { authorization: `Bearer ${token}` } : {},
        // The tRPC link passes a URL string and a standard RequestInit.
        fetch: (input: string, init?: RequestInit) =>
          Promise.resolve(app.fetch(new Request(input, init))),
      }),
    ],
  });
}

function tokenFor(isAdmin: boolean) {
  return signAuthToken(
    'unit-test-secret',
    {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'student@example.com',
      isAdmin,
    },
    '1h',
  );
}

async function errorCode(call: Promise<unknown>) {
  try {
    await call;
  } catch (error) {
    if (error instanceof TRPCClientError) return error.data?.code;
  }

  return 'NO_ERROR';
}

describe('procedure guards', () => {
  it('rejects a signed-in procedure without a token', async () => {
    expect(await errorCode(clientWith().userStats.getStats.query())).toBe(
      'UNAUTHORIZED',
    );
  });

  it('rejects a token signed with another secret', async () => {
    const forged = signAuthToken(
      'other-secret',
      { id: 'x', email: 'x@example.com', isAdmin: true },
      '1h',
    );

    expect(await errorCode(clientWith(forged).feedback.list.query())).toBe(
      'UNAUTHORIZED',
    );
  });

  it('rejects an admin procedure for a student', async () => {
    expect(
      await errorCode(
        clientWith(tokenFor(false)).dashboard.listStudents.query(),
      ),
    ).toBe('FORBIDDEN');
  });

  it('validates the input before it reaches a service', async () => {
    expect(
      await errorCode(
        clientWith().auth.login.mutate({
          email: 'not-an-email',
          password: 'x',
        }),
      ),
    ).toBe('BAD_REQUEST');
  });
});

describe('material file route', () => {
  it('needs a valid token', async () => {
    const response = await app.fetch(
      new Request('http://bff.test/materials/some-id/file?token=bad'),
    );

    expect(response.status).toBe(401);
  });
});

describe('lesson guards', () => {
  it('keeps lesson progress behind sign-in', async () => {
    expect(await errorCode(clientWith().lessons.getProgress.query())).toBe(
      'UNAUTHORIZED',
    );
  });
});

describe('health', () => {
  it('answers without the database', async () => {
    const response = await app.fetch(new Request('http://bff.test/health'));

    expect(await response.text()).toBe('ok');
  });
});
