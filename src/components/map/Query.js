import React, { useCallback, useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { BOUNDS } from "./map.options";
let urlParams = new URLSearchParams(window.location.search);

export function isNullishValue(value) {
  if (value === undefined) return true;
  if (value === null) return true;
  return false;
}

export default function Query({ loadData }) {
  const map = useMap();

  const execDefault = useCallback(() => {
    console.log(`Default exec...`);
    map.setMaxBounds(BOUNDS);
    return loadData();
  }, [map, loadData]);

  useEffect(() => {
    const zoom = +urlParams.get("zoom");
    const coords = urlParams.get("center");
    const step = urlParams.get("step");
    let locate = urlParams.get("locate");
    if (locate) locate = JSON.parse(locate);
    const loadDefault = !coords && isNullishValue(locate);

    // We got empty query string so load the default
    if (loadDefault && isNullishValue(step)) return execDefault();

    // We got only the step and no coords
    if (loadDefault && step) return loadData({ step, query: true, locate });

    if (locate) map.locate();
    // We got coords we need to calc the zoom and bounds
    const [lat, lon] = (coords || "").trim().split(",");
    const hasCoords = !!lat && !!lon;

    if (zoom) calculateZoom({ map, zoom });
    if (locate && !hasCoords && zoom) return loadData({ locate, query: true });
    // If those are bad query strings we load the default
    if (!hasCoords && !zoom) execDefault();

    // Those are good so we can continue with the calc
    // and load the step now if have one
    if (step) loadData({ step: +step, query: true, locate });
    calculateBounds({ map, lat, lon, zoom });
    //eslint-disable-next-line
  }, [map]);

  return <div></div>;
}

function calculateZoom({ map, zoom }) {
  console.log(`Calculating Zoom...`);
  const maxZoom = zoom + 2;
  const minZoom = zoom > 2 ? zoom - 2 : 1;
  map.setMaxZoom(maxZoom);
  map.setMinZoom(minZoom);
  console.log(`Zoom Calculated!`);
}

export function calculateBounds({ map, lat, lon, zoom }) {
  console.log(`Calculating Bounds...`);
  const center = new L.LatLng(lat, lon);
  map.setView(center, zoom);
  const centerPoint = map.project(center, zoom);
  const viewHalf = map.getSize().divideBy(2);
  const viewBounds = new L.Bounds(
    centerPoint.subtract(viewHalf),
    centerPoint.add(viewHalf)
  );
  const maxBound = map.unproject(viewBounds.max);
  const minBound = map.unproject(viewBounds.min);
  const mapBounds = new L.LatLngBounds(minBound, maxBound);
  map.setMaxBounds(mapBounds);
  console.log(`Bounds Calculated!`);
}
