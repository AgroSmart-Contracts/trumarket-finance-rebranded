"use client";

import React from 'react';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import VerificationInputComponent from './VerificationInput';
import { EmailSteps } from '@/types/auth';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';

interface OTPInputWrapperProps {
  email: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  handleConfirm: (code: string) => Promise<void>;
  resend: () => Promise<void>;
  resendLoading: boolean;
  setEmailRegisterStep: React.Dispatch<React.SetStateAction<EmailSteps>>;
}

const OTPInputWrapper: React.FC<OTPInputWrapperProps> = ({
  email,
  setVerificationCode,
  handleConfirm,
  resend,
  resendLoading,
  setEmailRegisterStep,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p 
          className="text-base font-semibold"
          style={{ 
            color: COLORS.text.dark,
            letterSpacing: TYPOGRAPHY.letterSpacing.tight 
          }}
        >
          Confirm your e-mail address
        </p>
        <p 
          className="text-sm font-normal"
          style={{ 
            color: COLORS.text.light,
            letterSpacing: TYPOGRAPHY.letterSpacing.tight 
          }}
        >
          Below enter the code you received on <br /> {email}
        </p>
      </div>
      <div className="flex justify-center">
        <VerificationInputComponent
          onComplete={(code) => {
            setVerificationCode(code);
            handleConfirm(code);
          }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={resend}
          disabled={resendLoading}
          className={`flex items-center gap-2 text-sm underline transition-opacity ${
            resendLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-70'
          }`}
          style={{ 
            color: COLORS.text.dark,
            letterSpacing: TYPOGRAPHY.letterSpacing.tight 
          }}
        >
          Resend
          <RotateCcw 
            className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} 
          />
        </button>
        <button
          onClick={() => setEmailRegisterStep(EmailSteps.STEP_1)}
          className="flex items-center gap-2 text-sm underline cursor-pointer hover:opacity-70 transition-opacity"
          style={{ 
            color: COLORS.text.dark,
            letterSpacing: TYPOGRAPHY.letterSpacing.tight 
          }}
        >
          Go back
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OTPInputWrapper;

