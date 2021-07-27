import React, { useRef, useState, useEffect, memo } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
} from "react-leaflet";
import MAP_OPTIONS, { TILE_LAYER, TILE_LAYER_CONFIG } from "./map.options";
import HeatmapLayer from "./layers/Heatmap";
import Query from "./Query";
import VelocityLayer from "./layers/Velocity";
import SurfingSpotsLayer from "./layers/SurfingSpots";
import Progressbar from "../progressbar/Progressbar";
import { step0 } from "./step0";
import Control from "./Control";
import { getWindData } from "../../api";
const MAX_STEP = 9;
const STEPS = [...Array(MAX_STEP)].map((_, i) => ++i);

function Map() {
  const [center, setCenter] = useState(null);
  const [windData, setWindData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [step, setStep] = useState(0);
  const controlRef = useRef(null);
  console.log(`windData`, windData);
  useEffect(() => {
    const init = async () => {
      console.log(`=== INIT ===`);
      const heatmap = mapHeatmapData();
      setHeatmapData(heatmap);
      const wind = await getWindData();
      setWindData([wind]);
      const half = Math.floor(STEPS / 2);
      const firstSteps = await Promise.all(
        STEPS.slice(0, half).map(getWindData)
      );
      setWindData((prev) => prev.concat(firstSteps));
      const lastSteps = await Promise.all(
        STEPS.slice(half, MAX_STEP).map(getWindData)
      );
      setWindData((prev) => prev.concat(lastSteps));
    };
    init();
  }, []);
  const mapProps = {
    step,
    setStep,
    controlRef,
  };

  return (
    <>
      <MapContainer
        scrollWheelZoom
        className="map"
        {...MAP_OPTIONS}
        center={center || MAP_OPTIONS.center}
      >
        {windData.length && (
          <Control position="bottomleft">
            <Progressbar {...mapProps} />
          </Control>
        )}
        <Query setCenter={setCenter} />
        <LayersControl position="topright" ref={controlRef}>
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url={TILE_LAYER} {...TILE_LAYER_CONFIG} />
          </LayersControl.BaseLayer>
          <MapConsumer>
            {(map) => {
              return (
                <>
                  {/* {heatmapData && (
                    <HeatmapLayer
                      {...mapProps}
                      map={map}
                      heatmapData={heatmapData}
                    />
                  )} */}
                  <SurfingSpotsLayer {...mapProps} map={map} />
                  {windData.length && (
                    <VelocityLayer
                      {...mapProps}
                      map={map}
                      windData={windData}
                    />
                  )}
                </>
              );
            }}
          </MapConsumer>
        </LayersControl>
      </MapContainer>
    </>
  );
}

function mapHeatmapData(step) {
  const surfingStep = step0;
  return surfingStep.features.map((f) => ({
    value: f?.properties?.wave_height,
    radius: 0.4,
    x: f?.geometry?.coordinates[1],
    y: f?.geometry?.coordinates[0],
  }));
}

export default memo(Map);
