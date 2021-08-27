import { useEffect } from "react";
import { Marker, Popup, LayersControl } from "react-leaflet";
import { getSurfingSpots } from "../../../api";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { GiSurfBoard } from "react-icons/gi";
import { getControlTitle } from "../Control";
import icon from "./icon";

export default function SurfingSpots({
  map,
  showBar,
  singleSpot,
  surfingSpots,
  setSurfingSpots,
}) {
  const layerName = getControlTitle("Spots", GiSurfBoard);

  useEffect(() => {
    if (!map || singleSpot) return;
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
    //eslint-disable-next-line
  }, [map, singleSpot]);

  const popupOptions = {
    closeButton: false,
    className: "custom",
    autoClose: true,
  };

  let content = (
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
  );

  if (!showBar) return content;

  return (
    <LayersControl.Overlay checked name={layerName}>
      {content}
    </LayersControl.Overlay>
  );
}

function mapSpotCoords(spot) {
  return {
    ...spot.properties,
    position: spot.geometry.coordinates.reverse(),
  };
}
