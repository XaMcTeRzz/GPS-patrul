import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPoint from '@/components/PatrolPoint';
import AddPointModal from '@/components/AddPointModal';
import EditPointModal from '@/components/EditPointModal';
import { type PatrolPoint as PatrolPointType } from '@/types/patrol-types';

const Routes = () => {
  const { patrolPoints, addPatrolPoint, updatePatrolPoint, deletePatrolPoint } = usePatrol();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PatrolPointType | null>(null);

  const handleOpenEditModal = (point: PatrolPointType) => {
    setEditingPoint(point);
    setIsEditModalOpen(true);
  };

  const handleDeletePoint = (id: string) => {
    if (window.confirm('Are you sure you want to delete this checkpoint?')) {
      deletePatrolPoint(id);
    }
  };

  return (
    <div className="patrol-container pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patrol Routes</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Checkpoint
        </button>
      </div>

      {patrolPoints.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No checkpoints added yet</h3>
          <p className="text-muted-foreground mb-4">
            Add checkpoints to create a patrol route
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Add First Checkpoint
          </button>
        </div>
      ) : (
        <div>
          {patrolPoints.map((point) => (
            <PatrolPoint
              key={point.id}
              point={point}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePoint}
            />
          ))}
        </div>
      )}

      {/* Add Point Modal */}
      <AddPointModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPatrolPoint}
      />

      {/* Edit Point Modal */}
      <EditPointModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updatePatrolPoint}
        point={editingPoint}
      />

      <Navbar />
    </div>
  );
};

export default Routes;
