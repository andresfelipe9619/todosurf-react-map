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
        const coastLayer = new L.GeoJSON(coast);
        coastLayer.setStyle(getCoastStyle());
        coastLayer.addTo(map);

        const geojson = await getSurfingSpots();
        const data = geojson.features.map(mapSpotCoords);
        setSurfingSpots(data);
      } catch (e) {
        console.log("ERROR", e);
      }
    };
    loadSurfingFeatures();
  }, [map]);

  const popupOptions = {
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

function mapSpotCoords(spot) {
  return {
    ...spot.properties,
    position: spot.geometry.coordinates.reverse(),
  };
}

function getCoastStyle() {
  return {
    fillColor: "#0e0e0e",
    color: "#222222",
    fillOpacity: 1,
  };
}
