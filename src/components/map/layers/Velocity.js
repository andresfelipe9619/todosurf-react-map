import { useEffect } from "react";
import "leaflet-velocity";
import L from "leaflet";

const defaultColorScale = [
  "rgb(36,104,180)",
  "rgb(60,157,194)",
  "rgb(128,205,193)",
  "rgb(151,218,168)",
  "rgb(198,231,181)",
  "rgb(238,247,217)",
  "rgb(255,238,159)",
  "rgb(252,217,125)",
  "rgb(255,182,100)",
  "rgb(252,150,75)",
  "rgb(250,112,52)",
  "rgb(245,64,32)",
  "rgb(237,45,28)",
  "rgb(220,24,32)",
  "rgb(180,0,35)",
];

const VELOCITY_CONFIG = {
  displayValues: true,
  displayOptions: {
    velocityType: "GBR Wind",
    position: "bottomright",
    emptyString: "No wind data",
    showCardinal: true,
  },
  opacity: 1,
  colorScale: defaultColorScale,
  maxVelocity: 15,
};

const velocityLayer = L.velocityLayer(VELOCITY_CONFIG);

const Wind = ({ map, controlRef, windData, step }) => {
  const layerName = "Wind";
  const layerExists = map.hasLayer(velocityLayer);
  const reference = controlRef?.current;

  console.log(`layerExists`, layerExists);
  useEffect(() => {
    if (!map || !controlRef) return;
    if (reference && !layerExists) {
      reference.addOverlay(velocityLayer, layerName);
    }
    !layerExists && velocityLayer.addTo(map);
    return () => layerExists && map.removeLayer(velocityLayer);
    //eslint-disable-next-line
  }, [map, controlRef]);

  useEffect(() => {
    if (!windData.length) return;
    console.log(`setting data`, step);
    if (step && layerExists) {
      map.removeLayer(velocityLayer);
      velocityLayer.addTo(map);
    }
    const stepData = windData[step];
    console.log(`stepData`, stepData);
    velocityLayer.setData(stepData);
    //eslint-disable-next-line
  }, [step, windData]);

  return null;
};

export default Wind;
