import React, { useEffect, useMemo, useState } from 'react';
import { getRoles, getByRole, createStage, updateStage, deleteStage, resetRole } from '../../services/roleStagesService';
import authService from '../../services/authService';
import RoleSelector from './RoleSelector';
import StageForm from './StageForm';
import StageList from './StageList';
import ConfirmDialog from './ConfirmDialog';
import { Shield, Plus } from 'lucide-react';
import { getUserRoleDisplayName, isSuperAdmin } from '../../utils/roleBasedAccess';

const Section = ({ title, children, className = '' }) => (
  <section className={`bg-[#121212] rounded-xl border border-gray-800 p-6 ${className}`}>
    {title && <h2 className="text-lg font-semibold mb-4 text-white/90">{title}</h2>}
    {children}
  </section>
);

const RoleStagesPage = ({ currentUser }) => {
  const roles = useMemo(() => getRoles(), []);
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [stages, setStages] = useState([]);
  const [editing, setEditing] = useState(null); // stage being edited
  const [confirm, setConfirm] = useState(null); // { stage }
  const [percentages, setPercentages] = useState([]);



  // Load stages for the selected role
  useEffect(() => {
    const data = getByRole(activeRole);
    setStages(data.stages || []);
  }, [activeRole]);

  const roleMapping = {
    'admin': 'SUPERADMIN',
    'host': 'HOST',
    'master-agency': 'MASTER-AGENCY',
    'agency': 'AGENCY'
  };

  const getRolePercentage = (role) => {
    const percentFor = roleMapping[role];
    const percentage = percentages.find(p => p.percentfor === percentFor);
    return percentage ? percentage.percent : null;
  };

  const rolePercentage = getRolePercentage(activeRole);
  const maxStages = rolePercentage !== null ? rolePercentage : 3;
  const allowUnlimitedStages = isSuperAdmin(currentUser?.userType);
  const canAddMore = allowUnlimitedStages || stages.length < maxStages;

  // Fetch percentages if super admin
  useEffect(() => {
    if (isSuperAdmin(currentUser?.userType)) {
      const fetchPercentages = async () => {
        try {
          const token = authService.getToken();
          if (!token) return;
          const response = await fetch('https://proxstream.online/auth/superadmin/getallpercentage', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setPercentages(data);
          }
        } catch (error) {
          console.error('Failed to fetch percentages:', error);
        }
      };
      fetchPercentages();
    }
  }, [currentUser]);

  const refresh = () => {
    const data = getByRole(activeRole);
    setStages(data.stages || []);
  };

  const handleCreate = async (payload) => {
    try {
      createStage(activeRole, payload, allowUnlimitedStages);
      refresh();
      setEditing(null);
    } catch (e) {
      alert(e?.message || 'Failed to create stage');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      updateStage(activeRole, editing.id, payload);
      refresh();
      setEditing(null);
    } catch (e) {
      alert(e?.message || 'Failed to update stage');
    }
  };

  const handleDelete = async (stage) => setConfirm({ stage });

  const confirmDelete = () => {
    try {
      deleteStage(activeRole, confirm.stage.id);
      refresh();
      setConfirm(null);
    } catch (e) {
      alert(e?.message || 'Failed to delete stage');
    }
  };

  const handleResetRole = () => {
    if (!window.confirm('Reset stages to defaults for this role?')) return;
    resetRole(activeRole);
    refresh();
  };

  return (
    <div className="relative flex min-h-screen h-screen bg-[#0B0B0B] text-white flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-800 bg-[#121212] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Role Stages</h1>
            <p className="text-xs text-gray-400">Super Admin: configure stages per role based on percentages</p>
            {percentages.length > 0 && (
              <div className="flex gap-2 mt-2">
                {percentages.map((p) => (
                  <div key={p.id} className="px-2 py-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white text-xs rounded-md">
                    {p.percentfor}: {p.percent}%
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {currentUser && (
          <div className="text-right text-xs text-gray-400">
            <div className="text-gray-300">{currentUser.username}</div>
            <div>{getUserRoleDisplayName(currentUser.userType)}</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selection & Actions */}
        <Section title="Role" className="lg:col-span-1">
          <RoleSelector roles={roles} value={activeRole} onChange={setActiveRole} />
          <div className="mt-4 flex items-center gap-2">
            <button
              disabled={!canAddMore}
              onClick={() => setEditing({ id: null, name: '', percentage: 0, description: '' })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${canAddMore ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              <Plus className="w-4 h-4" /> Add Stage
            </button>
            <button
              onClick={handleResetRole}
              className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Reset Role
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Max {maxStages} stages per role. Customize label, percentage, and description.</p>
        </Section>

        {/* Stages List */}
        <Section title={`Stages for "${activeRole}"`} className="lg:col-span-2">
          <StageList
            stages={stages}
            onEdit={(s) => setEditing(s)}
            onDelete={handleDelete}
            selectedRole={roleMapping[activeRole] || activeRole.toUpperCase()}
          />
        </Section>

        {/* Editor */}
        {editing !== null && (
          <Section title={editing?.id ? 'Edit Stage' : 'Add Stage'} className="lg:col-span-3">
            <StageForm
              initial={editing?.id ? editing : null}
              onSubmit={editing?.id ? handleUpdate : handleCreate}
              onCancel={() => setEditing(null)}
            />
          </Section>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Delete Stage"
        message={`Are you sure you want to delete "${confirm?.stage?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default RoleStagesPage;