// Utility to check and request media permissions
export class MediaPermissionChecker {
  static async checkPermissions(): Promise<{
    camera: boolean;
    microphone: boolean;
    errors: string[];
  }> {
    const result = {
      camera: false,
      microphone: false,
      errors: [] as string[]
    };

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        result.errors.push('getUserMedia is not supported in this browser');
        return result;
      }

      // Check microphone permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        result.microphone = true;
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        result.errors.push(`Microphone access denied: ${error.message}`);
      }

      // Check camera permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        result.camera = true;
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        result.errors.push(`Camera access denied: ${error.message}`);
      }

    } catch (error: any) {
      result.errors.push(`General media access error: ${error.message}`);
    }

    return result;
  }

  static async requestPermissions(video: boolean = true, audio: boolean = true): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audio,
        video: video ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Media permissions granted successfully');
      return stream;
    } catch (error: any) {
      console.error('❌ Media permission error:', error);
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera/microphone access was denied. Please allow permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera or microphone found. Please check your devices.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera/microphone is already in use by another application.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Camera/microphone constraints could not be satisfied.');
      } else {
        throw new Error(`Media access error: ${error.message}`);
      }
    }
  }

  static getDeviceInfo(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return Promise.resolve([]);
    }
    return navigator.mediaDevices.enumerateDevices();
  }
}