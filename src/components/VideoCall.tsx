import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo,
  faVideoSlash,
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faExpand,
  faCompress,
  faVolumeUp,
  faVolumeDown,
  faCog,
  faUsers,
  faComment,
  faDesktop,
  faStop,
} from '@fortawesome/free-solid-svg-icons';

interface VideoCallProps {
  isIncoming?: boolean;
  callerName: string;
  callerAvatar: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd: () => void;
  callType: 'video' | 'voice';
}

export default function VideoCall({
  isIncoming = false,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  onEnd,
  callType,
}: VideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);

  // Simulate call duration timer
  useEffect(() => {
    if (!isIncoming && connectionStatus === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isIncoming, connectionStatus]);

  // Simulate connection after accepting call
  useEffect(() => {
    if (!isIncoming) {
      const timer = setTimeout(() => {
        setConnectionStatus('connected');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isIncoming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      callContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const startScreenShare = async () => {
    try {
      setIsScreenSharing(true);
      // In a real implementation, you would capture screen here
    } catch (error) {
      console.error('Error starting screen share:', error);
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
  };

  const handleAccept = () => {
    setConnectionStatus('connected');
    onAccept?.();
  };

  // Incoming call UI
  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {callerName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Incoming {callType} call...
            </p>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={onDecline}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl rotate-135" />
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FontAwesomeIcon icon={faPhone} className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call UI
  return (
    <div
      ref={callContainerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? 'p-0' : 'p-4'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center gap-3">
          <img
            src={callerAvatar}
            alt={callerName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{callerName}</h3>
            <p className="text-sm text-gray-300">
              {connectionStatus === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {callType === 'video' && isVideoEnabled ? (
          <>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
          </>
        ) : (
          /* Voice Call or Video Disabled */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="text-center text-white">
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-32 h-32 rounded-full mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold mb-2">{callerName}</h2>
              <p className="text-xl text-gray-300">
                {callType === 'voice' ? 'Voice Call' : 'Video Off'}
              </p>
            </div>
          </div>
        )}

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            <FontAwesomeIcon icon={faDesktop} className="mr-2" />
            Screen Sharing
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-80 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <FontAwesomeIcon
              icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
            />
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <FontAwesomeIcon
                icon={isVideoEnabled ? faVideo : faVideoSlash}
              />
            </button>
          )}

          {/* Screen Share */}
          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <FontAwesomeIcon icon={isScreenSharing ? faStop : faDesktop} />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={faComment} />
          </button>

          {/* Participants */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={faUsers} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>

          {/* End Call */}
          <button
            onClick={onEnd}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FontAwesomeIcon icon={faPhone} className="rotate-135" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center mt-4 gap-3">
          <FontAwesomeIcon icon={faVolumeDown} className="text-white" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <FontAwesomeIcon icon={faVolumeUp} className="text-white" />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-4 bottom-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Call Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Camera Quality
              </label>
              <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option>HD (720p)</option>
                <option>Full HD (1080p)</option>
                <option>4K</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Microphone
              </label>
              <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option>Default Microphone</option>
                <option>External Microphone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Speaker
              </label>
              <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option>Default Speaker</option>
                <option>Headphones</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-4 bottom-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Participants (2)</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <img src={callerAvatar} alt={callerName} className="w-8 h-8 rounded-full" />
              <span className="text-sm text-gray-900 dark:text-white">{callerName}</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                You
              </div>
              <span className="text-sm text-gray-900 dark:text-white">You</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-4 bottom-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              No messages yet
            </div>
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}