"use client"

import { Crosshair, LocateFixed, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/client"

import { Map } from "./map"

/**
 * Click-to-pick map that writes `latitude` / `longitude` hidden inputs for
 * the surrounding <form>.
 */
export function LocationPicker({
  value,
  onChange,
  center,
  required = false,
  error,
}: {
  value: [number, number] | null
  onChange: (value: [number, number] | null) => void
  center: [number, number]
  required?: boolean
  error?: string
}) {
  const [locating, setLocating] = useState(false)
  const { t } = useI18n()

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error(t.picker.noGeo)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange([Number(pos.coords.latitude.toFixed(7)), Number(pos.coords.longitude.toFixed(7))])
        setLocating(false)
      },
      () => {
        toast.error(t.picker.geoFailed)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative h-72 overflow-hidden rounded-lg border ${error ? "border-destructive" : ""}`}
      >
        <Map center={center} zoom={13} picked={value} onPick={onChange} />
        {!value && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center">
            <span className="flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-medium shadow">
              <Crosshair className="size-3.5" /> {t.picker.clickToDrop}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
          <LocateFixed /> {locating ? t.picker.locating : t.picker.useMyLocation}
        </Button>
        {value ? (
          <>
            <span className="font-mono">
              {value[0].toFixed(5)}, {value[1].toFixed(5)}
            </span>
            {!required && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                <X /> {t.picker.clear}
              </Button>
            )}
          </>
        ) : (
          <span>{required ? t.picker.required : t.picker.optional}</span>
        )}
      </div>
      <input type="hidden" name="latitude" value={value?.[0] ?? ""} />
      <input type="hidden" name="longitude" value={value?.[1] ?? ""} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
