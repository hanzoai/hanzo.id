import React from 'react';
import { Mail, User, DollarSign, Clock } from 'lucide-react';
import { ReferralStats } from './types';

interface ReferralStatsProps {
  referralStats: ReferralStats;
}

const ReferralStatsComponent = ({ referralStats }: ReferralStatsProps) => {
  const stats = [
    { label: 'Total Invited', value: referralStats.totalInvited, icon: Mail },
    { label: 'Signed Up', value: referralStats.signedUp, icon: User },
    { label: 'Credits Earned', value: `$${referralStats.creditsEarned}`, icon: DollarSign },
    { label: 'Pending', value: referralStats.pending, icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Icon className="h-4 w-4 text-neutral-400" />
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
          </div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default ReferralStatsComponent;
