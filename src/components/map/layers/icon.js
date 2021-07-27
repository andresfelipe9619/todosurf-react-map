import L from "leaflet";
import marker from "./marker.png";

// export const htmlIcon = (color) => {
//   return new L.divIcon({
//     className: "custom-icon",
//     popupAnchor: [15, -10],
//   });
// };

const icon = (color = "blue") => {
  return new L.Icon({
    iconUrl: marker,
    iconSize: [60, 70],
    shadowSize: [50, 50],
    iconAnchor: [22, 70],
    shadowAnchor: [4, 50],
    popupAnchor: [4, -60],
  });
};
export default icon;
