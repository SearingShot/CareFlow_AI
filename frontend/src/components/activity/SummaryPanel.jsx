import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolActivityCard from './ToolActivityCard.jsx';

export default function SummaryPanel({ messages, latestToolActivity, summary, onEndConversation, isLoading }) {
  const messageCount = messages.filter((m) => m.role === 'user').length;

  // Extract appointment info from tool activities in messages
  const appointments = messages
    .filter((m) => m.toolActivity?.tool_name === 'book_appointment' && m.toolActivity?.tool_result)
    .map((m) => m.toolActivity.tool_result?.appointment || m.toolActivity.tool_result);

  const sessionStart = messages[0]?.timestamp
    ? new Date(messages[0].timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '--';

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>
      {/* Session Info */}
      <div className="glass-panel px-4 py-4">
        <PanelHeader title="Session Info" />
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Messages" value={messageCount} />
          <Metric label="Started" value={sessionStart} />
          <Metric label="State" value="Active" tone="#10b981" />
        </div>
        {onEndConversation && (
          <button
            onClick={onEndConversation}
            disabled={isLoading}
            className="mt-3 w-full rounded-xl px-3 py-2.5 text-xs font-semibold disabled:opacity-40"
            style={{
              color: '#06b6d4',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.08))',
              border: '1px solid rgba(6, 182, 212, 0.22)',
            }}
          >
            End Conversation
          </button>
        )}
      </div>

      {summary && (
        <div className="glass-panel px-4 py-4">
          <PanelHeader title="Conversation Summary" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {summary.short_summary}
          </p>
          <div className="mt-3 space-y-2">
            <InfoRow label="Messages" value={summary.message_count ?? 0} />
            <InfoRow label="Session ID" value={summary.session_id?.slice(0, 8) || '--'} />
          </div>
        </div>
      )}

      {/* Latest Tool Activity */}
      <AnimatePresence mode="wait">
        {latestToolActivity && (
          <motion.div
            key={latestToolActivity.tool_name + Date.now()}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-panel px-4 py-4">
              <PanelHeader title="Latest Activity" />
              <ToolActivityCard activity={latestToolActivity} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booked Appointments */}
      {appointments.length > 0 && (
        <div className="glass-panel px-4 py-4">
          <PanelHeader title="Appointments" />
          <div className="space-y-2">
            {appointments.map((apt, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 text-xs space-y-1"
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                }}
              >
                {apt.name && (
                  <div className="font-medium" style={{ color: '#10b981' }}>
                    {apt.name}
                  </div>
                )}
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {apt.date || apt.appointment_date} at {apt.time || apt.appointment_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Hints */}
      <div className="glass-panel px-4 py-3">
        <PanelHeader title="Try Saying" />
        <div className="space-y-1.5">
          {[
            'Book an appointment for tomorrow',
            'Show my appointments',
            'Cancel my appointment',
            'What slots are available?',
          ].map((hint, i) => (
            <button
              key={i}
              className="w-full text-left text-xs px-3 py-2 rounded-lg"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'rgba(148, 163, 184, 0.05)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
              }}
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {value}
      </span>
    </div>
  );
}

function Metric({ label, value, tone = '#94a3b8' }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: 'rgba(2, 6, 23, 0.24)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <div className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-semibold" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function PanelHeader({ title }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {title}
    </h3>
  );
}
