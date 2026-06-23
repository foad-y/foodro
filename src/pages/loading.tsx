import { useEffect, useState } from "react";

interface LoadingLineProps {
  duration?: number; // مدت زمان لودینگ به میلی‌ثانیه (default: 2000)
  onComplete?: () => void;
  color?: string;
  height?: string;
  width?: string;
}

export const LoadingLine = ({
  duration = 5000,
  onComplete,
  color = "bg-primary",
  height = "h-1",
  width = "w-96",
}: LoadingLineProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 16); // حدود 60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col justify-center items-center gap-5">
        <h2>در حال بروزرسانی...</h2>
        <div
          dir="ltr"
          className={`${width} ${height} bg-white rounded-full overflow-hidden`}
        >
          <div
            className={`${height} ${color} rounded-full transition-all duration-75 ease-linear`}
            //   style={{ width: `10%` }}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
