import React, { useState, useEffect } from 'react'
import L from 'leaflet'
import {
  FaPlay as Play,
  FaPause as Pause,
  FaReply as Reply,
  FaSpinner as Spinner
} from 'react-icons/fa'
import Slider, { createSliderWithTooltip } from 'rc-slider'
import {
  WHITE_SMOKE,
  SECONDARY,
  PRIMARY,
  MAX_STEP,
  DAY_SECTIONS
} from '../map/map.options'
import 'rc-slider/assets/index.css'
const SliderWithTooltip = createSliderWithTooltip(Slider)
const isMobile = L.Browser.mobile

export default function Progressbar ({
  map,
  step,
  setStep,
  loadData,
  forecastLabels,
  firstLoad
}) {
  const [play, setPlay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interval, setProgressInterval] = useState(null)
  const isLastStep = step === MAX_STEP

  const handleChange = (value = 0) => {
    console.log(`handle change`, value)
    setStep(value * DAY_SECTIONS)
  }

  async function start () {
    setPlay(true)
    if (isLastStep) setStep(0)
    if (firstLoad) {
      setLoading(true)
      await loadData()
      setLoading(false)
    }
    setProgressInterval(
      setInterval(async () => {
        setStep(prev => ++prev)
      }, 3000)
    )
  }

  function stop () {
    setPlay(false)
    clearInterval(interval)
  }

  function getMarks () {
    const marksCount = MAX_STEP / DAY_SECTIONS
    return [...Array(marksCount + 1)]
      .map((_, i) => i)
      .reduce((acc, mark) => {
        let item = forecastLabels[DAY_SECTIONS * mark]
        acc[mark] = (
          <strong className='mark'>
            {item ? formatDate(item, false) : ''}
          </strong>
        )
        return acc
      }, {})
  }

  useEffect(() => {
    return () => {
      interval && clearInterval(interval)
    }
  }, [interval])

  useEffect(() => {
    if (isLastStep) stop()
    //eslint-disable-next-line
  }, [step])

  const handler = isLastStep ? start : play ? stop : start
  const marks = getMarks()
  const showAction = !isLastStep && !loading
  const showDots = !firstLoad && !isMobile
  return (
    <div className='player-container card'>
      <div className='player-icon' onClick={!loading ? handler : undefined}>
        {loading && <Spinner size={20} className='icon-spin' />}
        {showAction && !play && <Play size={20} />}
        {isLastStep && <Reply size={20} />}
        {showAction && play && <Pause size={20} />}
      </div>
      <div className='player'>
        <SliderWithTooltip
          min={0}
          dots={showDots}
          disabled={!!firstLoad}
          tipFormatter={v => formatHour(forecastLabels[v * DAY_SECTIONS])}
          step={1 / DAY_SECTIONS}
          value={step / DAY_SECTIONS}
          max={MAX_STEP / DAY_SECTIONS}
          marks={marks}
          onChange={handleChange}
          dotStyle={dotStyle}
          onBeforeChange={() => map.dragging.disable()}
          onAfterChange={() => map.dragging.enable()}
          activeDotStyle={activeDotStyle}
          railStyle={{ backgroundColor: WHITE_SMOKE, height: 10 }}
          trackStyle={{ backgroundColor: PRIMARY, height: 10 }}
          handleStyle={handleStyle}
        />
      </div>
    </div>
  )
}

const longFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
}
const shortFormatOptions = {
  weekday: 'short',
  day: 'numeric'
}

const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatHour (date) {
  return new Date(date).toLocaleString('en-US', {
    hour: '2-digit',
    hour12: true
  })
}

function formatDate (date, long = true) {
  return capitalize(
    new Date(date).toLocaleString(
      'en-US',
      long ? longFormatOptions : shortFormatOptions
    )
  )
}

const dotStyle = {
  borderColor: PRIMARY,
  marginBottom: -6,
  height: 14,
  width: 14
}

const activeDotStyle = {
  background: SECONDARY,
  height: 16,
  width: 16,
  marginBottom: -7,
  marginLeft: -8
}

const handleStyle = {
  borderColor: PRIMARY,
  height: 20,
  width: 20,
  marginTop: -5,
  marginBottom: -5,
  marginRight: -8,
  backgroundColor: SECONDARY
}
