import React, { useState } from 'react';

export default function Layout({
  chatPanel,
  avatarPanel,
  summaryPanel,


  voiceState = 'idle',
  toolStatus = 'Tools Ready',
  networkStatus = 'online',
}) {

  const voiceConfig = getVoiceConfig(voiceState);
  const networkConfig = getNetworkConfig(networkStatus);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  return (
    <div className="app-shell relative h-full w-full overflow-hidden bg-scene">

      {/* Ambient bridge glow */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[54%] w-[260px]"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.018), transparent)',
          filter: 'blur(80px)',
          opacity: 0.45,
        }}
      />

      <div className="flex h-full w-full flex-col pt-3">

        {/* Topbar */}
        <header className="topbar flex items-center justify-between px-5 pt-5 pb-4 md:px-7">

          <div className="flex min-w-0 items-center gap-3">

            <div className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">

                <path
                  d="M12 3.5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5-8.5-3.8-8.5-8.5S7.3 3.5 12 3.5Z"
                  stroke="url(#brandGrad)"
                  strokeWidth="1.7"
                />

                <path
                  d="M8.2 12.2h2.4l1.1-3.2 2.1 6.2 1.1-3h2.9"
                  stroke="url(#brandGrad)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <defs>
                  <linearGradient id="brandGrad" x1="4" y1="4" x2="20" y2="20">
                    <stop stopColor="#CBCBCB" />
                    <stop offset="1" stopColor="#6D8196" />
                  </linearGradient>
                </defs>

              </svg>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-[-0.03em] text-white leading-none">
                CareFlow AI
              </h1>

              <p
                className="mt-1.5 truncate text-[12px]"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                Front-desk voice agent for appointment operations
              </p>
            </div>
          </div>

          {/* Mobile Assistant Toggle */}
          <button
            onClick={() => setMobilePanelOpen(true)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              sm:hidden
            "
            style={{
              background:
                'linear-gradient(180deg, rgba(28,32,40,0.96), rgba(18,20,26,0.96))',

              border:
                '1px solid rgba(255,255,255,0.06)',

              boxShadow:
                '0 10px 24px rgba(0,0,0,0.18)',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 7h16"
                stroke="#CBCBCB"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M4 12h16"
                stroke="#CBCBCB"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M4 17h10"
                stroke="#CBCBCB"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* LIVE STATUS PILLS */}
          <div className="hidden items-center gap-2 sm:flex">

            <StatusPill
              label={voiceConfig.label}
              color={voiceConfig.color}
              glow={voiceConfig.glow}
            />

            <StatusPill
              label={networkConfig.label}
              color={networkConfig.color}
              glow={networkConfig.glow}
            />

          </div>
        </header>

        {/* Main */}
        <main
          className="
            grid
            min-h-0
            flex-1
            grid-cols-1
            gap-5
            overflow-hidden
            px-4
            pb-4
            pt-4
            md:px-6
            md:pb-6
            lg:grid-cols-[minmax(0,1fr)_480px]
          "
        >

          {/* Chat */}
          <section className="chat-shell flex min-h-0 flex-col overflow-hidden rounded-[30px]">
            {chatPanel}
          </section>

          {/* Right Side */}
          <aside className="hidden min-h-0 flex-col overflow-hidden lg:flex">

            {/* Avatar */}
            <section className="assistant-stage mb-5 flex h-[300px] shrink-0 items-center justify-center rounded-[32px]">
              {avatarPanel}
            </section>

            {/* Scrollable */}
            <section className="min-h-0 flex-1 overflow-y-auto pr-1">
              {summaryPanel}
            </section>

          </aside>
          {/* -------------------------------- */}
          {/* MOBILE ASSISTANT PANEL */}
          {/* -------------------------------- */}

          <div
            className={`
              fixed
              inset-0
              z-50
              transition-all
              duration-300
              lg:hidden

              ${mobilePanelOpen
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0'}
            `}
          >

            {/* Backdrop */}
            <div
              onClick={() => setMobilePanelOpen(false)}
              className="absolute inset-0"
              style={{
                background: 'rgba(0,0,0,0.58)',
                backdropFilter: 'blur(10px)',
              }}
            />

            {/* Panel */}
            <div
              className={`
                absolute
                right-0
                top-0
                flex
                h-full
                w-[88vw]
                max-w-[420px]
                flex-col
                transition-transform
                duration-300

                ${mobilePanelOpen
                  ? 'translate-x-0'
                  : 'translate-x-full'}
              `}
              style={{
                background:
                  'linear-gradient(180deg, rgba(16,18,24,0.98), rgba(10,11,16,0.99))',

                borderLeft:
                  '1px solid rgba(255,255,255,0.05)',

                boxShadow:
                  '-20px 0 60px rgba(0,0,0,0.42)',
              }}
            >

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-5"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >

                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.34em]"
                    style={{
                      color: 'var(--color-text-faint)',
                    }}
                  >
                    Assistant Panel
                  </p>

                  <h2
                    className="mt-2 text-[16px] font-semibold"
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    CareFlow Workspace
                  </h2>
                </div>

                <button
                  onClick={() => setMobilePanelOpen(false)}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                  "
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 6L18 18"
                      stroke="#CBCBCB"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M18 6L6 18"
                      stroke="#CBCBCB"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Avatar */}
              <section className="assistant-stage mx-4 mt-4 flex h-[240px] shrink-0 items-center justify-center rounded-[28px]">
                {avatarPanel}
              </section>

              {/* Summary */}
              <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {summaryPanel}
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Status Pill */
/* -------------------------------- */

function StatusPill({
  label,
  color,
  glow,
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300"
      style={{
        color,
        background: `${glow}`,
        border: `1px solid ${color}22`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />

      {label}
    </div>
  );
}

/* -------------------------------- */
/* Voice Config */
/* -------------------------------- */

function getVoiceConfig(state) {
  switch (state) {

    case 'listening':
      return {
        label: 'Listening',
        color: '#D6E4C9',
        glow: 'rgba(214,228,201,0.08)',
      };

    case 'speaking':
      return {
        label: 'Speaking',
        color: '#FFFFE3',
        glow: 'rgba(255,255,227,0.08)',
      };

    case 'thinking':
      return {
        label: 'Processing',
        color: '#CBCBCB',
        glow: 'rgba(203,203,203,0.06)',
      };

    default:
      return {
        label: 'Voice Ready',
        color: '#8A8F98',
        glow: 'rgba(138,143,152,0.05)',
      };
  }
}

/* -------------------------------- */
/* Network Config */
/* -------------------------------- */

function getNetworkConfig(status) {

  switch (status) {

    case 'offline':
      return {
        label: 'Offline',
        color: '#C97B7B',
        glow: 'rgba(201,123,123,0.08)',
      };

    case 'reconnecting':
      return {
        label: 'Reconnecting',
        color: '#C8A46A',
        glow: 'rgba(200,164,106,0.08)',
      };

    default:
      return {
        label: 'Online',
        color: '#8FA98E',
        glow: 'rgba(143,169,142,0.08)',
      };
  }
}