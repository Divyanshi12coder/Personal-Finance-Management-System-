import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        currency: this.config.get<string>('DEFAULT_CURRENCY') ?? 'INR',
      },
    });

    return this.issueTokens(user.id, user.email, user.name, user.currency);
  }

  async login(dto: LoginDto): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });

    return this.issueTokens(user.id, user.email, user.name, user.currency);
  }

  /**
   * Refresh token rotation: the presented token is validated against its
   * hashed record, immediately revoked, and a brand-new pair is issued.
   * This means a stolen refresh token is only usable once before the
   * legitimate client's next refresh invalidates it — a standard
   * mitigation against refresh-token replay.
   */
  async refresh(rawToken: string): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!record) throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired.' });

    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });

    return this.issueTokens(record.user.id, record.user.email, record.user.name, record.user.currency);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    name: string,
    currency: string,
  ): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
      },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const expiresAt = new Date(Date.now() + this.parseDurationMs(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.hashToken(refreshToken), expiresAt },
    });

    return {
      auth: { accessToken, user: { id: userId, email, name, currency } },
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDurationMs(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const value = Number(match[1]);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]] as number;
    return value * unitMs;
  }
}
