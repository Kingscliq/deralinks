import './styles/App.css';

import React, { useState } from 'react';

import AssetDetails from './components/AssetDetails.jsx';
import ConnectPrompt from './components/ui/ConnectPrompt.jsx';
import Header from './components/ui/Header.jsx';
import Hero from './components/ui/Hero.jsx';
import LandingHero from './components/ui/LandingHero.jsx';
import LandingSales from './components/ui/LandingSales.jsx';
import Marketplace from './components/Marketplace.jsx';
import MintForm from './components/MintForm.jsx';
import MyAssets from './components/MyAssets.jsx';
import MyGroup from './components/MyGroup.jsx';
import { mintNFT } from './api/mockApi';
import walletConnectFcn from './components/hedera/walletConnect.js';

function App() {
  const [walletData, setWalletData] = useState();
  const [accountId, setAccountId] = useState();
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  const [connectTextSt, setConnectTextSt] = useState('🔌 Connect here...');
  const [connectLinkSt, setConnectLinkSt] = useState('');

  async function connectWallet() {
    if (accountId !== undefined) {
      setConnectTextSt(`🔌 Account ${accountId} already connected ⚡ ✅`);
    } else {
      const wData = await walletConnectFcn();
      wData[0].pairingEvent.once(pairingData => {
        pairingData.accountIds.forEach(id => {
          console.log('pairingData', { pairingData });
          setAccountId(id);
          console.log(`- Paired account id: ${id}`);
          setConnectTextSt(`🔌 Account ${id} connected ⚡ ✅`);
          setConnectLinkSt(`https://hashscan.io/testnet/account/${id}`);
          setWalletConnected(true);
        });
      });
      setWalletData(wData);
    }
  }

  const handleMint = async payload => {
    const response = await mintNFT(payload);
    if (response.success) {
      alert('NFT minted successfully!');
      setActiveTab('my-assets');
    } else {
      alert('Failed to mint NFT');
    }
  };

  const LandingPage = () => (
    <div className="App landing">
      <ConnectPrompt
        open={showConnectPrompt}
        onConnect={() => {
          setShowConnectPrompt(false);
          connectWallet();
        }}
        onClose={() => setShowConnectPrompt(false)}
      />
      <Header
        isConnected={false}
        onNavigate={setActiveTab}
        onOpenApp={() => setShowConnectPrompt(true)}
        showBrand={true}
        showNav={false}
        brandText={'DeraLinks'}
        buttonLabel={'Connect Wallet'}
      />
      <LandingHero onPrimary={() => setShowConnectPrompt(true)} />
      <LandingSales />
    </div>
  );

  const handleDisconnect = () => {
    setWalletConnected(false);
    setAccountId(undefined);
    setWalletData(undefined);
    setConnectTextSt('🔌 Connect here...');
    setConnectLinkSt('');
    setActiveTab('marketplace');
  };

  const [routeAsset, setRouteAsset] = useState(null);

  // Simple hash-based route for details: #/asset?tokenId=...&serialNumber=...
  React.useEffect(() => {
    const parse = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/asset')) {
        const qs = hash.split('?')[1] || '';
        const params = new URLSearchParams(qs);
        const tokenId = params.get('tokenId');
        const serialNumber = params.get('serialNumber');
        setRouteAsset({ tokenId, serialNumber });
      } else {
        setRouteAsset(null);
      }
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, []);

  const MainPage = () => (
    <div className="App main">
      <Header
        isConnected={true}
        accountId={accountId}
        onNavigate={setActiveTab}
        onDisconnect={handleDisconnect}
      />

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
        <button
          className={`nav-tab ${activeTab === 'my-assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-assets')}
        >
          My Assets
        </button>
        <button
          className={`nav-tab ${activeTab === 'mint' ? 'active' : ''}`}
          onClick={() => setActiveTab('mint')}
        >
          Tokenize asset
        </button>
      </nav>

      <main className="main-content">
        {routeAsset ? (
          <AssetDetails
            asset={{
              tokenId: routeAsset.tokenId,
              serialNumber: routeAsset.serialNumber,
            }}
            onBack={() => (window.location.hash = '#/')}
          />
        ) : (
          <>
            {activeTab === 'marketplace' && (
              <Marketplace accountId={accountId} />
            )}
            {activeTab === 'my-assets' && <MyAssets accountId={accountId} />}
            {activeTab === 'mint' && (
              <MintForm onMint={handleMint} accountId={accountId} />
            )}
          </>
        )}
      </main>
    </div>
  );

  return walletConnected ? <MainPage /> : <LandingPage />;
}

export default App;
