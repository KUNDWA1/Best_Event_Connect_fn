import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faHistory, faComments, faCog } from '@fortawesome/free-solid-svg-icons';
import { useVideoCall } from '../hooks/useVideoCall';
import VideoCall from './VideoCall';
import CallHistory from './CallHistory';
import CallNotification from './CallNotification';
import CallDiagnostics from './CallDiagnostics';
import Chat from './Chat';

export default function CallDemo() {
  const [showChat, setShowChat] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const {
    callState,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    simulateIncomingCall,
    useDemo,
  } = useVideoCall();

  const mockContact = {
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    id: '1',
  };

  const handleVoiceCall = async () => {
    try {
      await initiateCall(
        mockContact.id,
        mockContact.name,
        mockContact.avatar,
        'voice'
      );
    } catch (error) {
      console.error('Failed to start voice call:', error);
    }
  };

  const handleVideoCall = async () => {
    try {
      await initiateCall(
        mockContact.id,
        mockContact.name,
        mockContact.avatar,
        'video'
      );
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const handleSimulateIncoming = () => {
    simulateIncomingCall('video');
  };

  const handleAcceptIncoming = () => {
    setShowIncomingCall(false);
    acceptCall();
  };

  const handleDeclineIncoming = () => {
    setShowIncomingCall(false);
    declineCall();
  };

  const handleCallFromHistory = async (contactName: string, contactAvatar: string, callType: 'video' | 'voice') => {
    setShowCallHistory(false);
    try {
      await initiateCall('demo-id', contactName, contactAvatar, callType);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Video & Voice Call Demo
          </h1>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <button
              onClick={handleVoiceCall}
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faPhone} className="text-2xl" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Start Voice Call</span>
            </button>

            <button
              onClick={handleVideoCall}
              className="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faVideo} className="text-2xl" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Start Video Call</span>
            </button>

            <button
              onClick={handleSimulateIncoming}
              className="flex flex-col items-center gap-3 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faPhone} className="text-2xl animate-bounce" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Simulate Incoming</span>
            </button>

            <button
              onClick={() => setShowCallHistory(true)}
              className="flex flex-col items-center gap-3 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faHistory} className="text-2xl" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Call History</span>
            </button>

            <button
              onClick={() => setShowDiagnostics(true)}
              className="flex flex-col items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faCog} className="text-2xl" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Diagnostics</span>
            </button>
          </div>

          {/* Chat Demo */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Chat with Video/Voice Call Integration
            </h2>
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faComments} />
              Open Chat
            </button>
          </div>

          {/* Call Status */}
          {(callState.isInCall || callState.isIncomingCall) && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Call Status {useDemo && '(Demo Mode)'}
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p>In Call: {callState.isInCall ? 'Yes' : 'No'}</p>
                <p>Incoming Call: {callState.isIncomingCall ? 'Yes' : 'No'}</p>
                <p>Connection: {callState.connectionStatus}</p>
                <p>Call Type: {callState.callData?.callType || 'None'}</p>
                <p>Duration: {callState.callDuration}s</p>
                {useDemo && (
                  <p className="text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ Running in demo mode - camera permissions may be required
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Video Call Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• HD video quality with camera controls</li>
                <li>• Picture-in-picture local video</li>
                <li>• Screen sharing capability</li>
                <li>• Fullscreen mode</li>
                <li>• In-call chat</li>
                <li>• Participant management</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Voice Call Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Crystal clear audio quality</li>
                <li>• Microphone mute/unmute</li>
                <li>• Volume controls</li>
                <li>• Call duration tracking</li>
                <li>• Background call support</li>
                <li>• Call history tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <Chat
          recipientRole="Event Vendor"
          onClose={() => setShowChat(false)}
          isModal={true}
        />
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <CallHistory
          onClose={() => setShowCallHistory(false)}
          onCallContact={handleCallFromHistory}
        />
      )}

      {/* Incoming Call Notification */}
      {showIncomingCall && (
        <CallNotification
          callerName={mockContact.name}
          callerAvatar={mockContact.avatar}
          callType="video"
          onAccept={handleAcceptIncoming}
          onDecline={handleDeclineIncoming}
        />
      )}

      {/* Diagnostics Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Call Diagnostics</h2>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <CallDiagnostics />
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      {(callState.isInCall || callState.isIncomingCall) && (
        <VideoCall
          isIncoming={callState.isIncomingCall}
          callerName={callState.callData?.callerName || mockContact.name}
          callerAvatar={callState.callData?.callerAvatar || mockContact.avatar}
          callType={callState.callData?.callType || 'voice'}
          onAccept={acceptCall}
          onDecline={declineCall}
          onEnd={endCall}
        />
      )}
    </div>
  );
}