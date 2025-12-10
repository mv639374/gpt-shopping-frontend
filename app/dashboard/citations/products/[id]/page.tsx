// ============================================
// File: app/citations/products/[id]/page.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { use } from 'react';
import { useProductDetail } from '@/hooks/useCitationAnalytics';
import { ProductDetailView } from '@/components/citations/ProductDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data, loading, error } = useProductDetail(resolvedParams.id);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Product</h3>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ProductDetailView data={data} loading={loading} />
    </div>
  );
}
