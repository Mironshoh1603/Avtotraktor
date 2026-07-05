import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Username mavjudligini tekshirish
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('Bu username allaqachon mavjud');
    }

    // Parolni hash qilish
    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    
    // Parolni response dan olib tashlash
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'role', 'status', 'created_at', 'updated_at'],
      order: { id: 'ASC' }
    });
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'status', 'created_at', 'updated_at']
    });

    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username }
      });
      if (existingUser) {
        throw new ConflictException('Bu username allaqachon mavjud');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.findOne(id);
    const newStatus = user.status === 1 ? 0 : 1;
    await this.userRepository.update(id, { status: newStatus });
    return this.findOne(id);
  }
}