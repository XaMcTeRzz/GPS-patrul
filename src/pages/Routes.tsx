import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { usePatrol } from '@/context/PatrolContext';
import Navbar from '@/components/Navbar';
import PatrolPointItem from '@/components/PatrolPointItem';
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
    <div className="container max-w-2xl mx-auto px-4 pb-24">
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Точки обходу</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary px-4 py-2 rounded-lg"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {patrolPoints.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-zinc-600" />
          <p className="mt-4 text-zinc-400">
            Додайте першу точку обходу
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {patrolPoints.map((point) => (
            <PatrolPointItem
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
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPoint(null);
        }}
        onSave={updatePatrolPoint}
        point={editingPoint}
      />

      <Navbar />
    </div>
  );
};

export default Routes;
