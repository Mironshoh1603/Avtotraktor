import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user allaqachon mavjud');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = userRepository.create({
      username: 'admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: 1
    });

    await userRepository.save(adminUser);
    console.log('✅ Admin user muvaffaqiyatli yaratildi!');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Admin user yaratishda xatolik:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

createAdminUser();