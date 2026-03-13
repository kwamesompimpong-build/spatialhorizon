import { NextRequest, NextResponse } from "next/server";
import type { DomainLayer, Capability, SensorType, CompanySize } from "@/data/types";

// ── Keyword maps for classification ──

const DOMAIN_KEYWORDS: Record<DomainLayer, string[]> = {
  Space: [
    "satellite", "orbit", "space", "constellation", "earth observation",
    "leo ", "geo ", "remote sensing", "spacecraft", "launch", "spaceborne",
    "earth imaging", "orbital", "cubesat", "smallsat",
  ],
  Aerial: [
    "drone", "uav", "uas", "aerial", "airborne", "aircraft", "flight",
    "aviation", "rpas", "unmanned aerial", "fixed-wing", "vtol",
    "aerial survey", "aerial mapping",
  ],
  Terrestrial: [
    "ground-based", "terrestrial", "land survey", "mobile mapping",
    "street-level", "ground truth", "field survey", "topographic",
    "cadastral", "surveying equipment", "total station", "gis",
  ],
  "Marine Surface": [
    "maritime", "vessel tracking", "marine surface", "ship", "ais",
    "coastal monitoring", "sea surface", "buoy", "port", "fleet tracking",
    "ocean surface", "naval",
  ],
  Subsea: [
    "underwater", "subsea", "submarine", "rov", "auv", "sonar",
    "seabed", "ocean floor", "deep sea", "bathymetry", "seafloor",
    "sub-sea", "hydrographic",
  ],
  "Cross-Domain": [
    "multi-domain", "cross-domain", "integrated platform", "geospatial platform",
    "full-stack", "end-to-end geospatial", "multi-source",
  ],
};

const CAPABILITY_KEYWORDS: Record<Capability, string[]> = {
  "Data Collection": [
    "data collection", "data acquisition", "capture", "survey", "imagery",
    "collect", "observe", "monitor", "sensing",
  ],
  "Data Processing": [
    "data processing", "pipeline", "orthorectif", "calibration", "correction",
    "georeferenc", "mosaic", "pre-processing", "radiometric",
  ],
  "Analytics & AI": [
    "analytics", "artificial intelligence", " ai ", "machine learning",
    "deep learning", "detection", "classification", "computer vision",
    "neural network", "predictive", "insight", "pattern recognition",
  ],
  "Platform / Infrastructure": [
    "platform", "cloud", "infrastructure", "saas", " api", "marketplace",
    "data management", "data lake", "archive", "distribution",
  ],
  "Hardware / Sensors": [
    "hardware", "sensor", "camera", "instrument", "antenna", "receiver",
    "payload", "detector", "spectrometer", "imager", "transponder",
  ],
  "Mapping & Visualization": [
    "mapping", "visualization", "gis", "3d model", "digital twin",
    "render", "display", "cartograph", "basemap", "map layer",
  ],
  "Consulting & Services": [
    "consulting", "professional service", "advisory", "training",
    "custom solution", "managed service", "integration service",
  ],
};

const SENSOR_KEYWORDS: Record<SensorType, string[]> = {
  "Optical / RGB": ["optical", "rgb", "electro-optical", "panchromatic", "visible spectrum", "color imagery"],
  "SAR / Radar": ["sar", "radar", "synthetic aperture", "microwave"],
  Hyperspectral: ["hyperspectral", "spectroscop", "spectral band", "narrow band"],
  Multispectral: ["multispectral", "multi-spectral", "ndvi", "spectral imaging"],
  "Thermal / IR": ["thermal", "infrared", " ir ", "heat signature", "swir", "mwir", "lwir"],
  LiDAR: ["lidar", "laser scanning", "point cloud", "laser altimeter", "als "],
  "RF / Signals": ["rf signal", "radio frequency", "sigint", "spectrum monitoring", "elint", "rf sensing"],
  "AIS / Vessel Tracking": ["ais", "vessel tracking", "ship tracking", "maritime tracking", "vessel identification"],
  "Weather / Atmospheric": ["weather", "atmospheric", "meteorolog", "climate", "precipitation", "wind speed"],
  "Sonar / Acoustic": ["sonar", "acoustic", "echo sound", "side-scan", "multibeam"],
  "GNSS / Positioning": ["gnss", "gps", "positioning", "rtk", "ppp", "galileo", "navigation satellite"],
  "Video / FMV": ["video", "fmv", "full motion video", "streaming video", "real-time video"],
  "GPR / Subsurface": ["ground penetrating radar", "gpr", "subsurface radar", "utility detection"],
  Bathymetric: ["bathymet", "depth measurement", "seafloor mapping", "water depth"],
  "INS / Inertial": ["inertial", "ins ", "imu", "inertial measurement", "inertial navigation"],
  "Water Quality": ["water quality", "turbidity", "chlorophyll", "dissolved oxygen", "water monitoring"],
  "Current / Wave / Ocean": ["ocean current", "wave measurement", "wave height", "tide", "current meter"],
  "3D / Point Cloud": ["point cloud", "3d scan", "3d mapping", "photogrammetry", "3d model", "3d reconstruction"],
  "Emissions / GHG": ["emission", "greenhouse gas", "ghg", "methane detection", "co2 monitoring", "carbon monitoring"],
};

// ── HTML parsing helpers ──

function extractMeta(html: string, name: string): string {
  // Match <meta name="..." content="..."> or <meta property="..." content="...">
  const pattern = new RegExp(
    `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']*)["']`,
    "i"
  );
  const altPattern = new RegExp(
    `<meta\\s+content=["']([^"']*)["']\\s+(?:name|property)=["']${name}["']`,
    "i"
  );
  return pattern.exec(html)?.[1] || altPattern.exec(html)?.[1] || "";
}

function extractTitle(html: string): string {
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return match?.[1]?.trim() || "";
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else {
        results.push(parsed);
      }
    } catch {
      // skip malformed JSON-LD
    }
  }
  return results;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Classification logic ──

function classifyByKeywords<T extends string>(
  text: string,
  keywordMap: Record<T, string[]>,
  threshold: number = 1
): T[] {
  const lower = text.toLowerCase();
  const matches: { key: T; score: number }[] = [];

  for (const [key, keywords] of Object.entries(keywordMap) as [T, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      // Count occurrences (capped at 3 per keyword to avoid over-weighting)
      const regex = new RegExp(kw.trim(), "gi");
      const count = (lower.match(regex) || []).length;
      score += Math.min(count, 3);
    }
    if (score >= threshold) {
      matches.push({ key, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).map((m) => m.key);
}

function extractFoundedYear(text: string): number | null {
  // Look for patterns like "Founded in 2015", "Established 2010", "Since 2018", "est. 2012"
  const patterns = [
    /(?:founded|established|est\.?|since|started|launched|incorporated)\s*(?:in\s+)?(\d{4})/i,
    /(\d{4})\s*[-–]\s*present/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1950 && year <= new Date().getFullYear()) return year;
    }
  }
  return null;
}

function extractHqLocation(text: string, jsonLd: Record<string, unknown>[]): string {
  // Try JSON-LD first
  for (const item of jsonLd) {
    const address = item.address as Record<string, string> | undefined;
    if (address) {
      const city = address.addressLocality || "";
      const region = address.addressRegion || "";
      const country = address.addressCountry || "";
      if (city) {
        return `${city}${region ? ", " + region : ""}${!region && country ? ", " + country : ""}`;
      }
    }
  }

  // Look for common patterns in text
  const hqPatterns = [
    /(?:headquartered|based|hq|headquarters|head office)\s+(?:in|at|:)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][A-Za-z\s]+)/,
    /(?:headquarters|head office|main office):\s*([A-Z][a-zA-Z\s]+,\s*[A-Z][A-Za-z\s]+)/i,
  ];
  for (const pattern of hqPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].trim().replace(/\s+/g, " ").slice(0, 60);
    }
  }

  return "";
}

function guessCompanySize(text: string): CompanySize {
  const lower = text.toLowerCase();
  const enterpriseSignals = [
    "fortune 500", "global leader", "publicly traded", "ipo", "nasdaq", "nyse",
    "billion", "10,000", "20,000", "50,000", "enterprise", "worldwide offices",
  ];
  const growthSignals = [
    "series b", "series c", "series d", "series e", "rapid growth", "scaling",
    "expanding", "100+", "200+", "500+", "growing team",
  ];

  let enterpriseScore = 0;
  let growthScore = 0;
  for (const s of enterpriseSignals) {
    if (lower.includes(s)) enterpriseScore++;
  }
  for (const s of growthSignals) {
    if (lower.includes(s)) growthScore++;
  }

  if (enterpriseScore >= 2) return "Enterprise";
  if (growthScore >= 2) return "Growth";
  if (enterpriseScore >= 1) return "Growth";
  return "Startup";
}

function extractTags(text: string): string[] {
  const tagKeywords = [
    "defense", "agriculture", "forestry", "mining", "oil and gas", "energy",
    "insurance", "urban planning", "climate", "sustainability", "disaster",
    "emergency", "logistics", "construction", "real estate", "telecommunications",
    "environmental", "intelligence", "security", "government", "commercial",
    "precision agriculture", "smart city", "autonomous", "carbon",
    "infrastructure monitoring", "supply chain", "finance", "fishing",
  ];

  const lower = text.toLowerCase();
  return tagKeywords.filter((tag) => lower.includes(tag)).slice(0, 8);
}

function cleanCompanyName(title: string, url: string): string {
  // Try to get a clean company name from the page title
  // Remove common suffixes like "| Home", "- Official Site", etc.
  let name = title
    .split(/\s*[|\-–—:]\s*/)[0]
    .trim();

  // If title was empty or too generic, try the domain name
  if (!name || name.length < 2 || name.toLowerCase() === "home") {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      name = hostname.split(".")[0];
      // Capitalize first letter
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      name = "";
    }
  }

  return name;
}

function buildDescription(
  metaDescription: string,
  ogDescription: string,
  text: string
): string {
  // Prefer OG description, then meta description
  const desc = ogDescription || metaDescription;
  if (desc && desc.length >= 30) return desc.slice(0, 300);

  // Fall back to first meaningful paragraph from page text
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 40);
  if (sentences.length > 0) {
    return sentences.slice(0, 2).join(". ").trim().slice(0, 300) + ".";
  }

  return desc || "";
}

// ── Also try to fetch /about page for more context ──

async function fetchAboutPage(baseUrl: string): Promise<string> {
  const aboutPaths = ["/about", "/about-us", "/company", "/about/"];
  for (const path of aboutPaths) {
    try {
      const url = new URL(path, baseUrl).toString();
      const res = await fetch(url, {
        headers: { "User-Agent": "SpatialHorizon-Bot/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const html = await res.text();
        return stripHtml(html).slice(0, 5000);
      }
    } catch {
      // continue to next path
    }
  }
  return "";
}

// ── Main handler ──

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // Validate URL
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch the main page
    let html: string;
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": "SpatialHorizon-Bot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch website (HTTP ${res.status})` },
          { status: 502 }
        );
      }

      html = await res.text();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Could not reach website: ${message}` },
        { status: 502 }
      );
    }

    // Extract structured data
    const title = extractTitle(html);
    const metaDescription = extractMeta(html, "description");
    const ogTitle = extractMeta(html, "og:title");
    const ogDescription = extractMeta(html, "og:description");
    const ogSiteName = extractMeta(html, "og:site_name");
    const jsonLd = extractJsonLd(html);

    // Get clean text from main page
    const mainText = stripHtml(html).slice(0, 10000);

    // Also fetch about page for richer context
    const aboutText = await fetchAboutPage(normalizedUrl);

    // Combined text for analysis
    const combinedText = `${mainText} ${aboutText}`;

    // Extract company info
    const name = cleanCompanyName(ogSiteName || ogTitle || title, normalizedUrl);
    const description = buildDescription(metaDescription, ogDescription, combinedText);
    const founded = extractFoundedYear(combinedText);
    const hq = extractHqLocation(combinedText, jsonLd);
    const size = guessCompanySize(combinedText);
    const tags = extractTags(combinedText);

    // Classify into spatial data taxonomy
    const domains = classifyByKeywords(combinedText, DOMAIN_KEYWORDS, 2);
    const domain: DomainLayer = domains[0] || "Cross-Domain";

    const capabilities = classifyByKeywords(combinedText, CAPABILITY_KEYWORDS, 2);
    const sensorTypes = classifyByKeywords(combinedText, SENSOR_KEYWORDS, 1);

    // Check for financial info in JSON-LD
    let ticker = "";
    let exchange = "";
    for (const item of jsonLd) {
      if (item.tickerSymbol) {
        ticker = String(item.tickerSymbol);
      }
      if (item.exchange) {
        exchange = String(item.exchange);
      }
    }

    // Also check text for ticker patterns
    if (!ticker) {
      const tickerMatch = combinedText.match(
        /(?:NYSE|NASDAQ|TSX|LSE|ASX):\s*([A-Z]{1,5})/i
      );
      if (tickerMatch) {
        ticker = tickerMatch[1];
        exchange = tickerMatch[0].split(":")[0].trim().toUpperCase();
      }
    }

    return NextResponse.json({
      name,
      domain,
      capabilities,
      sensorTypes,
      description,
      founded,
      hq,
      size,
      tags,
      website: normalizedUrl,
      ticker,
      exchange,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 }
    );
  }
}
