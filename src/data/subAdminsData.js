// Sub-Admins data and related structures
export const subAdminsData = [
  {
    id: 1,
    name: 'Sub Admin 1',
    adminId: '#120989',
    masterAgenciesCount: 150,
    profileImage: null,
    email: 'subadmin1@example.com',
    mobile: '+91 9876543210',
    aadhaar: '1234 5678 9012',
    dateOfBirth: '1990-01-15',
    status: 'active',
    goalsRemaining: {
      current: 1180,
      total: 10000,
      percentage: 11.8
    },
    earnings: {
      lastMonth: 12390,
      thisMonth: 12500000, // 12.5M
      redeemDiamonds: 12500000 // 12.5M
    },
    masterAgencies: [
      {
        id: 1,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 2,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 3,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 4,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 5,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 6,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      },
      {
        id: 7,
        name: 'Master Agency 1',
        agencyId: '#120989',
        myEarning: 1200,
        redeemed: 1200
      }
    ]
  },
  {
    id: 2,
    name: 'Sub Admin 2',
    adminId: '#120989',
    masterAgenciesCount: 120,
    profileImage: null,
    goalsRemaining: {
      current: 2500,
      total: 10000,
      percentage: 25
    },
    earnings: {
      lastMonth: 15000,
      thisMonth: 18000,
      redeemDiamonds: 18000
    },
    masterAgencies: [
      {
        id: 1,
        name: 'Master Agency 2',
        agencyId: '#120990',
        myEarning: 1500,
        redeemed: 1500
      }
    ]
  },
  {
    id: 3,
    name: 'Sub Admin 3',
    adminId: '#120989',
    masterAgenciesCount: 16,
    profileImage: null,
    masterAgencies: []
  },
  {
    id: 4,
    name: 'Sub Admin 4',
    adminId: '#120989',
    masterAgenciesCount: 123,
    profileImage: null,
    masterAgencies: []
  },
  {
    id: 5,
    name: 'Sub Admin 5',
    adminId: '#120989',
    masterAgenciesCount: 189,
    profileImage: null,
    masterAgencies: []
  },
  {
    id: 6,
    name: 'Main Sub Admin',
    adminId: '#120989',
    masterAgenciesCount: 189,
    profileImage: null,
    masterAgencies: []
  }
];

export const agenciesData = [
  {
    id: 1,
    name: 'Agency 1',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 2,
    name: 'Agency 2',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 3,
    name: 'Agency 3',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 4,
    name: 'Agency 4',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 5,
    name: 'Agency 5',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 6,
    name: 'Agency 6',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  },
  {
    id: 7,
    name: 'Agency 7',
    agencyId: '#120989',
    myEarning: 1200,
    redeemed: 1200
  }
];

export const royalTiers = [
  {
    id: 'silver',
    name: 'Royal Silver',
    revenueShare: '10.0% revenue share',
    icon: '🥈',
    bgColor: 'from-gray-400 to-gray-600'
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    revenueShare: '15.0% revenue share',
    icon: '🥇',
    bgColor: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'platinum',
    name: 'Royal Platinum',
    revenueShare: '20.0% revenue share',
    icon: '👑',
    bgColor: 'from-purple-400 to-purple-600'
  }
];