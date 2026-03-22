declare module 'react-phone-input-2' {
  import * as React from 'react';

  export interface CountryData {
    countryCode?: string;
    dialCode?: string;
    name?: string;
  }

  export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    country?: string;
    value?: string;
    onChange?: (value: string, data?: CountryData, event?: any, formattedValue?: string) => void;
    inputProps?: any;
    placeholder?: string;
  }

  const PhoneInput: React.ComponentType<PhoneInputProps>;
  export default PhoneInput;
}
