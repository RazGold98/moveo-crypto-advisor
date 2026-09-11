import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

type CoinPrice = { usd: number; usd_24h_change: number };
type NewsItem = { title: string; url: string; source: string };
type CryptoCompareNews = {
  Data: {
    title: string;
    url: string;
    source?: string;
    source_info?: { name: string };
  }[];
};
type GroqResponse = {
  choices: { message: { content: string } }[];
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly fallbackNews: NewsItem[] = [
    {
      title: 'Bitcoin holds steady as markets await key economic data',
      url: 'https://www.coindesk.com',
      source: 'Market Update',
    },
    {
      title: 'Ethereum network activity climbs amid growing DeFi usage',
      url: 'https://www.coindesk.com',
      source: 'Market Update',
    },
    {
      title: 'Institutional interest in crypto continues to grow',
      url: 'https://www.coindesk.com',
      source: 'Market Update',
    },
  ];

  async getCoinPrices(coinIds: string[]) {
    const ids = coinIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const response = await firstValueFrom(
      this.httpService.get<Record<string, CoinPrice>>(url),
    );
    return response.data;
  }

  async getMarketNews(): Promise<NewsItem[]> {
    const apiKey = this.configService.get<string>('NEWS_API_KEY');
    if (!apiKey) {
      return this.fallbackNews;
    }

    try {
      const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${apiKey}`;
      const response = await firstValueFrom(
        this.httpService.get<CryptoCompareNews>(url),
      );

      return response.data.Data.slice(0, 8).map((item) => ({
        title: item.title,
        url: item.url,
        source: item.source_info?.name ?? item.source ?? 'CryptoCompare',
      }));
    } catch {
      return this.fallbackNews;
    }
  }
  async getAiInsight(preferences: {
    assets: string[];
    investorType: string;
    contentTypes: string[];
  }): Promise<string> {
    const assets = preferences.assets.length
      ? preferences.assets.join(', ')
      : 'the crypto market';
    const investorType = preferences.investorType || 'crypto investor';

    const fallback = `As a ${investorType} following ${assets}, stay focused on your long-term strategy and avoid emotional decisions during short-term volatility.`;

    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      return fallback;
    }

    try {
      const prompt = `You are a crypto advisor. Write a short, practical daily insight (2-3 sentences, plain text, no markdown or headings) for a ${investorType} interested in ${assets}. Be encouraging and specific.`;

      const response = await firstValueFrom(
        this.httpService.post<GroqResponse>(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
            temperature: 0.8,
          },
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );

      return response.data.choices[0]?.message?.content?.trim() ?? fallback;
    } catch {
      return fallback;
    }
  }
  private readonly fallbackMeme = {
    title: 'When you buy the dip and it dips again',
    url: 'https://placehold.co/600x400?text=Crypto+Meme',
  };

  async getMeme(): Promise<{ title: string; url: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ title: string; url: string }>(
          'https://meme-api.com/gimme/cryptocurrencymemes',
        ),
      );
      return { title: response.data.title, url: response.data.url };
    } catch {
      return this.fallbackMeme;
    }
  }
  private readonly symbolToId: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
    ADA: 'cardano',
    XRP: 'ripple',
    DOGE: 'dogecoin',
    BNB: 'binancecoin',
    DOT: 'polkadot',
    AVAX: 'avalanche-2',
    LTC: 'litecoin',
    LINK: 'chainlink',
    MATIC: 'matic-network',
  };

  private mapAssetsToIds(assets: string[]): string[] {
    if (!assets.length) {
      return ['bitcoin', 'ethereum'];
    }
    return assets.map(
      (a) => this.symbolToId[a.toUpperCase()] ?? a.toLowerCase(),
    );
  }

  async getDashboard(preferences: {
    assets: string[];
    investorType: string;
    contentTypes: string[];
  }) {
    const coinIds = this.mapAssetsToIds(preferences.assets);

    const [prices, news, insight, meme] = await Promise.all([
      this.getCoinPrices(coinIds),
      this.getMarketNews(),
      this.getAiInsight(preferences),
      this.getMeme(),
    ]);

    return { prices, news, insight, meme };
  }
}
