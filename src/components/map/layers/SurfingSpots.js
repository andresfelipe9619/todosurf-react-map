import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getSurfingSpots } from "../../../api";
import { coast } from "../coast";
import { spots } from "../spot";
import MarkerClusterGroup from "react-leaflet-markercluster";
import icon from "./icon";

export default function SurfingSpots({ map }) {
  const layerName = "Spots";
  const [surfingSpots, setSurfingSpots] = useState([]);

  useEffect(() => {
    if (!map) return;
    const loadSurfingFeatures = async () => {
      try {
        // const geojson = await getSurfingSpots();
        const data = spots.features.map((spot) => ({
          ...spot.properties,
          position: [
            spot.geometry.coordinates[1],
            spot.geometry.coordinates[0],
          ],
        }));

        setSurfingSpots(data);
        const coastLayer = new L.GeoJSON(coast);
        coastLayer.setStyle(function (feature) {
          return {
            fillColor: "#3d3d3c",
            color: "#555",
            fillOpacity: 1,
          };
        });

        // coastLayer.addTo(map);
      } catch (e) {
        console.log("ERROR", e);
      }
    };
    loadSurfingFeatures();
  }, [map]);

  let popupOptions = {
    closeButton: false,
    className: "custom",
    autoClose: true,
  };

  return (
    <MarkerClusterGroup>
      {surfingSpots.map((spot, i) => (
        <Marker key={i} position={spot.position} icon={icon()}>
          <Popup {...popupOptions}>
            <div class="wave-link">
              <a href={spot.enlace}>{spot.nombre}</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
