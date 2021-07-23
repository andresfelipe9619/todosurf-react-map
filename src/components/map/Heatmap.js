import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.heat'

const HEATMAP_CONFIG = {
  radius: 15,
  max: 2.5,
  blur: 15,
  maxZoom: 15,
  minOpacity: 0.5,
  colorGradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
}

const Heatmap = ({ data, map, controlRef }) => {
  const layerName = 'Heatmap'

  useEffect(() => {
    if (!map) return
    const reference = controlRef?.current
    const heatmapData = data.map(item => [item.x, item.y, item.value])
    const heatmapLayer = L.heatLayer(heatmapData, HEATMAP_CONFIG)
    if (reference) reference.addOverlay(heatmapLayer, layerName)
    heatmapLayer.addTo(map)

    return () => heatmapLayer.remove()
    //eslint-disable-next-line
  }, [map])
  return null
}

export default Heatmap
