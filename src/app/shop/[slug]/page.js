import { Suspense } from 'react';
import ShopDetailClient from './ShopDetailClient';

export default function Page({ params }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-semibold text-slate-400">Loading shop details...</div>}>
      <ShopDetailClient />
    </Suspense>
  );
}
