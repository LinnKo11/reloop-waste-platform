"use client"

import "leaflet/dist/leaflet.css"

import L from "leaflet"
import { useEffect, useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"

import { useI18n } from "@/lib/i18n/client"

export interface MapMarker {
  id: number | string
  position: [number, number]
  color: string
  title?: string
  subtitle?: string
  href?: string
}

export interface LeafletMapProps {
  markers?: MapMarker[]
  center?: [number, number]
  zoom?: number
  /** Fit the view to all markers on first render / when they change. */
  fitToMarkers?: boolean
  selectedId?: number | string | null
  onMarkerClick?: (id: number | string) => void
  /** Location-picker mode: click the map (or drag the pin) to choose a point. */
  picked?: [number, number] | null
  onPick?: (position: [number, number]) => void
  scrollWheelZoom?: boolean
  className?: string
}

function dotIcon(color: string, selected = false) {
  const size = selected ? 22 : 16
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 0 0 ${selected ? 4 : 1}px ${color}55,0 1px 4px rgba(0,0,0,.35)"></span>`,
  })
}

const pinIcon = L.divIcon({
  className: "",
  iconSize: [30, 40],
  iconAnchor: [15, 38],
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 39s13-12.4 13-23A13 13 0 0 0 2 16c0 10.6 13 23 13 23Z" fill="#059669" stroke="white" stroke-width="2.5"/><circle cx="15" cy="16" r="5" fill="white"/></svg>`,
})

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  const key = markers.map((m) => m.id).join(",")
  useEffect(() => {
    if (!markers.length) return
    if (markers.length === 1) {
      map.setView(markers[0].position, 15)
      return
    }
    map.fitBounds(L.latLngBounds(markers.map((m) => m.position)), { padding: [40, 40], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when the set of markers changes
  }, [key, map])
  return null
}

function FlyToSelected({ markers, selectedId }: { markers: MapMarker[]; selectedId?: number | string | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedId == null) return
    const marker = markers.find((m) => m.id === selectedId)
    if (marker) map.flyTo(marker.position, Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [selectedId, markers, map])
  return null
}

function PickHandler({ onPick }: { onPick: (position: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPick([Number(e.latlng.lat.toFixed(7)), Number(e.latlng.lng.toFixed(7))])
    },
  })
  return null
}

function Recenter({ center }: { center?: [number, number] }) {
  const map = useMap()
  const lat = center?.[0]
  const lng = center?.[1]
  useEffect(() => {
    // Only move when the point is off-screen (e.g. "use my location"), not on every click.
    if (lat != null && lng != null && !map.getBounds().contains([lat, lng])) {
      map.setView([lat, lng], Math.max(map.getZoom(), 15))
    }
  }, [lat, lng, map])
  return null
}

export default function LeafletMap({
  markers = [],
  center = [16.8409, 96.1735],
  zoom = 12,
  fitToMarkers = false,
  selectedId,
  onMarkerClick,
  picked,
  onPick,
  scrollWheelZoom = true,
  className,
}: LeafletMapProps) {
  const { t } = useI18n()
  const icons = useMemo(
    () => new Map(markers.map((m) => [m.id, dotIcon(m.color, m.id === selectedId)])),
    [markers, selectedId],
  )

  return (
    <div className={`map-shell size-full overflow-hidden ${className ?? ""}`}>
      <MapContainer
        center={picked ?? center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className="size-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fitToMarkers && <FitBounds markers={markers} />}
        <FlyToSelected markers={markers} selectedId={selectedId} />
        {onPick && <PickHandler onPick={onPick} />}
        {onPick && <Recenter center={picked ?? undefined} />}

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            icon={icons.get(m.id)}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
          >
            {m.title && (
              <Popup>
                <div className="flex min-w-48 flex-col gap-1">
                  <span className="text-sm leading-snug font-semibold">{m.title}</span>
                  {m.subtitle && <span className="text-xs text-muted-foreground">{m.subtitle}</span>}
                  {m.href && (
                    <a href={m.href} className="mt-1 text-xs font-medium text-primary hover:underline">
                      {t.common.viewDetails}
                    </a>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {picked && (
          <Marker
            position={picked}
            icon={pinIcon}
            draggable={Boolean(onPick)}
            eventHandlers={{
              dragend(e) {
                const ll = (e.target as L.Marker).getLatLng()
                onPick?.([Number(ll.lat.toFixed(7)), Number(ll.lng.toFixed(7))])
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
