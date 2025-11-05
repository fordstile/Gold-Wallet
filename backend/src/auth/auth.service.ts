import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const password = dto.password;
    const passwordConfirm = dto.passwordConfirm;

    // Check password confirmation
    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    // Hash password with cost factor of 12 for better security
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await this.prisma.user.create({ 
      data: { 
        id: randomUUID(), 
        email, 
        passwordHash 
      } 
    });

    const token = await this.signToken(user.id, user.email, user.isAdmin || false);
    return { ok: true, user: { id: user.id, email: user.email, isAdmin: user.isAdmin || false }, token };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const password = dto.password;
    
    // Find user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // Verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.signToken(user.id, user.email, user.isAdmin || false);
    return { ok: true, user: { id: user.id, email: user.email, isAdmin: user.isAdmin || false }, token };
  }

  private async signToken(id: string, email: string, isAdmin: boolean = false) {
    return this.jwtService.signAsync({ sub: id, email, isAdmin });
  }
}
