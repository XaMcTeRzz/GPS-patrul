import React from 'react';
import { CheckCircle, AlertCircle, Clock, MapPin } from 'lucide-react';
import { type LogEntry } from '@/types/patrol-types';

interface LogItemProps {
  entry: LogEntry;
}

const LogItem = ({ entry }: LogItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  let icon;
  let statusColor;
  let statusText;
  let bgColor;

  switch (entry.status) {
    case 'completed':
      icon = <CheckCircle className="h-5 w-5" />;
      statusColor = 'text-emerald-500';
      bgColor = 'bg-emerald-50';
      statusText = 'Виконано';
      break;
    case 'missed':
      icon = <AlertCircle className="h-5 w-5" />;
      statusColor = 'text-red-500';
      bgColor = 'bg-red-50';
      statusText = 'Пропущено';
      break;
    case 'delayed':
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-amber-500';
      bgColor = 'bg-amber-50';
      statusText = 'Затримка';
      break;
    default:
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-muted-foreground';
      bgColor = 'bg-muted';
      statusText = 'В процесі';
  }

  return (
    <div className={`p-3 rounded-lg border ${bgColor} transition-colors`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-full ${bgColor} ${statusColor} flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="font-medium truncate">{entry.pointName}</h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs py-1 px-2 rounded-full font-medium ${statusColor} ${bgColor}`}>
                {statusText}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(entry.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {entry.notes && (
        <p className="text-sm text-muted-foreground mt-2 pl-12">
          {entry.notes}
        </p>
      )}
    </div>
  );
};

export default LogItem;
