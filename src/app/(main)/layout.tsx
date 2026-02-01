import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout';

export default function MainGroupLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
