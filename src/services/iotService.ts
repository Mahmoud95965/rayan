// IoT Service for connecting real devices
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

export interface IoTDevice {
  id: string;
  name: string;
  type: 'camera' | 'irrigation' | 'sensor' | 'valve';
  status: 'online' | 'offline' | 'error';
  location: string;
  lastUpdate: Date;
  data?: any;
  config?: any;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
  timestamp: Date;
}

export interface CameraDevice extends IoTDevice {
  type: 'camera';
  data: {
    streamUrl: string;
    resolution: string;
    isRecording: boolean;
    motionDetection: boolean;
  };
}

export interface IrrigationDevice extends IoTDevice {
  type: 'irrigation';
  data: {
    isActive: boolean;
    flowRate: number; // liters per minute
    totalFlow: number; // total liters today
    schedule: {
      enabled: boolean;
      times: string[];
      duration: number; // minutes
    };
  };
}

export interface SensorDevice extends IoTDevice {
  type: 'sensor';
  data: SensorData;
}

export interface ValveDevice extends IoTDevice {
  type: 'valve';
  data: {
    isOpen: boolean;
    openPercentage: number;
    lastAction: Date;
  };
}

class IoTService {
  private devices: Map<string, IoTDevice> = new Map();
  private listeners: Map<string, () => void> = new Map();

  // Initialize IoT service
  async initialize() {
    console.log('🔌 Initializing IoT Service...');
    await this.loadDevices();
    this.startDeviceMonitoring();
  }

  // Load devices from Firebase
  async loadDevices() {
    try {
      const devicesRef = collection(db, 'iot_devices');
      const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
        snapshot.forEach((doc) => {
          const device = { id: doc.id, ...doc.data() } as IoTDevice;
          this.devices.set(device.id, device);
        });
        console.log(`📱 Loaded ${this.devices.size} IoT devices`);
      });
      
      this.listeners.set('devices', unsubscribe);
    } catch (error) {
      console.error('❌ Error loading devices:', error);
    }
  }

  // Register a new device
  async registerDevice(device: Omit<IoTDevice, 'id' | 'lastUpdate'>) {
    try {
      const deviceId = `${device.type}_${Date.now()}`;
      const newDevice: IoTDevice = {
        ...device,
        id: deviceId,
        lastUpdate: new Date(),
        status: 'offline'
      };

      await setDoc(doc(db, 'iot_devices', deviceId), newDevice);
      this.devices.set(deviceId, newDevice);
      
      console.log(`✅ Device registered: ${device.name}`);
      return deviceId;
    } catch (error) {
      console.error('❌ Error registering device:', error);
      throw error;
    }
  }

  // Update device status
  async updateDeviceStatus(deviceId: string, status: IoTDevice['status'], data?: any) {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error(`Device ${deviceId} not found`);
      }

      const updates: Partial<IoTDevice> = {
        status,
        lastUpdate: new Date(),
        ...(data && { data: { ...device.data, ...data } })
      };

      await updateDoc(doc(db, 'iot_devices', deviceId), updates);
      
      const updatedDevice = { ...device, ...updates };
      this.devices.set(deviceId, updatedDevice);
      
      console.log(`🔄 Device ${device.name} status updated: ${status}`);
    } catch (error) {
      console.error('❌ Error updating device status:', error);
      throw error;
    }
  }

  // Control camera device
  async controlCamera(deviceId: string, action: 'start' | 'stop' | 'record' | 'snapshot') {
    try {
      const device = this.devices.get(deviceId) as CameraDevice;
      if (!device || device.type !== 'camera') {
        throw new Error('Camera device not found');
      }

      let updates: any = {};
      
      switch (action) {
        case 'start':
          updates = { isRecording: false };
          break;
        case 'stop':
          updates = { isRecording: false };
          break;
        case 'record':
          updates = { isRecording: !device.data.isRecording };
          break;
        case 'snapshot':
          // Trigger snapshot
          break;
      }

      await this.updateDeviceStatus(deviceId, 'online', updates);
      
      // Send command to actual device (WebSocket/HTTP API)
      await this.sendDeviceCommand(deviceId, action, updates);
      
      return { success: true, action, deviceId };
    } catch (error) {
      console.error('❌ Error controlling camera:', error);
      throw error;
    }
  }

  // Control irrigation system
  async controlIrrigation(deviceId: string, action: 'start' | 'stop' | 'schedule', params?: any) {
    try {
      const device = this.devices.get(deviceId) as IrrigationDevice;
      if (!device || device.type !== 'irrigation') {
        throw new Error('Irrigation device not found');
      }

      let updates: any = {};
      
      switch (action) {
        case 'start':
          updates = { 
            isActive: true,
            lastAction: new Date()
          };
          break;
        case 'stop':
          updates = { 
            isActive: false,
            lastAction: new Date()
          };
          break;
        case 'schedule':
          updates = { 
            schedule: { ...device.data.schedule, ...params }
          };
          break;
      }

      await this.updateDeviceStatus(deviceId, 'online', updates);
      
      // Send command to actual device
      await this.sendDeviceCommand(deviceId, action, updates);
      
      return { success: true, action, deviceId };
    } catch (error) {
      console.error('❌ Error controlling irrigation:', error);
      throw error;
    }
  }

  // Control valve
  async controlValve(deviceId: string, openPercentage: number) {
    try {
      const device = this.devices.get(deviceId) as ValveDevice;
      if (!device || device.type !== 'valve') {
        throw new Error('Valve device not found');
      }

      const updates = {
        isOpen: openPercentage > 0,
        openPercentage: Math.max(0, Math.min(100, openPercentage)),
        lastAction: new Date()
      };

      await this.updateDeviceStatus(deviceId, 'online', updates);
      
      // Send command to actual device
      await this.sendDeviceCommand(deviceId, 'setPosition', updates);
      
      return { success: true, openPercentage, deviceId };
    } catch (error) {
      console.error('❌ Error controlling valve:', error);
      throw error;
    }
  }

  // Get sensor readings
  async getSensorData(deviceId: string): Promise<SensorData | null> {
    try {
      const device = this.devices.get(deviceId) as SensorDevice;
      if (!device || device.type !== 'sensor') {
        return null;
      }

      // Request fresh data from device
      await this.sendDeviceCommand(deviceId, 'readSensors');
      
      return device.data;
    } catch (error) {
      console.error('❌ Error getting sensor data:', error);
      return null;
    }
  }

  // Send command to actual device
  private async sendDeviceCommand(deviceId: string, command: string, params?: any) {
    try {
      const device = this.devices.get(deviceId);
      if (!device) return;

      // This would be replaced with actual device communication
      // Examples: WebSocket, HTTP API, MQTT, etc.
      
      console.log(`📡 Sending command to ${device.name}:`, { command, params });
      
      // Simulate device communication
      if (process.env.NODE_ENV === 'development') {
        // Mock device response
        setTimeout(() => {
          console.log(`✅ Command executed on ${device.name}`);
        }, 1000);
      } else {
        // Real device communication
        const response = await fetch(`/api/devices/${deviceId}/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, params })
        });
        
        if (!response.ok) {
          throw new Error(`Device command failed: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error sending device command:', error);
      throw error;
    }
  }

  // Start monitoring devices
  private startDeviceMonitoring() {
    // Check device status every 30 seconds
    setInterval(() => {
      this.checkDeviceHealth();
    }, 30000);
  }

  // Check device health
  private async checkDeviceHealth() {
    const now = new Date();
    
    for (const [deviceId, device] of this.devices) {
      const timeSinceUpdate = now.getTime() - device.lastUpdate.getTime();
      const isOffline = timeSinceUpdate > 60000; // 1 minute timeout
      
      if (isOffline && device.status !== 'offline') {
        await this.updateDeviceStatus(deviceId, 'offline');
        console.log(`⚠️ Device ${device.name} went offline`);
      }
    }
  }

  // Get all devices
  getDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  // Get devices by type
  getDevicesByType(type: IoTDevice['type']): IoTDevice[] {
    return this.getDevices().filter(device => device.type === type);
  }

  // Get device by ID
  getDevice(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId);
  }

  // Cleanup
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Export singleton instance
export const iotService = new IoTService();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  iotService.initialize();
}

// Device setup helpers
export const createMockDevices = async () => {
  const mockDevices = [
    {
      name: 'كاميرا القطعة الشمالية',
      type: 'camera' as const,
      location: 'القطعة الشمالية',
      status: 'online' as const,
      data: {
        streamUrl: 'rtsp://192.168.1.100:554/stream',
        resolution: '1080p',
        isRecording: false,
        motionDetection: true
      }
    },
    {
      name: 'نظام ري القطعة الشمالية',
      type: 'irrigation' as const,
      location: 'القطعة الشمالية',
      status: 'online' as const,
      data: {
        isActive: false,
        flowRate: 0,
        totalFlow: 0,
        schedule: {
          enabled: true,
          times: ['06:00', '18:00'],
          duration: 30
        }
      }
    },
    {
      name: 'مستشعر الحرارة والرطوبة - شمال',
      type: 'sensor' as const,
      location: 'القطعة الشمالية',
      status: 'online' as const,
      data: {
        temperature: 28.5,
        humidity: 65,
        soilMoisture: 45,
        lightLevel: 80,
        timestamp: new Date()
      }
    },
    {
      name: 'صمام المياه الرئيسي',
      type: 'valve' as const,
      location: 'نظام الري الرئيسي',
      status: 'online' as const,
      data: {
        isOpen: false,
        openPercentage: 0,
        lastAction: new Date()
      }
    }
  ];

  for (const device of mockDevices) {
    try {
      await iotService.registerDevice(device);
    } catch (error) {
      console.error('Error creating mock device:', error);
    }
  }
};
