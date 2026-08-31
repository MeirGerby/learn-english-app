import { Module, Global, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getDatabaseConnection,
  type Database,
  type DatabasePool,
} from '@learn-english/db';

export const DRIZZLE = Symbol('DRIZZLE_CLIENT');
export const DRIZZLE_POOL = Symbol('DRIZZLE_POOL');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DatabasePool => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        const connection = getDatabaseConnection(connectionString);
        return connection.pool;
      },
    },
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Database => {
        const connectionString = configService.getOrThrow('DATABASE_URL');
        const { db } = getDatabaseConnection(connectionString);
        return db;
      },
    },
  ],
  exports: [DRIZZLE, DRIZZLE_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(DRIZZLE_POOL) private readonly pool: DatabasePool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
