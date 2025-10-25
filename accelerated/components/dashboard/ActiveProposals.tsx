'use client';

import { Vote, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActiveProposals() {
  const proposals = [
    {
      id: 'PROP-142',
      title: 'Approve ₦15M Renovation for VI Office Complex',
      asset: 'Victoria Island Office',
      deadline: '2 days left',
      yesVotes: 68,
      noVotes: 32,
      totalVoters: 245,
      yourVote: null,
    },
    {
      id: 'PROP-138',
      title: 'Increase Rent by 8% for Lekki Estate Tenants',
      asset: 'Lekki Residential',
      deadline: '5 days left',
      yesVotes: 54,
      noVotes: 46,
      totalVoters: 189,
      yourVote: null,
    },
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Active Proposals</h2>
          <div className="px-2.5 py-0.5 bg-blue-600/20 rounded-full">
            <span className="text-xs font-semibold text-blue-400">3 Pending</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-blue-400">{proposal.id}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{proposal.asset}</span>
                </div>
                <h3 className="font-semibold text-white mb-3">{proposal.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{proposal.deadline}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Yes</span>
                  <span className="text-green-400 font-semibold">{proposal.yesVotes}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${proposal.yesVotes}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">No</span>
                  <span className="text-red-400 font-semibold">{proposal.noVotes}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-rose-600 h-2 rounded-full transition-all duration-300" style={{ width: `${proposal.noVotes}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="w-4 h-4" />
                <span>{proposal.totalVoters} voters</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Vote No
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Vote Yes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
