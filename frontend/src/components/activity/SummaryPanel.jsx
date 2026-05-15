import React from 'react';
import { motion } from 'framer-motion';

export default function SummaryPanel({
  messages = [],
  latestToolActivity,
  summary,
  onEndConversation,
  isLoading,
  onQuickAction,
}) {

  const quickActions = [
    'Book appointment',
    'Find slots',
    'Reschedule',
    'Cancel visit',
  ];

  const conversationHighlights = buildHighlights(messages);

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden">

      {/* Workspace Overview */}
      <section
        className="rounded-[24px] p-4 md:rounded-[28px] md:p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(22,24,29,0.72), rgba(12,13,17,0.94))',
          border: '1px solid rgba(255,255,255,0.03)',
          boxShadow:
            '0 24px 70px rgba(0,0,0,0.24)',
        }}
      >

        <div className="mb-4 flex items-center justify-between">

          <div>
            <p
              className="text-[10px] uppercase tracking-[0.34em]"
              style={{
                color: 'var(--color-text-faint)',
              }}
            >
              Session Overview
            </p>

            <h2
              className="mt-2 text-[15px] font-semibold"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              CareFlow Workspace
            </h2>
          </div>

          <div
            className="rounded-full px-3 py-1 text-[11px]"
            style={{
              background: 'rgba(143,169,142,0.08)',
              border: '1px solid rgba(143,169,142,0.14)',
              color: '#A8B59F',
            }}
          >
            Operational
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <MetricCard
            label="Voice Status"
            value="Connected"
          />

          <MetricCard
            label="Tools"
            value={
              latestToolActivity?.tool_name
                ? `${latestToolActivity.tool_name} Active`
                : 'Scheduling Active'
            }
          />

          <MetricCard
            label="Messages"
            value={`${messages.length}`}
          />

          <MetricCard
            label="Session"
            value="Live"
          />

        </div>
      </section>

      {/* Conversation */}
      <section
        className="hidden rounded-[24px] p-4 md:block md:rounded-[28px] md:p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,20,25,0.66), rgba(11,12,16,0.92))',
          border: '1px solid rgba(255,255,255,0.025)',
        }}
      >

        <div className="mb-4 flex items-center justify-between">

          <div>
            <p
              className="text-[10px] uppercase tracking-[0.34em]"
              style={{
                color: 'var(--color-text-faint)',
              }}
            >
              Conversation
            </p>

            <h3
              className="mt-1 text-[15px] font-semibold"
              style={{
                color: 'var(--color-text-primary)',
              }}
            >
              Insights
            </h3>
          </div>

          <div
            className="rounded-full px-3 py-1 text-[11px]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'var(--color-text-muted)',
            }}
          >
            {messages.length} messages
          </div>
        </div>

        <div className="space-y-3">

          {conversationHighlights.length > 0 ? (
            conversationHighlights.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                }}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.022)',
                  border: '1px solid rgba(255,255,255,0.02)',
                }}
              >

                <div className="flex items-start gap-3">

                  <div
                    className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: '#CBCBCB',
                    }}
                  />

                  <p
                    className="text-[13px] leading-[1.75]"
                    style={{
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {item}
                  </p>

                </div>
              </motion.div>
            ))
          ) : (
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.022)',
                border: '1px solid rgba(255,255,255,0.02)',
              }}
            >
              <p
                className="text-[13px]"
                style={{
                  color: 'var(--color-text-muted)',
                }}
              >
                No activity yet.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Actions */}
      <section
        className="rounded-[24px] p-4 md:rounded-[28px] md:p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,20,24,0.72), rgba(11,12,15,0.94))',
          border: '1px solid rgba(255,255,255,0.025)',
        }}
      >

        <div className="mb-4">

          <p
            className="text-[10px] uppercase tracking-[0.34em]"
            style={{
              color: 'var(--color-text-faint)',
            }}
          >
            Quick Actions
          </p>

          <h3
            className="mt-1 text-[15px] font-semibold"
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            Suggested Tasks
          </h3>
        </div>

        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-1
            scrollbar-hide
            snap-x
            snap-mandatory
            md:flex-wrap
            md:overflow-visible
          "
        >

          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => onQuickAction?.(action)}
              className="
                snap-start
                rounded-full
                px-3
                py-[7px]
                text-[11px]
                leading-none
                font-medium
                whitespace-nowrap
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:scale-[1.02]
                active:scale-[0.98]
              "
              style={{
                background:
                  'linear-gradient(180deg, rgba(28,32,40,0.96), rgba(18,20,26,0.96))',

                border: '1px solid rgba(255,255,255,0.08)',

                color: 'rgba(235,240,255,0.88)',

                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.04),
                  0 4px 14px rgba(0,0,0,0.22)
                `,
                maxWidth: '100%',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(180deg, rgba(42,48,60,0.98), rgba(24,28,36,0.98))';

                e.currentTarget.style.border =
                  '1px solid rgba(120,170,255,0.24)';

                e.currentTarget.style.boxShadow =
                  '0 0 0 1px rgba(120,170,255,0.08), 0 10px 24px rgba(0,0,0,0.32)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(180deg, rgba(28,32,40,0.96), rgba(18,20,26,0.96))';

                e.currentTarget.style.border =
                  '1px solid rgba(255,255,255,0.08)';

                e.currentTarget.style.boxShadow =
                  'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 14px rgba(0,0,0,0.22)';
              }}
            >
              {action}
            </button>
          ))}

        </div>

      </section>
    </div>
  );
}

/* -------------------------------- */
/* Metric Card */
/* -------------------------------- */

function MetricCard({
  label,
  value,
}) {
  return (
    <div
      className="rounded-[20px] p-3"
      style={{
        background: 'rgba(255,255,255,0.022)',
        border: '1px solid rgba(255,255,255,0.025)',
      }}
    >

      <p
        className="text-[10px] uppercase tracking-[0.24em]"
        style={{
          color: 'var(--color-text-faint)',
        }}
      >
        {label}
      </p>

      <h4
        className="mt-2 text-[13px] font-medium"
        style={{
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </h4>

    </div>
  );
}

/* -------------------------------- */
/* Helpers */
/* -------------------------------- */

function buildHighlights(messages) {

  const assistantMessages = messages
    .filter((m) => m.role === 'assistant')
    .slice(-3);

  return assistantMessages.map((m) => {

    if (m.content.length > 110) {
      return `${m.content.slice(0, 110)}...`;
    }

    return m.content;
  });
}