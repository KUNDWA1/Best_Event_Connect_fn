import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faInfoCircle, 
  faCheckCircle,
  faCamera,
  faMicrophone,
  faGlobe,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

export default function TroubleshootingGuide() {
  const commonIssues = [
    {
      issue: "Camera/Microphone Access Denied",
      icon: faCamera,
      color: "text-red-500",
      solutions: [
        "Click the camera icon in your browser's address bar",
        "Select 'Allow' for camera and microphone permissions",
        "Refresh the page after granting permissions",
        "Check browser settings: Settings > Privacy > Camera/Microphone"
      ]
    },
    {
      issue: "No Camera or Microphone Found",
      icon: faMicrophone,
      color: "text-orange-500",
      solutions: [
        "Check if your camera/microphone is properly connected",
        "Try unplugging and reconnecting USB devices",
        "Check if other applications are using the camera/microphone",
        "Update your device drivers",
        "Try a different USB port"
      ]
    },
    {
      issue: "HTTPS Required Error",
      icon: faGlobe,
      color: "text-yellow-500",
      solutions: [
        "Camera access requires HTTPS in production",
        "Use localhost for development testing",
        "Deploy your app with SSL certificate",
        "Use ngrok or similar tools for HTTPS tunneling during development"
      ]
    },
    {
      issue: "Browser Compatibility",
      icon: faCog,
      color: "text-blue-500",
      solutions: [
        "Use Chrome, Firefox, Safari, or Edge (latest versions)",
        "Avoid Internet Explorer (not supported)",
        "Update your browser to the latest version",
        "Enable JavaScript in browser settings",
        "Clear browser cache and cookies"
      ]
    }
  ];

  const browserInstructions = [
    {
      browser: "Chrome",
      steps: [
        "Click the camera icon in the address bar",
        "Select 'Always allow' for camera and microphone",
        "Or go to Settings > Privacy and security > Site Settings > Camera/Microphone"
      ]
    },
    {
      browser: "Firefox",
      steps: [
        "Click the shield icon in the address bar",
        "Click 'Allow' for camera and microphone permissions",
        "Or go to Preferences > Privacy & Security > Permissions"
      ]
    },
    {
      browser: "Safari",
      steps: [
        "Go to Safari > Preferences > Websites",
        "Select Camera and Microphone from the left sidebar",
        "Set permissions to 'Allow' for your site"
      ]
    },
    {
      browser: "Edge",
      steps: [
        "Click the camera icon in the address bar",
        "Select 'Allow' for camera and microphone",
        "Or go to Settings > Site permissions > Camera/Microphone"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Fixes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-xl" />
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Quick Fixes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Try These First:</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
              <li>• Allow camera/microphone permissions</li>
              <li>• Close other apps using camera/microphone</li>
              <li>• Try a different browser</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Check Your Setup:</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Camera and microphone are connected</li>
              <li>• Using HTTPS (not HTTP)</li>
              <li>• Browser is up to date</li>
              <li>• JavaScript is enabled</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Common Issues & Solutions</h3>
        <div className="space-y-6">
          {commonIssues.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon={item.icon} className={`${item.color} text-xl`} />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{item.issue}</h4>
              </div>
              <ul className="space-y-2">
                {item.solutions.map((solution, sIndex) => (
                  <li key={sIndex} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Browser-Specific Instructions */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Browser-Specific Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {browserInstructions.map((browser, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{browser.browser}</h4>
              <ol className="space-y-2">
                {browser.steps.map((step, sIndex) => (
                  <li key={sIndex} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {sIndex + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supported Browsers</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Chrome 60+</li>
              <li>• Firefox 55+</li>
              <li>• Safari 11+</li>
              <li>• Edge 79+</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Required Permissions</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Camera access</li>
              <li>• Microphone access</li>
              <li>• JavaScript enabled</li>
              <li>• HTTPS connection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Network Requirements</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Stable internet connection</li>
              <li>• Minimum 1 Mbps upload/download</li>
              <li>• WebRTC support</li>
              <li>• Firewall allows WebRTC</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Still Having Issues */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-xl" />
          <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">Still Having Issues?</h3>
        </div>
        <div className="space-y-3 text-yellow-800 dark:text-yellow-200">
          <p>If you're still experiencing problems after trying the solutions above:</p>
          <ul className="space-y-2 ml-4">
            <li>• Try using the diagnostic tool to identify specific issues</li>
            <li>• Test with a different device or network</li>
            <li>• Check if your antivirus/firewall is blocking camera access</li>
            <li>• Restart your browser or computer</li>
            <li>• Contact your system administrator if on a corporate network</li>
          </ul>
        </div>
      </div>
    </div>
  );
}