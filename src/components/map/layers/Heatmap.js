import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

const HEATMAP_CONFIG = {
  radius: 200,
  // max: 15,
  // blur: 1,
  // maxZoom: 1,
  // minOpacity: 0.5,
  // colorGradient: { 0.1: "blue", 7: "lime", 15: "red" },
};

const Heatmap = ({ map, heatmapData, controlRef }) => {
  const layerName = "Heatmap";

  useEffect(() => {
    if (!map) return;
    const reference = controlRef?.current;
    const data = (heatmapData || []).map((item) => [
      item.x,
      item.y,
      item.value,
    ]);
    const heatmapLayer = L.heatLayer(data, HEATMAP_CONFIG);
    if (reference) reference.addOverlay(heatmapLayer, layerName);
    heatmapLayer.addTo(map);

    return () => heatmapLayer.remove();
    //eslint-disable-next-line
  }, [map]);

  return null;
};

export default Heatmap;
