import React, { useEffect } from "react";
import L from "leaflet";
import { INITIAL_ZOOM } from "./map.options";
const urlParams = new URLSearchParams(window.location.search);

export function isNullishValue(value) {
  if (value === undefined) return true;
  if (value === null) return true;
  return false;
}

export function loadQueriesToMap({ map, loadData, setSurfingSpots }) {
  const coords = urlParams.get("center");
  const step = urlParams.get("step");
  const name = urlParams.get("name");
  const zoom = +urlParams.get("zoom");

  function execDefault(defaultStep = 0) {
    console.log(`Default exec...`);
    map.locate();
    return loadData({
      query: false,
      step: defaultStep,
    });
  }
  if (zoom) calculateZoom({ map, zoom });

  // We got empty query string so load the default
  if (!coords && isNullishValue(step)) return execDefault();
  // We got only step
  if (step && !coords) return execDefault(step);

  // We got coords we need to calc the zoom and bounds
  const [lat, lon] = coords.trim().split(",");
  const hasCoords = !!lat && !!lon;
  const nombre = name || "Current location";
  // If those are bad query strings we load the default
  if (!hasCoords) return execDefault();

  if (step) loadData({ step, query: true });
  calculateBounds({ map, lat, lon, zoom });
  setSurfingSpots([{ nombre, position: [lat, lon] }]);
}

export default function Query({ map, loadData, setSurfingSpots }) {
  useEffect(() => {
    loadQueriesToMap({ map, loadData, setSurfingSpots });
    //eslint-disable-next-line
  }, [map]);

  return <div></div>;
}

function calculateZoom({ map, zoom = INITIAL_ZOOM, strict = false }) {
  console.log(`Calculating Zoom...`);
  map.setZoom(zoom);
  if (strict) {
    map.setMaxZoom(zoom);
    map.setMinZoom(zoom);
  } else {
    let maxZoom = zoom + 2;
    let minZoom = zoom > 2 ? zoom - 2 : 1;
    map.setMaxZoom(maxZoom);
    map.setMinZoom(minZoom);
    console.log(`Zoom Calculated!`);
  }
}

export function calculateBounds({ map, lat, lon, zoom }) {
  console.log(`Calculating Bounds...`);
  const center = new L.LatLng(lat, lon);
  calculateZoom({ map, zoom, strict: true });
  map.setView(center);
  const centerPoint = map.project(center, zoom);
  const viewHalf = map.getSize().divideBy(2);
  const viewBounds = new L.Bounds(
    centerPoint.subtract(viewHalf),
    centerPoint.add(viewHalf)
  );
  const maxBound = map.unproject(viewBounds.max, zoom);
  const minBound = map.unproject(viewBounds.min, zoom);
  const mapBounds = new L.LatLngBounds(minBound, maxBound);
  map.setMaxBounds(mapBounds);
  console.log(`Bounds Calculated!`);
}
