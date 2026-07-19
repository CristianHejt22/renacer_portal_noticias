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
    const settingsArray = await prisma.setting.findMany();
    const s = settingsArray.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        headScript: s['ad_head_script'] || '',
        inArticleScript: s['ad_in_article_script'] || '',
        sidebarScript: s['ad_sidebar_script'] || '',
        sponsorMode: s['sponsor_mode'] || 'random',
        sponsorFixedId: s['sponsor_fixed_id'] || '',
        siteName: s['site_name'] || 'THE DINNER Portal',
        siteDescription: s['site_description'] || 'Las últimas noticias de tecnología, economía y cultura.',
        siteLogo: s['site_logo'] || '',
        adsenseClientId: s['adsense_client_id'] || '',
        whatsappNumber: s['whatsapp_number'] || '',
        bankAlias: s['bank_alias'] || '',
        bankCvu: s['bank_cvu'] || '',
        bankName: s['bank_name'] || '',
        makeWebhookUrl: s['make_webhook_url'] || '',
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
        bankAlias: '',
        bankCvu: '',
        bankName: '',
        makeWebhookUrl: '',
      }
    };
  }
}
