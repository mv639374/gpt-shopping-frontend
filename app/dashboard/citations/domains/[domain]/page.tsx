// ============================================
// File: app/citations/domains/[domain]/page.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { use } from 'react';
import { useDomainDetail } from '@/hooks/useCitationAnalytics';
import { DomainDetailView } from '@/components/citations/DomainDetailView';

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default function DomainDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data, loading, error } = useDomainDetail(resolvedParams.domain);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Domain</h3>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <DomainDetailView data={data} loading={loading} />
    </div>
  );
}
