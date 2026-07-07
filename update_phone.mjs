import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.setting.findMany();
  for (const setting of settings) {
    if (setting.key === 'whatsapp_number' && setting.value === '2914658502') {
      await prisma.setting.update({
        where: { id: setting.id },
        data: { value: '2915658321' }
      });
      console.log('Updated whatsapp_number from 2914658502 to 2915658321');
      return;
    }
  }
  
  // If not found exactly as 2914658502, we just try to update whatever the existing number is, or create it
  const existing = await prisma.setting.findUnique({ where: { key: 'whatsapp_number' } });
  if (existing) {
    await prisma.setting.update({
      where: { key: 'whatsapp_number' },
      data: { value: '2915658321' }
    });
    console.log('Updated existing whatsapp_number to 2915658321. Old value was:', existing.value);
  } else {
    await prisma.setting.create({
      data: { key: 'whatsapp_number', value: '2915658321' }
    });
    console.log('Created whatsapp_number setting with 2915658321');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
