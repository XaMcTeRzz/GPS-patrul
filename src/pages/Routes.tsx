
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPoint from '@/components/PatrolPoint';
import CustomAddPointModal from '@/components/CustomAddPointModal';
import CustomEditPointModal from '@/components/CustomEditPointModal';
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
    if (window.confirm('Ви впевнені, що хочете видалити цю точку?')) {
      deletePatrolPoint(id);
    }
  };

  return (
    <div className="patrol-container pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Маршрути обходу</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Додати точку
        </button>
      </div>

      {patrolPoints.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Ще немає точок обходу</h3>
          <p className="text-muted-foreground mb-4">
            Додайте точки, щоб створити маршрут обходу
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Додати першу точку
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

      <CustomAddPointModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPatrolPoint}
      />

      <CustomEditPointModal
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
