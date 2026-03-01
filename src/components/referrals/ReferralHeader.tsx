import React from 'react';
import { Gift } from 'lucide-react';

const ReferralHeader = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-neutral-950 p-8 rounded-xl border border-neutral-800">
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-1">Referral Program</h1>
          <p className="text-neutral-400">
            Get $5 in credits for every friend who signs up and pays for any plan
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralHeader;
