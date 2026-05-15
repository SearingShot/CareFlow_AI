import React from 'react';
import { motion } from 'framer-motion';

const toolMeta = {
  identify_user: {
    icon: 'ID',
    label: 'Identity Verification',
    doneLabel: 'User Identified',
    tint: 'rgba(235,240,245,0.88)',
  },

  fetch_slots: {
    icon: 'SL',
    label: 'Availability Lookup',
    doneLabel: 'Slots Retrieved',
    tint: 'rgba(255,255,227,0.92)',
  },

  book_appointment: {
    icon: 'BK',
    label: 'Appointment Booking',
    doneLabel: 'Appointment Confirmed',
    tint: 'rgba(214,228,201,0.92)',
  },

  cancel_appointment: {
    icon: 'CN',
    label: 'Cancellation Request',
    doneLabel: 'Appointment Cancelled',
    tint: 'rgba(255,210,210,0.92)',
  },

  modify_appointment: {
    icon: 'RS',
    label: 'Reschedule Request',
    doneLabel: 'Appointment Rescheduled',
    tint: 'rgba(255,240,210,0.92)',
  },

  retrieve_appointments: {
    icon: 'AP',
    label: 'Appointment Retrieval',
    doneLabel: 'Appointments Retrieved',
    tint: 'rgba(230,232,240,0.92)',
  },

  end_conversation: {
    icon: 'SM',
    label: 'Conversation Summary',
    doneLabel: 'Summary Generated',
    tint: 'rgba(240,240,240,0.92)',
  },
};

export default function ToolActivityCard({ activity }) {
  if (!activity || !activity.tool_name) return null;

  const meta = toolMeta[activity.tool_name] || {
    icon: 'T',
    label: activity.tool_name,
    doneLabel: activity.tool_name,
    tint: 'rgba(235,240,245,0.88)',
  };

  const result = activity.tool_result;
  const isSuccess = result?.success !== false;
  const statusColor = isSuccess
    ? meta.tint
    : 'rgba(255,210,210,0.92)';
  const appointment = result?.appointment || result?.updated_appointment || result || {};
  const user = result?.user || null;
  const statusLabel = isSuccess ? meta.doneLabel : 'Action Needs Attention';

  const renderDetails = () => {
    if (!result || typeof result !== 'object') return null;

    if (user?.phone_number || user?.name) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {user.name && <Detail label="Patient" value={user.name} color={statusColor} />}
          {user.phone_number && <Detail label="Phone" value={user.phone_number} color={statusColor} />}
        </div>
      );
    }

    if (appointment.id || appointment.name || appointment.date || appointment.appointment_date) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {appointment.name && <Detail label="Patient" value={appointment.name} color={statusColor} />}
          {(appointment.date || appointment.appointment_date) && (
            <Detail label="Date" value={appointment.date || appointment.appointment_date} color={statusColor} />
          )}
          {(appointment.time || appointment.appointment_time) && (
            <Detail label="Time" value={appointment.time || appointment.appointment_time} color={statusColor} />
          )}
          {appointment.id && <Detail label="ID" value={`#${appointment.id}`} color={statusColor} />}
          {result.status && <Detail label="Status" value={result.status} color={statusColor} />}
        </div>
      );
    }

    if (Array.isArray(result.appointments) && result.appointments.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {result.appointments.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="font-semibold" style={{ color: statusColor }}>
                #{item.id} {item.name}
              </div>
              <div style={{ color: 'var(--color-text-secondary)' }}>
                {item.date} at {item.time}
              </div>
            </div>
          ))}
        </div>
      );
    }

    const slots = result.available_slots || (Array.isArray(result) ? result : null);
    if (Array.isArray(slots) && slots.length > 0) {
      return (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {slots.slice(0, 8).map((slot, i) => (
            <span
              key={`${slot}-${i}`}
              className="text-[10px] px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',

                border:
                  '1px solid rgba(255,255,255,0.06)',

                color: statusColor,
              }}
            >
              {typeof slot === 'string' ? slot : slot.time || slot.date || JSON.stringify(slot)}
            </span>
          ))}
        </div>
      );
    }

    if (result.message) {
      return (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {result.message}
        </p>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl px-4 py-3.5 tool-card-shimmer shadow-lg"
      style={{
        background:
          'linear-gradient(180deg, rgba(28,32,40,0.94), rgba(18,20,26,0.96))',

        border:
          '1px solid rgba(255,255,255,0.05)',

        boxShadow:
          '0 12px 30px rgba(0,0,0,0.18)',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm"
          style={{
            background: 'rgba(255,255,255,0.04)',

            border:
              '1px solid rgba(255,255,255,0.06)',

            color: statusColor,
          }}
        >
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold tracking-wide" style={{ color: statusColor }}>
              {statusLabel}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] uppercase"
              style={{
                color: statusColor,
                background: `${statusColor}12`,
                border: `1px solid ${statusColor}22`,
              }}
            >
              {isSuccess ? 'Completed' : 'Attention'}
            </span>
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {meta.label}
          </div>
        </div>
      </div>
      {renderDetails()}
    </motion.div>
  );
}

function Detail({ label, value, color }) {
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(2, 6, 23, 0.18)' }}>
      <div className="text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
      <div className="mt-0.5 font-medium truncate" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
