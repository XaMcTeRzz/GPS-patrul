
import React from 'react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import LogItem from '@/components/LogItem';

const Log = () => {
  const { logEntries } = usePatrol();

  // Group log entries by patrol ID
  const groupedEntries = logEntries.reduce((groups, entry) => {
    const patrolId = entry.patrolId;
    if (!groups[patrolId]) {
      groups[patrolId] = [];
    }
    groups[patrolId].push(entry);
    return groups;
  }, {} as Record<string, typeof logEntries>);

  // Get unique patrol IDs and sort them by most recent first
  const patrolIds = Object.keys(groupedEntries).sort((a, b) => {
    const dateA = new Date(groupedEntries[a][0].timestamp);
    const dateB = new Date(groupedEntries[b][0].timestamp);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="patrol-container pb-20">
      <h1 className="text-2xl font-bold mb-6">Patrol Log</h1>

      {logEntries.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No patrol logs yet</h3>
          <p className="text-muted-foreground">
            Complete patrols to see entries here
          </p>
        </div>
      ) : (
        <div>
          {patrolIds.map((patrolId) => (
            <div key={patrolId} className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-sm font-medium bg-secondary px-3 py-1.5 rounded-full">
                  Patrol #{patrolId.slice(-4)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(groupedEntries[patrolId][0].timestamp).toLocaleDateString()}
                </span>
              </div>

              {groupedEntries[patrolId].map((entry) => (
                <LogItem key={entry.id} entry={entry} />
              ))}
            </div>
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default Log;
