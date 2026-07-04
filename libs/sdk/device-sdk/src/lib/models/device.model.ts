export interface DeviceInfo {
  deviceId: string;
  model: string;
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion?: string;
}

export interface ClientFingerprint {
  userAgent: string;
  language: string;
  screenResolution: string;
  timezone: string;
  platform: string;
}
