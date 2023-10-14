import { useState, useEffect } from 'react';
import AlarmSound from "./assets/alarm-clock-sound-effect.mp3";
import './App.css';
import { DisplayState } from './helpers';
import TimeSetter from './TimeSetter';
import Display from './Display';
import { flushSync } from 'react-dom';

const defaultBreakTime = 5 * 60;
const defaultSessionTime = 25 * 60;
const min = 60;
const max = 60 * 60;
const interval = 60;

function App() {
  const [breakTime, setBreakTime] = useState(defaultBreakTime);
  const [sessionTime, setSessionTime] = useState(defaultSessionTime);
  const [displayState, setDisplayState] = useState<DisplayState>({
    time: sessionTime,
    timeType: "Session",
    timerRunning: false,
  });

  useEffect(() => {
    let timerID: number;
    if (!displayState.timerRunning) return;

    if (displayState.timerRunning) {
      timerID = window.setInterval(decrementDisplay, 1000);
    }

    return () => {
      window.clearInterval(timerID);
    };
  }, [displayState.timerRunning]);

  useEffect(() => {
    if (displayState.time === 0) {
      flushSync(() => {
        displayState.time = 0;
      });
      const audio = document.getElementById("beep") as HTMLAudioElement;
      audio.play().catch((err) => console.log(err));
      setDisplayState((prev) => ({
        ...prev,
        timeType: prev.timeType === "Session" ? "Break" : "Session",
        time: prev.timeType === "Session" ? breakTime : sessionTime,
      }));
    }
  }, [displayState, breakTime, sessionTime]);

  const reset = () => {
    flushSync(() => {
      setBreakTime(defaultBreakTime);
    setSessionTime(defaultSessionTime);
    setDisplayState({
      time: defaultSessionTime,
      timeType: "Session",
      timerRunning: false,
    });
    const audio = document.getElementById("beep") as HTMLAudioElement;
    audio.pause();
    audio.currentTime = 0;
    });
  };

  const startStop = () => {
    flushSync(() => {
      setDisplayState((prev) => ({
        ...prev,
        timerRunning: !prev.timerRunning,
      }));
    });
    
  };

  const changeBreakTime = (time: number) => {
    if(displayState.timerRunning) return;
    setBreakTime(time);
  };

  const decrementDisplay = () => {
    flushSync(() => {
      setDisplayState((prev) => ({
        ...prev,
        time: prev.time - 1,
      }));
    });
    
  }

  const changeSessionTime = (time: number) => {
    if(displayState.timerRunning) return;
    flushSync(() => {
      setSessionTime(time);
    setDisplayState({
      time: time,
      timeType: "Session",
      timerRunning: false,
    });
    })
    
  };

  return (
    <div className='clock'>
      <div className='setters'>
        <div className='break'>
          <h4 id="break-label">Break Length</h4>
          <TimeSetter 
            time={breakTime}
            setTime={changeBreakTime}
            min={min}
            max={max}
            interval={interval}
            type="break"
          />
        </div>
        <div className='session'>
          <h4 id="session-label">Session Length</h4>
          <TimeSetter 
            time={sessionTime}
            setTime={changeSessionTime}
            min={min}
            max={max}
            interval={interval}
            type="session"
          />
        </div>
      </div>
      <Display 
        displayState={displayState}
        reset={reset}
        startStop={startStop}
      />
      <audio id="beep" src={AlarmSound} />
    </div>
  );
}

export default App;
