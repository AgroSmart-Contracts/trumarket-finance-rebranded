"use client";

import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { COLORS, TYPOGRAPHY } from '@/lib/constants';

interface EmailInputProps {
  name?: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors;
  placeholder?: string;
  label?: string;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  name = 'email',
  register,
  errors,
  placeholder = 'Enter your email',
  label = 'Email Address',
  className,
}) => {
  const emailRegister = register(name, {
    required: 'Email field is required!',
    pattern: {
      value: /\S+@\S+\.\S+/,
      message: 'Email format is invalid!',
    },
  });

  return (
    <div className={className}>
      <label 
        className="block text-sm font-semibold mb-2"
        style={{ 
          color: COLORS.text.dark,
          letterSpacing: TYPOGRAPHY.letterSpacing.tight 
        }}
      >
        {label}
      </label>
      <input
        type="email"
        placeholder={placeholder}
        {...emailRegister}
        className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:ring-2 focus:ring-[${COLORS.primary.green}] focus:border-[${COLORS.primary.green}] ${
          errors?.[name] ? 'border-red-300' : 'border-gray-300'
        }`}
        style={{
          borderColor: errors?.[name] ? '#ef4444' : COLORS.border.light,
        }}
      />
      {errors?.[name] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default EmailInput;

