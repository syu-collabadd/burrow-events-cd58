import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Event } from '../../types'
import { getCategoryMeta } from '../../types'

interface MapViewProps {
  events: Event[]
  selectedEvent: Event | null
  onEventSelect: (event: Event) => void
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

export function MapView({ events, selectedEvent, onEventSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    if (!MAPBOX_TOKEN) {
      // Show placeholder when token is missing
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.006, 40.7128], // NYC default
      zoom: 12,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }), 'bottom-right')

    mapRef.current = map

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  const createMarkerEl = useCallback((event: Event, isActive: boolean) => {
    const meta = getCategoryMeta(event.category)
    const el = document.createElement('div')
    el.className = `event-pin ${isActive ? 'active' : ''}`
    el.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 4px;
      transform: rotate(-45deg);
      background: ${meta.color};
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px ${meta.color}66;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    `
    const inner = document.createElement('div')
    inner.style.cssText = 'transform: rotate(45deg); font-size: 14px; line-height: 1;'
    inner.textContent = meta.emoji
    el.appendChild(inner)

    if (isActive) {
      el.style.transform = 'rotate(-45deg) scale(1.3)'
      el.style.boxShadow = `0 6px 20px ${meta.color}99`
    }

    return el
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onLoad = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current.clear()

      events.forEach(event => {
        const isActive = selectedEvent?.id === event.id
        const el = createMarkerEl(event, isActive)

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([event.longitude, event.latitude])
          .addTo(map)

        el.addEventListener('click', () => onEventSelect(event))
        markersRef.current.set(event.id, marker)
      })
    }

    if (map.isStyleLoaded()) {
      onLoad()
    } else {
      map.once('load', onLoad)
    }
  }, [events, createMarkerEl, onEventSelect])

  // Update active marker styling
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const event = events.find(e => e.id === id)
      if (!event) return
      const el = marker.getElement()
      const isActive = selectedEvent?.id === id
      const meta = getCategoryMeta(event.category)
      if (isActive) {
        el.style.transform = 'rotate(-45deg) scale(1.3)'
        el.style.boxShadow = `0 6px 20px ${meta.color}99`
        el.style.zIndex = '10'
      } else {
        el.style.transform = 'rotate(-45deg)'
        el.style.boxShadow = `0 4px 12px ${meta.color}66`
        el.style.zIndex = '1'
      }
    })

    if (selectedEvent && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedEvent.longitude, selectedEvent.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 13),
        duration: 600,
        offset: [0, -80],
      })
    }
  }, [selectedEvent, events])

  if (!MAPBOX_TOKEN) {
    return (
      <div ref={containerRef} className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <span className="text-3xl">🗺️</span>
        </div>
        <div>
          <h3 className="text-slate-200 font-semibold mb-1">Mapbox token required</h3>
          <p className="text-slate-500 text-sm max-w-xs">
            Add your <code className="text-teal-400 bg-slate-900 px-1 rounded">VITE_MAPBOX_TOKEN</code> to the{' '}
            <code className="text-teal-400 bg-slate-900 px-1 rounded">.env</code> file to enable the interactive map.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Get a free token at mapbox.com
          </p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
