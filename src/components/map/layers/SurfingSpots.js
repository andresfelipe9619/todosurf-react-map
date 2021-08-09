import { useEffect, useState } from "react";
import { Marker, Popup, LayersControl } from "react-leaflet";
import L from "leaflet";
import { getSurfingSpots } from "../../../api";
import coast from "./custom.geo.json";

import MarkerClusterGroup from "react-leaflet-markercluster";
import icon from "./icon";

export default function SurfingSpots({ map }) {
  const layerName = "Spots";
  const [surfingSpots, setSurfingSpots] = useState([]);

  useEffect(() => {
    if (!map) return;
    const loadSurfingFeatures = async () => {
      try {
        const geojson = await getSurfingSpots();
        const data = geojson.features.map((spot) => ({
          ...spot.properties,
          position: spot.geometry.coordinates.reverse(),
        }));

        setSurfingSpots(data);
        const coastLayer = new L.GeoJSON(coast);
        coastLayer.setStyle(function (feature) {
          return {
            fillColor: "#0e0e0e",
            color: "#222222",
            fillOpacity: 1,
          };
        });

        coastLayer.addTo(map);
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
    <LayersControl.Overlay checked name={layerName}>
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
    </LayersControl.Overlay>
  );
}
