const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    const adminEmail = 'admin@librecielo.com'; // or whatever the admin is
    
    // Find admin user
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    if (users.length === 0) {
      console.log('No admin users found in the database.');
      // Maybe try to find the first user?
      const anyUser = await prisma.user.findFirst();
      if (!anyUser) {
        console.log('No users at all.');
        return;
      }
      console.log('Found a user, resetting their password instead:', anyUser.email);
      const newPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: anyUser.id },
        data: { password: newPassword, role: 'ADMIN' }
      });
      console.log('Password reset successfully to: admin123 for email:', anyUser.email);
      return;
    }

    const admin = users[0];
    const newPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: newPassword }
    });

    console.log('Password reset successfully to: admin123 for admin email:', admin.email);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
