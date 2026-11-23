import type { CSSProperties } from 'react';
import {
  DrivingMode,
  EmotionTheme,
  getDrivingBackdropConfig,
} from '../lib/daeriLogic';

interface DrivingRoadBackdropProps {
  theme: EmotionTheme;
  mode: DrivingMode;
  isReplying: boolean;
}

const LAMP_MARKERS = [0, 1, 2, 3, 4, 5];

export function DrivingRoadBackdrop({
  theme,
  mode,
  isReplying,
}: DrivingRoadBackdropProps) {
  const cfg = getDrivingBackdropConfig(theme.key, mode);

  // Gently slow cruise pace while driver composes a calm reply
  const paceScale = isReplying ? 1.18 : 1;

  const cssVars = {
    '--drive-lane-duration': `${(cfg.laneDurationSec * paceScale).toFixed(2)}s`,
    '--drive-lamps-duration': `${(cfg.lampsDurationSec * paceScale).toFixed(2)}s`,
    '--drive-horizon-duration': `${(cfg.horizonDurationSec * paceScale).toFixed(2)}s`,
    '--drive-light-duration': `${(cfg.lightDurationSec * paceScale).toFixed(2)}s`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-testid="driving-road-backdrop"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{
        ...cssVars,
        background: `linear-gradient(180deg, ${cfg.skyTop} 0%, ${cfg.skyBottom} 58%, ${theme.accentSoft} 100%)`,
      }}
    >
      {/* 1. Abstract Flowing Twilight & Streetlight Bokeh */}
      <div
        className="driving-anim-light-a absolute -top-24 -left-24 h-[58vh] w-[62vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 40% 45%, ${cfg.ambientRibbonA}, transparent 70%)`,
        }}
      />
      <div
        className="driving-anim-light-b absolute top-[12vh] -right-24 h-[52vh] w-[56vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 60% 45%, ${cfg.lampGlowColor}44, ${cfg.ambientRibbonB}1A 52%, transparent 72%)`,
        }}
      />

      {/* Soft Horizon Haze Band */}
      <div
        className="absolute inset-x-0 bottom-[22vh] h-32"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.bgPage}AA 65%, ${cfg.skyBottom}DD 100%)`,
        }}
      />

      {/* 2. Distant Rolling Hills Silhouette (Seamless 200% Width Parallax) */}
      <div className="absolute inset-x-0 bottom-[21vh] h-28 overflow-hidden opacity-45">
        <div className="driving-anim-horizon flex h-full w-[200%]">
          {[0, 1].map((segment) => (
            <svg
              key={segment}
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="h-full w-1/2 shrink-0"
            >
              <path
                d="M0,120 L0,76 Q140,28 290,62 T590,52 T890,66 T1200,48 L1200,120 Z"
                fill={cfg.hillFill}
              />
              <path
                d="M0,120 L0,92 Q180,62 360,86 T740,76 T1040,88 L1200,82 L1200,120 Z"
                fill={cfg.horizonFill}
                opacity="0.55"
              />
            </svg>
          ))}
        </div>
      </div>

      {/* 3. Passing Roadside Streetlamps & Guardrail Rhythm */}
      <div className="absolute inset-x-0 bottom-[21vh] h-24 overflow-hidden">
        <div className="driving-anim-lamps flex h-full w-[200%] items-end">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex h-full w-1/2 shrink-0 items-end justify-around"
            >
              {LAMP_MARKERS.map((marker) => (
                <div
                  key={`${copy}-${marker}`}
                  className="relative flex flex-col items-center"
                >
                  {/* Soft warm streetlight halo */}
                  <div
                    className="h-12 w-12 -mb-5 rounded-full blur-md"
                    style={{
                      background: `radial-gradient(circle, ${cfg.lampGlowColor}99 0%, ${cfg.lampGlowColor}22 55%, transparent 75%)`,
                    }}
                  />
                  {/* Lamp head */}
                  <div
                    className="h-1.5 w-3 rounded-full opacity-65"
                    style={{ backgroundColor: cfg.lampGlowColor }}
                  />
                  {/* Slim pole */}
                  <div
                    className="h-10 w-[2px] opacity-30"
                    style={{ backgroundColor: cfg.roadSurface }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Continuous thin guardrail line */}
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] opacity-30"
          style={{ backgroundColor: cfg.laneDashColor }}
        />
      </div>

      {/* 4. Perspective Road Surface & Flowing Center Lane Dashes */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22vh] min-h-[140px] overflow-hidden"
        style={{
          perspective: '300px',
          perspectiveOrigin: '50% 0%',
        }}
      >
        <div
          className="mx-auto h-[260%] w-[140%] -ml-[20%] origin-top"
          style={{
            transform: 'rotateX(62deg)',
            background: `linear-gradient(90deg, transparent 0%, ${cfg.roadSurface}10 22%, ${cfg.roadSurface}1A 50%, ${cfg.roadSurface}10 78%, transparent 100%)`,
          }}
        >
          {/* Left & Right Road Shoulder Lines */}
          <div
            className="absolute inset-y-0 left-[29%] w-[3px] opacity-30"
            style={{ backgroundColor: cfg.laneDashColor }}
          />
          <div
            className="absolute inset-y-0 right-[29%] w-[3px] opacity-30"
            style={{ backgroundColor: cfg.laneDashColor }}
          />

          {/* Flowing Center Lane Dashes (Compositor translateY Loop) */}
          <div className="absolute inset-y-0 left-1/2 w-[8px] -translate-x-1/2 overflow-hidden">
            <div
              className="driving-anim-lane h-[200%] w-full opacity-45"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, ${cfg.laneDashColor} 0px, ${cfg.laneDashColor} 44px, transparent 44px, transparent 96px)`,
              }}
            />
          </div>
        </div>

        {/* Subtle foreground fade so bottom edge blends seamlessly */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${cfg.skyBottom}CC 100%)`,
          }}
        />
      </div>
    </div>
  );
}
