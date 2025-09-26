# 🌐 دليل نظام إنترنت الأشياء (IoT) للمزرعة الذكية

## 🎯 نظرة عامة

تم تطوير نظام IoT متكامل لربط الأجهزة الحقيقية مع منصة ريّان، مما يتيح لك التحكم الكامل في مزرعتك عن بُعد!

---

## 🔧 الأجهزة المدعومة

### 📹 1. الكاميرات الأمنية
- **كاميرات IP** مع دعم RTSP/WebRTC
- **التحكم في الاتجاه** (Pan/Tilt/Zoom)
- **التسجيل المباشر** والتقاط الصور
- **كشف الحركة** والتنبيهات
- **البث المباشر** عالي الجودة

### 💧 2. أنظمة الري الذكية
- **صمامات كهربائية** للتحكم في تدفق المياه
- **مضخات المياه** مع تحكم في السرعة
- **أجهزة قياس التدفق** لمراقبة الاستهلاك
- **جدولة تلقائية** للري حسب الحاجة
- **تحكم عن بُعد** في جميع العمليات

### 🌡️ 3. أجهزة الاستشعار
- **مستشعرات الحرارة والرطوبة** (DHT22/SHT30)
- **مستشعرات رطوبة التربة** (Capacitive/Resistive)
- **مستشعرات الإضاءة** (LDR/BH1750)
- **مستشعرات الضغط الجوي** (BMP280)
- **مستشعرات جودة الهواء** (MQ series)

### ⚡ 4. أجهزة التحكم
- **صمامات المياه الذكية** مع تحكم نسبي
- **مفاتيح الإضاءة الذكية** للإنارة الليلية
- **أجهزة التحكم في المناخ** (مراوح، تدفئة)
- **أنظمة الإنذار** والتنبيهات الصوتية

---

## 🏗️ البنية التقنية

### 📡 طرق الاتصال المدعومة

#### 1. **Wi-Fi**
```javascript
// مثال: ESP32 مع Wi-Fi
const deviceConfig = {
  ssid: "FarmNetwork",
  password: "your_password",
  serverUrl: "https://your-farm-api.com"
};
```

#### 2. **Ethernet**
```javascript
// مثال: Raspberry Pi مع Ethernet
const networkConfig = {
  ip: "192.168.1.100",
  gateway: "192.168.1.1",
  dns: "8.8.8.8"
};
```

#### 3. **LoRaWAN**
```javascript
// مثال: أجهزة بعيدة المدى
const loraConfig = {
  devEUI: "0123456789ABCDEF",
  appEUI: "FEDCBA9876543210",
  appKey: "your_app_key"
};
```

#### 4. **Zigbee/Z-Wave**
```javascript
// مثال: شبكة mesh للأجهزة
const meshConfig = {
  networkId: "farm_mesh_001",
  channel: 11,
  panId: "0x1234"
};
```

---

## 🔌 ربط الأجهزة

### 📋 متطلبات الأجهزة

#### للكاميرات:
- **كاميرا IP** تدعم RTSP أو WebRTC
- **عنوان IP ثابت** أو DDNS
- **اتصال إنترنت مستقر** (1 Mbps على الأقل)
- **مصدر طاقة مستمر** (PoE أو محول كهرباء)

#### لأنظمة الري:
- **صمامات كهربائية** (12V/24V)
- **مضخة مياه** مع تحكم PWM
- **حساس تدفق** (Hall Effect)
- **ريلاي للتحكم** في الأجهزة الكهربائية

#### لأجهزة الاستشعار:
- **مايكروكنترولر** (ESP32/Arduino/Raspberry Pi)
- **مستشعرات متنوعة** حسب الحاجة
- **مقاومات ومكثفات** للدوائر
- **علبة حماية** ضد الطقس (IP65)

---

## 💻 إعداد الأجهزة

### 🔧 1. إعداد ESP32 للاستشعار

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// إعدادات الشبكة
const char* ssid = "FarmNetwork";
const char* password = "your_password";
const char* serverURL = "https://your-api.com/sensors";

// إعدادات المستشعرات
#define DHT_PIN 4
#define SOIL_PIN A0
#define LIGHT_PIN A1

DHT dht(DHT_PIN, DHT22);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // الاتصال بالشبكة
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("جاري الاتصال بالشبكة...");
  }
  Serial.println("تم الاتصال بالشبكة!");
}

void loop() {
  // قراءة المستشعرات
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilMoisture = analogRead(SOIL_PIN);
  int lightLevel = analogRead(LIGHT_PIN);
  
  // إرسال البيانات
  sendSensorData(temperature, humidity, soilMoisture, lightLevel);
  
  delay(30000); // إرسال كل 30 ثانية
}

void sendSensorData(float temp, float hum, int soil, int light) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    String jsonData = "{";
    jsonData += "\"deviceId\":\"sensor_001\",";
    jsonData += "\"temperature\":" + String(temp) + ",";
    jsonData += "\"humidity\":" + String(hum) + ",";
    jsonData += "\"soilMoisture\":" + String(soil) + ",";
    jsonData += "\"lightLevel\":" + String(light) + ",";
    jsonData += "\"timestamp\":\"" + String(millis()) + "\"";
    jsonData += "}";
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      Serial.println("تم إرسال البيانات بنجاح");
    } else {
      Serial.println("خطأ في إرسال البيانات");
    }
    
    http.end();
  }
}
```

### 🚰 2. إعداد نظام الري الذكي

```cpp
#include <WiFi.h>
#include <WebServer.h>

// إعدادات الأجهزة
#define PUMP_PIN 2
#define VALVE_PIN 3
#define FLOW_SENSOR_PIN 4

WebServer server(80);
volatile int flowPulses = 0;
float flowRate = 0.0;
bool pumpStatus = false;
bool valveStatus = false;

void setup() {
  Serial.begin(115200);
  
  // إعداد المخارج
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(VALVE_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  
  // إعداد مقاطعة حساس التدفق
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, FALLING);
  
  // الاتصال بالشبكة
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
  
  // إعداد خادم الويب
  server.on("/pump/on", handlePumpOn);
  server.on("/pump/off", handlePumpOff);
  server.on("/valve/open", handleValveOpen);
  server.on("/valve/close", handleValveClose);
  server.on("/status", handleStatus);
  
  server.begin();
  Serial.println("نظام الري جاهز!");
}

void loop() {
  server.handleClient();
  
  // حساب معدل التدفق
  static unsigned long lastTime = 0;
  if (millis() - lastTime > 1000) {
    flowRate = (flowPulses * 2.25); // تحويل النبضات إلى لتر/دقيقة
    flowPulses = 0;
    lastTime = millis();
  }
}

void flowPulseCounter() {
  flowPulses++;
}

void handlePumpOn() {
  digitalWrite(PUMP_PIN, HIGH);
  pumpStatus = true;
  server.send(200, "application/json", "{\"status\":\"pump_on\"}");
}

void handlePumpOff() {
  digitalWrite(PUMP_PIN, LOW);
  pumpStatus = false;
  server.send(200, "application/json", "{\"status\":\"pump_off\"}");
}

void handleValveOpen() {
  digitalWrite(VALVE_PIN, HIGH);
  valveStatus = true;
  server.send(200, "application/json", "{\"status\":\"valve_open\"}");
}

void handleValveClose() {
  digitalWrite(VALVE_PIN, LOW);
  valveStatus = false;
  server.send(200, "application/json", "{\"status\":\"valve_close\"}");
}

void handleStatus() {
  String json = "{";
  json += "\"pump\":" + String(pumpStatus ? "true" : "false") + ",";
  json += "\"valve\":" + String(valveStatus ? "true" : "false") + ",";
  json += "\"flowRate\":" + String(flowRate) + ",";
  json += "\"timestamp\":" + String(millis());
  json += "}";
  
  server.send(200, "application/json", json);
}
```

### 📹 3. إعداد كاميرا IP

```python
# مثال باستخدام Raspberry Pi + Camera
import cv2
import requests
import threading
import time
from flask import Flask, Response

app = Flask(__name__)

class FarmCamera:
    def __init__(self, device_id, api_url):
        self.device_id = device_id
        self.api_url = api_url
        self.camera = cv2.VideoCapture(0)
        self.recording = False
        
    def start_stream(self):
        """بدء البث المباشر"""
        while True:
            ret, frame = self.camera.read()
            if ret:
                # ضغط الإطار
                _, buffer = cv2.imencode('.jpg', frame, 
                    [cv2.IMWRITE_JPEG_QUALITY, 80])
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + 
                       buffer.tobytes() + b'\r\n')
    
    def take_snapshot(self):
        """التقاط صورة"""
        ret, frame = self.camera.read()
        if ret:
            filename = f"snapshot_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)
            return filename
        return None
    
    def start_recording(self):
        """بدء التسجيل"""
        self.recording = True
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        filename = f"recording_{int(time.time())}.avi"
        out = cv2.VideoWriter(filename, fourcc, 20.0, (640, 480))
        
        while self.recording:
            ret, frame = self.camera.read()
            if ret:
                out.write(frame)
        
        out.release()
        return filename
    
    def stop_recording(self):
        """إيقاف التسجيل"""
        self.recording = False

# إعداد الكاميرا
camera = FarmCamera("camera_001", "https://your-api.com")

@app.route('/stream')
def video_stream():
    return Response(camera.start_stream(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/snapshot')
def snapshot():
    filename = camera.take_snapshot()
    return {"status": "success", "filename": filename}

@app.route('/record/start')
def start_record():
    threading.Thread(target=camera.start_recording).start()
    return {"status": "recording_started"}

@app.route('/record/stop')
def stop_record():
    camera.stop_recording()
    return {"status": "recording_stopped"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

---

## 🔗 ربط الأجهزة بالمنصة

### 📝 1. تسجيل جهاز جديد

```javascript
// في المنصة
import { iotService } from './services/iotService';

// تسجيل كاميرا جديدة
const cameraDevice = {
  name: 'كاميرا القطعة الشمالية',
  type: 'camera',
  location: 'القطعة الشمالية',
  status: 'online',
  data: {
    streamUrl: 'http://192.168.1.100:8080/stream',
    resolution: '1080p',
    isRecording: false,
    motionDetection: true
  }
};

const deviceId = await iotService.registerDevice(cameraDevice);
console.log('تم تسجيل الجهاز:', deviceId);
```

### 🔄 2. التحكم في الأجهزة

```javascript
// التحكم في الكاميرا
await iotService.controlCamera('camera_001', 'record');

// التحكم في نظام الري
await iotService.controlIrrigation('irrigation_001', 'start');

// التحكم في الصمام
await iotService.controlValve('valve_001', 75); // فتح 75%

// قراءة بيانات المستشعر
const sensorData = await iotService.getSensorData('sensor_001');
console.log('درجة الحرارة:', sensorData.temperature);
```

---

## 📊 مراقبة الأجهزة

### 🔍 1. حالة الأجهزة
- **متصل**: الجهاز يعمل ويرسل بيانات
- **غير متصل**: انقطاع الاتصال لأكثر من دقيقة
- **خطأ**: مشكلة في الجهاز أو البيانات

### 📈 2. البيانات المراقبة
- **آخر تحديث**: وقت آخر اتصال
- **معدل الإرسال**: عدد الرسائل في الدقيقة
- **جودة الإشارة**: قوة الاتصال
- **استهلاك الطاقة**: للأجهزة التي تدعم ذلك

### 🚨 3. التنبيهات التلقائية
- **انقطاع الاتصال**: تنبيه فوري
- **قيم غير طبيعية**: حرارة عالية، رطوبة منخفضة
- **أعطال الأجهزة**: مشاكل في المضخات أو الصمامات
- **استهلاك عالي**: للمياه أو الكهرباء

---

## 🛠️ استكشاف الأخطاء

### ❌ مشاكل شائعة وحلولها

#### 1. **الجهاز لا يتصل**
```bash
# تحقق من الشبكة
ping 192.168.1.100

# تحقق من المنافذ
nmap -p 80,8080 192.168.1.100

# إعادة تشغيل الجهاز
curl -X POST http://192.168.1.100/restart
```

#### 2. **بيانات غير صحيحة**
```javascript
// تحقق من صحة البيانات
const validateSensorData = (data) => {
  if (data.temperature < -40 || data.temperature > 80) {
    console.error('درجة حرارة غير منطقية');
    return false;
  }
  if (data.humidity < 0 || data.humidity > 100) {
    console.error('رطوبة غير صحيحة');
    return false;
  }
  return true;
};
```

#### 3. **مشاكل الكاميرا**
```python
# تحقق من الكاميرا
import cv2

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("خطأ: لا يمكن فتح الكاميرا")
else:
    print("الكاميرا تعمل بشكل طبيعي")
    cap.release()
```

---

## 🔒 الأمان والحماية

### 🛡️ 1. تشفير الاتصالات
```javascript
// استخدام HTTPS/WSS
const secureConfig = {
  protocol: 'https',
  port: 443,
  ssl: {
    cert: '/path/to/cert.pem',
    key: '/path/to/key.pem'
  }
};
```

### 🔐 2. المصادقة والترخيص
```javascript
// API Key للأجهزة
const deviceAuth = {
  apiKey: 'your_secure_api_key',
  deviceId: 'unique_device_id',
  signature: 'hmac_signature'
};
```

### 🔄 3. تحديثات الأمان
```bash
# تحديث البرامج الثابتة
curl -X POST http://device-ip/update \
  -H "Authorization: Bearer your_token" \
  -F "firmware=@new_firmware.bin"
```

---

## 📱 التطبيق المحمول

### 📲 ميزات التطبيق
- **مراقبة مباشرة** لجميع الأجهزة
- **تحكم عن بُعد** في الري والإضاءة
- **تنبيهات فورية** على الهاتف
- **تقارير يومية** عن حالة المزرعة

### 🔔 الإشعارات
```javascript
// إعداد الإشعارات
const notificationConfig = {
  criticalAlerts: true,    // تنبيهات حرجة
  dailyReports: true,      // تقارير يومية
  weatherAlerts: true,     // تنبيهات جوية
  deviceStatus: false      // حالة الأجهزة
};
```

---

## 🚀 الخطوات التالية

### 🎯 1. البدء السريع
1. **اختر الأجهزة** المناسبة لمزرعتك
2. **اتبع دليل الإعداد** لكل جهاز
3. **سجل الأجهزة** في المنصة
4. **ابدأ المراقبة** والتحكم

### 📈 2. التوسع
- **أضف المزيد من المستشعرات** في مناطق مختلفة
- **ادمج أنظمة الطقس** المحلية
- **استخدم الذكاء الاصطناعي** للتنبؤات
- **اربط مع أنظمة المحاسبة** لحساب التكاليف

### 🤝 3. الدعم
- **الوثائق التقنية**: [docs.rayyan-farm.com](https://docs.rayyan-farm.com)
- **المجتمع**: [community.rayyan-farm.com](https://community.rayyan-farm.com)
- **الدعم الفني**: support@rayyan-farm.com
- **الهاتف**: +20-xxx-xxx-xxxx

---

## 🎉 استمتع بمزرعتك الذكية!

الآن يمكنك التحكم الكامل في مزرعتك من أي مكان في العالم! 🌍

**ريّان - نزرع المستقبل بذكاء** 🌱
