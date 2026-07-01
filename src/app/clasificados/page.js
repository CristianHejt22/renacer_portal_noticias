import { getActiveClassifieds } from '@/app/actions/classifieds';
import ClassifiedList from '@/components/classifieds/ClassifiedList';

export const revalidate = 60; // ISR

export const metadata = {
  title: 'Clasificados',
  description: 'Anuncios y servicios recomendados',
};

export default async function ClassifiedsPage() {
  const res = await getActiveClassifieds();
  const classifieds = res.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Clasificados</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Encuentra los mejores productos y servicios de nuestra comunidad.
        </p>
      </div>

      <ClassifiedList classifieds={classifieds} />
    </div>
  );
}
