import React, { useState, useEffect } from "react";
import { Slider, PlayerIcon, Direction } from "react-player-controls";
const WHITE_SMOKE = "#eee";
const GRAY = "#878c88";
const GREEN = "#72d687";
const MAX_STEP = 10;
const MAX_WIDTH = "90vw";
export default function Progressbar({ step, setStep, getData }) {
  const [play, setPlay] = useState(false);
  const [interval, setProgressInterval] = useState(null);
  const [lastIntent] = useState(0);

  function start() {
    setPlay(true);
    setProgressInterval(
      setInterval(async () => {
        // if (getData) await getData();
        setStep((prev) => ++prev);
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
    if (step === MAX_STEP) stop();
    //eslint-disable-next-line
  }, [step]);

  const progress = step / MAX_STEP;

  console.log(`step`, step);
  console.log(`progress`, progress);
  return (
    <div className="player">
      {!play && (
        <PlayerIcon.Play
          width={32}
          height={32}
          style={{ marginRight: 32 }}
          onClick={start}
        />
      )}
      {play && (
        <PlayerIcon.Pause
          width={32}
          height={32}
          style={{ marginRight: 32 }}
          onClick={stop}
        />
      )}
      <Slider
        direction={Direction.HORIZONTAL}
        onIntent={(intent) => console.log(`hovered at ${intent}`)}
        onIntentStart={(intent) =>
          console.log(`entered with mouse at ${intent}`)
        }
        onIntentEnd={() => console.log("left with mouse")}
        onChange={(newValue) => console.log(`clicked at ${newValue}`)}
        onChangeStart={(startValue) =>
          console.log(`started dragging at ${startValue}`)
        }
        onChangeEnd={(endValue) =>
          console.log(`stopped dragging at ${endValue}`)
        }
        overlayZIndex={100}
      >
        <SliderBar
          direction={Direction.HORIZONTAL}
          value={1}
          style={{ background: WHITE_SMOKE }}
        />
        <SliderBar
          direction={Direction.HORIZONTAL}
          value={step / MAX_STEP}
          style={{ background: GREEN }}
        />
        <SliderBar
          direction={Direction.HORIZONTAL}
          value={lastIntent}
          style={{ background: "rgba(0, 0, 0, 0.05)" }}
        />
        <SliderHandle
          direction={Direction.HORIZONTAL}
          value={progress}
          style={{ background: GREEN }}
        />
      </Slider>
    </div>
  );
}

const SliderBar = ({ direction, value, style }) => (
  <div
    style={{
      position: "absolute",
      background: GRAY,
      borderRadius: 4,
      ...(direction === Direction.HORIZONTAL
        ? {
            top: "calc(50% - 4px)",
            left: 0,
            width: `${value * 100}%`,
            height: 8,
          }
        : {
            right: 0,
            bottom: 0,
            left: "calc(50% - 4px)",
            width: 8,
            height: `${value * 100}%`,
          }),
      ...style,
    }}
  />
);

const SliderHandle = ({ direction, value, style }) => (
  <div
    style={Object.assign(
      {},
      {
        position: "absolute",
        width: 16,
        height: 16,
        background: GREEN,
        borderRadius: "100%",
        transform: "scale(1)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.3)",
        },
      },
      direction === Direction.HORIZONTAL
        ? {
            top: "calc(50% - 4px)",
            left: `${value * 100}%`,
            marginTop: -4,
            marginLeft: -8,
          }
        : {
            left: "calc(50% - 4px)",
            bottom: `${value * 100}%`,
            marginBottom: -8,
            marginLeft: -4,
          },
      style
    )}
  />
);
