// Type declarations for Leaflet
declare namespace L {
  function divIcon(options: {
    className?: string;
    html?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
  }): any;
}

interface Window {
  L: typeof L;
}
