import type { MetadataRoute } from 'next';
import { USE_CASE_PRESETS } from '@/constants/useCases';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://loose.run';

const buildUrl = (path: string) => new URL(path, siteUrl).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: buildUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: buildUrl('/#outcome-blueprints'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildUrl('/#session-planner'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const presetRoutes: MetadataRoute.Sitemap = USE_CASE_PRESETS.map((preset) => ({
    url: buildUrl(`/?preset=${preset.id}&source=sitemap`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...coreRoutes, ...presetRoutes];
}
