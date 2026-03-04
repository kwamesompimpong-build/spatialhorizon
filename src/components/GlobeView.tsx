"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import createGlobe from "cobe";
import { Company, DomainLayer, DOMAIN_COLORS } from "@/data/types";
import { HQ_COORDINATES } from "@/data/coordinates";

interface GlobeMarker {
  location: [number, number];
  size: number;
  companies: Company[];
  city: string;
}

interface MarkerPopup {
  marker: GlobeMarker;
  x: number;
  y: number;
}

function getDomainColorRGB(domain: DomainLayer): [number, number, number] {
  const hex = DOMAIN_COLORS[domain];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

// Project a lat/lng coordinate to screen position based on globe rotation
function projectToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Compute effective longitude relative to the viewer
  const effectiveLng = lngRad + phi - Math.PI;

  // Position on unit sphere (adjusted for viewer orientation)
  const sx = Math.cos(latRad) * Math.sin(effectiveLng);
  const sy = -Math.sin(latRad);
  const sz = Math.cos(latRad) * Math.cos(effectiveLng);

  // Apply theta tilt (rotation around X axis)
  const fx = sx;
  const fy = sy * Math.cos(theta) + sz * Math.sin(theta);
  const fz = -sy * Math.sin(theta) + sz * Math.cos(theta);

  // Globe fills ~90% of the canvas
  const radius = canvasWidth * 0.45;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return {
    x: fx * radius + centerX,
    y: fy * radius + centerY,
    visible: fz > 0,
  };
}

export default function GlobeView({
  companies,
  onCompanyClick,
}: {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const phiRef = useRef(0);
  const THETA = 0.25;
  const [focusedCity, setFocusedCity] = useState<string | null>(null);
  const [markerPopup, setMarkerPopup] = useState<MarkerPopup | null>(null);

  // Group companies by HQ city
  const markers: GlobeMarker[] = useMemo(() => {
    const cityMap = new Map<string, Company[]>();
    for (const c of companies) {
      const existing = cityMap.get(c.hq) || [];
      existing.push(c);
      cityMap.set(c.hq, existing);
    }

    const result: GlobeMarker[] = [];
    for (const [city, cityCompanies] of cityMap) {
      const coords = HQ_COORDINATES[city];
      if (!coords) continue;
      result.push({
        location: coords,
        size: Math.min(0.04 + cityCompanies.length * 0.012, 0.12),
        companies: cityCompanies,
        city,
      });
    }
    return result;
  }, [companies]);

  // Cities sorted by company count for the sidebar
  const sortedCities = useMemo(() => {
    return [...markers].sort((a, b) => b.companies.length - a.companies.length);
  }, [markers]);

  // Domain breakdown summary
  const domainSummary = useMemo(() => {
    const counts = new Map<DomainLayer, number>();
    for (const c of companies) {
      counts.set(c.domain, (counts.get(c.domain) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [companies]);

  const focusOnCity = useCallback(
    (city: string) => {
      const coords = HQ_COORDINATES[city];
      if (!coords) return;
      const [lat, lng] = coords;
      phiRef.current = (-lng * Math.PI) / 180 + Math.PI;
      setFocusedCity(city);
      setMarkerPopup(null);
    },
    []
  );

  // Find the nearest visible marker to a click position on the canvas
  const handleCanvasClick = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      let closestMarker: GlobeMarker | null = null;
      let closestDist = Infinity;

      for (const marker of markers) {
        const projected = projectToScreen(
          marker.location[0],
          marker.location[1],
          phiRef.current,
          THETA,
          canvasWidth,
          canvasHeight
        );

        if (!projected.visible) continue;

        const dist = Math.sqrt(
          (clickX - projected.x) ** 2 + (clickY - projected.y) ** 2
        );

        // Hit threshold scales with marker size, minimum 18px
        const threshold = Math.max(18, marker.size * canvasWidth * 0.6);

        if (dist < threshold && dist < closestDist) {
          closestDist = dist;
          closestMarker = marker;
        }
      }

      if (closestMarker) {
        if (closestMarker.companies.length === 1) {
          onCompanyClick(closestMarker.companies[0]);
        } else {
          // Show popup for cities with multiple companies
          setMarkerPopup({
            marker: closestMarker,
            x: clickX,
            y: clickY,
          });
        }
      } else {
        setMarkerPopup(null);
      }
    },
    [markers, onCompanyClick]
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 4,
      baseColor: [0.15, 0.15, 0.22],
      markerColor: [0.4, 0.45, 1],
      glowColor: [0.12, 0.12, 0.25],
      markers: markers.map((m) => ({
        location: m.location,
        size: m.size,
      })),
      onRender: (state) => {
        // Auto-rotate when not interacting
        if (pointerInteracting.current === null) {
          phiRef.current += 0.003;
        }
        state.phi = phiRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [markers]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
      {/* Globe */}
      <div className="relative">
        <div className="aspect-square max-w-[600px] mx-auto relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ contain: "layout paint size" }}
            onPointerDown={(e) => {
              pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
              pointerStartPos.current = { x: e.clientX, y: e.clientY };
              canvasRef.current!.style.cursor = "grabbing";
              setMarkerPopup(null);
            }}
            onPointerUp={(e) => {
              // Detect click (minimal movement) vs drag
              if (pointerStartPos.current) {
                const dx = e.clientX - pointerStartPos.current.x;
                const dy = e.clientY - pointerStartPos.current.y;
                if (Math.sqrt(dx * dx + dy * dy) < 5) {
                  handleCanvasClick(e.clientX, e.clientY);
                }
              }
              pointerInteracting.current = null;
              pointerStartPos.current = null;
              canvasRef.current!.style.cursor = "grab";
            }}
            onPointerOut={() => {
              pointerInteracting.current = null;
              pointerStartPos.current = null;
              if (canvasRef.current) canvasRef.current.style.cursor = "grab";
            }}
            onMouseMove={(e) => {
              if (pointerInteracting.current !== null) {
                const delta = e.clientX - pointerInteracting.current;
                pointerInteractionMovement.current = delta;
                phiRef.current += delta / 200;
                pointerInteracting.current = e.clientX;
              }
            }}
            onTouchMove={(e) => {
              if (pointerInteracting.current !== null && e.touches[0]) {
                const delta = e.touches[0].clientX - pointerInteracting.current;
                pointerInteractionMovement.current = delta;
                phiRef.current += delta / 100;
                pointerInteracting.current = e.touches[0].clientX;
              }
            }}
          />

          {/* Marker click popup */}
          {markerPopup && (
            <div
              className="absolute z-10 bg-[#0a0a1a]/95 border border-white/10 rounded-lg shadow-xl backdrop-blur-sm py-1.5 min-w-[180px] max-w-[240px]"
              style={{
                left: Math.max(90, Math.min(markerPopup.x, 510)),
                top: Math.max(10, markerPopup.y),
                transform: "translate(-50%, -100%) translateY(-10px)",
              }}
            >
              <div className="text-[10px] text-white/40 px-3 pb-1 border-b border-white/[0.06] mb-1">
                {markerPopup.marker.city}
                <span className="text-white/20 ml-1">
                  ({markerPopup.marker.companies.length})
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {markerPopup.marker.companies.map((c) => {
                  const color = DOMAIN_COLORS[c.domain];
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onCompanyClick(c);
                        setMarkerPopup(null);
                      }}
                      className="w-full text-left text-[11px] px-3 py-1.5 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white/80 truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-[10px] text-white/20 mt-1">
          Click markers on the globe to view company details
        </p>

        {/* Domain legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {domainSummary.map(([domain, count]) => (
            <div key={domain} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: DOMAIN_COLORS[domain] }}
              />
              <span className="text-[11px] text-white/50">
                {domain}{" "}
                <span className="text-white/25">({count})</span>
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">{companies.length}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">{markers.length}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Cities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">
              {new Set(markers.map((m) => {
                const parts = m.city.split(", ");
                return parts[parts.length - 1];
              })).size}
            </div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Countries</div>
          </div>
        </div>
      </div>

      {/* City list sidebar */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            HQ Locations
          </h3>
          <p className="text-[10px] text-white/25 mt-0.5">
            Click a city to explore companies
          </p>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {sortedCities.map((marker) => (
            <div
              key={marker.city}
              className={`border-b border-white/[0.03] transition-colors cursor-pointer ${
                focusedCity === marker.city
                  ? "bg-indigo-500/10"
                  : "hover:bg-white/[0.03]"
              }`}
              onClick={() => focusOnCity(marker.city)}
            >
              <div className="px-4 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/70 font-medium">
                    {marker.city}
                  </span>
                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded">
                    {marker.companies.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {marker.companies.map((c) => {
                    const color = DOMAIN_COLORS[c.domain];
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompanyClick(c);
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded border transition-all hover:brightness-125"
                        style={{
                          borderColor: `${color}33`,
                          color: `${color}cc`,
                          backgroundColor: `${color}0d`,
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
