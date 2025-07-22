import React from 'react';
import MetricsCard from './MetricsCard';
import ChartCard from './ChartCard';
import SupporterCard from './SupporterCard';
import { metricsData, supporterCardsData } from '../data/dashboardData';

const Dashboard = () => {
  const metricsCards = [
    {
      title: 'Total Sub-Admins',
      value: metricsData.totalSubAdmins,
      icon: 'Users',
      color: 'pink'
    },
    {
      title: 'Total Master Agencies',
      value: metricsData.totalMasterAgencies,
      icon: 'Building',
      color: 'purple'
    },
    {
      title: 'Agencies',
      value: metricsData.agencies,
      icon: 'Building',
      color: 'blue'
    },
    {
      title: 'Hosts',
      value: metricsData.hosts,
      icon: 'UserCheck',
      color: 'cyan'
    },
    {
      title: 'Overall Coins',
      value: metricsData.overallCoins,
      icon: 'Coins',
      color: 'pink'
    },
    {
      title: 'Live Users',
      value: metricsData.liveUsers,
      icon: 'Activity',
      color: 'purple'
    },
    {
      title: 'Voice Rooms',
      value: metricsData.voiceRooms,
      icon: 'Mic',
      color: 'blue'
    },
    {
      title: 'Total Diamonds',
      value: metricsData.totalDiamonds,
      icon: 'Gem',
      color: 'cyan'
    }
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Metrics Cards Grid */}
      <section 
        className="mb-8"
        aria-labelledby="metrics-heading"
      >
        <h2 id="metrics-heading" className="sr-only">Platform Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {metricsCards.map((card, index) => (
            <MetricsCard
              key={`metric-${index}`}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </section>

      {/* Analytics Section */}
      <section 
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        aria-labelledby="analytics-heading"
      >
        <h2 id="analytics-heading" className="sr-only">Analytics Section</h2>
        
        {/* Chart Card - Takes 2 columns on XL screens */}
        <div className="xl:col-span-2">
          <ChartCard />
        </div>

        {/* Supporter Cards - Takes 1 column on XL screens */}
        <div className="space-y-6">
          <SupporterCard
            title={supporterCardsData.thisMonthRecharge.title}
            value={supporterCardsData.thisMonthRecharge.value}
            icon={supporterCardsData.thisMonthRecharge.icon}
            color={supporterCardsData.thisMonthRecharge.color}
          />
          <SupporterCard
            title={supporterCardsData.totalRecharge.title}
            value={supporterCardsData.totalRecharge.value}
            icon={supporterCardsData.totalRecharge.icon}
            color={supporterCardsData.totalRecharge.color}
          />
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#F72585] rounded-full"></div>
              <span className="text-gray-300 text-sm">New host verification completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#7209B7] rounded-full"></div>
              <span className="text-gray-300 text-sm">Voice room limit increased</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-[#4361EE] rounded-full"></div>
              <span className="text-gray-300 text-sm">New agency registration</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-4 py-2 rounded-lg text-sm font-medium hover:glow-pink transition-all duration-300">
              Add Host
            </button>
            <button className="bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:glow-blue transition-all duration-300">
              View Reports
            </button>
            <button className="bg-gradient-to-r from-[#7209B7] to-[#9d4edd] text-white px-4 py-2 rounded-lg text-sm font-medium hover:glow-purple transition-all duration-300">
              Manage Users
            </button>
            <button className="bg-gradient-to-r from-[#4CC9F0] to-[#F72585] text-white px-4 py-2 rounded-lg text-sm font-medium hover:glow-cyan transition-all duration-300">
              Analytics
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;