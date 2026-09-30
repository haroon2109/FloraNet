export interface SettingCategoryItem {
  id: string;
  title: string;
  description: string;
  iconType: 'user' | 'farm' | 'fields' | 'bell' | 'sliders' | 'shield';
  iconBg: string;
  iconColor: string;
  route: string;
}

export interface QuickSettingItem {
  id: string;
  title: string;
  value: string;
  iconType: 'location' | 'calendar' | 'irrigation' | 'currency' | 'language' | 'timezone';
  iconBg: string;
  iconColor: string;
}

export interface SupportHelpItem {
  id: string;
  title: string;
  description: string;
  iconType: 'help' | 'contact' | 'video' | 'leaf';
  url: string;
}

export interface SettingsPageData {
  categories: SettingCategoryItem[];
  quickSettings: QuickSettingItem[];
  accountSummary: {
    name: string;
    farmName: string;
    memberSince: string;
    plan: string;
    fieldsCount: number;
    totalArea: string;
    cropsGrownCount: number;
  };
  syncStatus: {
    statusText: string;
    lastSyncText: string;
  };
  supportItems: SupportHelpItem[];
}
