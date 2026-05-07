import React from 'react';
import { motion } from 'framer-motion';

const toolMeta = {
  identify_user: {
    icon: 'ID',
    label: 'Identifying User',
    doneLabel: 'User Identified',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.08)',
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  fetch_slots: {
    icon: 'S',
    label: 'Checking Slots',
    doneLabel: 'Available Slots Found',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  book_appointment: {
    icon: '+',
    label: 'Booking Appointment',
    doneLabel: 'Appointment Booked',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  cancel_appointment: {
    icon: 'X',
    label: 'Cancelling Appointment',
    doneLabel: 'Appointment Cancelled',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  modify_appointment: {
    icon: 'M',
    label: 'Modifying Appointment',
    doneLabel: 'Appointment Modified',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  retrieve_appointments: {
    icon: 'A',
    label: 'Retrieving Appointments',
    doneLabel: 'Appointments Retrieved',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  end_conversation: {
    icon: 'E',
    label: 'Ending Conversation',
    doneLabel: 'Summary Generated',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
};

export default function ToolActivityCard({ activity }) {
  if (!activity || !activity.tool_name) return null;

  const meta = toolMeta[activity.tool_name] || {
    icon: 'T',
    label: activity.tool_name,
    doneLabel: activity.tool_name,
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.08)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
  };

  const result = activity.tool_result;
  const isSuccess = result?.success !== false;
  const statusColor = isSuccess ? meta.color : '#ef4444';
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
                background: `${meta.color}10`,
                border: `1px solid ${meta.color}22`,
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
                background: `${meta.color}15`,
                border: `1px solid ${meta.color}30`,
                color: meta.color,
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
        background: meta.bgColor,
        border: `1px solid ${isSuccess ? meta.borderColor : 'rgba(239, 68, 68, 0.3)'}`,
        boxShadow: `0 4px 20px ${meta.bgColor}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm"
          style={{
            background: `${statusColor}20`,
            border: `1px solid ${statusColor}40`,
            color: statusColor,
            textShadow: `0 0 10px ${statusColor}`,
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
              {isSuccess ? 'Success' : 'Issue'}
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
