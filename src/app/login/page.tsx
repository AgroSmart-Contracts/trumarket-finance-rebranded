"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useWeb3AuthContext } from '@/context/web3-auth-context';
import { AuthService } from '@/services/authService';
import { EmailSteps } from '@/types/auth';
import { handleOTP, handleRequestAuth0JWT, parseToken } from '@/lib/helpers';
import EmailInput from '@/components/auth/EmailInput';
import OTPInputWrapper from '@/components/auth/OTPInputWrapper';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/InfoCard';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';

const LoginPage = () => {
  const router = useRouter();
  const { isLoggingIn, init, setIsLoggingIn, web3authSfa, setIsLoggedIn, setJWT } = useWeb3AuthContext();
  const [emailRegisterStep, setEmailRegisterStep] = useState<EmailSteps>(EmailSteps.STEP_1);
  const [verificationCodeLoading, setVerificationCodeLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm<{ email: string }>();

  const handleSubmitForm = async (data: { email: string }) => {
    setVerificationCodeLoading(true);
    try {
      // Always allow OTP to be sent - we'll handle registration if user doesn't exist
      await handleOTP(data.email, () => setEmailRegisterStep(EmailSteps.STEP_2));
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending verification code. Please try again.');
    } finally {
      setVerificationCodeLoading(false);
    }
  };

  const handleConfirm = async (OTPcode: string) => {
    setConfirmationLoading(true);
    await handleRequestAuth0JWT(getValues('email'), OTPcode, handleAccount);
    setConfirmationLoading(false);
  };

  const handleAccount = async (auth0Jwt: string) => {
    try {
      await init();

      setIsLoggingIn(true);

      const tokenData = parseToken(auth0Jwt);
      if (!tokenData || typeof tokenData.email !== 'string') {
        throw new Error('Invalid authentication token. Please try again.');
      }
      const { email } = tokenData;

      const subVerifierInfoArray = [
        {
          verifier: 'auth0-passwordless',
          idToken: auth0Jwt,
        },
      ];

      // Connect to Web3Auth
      await web3authSfa.connect({
        verifier: process.env.NEXT_PUBLIC_WEB3AUTH_CONNECTION_ID,
        verifierId: email,
        idToken: auth0Jwt,
        subVerifierInfoArray,
      } as any);

      if (!web3authSfa.provider) {
        throw new Error('Failed to connect to Web3Auth. Please try again.');
      }

      // Get Web3Auth JWT
      const jwt = await web3authSfa.authenticateUser();
      if (!jwt?.idToken) {
        throw new Error('Failed to authenticate with Web3Auth. Please try again.');
      }

      // Try to login, if user doesn't exist, automatically register as investor
      let user;
      try {
        user = await AuthService.loginUser({ web3authToken: jwt.idToken });
      } catch (loginError: any) {
        // User doesn't exist, register them as investor
        console.log('User not found, registering as investor...');
        try {
          user = await AuthService.saveUser({
            web3authToken: jwt.idToken,
            auth0Token: auth0Jwt,
            accountType: 'investor',
          });
          toast.success('Account created successfully!');
        } catch (registerError: any) {
          throw new Error(registerError?.response?.data?.message || 'Failed to create account. Please try again.');
        }
      }

      if (!user?.token) {
        throw new Error('Authentication failed. Please try again.');
      }

      setJWT(user.token);
      setIsLoggedIn(true);

      if (web3authSfa.provider) {
        router.push('/profile');
      } else {
        throw new Error('Web3Auth connection lost. Please try again.');
      }
    } catch (err: any) {
      // Log error message only, not the full error object to avoid exposing sensitive data
      console.error('Authentication error:', err?.message || 'Unknown error');

      // Provide user-friendly error messages
      let errorMessage = 'Failed to authenticate. Please try again.';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);

      // Reset form state on error
      setEmailRegisterStep(EmailSteps.STEP_1);
    } finally {
      setIsLoggingIn(false);
      setConfirmationLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background.lightGray }}>
      <InfoCard className="p-8 max-w-md w-full">
        <div className="space-y-6">
          <div className="text-center">
            <h1
              className="text-2xl font-semibold mb-2"
              style={{
                color: COLORS.text.dark,
                letterSpacing: TYPOGRAPHY.letterSpacing.tight
              }}
            >
              Sign In
            </h1>
            <p style={{ color: COLORS.text.light }}>
              Enter your email to receive a verification code
            </p>
          </div>

          {emailRegisterStep === EmailSteps.STEP_1 ? (
            <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
              <EmailInput
                register={register}
                errors={errors}
                placeholder="Enter your email"
              />
              <Button
                type="submit"
                disabled={verificationCodeLoading}
                className="w-full text-base"
                style={{
                  backgroundColor: COLORS.primary.green,
                  color: 'white',
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                {verificationCodeLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send me an email with code'
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <OTPInputWrapper
                email={getValues('email')}
                setVerificationCode={setVerificationCode}
                handleConfirm={handleConfirm}
                resend={() => handleSubmitForm({ email: getValues('email') })}
                resendLoading={verificationCodeLoading}
                setEmailRegisterStep={setEmailRegisterStep}
              />
              <Button
                onClick={() => handleConfirm(verificationCode)}
                disabled={verificationCode?.length !== 6 || isLoggingIn || confirmationLoading}
                className="w-full text-base"
                style={{
                  backgroundColor: COLORS.primary.green,
                  color: 'white',
                  letterSpacing: TYPOGRAPHY.letterSpacing.tight
                }}
              >
                {isLoggingIn || confirmationLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          )}
        </div>
      </InfoCard>
    </div>
  );
};

export default LoginPage;

