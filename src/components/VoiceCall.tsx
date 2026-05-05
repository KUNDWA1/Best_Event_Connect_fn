import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faVolumeUp,
  faVolumeDown,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface VoiceCallProps {
  isIncoming?: boolean;
  callerName: string;
  callerAvatar: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd: () => void;
}

export default function VoiceCall({
  isIncoming = false,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  onEnd,
}: VoiceCallProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [volume, setVolume] = useState(50);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  // Start call timer
  useEffect(() => {
    if (!isIncoming && connectionStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isIncoming, connectionStatus]);

  // Get microphone access when call starts
  useEffect(() => {
    if (!isIncoming) {
      startAudio();
    }
  }, [isIncoming]);

  const startAudio = async () => {
    try {
      setError('');
      console.log('Starting voice call...');
      
      // Request microphone access only
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      console.log('Got audio stream:', audioStream);
      setStream(audioStream);
      
      // Simulate connection after getting audio
      setTimeout(() => {
        setConnectionStatus('connected');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      let errorMessage = 'Failed to access microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Microphone is being used by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setConnectionStatus('disconnected');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        console.log('Audio toggled:', !isAudioEnabled);
      }
    }
  };

  const handleAccept = async () => {
    await startAudio();
    onAccept?.();
  };

  const handleEnd = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      console.log('Voice call ended, microphone stopped');
    }
    onEnd();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Incoming call UI
  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-pulse">
          <div className="mb-6">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-500 ring-opacity-50"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {callerName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              📞 Incoming voice call...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <button
              onClick={onDecline}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
              title="Decline call"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl rotate-135" />
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
              title="Accept call"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active voice call UI
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black bg-opacity-30 text-white">
        <div className="flex items-center gap-4">
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-12 h-12 rounded-full ring-2 ring-white ring-opacity-50"
          />
          <div>
            <h3 className="font-semibold text-lg">{callerName}</h3>
            <p className="text-sm text-gray-300">
              {connectionStatus === 'connecting' ? '📞 Connecting...' : 
               connectionStatus === 'connected' ? `🔊 ${formatDuration(callDuration)}` : 
               '❌ Disconnected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-sm capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Voice Call Area */}
      <div className="flex-1 flex items-center justify-center">
        {error ? (
          /* Error Display */
          <div className="text-center text-white p-8">
            <FontAwesomeIcon icon={faTimes} className="text-6xl mb-6 text-red-400" />
            <h2 className="text-2xl font-bold mb-4">Voice Call Failed</h2>
            <p className="text-lg mb-6 max-w-md">{error}</p>
            <button
              onClick={handleEnd}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Voice Call Display */
          <div className="text-center text-white">
            <div className="relative mb-8">
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-40 h-40 rounded-full mx-auto ring-4 ring-white ring-opacity-30 shadow-2xl"
              />
              {connectionStatus === 'connected' && (
                <div className="absolute -bottom-2 -right-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAudioEnabled ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <FontAwesomeIcon 
                      icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash} 
                      className="text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-4xl font-bold mb-2">{callerName}</h2>
            <p className="text-xl text-gray-300 mb-8">
              {connectionStatus === 'connecting' ? 'Connecting...' : 
               connectionStatus === 'connected' ? 'Voice Call Active' : 
               'Call Ended'}
            </p>

            {/* Audio Visualization */}
            {connectionStatus === 'connected' && isAudioEnabled && (
              <div className="flex items-center justify-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-green-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.5s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-50 p-8">
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            <FontAwesomeIcon
              icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
              className="text-xl"
            />
          </button>

          {/* End Call */}
          <button
            onClick={handleEnd}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
            title="End call"
          >
            <FontAwesomeIcon icon={faPhone} className="text-xl rotate-135" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center gap-4 text-white">
          <FontAwesomeIcon icon={faVolumeDown} className="text-lg" />
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm w-8">{volume}%</span>
          </div>
          <FontAwesomeIcon icon={faVolumeUp} className="text-lg" />
        </div>

        {/* Call Status */}
        <div className="text-center mt-4">
          <p className="text-white text-sm">
            🎤 Microphone: {isAudioEnabled ? 'ON' : 'OFF'} | 
            🔊 Volume: {volume}% | 
            ⏱️ Duration: {formatDuration(callDuration)}
          </p>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}