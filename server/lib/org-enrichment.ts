import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface OrganizationInfo {
  name: string;
  description: string;
  industry: string;
  subIndustry: string;
  size: string;
  country: string;
  logoUrl: string | null;
  website: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  foundedYear?: string;
  headquarters?: string;
  employeeCount?: string;
  annualRevenue?: string;
  companyType?: string;
}

export async function enrichOrganizationFromUrl(url: string): Promise<OrganizationInfo | null> {
  try {
    let domain = url;
    try {
      const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = parsedUrl.hostname.replace(/^www\./, "");
    } catch {
      domain = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at gathering publicly available information about organizations from their domain/website.
Given a domain, provide accurate information about the organization. Only include information you are confident about.
For the logo URL, try to find the official logo - common patterns include:
- https://domain.com/logo.png
- https://domain.com/images/logo.svg
- Clearbit logo API: https://logo.clearbit.com/{domain}
- Google favicon service: https://www.google.com/s2/favicons?sz=128&domain={domain}

Respond in JSON format with these fields:
- name: Company/organization name
- description: Brief description of what the company does
- industry: Primary industry (e.g., Technology, Finance, Healthcare, Manufacturing, Energy, etc.)
- subIndustry: More specific sub-industry
- size: Company size category (Startup, Small Business, Medium Enterprise, Large Enterprise, Fortune 500)
- country: Primary country of operation (full country name)
- logoUrl: Best available logo URL (prefer official logo, fallback to Clearbit)
- website: Full website URL
- socialLinks: Object with linkedin, twitter, facebook URLs if known
- foundedYear: Year founded if known
- headquarters: City, Country of headquarters
- employeeCount: Approximate employee count range (e.g., "1,000-5,000")
- annualRevenue: Approximate annual revenue range if known
- companyType: Type (Public, Private, Non-profit, Government, etc.)

If you cannot find reliable information for a field, use null.`,
        },
        {
          role: "user",
          content: `Gather information about the organization with domain: ${domain}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    
    if (!parsed.logoUrl) {
      parsed.logoUrl = `https://logo.clearbit.com/${domain}`;
    }
    
    if (!parsed.website) {
      parsed.website = `https://${domain}`;
    }

    return parsed as OrganizationInfo;
  } catch (error) {
    console.error("Error enriching organization:", error);
    return null;
  }
}

export async function fetchLogoFromUrl(url: string): Promise<string | null> {
  try {
    let domain = url;
    try {
      const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = parsedUrl.hostname.replace(/^www\./, "");
    } catch {
      domain = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    }

    // Validate domain format to prevent abuse
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainPattern.test(domain)) {
      console.error("Invalid domain format:", domain);
      return null;
    }

    // Return Clearbit logo URL directly - no server-side fetch needed
    // Clearbit is a trusted service that handles the actual logo fetching
    // This eliminates SSRF risk by not making outbound requests from our server
    return `https://logo.clearbit.com/${domain}`;
  } catch (error) {
    console.error("Error generating logo URL:", error);
    return null;
  }
}
