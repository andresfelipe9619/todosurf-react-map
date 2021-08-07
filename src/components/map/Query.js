import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

let urlParams = new URLSearchParams(window.location.search);

export default function Query({ loadData }) {
  const map = useMap();
  useEffect(() => {
    const zoom = +urlParams.get("zoom");
    const coords = urlParams.get("center");
    if (!coords) return loadData();

    const [lat, lon] = coords.trim().split(",");
    const hasCoords = !!lat && !!lon;
    if (!hasCoords || !zoom) return loadData();

    const center = new L.LatLng(lat, lon);
    map.setView(center, zoom);
    const maxZoom = zoom + 2;
    const minZoom = zoom > 2 ? zoom - 2 : 1;
    const mapBounds = map.getBounds();
    const maxBounds = mapBounds.pad(0.1);
    map.setMaxBounds(maxBounds);
    map.setMaxZoom(maxZoom);
    map.setMinZoom(minZoom);

    //eslint-disable-next-line
  }, [map]);

  return <div></div>;
}
