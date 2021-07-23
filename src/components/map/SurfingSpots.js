import { useEffect, useState } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getSurfingSpots } from '../../api'
import { coast } from './coast'
import MarkerClusterGroup from 'react-leaflet-markercluster'

export default function SurfingSpots ({ map }) {
  const layerName = 'Spots'
  const [surfingSpots, setSurfingSpots] = useState([])

  useEffect(() => {
    if (!map) return
    const loadSurfingFeatures = async () => {
      try {
        const geojson = await getSurfingSpots()
        const data = geojson.features.map(spot => ({
          ...spot.properties,
          position: [spot.geometry.coordinates[1], spot.geometry.coordinates[0]]
        }))

        setSurfingSpots(data)
        const coastLayer = new L.GeoJSON(coast)
        coastLayer.setStyle(function (feature) {
          return {
            fillColor: '#3d3d3c',
            color: '#555',
            fillOpacity: 1
          }
        })

        coastLayer.addTo(map)
      } catch (e) {
        console.log('ERROR', e)
      }
    }
    loadSurfingFeatures()
  }, [map])
  console.log(`surfingSpots`, surfingSpots)
  return (
    <MarkerClusterGroup>
      {surfingSpots.map(spot => (
        <Marker key={spot.name} position={spot.position} />
      ))}
    </MarkerClusterGroup>
  )
}
