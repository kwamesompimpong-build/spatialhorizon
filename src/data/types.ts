export type DomainLayer =
  | "Space"
  | "Aerial"
  | "Terrestrial"
  | "Marine Surface"
  | "Subsea"
  | "Cross-Domain";

export type Capability =
  | "Data Collection"
  | "Data Processing"
  | "Analytics & AI"
  | "Platform / Infrastructure"
  | "Hardware / Sensors"
  | "Mapping & Visualization"
  | "Consulting & Services";

export type CompanySize = "Startup" | "Growth" | "Enterprise";

export interface Company {
  id: string;
  name: string;
  domain: DomainLayer;
  capabilities: Capability[];
  description: string;
  founded: number | null;
  hq: string;
  size: CompanySize;
  tags: string[];
  website: string;
}

export const DOMAIN_LAYERS: DomainLayer[] = [
  "Space",
  "Aerial",
  "Terrestrial",
  "Marine Surface",
  "Subsea",
  "Cross-Domain",
];

export const CAPABILITIES: Capability[] = [
  "Data Collection",
  "Data Processing",
  "Analytics & AI",
  "Platform / Infrastructure",
  "Hardware / Sensors",
  "Mapping & Visualization",
  "Consulting & Services",
];

export const DOMAIN_COLORS: Record<DomainLayer, string> = {
  Space: "#6366f1",
  Aerial: "#0ea5e9",
  Terrestrial: "#22c55e",
  "Marine Surface": "#06b6d4",
  Subsea: "#3b82f6",
  "Cross-Domain": "#a855f7",
};

export const DOMAIN_DESCRIPTIONS: Record<DomainLayer, string> = {
  Space:
    "Satellites, space-based sensors, and orbital platforms collecting Earth observation data",
  Aerial:
    "Drones, aircraft, and airborne sensors capturing high-resolution spatial data",
  Terrestrial:
    "Ground-based surveying, mapping, LiDAR, and geospatial intelligence systems",
  "Marine Surface":
    "Surface vessels, buoys, and coastal monitoring systems for ocean and waterway data",
  Subsea:
    "Underwater vehicles, sonar systems, and seabed mapping technologies",
  "Cross-Domain":
    "Platforms and analytics spanning multiple domains of the spatial data stack",
};
