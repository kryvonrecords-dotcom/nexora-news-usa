export interface RSSSource {
  name: string;
  url: string;
  category: string;
  country: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'Notícias de Angola',
    url: 'https://noticiasdeangola.co.ao/feed/',
    category: 'angola',
    country: 'Angola'
  }
];
