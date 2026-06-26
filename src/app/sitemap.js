import { getPosts } from '@/app/actions/posts';
import { getPages } from '@/app/actions/pages';
import { getCategories } from '@/app/actions/categories';

export default async function sitemap() {
  const baseUrl = 'https://renacer.com';

  // Get all public posts
  const postsRes = await getPosts();
  const posts = postsRes.data || [];
  const postUrls = posts
    .filter(p => p.isPublished)
    .map((post) => ({
      url: `${baseUrl}/noticias/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // Get all public categories
  const catRes = await getCategories();
  const categories = catRes.data || [];
  const categoryUrls = categories
    .filter(c => c.isActive)
    .map((category) => ({
      url: `${baseUrl}/noticias?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

  // Get all public pages
  const pagesRes = await getPages();
  const pages = pagesRes.data || [];
  const pageUrls = pages
    .filter(p => p.isPublished)
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];

  return [...staticRoutes, ...categoryUrls, ...postUrls, ...pageUrls];
}
