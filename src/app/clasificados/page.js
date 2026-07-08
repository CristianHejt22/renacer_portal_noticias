import { getActiveClassifieds } from '@/app/actions/classifieds';
import { getClassifiedCategories } from '@/app/actions/classifiedCategories';
import BannerDisplay from '@/components/ads/BannerDisplay';
import ClassifiedList from '@/components/classifieds/ClassifiedList';
import ClassifiedsHeader from '@/components/classifieds/ClassifiedsHeader';

// export const revalidate = 60; (removed for dynamic searchParams support)

export const metadata = {
  title: 'Clasificados',
  description: 'Anuncios y servicios recomendados',
};

export default async function ClassifiedsPage({ searchParams }) {
  const params = await searchParams; // Next.js 15+ searchParams must be awaited (if applicable, else standard usage. Safe to await or just destructure)
  const q = params?.q || '';
  const page = parseInt(params?.page) || 1;
  const categoryId = params?.cat || null;

  const res = await getActiveClassifieds({ q, categoryId, page, limit: 12 });
  const classifieds = res.data || [];
  const pagination = res.pagination || { totalPages: 1, page: 1 };
  
  const catRes = await getClassifiedCategories();
  const categories = catRes.success ? catRes.data : [];

  return (
    <>
      <ClassifiedsHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">Clasificados</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Encuentra los mejores productos y servicios de nuestra comunidad.
        </p>
      </div>

      <div className="mb-10">
        <BannerDisplay position="plan-clasificados" />
      </div>

      <ClassifiedList 
        classifieds={classifieds} 
        categories={categories}
        pagination={pagination} 
        currentQuery={q} 
        currentCategory={categoryId} 
      />
    </div>
    </>
  );
}
