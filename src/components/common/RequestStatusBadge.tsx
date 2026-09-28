import React from 'react';
import { RequestStatus } from '../../types/bloodbridge';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status, size = 'sm' }) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';
  let displayLabel: string = status;

  switch (status) {
    case 'CREATED':
      colorStyles = 'bg-slate-100 text-slate-800 border-slate-300';
      dotColor = 'bg-slate-500';
      displayLabel = 'Created';
      break;
    case 'SEARCHING':
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
      dotColor = 'bg-blue-600';
      displayLabel = 'Searching Inventory';
      break;
    case 'MATCHED':
      colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      dotColor = 'bg-indigo-600';
      displayLabel = 'Matched';
      break;
    case 'PENDING_CONFIRMATION':
      colorStyles = 'bg-amber-50 text-amber-900 border-amber-200';
      dotColor = 'bg-amber-500';
      displayLabel = 'Pending Confirmation';
      break;
    case 'ACCEPTED':
      colorStyles = 'bg-teal-50 text-teal-800 border-teal-200';
      dotColor = 'bg-teal-600';
      displayLabel = 'Accepted';
      break;
    case 'RESERVED':
      colorStyles = 'bg-purple-50 text-purple-800 border-purple-200';
      dotColor = 'bg-purple-600';
      displayLabel = 'Reserved in Bank';
      break;
    case 'FULFILLED':
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-600';
      displayLabel = 'Fulfilled / Delivered';
      break;
    case 'REJECTED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-600';
      displayLabel = 'Rejected';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-gray-100 text-gray-600 border-gray-300';
      dotColor = 'bg-gray-500';
      displayLabel = 'Cancelled';
      break;
    case 'EXPIRED':
      colorStyles = 'bg-amber-100 text-amber-800 border-amber-300';
      dotColor = 'bg-amber-600';
      displayLabel = 'Expired';
      break;
    default:
      displayLabel = status;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold font-mono border rounded-md uppercase tracking-wider ${sizeClasses} ${colorStyles}`}
      title={`Standardized Status: ${status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{displayLabel}</span>
    </span>
  );
};
