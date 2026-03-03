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

export type SensorType =
  | "Optical / RGB"
  | "SAR / Radar"
  | "Hyperspectral"
  | "Multispectral"
  | "Thermal / IR"
  | "LiDAR"
  | "RF / Signals"
  | "AIS / Vessel Tracking"
  | "Weather / Atmospheric"
  | "Sonar / Acoustic"
  | "GNSS / Positioning"
  | "Video / FMV"
  | "GPR / Subsurface"
  | "Bathymetric"
  | "INS / Inertial"
  | "Water Quality"
  | "Current / Wave / Ocean"
  | "3D / Point Cloud"
  | "Emissions / GHG";

export interface FinancialInfo {
  ticker: string;
  exchange: string;
}

export interface FundingInfo {
  totalRaised?: string;
  lastRound?: string;
  valuation?: string;
  acquiredPrice?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: DomainLayer;
  capabilities: Capability[];
  sensorTypes: SensorType[];
  description: string;
  founded: number | null;
  hq: string;
  size: CompanySize;
  tags: string[];
  website: string;
  financial?: FinancialInfo;
  funding?: FundingInfo;
  marketCap?: string;
}

export interface FinancialData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
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

export const SENSOR_TYPES: SensorType[] = [
  "Optical / RGB",
  "SAR / Radar",
  "Hyperspectral",
  "Multispectral",
  "Thermal / IR",
  "LiDAR",
  "RF / Signals",
  "AIS / Vessel Tracking",
  "Weather / Atmospheric",
  "Sonar / Acoustic",
  "GNSS / Positioning",
  "Video / FMV",
  "GPR / Subsurface",
  "Bathymetric",
  "INS / Inertial",
  "Water Quality",
  "Current / Wave / Ocean",
  "3D / Point Cloud",
  "Emissions / GHG",
];

export const SENSOR_TYPE_COLORS: Record<SensorType, string> = {
  "Optical / RGB": "#f59e0b",
  "SAR / Radar": "#ef4444",
  "Hyperspectral": "#8b5cf6",
  "Multispectral": "#a855f7",
  "Thermal / IR": "#f97316",
  "LiDAR": "#10b981",
  "RF / Signals": "#ec4899",
  "AIS / Vessel Tracking": "#06b6d4",
  "Weather / Atmospheric": "#60a5fa",
  "Sonar / Acoustic": "#3b82f6",
  "GNSS / Positioning": "#14b8a6",
  "Video / FMV": "#f43f5e",
  "GPR / Subsurface": "#78716c",
  "Bathymetric": "#2563eb",
  "INS / Inertial": "#64748b",
  "Water Quality": "#22d3ee",
  "Current / Wave / Ocean": "#0ea5e9",
  "3D / Point Cloud": "#84cc16",
  "Emissions / GHG": "#facc15",
};

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
