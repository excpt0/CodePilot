import { useContext } from 'react';
import { AppearanceContext } from '@/components/layout/AppearanceProvider';

export function useAppearance() {
  return useContext(AppearanceContext);
}
