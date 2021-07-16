import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

let urlParams = new URLSearchParams(window.location.search);

export default function Query({ setCenter }) {
  const map = useMap();
  useEffect(() => {
    const zoom = urlParams.get("zoom");
    const coords = urlParams.get("center");
    if (!coords) return;
    const [lat, lon] = coords.trim().split(",");
    const hasCoords = !!lat && !!lon;
    console.log(`{lat, lon}`, { lat, lon });
    let center;
    if (hasCoords) center = new L.LatLng(lat, lon);
    setCenter(center);
    if (zoom && hasCoords) {
      let mapBounds = map.getBounds();
      let maxBounds = mapBounds.pad(0.1);
      map.setMaxBounds(maxBounds);
    }
    //eslint-disable-next-line
  }, [map]);

  return <div></div>;
}
