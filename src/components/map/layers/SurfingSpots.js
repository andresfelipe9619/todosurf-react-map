import { useEffect, useState } from "react";
import { Marker, Popup, LayersControl } from "react-leaflet";
import L from "leaflet";
import { getSurfingSpots } from "../../../api";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { GiSurfBoard } from "react-icons/gi";
import { getControlTitle } from "../Control";
import icon from "./icon";
import coast from "./custom.geo.json";

export default function SurfingSpots({ map, changeBaseLayer }) {
  const layerName = getControlTitle("Spots", GiSurfBoard);
  const [surfingSpots, setSurfingSpots] = useState([]);

  useEffect(() => {
    if (!map) return;
    const loadSurfingFeatures = async () => {
      try {
        const geojson = await getSurfingSpots();
        const data = geojson.features.map(mapSpotCoords);
        setSurfingSpots(data);
      } catch (e) {
        console.log("ERROR", e);
      }
    };
    loadSurfingFeatures();
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const coastLayer = new L.geoJson(coast);

    if (changeBaseLayer) {
      console.log(`removing coast...`);
      map.removeLayer(coastLayer);
    } else {
      console.log(`adding coast...`);
      coastLayer.setStyle(getCoastStyle());
      coastLayer.addTo(map);
    }
  }, [map, changeBaseLayer]);

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
              <div className="wave-link">
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
    fillColor: "#0a0a0a",
    color: "#222222",
    fillOpacity: 1,
  };
}
