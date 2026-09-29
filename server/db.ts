import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';
import { 
  Advertisement, 
  AppNotification, 
  Category, 
  CommercialProposal, 
  EditorialContactMessage, 
  NewsItem, 
  NewsletterCampaign, 
  NewsletterSubscriber, 
  PushSubscriptionItem, FcmTokenItem, 
  SiteSettings, 
  User 
} from '../src/types';

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  news: NewsItem[];
  deletedNewsIds: string[];
  subscribers: NewsletterSubscriber[];
  newsletterCampaigns?: NewsletterCampaign[];
  settings: SiteSettings;
  advertisements: Advertisement[];
  adProposals?: CommercialProposal[];
  contactMessages?: EditorialContactMessage[];
  notifications: AppNotification[];
  pushSubscriptions: PushSubscriptionItem[];
  fcmTokens: FcmTokenItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora_news.json');

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-angola', name: 'Angola', slug: 'angola', description: 'Notícias nacionais de Angola, atualidade e sociedade.', color: '#1F3A93', order: 1, createdAt: new Date().toISOString() },
  { id: 'cat-africa', name: 'África', slug: 'africa', description: 'Acontecimentos no continente africano e cooperação regional.', color: '#000000', order: 2, createdAt: new Date().toISOString() },
  { id: 'cat-mundo', name: 'Mundo', slug: 'mundo', description: 'Geopolítica e notícias internacionais de relevo.', color: '#2563EB', order: 3, createdAt: new Date().toISOString() },
  { id: 'cat-politica', name: 'Política', slug: 'politica', description: 'Decisões governamentais, assembleia e diplomacia.', color: '#4F46E5', order: 4, createdAt: new Date().toISOString() },
  { id: 'cat-economia', name: 'Economia', slug: 'economia', description: 'Mercados, finanças, investimentos, petróleo e banca.', color: '#0D9488', order: 5, createdAt: new Date().toISOString() },
  { id: 'cat-tecnologia', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação digital, telecomunicações, startups e ciência.', color: '#7C3AED', order: 6, createdAt: new Date().toISOString() },
  { id: 'cat-desporto', name: 'Desporto', slug: 'desporto', description: 'Girabola, futebol internacional, basquetebol e atletas.', color: '#EA580C', order: 7, createdAt: new Date().toISOString() },
  { id: 'cat-entretenimento', name: 'Entretenimento', slug: 'entretenimento', description: 'Música, cinema, moda, celebridades e espetáculos.', color: '#DB2777', order: 8, createdAt: new Date().toISOString() },
  { id: 'cat-cultura', name: 'Cultura', slug: 'cultura', description: 'Artes, literatura, património histórico e tradições.', color: '#9333EA', order: 9, createdAt: new Date().toISOString() },
  { id: 'cat-saude', name: 'Saúde', slug: 'saude', description: 'Medicina, bem-estar, hospitais e saúde pública.', color: '#059669', order: 10, createdAt: new Date().toISOString() },
  { id: 'cat-educacao', name: 'Educação', slug: 'educacao', description: 'Universidades, bolsas de estudo, formação e ensino.', color: '#0284C7', order: 11, createdAt: new Date().toISOString() },
  { id: 'cat-sociedade', name: 'Sociedade', slug: 'sociedade', description: 'Comunidade, iniciativas sociais e cidadania.', color: '#D97706', order: 12, createdAt: new Date().toISOString() },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Nexora USA',
  siteTagline: 'News in real time.',
  logoText: 'NEXORA USA',
  breakingNewsEnabled: true,
  breakingNewsText: 'URGENTE: Banco Central de Angola anuncia novo pacote de incentivos ao crédito para startups de base tecnológica',
  breakingNewsUrl: '/noticia/banco-central-anuncia-incentivos-credito-startups',
  contactEmail: 'redacao@nexora-usa.nexoranews.blitz.cloud',
  contactPhone: '+244 921 281 315',
  address: 'Avenida 4 de Fevereiro, Marginal de Luanda, Angola',
  socialLinks: {
    facebook: 'https://facebook.com/nexoranews',
    twitter: 'https://x.com/nexoranews',
    instagram: 'https://instagram.com/nexoranews',
    youtube: 'https://youtube.com/@nexoranews',
    whatsapp: 'https://wa.me/244921281315',
    telegram: 'https://t.me/nexoranews',
    tiktok: 'https://tiktok.com/@nexoranews',
    linkedin: 'https://linkedin.com/company/nexoranews',
    threads: 'https://threads.net/@nexoranews',
    spotify: 'https://open.spotify.com/show/nexoranews',
    playStore: 'https://play.google.com/store',
    appStore: 'https://apps.apple.com'
  },
  customSocialLinks: [],
  whatsappFloatingEnabled: true,
  whatsappFloatingNumber: '+244 921 281 315',
  whatsappFloatingMessage: 'Olá! Gostaria de falar com a redação do Nexora USA.',
  showSocialInHeader: true,
  showSocialInFooter: true
};

const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-nexora-app',
    title: 'NEXORA USA: A Notícia Que Move o Mundo!',
    subtitle: 'Cobertura completa, análises profundas e informação confiável em tempo real. 24 horas com você, onde você estiver.',
    tagline: 'A Verdade Importa. A Gente Traz Até Você!',
    badgeText: 'BAIXE O APLICATIVO',
    mediaType: 'custom_banner',
    mediaUrl: '/promo-banner.jpg',
    linkUrl: 'https://play.google.com/store',
    targetNewTab: true,
    callToAction: 'Acesse Agora',
    position: 'top_hero',
    status: 'active',
    order: 1,
    viewsCount: 1420,
    clicksCount: 238,
    createdAt: new Date().toISOString()
  }
];



const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-sample-1',
    title: '🔴 URGENTE: Banco Central de Angola anuncia novo pacote de incentivos',
    body: 'Iniciativa disponibiliza linhas de financiamento bonificadas para startups e pequenas empresas de inovação.',
    newsSlug: 'banco-central-anuncia-incentivos-credito-startups',
    categoryName: 'Economia',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    isBreaking: true,
    type: 'breaking_news',
    sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    deliveredCount: 420,
    clickUrl: '/noticia/banco-central-anuncia-incentivos-credito-startups'
  },
  {
    id: 'notif-sample-2',
    title: '📱 Tecnologia: Nova rede de fibra ótica submarina concluída em Luanda',
    body: 'Infraestrutura de alta capacidade reduz latência e conecta Angola ao Atlântico Norte.',
    newsSlug: 'nova-rede-fibra-otica-submarina-luanda',
    categoryName: 'Tecnologia',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    isBreaking: false,
    type: 'new_article',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    deliveredCount: 395,
    clickUrl: '/noticia/nova-rede-fibra-otica-submarina-luanda'
  }
];

const DEFAULT_PROPOSALS: CommercialProposal[] = [
  {
    id: 'prop-sample-1',
    company: 'Unitel Angola',
    contactName: 'Eng. Carlos Morais',
    email: 'carlos.morais@unitel.co.ao',
    phone: '+244 923 100 200',
    adFormat: 'hero_banner',
    budget: '1_mes',
    message: 'Gostaríamos de agendar a veiculação de um Hero Banner de topo durante 30 dias para o lançamento da nova campanha de internet 5G e fibra residencial.',
    status: 'pending',
    notes: 'Prioridade alta. Anunciante premium nacional.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'prop-sample-2',
    company: 'Banco BAI (Banco Angolano de Investimentos)',
    contactName: 'Dra. Maria Helena',
    email: 'mhelena.comercial@bancobai.ao',
    phone: '+244 912 345 678',
    adFormat: 'publirreportagem',
    budget: 'trimestral',
    message: 'Solicitamos o Mídia Kit completo e proposta para um pacote trimestral com foco em publirreportagens sobre finanças corporativas e crédito imobiliário.',
    status: 'contacted',
    notes: 'Mídia Kit enviado por email em 21/08. Aguardando retorno com artes finais.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
];

const DEFAULT_CONTACT_MESSAGES: EditorialContactMessage[] = [
  {
    id: 'msg-sample-1',
    name: 'Dr. António Bento',
    email: 'antonio.bento@universidade.ao',
    phone: '+244 931 445 566',
    category: 'artigo_opiniao',
    subject: 'Submissão de Artigo: A Transição Digital na Banca Angolana',
    message: 'Prezada equipa editorial, submeto o meu artigo de opinião académica e técnica sobre os impactos das fintechs e da inteligência artificial no sistema financeiro nacional.',
    status: 'reviewed',
    notes: 'Encaminhado para a editoria de Economia.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadDatabase();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          news: Array.isArray(parsed.news) ? parsed.news : [],
          deletedNewsIds: Array.isArray(parsed.deletedNewsIds)
            ? parsed.deletedNewsIds
            : [],
          subscribers: parsed.subscribers || [],
          newsletterCampaigns: parsed.newsletterCampaigns || [
            {
              id: 'camp-1',
              subject: 'Resumo Diário Nexora USA: Economia e Política em Destaque',
              previewText: 'Acompanhe as principais manchetes desta manhã em Angola e no Mundo.',
              introText: 'Caros leitores, partilhamos convosco o resumo das notícias mais importantes selecionadas pela nossa equipa editorial.',
              sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              sentCount: 148,
              openRateEstimated: 64,
              status: 'sent'
            }
          ],
          settings: parsed.settings || DEFAULT_SETTINGS,
          advertisements: (parsed.advertisements || DEFAULT_ADS).filter((a: Advertisement) => a.id !== 'ad-video-spot' && !a.mediaUrl?.includes('BigBuckBunny')),
          adProposals: (parsed.adProposals && parsed.adProposals.length > 0 ? parsed.adProposals : DEFAULT_PROPOSALS).filter((p: CommercialProposal) => !p.company?.toLowerCase().includes('empresa teste')),
          contactMessages: parsed.contactMessages && parsed.contactMessages.length > 0 ? parsed.contactMessages : DEFAULT_CONTACT_MESSAGES,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          pushSubscriptions: parsed.pushSubscriptions || [],
          fcmTokens: parsed.fcmTokens || []
        };
      } catch (err) {
        console.error('Error reading database file, initializing default:', err);
      }
    }

    // Initialize with default admin and demo data
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexora-usa.nexoranews.blitz.cloud';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminNexora2026!';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminPassword, salt);

    const initialAdmin: User = {
      id: 'admin-1',
      name: 'Redator Chefe / Admin',
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const initialData: DatabaseSchema = {
      users: [initialAdmin],
      categories: DEFAULT_CATEGORIES,
      news: [],
      deletedNewsIds: [],
      subscribers: [
        { id: 'sub-1', email: 'leitor.exemplo@nexora-usa.nexoranews.blitz.cloud', createdAt: new Date().toISOString(), status: 'active' }
      ],
      settings: DEFAULT_SETTINGS,
      advertisements: DEFAULT_ADS,
      adProposals: DEFAULT_PROPOSALS,
      contactMessages: DEFAULT_CONTACT_MESSAGES,
      notifications: DEFAULT_NOTIFICATIONS,
      pushSubscriptions: [],
      fcmTokens: []
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public async restoreFromSupabase(): Promise<boolean> {
    // Nexora Angola: não restaurar notícias do backup remoto.
    // O backup remoto pode conter notícias antigas de outras fontes.
    // As notícias do Angola serão obtidas exclusivamente pela automação RSS configurada.
    console.log('Supabase restore: notícias remotas ignoradas para o Nexora Angola.');
    return false;
  }

  private backupInProgress = false;
  private backupPending = false;
  private backupTimer: NodeJS.Timeout | null = null;

  public save() {
    this.saveDataDirect(this.data);

    if (!supabase) return;

    this.backupPending = true;

    if (this.backupTimer) {
      return;
    }

    this.backupTimer = setTimeout(() => {
      this.backupTimer = null;
      void this.flushSupabaseBackup();
    }, 60000);
  }

  public saveLocalOnly() {
    this.saveDataDirect(this.data);
  }

  private async flushSupabaseBackup(): Promise<void> {
    if (!supabase || this.backupInProgress) return;

    this.backupInProgress = true;
    this.backupPending = false;

    try {
      const snapshot = JSON.stringify(this.data);

      const { error } = await supabase
        .from('nexora_backup')
        .upsert({
          id: 1,
          data: snapshot
        });

      if (error) {
        console.error('Supabase backup failed:', error.message);
      } else {
        console.log('Supabase backup updated successfully.');
      }
    } finally {
      this.backupInProgress = false;

      if (this.backupPending && !this.backupTimer) {
        console.log('Supabase backup pendente; novo backup agendado para daqui a 60 segundos.');

        this.backupTimer = setTimeout(() => {
          this.backupTimer = null;
          void this.flushSupabaseBackup();
        }, 60000);
      }
    }
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public updateUserPassword(id: string, newHash: string): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.passwordHash = newHash;
      user.updatedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }

  public createCategory(cat: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      order: cat.order ?? (this.data.categories.length + 1)
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates
    };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // News Image Safe Sanitizer
  private sanitizeNewsImage(imgUrl: string | undefined | null, categorySlug?: string): string {
    if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '' && imgUrl !== 'null' && imgUrl !== 'undefined') {
      return imgUrl.trim();
    }
    const slug = (categorySlug || 'geral').toLowerCase();
    const defaults: Record<string, string> = {
      angola: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1400&q=80',
      africa: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      mundo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
      politica: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      economia: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      tecnologia: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      desporto: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      entretenimento: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      cultura: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
      saude: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      educacao: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      sociedade: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      geral: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    };
    return defaults[slug] || defaults.geral;
  }

  // News
  public getAllNews(): NewsItem[] {
    // Populate categoryName & categorySlug if missing and ensure valid image
    return this.data.news.map(n => {
      const cat = this.getCategoryById(n.categoryId);
      const categoryName = cat ? cat.name : n.categoryName || 'Geral';
      const categorySlug = cat ? cat.slug : n.categorySlug || 'geral';
      return {
        ...n,
        categoryName,
        categorySlug,
        featuredImage: this.sanitizeNewsImage(n.featuredImage, categorySlug)
      };
    });
  }

  public getPublishedNews(): NewsItem[] {
    const nowIso = new Date().toISOString();

    return this.getAllNews().filter(n => {
      if (n.status === 'published') {
        return Boolean(n.publishedAt);
      }

      if (n.status === 'scheduled' && n.scheduledFor && n.scheduledFor <= nowIso) {
        return true;
      }

      return false;
    }).sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  public getNewsById(id: string): NewsItem | undefined {
    const n = this.data.news.find(item => item.id === id);
    if (!n) return undefined;

    const cat = this.getCategoryById(n.categoryId);
    return {
      ...n,
      categoryName: cat ? cat.name : n.categoryName || 'Geral',
      categorySlug: cat ? cat.slug : n.categorySlug || 'geral'
    };
  }

  public getNewsBySlug(slug: string): NewsItem | undefined {
    const n = this.data.news.find(item => item.slug.toLowerCase() === slug.toLowerCase());
    if (!n) return undefined;

    const cat = this.getCategoryById(n.categoryId);
    return {
      ...n,
      categoryName: cat ? cat.name : n.categoryName || 'Geral',
      categorySlug: cat ? cat.slug : n.categorySlug || 'geral'
    };
  }

  public incrementViews(id: string): number {
    const n = this.data.news.find(item => item.id === id);
    if (n) {
      n.views = (n.views || 0) + 1;
      this.saveLocalOnly();
      return n.views;
    }
    return 0;
  }

  public createNews(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): NewsItem {
    const cat = this.getCategoryById(newsData.categoryId);
    const id = `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    // Auto-calculate reading time if not supplied: ~200 words/min
    const textContent = newsData.content ? newsData.content.replace(/<[^>]*>?/gm, '') : '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const item: NewsItem = {
      ...newsData,
      id,
      categoryName: cat ? cat.name : 'Geral',
      categorySlug: cat ? cat.slug : 'geral',
      views: 0,
      readTimeMinutes: newsData.readTimeMinutes || readTimeMinutes,
      createdAt: now,
      updatedAt: now,
      publishedAt: newsData.publishedAt || now
    };

    this.data.news.unshift(item);
    this.save();
    return item;
  }

  public createNewsLocalOnly(newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>): NewsItem {
    const cat = this.getCategoryById(newsData.categoryId);
    const id = `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const textContent = newsData.content ? newsData.content.replace(/<[^>]*>?/gm, '') : '';
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const item: NewsItem = {
      ...newsData,
      id,
      categoryName: cat ? cat.name : 'Geral',
      categorySlug: cat ? cat.slug : 'geral',
      views: 0,
      readTimeMinutes: newsData.readTimeMinutes || readTimeMinutes,
      createdAt: now,
      updatedAt: now,
      publishedAt: newsData.publishedAt || now
    };

    this.data.news.unshift(item);
    this.saveLocalOnly();
    return item;
  }

  public updateNews(id: string, updates: Partial<NewsItem>): NewsItem | null {
    const idx = this.data.news.findIndex(item => item.id === id);
    if (idx === -1) return null;

    const cat = updates.categoryId ? this.getCategoryById(updates.categoryId) : this.getCategoryById(this.data.news[idx].categoryId);

    this.data.news[idx] = {
      ...this.data.news[idx],
      ...updates,
      categoryName: cat ? cat.name : this.data.news[idx].categoryName,
      categorySlug: cat ? cat.slug : this.data.news[idx].categorySlug,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.news[idx];
  }

  public deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;

    this.data.news = this.data.news.filter(
      item => item.id !== id
    );

    if (this.data.news.length !== initialLen) {
      if (!Array.isArray(this.data.deletedNewsIds)) {
        this.data.deletedNewsIds = [];
      }

      if (!this.data.deletedNewsIds.includes(id)) {
        this.data.deletedNewsIds.push(id);
      }

      this.save();
      return true;
    }

    return false;
  }

  public expireOldNews(): NewsItem[] {
    const now = Date.now();
    const expirationMs = 24 * 60 * 60 * 1000;

    const expiredNews = this.data.news
      .filter(news => {
        if (
          news.status !== 'published' ||
          !news.publishedAt ||
          news.authorId === 'nexora-rss'
        ) {
          return false;
        }

        const publishedAt = new Date(news.publishedAt).getTime();

        return Number.isFinite(publishedAt) &&
          now - publishedAt >= expirationMs;
      });

    if (expiredNews.length > 0) {
      const expiredIds = new Set(expiredNews.map(news => news.id));

      this.data.news = this.data.news.filter(
        news => !expiredIds.has(news.id)
      );

      if (!Array.isArray(this.data.deletedNewsIds)) {
        this.data.deletedNewsIds = [];
      }

      for (const news of expiredNews) {
        if (!this.data.deletedNewsIds.includes(news.id)) {
          this.data.deletedNewsIds.push(news.id);
        }
      }

      this.save();

      console.log(
        `🗑️ Notícias expiradas após 24h: ${expiredNews.length}`
      );
    }

    return expiredNews;
  }

  // Newsletter
  public getSubscribers(): NewsletterSubscriber[] {
    return this.data.subscribers;
  }

  public addSubscriber(email: string): { success: boolean; message: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Email inválido.' };
    }
    const existing = this.data.subscribers.find(s => s.email === cleanEmail);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        this.save();
        return { success: true, message: 'Inscrição reativada com sucesso!' };
      }
      return { success: true, message: 'Este email já está inscrito na nossa newsletter.' };
    }
    this.data.subscribers.push({
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    this.save();
    return { success: true, message: 'Inscrição realizada com sucesso!' };
  }

  public deleteSubscriber(id: string): boolean {
    const initialLen = this.data.subscribers.length;
    this.data.subscribers = this.data.subscribers.filter(s => s.id !== id);
    if (this.data.subscribers.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getNewsletterCampaigns(): NewsletterCampaign[] {
    if (!this.data.newsletterCampaigns) {
      this.data.newsletterCampaigns = [];
    }
    return this.data.newsletterCampaigns.slice().sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public createNewsletterCampaign(campaign: Omit<NewsletterCampaign, 'id' | 'sentAt' | 'sentCount' | 'status'> & { sentCount?: number }): NewsletterCampaign {
    if (!this.data.newsletterCampaigns) {
      this.data.newsletterCampaigns = [];
    }

    const activeSubscribersCount = this.data.subscribers.filter(s => s.status !== 'unsubscribed').length;
    const newCamp: NewsletterCampaign = {
      id: `camp-${Date.now()}`,
      subject: campaign.subject,
      previewText: campaign.previewText || '',
      introText: campaign.introText || '',
      selectedNewsIds: campaign.selectedNewsIds || [],
      customContent: campaign.customContent || '',
      sentAt: new Date().toISOString(),
      sentCount: campaign.sentCount || activeSubscribersCount,
      openRateEstimated: Math.floor(Math.random() * 15) + 55, // ~55-70%
      status: 'sent'
    };

    this.data.newsletterCampaigns.unshift(newCamp);
    this.save();
    return newCamp;
  }

  public getNewsletterStats() {
    const subscribers = this.data.subscribers || [];
    const activeSubscribers = subscribers.filter(s => s.status !== 'unsubscribed');
    const campaigns = this.data.newsletterCampaigns || [];
    
    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
      totalCampaigns: campaigns.length,
      lastCampaignDate: campaigns[0]?.sentAt || null,
      averageOpenRate: campaigns.length > 0 
        ? Math.round(campaigns.reduce((acc, c) => acc + (c.openRateEstimated || 60), 0) / campaigns.length)
        : 65
    };
  }

  public updateUser(id: string, updates: Partial<User> & { password?: string }): User | null {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.password) {
      user.passwordHash = bcrypt.hashSync(updates.password, 10);
    }
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  // Settings
  public updateSettingsLocalOnly(newSettings: Partial<SiteSettings>): SiteSettings {
    const current = this.data.settings || DEFAULT_SETTINGS;
    this.data.settings = {
      ...current,
      ...newSettings,
      socialLinks: {
        ...(current.socialLinks || DEFAULT_SETTINGS.socialLinks),
        ...(newSettings.socialLinks || {})
      },
      customSocialLinks: newSettings.customSocialLinks !== undefined
        ? newSettings.customSocialLinks
        : (current.customSocialLinks || [])
    };
    this.saveLocalOnly();
    return this.data.settings;
  }

  public getSettings(): SiteSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(newSettings: Partial<SiteSettings>): SiteSettings {
    const current = this.data.settings || DEFAULT_SETTINGS;
    this.data.settings = {
      ...current,
      ...newSettings,
      socialLinks: {
        ...(current.socialLinks || DEFAULT_SETTINGS.socialLinks),
        ...(newSettings.socialLinks || {})
      },
      customSocialLinks: newSettings.customSocialLinks !== undefined 
        ? newSettings.customSocialLinks 
        : (current.customSocialLinks || [])
    };
    this.save();
    return this.data.settings;
  }

  private sanitizeAdvertisement(ad: Advertisement): Advertisement {
    let mediaUrl = ad.mediaUrl || '';
    if (mediaUrl.includes('nexora_welcome_cover') || mediaUrl.includes('welcome-cover')) {
      mediaUrl = '/welcome-cover.jpg';
    } else if (mediaUrl.includes('nexora_promo_banner') || mediaUrl.includes('promo-banner')) {
      mediaUrl = '/promo-banner.jpg';
    } else if (mediaUrl.includes('nexora_app_cover') || mediaUrl.includes('app-cover')) {
      mediaUrl = '/app-cover.jpg';
    } else if (!mediaUrl || mediaUrl.trim() === '') {
      mediaUrl = ad.mediaType === 'custom_banner' ? '/welcome-cover.jpg' : '/promo-banner.jpg';
    }

    let videoThumbnail = ad.videoThumbnail || '';
    if (videoThumbnail.includes('nexora_welcome_cover') || videoThumbnail.includes('welcome-cover')) {
      videoThumbnail = '/welcome-cover.jpg';
    } else if (!videoThumbnail && ad.mediaType === 'video') {
      videoThumbnail = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
    }

    return {
      ...ad,
      mediaUrl,
      videoThumbnail
    };
  }

  // Advertisements
  public getAdvertisements(filters?: { position?: string; status?: string }): Advertisement[] {
    let ads = (this.data.advertisements || []).map(a => this.sanitizeAdvertisement(a));
    if (filters?.position) {
      ads = ads.filter(a => a.position === filters.position);
    }
    if (filters?.status) {
      ads = ads.filter(a => a.status === filters.status);
    }
    return ads.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public getActiveAdvertisements(position?: string): Advertisement[] {
    const now = new Date().toISOString();
    return this.getAdvertisements({ status: 'active', position }).filter(ad => {
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      return true;
    });
  }

  public getAdvertisementById(id: string): Advertisement | undefined {
    return (this.data.advertisements || []).find(a => a.id === id);
  }

  public createAdvertisement(adData: Partial<Advertisement>): Advertisement {
    if (!this.data.advertisements) {
      this.data.advertisements = [];
    }

    const newAd: Advertisement = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: adData.title || 'Nova Publicidade',
      subtitle: adData.subtitle || '',
      tagline: adData.tagline || '',
      badgeText: adData.badgeText || 'PUBLICIDADE',
      mediaType: adData.mediaType || 'image',
      mediaUrl: adData.mediaUrl || '',
      videoThumbnail: adData.videoThumbnail || '',
      linkUrl: adData.linkUrl || '',
      targetNewTab: adData.targetNewTab ?? true,
      callToAction: adData.callToAction || 'Acesse Agora',
      position: adData.position || 'top_hero',
      status: adData.status || 'active',
      order: adData.order ?? (this.data.advertisements.length + 1),
      startDate: adData.startDate,
      endDate: adData.endDate,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.advertisements.push(newAd);
    this.save();
    return newAd;
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>): Advertisement | null {
    if (!this.data.advertisements) return null;
    const index = this.data.advertisements.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.advertisements[index] = {
      ...this.data.advertisements[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.advertisements[index];
  }

  public deleteAdvertisement(id: string): boolean {
    if (!this.data.advertisements) return false;
    const initialLen = this.data.advertisements.length;
    this.data.advertisements = this.data.advertisements.filter(a => a.id !== id);
    if (this.data.advertisements.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public recordAdImpression(id: string): boolean {
    if (!this.data.advertisements) return false;
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      this.saveLocalOnly();
      return true;
    }
    return false;
  }

  public recordAdClick(id: string): boolean {
    if (!this.data.advertisements) return false;
    const ad = this.data.advertisements.find(a => a.id === id);
    if (ad) {
      ad.clicksCount = (ad.clicksCount || 0) + 1;
      this.saveLocalOnly();
      return true;
    }
    return false;
  }

  // Commercial Proposals (Anuncie no Nexora USA / Mídia Kit)
  public getAdProposals(filters?: { status?: string; search?: string }): CommercialProposal[] {
    let list = this.data.adProposals || [];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.company.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.message && p.message.toLowerCase().includes(q))
      );
    }
    return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAdProposalById(id: string): CommercialProposal | undefined {
    return (this.data.adProposals || []).find(p => p.id === id);
  }

  public addAdProposal(data: Partial<CommercialProposal>): CommercialProposal {
    if (!this.data.adProposals) {
      this.data.adProposals = [];
    }

    const now = new Date().toISOString();
    const newProposal: CommercialProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: data.company?.trim() || 'Empresa Anunciante',
      contactName: data.contactName?.trim() || 'Responsável Comercial',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone?.trim() || '',
      adFormat: data.adFormat?.trim() || 'hero_banner',
      budget: data.budget?.trim() || '1_mes',
      message: data.message?.trim() || '',
      status: data.status || 'pending',
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.data.adProposals.unshift(newProposal);
    this.save();
    return newProposal;
  }

  public updateAdProposal(id: string, updates: Partial<CommercialProposal>): CommercialProposal | null {
    if (!this.data.adProposals) return null;
    const index = this.data.adProposals.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.adProposals[index] = {
      ...this.data.adProposals[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.adProposals[index];
  }

  public deleteAdProposal(id: string): boolean {
    if (!this.data.adProposals) return false;
    const initialLen = this.data.adProposals.length;
    this.data.adProposals = this.data.adProposals.filter(p => p.id !== id);
    if (this.data.adProposals.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Editorial Contact Messages (Fale com a Redação)
  public getContactMessages(filters?: { status?: string }): EditorialContactMessage[] {
    let list = this.data.contactMessages || [];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(m => m.status === filters.status);
    }
    return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getContactMessageById(id: string): EditorialContactMessage | undefined {
    return (this.data.contactMessages || []).find(m => m.id === id);
  }

  public addContactMessage(data: Partial<EditorialContactMessage>): EditorialContactMessage {
    if (!this.data.contactMessages) {
      this.data.contactMessages = [];
    }

    const now = new Date().toISOString();
    const newMsg: EditorialContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name?.trim() || 'Leitor Nexora',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone?.trim() || '',
      category: data.category?.trim() || 'geral',
      subject: data.subject?.trim() || 'Contacto Editorial',
      message: data.message?.trim() || '',
      status: data.status || 'pending',
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.data.contactMessages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  public updateContactMessage(id: string, updates: Partial<EditorialContactMessage>): EditorialContactMessage | null {
    if (!this.data.contactMessages) return null;
    const index = this.data.contactMessages.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.data.contactMessages[index] = {
      ...this.data.contactMessages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.contactMessages[index];
  }

  public deleteContactMessage(id: string): boolean {
    if (!this.data.contactMessages) return false;
    const initialLen = this.data.contactMessages.length;
    this.data.contactMessages = this.data.contactMessages.filter(m => m.id !== id);
    if (this.data.contactMessages.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Firebase Cloud Messaging tokens
  public getFcmTokens(): FcmTokenItem[] {
    return this.data.fcmTokens || [];
  }

  public addFcmToken(token: string, userAgent?: string): FcmTokenItem {
    if (!this.data.fcmTokens) {
      this.data.fcmTokens = [];
    }

    const existingIdx = this.data.fcmTokens.findIndex(
      item => item.token === token
    );

    if (existingIdx !== -1) {
      this.data.fcmTokens[existingIdx] = {
        ...this.data.fcmTokens[existingIdx],
        userAgent,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.fcmTokens[existingIdx];
    }

    const newToken: FcmTokenItem = {
      id: `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      token,
      userAgent,
      createdAt: new Date().toISOString()
    };

    this.data.fcmTokens.push(newToken);
    this.save();
    return newToken;
  }

  public deleteFcmToken(tokenOrId: string): boolean {
    if (!this.data.fcmTokens) return false;

    const initialLen = this.data.fcmTokens.length;

    this.data.fcmTokens = this.data.fcmTokens.filter(
      item => item.id !== tokenOrId && item.token !== tokenOrId
    );

    if (this.data.fcmTokens.length !== initialLen) {
      this.save();
      return true;
    }

    return false;
  }

  // Push Notifications (Phoenix style real-time alerts)
  public getNotifications(limit: number = 50): AppNotification[] {
    return (this.data.notifications || []).slice(0, limit);
  }

  public getNotificationById(id: string): AppNotification | undefined {
    return (this.data.notifications || []).find(n => n.id === id);
  }

  public createNotification(data: Partial<AppNotification>): AppNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Alerta Nexora USA',
      body: data.body || '',
      newsId: data.newsId,
      newsSlug: data.newsSlug,
      categoryName: data.categoryName,
      imageUrl: data.imageUrl,
      isBreaking: Boolean(data.isBreaking),
      type: data.type || (data.isBreaking ? 'breaking_news' : 'new_article'),
      sentAt: data.sentAt || new Date().toISOString(),
      deliveredCount: this.data.pushSubscriptions && this.data.pushSubscriptions.length > 0 
        ? Math.max(this.data.pushSubscriptions.length, 120) 
        : (this.data.subscribers ? this.data.subscribers.length + 45 : 120),
      clickUrl: data.clickUrl || (data.newsSlug ? `/noticia/${data.newsSlug}` : '/')
    };

    this.data.notifications.unshift(newNotif);
    // Retain up to 100 recent notifications in history
    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }
    this.save();
    return newNotif;
  }

  public createNotificationLocalOnly(data: Partial<AppNotification>): AppNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title || 'Alerta Nexora USA',
      body: data.body || '',
      newsId: data.newsId,
      newsSlug: data.newsSlug,
      categoryName: data.categoryName,
      imageUrl: data.imageUrl,
      isBreaking: Boolean(data.isBreaking),
      type: data.type || (data.isBreaking ? 'breaking_news' : 'new_article'),
      sentAt: data.sentAt || new Date().toISOString(),
      deliveredCount: this.data.pushSubscriptions && this.data.pushSubscriptions.length > 0
        ? Math.max(this.data.pushSubscriptions.length, 120)
        : (this.data.subscribers ? this.data.subscribers.length + 45 : 120),
      clickUrl: data.clickUrl || (data.newsSlug ? `/noticia/${data.newsSlug}` : '/')
    };

    this.data.notifications.unshift(newNotif);

    if (this.data.notifications.length > 100) {
      this.data.notifications = this.data.notifications.slice(0, 100);
    }

    this.saveLocalOnly();
    return newNotif;
  }

  public deleteNotification(id: string): boolean {
    if (!this.data.notifications) return false;
    const initialLen = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    if (this.data.notifications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public deleteAllNotifications(): number {
    if (!this.data.notifications) return 0;
    const count = this.data.notifications.length;
    this.data.notifications = [];
    this.save();
    return count;
  }

  // Push Subscriptions
  public getPushSubscriptions(): PushSubscriptionItem[] {
    return this.data.pushSubscriptions || [];
  }

  public addPushSubscription(subData: { endpoint: string; keys?: { p256dh?: string; auth?: string }; userAgent?: string }): PushSubscriptionItem {
    if (!this.data.pushSubscriptions) {
      this.data.pushSubscriptions = [];
    }

    const existingIdx = this.data.pushSubscriptions.findIndex(s => s.endpoint === subData.endpoint);
    if (existingIdx !== -1) {
      this.data.pushSubscriptions[existingIdx] = {
        ...this.data.pushSubscriptions[existingIdx],
        ...subData
      };
      this.save();
      return this.data.pushSubscriptions[existingIdx];
    }

    const newSub: PushSubscriptionItem = {
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      endpoint: subData.endpoint,
      keys: subData.keys,
      userAgent: subData.userAgent,
      createdAt: new Date().toISOString()
    };

    this.data.pushSubscriptions.push(newSub);
    this.save();
    return newSub;
  }

  public deletePushSubscription(endpointOrId: string): boolean {
    if (!this.data.pushSubscriptions) return false;
    const initialLen = this.data.pushSubscriptions.length;
    this.data.pushSubscriptions = this.data.pushSubscriptions.filter(
      s => s.id !== endpointOrId && s.endpoint !== endpointOrId
    );
    if (this.data.pushSubscriptions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseManager();
