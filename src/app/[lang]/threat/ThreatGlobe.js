"use client";
import React from 'react';
import dynamic from "next/dynamic";
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function ThreatGlobe() {
  const [size, setSize] = React.useState({ width: 0, height: 300 });
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({ width: containerRef.current.clientWidth, height: 350 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const arcsData = [
    { startLat: 39.9, startLng: 116.4, endLat: 37.8, endLng: -122.4, color: 'rgba(255, 0, 0, 0.8)' },
    { startLat: 55.7, startLng: 37.6, endLat: 51.5, endLng: -0.1, color: 'rgba(255, 100, 0, 0.8)' },
    { startLat: -23.5, startLng: -46.6, endLat: 40.7, endLng: -74.0, color: 'rgba(0, 255, 255, 0.6)' },
    { startLat: 28.6, startLng: 77.2, endLat: -33.9, endLng: 151.2, color: 'rgba(255, 0, 200, 0.8)' },
  ];

  return (
    <div ref={containerRef} className="h-[350px] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950/60 backdrop-blur-xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      {size.width > 0 && (
        <Globe
          width={size.width}
          height={size.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          arcsData={arcsData}
          arcColor={() => ['#3bddff', '#ff3b3b', '#ff3bff'][Math.floor(Math.random() * 3)]}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashInitialGap={() => Math.random()}
          arcDashAnimateTime={1500}
          showAtmosphere={true}
          atmosphereColor="#10b981"
          atmosphereAltitude={0.25}
        />
      )}
    </div>
  );
}