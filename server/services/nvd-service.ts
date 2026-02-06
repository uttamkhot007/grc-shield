import https from 'https';

interface CVEItem {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: Array<{ lang: string; value: string }>;
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: {
        baseScore: number;
        baseSeverity: string;
        vectorString: string;
      };
    }>;
    cvssMetricV2?: Array<{
      cvssData: {
        baseScore: number;
      };
    }>;
  };
  weaknesses?: Array<{
    description: Array<{ lang: string; value: string }>;
  }>;
  references?: Array<{
    url: string;
    source: string;
    tags?: string[];
  }>;
}

interface NVDResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  vulnerabilities: Array<{ cve: CVEItem }>;
}

export interface CVEDetails {
  id: string;
  description: string;
  published: string;
  lastModified: string;
  cvssScore: number | null;
  severity: string;
  vectorString: string | null;
  weaknesses: string[];
  references: Array<{ url: string; source: string }>;
  status: string;
}

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

class NVDService {
  private apiKey: string | null;
  private lastRequestTime: number = 0;
  private lastSuccessfulRequest: number = 0;
  private lastError: string | null = null;
  private rateLimitMs: number;

  constructor() {
    this.apiKey = process.env.NVD_API_KEY || null;
    this.rateLimitMs = this.apiKey ? 600 : 6000;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitMs) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitMs - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private makeRequest(url: string): Promise<NVDResponse> {
    return new Promise((resolve, reject) => {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'GRC-Shield-Platform/1.0'
      };
      
      if (this.apiKey) {
        headers['apiKey'] = this.apiKey;
      }

      https.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              this.lastSuccessfulRequest = Date.now();
              this.lastError = null;
              resolve(JSON.parse(data));
            } else if (res.statusCode === 403) {
              this.lastError = 'Rate limit exceeded';
              reject(new Error('Rate limit exceeded. Please wait and try again.'));
            } else {
              this.lastError = `API returned status ${res.statusCode}`;
              reject(new Error(`NVD API returned status ${res.statusCode}`));
            }
          } catch (e) {
            this.lastError = 'Failed to parse response';
            reject(new Error('Failed to parse NVD response'));
          }
        });
      }).on('error', (err) => {
        this.lastError = err.message || 'Network error';
        reject(err);
      });
    });
  }

  async searchCVE(cveId: string): Promise<CVEDetails | null> {
    await this.rateLimit();
    
    try {
      const url = `${NVD_API_BASE}?cveId=${encodeURIComponent(cveId)}`;
      const response = await this.makeRequest(url);
      
      if (response.vulnerabilities.length === 0) {
        return null;
      }

      return this.parseCVE(response.vulnerabilities[0].cve);
    } catch (error) {
      console.error(`Error fetching CVE ${cveId}:`, error);
      throw error;
    }
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<CVEDetails[]> {
    await this.rateLimit();
    
    try {
      const url = `${NVD_API_BASE}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=${limit}`;
      const response = await this.makeRequest(url);
      
      return response.vulnerabilities.map(v => this.parseCVE(v.cve));
    } catch (error) {
      console.error(`Error searching CVEs for keyword ${keyword}:`, error);
      throw error;
    }
  }

  async getRecentCVEs(limit: number = 20): Promise<CVEDetails[]> {
    await this.rateLimit();
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const pubStartDate = startDate.toISOString().split('.')[0];
      const pubEndDate = endDate.toISOString().split('.')[0];
      
      const url = `${NVD_API_BASE}?pubStartDate=${pubStartDate}&pubEndDate=${pubEndDate}&resultsPerPage=${limit}`;
      const response = await this.makeRequest(url);
      
      return response.vulnerabilities.map(v => this.parseCVE(v.cve));
    } catch (error) {
      console.error('Error fetching recent CVEs:', error);
      throw error;
    }
  }

  async getCVEsBySeverity(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', limit: number = 20): Promise<CVEDetails[]> {
    await this.rateLimit();
    
    try {
      const url = `${NVD_API_BASE}?cvssV3Severity=${severity}&resultsPerPage=${limit}`;
      const response = await this.makeRequest(url);
      
      return response.vulnerabilities.map(v => this.parseCVE(v.cve));
    } catch (error) {
      console.error(`Error fetching ${severity} CVEs:`, error);
      throw error;
    }
  }

  private parseCVE(cve: CVEItem): CVEDetails {
    const englishDesc = cve.descriptions.find(d => d.lang === 'en')?.value || 'No description available';
    
    let cvssScore: number | null = null;
    let severity = 'UNKNOWN';
    let vectorString: string | null = null;

    if (cve.metrics?.cvssMetricV31?.[0]) {
      const cvss = cve.metrics.cvssMetricV31[0].cvssData;
      cvssScore = cvss.baseScore;
      severity = cvss.baseSeverity;
      vectorString = cvss.vectorString;
    } else if (cve.metrics?.cvssMetricV2?.[0]) {
      cvssScore = cve.metrics.cvssMetricV2[0].cvssData.baseScore;
      severity = this.getSeverityFromScore(cvssScore);
    }

    const weaknesses = cve.weaknesses?.flatMap(w => 
      w.description.filter(d => d.lang === 'en').map(d => d.value)
    ) || [];

    const references = cve.references?.slice(0, 5).map(r => ({
      url: r.url,
      source: r.source
    })) || [];

    return {
      id: cve.id,
      description: englishDesc,
      published: cve.published,
      lastModified: cve.lastModified,
      cvssScore,
      severity,
      vectorString,
      weaknesses,
      references,
      status: cve.vulnStatus
    };
  }

  private getSeverityFromScore(score: number): string {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    if (score >= 0.1) return 'LOW';
    return 'NONE';
  }

  getConnectionStatus(): { 
    connected: boolean; 
    hasApiKey: boolean; 
    rateLimit: string;
    lastSuccessful: number | null;
    lastError: string | null;
  } {
    const fiveMinutes = 5 * 60 * 1000;
    const recentlySuccessful = this.lastSuccessfulRequest > 0 && 
      (Date.now() - this.lastSuccessfulRequest) < fiveMinutes;
    
    return {
      connected: recentlySuccessful || this.lastSuccessfulRequest === 0,
      hasApiKey: !!this.apiKey,
      rateLimit: this.apiKey ? '50 requests/30 seconds' : '5 requests/30 seconds',
      lastSuccessful: this.lastSuccessfulRequest || null,
      lastError: this.lastError
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.searchCVE('CVE-2021-44228');
      return true;
    } catch {
      return false;
    }
  }
}

export const nvdService = new NVDService();
