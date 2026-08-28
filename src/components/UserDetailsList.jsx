import React, { useState, useEffect } from 'react';
import {
  X, Search, Coins, Gem, Calendar, User, Eye, ArrowLeft, RefreshCw,
} from 'lucide-react';
import authService from '../services/authService';
import Pagination from './Pagination';
import ModalPortal from './common/ModalPortal';
import { DASHBOARD_MODAL_OVERLAY } from '../utils/dashboardSidebarClasses';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatMoney = (value) => {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString();
};

const formatType = (type) =>
  String(type || '—')
    .split('_')
    .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
    .join(' ');

/** Align with /auth/api/user-full-data: { status, code, data: { profile, devices, ... } } */
const parseUserFullDataResponse = (result) => {
  if (!result?.success) {
    return { error: result?.error || 'Failed to fetch detailed profile data.' };
  }

  const payload = result.data;
  const fullData = payload?.data ?? payload;

  if (!fullData || typeof fullData !== 'object') {
    return { error: payload?.message || 'Invalid user full data response.' };
  }

  const profile = fullData.profile || fullData;
  if (!profile?.code && !profile?.username) {
    return { error: 'User profile not found in API response.' };
  }

  return {
    data: {
      ...fullData,
      profile: fullData.profile || profile,
      devices: Array.isArray(fullData.devices) ? fullData.devices : [],
      walletHistory: fullData.walletHistory || [],
      rechargeHistory: fullData.rechargeHistory || [],
      vipPlans: fullData.vipPlans || [],
      posts: fullData.posts || [],
      followers: fullData.followers || [],
      following: fullData.following || [],
    },
  };
};

const EmptyState = ({ message }) => (
  <div className="p-8 text-center text-gray-500 text-sm">{message}</div>
);

const DataTable = ({ columns, rows, emptyMessage = 'No records found.' }) => {
  if (!rows || rows.length === 0) {
    return (
      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="audit-table-wrap border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
      <div className="audit-table-scroll responsive-table-scroll">
        <table className="audit-data-table w-full min-w-[720px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`audit-table-th text-center ${col.headerClassName || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="audit-table-body">
            {rows.map((row, idx) => (
              <tr key={row.id ?? row.transactionno ?? row.transactionid ?? idx}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`audit-table-td text-center ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = String(status || '').toUpperCase();
  const ok =
    s === 'SUCCESS' ||
    s === 'APPROVED' ||
    s === 'ACTIVE' ||
    s === 'CREDIT' ||
    s === 'TRUE';
  const warn = s === 'PENDING' || s === 'NOTVERIFIED';
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
        ok
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : warn
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
      }`}
    >
      {status || '—'}
    </span>
  );
};

const PersonCell = ({ user }) => {
  if (!user) return '—';
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      {user.profilepic ? (
        <img src={user.profilepic} alt="" className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
          {(user.name || user.username || '?').charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-white font-medium">{user.name || user.username || '—'}</p>
        <p className="text-gray-500 font-mono">{user.code || '—'}</p>
      </div>
    </div>
  );
};

const DETAIL_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'recharge', label: 'Recharge' },
  { id: 'vip', label: 'VIP' },
  { id: 'coins', label: 'Coin Trade' },
  { id: 'cashout', label: 'Cashout' },
  { id: 'live', label: 'Live / Host' },
  { id: 'social', label: 'Social' },
  { id: 'posts', label: 'Posts' },
  { id: 'devices', label: 'Devices' },
  { id: 'other', label: 'Other' },
];

const UserDetailsList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedUserCode, setSelectedUserCode] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch users.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred fetching users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];

    if (selectedRole !== 'ALL') {
      result = result.filter((user) => {
        const userRole = (user.role || '').toUpperCase();
        if (selectedRole === 'AGENCY') return userRole === 'AGENCY';
        if (selectedRole === 'MASTERAGENCY') {
          return userRole === 'MASTERAGENCY' || userRole === 'MASTER-AGENCY' || userRole === 'MASTER_AGENCY';
        }
        if (selectedRole === 'SUBADMIN') {
          return (
            userRole === 'SUBADMIN' ||
            userRole === 'SUB-ADMIN' ||
            userRole === 'SUB_ADMIN' ||
            userRole === 'ADMIN'
          );
        }
        if (selectedRole === 'HOST') {
          return userRole === 'HOST' || userRole === 'LIVEHOST' || userRole === 'LIVE-HOST';
        }
        return false;
      });
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.name || '').toLowerCase().includes(term) ||
          (user.code || '').toLowerCase().includes(term) ||
          (user.email || '').toLowerCase().includes(term),
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, selectedRole, searchTerm]);

  const handleUserClick = async (code) => {
    setSelectedUserCode(code);
    setDetailLoading(true);
    setDetailError(null);
    setUserDetailData(null);
    setActiveTab('profile');

    try {
      const result = await authService.getUserFullData(code);
      const parsed = parseUserFullDataResponse(result);
      if (parsed.data) {
        setUserDetailData(parsed.data);
      } else {
        setDetailError(parsed.error || 'Failed to fetch detailed profile data.');
      }
    } catch (err) {
      setDetailError(err.message || 'An error occurred fetching user full data.');
    } finally {
      setDetailLoading(false);
    }
  };

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const tabCount = (id) => {
    if (!userDetailData) return 0;
    switch (id) {
      case 'wallet':
        return userDetailData.walletHistory?.length || 0;
      case 'recharge':
        return userDetailData.rechargeHistory?.length || 0;
      case 'vip':
        return userDetailData.vipPlans?.length || 0;
      case 'coins':
        return (userDetailData.coinsSold?.length || 0) + (userDetailData.coinsBought?.length || 0);
      case 'cashout':
        return userDetailData.cashoutRequests?.length || 0;
      case 'social':
        return (userDetailData.followers?.length || 0) + (userDetailData.following?.length || 0);
      case 'posts':
        return userDetailData.posts?.length || 0;
      case 'devices':
        return userDetailData.devices?.length || 0;
      default:
        return null;
    }
  };

  const renderDetailTab = () => {
    const d = userDetailData;
    if (!d) return null;

    if (activeTab === 'profile') {
      const profileFields = [
        { label: 'Username', value: d.profile?.username },
        { label: 'Email', value: d.profile?.email },
        { label: 'Mobile', value: d.profile?.mobile },
        { label: 'Code', value: d.profile?.code },
        { label: 'Role', value: d.profile?.role },
        { label: 'Status', value: d.profile?.status },
        { label: 'Type', value: d.profile?.type },
        { label: 'Email Verified', value: d.profile?.emailVerified ? 'Yes' : 'No' },
        { label: 'Google Login', value: d.profile?.registeredWithGoogle ? 'Yes' : 'No' },
        { label: 'Seller', value: d.profile?.isseller },
        { label: 'Live Host', value: d.profile?.livehost },
        { label: 'Level', value: d.profile?.level },
        { label: 'Gender', value: d.profile?.gender },
        { label: 'DOB', value: d.profile?.dob },
        { label: 'Country', value: d.profile?.country },
        { label: 'State', value: d.profile?.state },
        { label: 'City', value: d.profile?.city },
        { label: 'Followers', value: d.profile?.myfollowers },
        { label: 'Following', value: d.profile?.mefollowing },
        { label: 'Owner', value: d.profile?.owner },
        { label: 'Owner Name', value: d.profile?.ownername },
        { label: 'Agency Code', value: d.profile?.hosttoagnc },
        { label: 'Join Date', value: d.profile?.joinDate },
        { label: 'First Login', value: d.profile?.firstLogin ? 'Yes' : 'No' },
        { label: 'Bio', value: d.profile?.bio },
        {
          label: 'Profile Pic Status',
          value: d.profilePic?.status || (Array.isArray(d.profilePic) ? `${d.profilePic.length} pics` : '—'),
        },
      ];

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileFields.map((item) => (
              <div key={item.label} className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.label}</span>
                <span className="text-sm text-gray-200 font-medium break-all">
                  {item.value !== null && item.value !== undefined && item.value !== ''
                    ? String(item.value)
                    : '—'}
                </span>
              </div>
            ))}
          </div>

          {d.profilePic?.path || d.profile?.profilepic ? (
            <div className="bg-[#121212] border border-white/5 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Profile Picture</p>
              <div className="flex items-center gap-4">
                <img
                  src={d.profilePic?.path || d.profile?.profilepic}
                  alt="profile"
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Status: <StatusBadge status={d.profilePic?.status || '—'} /></p>
                  <p className="font-mono break-all">{d.profilePic?.path || d.profile?.profilepic}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeTab === 'wallet') {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white mb-4 pb-2 border-b border-white/10">Wallet History</h4>
          <DataTable
            emptyMessage="No wallet history."
            rows={d.walletHistory || []}
            columns={[
              { key: 'id', label: 'ID', render: (r) => r.id },
              {
                key: 'type',
                label: 'Type',
                render: (r) => <span className="text-white font-medium">{formatType(r.type)}</span>,
              },
              {
                key: 'coins',
                label: 'Coins',
                className: 'font-bold text-yellow-400',
                render: (r) => formatMoney(r.coins),
              },
              { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
            ]}
          />

          <h4 className="text-sm font-semibold text-white pt-2">Superadmin Coin Ledger</h4>
          <DataTable
            emptyMessage="No ledger entries."
            rows={d.superadminCoinLedger || []}
            columns={[
              {
                key: 'transactionno',
                label: 'Txn',
                className: 'font-mono text-gray-400',
                render: (r) => r.transactionno || '—',
              },
              { key: 'rechargeFor', label: 'For', render: (r) => r.rechargeFor || '—' },
              { key: 'rechargeForName', label: 'Name', render: (r) => r.rechargeForName || '—' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => <StatusBadge status={r.status} />,
              },
              {
                key: 'mycoins',
                label: 'Coins',
                className: 'font-bold',
                render: (r) => (
                  <span className={r.status === 'CREDIT' ? 'text-green-400' : 'text-red-400'}>
                    {r.status === 'CREDIT' ? '+' : '−'}
                    {formatMoney(r.mycoins)}
                  </span>
                ),
              },
              { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
            ]}
          />
        </div>
      );
    }

    if (activeTab === 'recharge') {
      return (
        <DataTable
          emptyMessage="No recharge records."
          rows={d.rechargeHistory || []}
          columns={[
            {
              key: 'transactionid',
              label: 'Transaction ID',
              className: 'font-mono text-gray-400',
              render: (r) => r.transactionid || '—',
            },
            { key: 'rechargeby', label: 'By', render: (r) => r.rechargeby || '—' },
            {
              key: 'coins',
              label: 'Coins',
              className: 'text-yellow-400 font-bold',
              render: (r) => formatMoney(r.coins),
            },
            {
              key: 'amount',
              label: 'Amount',
              render: (r) => (r.amount != null ? `₹${formatMoney(r.amount)}` : '—'),
            },
            { key: 'paymentmethod', label: 'Method', render: (r) => r.paymentmethod || '—' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            { key: 'remarks', label: 'Remarks', render: (r) => r.remarks || '—' },
            { key: 'rechargedate', label: 'Date', render: (r) => formatDate(r.rechargedate || r.createdat) },
          ]}
        />
      );
    }

    if (activeTab === 'vip') {
      return (
        <DataTable
          emptyMessage="No VIP plans."
          rows={d.vipPlans || []}
          columns={[
            { key: 'planName', label: 'Plan', render: (r) => r.planName || '—' },
            { key: 'planSource', label: 'Source', render: (r) => r.planSource || '—' },
            { key: 'totalCoins', label: 'Total', render: (r) => formatMoney(r.totalCoins) },
            { key: 'adminShare', label: 'Admin Share', render: (r) => formatMoney(r.adminShare) },
            { key: 'remainingCoins', label: 'Remaining', render: (r) => formatMoney(r.remainingCoins) },
            { key: 'coinsReturned', label: 'Returned', render: (r) => formatMoney(r.coinsReturned) },
            { key: 'dailyCredit', label: 'Daily', render: (r) => formatMoney(r.dailyCredit) },
            { key: 'validityDays', label: 'Days', render: (r) => r.validityDays ?? '—' },
            { key: 'daysCompleted', label: 'Done', render: (r) => r.daysCompleted ?? '—' },
            {
              key: 'friendBadges',
              label: 'Friend Badges',
              render: (r) => `${r.friendBadgesUsed ?? 0}/${r.friendBadgesAllowed ?? 0}`,
            },
            { key: 'startDate', label: 'Start', render: (r) => r.startDate || '—' },
            { key: 'endDate', label: 'End', render: (r) => r.endDate || '—' },
            {
              key: 'active',
              label: 'Active',
              render: (r) => <StatusBadge status={r.active ? 'ACTIVE' : 'INACTIVE'} />,
            },
          ]}
        />
      );
    }

    if (activeTab === 'coins') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Coins Sold</h4>
            <DataTable
              emptyMessage="No coins sold."
              rows={d.coinsSold || []}
              columns={[
                { key: 'seller', label: 'Seller', render: (r) => r.seller || '—' },
                { key: 'buyer', label: 'Buyer', render: (r) => r.buyer || '—' },
                {
                  key: 'coins',
                  label: 'Coins',
                  className: 'text-yellow-400 font-bold',
                  render: (r) => formatMoney(r.coins),
                },
                {
                  key: 'transactionno',
                  label: 'Txn',
                  className: 'font-mono text-gray-400',
                  render: (r) => r.transactionno || '—',
                },
                { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
              ]}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Coins Bought</h4>
            <DataTable
              emptyMessage="No coins bought."
              rows={d.coinsBought || []}
              columns={[
                { key: 'seller', label: 'Seller', render: (r) => r.seller || '—' },
                { key: 'buyer', label: 'Buyer', render: (r) => r.buyer || '—' },
                {
                  key: 'coins',
                  label: 'Coins',
                  className: 'text-yellow-400 font-bold',
                  render: (r) => formatMoney(r.coins),
                },
                {
                  key: 'transactionno',
                  label: 'Txn',
                  className: 'font-mono text-gray-400',
                  render: (r) => r.transactionno || '—',
                },
                { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
              ]}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Diamond Earnings / Sent / Received</h4>
            <DataTable
              emptyMessage="No diamond earnings."
              rows={d.diamondEarnings || []}
              columns={[
                { key: 'id', label: 'ID', render: (r) => r.id },
                { key: 'diamonds', label: 'Diamonds', render: (r) => formatMoney(r.diamonds ?? r.diamond) },
                { key: 'type', label: 'Type', render: (r) => formatType(r.type || r.source) },
                { key: 'date', label: 'Date', render: (r) => formatDate(r.date || r.createdAt) },
              ]}
            />
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DataTable
                emptyMessage="No diamonds sent."
                rows={d.diamondsSent || []}
                columns={[
                  { key: 'to', label: 'To', render: (r) => r.to || r.usercode || '—' },
                  { key: 'diamonds', label: 'Diamonds', render: (r) => formatMoney(r.diamonds ?? r.diamond) },
                  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
                ]}
              />
              <DataTable
                emptyMessage="No diamonds received."
                rows={d.diamondsReceived || []}
                columns={[
                  { key: 'from', label: 'From', render: (r) => r.from || r.usercode || '—' },
                  { key: 'diamonds', label: 'Diamonds', render: (r) => formatMoney(r.diamonds ?? r.diamond) },
                  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
                ]}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'cashout') {
      return (
        <div className="space-y-6">
          <DataTable
            emptyMessage="No cashout requests."
            rows={d.cashoutRequests || []}
            columns={[
              { key: 'id', label: 'ID', render: (r) => r.id },
              {
                key: 'diamonds',
                label: 'Diamonds',
                className: 'text-violet-400 font-bold',
                render: (r) => formatMoney(r.diamonds),
              },
              { key: 'cashAmount', label: 'Cash', render: (r) => formatMoney(r.cashAmount) },
              { key: 'profitOrLoss', label: 'P/L', render: (r) => (r.profitOrLoss != null ? formatMoney(r.profitOrLoss) : '—') },
              { key: 'remark', label: 'Remark', render: (r) => r.remark || '—' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              {
                key: 'transactionno',
                label: 'Txn',
                className: 'font-mono text-gray-400',
                render: (r) => r.transactionno || '—',
              },
              { key: 'role', label: 'Role', render: (r) => r.role || '—' },
              {
                key: 'redeemed_request_date',
                label: 'Requested',
                render: (r) => formatDate(r.redeemed_request_date),
              },
              {
                key: 'redeemed_approve_reject_date',
                label: 'Resolved',
                render: (r) => formatDate(r.redeemed_approve_reject_date),
              },
            ]}
          />
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Bank Accounts</h4>
            <DataTable
              emptyMessage="No bank accounts."
              rows={d.bankAccounts || []}
              columns={[
                { key: 'accholdername', label: 'Holder', render: (r) => r.accholdername || r.holderName || '—' },
                { key: 'Bankname', label: 'Bank', render: (r) => r.Bankname || r.bankName || '—' },
                {
                  key: 'accnumber',
                  label: 'Account',
                  className: 'font-mono',
                  render: (r) => r.accnumber || r.accountNumber || '—',
                },
                { key: 'ifsccode', label: 'IFSC', render: (r) => r.ifsccode || r.ifsc || '—' },
                { key: 'acctype', label: 'Type', render: (r) => r.acctype || r.accountType || '—' },
              ]}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 'live') {
      const app = d.liveHostApplication;
      return (
        <div className="space-y-6">
          <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Live Host Application</h4>
            {!app ? (
              <EmptyState message="No live host application." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  ['Name', app.name],
                  ['User Code', app.usercode],
                  ['Agency', app.agencycode],
                  ['DOB', app.dateOfBirth],
                  ['Nationality', app.nationality],
                  ['Email', app.email],
                  ['Email Status', app.emailstatus],
                  ['WhatsApp', app.whatsappNumber],
                  ['Aadhaar', app.aadhaarNumber],
                  ['Status', app.status],
                  ['Joined', formatDate(app.joiningDate)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-black/30 rounded-lg p-3">
                    <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">{label}</p>
                    <p className="text-gray-200 break-all">{value || '—'}</p>
                  </div>
                ))}
                {(app.document1Path || app.document2Path || app.livephotopath) && (
                  <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-2">
                    {app.document1Path && (
                      <a href={app.document1Path} target="_blank" rel="noreferrer" className="block">
                        <img src={app.document1Path} alt="doc1" className="h-24 rounded-lg border border-white/10 object-cover" />
                      </a>
                    )}
                    {app.document2Path && (
                      <a href={app.document2Path} target="_blank" rel="noreferrer" className="block">
                        <img src={app.document2Path} alt="doc2" className="h-24 rounded-lg border border-white/10 object-cover" />
                      </a>
                    )}
                    {app.livephotopath && (
                      <a href={app.livephotopath} target="_blank" rel="noreferrer" className="block">
                        <img src={app.livephotopath} alt="live" className="h-24 rounded-lg border border-white/10 object-cover" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Live Sessions</h4>
            <DataTable
              emptyMessage="No live sessions."
              rows={d.liveSessions || []}
              columns={[
                { key: 'id', label: 'ID', render: (r) => r.id },
                { key: 'room_name', label: 'Room', render: (r) => r.room_name || r.roomName || '—' },
                { key: 'duration_seconds', label: 'Duration (s)', render: (r) => r.duration_seconds ?? r.durationSeconds ?? '—' },
                { key: 'host_diamonds', label: 'Diamonds', render: (r) => formatMoney(r.host_diamonds ?? r.hostDiamonds) },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                { key: 'started_at', label: 'Started', render: (r) => formatDate(r.started_at || r.startedAt) },
                { key: 'ended_at', label: 'Ended', render: (r) => formatDate(r.ended_at || r.endedAt) },
              ]}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Daily Live Stats</h4>
            <DataTable
              emptyMessage="No daily live stats."
              rows={d.dailyLiveStats || []}
              columns={[
                { key: 'date', label: 'Date', render: (r) => r.date || '—' },
                {
                  key: 'total_duration_today_seconds',
                  label: 'Duration (s)',
                  render: (r) => r.total_duration_today_seconds ?? r.duration ?? '—',
                },
                {
                  key: 'completed_live_day',
                  label: 'Completed Day',
                  render: (r) => (r.completed_live_day ? 'Yes' : 'No'),
                },
                { key: 'session_count', label: 'Sessions', render: (r) => r.session_count ?? '—' },
              ]}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Live Stream Pics</h4>
            {(d.liveStreamPics || []).length === 0 ? (
              <EmptyState message="No live stream pictures." />
            ) : (
              <div className="flex flex-wrap gap-3">
                {(d.liveStreamPics || []).map((pic, i) => (
                  <a key={pic.id || i} href={pic.path || pic.url} target="_blank" rel="noreferrer">
                    <img
                      src={pic.path || pic.url}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover border border-white/10"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'social') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Followers ({d.followers?.length || 0})
            </h4>
            <DataTable
              emptyMessage="No followers."
              rows={d.followers || []}
              columns={[
                {
                  key: 'user',
                  label: 'Follower',
                  render: (r) => (
                    <PersonCell
                      user={{
                        name: r.name,
                        username: r.username,
                        profilepic: r.profilepic,
                        usercode: r.usercode,
                      }}
                    />
                  ),
                },
                { key: 'usercode', label: 'Code', className: 'font-mono text-white', render: (r) => r.usercode || '—' },
                { key: 'role', label: 'Role', render: (r) => r.role || '—' },
                { key: 'country', label: 'Country', render: (r) => r.country || '—' },
                { key: 'followedAt', label: 'Followed At', render: (r) => formatDate(r.followedAt) },
              ]}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Following ({d.following?.length || 0})
            </h4>
            <DataTable
              emptyMessage="Not following anyone."
              rows={d.following || []}
              columns={[
                {
                  key: 'user',
                  label: 'Following',
                  render: (r) => (
                    <PersonCell
                      user={{
                        name: r.name,
                        username: r.username,
                        profilepic: r.profilepic,
                        usercode: r.usercode,
                      }}
                    />
                  ),
                },
                { key: 'usercode', label: 'Code', className: 'font-mono text-white', render: (r) => r.usercode || '—' },
                { key: 'role', label: 'Role', render: (r) => r.role || '—' },
                { key: 'country', label: 'Country', render: (r) => r.country || '—' },
                { key: 'followedAt', label: 'Followed At', render: (r) => formatDate(r.followedAt) },
              ]}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Gifts Sent / Received</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DataTable
                emptyMessage="No gifts sent."
                rows={d.giftsSent || []}
                columns={[
                  { key: 'to', label: 'To', render: (r) => r.to || r.receiver || '—' },
                  { key: 'coins', label: 'Coins', render: (r) => formatMoney(r.coins || r.diamonds) },
                  { key: 'date', label: 'Date', render: (r) => formatDate(r.date || r.createdAt) },
                ]}
              />
              <DataTable
                emptyMessage="No gifts received."
                rows={d.giftsReceived || []}
                columns={[
                  { key: 'from', label: 'From', render: (r) => r.from || r.sender || '—' },
                  { key: 'coins', label: 'Coins', render: (r) => formatMoney(r.coins || r.diamonds) },
                  { key: 'date', label: 'Date', render: (r) => formatDate(r.date || r.createdAt) },
                ]}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <DataTable
          emptyMessage="No posts."
          rows={d.posts || []}
          columns={[
            { key: 'id', label: 'ID', render: (r) => r.id },
            {
              key: 'image',
              label: 'Image',
              render: (r) =>
                r.imagePath ? (
                  <a href={r.imagePath} target="_blank" rel="noreferrer">
                    <img src={r.imagePath} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  </a>
                ) : (
                  '—'
                ),
            },
            {
              key: 'caption',
              label: 'Caption',
              render: (r) => (
                <span className="max-w-[200px] truncate block" title={r.caption || ''}>
                  {r.caption || '—'}
                </span>
              ),
            },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            {
              key: 'likes',
              label: 'Likes',
              render: (r) =>
                r.likeCount ??
                (Array.isArray(r.likes) ? r.likes.length : r.likes ?? 0),
            },
            {
              key: 'comments',
              label: 'Comments',
              render: (r) =>
                r.commentCount ??
                (Array.isArray(r.comments) ? r.comments.length : r.comments ?? 0),
            },
            { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
          ]}
        />
      );
    }

    if (activeTab === 'devices') {
      const deviceRows = Array.isArray(d.devices) ? d.devices : [];

      return (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Device sessions from <code className="text-gray-400">data.devices</code> in{' '}
            <code className="text-gray-400">GET /auth/api/user-full-data?code=…</code>.
            Fields: <code className="text-gray-400">id</code>,{' '}
            <code className="text-gray-400">usercode</code>,{' '}
            <code className="text-gray-400">deviceId</code>,{' '}
            <code className="text-gray-400">loginAt</code>,{' '}
            <code className="text-gray-400">loggedOutAt</code>,{' '}
            <code className="text-gray-400">active</code>.
          </p>
          {deviceRows.length === 0 && (
            <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              API returned an empty <code className="text-amber-200">devices</code> array for{' '}
              <span className="font-mono">{d.profile?.code || selectedUserCode}</span>.
              This user has no tracked device logins yet (e.g. PX100). Try{' '}
              <span className="font-mono">PX104</span> to verify the table with live data.
            </p>
          )}
          <DataTable
            emptyMessage="No device sessions in API response."
            rows={deviceRows}
            columns={[
              { key: 'id', label: 'ID', render: (r) => r.id ?? '—' },
              {
                key: 'usercode',
                label: 'User Code',
                className: 'font-mono text-white',
                render: (r) => r.usercode ?? d.profile?.code ?? '—',
              },
              {
                key: 'deviceId',
                label: 'Device ID',
                className: 'font-mono text-white break-all max-w-[240px]',
                render: (r) => r.deviceId || r.deviceid || r.device_id || '—',
              },
              {
                key: 'loginAt',
                label: 'Login At',
                render: (r) => formatDate(r.loginAt || r.login_at),
              },
              {
                key: 'loggedOutAt',
                label: 'Logged Out',
                render: (r) => {
                  const out = r.loggedOutAt ?? r.logged_out_at;
                  return out ? formatDate(out) : '—';
                },
              },
              {
                key: 'active',
                label: 'Active',
                render: (r) => (
                  <StatusBadge status={r.active === true || r.active === 'true' ? 'ACTIVE' : 'INACTIVE'} />
                ),
              },
            ]}
          />
        </div>
      );
    }

    // other
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Level History</h4>
          <DataTable
            emptyMessage="No level records."
            rows={d.level || []}
            columns={[
              { key: 'id', label: 'ID', render: (r) => r.id ?? '—' },
              { key: 'level', label: 'Level', render: (r) => r.level ?? r.name ?? '—' },
              { key: 'date', label: 'Date', render: (r) => formatDate(r.date || r.createdAt) },
            ]}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Current Goal / Goal History</h4>
          {d.currentGoalTarget ? (
            <pre className="text-xs text-gray-300 bg-[#121212] border border-white/5 rounded-xl p-4 overflow-x-auto mb-4">
              {JSON.stringify(d.currentGoalTarget, null, 2)}
            </pre>
          ) : (
            <EmptyState message="No current goal target." />
          )}
          <DataTable
            emptyMessage="No goal history."
            rows={d.goalHistory || []}
            columns={[
              { key: 'id', label: 'ID', render: (r) => r.id ?? '—' },
              { key: 'name', label: 'Goal', render: (r) => r.name || r.goalName || '—' },
              { key: 'target', label: 'Target', render: (r) => formatMoney(r.target || r.maxValue) },
              { key: 'progress', label: 'Progress', render: (r) => formatMoney(r.progress || r.current) },
              { key: 'date', label: 'Date', render: (r) => formatDate(r.date || r.createdAt) },
            ]}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Sub Users / Owner</h4>
          <DataTable
            emptyMessage="No sub users."
            rows={d.subUsers || []}
            columns={[
              { key: 'code', label: 'Code', render: (r) => r.code || '—' },
              { key: 'name', label: 'Name', render: (r) => r.name || '—' },
              { key: 'role', label: 'Role', render: (r) => r.role || '—' },
            ]}
          />
          <div className="mt-4">
            <DataTable
              emptyMessage="No owner records."
              rows={Array.isArray(d.owner) ? d.owner : d.owner ? [d.owner] : []}
              columns={[
                { key: 'code', label: 'Code', render: (r) => r.code || '—' },
                { key: 'name', label: 'Name', render: (r) => r.name || '—' },
                { key: 'role', label: 'Role', render: (r) => r.role || '—' },
              ]}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080808] text-gray-100 min-h-screen">
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              User Details Management
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              View, search, filter and audit registered users and their ledgers.
            </p>
          </div>
          <button
            onClick={fetchUsersList}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 self-start">
            {['ALL', 'AGENCY', 'MASTERAGENCY', 'SUBADMIN', 'HOST'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  selectedRole === role
                    ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {role === 'MASTERAGENCY' ? 'MASTER AGENCY' : role === 'SUBADMIN' ? 'SUB ADMIN' : role}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, code, email..."
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
            />
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F72585]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : (
          <div className="audit-list-table-wrap bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto responsive-table-scroll">
              <table className="audit-data-table audit-list-table w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th className="audit-table-th text-center">User</th>
                    <th className="audit-table-th text-center">Code</th>
                    <th className="audit-table-th text-center">Role</th>
                    <th className="audit-table-th text-center">Coins</th>
                    <th className="audit-table-th text-center">Diamonds</th>
                    <th className="audit-table-th text-center">Joined</th>
                    <th className="audit-table-th text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="audit-table-body">
                  {currentUsers.map((user) => (
                    <tr
                      key={user.code || user.id}
                      onClick={() => handleUserClick(user.code)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {user.profilepic ? (
                            <img src={user.profilepic} alt="" className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{user.name || '—'}</p>
                            <p className="text-xs text-gray-500">{user.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-xs text-gray-300">{user.code || '—'}</td>
                      <td className="px-5 py-3.5 text-center text-sm text-gray-300">{user.role || '—'}</td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                          <Coins className="w-3.5 h-3.5" />
                          {user.coins ? user.coins.toLocaleString() : 0}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-violet-400">
                          <Gem className="w-3.5 h-3.5" />
                          {user.diamond ? user.diamond.toLocaleString() : 0}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap text-xs">
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-gradient-to-r hover:from-[#F72585] hover:to-[#7209B7] hover:text-white rounded-lg transition-all text-gray-400 font-semibold flex items-center justify-center gap-1 mx-auto">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onItemsPerPageChange={(limit) => {
                    setItemsPerPage(limit);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ModalPortal open={!!selectedUserCode}>
        <div className={DASHBOARD_MODAL_OVERLAY}>
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedUserCode(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-[min(100vw-1.5rem,72rem)] min-w-0 bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[min(92vh,100dvh-1.5rem)]">
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUserCode(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white">Detailed Audit Profile</h3>
                  <p className="text-xs text-gray-400">User Code: {selectedUserCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserCode(null)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F72585] mb-4" />
                <p className="text-gray-400">Loading comprehensive logs...</p>
              </div>
            ) : detailError ? (
              <div className="flex-1 min-h-[300px] p-6 flex flex-col items-center justify-center text-center">
                <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Profile Details</p>
                <p className="text-gray-400 max-w-md text-sm">{detailError}</p>
                <button
                  onClick={() => handleUserClick(selectedUserCode)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-semibold text-sm rounded-xl"
                >
                  Retry Fetch
                </button>
              </div>
            ) : userDetailData ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="shrink-0 p-6 bg-gradient-to-r from-[#111] to-black border-b border-white/10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {userDetailData.profile?.profilepic ? (
                    <img
                      src={userDetailData.profile.profilepic}
                      alt={userDetailData.profile.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F72585]/10 to-[#7209B7]/10 border border-white/5 flex items-center justify-center text-white text-2xl font-bold">
                      {userDetailData.profile?.name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Name</span>
                      <span className="text-base font-bold text-white">{userDetailData.profile?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Role</span>
                      <span className="text-sm font-semibold text-white/95">{userDetailData.profile?.role || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Coins</span>
                      <span className="text-base font-bold text-yellow-400 flex items-center gap-1">
                        <Coins className="w-4 h-4" /> {userDetailData.profile?.coins?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Diamonds</span>
                      <span className="text-base font-bold text-violet-400 flex items-center gap-1">
                        <Gem className="w-4 h-4" /> {userDetailData.profile?.diamond?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 audit-detail-tabs border-b border-white/10 bg-[#0f0f0f]">
                  <div className="flex overflow-x-auto px-4 items-end gap-1 audit-detail-tabs-inner responsive-table-scroll">
                    {DETAIL_TABS.map((tab) => {
                      const count = tabCount(tab.id);
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`audit-detail-tab shrink-0 whitespace-nowrap ${
                            isActive ? 'audit-detail-tab-active' : 'audit-detail-tab-idle'
                          }`}
                        >
                          {tab.label}
                          {count != null ? ` (${count})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 audit-detail-content">
                  {renderDetailTab()}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-8 text-center text-gray-500">No profile found.</div>
            )}
          </div>
        </div>
      </ModalPortal>
    </div>
  );
};

export default UserDetailsList;
