import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthRepository } from './auth.repository.js';
import type { LoginInput, RegisterInput, AuthUserOutput } from './dto/auth.dto.js';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyTakenError extends Error {
  constructor(public readonly email: string) {
    super(`Email '${email}' is already registered.`);
    this.name = 'EmailAlreadyTakenError';
  }
}

// A valid argon2id hash that doesn't correspond to any real password - used
// so that logging in with an unknown email still pays the same argon2.verify
// cost as a real user, rather than short-circuiting and leaking via timing
// whether an email is registered.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$nLTxinLslvuuggseiIbVdw$jNAObRq+JOTk+paEBRXs11IzPVkpYGKa1W5XDhpNfFQ';

export interface AuthResult {
  user: AuthUserOutput;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private isAdminEmail(email: string): boolean {
    const admins = (this.configService.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return admins.includes(email.toLowerCase());
  }

  private sign(user: AuthUserOutput): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await this.authRepository.findByEmail(data.email);

    const passwordValid = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      data.password,
    );

    if (!user || !passwordValid) {
      throw new InvalidCredentialsError();
    }

    const authUser: AuthUserOutput = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return { user: authUser, token: this.sign(authUser) };
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const passwordHash = await argon2.hash(data.password);
    const isAdmin = this.isAdminEmail(data.email);

    const user = await this.authRepository.create(
      { email: data.email, passwordHash, isAdmin },
      {
        onEmailTaken: () => {
          throw new EmailAlreadyTakenError(data.email);
        },
      },
    );

    const authUser: AuthUserOutput = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return { user: authUser, token: this.sign(authUser) };
  }
}
