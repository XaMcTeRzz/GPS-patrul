
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { LogEntry } from '@/context/PatrolContext';

interface LogItemProps {
  entry: LogEntry;
}

const LogItem = ({ entry }: LogItemProps) => {
  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  let icon;
  let statusColor;

  switch (entry.status) {
    case 'completed':
      icon = <CheckCircle className="h-5 w-5" />;
      statusColor = 'text-green-500 bg-green-100 dark:bg-green-900/30';
      break;
    case 'missed':
      icon = <AlertCircle className="h-5 w-5" />;
      statusColor = 'text-red-500 bg-red-100 dark:bg-red-900/30';
      break;
    case 'delayed':
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      break;
    default:
      icon = <Clock className="h-5 w-5" />;
      statusColor = 'text-muted-foreground bg-muted';
  }

  return (
    <div className="p-3.5 border rounded-lg mb-3 bg-card shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex space-x-3">
          <div className={`p-2 rounded-full ${statusColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{entry.pointName}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              <span>Patrol #{entry.patrolId.slice(-4)}</span>
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(entry.timestamp)}
        </span>
      </div>
      
      <div className="mt-2 pl-10">
        <span className={`text-xs py-1 px-2 rounded-full inline-block font-medium capitalize ${statusColor}`}>
          {entry.status}
        </span>
        {entry.notes && (
          <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
        )}
      </div>
    </div>
  );
};

export default LogItem;
