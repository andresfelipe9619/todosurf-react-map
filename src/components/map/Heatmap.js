import { useEffect } from "react";
import HeatmapOverlay from "leaflet-heatmap";

const HEATMAP_CONFIG = {
  maxOpacity: 0.8,
  scaleRadius: true,
  useLocalExtrema: true,
  latField: "x",
  lngField: "y",
  valueField: "value",
};

const Heatmap = ({ data, map, controlRef }) => {
  const layerName = "Heatmap";
  console.log(`data`, data);

  useEffect(() => {
    if (!map) return;
    const reference = controlRef?.current;
    const heatmapLayer = new HeatmapOverlay(HEATMAP_CONFIG);
    heatmapLayer.setData({
      max: 100,
      data,
    });
    if (reference) reference.addOverlay(heatmapLayer, layerName);

    heatmapLayer.addTo(map);
    return () => heatmapLayer.remove();
    //eslint-disable-next-line
  }, [map]);
  return null;
};

export default Heatmap;
