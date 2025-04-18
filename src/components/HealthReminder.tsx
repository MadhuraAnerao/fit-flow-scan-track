
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

const healthQuotes = [
  "Stay hydrated! Drink water regularly.",
  "Remember to take deep breaths.",
  "Stand up and stretch for a minute.",
  "Good posture leads to better health.",
  "Take a moment to rest your eyes.",
  "A short walk can boost your energy.",
  "Mindful eating leads to better digestion.",
  "Regular exercise is key to longevity.",
  "Mental health is as important as physical health.",
  "Small healthy choices add up to big results."
];

const HealthReminder = () => {
  const [isActive, setIsActive] = useState(false);

  const showRandomQuote = useCallback(() => {
    const randomQuote = healthQuotes[Math.floor(Math.random() * healthQuotes.length)];
    toast.info(randomQuote, {
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  useEffect(() => {
    let intervalId: number;

    if (isActive) {
      showRandomQuote(); // Show first quote immediately
      intervalId = window.setInterval(showRandomQuote, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, showRandomQuote]);

  return (
    <Button
      onClick={() => setIsActive(!isActive)}
      variant={isActive ? "default" : "outline"}
      className="flex items-center gap-2"
    >
      <Bell className={isActive ? "animate-bounce" : ""} size={16} />
      {isActive ? "Disable Reminders" : "Enable Reminders"}
    </Button>
  );
};

export default HealthReminder;
