import { PrismaClient } from '@prisma/client';
import { getAdSettings } from '@/app/actions/settings';
import NavbarClient from './NavbarClient';

const prisma = new PrismaClient();

export default async function Navbar() {
  let categories = [];
  let pages = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    pages = await prisma.page.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
    });
  } catch (e) {
    console.error("Error loading navbar items", e);
  }

  const adSettings = await getAdSettings();
  const siteLogo = adSettings.data?.siteLogo || '';
  const siteName = adSettings.data?.siteName || 'RENACER';

  return (
    <NavbarClient 
      categories={categories} 
      pages={pages} 
      siteLogo={siteLogo} 
      siteName={siteName} 
    />
  );
}
