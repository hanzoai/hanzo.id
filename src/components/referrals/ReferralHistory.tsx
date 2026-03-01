import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReferralRecord {
  id: number;
  name: string;
  email: string;
  status: string;
  date: string;
  credits: number;
}

interface ReferralHistoryProps {
  referralHistory: ReferralRecord[];
}

const ReferralHistory = ({ referralHistory }: ReferralHistoryProps) => {
  if (referralHistory.length === 0) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-base font-medium mb-4">Referral History</h2>
        <div className="text-center py-10 text-neutral-600 text-sm">
          No referrals yet — share your link to get started
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-base font-medium mb-4">Referral History</h2>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-neutral-500 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-neutral-500 text-xs uppercase tracking-wider text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referralHistory.map((referral) => (
              <TableRow key={referral.id} className="border-neutral-800 hover:bg-neutral-900/30">
                <TableCell className="text-sm text-white font-medium">{referral.name}</TableCell>
                <TableCell className="text-sm text-neutral-400">{referral.email}</TableCell>
                <TableCell className="text-sm text-neutral-400">{referral.date}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    referral.status === 'completed'
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}>
                    {referral.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-right text-neutral-300">
                  {referral.credits > 0 ? `$${referral.credits}` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReferralHistory;
