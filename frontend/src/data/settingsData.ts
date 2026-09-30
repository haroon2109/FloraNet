import { SettingsPageData } from '@/types/settings';

export const settingsPageData: SettingsPageData = {
  categories: [],
  quickSettings: [
    {
      id: 'language',
      title: 'App Language',
      // Static fallback only — QuickSettings renders the live profile value.
      value: 'English (India)',
      iconType: 'language',
      iconBg: 'bg-[#EAF5EC]',
      iconColor: 'text-[#168A45]',
    },
  ],
  accountSummary: { name: '', farmName: '', memberSince: '', plan: '', fieldsCount: 0, totalArea: '', cropsGrownCount: 0 },
  syncStatus: { statusText: '', lastSyncText: '' },
  supportItems: [],
};
