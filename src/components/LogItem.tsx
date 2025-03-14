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
  let borderColor;

  switch (entry.status) {
    case 'completed':
      icon = <CheckCircle className="h-5 w-5" />;
      statusColor = 'text-emerald-500';
      bgColor = 'bg-emerald-500/10';
      borderColor = 'border-emerald-500/20';
      statusText = 'Виконано';
      break;
    case 'missed':
      icon = <AlertCircle className="h-5 w-5" />;
      statusColor = 'text-red-500';
      bgColor = 'bg-red-500/10';
      borderColor = 'border-red-500/20';
      statusText = 'Пропущено';
      break;
    case 'delayed':
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-amber-500';
      bgColor = 'bg-amber-500/10';
      borderColor = 'border-amber-500/20';
      statusText = 'Затримка';
      break;
    default:
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-muted-foreground';
      bgColor = 'bg-muted/50';
      borderColor = 'border-muted';
      statusText = 'В процесі';
  }

  return (
    <div className={`p-3 rounded-lg border ${borderColor} ${bgColor} backdrop-blur-sm transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-full ${bgColor} ${statusColor} flex-shrink-0 ring-1 ring-inset ${borderColor}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-primary/10">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="font-medium truncate">{entry.pointName}</h3>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs py-1 px-2 rounded-full font-medium ${statusColor} ${bgColor} ring-1 ring-inset ${borderColor}`}>
                {statusText}
              </span>
              <span className="text-xs text-muted-foreground bg-secondary/30 py-1 px-2 rounded-full">
                {formatDate(entry.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {entry.notes && (
        <div className="mt-3 ml-12 p-2 rounded-lg bg-secondary/20 border border-secondary/30">
          <p className="text-sm text-muted-foreground">
            {entry.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogItem;
