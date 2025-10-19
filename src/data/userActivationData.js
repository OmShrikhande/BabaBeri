export const userActivationRecords = [
  {
    id: 'MA-001',
    name: 'Noah Singh',
    role: 'master-agency',
    displayRole: 'Master Agency',
    region: 'UAE',
    coins: 1250000,
    status: 'pending-review',
    joinedAt: '2021-11-02T10:11:00Z',
    lastActive: '2024-03-01T20:19:00Z',
    auditHistory: [
      { status: 'pending-review', timestamp: '2024-03-01T20:19:00Z', actor: 'Fraud Team' },
      { status: 'active', timestamp: '2022-06-15T11:40:00Z', actor: 'Super Admin' },
      { status: 'active', timestamp: '2021-11-02T10:11:00Z', actor: 'System' }
    ]
  },
  {
    id: 'AG-5621',
    name: 'Mia Chen',
    role: 'agency',
    displayRole: 'Agency',
    region: 'Singapore',
    coins: 485000,
    status: 'suspended',
    joinedAt: '2022-03-22T18:52:00Z',
    lastActive: '2024-02-22T17:25:00Z',
    auditHistory: [
      { status: 'suspended', timestamp: '2024-02-02T07:32:00Z', actor: 'Compliance Team' },
      { status: 'active', timestamp: '2023-05-17T12:01:00Z', actor: 'Super Admin' },
      { status: 'active', timestamp: '2022-03-22T18:52:00Z', actor: 'System' }
    ]
  },
  {
    id: 'SA-2044',
    name: 'Avery Knight',
    role: 'sub-admin',
    displayRole: 'Sub Admin',
    region: 'India',
    coins: 12500,
    status: 'active',
    joinedAt: '2023-07-12T09:03:00Z',
    lastActive: '2024-03-05T09:45:00Z',
    auditHistory: [
      { status: 'active', timestamp: '2023-11-18T09:40:00Z', actor: 'Super Admin' },
      { status: 'suspended', timestamp: '2023-09-27T14:10:00Z', actor: 'Admin Team' },
      { status: 'active', timestamp: '2023-07-12T09:03:00Z', actor: 'System' }
    ]
  },
  {
    id: 'AG-2045',
    name: 'Fatima Al Farsi',
    role: 'agency',
    displayRole: 'Agency',
    region: 'UAE',
    coins: 710000,
    status: 'active',
    joinedAt: '2022-08-15T12:22:00Z',
    lastActive: '2024-03-02T14:45:00Z',
    auditHistory: [
      { status: 'active', timestamp: '2024-02-18T08:12:00Z', actor: 'Super Admin' },
      { status: 'suspended', timestamp: '2023-12-01T16:22:00Z', actor: 'Fraud Team' },
      { status: 'active', timestamp: '2022-08-15T12:22:00Z', actor: 'System' }
    ]
  },
  {
    id: 'MA-3042',
    name: 'Lucas Moreno',
    role: 'master-agency',
    displayRole: 'Master Agency',
    region: 'Mexico',
    coins: 860000,
    status: 'suspended',
    joinedAt: '2020-04-02T09:42:00Z',
    lastActive: '2024-02-24T11:18:00Z',
    auditHistory: [
      { status: 'suspended', timestamp: '2024-02-24T11:18:00Z', actor: 'Compliance Team' },
      { status: 'active', timestamp: '2023-10-05T16:32:00Z', actor: 'Super Admin' },
      { status: 'pending-review', timestamp: '2021-06-20T14:48:00Z', actor: 'Fraud Team' },
      { status: 'active', timestamp: '2020-04-02T09:42:00Z', actor: 'System' }
    ]
  },
  {
    id: 'SA-3081',
    name: 'Elena Petrova',
    role: 'sub-admin',
    displayRole: 'Sub Admin',
    region: 'Russia',
    coins: 38000,
    status: 'active',
    joinedAt: '2021-01-11T07:30:00Z',
    lastActive: '2024-02-28T09:55:00Z',
    auditHistory: [
      { status: 'active', timestamp: '2023-11-12T17:42:00Z', actor: 'Super Admin' },
      { status: 'suspended', timestamp: '2022-05-18T15:27:00Z', actor: 'Admin Team' },
      { status: 'active', timestamp: '2021-01-11T07:30:00Z', actor: 'System' }
    ]
  }
];

export const userRoleFilters = [
  { value: 'master-agency', label: 'Master Agency' },
  { value: 'agency', label: 'Agency' },
  { value: 'sub-admin', label: 'Sub Admin' }
];