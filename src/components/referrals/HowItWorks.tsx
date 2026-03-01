import React from 'react';

const steps = [
  {
    n: '1',
    title: 'Share Your Link',
    body: 'Send your unique referral link to friends and colleagues via email, social, or direct message.',
  },
  {
    n: '2',
    title: 'Friends Sign Up',
    body: 'They use your link to create an account and subscribe to any Hanzo paid plan.',
  },
  {
    n: '3',
    title: 'Earn Credits',
    body: 'You get $5 in account credits for each successful referral, automatically applied to your balance.',
  },
];

const HowItWorks = () => {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-base font-medium mb-5">How It Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map(({ n, title, body }) => (
          <div key={n} className="bg-neutral-900 rounded-lg p-5 border border-neutral-800">
            <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-300 mb-4">
              {n}
            </div>
            <h3 className="font-medium text-white mb-2">{title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
