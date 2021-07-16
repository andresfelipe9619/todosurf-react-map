import React, { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
} from "react-leaflet";
import MAP_OPTIONS, { TILE_LAYER, TILE_LAYER_CONFIG } from "./map.options";
import HeatmapLayer from "./Heatmap";
import Query from "./Query";
import VelocityLayer from "./Velocity";
import SurfingSpotsLayer from "./SurfingSpots";
import Progressbar from "../progressbar/Progressbar";
import { getSurfingSteps } from "../../api";

export default function Map() {
  const [center, setCenter] = useState(null);
  const [step, setStep] = useState(0);
  const [heatmapData, setHeatmapData] = useState([]);
  const controlRef = useRef(null);

  useEffect(() => {
    (async () => {
      let data = await getHeatmapData(step);
      setHeatmapData(data);
    })();
  }, [step]);

  const mapProps = {
    step,
    setStep,
    controlRef,
  };

  return (
    <MapContainer
      scrollWheelZoom
      className="map"
      {...MAP_OPTIONS}
      center={center || MAP_OPTIONS.center}
    >
      <Query setCenter={setCenter} />
      <Progressbar {...mapProps} />
      <LayersControl position="topright" ref={controlRef}>
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer url={TILE_LAYER} {...TILE_LAYER_CONFIG} />
        </LayersControl.BaseLayer>
        <MapConsumer>
          {(map) => {
            return (
              <>
                <HeatmapLayer {...mapProps} data={heatmapData} map={map} />
                <VelocityLayer {...mapProps} map={map} />
                <SurfingSpotsLayer {...mapProps} map={map} />
              </>
            );
          }}
        </MapConsumer>
      </LayersControl>
    </MapContainer>
  );
}

async function getHeatmapData(step) {
  const surfingStep = await getSurfingSteps(step);
  surfingStep.features.map((f) => ({
    value: f?.properties?.wave_height,
    radius: 0.4,
    x: f?.geometry?.coordinates[1],
    y: f?.geometry?.coordinates[0],
  }));
}
