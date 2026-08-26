import authService from '../services/authService';

/** Roles already used with getAllSubUserByCode across the app */
export const SUB_USER_ROLES = {
  MASTER_AGENCY: 'MASTER_AGENCY',
  AGENCY: 'AGENCY',
  HOST: 'HOST',
};

export const normalizeSubUserList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

const codesOf = (item) => {
  if (!item || typeof item !== 'object') return [];
  return [
    authService.extractUserCode(item),
    item.code,
    item.usercode,
    item.userCode,
    item.agencyId,
    item.hosttoagnc,
    item.hostToAgnc,
    item.id,
    item._id,
  ]
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => String(v).trim().toLowerCase().replace(/^#/, ''));
};

/** Find a child user in a getAllSubUserByCode list by any known code */
export const findSubUserByCode = (list, ...candidates) => {
  const needles = candidates
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => String(v).trim().toLowerCase().replace(/^#/, ''));
  if (!needles.length) return null;
  return (Array.isArray(list) ? list : []).find((item) => {
    const hay = codesOf(item);
    return needles.some((n) => hay.includes(n));
  }) || null;
};

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const targetsFromTierGoals = (tierGoals) => {
  if (!Array.isArray(tierGoals) || !tierGoals.length) return { diamondTarget: null, cashoutTarget: null };
  const diamond = tierGoals.find((g) => String(g.goalType || '').toUpperCase() === 'DIAMOND');
  const cashout = tierGoals.find((g) => String(g.goalType || '').toUpperCase() === 'CASHOUT');
  return {
    diamondTarget: diamond != null ? num(diamond.minValue) : null,
    cashoutTarget: cashout != null ? num(cashout.minValue) : null,
  };
};

/**
 * Normalize current goal from a sub-user row.
 * Real API shape:
 *   user.goals = {
 *     stage, currentMonth, currentDiamond, currentCashout,
 *     diamondTarget, cashoutTarget, diamondAchievedPercent, cashoutAchievedPercent,
 *     tierGoals: [{ goalType, minValue }, ...]
 *   }
 */
export const extractCurrentGoal = (user) => {
  if (!user || typeof user !== 'object') return null;

  const g =
    (user.goals && typeof user.goals === 'object' && !Array.isArray(user.goals) && user.goals) ||
    (user.currentGoalTarget && typeof user.currentGoalTarget === 'object' && user.currentGoalTarget) ||
    (user.currentGoal && typeof user.currentGoal === 'object' && user.currentGoal) ||
    null;

  if (!g) return null;

  const fromTier = targetsFromTierGoals(g.tierGoals || g.goals);
  const diamondTarget = num(
    g.diamondTarget ?? fromTier.diamondTarget,
    0
  );
  const cashoutTarget = num(
    g.cashoutTarget ?? fromTier.cashoutTarget,
    0
  );

  // Treat presence of the goals object as the signal (targets may be 0)
  return {
    tierName: g.stage || user.stage || 'Current Goal',
    currentMonth: g.currentMonth || null,
    activeTier: g.activeTier ?? null,
    diamondTarget,
    cashoutTarget,
    hostTarget: cashoutTarget,
    diamondEarned: num(g.currentDiamond ?? g.diamondEarned),
    cashoutCount: num(g.currentCashout ?? g.cashoutCount),
    diamondAchievedPercent: num(g.diamondAchievedPercent, NaN),
    cashoutAchievedPercent: num(g.cashoutAchievedPercent, NaN),
    raw: g,
  };
};

/**
 * Load one entity's current goal by listing siblings under a parent code.
 * Agency: parentCode = master agency code, role = AGENCY
 * Master agency: parentCode = admin code, role = MASTER_AGENCY
 */
export const fetchSubUserCurrentGoal = async ({
  parentCode,
  role,
  entityCodes = [],
}) => {
  const code = String(parentCode || '').trim().replace(/^#/, '');
  if (!code || !role) {
    return { success: false, error: 'Parent code and role are required', goal: null, user: null };
  }

  const res = await authService.getAllSubUserByCode(code, role);
  if (!res.success) {
    return { success: false, error: res.error || 'Failed to load goals', goal: null, user: null };
  }

  const list = normalizeSubUserList(res.data);
  const user = findSubUserByCode(list, ...entityCodes);
  if (!user) {
    return {
      success: false,
      error: 'Entity not found under parent for goal lookup',
      goal: null,
      user: null,
      list,
    };
  }

  return {
    success: true,
    goal: extractCurrentGoal(user),
    user,
    list,
  };
};
