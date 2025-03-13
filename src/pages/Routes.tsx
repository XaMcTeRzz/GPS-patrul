import React, { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
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
    <div className="container pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Маршрути обходу</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-sm"
        >
          <Plus className="h-5 w-5 mr-2 inline-block" />
          Додати точку
        </button>
      </div>

      {patrolPoints.length === 0 ? (
        <div className="text-center py-12 bg-[#1A1D24] rounded-lg border border-[#2A2F38]">
          <div className="mb-4">
            <MapPin className="h-12 w-12 mx-auto text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-100 mb-2">Немає точок обходу</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Додайте першу точку для створення маршруту
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-sm inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Додати точку
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {patrolPoints.map((point) => (
            <PatrolPoint
              key={point.id}
              point={point}
              onEdit={(point) => {
                setEditingPoint(point);
                setIsEditModalOpen(true);
              }}
              onDelete={(id) => handleDeletePoint(id)}
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
