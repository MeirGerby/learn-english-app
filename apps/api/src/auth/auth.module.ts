import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthRouter } from './auth.router.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { EmailService } from './email.service.js';
import { AppContext } from './trpc-context.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '30d') as `${number}${'d' | 'h' | 'm'}`,
        },
      }),
    }),
  ],
  providers: [AuthRouter, AuthService, AuthRepository, EmailService, AppContext],
  exports: [JwtModule],
})
export class AuthModule {}
