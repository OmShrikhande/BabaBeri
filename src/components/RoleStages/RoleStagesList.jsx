import React from 'react';
import { Target, Gem, Wallet, Edit2, Shield, Award, Crown } from 'lucide-react';

const RoleStagesList = ({ stages, onEdit }) => {
  const roles = ['ADMIN', 'MASTER_AGENCY', 'AGENCY', 'HOST'];
  const levels = ['Silver', 'Gold', 'Platinum'];

  const getTierStyles = (name) => {
    switch (name) {
      case 'Platinum':
        return {
          border: 'border-blue-400/30',
          bg: 'bg-gradient-to-br from-[#1e293b] to-[#0f172a]',
          text: 'text-blue-100',
          accent: 'text-blue-400',
          shadow: 'shadow-blue-500/10',
          icon: <Crown className="w-6 h-6 text-blue-400" />,
          button: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
        };
      case 'Gold':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-gradient-to-br from-[#2d1e0a] to-[#1a1105]',
          text: 'text-yellow-100',
          accent: 'text-yellow-500',
          shadow: 'shadow-yellow-500/10',
          icon: <Award className="w-6 h-6 text-yellow-500" />,
          button: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
        };
      default: // Silver
        return {
          border: 'border-slate-400/30',
          bg: 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]',
          text: 'text-slate-100',
          accent: 'text-slate-400',
          shadow: 'shadow-slate-500/10',
          icon: <Shield className="w-6 h-6 text-slate-400" />,
          button: 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
        };
    }
  };

  const groupedStages = roles.reduce((acc, role) => {
    const roleStages = stages.filter(s => s.goalFor === role);
    if (roleStages.length > 0) {
      acc[role] = levels.map(level => 
        roleStages.find(s => s.name === level)
      ).filter(Boolean);
    }
    return acc;
  }, {});

  if (stages.length === 0) return null;

  return (
    <div className="space-y-16 pb-12">
      {roles.map(role => groupedStages[role] && (
        <div key={role} className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-white tracking-wider">
              {role.replace('_', ' ')}
            </h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedStages[role].map((stage) => {
              const styles = getTierStyles(stage.name);
              return (
                <div 
                  key={stage.id} 
                  className={`relative group rounded-2xl border ${styles.border} ${styles.bg} ${styles.shadow} p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden`}
                >
                  {/* Decorative Background Elements */}
                  <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-10 blur-2xl rounded-full ${styles.accent.replace('text', 'bg')}`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${styles.accent}`}>
                          {styles.icon}
                        </div>
                        <div>
                          <h3 className={`text-2xl font-black tracking-tight ${styles.text}`}>
                            {stage.name}
                          </h3>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Achievement Tier
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onEdit(stage)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${styles.button}`}
                        title="Edit Stage"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {stage.goals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm group/goal hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              goal.goalType === 'DIAMOND' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'
                            }`}>
                              {goal.goalType === 'DIAMOND' ? (
                                <Gem className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <Wallet className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                Target {goal.goalType}
                              </p>
                              <p className="text-sm font-semibold text-gray-300">
                                {goal.goalType} Goal
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black tracking-tight ${styles.text}`}>
                              {goal.minValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#1A1A1A] bg-gray-800 flex items-center justify-center`}>
                            <Target className="w-3 h-3 text-gray-500" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Tier Active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoleStagesList;
