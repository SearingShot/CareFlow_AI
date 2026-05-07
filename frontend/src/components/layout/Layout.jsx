import React from 'react';

export default function Layout({ chatPanel, avatarPanel, summaryPanel }) {
  return (
    <div className="app-shell h-full w-full bg-scene overflow-hidden">
      <div className="flex h-full w-full flex-col">
        <header className="topbar flex items-center justify-between px-5 py-3 md:px-7">
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
                    <stop stopColor="#00e5ff" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-white">
                CareFlow AI
              </h1>
              <p className="truncate text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Front-desk voice agent for appointment operations
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <StatusPill label="Voice ready" tone="cyan" />
            <StatusPill label="Demo online" tone="green" />
          </div>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-3 pb-3 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
          <section className="chat-shell flex min-h-0 flex-col overflow-hidden rounded-2xl">
            {chatPanel}
          </section>

          <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
            <section className="assistant-stage flex shrink-0 items-center justify-center rounded-2xl">
              {avatarPanel}
            </section>
            <section className="min-h-0 flex-1 overflow-hidden">
              {summaryPanel}
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const color = tone === 'green' ? '#10b981' : '#00e5ff';
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium"
      style={{
        color,
        background: `${color}12`,
        border: `1px solid ${color}26`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
