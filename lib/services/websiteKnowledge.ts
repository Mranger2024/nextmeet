/**
 * Website Knowledge Service
 * 
 * This service manages the website content knowledge base for the AI chatbot.
 * It provides functions to index website content, store it in a structured format,
 * and retrieve relevant information based on user queries.
 */

import { supabase } from '../supabase';

// Define types for website content
interface WebsiteContent {
  id: string;
  path: string;
  title: string;
  content: string;
  lastUpdated: string;
  type: 'page' | 'feature' | 'faq' | 'pricing' | 'other';
  metadata?: Record<string, unknown>;
}

interface SearchResult {
  content: WebsiteContent;
  relevance: number;
}

/**
 * Class to manage website knowledge for the AI chatbot
 */
export class WebsiteKnowledge {
  private static instance: WebsiteKnowledge;
  private contentCache: Map<string, WebsiteContent> = new Map();
  private lastIndexed: Date | null = null;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): WebsiteKnowledge {
    if (!WebsiteKnowledge.instance) {
      WebsiteKnowledge.instance = new WebsiteKnowledge();
    }
    return WebsiteKnowledge.instance;
  }
  
  /**
   * Initialize the knowledge base
   */
  public async initialize(): Promise<void> {
    await this.loadContentFromDatabase();
    
    // If no content is available or it's been more than a day since last indexing
    if (this.contentCache.size === 0 || this.shouldReindex()) {
      await this.indexWebsiteContent();
    }
  }
  
  /**
   * Load content from the database into memory cache
   */
  private async loadContentFromDatabase(): Promise<void> {
    try {
      // First check if table exists and we have proper permissions
      const { error: tableError } = await supabase
        .from('website_content')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('Error accessing website_content table:', tableError);
        throw new Error('Database access error: ' + tableError.message);
      }

      const { data, error } = await supabase
        .from('website_content')
        .select('*');
      
      if (error) {
        console.error('Error loading website content:', error);
        throw new Error('Failed to load content: ' + error.message);
      }
      
      if (data && data.length > 0) {
        this.contentCache.clear();
        data.forEach((item: WebsiteContent) => {
          this.contentCache.set(item.id, item);
        });
        
        // Get the most recent update timestamp
        const mostRecent = data.reduce((latest: string, item: WebsiteContent) => {
          return new Date(item.lastUpdated) > new Date(latest) ? item.lastUpdated : latest;
        }, data[0].lastUpdated);
        
        this.lastIndexed = new Date(mostRecent);
      }
    } catch (error) {
      console.error('Failed to load website content from database:', error);
    }
  }
  
  /**
   * Check if we should reindex the website content
   */
  private shouldReindex(): boolean {
    if (!this.lastIndexed) return true;
    
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now.getTime() - this.lastIndexed.getTime() > oneDayInMs;
  }
  
  /**
   * Index website content from various sources
   */
  public async indexWebsiteContent(): Promise<void> {
    try {
      // This would typically involve crawling the website or accessing a CMS API
      // For now, we'll manually define some key website information
      const websiteContent: WebsiteContent[] = [
        {
          id: 'home',
          path: '/',
          title: 'Home',
          content: 'Welcome to our subscription platform. We offer video chat, messaging, and AI assistant features.',
          lastUpdated: new Date().toISOString(),
          type: 'page'
        },
        {
          id: 'features',
          path: '/features',
          title: 'Features',
          content: 'Our platform includes group video chat, private messaging, AI assistance, and friend management.',
          lastUpdated: new Date().toISOString(),
          type: 'feature'
        },
        {
          id: 'pricing',
          path: '/pricing',
          title: 'Pricing',
          content: 'We offer free and premium subscription tiers with different feature sets and limits.',
          lastUpdated: new Date().toISOString(),
          type: 'pricing'
        },
        {
          id: 'faq-1',
          path: '/faq',
          title: 'How do I start a video chat?',
          content: 'To start a video chat, navigate to the Rooms panel in the sidebar, create a new room, and invite your friends.',
          lastUpdated: new Date().toISOString(),
          type: 'faq'
        },
        {
          id: 'faq-2',
          path: '/faq',
          title: 'How do I add friends?',
          content: 'To add friends, go to the Find Friends panel in the sidebar, search for users, and send friend requests.',
          lastUpdated: new Date().toISOString(),
          type: 'faq'
        }
      ];
      
      // Store the content in the database
      for (const content of websiteContent) {
        await this.storeContent(content);
      }
      
      this.lastIndexed = new Date();
      console.log('Website content indexed successfully');
    } catch (error) {
      console.error('Error indexing website content:', error);
    }
  }
  
  /**
   * Store a content item in the database and update the cache
   */
  private async storeContent(content: WebsiteContent): Promise<void> {
    try {
      // Validate content before storing
      if (!content.id || !content.title || !content.content) {
        throw new Error('Invalid content: missing required fields');
      }

      // Store in database with retry logic
      let retries = 3;
      let error;

      while (retries > 0) {
        const result = await supabase
          .from('website_content')
          .upsert(content, { onConflict: 'id' });
        
        if (!result.error) {
          break;
        }

        error = result.error;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (error) {
        console.error('Error storing content after retries:', error);
        throw new Error('Failed to store content: ' + error.message);
      }
      
      // Update cache
      this.contentCache.set(content.id, content);
    } catch (error) {
      console.error('Failed to store content:', error);
    }
  }
  
  /**
   * Search for relevant content based on a query
   */
  public async searchContent(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryTerms = query.toLowerCase().split(' ');
    
    // Simple relevance scoring based on term matching
    for (const content of this.contentCache.values()) {
      let relevance = 0;
      const contentText = `${content.title} ${content.content}`.toLowerCase();
      
      for (const term of queryTerms) {
        if (term.length < 3) continue; // Skip short terms
        
        if (contentText.includes(term)) {
          // Increase relevance score based on where the term is found
          if (content.title.toLowerCase().includes(term)) {
            relevance += 2; // Title matches are more relevant
          } else {
            relevance += 1; // Content matches
          }
        }
      }
      
      if (relevance > 0) {
        results.push({ content, relevance });
      }
    }
    
    // Sort by relevance score (highest first)
    return results.sort((a, b) => b.relevance - a.relevance);
  }
  
  /**
   * Get all website content
   */
  public getAllContent(): WebsiteContent[] {
    return Array.from(this.contentCache.values());
  }
  
  /**
   * Get content by ID
   */
  public getContentById(id: string): WebsiteContent | undefined {
    return this.contentCache.get(id);
  }
  
  /**
   * Get content by path
   */
  public getContentByPath(path: string): WebsiteContent | undefined {
    return Array.from(this.contentCache.values()).find(content => content.path === path);
  }
  
  /**
   * Get all FAQs
   */
  public getFAQs(): WebsiteContent[] {
    return Array.from(this.contentCache.values())
      .filter(content => content.type === 'faq');
  }
  
  /**
   * Get all features
   */
  public getFeatures(): WebsiteContent[] {
    return Array.from(this.contentCache.values())
      .filter(content => content.type === 'feature');
  }
  
  /**
   * Add or update website content
   */
  public async updateContent(content: WebsiteContent): Promise<void> {
    await this.storeContent({
      ...content,
      lastUpdated: new Date().toISOString()
    });
  }
}

// Export a singleton instance
export const websiteKnowledge = WebsiteKnowledge.getInstance();