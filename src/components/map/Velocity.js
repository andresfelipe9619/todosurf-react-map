import { useEffect } from "react";
import { espana } from "./espana";
import "leaflet-velocity";
import L from "leaflet";

const Velocity = ({ map, controlRef }) => {
  const layerName = "Velocity";
  useEffect(() => {
    if (!map || !controlRef) return;
    const reference = controlRef?.current;
    const velocityLayer = L.velocityLayer({ ...VELOCITY_CONFIG, data: espana });
    if (reference) reference.addOverlay(velocityLayer, layerName);
    velocityLayer.addTo(map);
    return () => velocityLayer.remove();
  }, [map, controlRef]);
  return null;
};

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

export default Velocity;
