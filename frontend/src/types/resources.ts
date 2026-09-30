export interface FeaturedResource {
  id: string;
  title: string;
  description: string;
  type: 'Article' | 'Guide' | 'Video';
  readTime: string;
  image: string;
  isFeatured: boolean;
}

export interface ResourceCategory {
  id: string;
  title: string;
  countText: string;
  iconType: 'crop' | 'soil' | 'pest' | 'irrigation' | 'weather' | 'business';
}

export interface LatestResource {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  type: 'Article' | 'Guide' | 'Video';
  image: string;
}

export interface PopularThisWeekItem {
  id: string;
  rank: number;
  title: string;
  views: string;
  image: string;
}

export interface UpcomingWebinarItem {
  id: string;
  dateDay: string;
  title: string;
  time: string;
}

export interface ResourcesPageData {
  featured: FeaturedResource[];
  categories: ResourceCategory[];
  latest: LatestResource[];
  libraryCounts: {
    articles: number;
    guides: number;
    videos: number;
    infographics: number;
  };
  popularThisWeek: PopularThisWeekItem[];
  upcomingWebinars: UpcomingWebinarItem[];
}
