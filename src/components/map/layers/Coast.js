import coast from "./custom.geo.json";
import { GeoJSON } from "react-leaflet";

export default function CoastLayer() {
  return <GeoJSON data={coast} style={getCoastStyle()} />;
}

function getCoastStyle() {
  return {
    fillColor: "#0a0a0a",
    color: "#222222",
    fillOpacity: 1,
  };
}
