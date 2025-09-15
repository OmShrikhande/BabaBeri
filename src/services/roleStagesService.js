// Frontend-only role stages storage using localStorage
// Stages are percentage-based and pre-seeded from achievementTiers

import { achievementTiers } from '../data/agencyData';

export const STORAGE_KEY = 'roleStagesConfig';
export const DEFAULT_ROLES = ['admin', 'master-agency', 'agency', 'host'];

// Map a known tier id to a logo path in public/Logos
const getStageImage = (tierId) => {
  const id = String(tierId || '').toLowerCase().trim();
  if (id.includes('silver')) return '/Logos/silver .png'; // note: file has a space before .png
  if (id.includes('gold')) return '/Logos/gold.png';
  if (id.includes('platinum')) return '/Logos/platinum.png';
  return null;
};

const createDefaultStages = () => {
  // Use first three tiers from data as defaults (silver, gold, platinum)
  const base = achievementTiers?.slice(0, 3) || [];
  const fallback = [
    { id: 'silver', name: 'Royal Silver', revenueShare: 10 },
    { id: 'gold', name: 'Royal Gold', revenueShare: 15 },
    { id: 'platinum', name: 'Royal Platinum', revenueShare: 20 },
  ];
  const tiers = base.length === 3 ? base : fallback;
  return tiers.map((t, i) => ({
    id: t.id || `tier-${i + 1}`,
    name: t.name || `Stage ${i + 1}`,
    percentage: Number(t.revenueShare ?? 0),
    description: t.requirements || '',
    // Force default images in order: silver, gold, platinum
    image: i === 0 ? '/Logos/silver .png' : i === 1 ? '/Logos/gold.png' : i === 2 ? '/Logos/platinum.png' : getStageImage(t.id || t.name),
  }));
};

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

const migrateStage = (stage) => {
  if (!stage) return stage;
  const migrated = { ...stage };
  // Migrate numeric value -> percentage if old schema
  if (migrated.value !== undefined && migrated.percentage === undefined) {
    migrated.percentage = Number(migrated.value) || 0;
    delete migrated.value;
  }
  // Ensure bounds
  if (typeof migrated.percentage === 'number') {
    migrated.percentage = Math.max(0, Math.min(100, migrated.percentage));
  }
  // Fill image if missing by inferring from name/id
  if (!migrated.image) {
    const inferredId = (migrated.id || migrated.name || '').toString();
    const img = getStageImage(inferredId);
    if (img) migrated.image = img;
  }
  return migrated;
};

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultConfig();
    const parsed = JSON.parse(raw);
    DEFAULT_ROLES.forEach((role) => {
      if (!parsed[role]) parsed[role] = { stages: createDefaultStages(), updatedAt: new Date().toISOString() };
      if (!Array.isArray(parsed[role].stages)) parsed[role].stages = createDefaultStages();
      // Do NOT truncate here; migrate each stage to ensure percentage and image
      parsed[role].stages = parsed[role].stages.map(migrateStage);
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

export const createStage = (role, stage, allowUnlimited = false) => {
  const data = readStorage();
  const current = data[role] || { stages: [], updatedAt: null };
  // Enforce max 3 only when not unlimited
  if (!allowUnlimited && current.stages.length >= 3) throw new Error('Maximum of 3 stages allowed per role');
  const nextIndex = current.stages.length;
  // Default image by index: 0->silver, 1->gold, 2->platinum
  const defaultImageByIndex = () => {
    if (nextIndex === 0) return '/Logos/silver .png';
    if (nextIndex === 1) return '/Logos/gold.png';
    if (nextIndex === 2) return '/Logos/platinum.png';
    return null;
  };
  const newStage = migrateStage({
    id: stage?.id || `s-${Math.random().toString(36).slice(2)}-${Date.now()}`,
    name: String(stage?.name || '').trim() || `Stage ${current.stages.length + 1}`,
    percentage: Number(stage?.percentage ?? stage?.value ?? 0),
    description: String(stage?.description || ''),
    image: stage?.image || defaultImageByIndex() || getStageImage(stage?.id || stage?.name),
  });
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
  const updatedStage = migrateStage({
    ...current.stages[idx],
    ...(updates?.name !== undefined ? { name: String(updates.name).trim() } : {}),
    ...(updates?.percentage !== undefined ? { percentage: Number(updates.percentage) } : {}),
    ...(updates?.value !== undefined ? { percentage: Number(updates.value) } : {}),
    ...(updates?.description !== undefined ? { description: String(updates.description) } : {}),
    ...(updates?.image !== undefined ? { image: updates.image || null } : {}),
  });
  const next = { ...current, stages: current.stages.map((s, i) => (i === idx ? updatedStage : s)), updatedAt: new Date().toISOString() };
  data[role] = next;
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