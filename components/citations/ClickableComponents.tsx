// ============================================
// File: components/citations/ClickableComponents.tsx
// CREATE NEW FILE - Helper wrapper for clickable items
// ============================================

'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface ClickableProductProps {
  responseId: string;
  children: ReactNode;
  className?: string;
}

export function ClickableProduct({ responseId, children, className = '' }: ClickableProductProps) {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(`/citations/products/${responseId}`)}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </div>
  );
}

interface ClickableDomainProps {
  domain: string;
  children: ReactNode;
  className?: string;
}

export function ClickableDomain({ domain, children, className = '' }: ClickableDomainProps) {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(`/citations/domains/${encodeURIComponent(domain)}`)}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </div>
  );
}

interface ClickableCategoryProps {
  category: string;
  children: ReactNode;
  className?: string;
}

export function ClickableCategory({ category, children, className = '' }: ClickableCategoryProps) {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(`/citations/categories/${encodeURIComponent(category)}`)}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
    >
      {children}
    </div>
  );
}
