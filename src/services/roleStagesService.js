// Frontend-only role stages storage using localStorage
// Supports up to 3 stages per role with CRUD operations

const STORAGE_KEY = 'roleStagesConfig';

export const DEFAULT_ROLES = ['admin', 'master-agency', 'agency', 'host'];

const createDefaultStages = () => [
  { id: `s1-${Date.now()}`, name: 'Stage 1', value: 0, description: '' },
  { id: `s2-${Date.now()}`, name: 'Stage 2', value: 0, description: '' },
  { id: `s3-${Date.now()}`, name: 'Stage 3', value: 0, description: '' },
];

const createDefaultConfig = () => {
  const obj = {};
  DEFAULT_ROLES.forEach((role) => {
    obj[role] = {
      stages: createDefaultStages(),
      updatedAt: new Date().toISOString(),
    };
  });
  return obj;
};

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultConfig();
    const parsed = JSON.parse(raw);
    // Ensure required roles exist
    DEFAULT_ROLES.forEach((role) => {
      if (!parsed[role]) parsed[role] = { stages: createDefaultStages(), updatedAt: new Date().toISOString() };
      if (!Array.isArray(parsed[role].stages)) parsed[role].stages = createDefaultStages();
      // Enforce max 3 stages
      if (parsed[role].stages.length > 3) parsed[role].stages = parsed[role].stages.slice(0, 3);
    });
    return parsed;
  } catch {
    return createDefaultConfig();
  }
};

const writeStorage = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getRoles = () => [...DEFAULT_ROLES];

export const getAll = () => readStorage();

export const getByRole = (role) => {
  const data = readStorage();
  return data[role] || { stages: [], updatedAt: null };
};

export const createStage = (role, stage) => {
  const data = readStorage();
  const current = data[role] || { stages: [], updatedAt: null };
  if (current.stages.length >= 3) throw new Error('Maximum of 3 stages allowed per role');
  const newStage = {
    id: stage?.id || `s-${Math.random().toString(36).slice(2)}-${Date.now()}`,
    name: String(stage?.name || '').trim() || `Stage ${current.stages.length + 1}`,
    value: Number(stage?.value || 0),
    description: String(stage?.description || ''),
  };
  const updated = { ...current, stages: [...current.stages, newStage], updatedAt: new Date().toISOString() };
  data[role] = updated;
  writeStorage(data);
  return newStage;
};

export const updateStage = (role, stageId, updates) => {
  const data = readStorage();
  const current = data[role];
  if (!current) throw new Error('Role not found');
  const idx = current.stages.findIndex((s) => s.id === stageId);
  if (idx === -1) throw new Error('Stage not found');
  const updatedStage = {
    ...current.stages[idx],
    ...(updates?.name !== undefined ? { name: String(updates.name).trim() } : {}),
    ...(updates?.value !== undefined ? { value: Number(updates.value) } : {}),
    ...(updates?.description !== undefined ? { description: String(updates.description) } : {}),
  };
  const updated = { ...current, stages: current.stages.map((s, i) => (i === idx ? updatedStage : s)), updatedAt: new Date().toISOString() };
  data[role] = updated;
  writeStorage(data);
  return updatedStage;
};

export const deleteStage = (role, stageId) => {
  const data = readStorage();
  const current = data[role];
  if (!current) throw new Error('Role not found');
  const filtered = current.stages.filter((s) => s.id !== stageId);
  const updated = { ...current, stages: filtered, updatedAt: new Date().toISOString() };
  data[role] = updated;
  writeStorage(data);
  return true;
};

export const resetRole = (role) => {
  const data = readStorage();
  data[role] = { stages: createDefaultStages(), updatedAt: new Date().toISOString() };
  writeStorage(data);
  return data[role];
};

export const resetAll = () => {
  const defaults = createDefaultConfig();
  writeStorage(defaults);
  return defaults;
};

export default {
  STORAGE_KEY,
  DEFAULT_ROLES,
  getRoles,
  getAll,
  getByRole,
  createStage,
  updateStage,
  deleteStage,
  resetRole,
  resetAll,
};