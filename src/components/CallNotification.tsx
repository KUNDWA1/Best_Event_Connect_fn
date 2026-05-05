import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faTimes } from '@fortawesome/free-solid-svg-icons';

interface CallNotificationProps {
  callerName: string;
  callerAvatar: string;
  callType: 'video' | 'voice';
  onAccept: () => void;
  onDecline: () => void;
}

export default function CallNotification({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline,
}: CallNotificationProps) {
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    // Simulate ringtone (you can add actual audio here)
    const ringInterval = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 1000);

    return () => clearInterval(ringInterval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm border-2 transition-colors ${
        isRinging ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-12 h-12 rounded-full"
            />
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
              callType === 'video' ? 'bg-green-500' : 'bg-blue-500'
            } flex items-center justify-center`}>
              <FontAwesomeIcon 
                icon={callType === 'video' ? faVideo : faPhone} 
                className="text-white text-xs"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {callerName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Incoming {callType} call...
            </p>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}