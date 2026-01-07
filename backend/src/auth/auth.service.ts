/**
 * Auth Service
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/User.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.last_login_at = new Date();
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress?: string) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (ipAddress) {
      user.last_login_ip = ipAddress;
      await this.userRepository.save(user);
    }

    const payload = {
      username: user.username,
      sub: user.id,
      branch_id: user.branch_id,
      roles: user.roles?.map((role) => role.name) || [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        branch_id: user.branch_id,
        roles: user.roles?.map((role) => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions?.map((p) => p.key) || [],
        })) || [],
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });

    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password_hash,
    });

    const savedUser = await this.userRepository.save(user);
    const { password_hash: _, ...result } = savedUser;

    return result;
  }
}

