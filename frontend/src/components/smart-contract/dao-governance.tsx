'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Vote,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'budget' | 'sale' | 'distribution' | 'governance';
  proposer: string;
  startTime: string;
  endTime: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  status: 'draft' | 'active' | 'passed' | 'failed' | 'executed';
  totalNFTs: number;
  quorum: number;
  userVote?: 'for' | 'against' | 'abstain';
  userNFTCount: number;
}

interface DAOGovernanceProps {
  propertyId: string;
  userNFTCount: number;
  totalNFTs: number;
}

export function DAOGovernance({
  propertyId: _propertyId,
  userNFTCount,
  totalNFTs,
}: DAOGovernanceProps) {
  // propertyId available for future property-specific governance
  const [activeTab, setActiveTab] = useState<'proposals' | 'create' | 'treasury'>('proposals');
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  // Mock proposals data
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Renovate Building Facade',
      description:
        'Proposal to renovate the building facade to improve curb appeal and property value. Estimated cost: ₦2,500,000',
      type: 'maintenance',
      proposer: '0x1234...5678',
      startTime: '2024-01-15T00:00:00Z',
      endTime: '2024-01-22T00:00:00Z',
      votesFor: 150,
      votesAgainst: 25,
      votesAbstain: 10,
      status: 'active',
      totalNFTs: 500,
      quorum: 250,
      userNFTCount: userNFTCount,
    },
    {
      id: '2',
      title: 'Distribute Q4 Rental Income',
      description:
        'Distribute ₦1,200,000 in rental income to NFT holders. Distribution will be proportional to NFT ownership.',
      type: 'distribution',
      proposer: '0x9876...5432',
      startTime: '2024-01-10T00:00:00Z',
      endTime: '2024-01-17T00:00:00Z',
      votesFor: 200,
      votesAgainst: 5,
      votesAbstain: 15,
      status: 'passed',
      totalNFTs: 500,
      quorum: 250,
      userNFTCount: userNFTCount,
    },
    {
      id: '3',
      title: 'Increase Monthly Maintenance Fee',
      description:
        'Increase monthly maintenance fee from ₦50,000 to ₦75,000 to cover rising operational costs.',
      type: 'budget',
      proposer: '0x4567...8901',
      startTime: '2024-01-05T00:00:00Z',
      endTime: '2024-01-12T00:00:00Z',
      votesFor: 80,
      votesAgainst: 120,
      votesAbstain: 20,
      status: 'failed',
      totalNFTs: 500,
      quorum: 250,
      userNFTCount: userNFTCount,
    },
  ]);

  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'maintenance' as Proposal['type'],
    amount: '',
    duration: '7',
  });

  const getProposalTypeIcon = (type: Proposal['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'budget':
        return <DollarSign className="w-4 h-4" />;
      case 'sale':
        return <TrendingUp className="w-4 h-4" />;
      case 'distribution':
        return <DollarSign className="w-4 h-4" />;
      case 'governance':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getProposalTypeColor = (type: Proposal['type']) => {
    switch (type) {
      case 'maintenance':
        return 'bg-blue-100 text-blue-700';
      case 'budget':
        return 'bg-green-100 text-green-700';
      case 'sale':
        return 'bg-purple-100 text-purple-700';
      case 'distribution':
        return 'bg-yellow-100 text-yellow-700';
      case 'governance':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'passed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'executed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateVotingPower = (nftCount: number) => {
    return (nftCount / totalNFTs) * 100;
  };

  const handleVote = async (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    setIsVoting(true);
    setError('');

    try {
      // Simulate voting transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProposals(prev =>
        prev.map(proposal =>
          proposal.id === proposalId
            ? {
                ...proposal,
                userVote: vote,
                votesFor: vote === 'for' ? proposal.votesFor + userNFTCount : proposal.votesFor,
                votesAgainst:
                  vote === 'against' ? proposal.votesAgainst + userNFTCount : proposal.votesAgainst,
                votesAbstain:
                  vote === 'abstain' ? proposal.votesAbstain + userNFTCount : proposal.votesAbstain,
              }
            : proposal,
        ),
      );
    } catch {
      setError('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const createProposal = async () => {
    setIsCreatingProposal(true);
    setError('');

    try {
      // Simulate proposal creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const proposal: Proposal = {
        id: Date.now().toString(),
        title: newProposal.title,
        description: newProposal.description,
        type: newProposal.type,
        proposer: '0x1234...5678', // Current user
        startTime: new Date().toISOString(),
        endTime: new Date(
          Date.now() + parseInt(newProposal.duration) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        status: 'active',
        totalNFTs: totalNFTs,
        quorum: Math.ceil(totalNFTs * 0.5), // 50% quorum
        userNFTCount: userNFTCount,
      };

      setProposals(prev => [proposal, ...prev]);
      setNewProposal({
        title: '',
        description: '',
        type: 'maintenance',
        amount: '',
        duration: '7',
      });
      setActiveTab('proposals');
    } catch {
      setError('Failed to create proposal. Please try again.');
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const renderProposals = () => (
    <Box className="space-y-6">
      <Box className="flex items-center justify-between">
        <Box as="h2" className="text-2xl font-bold">
          Active Proposals
        </Box>
        <Button onClick={() => setActiveTab('create')} className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </Box>

      {proposals.map(proposal => {
        const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
        const isPassed = proposal.votesFor > proposal.votesAgainst && totalVotes >= proposal.quorum;
        const votingPower = calculateVotingPower(userNFTCount);

        return (
          <Card key={proposal.id} className="card-elevated">
            <CardHeader>
              <Box className="flex items-start justify-between">
                <Box className="flex-1">
                  <Box className="flex items-center gap-3 mb-2">
                    <Badge className={getProposalTypeColor(proposal.type)}>
                      {getProposalTypeIcon(proposal.type)}
                      <Box className="ml-1 capitalize">{proposal.type}</Box>
                    </Badge>
                    <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                  </Box>
                  <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                  <Box as="p" className="text-muted-foreground mb-4">
                    {proposal.description}
                  </Box>
                </Box>
              </Box>
            </CardHeader>
            <CardContent>
              <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Voting Stats */}
                <Box className="space-y-3">
                  <Box as="h4" className="font-semibold">
                    Voting Results
                  </Box>
                  <Box className="space-y-2">
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <Box className="text-sm">For</Box>
                      </Box>
                      <Box className="font-medium">{proposal.votesFor}</Box>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <Box className="text-sm">Against</Box>
                      </Box>
                      <Box className="font-medium">{proposal.votesAgainst}</Box>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <Box className="text-sm">Abstain</Box>
                      </Box>
                      <Box className="font-medium">{proposal.votesAbstain}</Box>
                    </Box>
                  </Box>
                </Box>

                {/* Progress */}
                <Box className="space-y-3">
                  <Box as="h4" className="font-semibold">
                    Progress
                  </Box>
                  <Box className="space-y-2">
                    <Box className="flex justify-between text-sm">
                      <Box>Quorum</Box>
                      <Box>
                        {totalVotes}/{proposal.quorum}
                      </Box>
                    </Box>
                    <Box className="w-full bg-muted rounded-full h-2">
                      <Box
                        className="bg-gradient-primary h-2 rounded-full"
                        style={{ width: `${Math.min((totalVotes / proposal.quorum) * 100, 100)}%` }}
                      />
                    </Box>
                    <Box className="text-xs text-muted-foreground">
                      {isPassed
                        ? 'Quorum reached'
                        : `${proposal.quorum - totalVotes} more votes needed`}
                    </Box>
                  </Box>
                </Box>

                {/* Timeline */}
                <Box className="space-y-3">
                  <Box as="h4" className="font-semibold">
                    Timeline
                  </Box>
                  <Box className="space-y-2 text-sm">
                    <Box className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Box>Started: {new Date(proposal.startTime).toLocaleDateString()}</Box>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Box>Ends: {new Date(proposal.endTime).toLocaleDateString()}</Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Voting Actions */}
              {proposal.status === 'active' && (
                <Box className="border-t pt-4">
                  <Box className="flex items-center justify-between mb-4">
                    <Box>
                      <Box as="h4" className="font-semibold">
                        Your Vote
                      </Box>
                      <Box className="text-sm text-muted-foreground">
                        Voting Power: {votingPower.toFixed(2)}% ({userNFTCount} NFT
                        {userNFTCount !== 1 ? 's' : ''})
                      </Box>
                    </Box>
                    {proposal.userVote && (
                      <Badge className="bg-green-100 text-green-700">
                        Voted: {proposal.userVote}
                      </Badge>
                    )}
                  </Box>

                  {!proposal.userVote ? (
                    <Box className="flex gap-3">
                      <Button
                        onClick={() => handleVote(proposal.id, 'for')}
                        disabled={isVoting}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, 'against')}
                        disabled={isVoting}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                      <Button
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        disabled={isVoting}
                        variant="outline"
                        className="flex-1"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Abstain
                      </Button>
                    </Box>
                  ) : (
                    <Box className="text-center text-muted-foreground">
                      You have already voted on this proposal
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  const renderCreateProposal = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Create New Proposal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Proposal Title
            </Box>
            <Input
              placeholder="e.g., Renovate Building Facade"
              value={newProposal.title}
              onChange={e => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Proposal Type
            </Box>
            <Box
              as="select"
              className="w-full p-3 border rounded-md"
              value={newProposal.type}
              onChange={e =>
                setNewProposal(prev => ({ ...prev, type: e.target.value as Proposal['type'] }))
              }
            >
              <option value="maintenance">Maintenance</option>
              <option value="budget">Budget</option>
              <option value="distribution">Distribution</option>
              <option value="sale">Sale</option>
              <option value="governance">Governance</option>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Description
          </Box>
          <Box
            as="textarea"
            className="w-full p-3 border rounded-md resize-none h-32"
            placeholder="Describe your proposal in detail..."
            value={newProposal.description}
            onChange={e => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
          />
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Amount (₦)
            </Box>
            <Input
              type="number"
              placeholder="0"
              value={newProposal.amount}
              onChange={e => setNewProposal(prev => ({ ...prev, amount: e.target.value }))}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Voting Duration (days)
            </Box>
            <Input
              type="number"
              placeholder="7"
              value={newProposal.duration}
              onChange={e => setNewProposal(prev => ({ ...prev, duration: e.target.value }))}
            />
          </Box>
        </Box>

        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Box className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-blue-900 mb-1">
                Proposal Requirements
              </Box>
              <Box as="ul" className="text-sm text-blue-700 space-y-1">
                <Box as="li">• Minimum 50% quorum required for proposal to pass</Box>
                <Box as="li">• Each NFT equals one vote in governance decisions</Box>
                <Box as="li">• High-value proposals (&gt;₦1M) require 7-day timelock</Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setActiveTab('proposals')} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={createProposal}
            disabled={!newProposal.title || !newProposal.description || isCreatingProposal}
            className="flex-1 btn-gradient"
          >
            {isCreatingProposal ? 'Creating...' : 'Create Proposal'}
          </Button>
        </Box>

        {error && (
          <Box className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderTreasury = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Treasury Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Box className="p-4 bg-gradient-primary rounded-lg text-white">
            <Box className="text-sm opacity-90 mb-1">Total Treasury</Box>
            <Box className="text-2xl font-bold">₦15,250,000</Box>
          </Box>
          <Box className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <Box className="text-sm text-green-700 mb-1">Monthly Income</Box>
            <Box className="text-2xl font-bold text-green-800">₦1,200,000</Box>
          </Box>
          <Box className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <Box className="text-sm text-red-700 mb-1">Monthly Expenses</Box>
            <Box className="text-2xl font-bold text-red-800">₦450,000</Box>
          </Box>
        </Box>

        <Box className="space-y-4">
          <Box as="h4" className="font-semibold">
            Recent Transactions
          </Box>
          <Box className="space-y-3">
            {[
              {
                type: 'Rental Income',
                amount: '₦1,200,000',
                date: '2024-01-15',
                status: 'completed',
              },
              {
                type: 'Maintenance Fee',
                amount: '₦150,000',
                date: '2024-01-10',
                status: 'completed',
              },
              {
                type: 'Insurance Payment',
                amount: '₦75,000',
                date: '2024-01-05',
                status: 'completed',
              },
              { type: 'Distribution', amount: '₦800,000', date: '2024-01-01', status: 'completed' },
            ].map((tx, index) => (
              <Box
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <Box>
                  <Box className="font-medium">{tx.type}</Box>
                  <Box className="text-sm text-muted-foreground">{tx.date}</Box>
                </Box>
                <Box className="text-right">
                  <Box className="font-semibold">{tx.amount}</Box>
                  <Badge className="bg-green-100 text-green-700">{tx.status}</Badge>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="max-w-6xl mx-auto">
      {/* Header */}
      <Box className="mb-8">
        <Box as="h1" className="text-3xl font-bold mb-2">
          DAO Governance
        </Box>
        <Box as="p" className="text-muted-foreground">
          Participate in property management decisions through NFT-based decentralized governance
        </Box>
      </Box>

      {/* Stats */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">{userNFTCount}</Box>
            <Box className="text-sm text-muted-foreground">Your NFTs</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">{totalNFTs}</Box>
            <Box className="text-sm text-muted-foreground">Total NFTs</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              {calculateVotingPower(userNFTCount).toFixed(1)}%
            </Box>
            <Box className="text-sm text-muted-foreground">Voting Power</Box>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 text-center">
            <Box className="text-2xl font-bold text-gradient-primary">
              {proposals.filter(p => p.status === 'active').length}
            </Box>
            <Box className="text-sm text-muted-foreground">Active Proposals</Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'proposals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('proposals')}
          className="btn-gradient"
        >
          <Vote className="w-4 h-4 mr-2" />
          Proposals
        </Button>
        <Button
          variant={activeTab === 'create' ? 'default' : 'outline'}
          onClick={() => setActiveTab('create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
        <Button
          variant={activeTab === 'treasury' ? 'default' : 'outline'}
          onClick={() => setActiveTab('treasury')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Treasury
        </Button>
      </Box>

      {/* Content */}
      {activeTab === 'proposals' && renderProposals()}
      {activeTab === 'create' && renderCreateProposal()}
      {activeTab === 'treasury' && renderTreasury()}
    </Box>
  );
}
