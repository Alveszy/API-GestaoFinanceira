import { ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwt: JwtService) {}
  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL?.toLowerCase(); const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;
    if (password.length < 12) throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');
    if (!(await this.users.findOneBy({ email }))) await this.users.save(this.users.create({ name: 'Administrador', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' }));
  }
  async register(dto: RegisterDto) {
    if (await this.users.findOneBy({ email: dto.email.toLowerCase() })) throw new ConflictException('E-mail já cadastrado.');
    const user = await this.users.save(this.users.create({ name: dto.name, email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 12), role: 'cliente' }));
    return this.tokens(user);
  }
  async login(email: string, password: string) {
    const user = await this.users.createQueryBuilder('user').addSelect('user.passwordHash').where('user.email = :email', { email: email.toLowerCase() }).getOne();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('E-mail ou senha inválidos.');
    return this.tokens(user);
  }
  async listUsers() { return this.users.find({ select: { id: true, name: true, email: true, role: true, createdAt: true }, order: { createdAt: 'DESC' } }); }
  private async tokens(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { accessToken, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '15m', user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
