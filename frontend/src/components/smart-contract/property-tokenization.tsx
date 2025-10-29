'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle,
  DollarSign,
  FileText,
  MapPin,
  Share2,
  Shield,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface PropertyTokenizationProps {
  onTokenize?: (propertyData: PropertyData) => void;
}

interface PropertyData {
  title: string;
  description: string;
  location: string;
  price: string;
  totalNFTs: string;
  pricePerNFT: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  propertyType: string;
  documents: File[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  tokenId?: string;
  nftCollectionId?: string;
  status?: string;
}

export function PropertyTokenization({ onTokenize }: PropertyTokenizationProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    totalNFTs: '',
    pricePerNFT: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    propertyType: '',
    documents: [] as File[],
    verificationStatus: 'pending' as 'pending' | 'verified' | 'rejected',
  });

  const handleInputChange = (field: string, value: string) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setPropertyData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles],
      }));
    }
  };

  const verifyDocuments = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate document verification via licensing API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock verification result
      const isVerified = Math.random() > 0.2; // 80% success rate

      if (isVerified) {
        setPropertyData(prev => ({ ...prev, verificationStatus: 'verified' }));
        setStep(3);
      } else {
        setPropertyData(prev => ({ ...prev, verificationStatus: 'rejected' }));
        setError('Document verification failed. Please check your documents and try again.');
      }
    } catch {
      setError('Verification service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFTs = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate HTS NFT collection creation and minting
      await new Promise(resolve => setTimeout(resolve, 5000));

      const nftCollectionId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      const tokenId = nftCollectionId; // For compatibility

      onTokenize?.({
        ...propertyData,
        tokenId,
        nftCollectionId,
        status: 'active',
      });

      setStep(4);
    } catch {
      setError('Failed to mint NFTs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Property Title
            </Box>
            <Input
              placeholder="e.g., Modern Apartment in Downtown Lagos"
              value={propertyData.title}
              onChange={e => handleInputChange('title', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Property Type
            </Box>
            <Input
              placeholder="e.g., Apartment, House, Commercial"
              value={propertyData.propertyType}
              onChange={e => handleInputChange('propertyType', e.target.value)}
            />
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Description
          </Box>
          <Box
            as="textarea"
            className="w-full p-3 border rounded-md resize-none h-24"
            placeholder="Describe the property features, amenities, and investment highlights..."
            value={propertyData.description}
            onChange={e => handleInputChange('description', e.target.value)}
          />
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Location
          </Box>
          <Input
            placeholder="e.g., Victoria Island, Lagos, Nigeria"
            value={propertyData.location}
            onChange={e => handleInputChange('location', e.target.value)}
          />
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Total Property Value (₦)
            </Box>
            <Input
              type="number"
              placeholder="50000000"
              value={propertyData.price}
              onChange={e => handleInputChange('price', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Total NFT Shares
            </Box>
            <Input
              type="number"
              placeholder="1000"
              value={propertyData.totalNFTs}
              onChange={e => handleInputChange('totalNFTs', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Price Per NFT Share (₦)
            </Box>
            <Input
              type="number"
              placeholder="50000"
              value={propertyData.pricePerNFT}
              onChange={e => handleInputChange('pricePerNFT', e.target.value)}
            />
          </Box>
        </Box>

        <Box className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <Box className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-amber-900 mb-1">
                NFT-Based Tokenization
              </Box>
              <Box as="p" className="text-sm text-amber-700">
                Each NFT represents a fractional ownership share of this property. NFTs are unique,
                transferable, and enable governance rights through DAO voting.
              </Box>
            </Box>
          </Box>
        </Box>

        <Button
          onClick={() => setStep(2)}
          className="w-full btn-gradient"
          disabled={!propertyData.title || !propertyData.location || !propertyData.price}
        >
          Next: Upload Documents
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Upload & Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <Box as="h3" className="text-lg font-semibold mb-2">
            Upload Property Documents
          </Box>
          <Box as="p" className="text-muted-foreground mb-4">
            Upload ownership documents, title reports, surveys, and valuation reports
          </Box>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={e => handleFileUpload(e.target.files)}
            className="hidden"
            id="document-upload"
          />
          <Box
            as="label"
            htmlFor="document-upload"
            className="btn-gradient inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer"
          >
            Choose Files
          </Box>
        </Box>

        {propertyData.documents.length > 0 && (
          <Box className="space-y-3">
            <Box as="h4" className="font-semibold">
              Uploaded Documents
            </Box>
            {propertyData.documents.map((file, index) => (
              <Box
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <Box className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <Box>
                    <Box className="font-medium">{file.name}</Box>
                    <Box className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Box>
                  </Box>
                </Box>
                <Badge variant="outline">Ready</Badge>
              </Box>
            ))}
          </Box>
        )}

        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Box className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-blue-900 mb-1">
                Document Verification
              </Box>
              <Box as="p" className="text-sm text-blue-700">
                Documents will be automatically verified through licensed-body APIs to ensure
                authenticity and compliance with regulatory requirements.
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button
            onClick={verifyDocuments}
            disabled={propertyData.documents.length === 0 || isLoading}
            className="flex-1 btn-gradient"
          >
            {isLoading ? 'Verifying...' : 'Verify Documents'}
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

  const renderStep3 = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Ready to Tokenize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="text-center">
          <Box className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </Box>
          <Box as="h3" className="text-xl font-semibold mb-2">
            Documents Verified!
          </Box>
          <Box as="p" className="text-muted-foreground">
            Your property documents have been successfully verified and are ready for tokenization.
          </Box>
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box className="space-y-4">
            <Box as="h4" className="font-semibold">
              Property Summary
            </Box>
            <Box className="space-y-3">
              <Box className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Box className="text-sm">{propertyData.title}</Box>
              </Box>
              <Box className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Box className="text-sm">{propertyData.location}</Box>
              </Box>
              <Box className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Box className="text-sm">₦{Number(propertyData.price).toLocaleString()}</Box>
              </Box>
              <Box className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Box className="text-sm">{propertyData.totalNFTs} NFT shares</Box>
              </Box>
            </Box>
          </Box>

          <Box className="space-y-4">
            <Box as="h4" className="font-semibold">
              NFT Collection Details
            </Box>
            <Box className="space-y-3">
              <Box className="flex justify-between">
                <Box className="text-sm text-muted-foreground">Price per NFT Share</Box>
                <Box className="font-medium">
                  ₦{Number(propertyData.pricePerNFT).toLocaleString()}
                </Box>
              </Box>
              <Box className="flex justify-between">
                <Box className="text-sm text-muted-foreground">Total NFT Supply</Box>
                <Box className="font-medium">{propertyData.totalNFTs}</Box>
              </Box>
              <Box className="flex justify-between">
                <Box className="text-sm text-muted-foreground">Token Standard</Box>
                <Box className="font-medium">HTS NFT (ERC-721)</Box>
              </Box>
              <Box className="flex justify-between">
                <Box className="text-sm text-muted-foreground">Network</Box>
                <Box className="font-medium">Hedera Mainnet</Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="bg-gradient-primary p-4 rounded-lg text-white">
          <Box className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <Box as="h4" className="font-semibold">
              Estimated Listing Fee
            </Box>
          </Box>
          <Box className="text-2xl font-bold">
            ₦{Math.floor(Number(propertyData.price) * 0.02).toLocaleString()}
          </Box>
          <Box className="text-sm opacity-90">2% of property value</Box>
        </Box>

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button onClick={mintNFTs} disabled={isLoading} className="flex-1 btn-gradient">
            {isLoading ? 'Creating NFT Collection...' : 'Create NFT Collection'}
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

  const renderStep4 = () => (
    <Card className="card-elevated">
      <CardContent className="p-8 text-center">
        <Box className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-white" />
        </Box>
        <Box as="h3" className="text-2xl font-bold mb-2">
          NFT Collection Created Successfully!
        </Box>
        <Box as="p" className="text-muted-foreground mb-6">
          Your property has been successfully tokenized as an NFT collection. Each NFT represents
          fractional ownership and governance rights.
        </Box>

        <Box className="space-y-4 mb-6">
          <Box className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <Box className="text-sm text-muted-foreground mb-1">NFT Collection ID</Box>
            <Box className="font-mono text-lg font-semibold">0.0.1234567</Box>
          </Box>
          <Box className="grid grid-cols-2 gap-3">
            <Box className="bg-muted p-3 rounded-lg">
              <Box className="text-xs text-muted-foreground mb-1">Total NFTs</Box>
              <Box className="font-semibold">{propertyData.totalNFTs}</Box>
            </Box>
            <Box className="bg-muted p-3 rounded-lg">
              <Box className="text-xs text-muted-foreground mb-1">Standard</Box>
              <Box className="font-semibold">HTS NFT</Box>
            </Box>
          </Box>
        </Box>

        <Box className="flex gap-3 justify-center">
          <Button variant="outline">View Collection</Button>
          <Button className="btn-gradient">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Investors
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <Box className="mb-8">
        <Box className="flex items-center justify-between">
          {[1, 2, 3, 4].map(stepNum => (
            <Box key={stepNum} className="flex items-center">
              <Box
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-gradient-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </Box>
              {stepNum < 4 && (
                <Box
                  className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-gradient-primary' : 'bg-muted'}`}
                />
              )}
            </Box>
          ))}
        </Box>
        <Box className="flex justify-between mt-2 text-sm text-muted-foreground">
          <Box>Property Info</Box>
          <Box>Documents</Box>
          <Box>Review</Box>
          <Box>Complete</Box>
        </Box>
      </Box>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Box>
  );
}
