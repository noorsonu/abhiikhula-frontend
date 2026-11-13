'use client';

import { useEffect } from 'react';

const DUMMY_IDENTIFIERS = [
  'royal-barber',
  'gupta-medical',
  'suresh-sweets',
  'speedwheel-auto',
  'care-cure-clinic',
  'awadh-diagnostic',
  'sharma-chaat',
  'royal barber',
  'gupta care chemist',
  'suresh sweets',
  'my neighborhood shop',
  'completed-visit-royal-barber',
  'completed-sample-1',
  'mock-'
];

function isDummy(val) {
  if (!val) return false;
  const str = (typeof val === 'string' ? val : JSON.stringify(val)).toLowerCase();
  return DUMMY_IDENTIFIERS.some(id => str.includes(id));
}

export default function AutoPurgeLegacyData() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let changed = false;

      // 1. Purge legacy customer tokens from phone/client localStorage
      const rawTokens = localStorage.getItem('ak_customer_tokens');
      if (rawTokens) {
        try {
          const list = JSON.parse(rawTokens);
          if (Array.isArray(list)) {
            const cleaned = list.filter(t => !isDummy(t.id) && !isDummy(t.shopSlug) && !isDummy(t.shopName));
            if (cleaned.length !== list.length) {
              localStorage.setItem('ak_customer_tokens', JSON.stringify(cleaned));
              changed = true;
            }
          }
        } catch (e) {
          localStorage.removeItem('ak_customer_tokens');
          changed = true;
        }
      }

      // 2. Purge legacy customer history
      const rawHistory = localStorage.getItem('ak_customer_history');
      if (rawHistory) {
        try {
          const list = JSON.parse(rawHistory);
          if (Array.isArray(list)) {
            const cleaned = list.filter(t => !isDummy(t.id) && !isDummy(t.shopSlug) && !isDummy(t.shopName));
            if (cleaned.length !== list.length) {
              localStorage.setItem('ak_customer_history', JSON.stringify(cleaned));
              changed = true;
            }
          }
        } catch (e) {
          localStorage.removeItem('ak_customer_history');
          changed = true;
        }
      }

      // 3. Purge active merchant shop if it's dummy
      const rawShop = localStorage.getItem('ak_active_merchant_shop');
      if (rawShop && isDummy(rawShop)) {
        localStorage.removeItem('ak_active_merchant_shop');
        changed = true;
      }

      // 4. Purge merchant shop list if any are dummy
      const rawShops = localStorage.getItem('ak_merchant_shops');
      if (rawShops) {
        try {
          const list = JSON.parse(rawShops);
          if (Array.isArray(list)) {
            const cleaned = list.filter(s => !isDummy(s.slug) && !isDummy(s.name));
            if (cleaned.length !== list.length) {
              localStorage.setItem('ak_merchant_shops', JSON.stringify(cleaned));
              changed = true;
            }
          }
        } catch (e) {
          localStorage.removeItem('ak_merchant_shops');
          changed = true;
        }
      }

      // 5. Remove legacy mock keys
      const legacyKeys = [
        'ak_mock_shops',
        'ak_demo_seeded',
        'ak_dummy_initialized',
        'ak_seed_done',
        'ak_has_seeded_sample'
      ];
      legacyKeys.forEach(k => {
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
          changed = true;
        }
      });

      if (changed) {
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('Legacy data purge error:', e);
    }
  }, []);

  return null;
}
