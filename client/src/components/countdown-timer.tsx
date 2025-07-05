import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isWeddingDay, setIsWeddingDay] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference < 0) {
        setIsWeddingDay(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      
      // Set urgent state for last 7 days
      setIsUrgent(days <= 7);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isWeddingDay) {
    return (
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-bold text-secondary animate-pulse">
          🎉 Je to tady! 🎉
        </div>
        <p className="text-lg mt-4 text-gray-600 dark:text-gray-300">
          Dnes je náš velký den!
        </p>
      </div>
    );
  }

  const timeUnits = [
    { label: "Dní", value: timeLeft.days },
    { label: "Hodin", value: timeLeft.hours },
    { label: "Minut", value: timeLeft.minutes },
    { label: "Sekund", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
      {timeUnits.map((unit, index) => (
        <div 
          key={unit.label} 
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg text-center transition-all duration-300 ${
            isUrgent ? 'animate-pulse border-2 border-red-400' : ''
          }`}
        >
          <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 transition-all duration-500 ${
            isUrgent ? 'text-red-500' : 'text-primary'
          }`}>
            {unit.value.toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {unit.label}
          </div>
          {isUrgent && unit.label === 'Dní' && unit.value <= 3 && (
            <div className="text-xs text-red-400 mt-1 font-semibold">
              Už brzy!
            </div>
          )}
        </div>
      ))}
    </div>
  );
}