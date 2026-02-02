import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Save, Loader2, Shield, Target } from 'lucide-react';
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
    const existingStagesForRole = stages.filter(s => s.goalFor === formData.goalFor);

    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsCreating(false);
                setEditingStage(null);
              }}
              className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {editingStage ? 'Modify Stage' : 'New Role Stage'}
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                {editingStage ? 'Update goals for this achievement tier' : 'Configure a new performance milestone'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <div className="xl:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F72585]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#F72585] rounded-full"></span>
                  Configuration Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Stage Name</label>
                    <div className="relative">
                      <select
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all appearance-none cursor-pointer hover:border-white/20"
                      >
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Target Role</label>
                    <div className="relative">
                      <select
                        name="goalFor"
                        value={formData.goalFor}
                        onChange={handleInputChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all appearance-none cursor-pointer hover:border-white/20"
                      >
                        <option value="AGENCY">Agency</option>
                        <option value="HOST">Host</option>
                        <option value="MASTER_AGENCY">Master Agency</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#7209B7] rounded-full"></span>
                    Target Goals
                  </h2>
                </div>

                <div className="space-y-4">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-6 bg-black/30 p-5 rounded-2xl border border-white/5 group transition-all hover:border-white/10">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Metric Type</label>
                          <select
                            value={goal.goalType}
                            onChange={(e) => handleGoalChange(index, 'goalType', e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F72585] transition-all"
                          >
                            <option value="DIAMOND">Diamond</option>
                            <option value="CASHOUT">Cashout</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Minimum Value</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={goal.minValue}
                              onChange={(e) => handleGoalChange(index, 'minValue', e.target.value)}
                              placeholder="0"
                              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F72585] transition-all font-mono"
                              required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600 uppercase">Amount</div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="p-3 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Metric"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.goals.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm italic border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                      No metrics defined. Add a goal to continue.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingStage(null);
                  }}
                  className="px-8 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
                  disabled={isLoading}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#F72585]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isLoading ? 'Processing...' : editingStage ? 'Update Tier' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-black tracking-tight">Active {formData.goalFor} Stages</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Existing Configuration</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <Shield className="w-5 h-5 text-[#F72585]" />
                </div>
              </div>

              <div className="space-y-6">
                {existingStagesForRole.length > 0 ? (
                  existingStagesForRole.map((stage) => (
                    <div key={stage.id} className="relative group overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            stage.name === 'Platinum' ? 'bg-blue-400' : 
                            stage.name === 'Gold' ? 'bg-yellow-500' : 'bg-slate-400'
                          }`}></div>
                          <span className="text-white font-bold">{stage.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">ID: {stage.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {stage.goals.map((g, i) => (
                          <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{g.goalType}</p>
                            <p className="text-white font-black">{g.minValue.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                      <Plus className="w-8 h-8 text-gray-700" />
                    </div>
                    <p className="text-gray-400 font-bold text-sm">No existing stages found</p>
                    <p className="text-gray-600 text-xs mt-2">New stages created for {formData.goalFor} will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
