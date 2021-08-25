import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

let urlParams = new URLSearchParams(window.location.search);

export function isNullishValue(value) {
  if (value === undefined) return true;
  if (value === null) return true;
  return false;
}

export default function Query({ loadData, setSurfingSpots }) {
  const map = useMap();
  useEffect(() => {
    const zoom = +urlParams.get("zoom");
    const coords = urlParams.get("center");
    const step = urlParams.get("step");
    const spot = urlParams.get("spot");
    const loadDefault = !coords && isNullishValue(spot);
    // We got empty query string so load the default
    if (loadDefault && isNullishValue(step)) return loadData();
    // We got only the step and no coords
    if (loadDefault && step) return loadData({ step: +step, query: true });
    console.log(`Calculating bounds and zoom...`);
    // We got coords we need to calc the zoom and bounds
    const [lat, lon] = coords.trim().split(",");
    const hasCoords = !!lat && !!lon;
    // If those are bad query strings we load the default
    if (!hasCoords || !zoom) return loadData();
    // Those are good so we can continue with the cal
    // and load the step now if have one
    if (step) loadData({ step: +step, query: true, spot });
    if (spot) {
      setSurfingSpots([{ nombre: "Current location", position: [lat, lon] }]);
    }

    const center = new L.LatLng(lat, lon);
    map.setView(center, zoom);
    const maxZoom = zoom + 2;
    const minZoom = zoom > 2 ? zoom - 2 : 1;
    const mapBounds = map.getBounds();
    const maxBounds = mapBounds.pad(0.1);
    map.setMaxBounds(maxBounds);
    map.setMaxZoom(maxZoom);
    map.setMinZoom(minZoom);
    console.log(`Bounds and zoom calculated!`);
    //eslint-disable-next-line
  }, [map]);

  return <div></div>;
}
