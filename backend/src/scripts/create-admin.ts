import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'talkskunal@gmail.com';
    const name = 'Kunal Admin';
    const password = 'Admin@123'; // You can change this password

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email,
        status: { equals: USER_STATUS.Active }
      },
    });

    if (existingUser) {
      console.log('User already exists with email:', email);
      return;
    }

    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.error('Admin role not found. Please run the seed script first.');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        role_id: adminRole.id,
      },
      include: {
        role: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role.name);
    console.log('Password:', password);
    console.log('User ID:', adminUser.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
