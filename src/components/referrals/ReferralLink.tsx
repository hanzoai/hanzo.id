import React, { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReferralLinkProps {
  referralLink: string;
  referralCode: string;
}

const ReferralLink = ({ referralLink, referralCode }: ReferralLinkProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSendInvites = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = emailInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (emails.length === 0) {
      toast.error('Enter at least one email address');
      return;
    }
    toast.success(`Invitation${emails.length > 1 ? 's' : ''} sent to ${emails.length} contact${emails.length > 1 ? 's' : ''}`);
    setEmailInput('');
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-base font-medium mb-1">Your Referral Link</h2>
        <p className="text-xs text-neutral-500 mb-4">Share this link — you earn $5 when they subscribe</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={referralLink}
              readOnly
              className="bg-neutral-900 border-neutral-800 text-neutral-300 text-sm pr-10 focus:border-neutral-700 font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              aria-label="Copy link"
            >
              {isCopied
                ? <Check className="h-4 w-4 text-white" />
                : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button
            onClick={handleCopyLink}
            className="bg-white text-black hover:bg-neutral-200 font-medium shrink-0"
            size="sm"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-medium mb-3">Send Invites via Email</h3>
        <form onSubmit={handleSendInvites} className="flex gap-2">
          <Input
            placeholder="email@example.com, another@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-neutral-300 placeholder:text-neutral-600 text-sm focus:border-neutral-700"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="shrink-0 bg-transparent border-neutral-700 hover:bg-neutral-900 hover:border-neutral-600 text-neutral-300 hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ReferralLink;
