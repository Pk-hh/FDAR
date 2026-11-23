import React, { useState, useEffect } from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { Clock, Volume2, VolumeX, Bell, Coffee, CheckCircle } from 'lucide-react';

export const PeriodCountdownTimer: React.FC = () => {
  const { timingState } = useCollege();
  const [chimeEnabled, setChimeEnabled] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Play synthetic institutional chime using Web Audio API (zero audio files needed, works offline)
  const playBellChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    // Calculate exact seconds remaining in the current period/break
    const calculateSeconds = () => {
      if (!timingState.currentPeriod) {
        setSecondsRemaining(0);
        return;
      }
      const now = new Date();
      const kolkataTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const currentSecondsFromMidnight =
        kolkataTime.getHours() * 3600 + kolkataTime.getMinutes() * 60 + kolkataTime.getSeconds();

      const endSeconds = timingState.currentPeriod.endMinutes * 60;
      const remaining = Math.max(0, endSeconds - currentSecondsFromMidnight);

      if (remaining === 0 && chimeEnabled) {
        playBellChime();
      }

      setSecondsRemaining(remaining);
    };

    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [timingState.currentPeriod, chimeEnabled]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Total period seconds
  const totalPeriodSeconds = timingState.currentPeriod
    ? (timingState.currentPeriod.endMinutes - timingState.currentPeriod.startMinutes) * 60
    : 3000;
  const elapsedPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalPeriodSeconds - secondsRemaining) / totalPeriodSeconds) * 100))
  );

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-mono font-bold text-sm">
            {timingState.currentPeriod?.isBreak ? (
              <Coffee className="w-5 h-5 text-amber-400" />
            ) : timingState.currentPeriod ? (
              <span>P{timingState.currentPeriod.periodNumber}</span>
            ) : (
              <Clock className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">
              {timingState.currentPeriod?.name || (timingState.isCollegeHoursCompleted ? 'College Hours Completed' : 'College Day Upcoming')}
            </span>
            {timingState.currentPeriod && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {timingState.currentPeriod.startTime} - {timingState.currentPeriod.endTime}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {timingState.nextPeriod ? (
              <>Up Next: <strong className="text-slate-300">{timingState.nextPeriod.name}</strong> ({timingState.nextPeriod.startTime})</>
            ) : timingState.isCollegeHoursCompleted ? (
              'All 7 academic periods concluded for today.'
            ) : (
              'Classes start at 09:30 AM.'
            )}
          </p>
        </div>
      </div>

      {/* Countdown Clock & Chime Toggle */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {timingState.currentPeriod && (
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              Time Remaining
            </div>
            <div className="font-mono font-black text-xl text-blue-400 tracking-tight">
              {pad(mins)}:{pad(secs)}
            </div>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 rounded-full"
                style={{ width: `${elapsedPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Chime Bell Toggle */}
        <button
          onClick={() => {
            const next = !chimeEnabled;
            setChimeEnabled(next);
            if (next) playBellChime();
          }}
          className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
            chimeEnabled
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title={chimeEnabled ? 'Period End Bell: ON' : 'Period End Bell: OFF'}
        >
          {chimeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[11px] font-semibold hidden md:inline">
            {chimeEnabled ? 'Bell On' : 'Bell Off'}
          </span>
        </button>
      </div>
    </div>
  );
};
