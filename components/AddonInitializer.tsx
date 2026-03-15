'use client';

import { useEffect } from 'react';
import { useAddonStore } from '@/store/useAddonStore';

export default function AddonInitializer() {
  const ensureCinemata = useAddonStore((state) => state.ensureCinemata);

  useEffect(() => {
    ensureCinemata();
  }, [ensureCinemata]);

  return null;
}
