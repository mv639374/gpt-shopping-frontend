// ============================================
// File: app/citations/categories/[category]/page.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { use } from 'react';
import { useCategoryDetail } from '@/hooks/useCitationAnalytics';
import { CategoryDetailView } from '@/components/citations/CategoryDetailView';

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categoryName = decodeURIComponent(resolvedParams.category);
  const { data, loading, error } = useCategoryDetail(categoryName, 100);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Category</h3>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CategoryDetailView 
        categoryName={categoryName}
        data={data} 
        loading={loading} 
      />
    </div>
  );
}
