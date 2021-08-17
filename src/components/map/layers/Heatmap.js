import { useEffect } from "react";
import HeatmapOverlay from "leaflet-heatmap";
import { GiWaveSurfer } from "react-icons/gi";
import { getControlTitle } from "../Control";
const HEATMAP_CONFIG = {
  radius: 3,
  maxOpacity: 1,
  scaleRadius: true,
  useLocalExtrema: false,
  latField: "x",
  lngField: "y",
  valueField: "value",
};
const heatmapLayer = new HeatmapOverlay(HEATMAP_CONFIG);

const Heatmap = ({
  map,
  step,
  heatmapData,
  controlRef,
  changeBaseLayer
}) => {
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
    if (step && layerExists) {
      map.removeLayer(heatmapLayer);
      heatmapLayer.addTo(map);
    }
    const stepData = heatmapData[step];
    heatmapLayer.setData({ data: stepData, max: 40 });
    //eslint-disable-next-line
  }, [step, heatmapData]);

  useEffect(() => {
    if (!map) return;
    if (changeBaseLayer) {
      map.removeLayer(heatmapLayer);
    } else {
      map.addLayer(heatmapLayer);
    }
  }, [map, changeBaseLayer]);

  return null;
};

export default Heatmap;
