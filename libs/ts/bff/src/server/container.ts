import { createDb, type Db } from '@learn-english/db';
import type { Logger, Project } from '@learn-english/logging';
import { createLogger } from '@learn-english/logging/server';
import {
  asFunction,
  asValue,
  type AwilixContainer,
  createContainer,
  InjectionMode,
  type NameAndRegistrationPair,
} from 'awilix';
import type { BaseServerEnv } from './env.js';

export interface BaseCradle<Env extends BaseServerEnv = BaseServerEnv> {
  config: Env;
  logger: Logger;
  db: Db;
}

export function createBffContainer<C extends BaseCradle>(): AwilixContainer<C> {
  return createContainer<C>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });
}

export function createBaseBffRegistrations<Env extends BaseServerEnv>(
  config: Env,
  project: Project,
): NameAndRegistrationPair<BaseCradle<Env>> {
  const { db, client } = createDb({
    connectionString: config.DATABASE_URL,
    ssl: config.DATABASE_SSL,
    max: config.DATABASE_POOL_MAX,
  });

  return {
    config: asValue(config),
    logger: asFunction(() =>
      createLogger({
        level: config.LOG_LEVEL,
        project,
        environment: config.SERVICE_ENVIRONMENT,
      }),
    ).singleton(),
    db: asFunction(() => db)
      .singleton()
      .disposer(() => client.end()),
  };
}
