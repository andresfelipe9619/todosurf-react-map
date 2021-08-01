import React, { useState, useEffect } from "react";
import {
  FaPlay as Play,
  FaPause as Pause,
  FaReply as Reply,
} from "react-icons/fa";
import Slider from "rc-slider";
import {
  WHITE_SMOKE,
  SECONDARY,
  PRIMARY,
  MAX_STEP,
  DAY_SECTIONS,
} from "../map/map.options";
import "rc-slider/assets/index.css";

export default function Progressbar({ step, setStep }) {
  const [play, setPlay] = useState(false);
  const [interval, setProgressInterval] = useState(null);
  const isLastStep = step === MAX_STEP;

  const handleChange = (value = 0) => {
    console.log(`handle change`, value);
    setStep(value * DAY_SECTIONS);
  };

  function start() {
    setPlay(true);
    if (isLastStep) setStep(0);
    setProgressInterval(
      setInterval(async () => {
        setStep((prev) => ++prev);
      }, 3000)
    );
  }

  function stop() {
    setPlay(false);
    clearInterval(interval);
  }

  useEffect(() => {
    return () => {
      interval && clearInterval(interval);
    };
  }, [interval]);

  useEffect(() => {
    if (isLastStep) stop();
    //eslint-disable-next-line
  }, [step]);
  const handler = isLastStep ? start : play ? stop : start;
  const marksCount = MAX_STEP / DAY_SECTIONS;
  const marks = [...Array(marksCount + 1)]
    .map((_, i) => i)
    .reduce((acc, mark) => {
      acc[mark] = <strong className="mark">Day {++mark}</strong>;
      return acc;
    }, {});
  console.log(`marks`, marks);
  return (
    <div className="player-container card">
      <div className="player-icon" onClick={handler}>
        {!isLastStep && !play && <Play size={20} />}
        {isLastStep && <Reply size={20} />}
        {!isLastStep && play && <Pause size={20} />}
      </div>
      <div className="player">
        <Slider
          min={0}
          step={1 / DAY_SECTIONS}
          value={step / DAY_SECTIONS}
          max={MAX_STEP / DAY_SECTIONS}
          marks={marks}
          onChange={handleChange}
          dotStyle={dotStyle}
          activeDotStyle={activeDotStyle}
          railStyle={{ backgroundColor: WHITE_SMOKE, height: 10 }}
          trackStyle={{ backgroundColor: PRIMARY, height: 10 }}
          handleStyle={handleStyle}
        />
      </div>
    </div>
  );
}

const dotStyle = {
  borderColor: PRIMARY,
  marginBottom: -5,
  height: 12,
  width: 12,
};

const activeDotStyle = {
  background: SECONDARY,
  height: 14,
  width: 14,
  marginBottom: -5,
};

const handleStyle = {
  borderColor: PRIMARY,
  height: 20,
  width: 20,
  marginTop: -5,
  marginBottom: -5,
  marginRight: -8,
  backgroundColor: SECONDARY,
};
