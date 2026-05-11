"use client";

import React from 'react';
import VerificationInput from 'react-verification-input';
import { COLORS } from '@/lib/constants';

interface VerificationInputComponentProps {
  onComplete: (confirmationNumber: string) => void;
}

const VerificationInputComponent: React.FC<VerificationInputComponentProps> = ({ onComplete }) => {
  return (
    <VerificationInput
      length={6}
      placeholder=" "
      onComplete={onComplete}
      classNames={{
        container: "vi-container",
        character: "vi-character",
        characterSelected: "vi-character-selected",
      }}
      validChars="0-9"
    />
  );
};

export default VerificationInputComponent;

