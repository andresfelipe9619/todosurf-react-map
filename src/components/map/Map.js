import React, { useRef, useState, useEffect, memo } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
} from "react-leaflet";
import MAP_OPTIONS, {
  TILE_LAYER,
  TILE_LAYER_CONFIG,
  INITIAL_STEP,
  MAX_STEP,
  HALF_STEP,
  STEPS,
} from "./map.options";
import HeatmapLayer from "./layers/Heatmap";
import Query from "./Query";
import VelocityLayer from "./layers/Velocity";
import SurfingSpotsLayer from "./layers/SurfingSpots";
import Progressbar from "../progressbar/Progressbar";
import Control from "./Control";
import { getWindData, getWaveData } from "../../api";

const concat = (data) => (prev) => prev.concat(data);

const execParallelJob = async ({
  start = INITIAL_STEP,
  end = HALF_STEP,
  get,
  set,
  map = (i) => i,
}) => {
  const firstBundle = await Promise.all(STEPS.slice(start, end).map(get));
  set(concat(firstBundle.map(map)));
  const lastBundle = await Promise.all(STEPS.slice(end, MAX_STEP).map(get));
  set(concat(lastBundle.map(map)));
};

function Map() {
  const [center, setCenter] = useState(null);
  const [windData, setWindData] = useState([]);
  const [waveData, setWaveData] = useState([]);
  const [step, setStep] = useState(INITIAL_STEP);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(null);
  const controlRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      console.log(`=== INIT ===`);
      try {
        setLoadingStep("capas");
        const [wave, wind] = await Promise.all([getWaveData(), getWindData()]);
        setWaveData([mapWaveData(wave)]);
        setWindData([wind]);
        setLoadingStep("linea de tiempo");
        await Promise.all([
          execParallelJob({
            get: getWindData,
            set: setWindData,
          }),
          execParallelJob({
            get: getWaveData,
            set: setWaveData,
            map: mapWaveData,
          }),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const mapProps = {
    step,
    setStep,
    controlRef,
  };
  console.log(`loading`, loading);
  return (
    <>
      <MapContainer
        scrollWheelZoom
        className="map"
        {...MAP_OPTIONS}
        center={center || MAP_OPTIONS.center}
      >
        {!loading && (
          <Control position="bottomleft">
            <Progressbar {...mapProps} />
          </Control>
        )}
        {!!loading && (
          <Control position="center">
            <div className="loading-container">
              <h2>Cargando {loadingStep || "spots"} ...</h2>
            </div>
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
                  {!!waveData.length && (
                    <HeatmapLayer
                      {...mapProps}
                      map={map}
                      heatmapData={waveData}
                    />
                  )}
                  <SurfingSpotsLayer {...mapProps} map={map} />
                  {!!windData.length && (
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

function mapWaveData(data) {
  return (data.features || []).map((f) => ({
    value: f?.properties?.wave_height,
    x: f?.geometry?.coordinates[1],
    y: f?.geometry?.coordinates[0],
  }));
}

export default memo(Map);
