import { useState, useEffect } from 'react';

export default function VoiceCallTest() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  // Check microphone permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setPermissionStatus(result.state);
          result.onchange = () => setPermissionStatus(result.state);
        })
        .catch(err => console.log('Permission query failed:', err));
    }
  }, []);

  const testMicrophone = async () => {
    try {
      setError('');
      console.log('Testing microphone access...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request microphone access
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      console.log('✅ Microphone access granted!');
      console.log('Audio tracks:', audioStream.getAudioTracks());
      
      setStream(audioStream);
      setIsRecording(true);
      
      // Test audio levels
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(audioStream);
      microphone.connect(analyser);
      
      console.log('✅ Audio context created successfully');
      
    } catch (err: any) {
      console.error('❌ Microphone test failed:', err);
      
      let errorMessage = 'Microphone test failed: ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow microphone access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Microphone is being used by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Microphone constraints could not be satisfied.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Security error. Make sure you\'re using HTTPS or localhost.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Audio track stopped');
      });
      setStream(null);
      setIsRecording(false);
    }
  };

  const checkBrowserSupport = () => {
    const support = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: !!(window.RTCPeerConnection),
      audioContext: !!(window.AudioContext),
    };
    
    console.log('Browser support:', support);
    return support;
  };

  const browserSupport = checkBrowserSupport();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Voice Call Test</h2>
        
        {/* Browser Support Status */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Browser Support:</h3>
          <div className="space-y-1 text-sm">
            <div className={`flex justify-between ${browserSupport.getUserMedia ? 'text-green-600' : 'text-red-600'}`}>
              <span>getUserMedia:</span>
              <span>{browserSupport.getUserMedia ? '✅ Supported' : '❌ Not Supported'}</span>
            </div>
            <div className={`flex justify-between ${browserSupport.webRTC ? 'text-green-600' : 'text-red-600'}`}>
              <span>WebRTC:</span>
              <span>{browserSupport.webRTC ? '✅ Supported' : '❌ Not Supported'}</span>
            </div>
            <div className={`flex justify-between ${browserSupport.audioContext ? 'text-green-600' : 'text-red-600'}`}>
              <span>AudioContext:</span>
              <span>{browserSupport.audioContext ? '✅ Supported' : '❌ Not Supported'}</span>
            </div>
          </div>
        </div>

        {/* Permission Status */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Microphone Permission:</h3>
          <div className={`text-sm ${
            permissionStatus === 'granted' ? 'text-green-600' : 
            permissionStatus === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            Status: {permissionStatus.toUpperCase()}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error:</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 dark:text-green-200 font-semibold">
                🎤 Microphone Active
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Voice call functionality is working!
            </p>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex gap-4">
          {!isRecording ? (
            <button
              onClick={testMicrophone}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              🎤 Test Microphone
            </button>
          ) : (
            <button
              onClick={stopTest}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              🛑 Stop Test
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Click "Test Microphone" button</li>
            <li>2. Allow microphone access when prompted</li>
            <li>3. Check if microphone status shows "Active"</li>
            <li>4. If successful, voice calls should work</li>
          </ul>
        </div>
      </div>
    </div>
  );
}