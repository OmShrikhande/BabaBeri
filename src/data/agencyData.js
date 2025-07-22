// Mock data for agencies
export const agenciesData = [
  {
    id: 'AG001',
    name: 'StarLight Entertainment',
    totalAgencies: 15,
    goals: {
      current: 1,
      total: 2,
      progress: 50,
      moneyEarned: 1180,
      moneyTarget: 10000
    },
    earnings: {
      lastMonth: 8500,
      thisMonth: 12300,
      redeemDiamonds: 2500
    },
    tier: 'Royal Silver',
    revenueShare: 10,
    hosts: [
      { id: 'H001', name: 'Alice Johnson', earnings: 1200, redeemed: 850 },
      { id: 'H002', name: 'Bob Smith', earnings: 950, redeemed: 600 },
      { id: 'H003', name: 'Carol Davis', earnings: 1400, redeemed: 1100 },
      { id: 'H004', name: 'David Wilson', earnings: 800, redeemed: 500 },
    ]
  },
  {
    id: 'AG002',
    name: 'Golden Voice Agency',
    totalAgencies: 23,
    goals: {
      current: 2,
      total: 3,
      progress: 67,
      moneyEarned: 6700,
      moneyTarget: 10000
    },
    earnings: {
      lastMonth: 15600,
      thisMonth: 18200,
      redeemDiamonds: 4200
    },
    tier: 'Royal Gold',
    revenueShare: 15,
    hosts: [
      { id: 'H005', name: 'Emma Brown', earnings: 1800, redeemed: 1200 },
      { id: 'H006', name: 'Frank Miller', earnings: 1600, redeemed: 1000 },
      { id: 'H007', name: 'Grace Lee', earnings: 2200, redeemed: 1800 },
    ]
  },
  {
    id: 'AG003',
    name: 'Diamond Dreams Studio',
    totalAgencies: 8,
    goals: {
      current: 0,
      total: 2,
      progress: 100,
      moneyEarned: 12000,
      moneyTarget: 10000
    },
    earnings: {
      lastMonth: 22000,
      thisMonth: 28500,
      redeemDiamonds: 8500
    },
    tier: 'Royal Platinum',
    revenueShare: 20,
    hosts: [
      { id: 'H008', name: 'Henry Taylor', earnings: 3200, redeemed: 2500 },
      { id: 'H009', name: 'Iris Clark', earnings: 2800, redeemed: 2200 },
      { id: 'H010', name: 'Jack Anderson', earnings: 3500, redeemed: 3000 },
      { id: 'H011', name: 'Kelly White', earnings: 2100, redeemed: 1800 },
    ]
  },
  {
    id: 'AG004',
    name: 'Platinum Stream Network',
    totalAgencies: 31,
    goals: {
      current: 1,
      total: 3,
      progress: 33,
      moneyEarned: 3300,
      moneyTarget: 10000
    },
    earnings: {
      lastMonth: 19800,
      thisMonth: 24600,
      redeemDiamonds: 6800
    },
    tier: 'Royal Gold',
    revenueShare: 15,
    hosts: [
      { id: 'H012', name: 'Liam Harris', earnings: 2600, redeemed: 2000 },
      { id: 'H013', name: 'Mia Rodriguez', earnings: 2200, redeemed: 1500 },
      { id: 'H014', name: 'Noah Martinez', earnings: 2900, redeemed: 2400 },
    ]
  },
  {
    id: 'AG005',
    name: 'Crystal Voice Hub',
    totalAgencies: 12,
    goals: {
      current: 2,
      total: 2,
      progress: 0,
      moneyEarned: 11500,
      moneyTarget: 10000
    },
    earnings: {
      lastMonth: 16200,
      thisMonth: 21800,
      redeemDiamonds: 5200
    },
    tier: 'Royal Platinum',
    revenueShare: 20,
    hosts: [
      { id: 'H015', name: 'Olivia Garcia', earnings: 2400, redeemed: 1900 },
      { id: 'H016', name: 'Paul Thompson', earnings: 2100, redeemed: 1600 },
      { id: 'H017', name: 'Quinn Lopez', earnings: 2700, redeemed: 2300 },
      { id: 'H018', name: 'Ruby Adams', earnings: 1900, redeemed: 1400 },
    ]
  }
];

// Achievement tiers data
export const achievementTiers = [
  {
    id: 'silver',
    name: 'Royal Silver',
    revenueShare: 10,
    color: 'bg-gradient-to-r from-gray-400 to-gray-600',
    requirements: 'Complete 1 monthly goal'
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    revenueShare: 15,
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    requirements: 'Complete 2 monthly goals'
  },
  {
    id: 'platinum',
    name: 'Royal Platinum',
    revenueShare: 20,
    color: 'bg-gradient-to-r from-purple-400 to-purple-600',
    requirements: 'Complete 3 monthly goals'
  }
];