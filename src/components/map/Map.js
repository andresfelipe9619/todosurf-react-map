import React, { useRef, useState, useEffect, memo, lazy } from 'react'
import {
  MapContainer,
  TileLayer,
  LayersControl,
  MapConsumer,
  useMapEvents
} from 'react-leaflet'
import MAP_OPTIONS, {
  TILE_LAYER,
  MAX_ZOOM_MAP,
  LABELS_LAYER,
  TILE_LAYER_CONFIG,
  INITIAL_STEP,
  MAX_STEP,
  HALF_STEP,
  DAY_SECTIONS,
  STEPS
} from './map.options'

import { getWindData, getWaveData } from '../../api'
import Legend from './Legend'

const Query = lazy(() => import('./Query'))
const Control = lazy(() => import('./Control'))
const Progressbar = lazy(() => import('../progressbar/Progressbar'))
const SurfingSpotsLayer = lazy(() => import('./layers/SurfingSpots'))
const HeatmapLayer = lazy(() => import('./layers/Heatmap'))
const VelocityLayer = lazy(() => import('./layers/Velocity'))
const CoastLayer = lazy(() => import('./layers/Coast'))

const concat = data => prev => prev.concat(data)

async function execParallelJob ({
  start = INITIAL_STEP,
  end = HALF_STEP,
  get,
  set,
  map = i => i
}) {
  const firstBundle = await Promise.all(STEPS.slice(start, end).map(get))
  set(concat(firstBundle.map(map)))
  const lastBundle = await Promise.all(STEPS.slice(end, MAX_STEP).map(get))
  set(concat(lastBundle.map(map)))
}

function Map () {
  const [windData, setWindData] = useState([])
  const [waveData, setWaveData] = useState([])
  const [step, setStep] = useState(INITIAL_STEP)
  const [zoom, setZoom] = useState(0)
  const [haveQuery, sethaveQuery] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const [loadingStep, setLoadingStep] = useState(null)
  const [forecastLabels, setForecastLabels] = useState([])
  const controlRef = useRef(null)

  function handleNoQuery () {
    sethaveQuery(false)
  }

  async function laodProgressbarData () {
    try {
      setLoadingStep('timeline')
      await Promise.all([
        execParallelJob({
          get: getWindData,
          set: setWindData
        }),
        execParallelJob({
          get: getWaveData,
          set: setWaveData,
          map: mapWaveData
        })
      ])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingStep(null)
      setFirstLoad(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      console.log(`=== INIT ===`)
      try {
        setLoadingStep('layers')
        const [waveResponse, wind] = await Promise.all([
          getWaveData(),
          getWindData()
        ])
        const wave = mapWaveData(waveResponse)
        setWaveData([wave])
        setWindData([wind])
        const [firstWave] = wave
        console.log(`firstWave`, firstWave)
        if (!firstWave?.time) return
        const hourRange = 24 / DAY_SECTIONS
        const startDate = new Date(firstWave.time)
        const labels = [...Array(MAX_STEP + 1)].reduce((acc, _, i) => {
          let stepTime = hourRange * i
          acc.push(addHoursToDate(startDate, stepTime))
          return acc
        }, [])
        console.log(`labels`, labels)
        setForecastLabels(labels)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingStep(null)
        console.log(`=== END INIT ===`)
      }
    }
    init()
  }, [])

  const showBar = !haveQuery && !!waveData.length && windData.length
  const changeBaseLayer = zoom + 4 > MAX_ZOOM_MAP
  const heights = waveData.flatMap(w => w).map(w => w.value)
  const maxHeight = getMax(heights)
  const minHeight = getMin(heights)
  console.log(`maxHeight`, maxHeight)
  console.log(`minHeight`, minHeight)
  const mapProps = {
    step,
    setStep,
    controlRef,
    forecastLabels,
    changeBaseLayer
  }

  return (
    <>
      <MapContainer scrollWheelZoom className='map' {...MAP_OPTIONS}>
        <Query loadData={handleNoQuery} />
        <EventHandler setZoom={setZoom} />
        <LayersControl position='topright' ref={controlRef} collapsed={false}>
          <MapConsumer>
            {map => {
              return (
                <>
                  <SurfingSpotsLayer {...mapProps} map={map} />
                  {!changeBaseLayer && <CoastLayer {...mapProps} map={map} />}
                  {showBar && (
                    <Control position='bottomleft'>
                      <Progressbar
                        map={map}
                        {...mapProps}
                        firstLoad={firstLoad}
                        loadData={laodProgressbarData}
                      />
                    </Control>
                  )}
                  {!!loadingStep && (
                    <Control position='center'>
                      <div className='loading-container'>
                        <h2>Loading {loadingStep || 'spots'} ...</h2>
                      </div>
                    </Control>
                  )}
                  {!!waveData.length && (
                    <>
                      {!changeBaseLayer && (
                        <Control position='topright'>
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
              )
            }}
          </MapConsumer>
          {changeBaseLayer && (
            <TileLayer url={TILE_LAYER} {...TILE_LAYER_CONFIG} />
          )}
          <TileLayer url={LABELS_LAYER} pane='tooltipPane' />
        </LayersControl>
      </MapContainer>
    </>
  )
}

function EventHandler ({ setZoom }) {
  const mapEvents = useMapEvents({
    zoomend: () => {
      setZoom(mapEvents.getZoom())
    }
  })
  return null
}

function addHoursToDate (date, hours) {
  return new Date(new Date(date).setHours(date.getHours() + hours))
}

function getMax (array) {
  let max = array[0]
  for (let i = 1; i < array.length; i++) {
    if (array[i] > max) {
      max = array[i]
    }
  }
  return max
}

function getMin (array) {
  let min = array[0]
  for (let i = 1; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i]
    }
  }
  return min
}

function mapWaveData (data) {
  return (data.features || []).map(f => ({
    time: data.forecastTime,
    value: f?.properties?.wave_height,
    x: f?.geometry?.coordinates[1],
    y: f?.geometry?.coordinates[0]
  }))
}

export default memo(Map)
