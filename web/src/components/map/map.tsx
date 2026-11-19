"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

import type { LeafletMapProps } from "./leaflet-map"

export type { MapMarker } from "./leaflet-map"

/** Leaflet touches `window`, so it only ever renders in the browser. */
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full min-h-48 rounded-none" />,
})

export function Map(props: LeafletMapProps) {
  return <LeafletMap {...props} />
}
