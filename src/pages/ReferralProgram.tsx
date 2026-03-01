
import React from 'react';
import { useAccount } from '@/contexts/AccountContext';
import ReferralHeader from '@/components/referrals/ReferralHeader';
import ReferralLink from '@/components/referrals/ReferralLink';
import ReferralStatsComponent from '@/components/referrals/ReferralStats';
import ReferralHistory from '@/components/referrals/ReferralHistory';
import HowItWorks from '@/components/referrals/HowItWorks';
import { ReferralRecord, ReferralStats as ReferralStatsType } from '@/components/referrals/types';

const ReferralProgram = () => {
  const { user } = useAccount();

  // Derive referral code from the logged-in user
  const baseCode = user?.name?.toUpperCase().replace(/\s+/g, '').slice(0, 6) || 'HANZO';
  const referralCode = `${baseCode}5`;
  const referralLink = `https://hanzo.ai/signup?ref=${referralCode}`;

  // TODO: fetch real referral stats from analytics / commerce APIs
  const referralStats: ReferralStatsType = {
    totalInvited: 0,
    signedUp: 0,
    creditsEarned: 0,
    pending: 0,
  };

  const referralHistory: ReferralRecord[] = [];

  return (
    <div className="space-y-8">
      <ReferralHeader />
      <ReferralLink referralLink={referralLink} referralCode={referralCode} />
      <ReferralStatsComponent referralStats={referralStats} />
      <ReferralHistory referralHistory={referralHistory} />
      <HowItWorks />
    </div>
  );
};

export default ReferralProgram;
