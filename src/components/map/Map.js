import React, { useRef, useState, memo, lazy } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
  useMapEvents,
} from "react-leaflet";
import MAP_OPTIONS, {
  TILE_LAYER,
  MAX_ZOOM_MAP,
  LABELS_LAYER,
  TILE_LAYER_CONFIG,
  INITIAL_STEP,
  MAX_STEP,
  HALF_STEP,
  DAY_SECTIONS,
  STEPS,
} from "./map.options";
import { isNullishValue } from "./Query";
import { getWindData, getWaveData } from "../../api";
import Legend from "./Legend";

const Query = lazy(() => import("./Query"));
const Control = lazy(() => import("./Control"));
const Progressbar = lazy(() => import("../progressbar/Progressbar"));
const SurfingSpotsLayer = lazy(() => import("./layers/SurfingSpots"));
const HeatmapLayer = lazy(() => import("./layers/Heatmap"));
const VelocityLayer = lazy(() => import("./layers/Velocity"));
const CoastLayer = lazy(() => import("./layers/Coast"));

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
  const [zoom, setZoom] = useState(0);
  const [showSpots, setShowSpots] = useState(false);
  const [haveQuery, sethaveQuery] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [loadingStep, setLoadingStep] = useState(null);
  const [forecastLabels, setForecastLabels] = useState([]);
  const [surfingSpots, setSurfingSpots] = useState([]);

  const controlRef = useRef(null);

  const init = async () => {
    try {
      setLoadingStep("layers");
      const [waveResponse, wind] = await Promise.all([
        getWaveData(),
        getWindData(),
      ]);
      const wave = mapWaveData(waveResponse);
      setWaveData([wave]);
      setWindData([wind]);
      const [firstWave] = wave;
      if (!firstWave?.time) return;
      const hourRange = 24 / DAY_SECTIONS;
      const startDate = new Date(firstWave.time);
      const labels = [...Array(MAX_STEP + 1)].reduce((acc, _, i) => {
        let stepTime = hourRange * i;
        acc.push(addHoursToDate(startDate, stepTime));
        return acc;
      }, []);
      console.log(`labels`, labels);
      setForecastLabels(labels);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStep(null);
    }
  };

  async function loadData({ step, query = false, spot = true } = {}) {
    console.log(`Loading data...`);
    sethaveQuery(query);
    if (spot) setShowSpots(spot);
    if (isNullishValue(step) && !spot) return init();
    console.log(`WIND`);
    const wind = await getWindData(step);
    setWindData([wind]);
  }

  async function laodProgressbarData() {
    try {
      setLoadingStep("timeline");
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

  const showBar = !haveQuery && !!waveData.length && windData.length;
  const changeBaseLayer = zoom + 4 > MAX_ZOOM_MAP;
  const heights = waveData.flatMap((w) => w).map((w) => w.value);
  const maxHeight = getMax(heights);
  const minHeight = getMin(heights);

  const mapProps = {
    step,
    setStep,
    controlRef,
    forecastLabels,
    changeBaseLayer,
  };

  return (
    <>
      <MapContainer scrollWheelZoom className="map" {...MAP_OPTIONS}>
        <Query loadData={loadData} setSurfingSpots={setSurfingSpots} />
        <EventHandler setZoom={setZoom} />
        <LayersControl position="topright" ref={controlRef} collapsed={false}>
          <MapConsumer>
            {(map) => {
              return (
                <>
                  {showSpots && (
                    <SurfingSpotsLayer
                      {...mapProps}
                      map={map}
                      singleSpot={surfingSpots.length === 1}
                      {...{ surfingSpots, setSurfingSpots }}
                    />
                  )}
                  {!changeBaseLayer && <CoastLayer {...mapProps} map={map} />}
                  {showBar && (
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
                        <h2>Loading {loadingStep || "spots"} ...</h2>
                      </div>
                    </Control>
                  )}
                  {!!waveData.length && (
                    <>
                      {!changeBaseLayer && (
                        <Control position="topright">
                          <Legend max={maxHeight} min={minHeight} />
                        </Control>
                      )}
                      <HeatmapLayer
                        {...mapProps}
                        map={map}
                        maxHeight={maxHeight}
                        heatmapData={waveData}
                      />
                    </>
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
          {changeBaseLayer && (
            <TileLayer url={TILE_LAYER} {...TILE_LAYER_CONFIG} noWrap />
          )}
          <TileLayer url={LABELS_LAYER} pane="tooltipPane" noWrap />
        </LayersControl>
      </MapContainer>
    </>
  );
}

function EventHandler({ setZoom }) {
  const mapEvents = useMapEvents({
    zoomend: () => {
      setZoom(mapEvents.getZoom());
    },
  });
  return null;
}

function addHoursToDate(date, hours) {
  return new Date(new Date(date).setHours(date.getHours() + hours));
}

function getMax(array) {
  let max = array[0];
  for (let i = 1; i < array.length; i++) {
    if (array[i] > max) {
      max = array[i];
    }
  }
  return max;
}

function getMin(array) {
  let min = array[0];
  for (let i = 1; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
    }
  }
  return min;
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
