// components/TimeIntervalSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface TimeIntervalSelectorProps {
  value: number;
  onChange: (valueInSeconds: number) => void;
  error?: string;
}

export const TimeIntervalSelector = ({ value, onChange, error }: TimeIntervalSelectorProps) => {
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [amount, setAmount] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize values based on the incoming seconds
  useEffect(() => {
    if (value) {
      if (value < 3600) {
        // Less than an hour, use minutes
        setUnit('minutes');
        setAmount(Math.floor(value / 60));
      } else if (value < 86400) {
        // Less than a day, use hours
        setUnit('hours');
        setAmount(Math.floor(value / 3600));
      } else {
        // Days
        setUnit('days');
        setAmount(Math.floor(value / 86400));
      }
    }
  }, []);

  const handleUnitChange = (newUnit: 'minutes' | 'hours' | 'days') => {
    setUnit(newUnit);
    setIsDropdownOpen(false);
    
    // Convert current amount to seconds based on the new unit
    let valueInSeconds = amount;
    if (newUnit === 'minutes') valueInSeconds *= 60;
    else if (newUnit === 'hours') valueInSeconds *= 3600;
    else if (newUnit === 'days') valueInSeconds *= 86400;
    
    onChange(valueInSeconds);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(e.target.value) || 0;
    setAmount(newAmount);
    
    // Convert to seconds based on the current unit
    let valueInSeconds = newAmount;
    if (unit === 'minutes') valueInSeconds *= 60;
    else if (unit === 'hours') valueInSeconds *= 3600;
    else if (unit === 'days') valueInSeconds *= 86400;
    
    onChange(valueInSeconds);
  };

  // Get max value based on unit
  const getMaxValue = () => {
    if (unit === 'minutes') return 59;
    if (unit === 'hours') return 24;
    return 100; // days
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Clock className="h-4 w-4" />
          </div>
          <input
            type="number"
            min={1}
            max={getMaxValue()}
            value={amount}
            onChange={handleAmountChange}
            className="w-full pl-10 pr-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="relative w-32">
          <div 
            className="flex items-center justify-between w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="capitalize">{unit}</span>
            {isDropdownOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-background border border-primary/20 rounded-md shadow-lg z-10">
              <div 
                className="px-3 py-2 hover:bg-primary/10 cursor-pointer"
                onClick={() => handleUnitChange('minutes')}
              >
                Minutes
              </div>
              <div 
                className="px-3 py-2 hover:bg-primary/10 cursor-pointer"
                onClick={() => handleUnitChange('hours')}
              >
                Hours
              </div>
              <div 
                className="px-3 py-2 hover:bg-primary/10 cursor-pointer"
                onClick={() => handleUnitChange('days')}
              >
                Days
              </div>
            </div>
          )}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="text-xs text-gray-500">
        {unit === 'minutes' && 'Choose between 1-59 minutes'}
        {unit === 'hours' && 'Choose between 1-24 hours'}
        {unit === 'days' && 'Choose between 1-100 days'}
      </div>
    </div>
  );
};
