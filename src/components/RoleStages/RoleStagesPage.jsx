import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from 'lucide-react';
import authService from '../../services/services';
import RoleStagesList from './RoleStagesList';

const RoleStagesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stages, setStages] = useState([]);
  const [formData, setFormData] = useState({
    name: 'Silver',
    goalFor: 'AGENCY',
    goals: [
      { goalType: 'DIAMOND', minValue: '' },
      { goalType: 'CASHOUT', minValue: '' }
    ]
  });

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    setIsLoading(true);
    try {
      const result = await authService.getAllGoals();
      if (result.success) {
        setStages(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (stage) => {
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      goalFor: stage.goalFor,
      goals: stage.goals.map(g => ({
        goalType: g.goalType,
        minValue: g.minValue
      }))
    });
    setIsCreating(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGoalChange = (index, field, value) => {
    const newGoals = [...formData.goals];
    newGoals[index][field] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { goalType: 'DIAMOND', minValue: '' }]
    });
  };

  const removeGoal = (index) => {
    const newGoals = formData.goals.filter((_, i) => i !== index);
    setFormData({ ...formData, goals: newGoals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ensure minValues are numbers
      const payload = {
        ...formData,
        goals: formData.goals.map(g => ({
          ...g,
          minValue: Number(g.minValue)
        }))
      };

      console.log('Submitting Tier Data:', payload);
      const result = await authService.saveTiers(payload);
      
      if (result.success) {
        alert(editingStage ? 'Role stage updated successfully!' : 'Role stage created successfully!');
        setIsCreating(false);
        setEditingStage(null);
        fetchStages(); // Refresh list
        // Reset form
        setFormData({
          name: 'Silver',
          goalFor: 'AGENCY',
          goals: [
            { goalType: 'DIAMOND', minValue: '' },
            { goalType: 'CASHOUT', minValue: '' }
          ]
        });
      } else {
        alert('Failed to save role stage: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreating) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => {
              setIsCreating(false);
              setEditingStage(null);
            }}
            className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {editingStage ? 'Edit Role Stage' : 'Create New Role Stage'}
            </h1>
            <p className="text-gray-400 text-sm">
              {editingStage ? 'Modify existing stage goals' : 'Define a new stage and its goals'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Basic Info Section */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/5 space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Stage Name</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-black/90 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F72585] transition-colors appearance-none"
                >
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Goal For Role</label>
                <select
                  name="goalFor"
                  value={formData.goalFor}
                  onChange={handleInputChange}
                  className="w-full bg-black/90 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F72585] transition-colors appearance-none"
                >
                  <option value="AGENCY">Agency</option>
                  <option value="HOST">Host</option>
                  <option value="MASTER_AGENCY">Master Agency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Stage Goals</h2>
              {/* <button
                type="button"
                onClick={addGoal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F72585]/10 text-[#F72585] hover:bg-[#F72585]/20 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button> */}
            </div>

            <div className="space-y-4">
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-4 bg-black/20 p-4 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Goal Type</label>
                      <select
                        value={goal.goalType}
                        onChange={(e) => handleGoalChange(index, 'goalType', e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F72585] transition-colors"
                      >
                        <option value="DIAMOND">Diamond</option>
                        <option value="CASHOUT">Cashout</option>
                        {/* <option value="COIN">Coin</option> */}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Min Value</label>
                      <input
                        type="number"
                        value={goal.minValue}
                        onChange={(e) => handleGoalChange(index, 'minValue', Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F72585] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="mt-6 p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {formData.goals.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm italic border-2 border-dashed border-white/5 rounded-lg">
                  No goals defined. Click "Add Goal" to start.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-start gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingStage(null);
              }}
              className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#F72585]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? (editingStage ? 'Updating...' : 'Creating...') : (editingStage ? 'Update Stage' : 'Create Stage')}
            </button>
          </div>
        </form> 
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Role Stages</h1>
          <p className="text-gray-400">Manage achievement stages and goals for different roles</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Stage
        </button>
      </div>
      
      {isLoading && stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#F72585] animate-spin mb-4" />
          <p className="text-gray-400">Loading role stages...</p>
        </div>
      ) : stages.length > 0 ? (
        <RoleStagesList stages={stages} onEdit={handleEdit} />
      ) : (
        <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-8 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-white font-medium mb-2">No Stages Found</h3>
          <p className="text-gray-400 text-sm mb-6">Get started by creating a new role stage</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-[#F72585] hover:text-[#7209B7] font-medium transition-colors"
          >
            Create your first stage &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleStagesPage;
