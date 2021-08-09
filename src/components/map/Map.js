import React, { useRef, useState, useEffect, memo, lazy } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
} from "react-leaflet";
import MAP_OPTIONS, {
  TILE_LAYER,
  LABELS_LAYER,
  TILE_LAYER_CONFIG,
  INITIAL_STEP,
  MAX_STEP,
  HALF_STEP,
  STEPS,
} from "./map.options";

import { getWindData, getWaveData } from "../../api";

const Query = lazy(() => import("./Query"));
const Control = lazy(() => import("./Control"));
const Progressbar = lazy(() => import("../progressbar/Progressbar"));
const SurfingSpotsLayer = lazy(() => import("./layers/SurfingSpots"));
const HeatmapLayer = lazy(() => import("./layers/Heatmap"));
const VelocityLayer = lazy(() => import("./layers/Velocity"));

const concat = (data) => (prev) => prev.concat(data);

async function execParallelJob({
  start = INITIAL_STEP,
  end = HALF_STEP,
  get,
  set,
  map = (i) => i,
}) {
  const firstBundle = await Promise.all(STEPS.slice(start, end).map(get));
  set(concat(firstBundle.map(map)));
  const lastBundle = await Promise.all(STEPS.slice(end, MAX_STEP).map(get));
  set(concat(lastBundle.map(map)));
}

function Map() {
  const [windData, setWindData] = useState([]);
  const [waveData, setWaveData] = useState([]);
  const [step, setStep] = useState(INITIAL_STEP);
  const [haveQuery, sethaveQuery] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [loadingStep, setLoadingStep] = useState(null);
  const controlRef = useRef(null);

  const forecastLabels = waveData.map(([w]) => w.time);
  console.log(`forecastLabels`, forecastLabels);

  function handleNoQuery() {
    sethaveQuery(false);
  }

  async function laodProgressbarData() {
    try {
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
      setLoadingStep(null);
      setFirstLoad(false);
    }
  }

  useEffect(() => {
    const init = async () => {
      console.log(`=== INIT ===`);
      try {
        setLoadingStep("capas");
        const [wave, wind] = await Promise.all([getWaveData(), getWindData()]);
        setWaveData([mapWaveData(wave)]);
        setWindData([wind]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStep(null);
        console.log(`=== END INIT ===`);
      }
    };
    init();
  }, []);

  const mapProps = {
    step,
    setStep,
    controlRef,
    forecastLabels,
  };

  return (
    <>
      <MapContainer scrollWheelZoom className="map" {...MAP_OPTIONS}>
        <LayersControl position="topright" ref={controlRef} collapsed={false}>
          <MapConsumer>
            {(map) => {
              return (
                <>
                  <SurfingSpotsLayer {...mapProps} map={map} />;
                  {!haveQuery && (
                    <Control position="bottomleft">
                      <Progressbar
                        map={map}
                        {...mapProps}
                        firstLoad={firstLoad}
                        loadData={laodProgressbarData}
                      />
                    </Control>
                  )}
                  {!!loadingStep && (
                    <Control position="center">
                      <div className="loading-container">
                        <h2>Cargando {loadingStep || "spots"} ...</h2>
                      </div>
                    </Control>
                  )}
                  <Query loadData={handleNoQuery} />
                  {!!waveData.length && (
                    <HeatmapLayer
                      {...mapProps}
                      map={map}
                      heatmapData={waveData}
                    />
                  )}
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
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url={TILE_LAYER} {...TILE_LAYER_CONFIG} />
          </LayersControl.BaseLayer>
          <TileLayer url={LABELS_LAYER} pane="tooltipPane" />
        </LayersControl>
      </MapContainer>
    </>
  );
}

function mapWaveData(data) {
  return (data.features || []).map((f) => ({
    time: data.forecastTime,
    value: f?.properties?.wave_height,
    x: f?.geometry?.coordinates[1],
    y: f?.geometry?.coordinates[0],
  }));
}

export default memo(Map);
