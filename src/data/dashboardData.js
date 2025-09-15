// Dashboard mock data
export const metricsData = {
  totalSubAdmins: 156,
  totalMasterAgencies: 45,
  agencies: 287,
  hosts: 1234,
  overallCoins: 2450000,
  liveUsers: 5678,
  voiceRooms: 89,
  totalDiamonds: 125000
};

// Financial metrics data
export const financialMetricsData = {
  totalCoinsSell: {
    value: 8750000,
    formatted: '8.75M',
    change: '+12.5%',
    trend: 'up'
  },
  totalProfit: {
    value: 2340000,
    formatted: '2.34M',
    change: '+8.2%',
    trend: 'up'
  },
  totalLoss: {
    value: 156000,
    formatted: '156K',
    change: '-3.1%',
    trend: 'down'
  },
  totalDiamondCashout: {
    value: 1890000,
    formatted: '1.89M',
    change: '+15.7%',
    trend: 'up'
  }
};

export const coinsRechargeData = {
  weekly: [
    { name: 'Mon', amount: 12000, isCurrentPeriod: false },
    { name: 'Tue', amount: 19000, isCurrentPeriod: false },
    { name: 'Wed', amount: 15000, isCurrentPeriod: false },
    { name: 'Thu', amount: 22000, isCurrentPeriod: false },
    { name: 'Fri', amount: 18000, isCurrentPeriod: true },
    { name: 'Sat', amount: 25000, isCurrentPeriod: false },
    { name: 'Sun', amount: 16000, isCurrentPeriod: false }
  ],
  monthly: [
    { name: 'Jan', amount: 450000, isCurrentPeriod: false },
    { name: 'Feb', amount: 380000, isCurrentPeriod: false },
    { name: 'Mar', amount: 520000, isCurrentPeriod: false },
    { name: 'Apr', amount: 480000, isCurrentPeriod: false },
    { name: 'May', amount: 600000, isCurrentPeriod: false },
    { name: 'Jun', amount: 550000, isCurrentPeriod: false },
    { name: 'Jul', amount: 620000, isCurrentPeriod: false },
    { name: 'Aug', amount: 580000, isCurrentPeriod: false },
    { name: 'Sep', amount: 650000, isCurrentPeriod: false },
    { name: 'Oct', amount: 700000, isCurrentPeriod: false },
    { name: 'Nov', amount: 680000, isCurrentPeriod: false },
    { name: 'Dec', amount: 720000, isCurrentPeriod: true }
  ],
  yearly: [
    { name: '2020', amount: 4200000, isCurrentPeriod: false },
    { name: '2021', amount: 5800000, isCurrentPeriod: false },
    { name: '2022', amount: 6900000, isCurrentPeriod: false },
    { name: '2023', amount: 8200000, isCurrentPeriod: false },
    { name: '2024', amount: 9500000, isCurrentPeriod: true }
  ]
};

// Diamond analytics data
export const diamondAnalyticsData = {
  weekly: [
    { name: 'Mon', amount: 8500, cashout: 6800, profit: 1700, isCurrentPeriod: false },
    { name: 'Tue', amount: 12000, cashout: 9600, profit: 2400, isCurrentPeriod: false },
    { name: 'Wed', amount: 9800, cashout: 7840, profit: 1960, isCurrentPeriod: false },
    { name: 'Thu', amount: 15200, cashout: 12160, profit: 3040, isCurrentPeriod: false },
    { name: 'Fri', amount: 11500, cashout: 9200, profit: 2300, isCurrentPeriod: true },
    { name: 'Sat', amount: 18000, cashout: 14400, profit: 3600, isCurrentPeriod: false },
    { name: 'Sun', amount: 13200, cashout: 10560, profit: 2640, isCurrentPeriod: false }
  ],
  monthly: [
    { name: 'Jan', amount: 320000, cashout: 256000, profit: 64000, isCurrentPeriod: false },
    { name: 'Feb', amount: 280000, cashout: 224000, profit: 56000, isCurrentPeriod: false },
    { name: 'Mar', amount: 380000, cashout: 304000, profit: 76000, isCurrentPeriod: false },
    { name: 'Apr', amount: 350000, cashout: 280000, profit: 70000, isCurrentPeriod: false },
    { name: 'May', amount: 420000, cashout: 336000, profit: 84000, isCurrentPeriod: false },
    { name: 'Jun', amount: 390000, cashout: 312000, profit: 78000, isCurrentPeriod: false },
    { name: 'Jul', amount: 450000, cashout: 360000, profit: 90000, isCurrentPeriod: false },
    { name: 'Aug', amount: 410000, cashout: 328000, profit: 82000, isCurrentPeriod: false },
    { name: 'Sep', amount: 480000, cashout: 384000, profit: 96000, isCurrentPeriod: false },
    { name: 'Oct', amount: 520000, cashout: 416000, profit: 104000, isCurrentPeriod: false },
    { name: 'Nov', amount: 490000, cashout: 392000, profit: 98000, isCurrentPeriod: false },
    { name: 'Dec', amount: 550000, cashout: 440000, profit: 110000, isCurrentPeriod: true }
  ],
  yearly: [
    { name: '2020', amount: 3200000, cashout: 2560000, profit: 640000, isCurrentPeriod: false },
    { name: '2021', amount: 4100000, cashout: 3280000, profit: 820000, isCurrentPeriod: false },
    { name: '2022', amount: 4800000, cashout: 3840000, profit: 960000, isCurrentPeriod: false },
    { name: '2023', amount: 5600000, cashout: 4480000, profit: 1120000, isCurrentPeriod: false },
    { name: '2024', amount: 6400000, cashout: 5120000, profit: 1280000, isCurrentPeriod: true }
  ]
};

export const supporterCardsData = {
  thisMonthRecharge: {
    title: "This Month's Coin Recharge",
    value: "₹15,000",
    icon: "TrendingUp",
    color: "pink"
  },
  totalRecharge: {
    title: "Total Coin Recharge",
    value: "₹15,00,000",
    icon: "DollarSign",
    color: "purple"
  }
};

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sub-admins', label: 'Sub Admin', icon: 'Users' },
  { id: 'master-agency', label: 'Master Agency', icon: 'Building' },
  { id: 'agencies', label: 'Agencies', icon: 'Building2' },
  { id: 'host-verification', label: 'Host Verification', icon: 'Shield' },
  { id: 'users-details', label: 'Host Details', icon: 'UserCheck' },
  { id: 'live-monitoring', label: 'Live Monitoring', icon: 'Eye' },
  // { id: 'vs-monitoring', label: 'VS Monitoring', icon: 'Sword' }, // New entry
  // { id: 'party-monitoring', label: 'Party Monitoring', icon: 'Mic' }, // New entry
  { id: 'coin-recharge', label: 'Coin Recharge', icon: 'Coins' },
  { id: 'diamonds-wallet', label: 'Diamonds Cashout', icon: 'Gem' },
  { id: 'ranking', label: 'Rankings', icon: 'Trophy' },
  { id: 'role-stages', label: 'Role Stages', icon: 'Shield' },
  // { id: 'analytics', label: 'Analytics', icon: 'BarChart' },
  { id: 'user-details', label: 'User Details', icon: 'User' }, // Slight rename for clarity
  { id: 'vip-levels', label: 'VIP / Levels', icon: 'Crown' },
  { id: 'gifts-banners', label: 'Gifts / Banners', icon: 'Gift' },
  // { id: 'recordings', label: 'Recordings', icon: 'Video' },
  { id: 'block-user', label: 'Block Users', icon: 'UserX' },
  { id: 'reports-ban', label: 'Reports / Ban Request', icon: 'Flag' },
  // { id: 'ai-warnings', label: 'AI Warnings', icon: 'AlertTriangle' }, // Renamed from "All Warnings"
  // { id: 'songs-library', label: 'Songs Library', icon: 'Music' },
  // { id: 'developer-settings', label: 'Developer Settings', icon: 'Settings' }
];
