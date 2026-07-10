"use client";

import { useEffect, useRef } from "react";
import type { Map, Marker } from "leaflet";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Importação dinâmica para evitar SSR
    import("leaflet").then((L) => {
      if (mapRef.current) {
        // Já inicializado — apenas reposiciona
        mapRef.current.setView([lat, lng], mapRef.current.getZoom());
        markerRef.current?.setLatLng([lat, lng]);
        return;
      }

      // Importa CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Cria mapa com tiles dark (CartoDB)
      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Ícone customizado na cor do SafraClima
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #B2D5E5;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid rgba(255,255,255,0.4);
            box-shadow: 0 3px 12px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      // Marker arrastável
      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      // Clique no mapa também reposiciona o pin
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      // Cleanup apenas quando o componente desmonta de verdade
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Só roda uma vez

  // Atualiza posição quando lat/lng mudam por fora (nova busca)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    mapRef.current.setView([lat, lng], 13, { animate: true });
    markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: "320px", borderRadius: "16px", overflow: "hidden" }}
    />
  );
}
