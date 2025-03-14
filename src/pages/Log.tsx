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
        <span className="text-sm text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
          Всього: {patrolIds.length}
        </span>
      </div>

      {patrolIds.length === 0 ? (
        <div className="bg-secondary/20 border-secondary/30 border rounded-lg p-8 text-center backdrop-blur-sm">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-medium mb-2">Ще немає записів обходу</h3>
          <p className="text-muted-foreground">
            Завершіть обхід, щоб побачити записи тут
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {patrolIds.map((patrolId) => (
            <div key={patrolId} className="bg-secondary/20 border-secondary/30 border rounded-lg p-4 backdrop-blur-sm hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between mb-4 border-b border-secondary/30 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
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
                <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
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
