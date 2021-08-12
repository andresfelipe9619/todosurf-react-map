import { useEffect } from "react";
import HeatmapOverlay from "leaflet-heatmap";
import { GiWaveSurfer } from "react-icons/gi";
import { getControlTitle } from "../Control";

const HEATMAP_CONFIG = {
  radius: 3,
  maxOpacity: 0.6,
  scaleRadius: true,
  useLocalExtrema: false,
  latField: "x",
  lngField: "y",
  valueField: "value",
};
const heatmapLayer = new HeatmapOverlay(HEATMAP_CONFIG);

const Heatmap = ({ map, step, heatmapData, controlRef }) => {
  const layerName = getControlTitle("Waves", GiWaveSurfer);
  const layerExists = map.hasLayer(heatmapLayer);
  const reference = controlRef?.current;
  useEffect(() => {
    if (!map || !controlRef) return;
    if (reference && !layerExists) {
      reference.addOverlay(heatmapLayer, layerName);
    }
    !layerExists && heatmapLayer.addTo(map);
    return () => layerExists && map.removeLayer(heatmapLayer);
    //eslint-disable-next-line
  }, [map, controlRef]);

  useEffect(() => {
    if (!heatmapData.length) return;
    console.log(`setting data`, step);
    if (step && layerExists) {
      map.removeLayer(heatmapLayer);
      heatmapLayer.addTo(map);
    }
    const stepData = heatmapData[step];
    console.log(`stepData`, stepData);
    heatmapLayer.setData({ data: stepData, max: 40 });
    //eslint-disable-next-line
  }, [step, heatmapData]);

  return null;
};

export default Heatmap;
