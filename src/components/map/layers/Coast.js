// import { useEffect } from "react";
// import L from "leaflet";
import coast from "./custom.geo.json";
import {GeoJSON} from "react-leaflet"
export default function CoastLayer({ map }) {
//   useEffect(() => {
//     if (!map) return;
//     const coastLayer = new L.geoJson(coast);

//       console.log(`adding coast...`);
//       coastLayer.setStyle(getCoastStyle());
//       coastLayer.addTo(map);
//   }, [map]);

  return <GeoJSON data={coast} style={getCoastStyle()}/>
}

function getCoastStyle() {
  return {
    fillColor: "#0a0a0a",
    color: "#222222",
    fillOpacity: 1,
  };
}
