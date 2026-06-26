'use server';

import { PrismaClient } from '@prisma/client';

// Use a global variable to avoid multiple instances in development
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function saveAdSettings(data) {
  try {
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving ad settings:', error);
    return { success: false, error: 'Database connection error. Please ensure your MySQL database is configured in .env and running.' };
  }
}

export async function getAdSettings() {
  try {
    const headScript = await prisma.setting.findUnique({ where: { key: 'ad_head_script' } });
    const inArticleScript = await prisma.setting.findUnique({ where: { key: 'ad_in_article_script' } });
    const sidebarScript = await prisma.setting.findUnique({ where: { key: 'ad_sidebar_script' } });
    const sponsorMode = await prisma.setting.findUnique({ where: { key: 'sponsor_mode' } });
    const sponsorFixedId = await prisma.setting.findUnique({ where: { key: 'sponsor_fixed_id' } });
    const siteName = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    const siteDescription = await prisma.setting.findUnique({ where: { key: 'site_description' } });
    const siteLogo = await prisma.setting.findUnique({ where: { key: 'site_logo' } });
    const adsenseClientId = await prisma.setting.findUnique({ where: { key: 'adsense_client_id' } });
    const whatsappNumber = await prisma.setting.findUnique({ where: { key: 'whatsapp_number' } });

    return {
      success: true,
      data: {
        headScript: headScript?.value || '',
        inArticleScript: inArticleScript?.value || '',
        sidebarScript: sidebarScript?.value || '',
        sponsorMode: sponsorMode?.value || 'random',
        sponsorFixedId: sponsorFixedId?.value || '',
        siteName: siteName?.value || 'Renacer Noticias',
        siteDescription: siteDescription?.value || 'Las últimas noticias de tecnología, economía y cultura.',
        siteLogo: siteLogo?.value || '',
        adsenseClientId: adsenseClientId?.value || '',
        whatsappNumber: whatsappNumber?.value || '',
      }
    };
  } catch (error) {
    console.error('Error getting ad settings:', error);
    // Return empty defaults if database is not reachable yet
    return { 
      success: false, 
      data: {
        headScript: '',
        inArticleScript: '',
        sidebarScript: '',
        sponsorMode: 'random',
        sponsorFixedId: '',
        whatsappNumber: '',
      }
    };
  }
}
