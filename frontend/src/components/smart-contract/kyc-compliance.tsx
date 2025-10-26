'use client';

import {
  AlertCircle,
  Building2,
  Camera,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface KYCData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  identityDocuments: {
    idType: string;
    idNumber: string;
    idFront: File | null;
    idBack: File | null;
    selfie: File | null;
  };
  financialInfo: {
    income: string;
    employment: string;
    sourceOfFunds: string;
    investmentExperience: string;
    riskTolerance: string;
  };
  accreditation: {
    isAccredited: boolean;
    netWorth: string;
    annualIncome: string;
    accreditationType: string;
  };
}

interface KYCComplianceProps {
  onComplete?: (kycData: KYCData) => void;
}

export function KYCCompliance({ onComplete }: KYCComplianceProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycData, setKycData] = useState<KYCData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    identityDocuments: {
      idType: '',
      idNumber: '',
      idFront: null,
      idBack: null,
      selfie: null,
    },
    financialInfo: {
      income: '',
      employment: '',
      sourceOfFunds: '',
      investmentExperience: '',
      riskTolerance: '',
    },
    accreditation: {
      isAccredited: false,
      netWorth: '',
      annualIncome: '',
      accreditationType: '',
    },
  });

  const [verificationStatus, setVerificationStatus] = useState<{
    personalInfo: 'pending' | 'verified' | 'rejected';
    identity: 'pending' | 'verified' | 'rejected';
    financial: 'pending' | 'verified' | 'rejected';
    accreditation: 'pending' | 'verified' | 'rejected';
  }>({
    personalInfo: 'pending',
    identity: 'pending',
    financial: 'pending',
    accreditation: 'pending',
  });

  const handleInputChange = (section: keyof KYCData, field: string, value: string) => {
    setKycData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (field: keyof KYCData['identityDocuments'], file: File) => {
    setKycData(prev => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [field]: file,
      },
    }));
  };

  const verifyPersonalInfo = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStatus(prev => ({ ...prev, personalInfo: 'verified' }));
      setStep(2);
    } catch {
      setError('Personal information verification failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyIdentity = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate document verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      setVerificationStatus(prev => ({ ...prev, identity: 'verified' }));
      setStep(3);
    } catch {
      setError('Identity verification failed. Please ensure documents are clear and valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyFinancialInfo = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate financial verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStatus(prev => ({ ...prev, financial: 'verified' }));
      setStep(4);
    } catch {
      setError('Financial information verification failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccreditation = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate accreditation verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStatus(prev => ({ ...prev, accreditation: 'verified' }));
      onComplete?.(kycData);
    } catch {
      setError('Accreditation verification failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const renderStep1 = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              First Name
            </Box>
            <Input
              placeholder="John"
              value={kycData.personalInfo.firstName}
              onChange={e => handleInputChange('personalInfo', 'firstName', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Last Name
            </Box>
            <Input
              placeholder="Doe"
              value={kycData.personalInfo.lastName}
              onChange={e => handleInputChange('personalInfo', 'lastName', e.target.value)}
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Email Address
            </Box>
            <Input
              type="email"
              placeholder="john.doe@example.com"
              value={kycData.personalInfo.email}
              onChange={e => handleInputChange('personalInfo', 'email', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Phone Number
            </Box>
            <Input
              placeholder="+234 801 234 5678"
              value={kycData.personalInfo.phone}
              onChange={e => handleInputChange('personalInfo', 'phone', e.target.value)}
            />
          </Box>
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Date of Birth
            </Box>
            <Input
              type="date"
              value={kycData.personalInfo.dateOfBirth}
              onChange={e => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Nationality
            </Box>
            <Box
              as="select"
              className="w-full p-3 border rounded-md"
              value={kycData.personalInfo.nationality}
              onChange={e => handleInputChange('personalInfo', 'nationality', e.target.value)}
            >
              <option value="">Select Nationality</option>
              <option value="Nigerian">Nigerian</option>
              <option value="Ghanaian">Ghanaian</option>
              <option value="Kenyan">Kenyan</option>
              <option value="Other">Other</option>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Address
          </Box>
          <Input
            placeholder="123 Main Street"
            value={kycData.personalInfo.address}
            onChange={e => handleInputChange('personalInfo', 'address', e.target.value)}
          />
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              City
            </Box>
            <Input
              placeholder="Lagos"
              value={kycData.personalInfo.city}
              onChange={e => handleInputChange('personalInfo', 'city', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              State
            </Box>
            <Input
              placeholder="Lagos State"
              value={kycData.personalInfo.state}
              onChange={e => handleInputChange('personalInfo', 'state', e.target.value)}
            />
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              ZIP Code
            </Box>
            <Input
              placeholder="100001"
              value={kycData.personalInfo.zipCode}
              onChange={e => handleInputChange('personalInfo', 'zipCode', e.target.value)}
            />
          </Box>
        </Box>

        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Box className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-blue-900 mb-1">
                Data Protection
              </Box>
              <Box as="p" className="text-sm text-blue-700">
                Your personal information is encrypted and stored securely. We comply with GDPR and
                local data protection regulations.
              </Box>
            </Box>
          </Box>
        </Box>

        <Button
          onClick={verifyPersonalInfo}
          disabled={isLoading || !kycData.personalInfo.firstName || !kycData.personalInfo.lastName}
          className="w-full btn-gradient"
        >
          {isLoading ? 'Verifying...' : 'Verify Personal Information'}
        </Button>

        {error && (
          <Box className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              ID Type
            </Box>
            <Box
              as="select"
              className="w-full p-3 border rounded-md"
              value={kycData.identityDocuments.idType}
              onChange={e => handleInputChange('identityDocuments', 'idType', e.target.value)}
            >
              <option value="">Select ID Type</option>
              <option value="national-id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers-license">Driver&apos;s License</option>
              <option value="voters-card">Voter&apos;s Card</option>
            </Box>
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              ID Number
            </Box>
            <Input
              placeholder="12345678901"
              value={kycData.identityDocuments.idNumber}
              onChange={e => handleInputChange('identityDocuments', 'idNumber', e.target.value)}
            />
          </Box>
        </Box>

        {/* Document Upload */}
        <Box className="space-y-4">
          <Box as="h4" className="font-semibold">
            Upload Documents
          </Box>

          {/* ID Front */}
          <Box className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Box className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <Box as="h5" className="font-medium mb-1">
                ID Front
              </Box>
              <Box className="text-sm text-muted-foreground mb-3">
                Upload the front side of your ID document
              </Box>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e =>
                  e.target.files?.[0] && handleFileUpload('idFront', e.target.files[0])
                }
                className="hidden"
                id="id-front"
              />
              <Box
                as="label"
                htmlFor="id-front"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Box>
              {kycData.identityDocuments.idFront && (
                <Box className="mt-2 text-sm text-green-600">
                  ✓ {kycData.identityDocuments.idFront.name}
                </Box>
              )}
            </Box>
          </Box>

          {/* ID Back */}
          <Box className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Box className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <Box as="h5" className="font-medium mb-1">
                ID Back
              </Box>
              <Box className="text-sm text-muted-foreground mb-3">
                Upload the back side of your ID document
              </Box>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e => e.target.files?.[0] && handleFileUpload('idBack', e.target.files[0])}
                className="hidden"
                id="id-back"
              />
              <Box
                as="label"
                htmlFor="id-back"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Box>
              {kycData.identityDocuments.idBack && (
                <Box className="mt-2 text-sm text-green-600">
                  ✓ {kycData.identityDocuments.idBack.name}
                </Box>
              )}
            </Box>
          </Box>

          {/* Selfie */}
          <Box className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Box className="text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <Box as="h5" className="font-medium mb-1">
                Selfie
              </Box>
              <Box className="text-sm text-muted-foreground mb-3">
                Take a selfie holding your ID document
              </Box>
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                className="hidden"
                id="selfie"
              />
              <Box
                as="label"
                htmlFor="selfie"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Box>
              {kycData.identityDocuments.selfie && (
                <Box className="mt-2 text-sm text-green-600">
                  ✓ {kycData.identityDocuments.selfie.name}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Back
          </Button>
          <Button
            onClick={verifyIdentity}
            disabled={
              isLoading ||
              !kycData.identityDocuments.idFront ||
              !kycData.identityDocuments.idBack ||
              !kycData.identityDocuments.selfie
            }
            className="flex-1 btn-gradient"
          >
            {isLoading ? 'Verifying...' : 'Verify Identity'}
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
          <CreditCard className="w-5 h-5" />
          Financial Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Annual Income
            </Box>
            <Box
              as="select"
              className="w-full p-3 border rounded-md"
              value={kycData.financialInfo.income}
              onChange={e => handleInputChange('financialInfo', 'income', e.target.value)}
            >
              <option value="">Select Income Range</option>
              <option value="0-500k">₦0 - ₦500,000</option>
              <option value="500k-1m">₦500,000 - ₦1,000,000</option>
              <option value="1m-5m">₦1,000,000 - ₦5,000,000</option>
              <option value="5m-10m">₦5,000,000 - ₦10,000,000</option>
              <option value="10m+">₦10,000,000+</option>
            </Box>
          </Box>
          <Box>
            <Box as="label" className="text-sm font-medium mb-2 block">
              Employment Status
            </Box>
            <Box
              as="select"
              className="w-full p-3 border rounded-md"
              value={kycData.financialInfo.employment}
              onChange={e => handleInputChange('financialInfo', 'employment', e.target.value)}
            >
              <option value="">Select Employment</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="business-owner">Business Owner</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
              <option value="unemployed">Unemployed</option>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Source of Funds
          </Box>
          <Box
            as="select"
            className="w-full p-3 border rounded-md"
            value={kycData.financialInfo.sourceOfFunds}
            onChange={e => handleInputChange('financialInfo', 'sourceOfFunds', e.target.value)}
          >
            <option value="">Select Source</option>
            <option value="salary">Salary/Wages</option>
            <option value="business">Business Income</option>
            <option value="investment">Investment Returns</option>
            <option value="inheritance">Inheritance</option>
            <option value="gift">Gift</option>
            <option value="other">Other</option>
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Investment Experience
          </Box>
          <Box
            as="select"
            className="w-full p-3 border rounded-md"
            value={kycData.financialInfo.investmentExperience}
            onChange={e =>
              handleInputChange('financialInfo', 'investmentExperience', e.target.value)
            }
          >
            <option value="">Select Experience</option>
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="intermediate">Intermediate (2-5 years)</option>
            <option value="advanced">Advanced (5-10 years)</option>
            <option value="expert">Expert (10+ years)</option>
          </Box>
        </Box>

        <Box>
          <Box as="label" className="text-sm font-medium mb-2 block">
            Risk Tolerance
          </Box>
          <Box
            as="select"
            className="w-full p-3 border rounded-md"
            value={kycData.financialInfo.riskTolerance}
            onChange={e => handleInputChange('financialInfo', 'riskTolerance', e.target.value)}
          >
            <option value="">Select Risk Tolerance</option>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </Box>
        </Box>

        <Box className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Box className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-yellow-900 mb-1">
                AML Compliance
              </Box>
              <Box as="p" className="text-sm text-yellow-700">
                This information is required for Anti-Money Laundering (AML) compliance. All data is
                encrypted and used solely for regulatory purposes.
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
            Back
          </Button>
          <Button
            onClick={verifyFinancialInfo}
            disabled={
              isLoading || !kycData.financialInfo.income || !kycData.financialInfo.employment
            }
            className="flex-1 btn-gradient"
          >
            {isLoading ? 'Verifying...' : 'Verify Financial Information'}
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Investor Accreditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Box className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Box className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <Box>
              <Box as="h4" className="font-semibold text-blue-900 mb-1">
                Accredited Investor Status
              </Box>
              <Box as="p" className="text-sm text-blue-700">
                Accredited investors have access to additional investment opportunities and higher
                investment limits.
              </Box>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box className="flex items-center gap-2 mb-4">
            <Box
              as="input"
              type="checkbox"
              checked={kycData.accreditation.isAccredited}
              onChange={e =>
                handleInputChange('accreditation', 'isAccredited', e.target.checked.toString())
              }
              className="w-4 h-4"
            />
            <Box as="label" className="font-medium">
              I am an accredited investor
            </Box>
          </Box>
        </Box>

        {kycData.accreditation.isAccredited && (
          <Box className="space-y-4">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Box as="label" className="text-sm font-medium mb-2 block">
                  Net Worth
                </Box>
                <Box
                  as="select"
                  className="w-full p-3 border rounded-md"
                  value={kycData.accreditation.netWorth}
                  onChange={e => handleInputChange('accreditation', 'netWorth', e.target.value)}
                >
                  <option value="">Select Net Worth</option>
                  <option value="10m-50m">₦10M - ₦50M</option>
                  <option value="50m-100m">₦50M - ₦100M</option>
                  <option value="100m-500m">₦100M - ₦500M</option>
                  <option value="500m+">₦500M+</option>
                </Box>
              </Box>
              <Box>
                <Box as="label" className="text-sm font-medium mb-2 block">
                  Annual Income
                </Box>
                <Box
                  as="select"
                  className="w-full p-3 border rounded-md"
                  value={kycData.accreditation.annualIncome}
                  onChange={e => handleInputChange('accreditation', 'annualIncome', e.target.value)}
                >
                  <option value="">Select Annual Income</option>
                  <option value="5m-10m">₦5M - ₦10M</option>
                  <option value="10m-25m">₦10M - ₦25M</option>
                  <option value="25m-50m">₦25M - ₦50M</option>
                  <option value="50m+">₦50M+</option>
                </Box>
              </Box>
            </Box>

            <Box>
              <Box as="label" className="text-sm font-medium mb-2 block">
                Accreditation Type
              </Box>
              <Box
                as="select"
                className="w-full p-3 border rounded-md"
                value={kycData.accreditation.accreditationType}
                onChange={e =>
                  handleInputChange('accreditation', 'accreditationType', e.target.value)
                }
              >
                <option value="">Select Type</option>
                <option value="individual">Individual Investor</option>
                <option value="institutional">Institutional Investor</option>
                <option value="qualified-purchaser">Qualified Purchaser</option>
              </Box>
            </Box>
          </Box>
        )}

        <Box className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
            Back
          </Button>
          <Button
            onClick={verifyAccreditation}
            disabled={isLoading}
            className="flex-1 btn-gradient"
          >
            {isLoading ? 'Verifying...' : 'Complete Verification'}
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

  const renderCompletion = () => (
    <Card className="card-elevated">
      <CardContent className="p-8 text-center">
        <Box className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </Box>
        <Box as="h3" className="text-2xl font-bold mb-2">
          KYC Verification Complete!
        </Box>
        <Box as="p" className="text-muted-foreground mb-6">
          Your identity has been successfully verified. You can now access all platform features.
        </Box>

        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Box className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <Box className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Box className="font-medium text-green-800">Identity Verified</Box>
            </Box>
            <Box className="text-sm text-green-700">Documents processed and verified</Box>
          </Box>
          <Box className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Box className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <Box className="font-medium text-blue-800">AML Compliant</Box>
            </Box>
            <Box className="text-sm text-blue-700">Financial information verified</Box>
          </Box>
        </Box>

        <Box className="flex gap-3 justify-center">
          <Button variant="outline">Download Certificate</Button>
          <Button className="btn-gradient">Start Investing</Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="max-w-4xl mx-auto">
      {/* Header */}
      <Box className="mb-8">
        <Box as="h1" className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-gradient-primary" />
          KYC & AML Compliance
        </Box>
        <Box as="p" className="text-muted-foreground">
          Complete your identity verification to access all platform features
        </Box>
      </Box>

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
          <Box>Personal Info</Box>
          <Box>Identity</Box>
          <Box>Financial</Box>
          <Box>Accreditation</Box>
        </Box>
      </Box>

      {/* Verification Status */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(verificationStatus).map(([key, status]) => (
          <Card key={key} className="card-elevated">
            <CardContent className="p-4 text-center">
              {getStatusIcon(status)}
              <Box className="mt-2 text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Box>
              <Badge className={`mt-1 ${getStatusColor(status)}`}>{status}</Badge>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderCompletion()}
    </Box>
  );
}
