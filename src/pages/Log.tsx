import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import LogItem from '@/components/LogItem';
import { ScrollText, Calendar, AlertTriangle } from 'lucide-react';

const Log = () => {
  const { logEntries } = usePatrol();

  const groupedEntries = logEntries.reduce((groups, entry) => {
    const patrolId = entry.patrolId;
    if (!groups[patrolId]) {
      groups[patrolId] = [];
    }
    groups[patrolId].push(entry);
    return groups;
  }, {} as Record<string, typeof logEntries>);

  const patrolIds = Object.keys(groupedEntries).sort((a, b) => {
    const dateA = new Date(groupedEntries[a][0].timestamp);
    const dateB = new Date(groupedEntries[b][0].timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="patrol-container pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <ScrollText className="h-6 w-6 mr-2 text-primary" />
          Журнал обходів
        </h1>
        <span className="text-sm text-muted-foreground">
          Всього: {patrolIds.length}
        </span>
      </div>

      {patrolIds.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-medium mb-2">Ще немає записів обходу</h3>
          <p className="text-muted-foreground">
            Завершіть обхід, щоб побачити записи тут
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {patrolIds.map((patrolId) => (
            <div key={patrolId} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Обхід #{patrolId.slice(-4)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(groupedEntries[patrolId][0].timestamp).toLocaleDateString('uk', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Точок: {groupedEntries[patrolId].length}
                </div>
              </div>

              <div className="space-y-3">
                {groupedEntries[patrolId].map((entry) => (
                  <LogItem key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Log;
