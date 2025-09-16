import { Suspense } from 'react';
import VisualizerClient from '@/components/VisualizerClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VisualizerClient />
    </Suspense>
  );
}
