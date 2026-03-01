
import React, { useEffect, useState } from 'react';
import { useAccount } from '@/contexts/AccountContext';
import ReferralHeader from '@/components/referrals/ReferralHeader';
import ReferralLink from '@/components/referrals/ReferralLink';
import ReferralStatsComponent from '@/components/referrals/ReferralStats';
import ReferralHistory from '@/components/referrals/ReferralHistory';
import HowItWorks from '@/components/referrals/HowItWorks';
import { ReferralRecord, ReferralStats as ReferralStatsType } from '@/components/referrals/types';

const COMMERCE_API = 'https://api.hanzo.ai';

const ReferralProgram = () => {
  const { user, token } = useAccount();
  const [referralStats, setReferralStats] = useState<ReferralStatsType>({
    totalInvited: 0,
    signedUp: 0,
    creditsEarned: 0,
    pending: 0,
  });
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Derive referral code from the logged-in user
  const baseCode = user?.name?.toUpperCase().replace(/\s+/g, '').slice(0, 6) || 'HANZO';
  const referralCode = `${baseCode}5`;
  const referralLink = `https://hanzo.ai/signup?ref=${referralCode}`;

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchReferrals = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch referrals list
        const referralsRes = await fetch(
          `${COMMERCE_API}/user/${encodeURIComponent(user.id)}/referrals`,
          { headers }
        );

        if (referralsRes.ok) {
          const data = await referralsRes.json();
          const records: ReferralRecord[] = (data || []).map(
            (r: { id: string; referrer: string; created_at: string; status: string; fee?: number }, i: number) => ({
              id: i + 1,
              name: r.referrer || 'User',
              email: '',
              status: r.status || 'pending',
              date: r.created_at
                ? new Date(r.created_at).toISOString().slice(0, 10)
                : '',
              credits: r.fee || 0,
            })
          );
          setReferralHistory(records);

          const signedUp = records.filter((r) => r.status === 'completed').length;
          const pending = records.filter((r) => r.status === 'pending').length;
          const creditsEarned = records
            .filter((r) => r.status === 'completed')
            .reduce((sum, r) => sum + r.credits, 0);

          setReferralStats({
            totalInvited: records.length,
            signedUp,
            creditsEarned,
            pending,
          });
        }
      } catch (err) {
        console.warn('Failed to load referral stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [user?.id, token]);

  return (
    <div className="space-y-8">
      <ReferralHeader />
      <ReferralLink referralLink={referralLink} referralCode={referralCode} />
      <ReferralStatsComponent referralStats={referralStats} />
      {loading ? (
        <div className="text-sm text-neutral-500 text-center py-4">Loading referral history...</div>
      ) : (
        <ReferralHistory referralHistory={referralHistory} />
      )}
      <HowItWorks />
    </div>
  );
};

export default ReferralProgram;
