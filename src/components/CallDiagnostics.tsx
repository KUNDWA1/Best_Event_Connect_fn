import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faCamera,
  faMicrophone,
  faRefresh,
  faCog,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { MediaPermissionChecker } from '../services/mediaPermissions';
import TroubleshootingGuide from './TroubleshootingGuide';

interface DiagnosticResult {
  camera: boolean;
  microphone: boolean;
  errors: string[];
  devices: MediaDeviceInfo[];
  browserSupport: boolean;
  httpsRequired: boolean;
}

export default function CallDiagnostics() {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    try {
      const permissions = await MediaPermissionChecker.checkPermissions();
      const devices = await MediaPermissionChecker.getDeviceInfo();
      
      const diagnosticResult: DiagnosticResult = {
        ...permissions,
        devices,
        browserSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        httpsRequired: location.protocol !== 'https:' && location.hostname !== 'localhost'
      };

      setResult(diagnosticResult);
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const testCamera = async () => {
    try {
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop());
        setTestStream(null);
        return;
      }

      const stream = await MediaPermissionChecker.requestPermissions(true, true);
      setTestStream(stream);
    } catch (error: any) {
      alert(`Camera test failed: ${error.message}`);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  useEffect(() => {
    return () => {
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [testStream]);

  const StatusIcon = ({ status }: { status: boolean }) => (
    <FontAwesomeIcon 
      icon={status ? faCheckCircle : faTimesCircle} 
      className={status ? 'text-green-500' : 'text-red-500'} 
    />
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Video Call Diagnostics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showTroubleshooting 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FontAwesomeIcon icon={faQuestionCircle} />
            {showTroubleshooting ? 'Hide Guide' : 'Help'}
          </button>
          <button
            onClick={runDiagnostics}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRefresh} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Browser Support */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCog} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Browser Support</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={result.browserSupport} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {result.browserSupport ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>

          {/* HTTPS Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
              <span className="font-medium text-gray-900 dark:text-white">HTTPS Required</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={!result.httpsRequired} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {result.httpsRequired ? 'HTTPS Required' : 'OK'}
              </span>
            </div>
          </div>

          {/* Camera Access */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCamera} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Camera Access</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={result.camera} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {result.camera ? 'Granted' : 'Denied'}
              </span>
            </div>
          </div>

          {/* Microphone Access */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faMicrophone} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Microphone Access</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={result.microphone} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {result.microphone ? 'Granted' : 'Denied'}
              </span>
            </div>
          </div>

          {/* Device List */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Available Devices</h3>
            <div className="space-y-2">
              {result.devices.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No devices found</p>
              ) : (
                result.devices.map((device, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <FontAwesomeIcon 
                      icon={device.kind === 'videoinput' ? faCamera : faMicrophone}
                      className="text-gray-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {device.label || `${device.kind} ${index + 1}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-3">Issues Found</h3>
              <ul className="space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Camera Test */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Camera Test</h3>
              <button
                onClick={testCamera}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                {testStream ? 'Stop Test' : 'Test Camera'}
              </button>
            </div>
            
            {testStream && (
              <video
                ref={(video) => {
                  if (video && testStream) {
                    video.srcObject = testStream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md h-48 bg-black rounded-lg"
              />
            )}
          </div>

          {/* Solutions */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">Solutions</h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li>• Click the camera/microphone icon in your browser's address bar to allow permissions</li>
              <li>• Make sure no other applications are using your camera/microphone</li>
              <li>• Try refreshing the page and allowing permissions again</li>
              <li>• Check your browser settings for camera/microphone permissions</li>
              <li>• Ensure you're using HTTPS (required for camera access)</li>
              <li>• Try using a different browser (Chrome, Firefox, Safari, Edge)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      {showTroubleshooting && (
        <div className="mt-8">
          <TroubleshootingGuide />
        </div>
      )}
    </div>
  );
}