import React, { useState, useEffect } from "react";
import { FaPlay as Play, FaPause as Pause } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const WHITE_SMOKE = "#eee";
const SECONDARY = "#ffc50b";
const PRIMARY = "#f5821f";
const MAX_STEP = 10;

export default function Progressbar({ step, setStep, getData }) {
  const [play, setPlay] = useState(false);
  const [interval, setProgressInterval] = useState(null);
  const isLastStep = step === MAX_STEP;

  const handleChange = (value) => {
    setStep(value);
  };

  function start() {
    setPlay(true);
    setProgressInterval(
      setInterval(async () => {
        // if (getData) await getData();
        if (isLastStep) {
          setStep(0);
        } else {
          setStep((prev) => ++prev);
        }
      }, 1000)
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

  console.log(`step`, step);
  return (
    <div className="player-container">
      <div className="player-icon">
        {!play && <Play size={20} onClick={start} />}
        {play && <Pause size={20} onClick={stop} />}
      </div>
      <div className="player">
        <Slider
          dots
          min={0}
          value={step}
          max={MAX_STEP}
          onChange={handleChange}
          dotStyle={{
            borderColor: PRIMARY,
            marginBottom: -5,
            height: 12,
            width: 12,
          }}
          activeDotStyle={{
            background: SECONDARY,
            height: 18,
            width: 18,
            marginBottom: -8,
          }}
          railStyle={{ backgroundColor: WHITE_SMOKE, height: 10 }}
          trackStyle={{ backgroundColor: PRIMARY, height: 10 }}
          handleStyle={{
            borderColor: PRIMARY,
            height: 28,
            width: 28,
            marginTop: -9,
            marginBottom: -5,
            marginLeft: 10,
            backgroundColor: SECONDARY,
          }}
        />
      </div>
    </div>
  );
}
