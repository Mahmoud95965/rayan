import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is properly set
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => 
  value && value !== 'your_api_key_here' && value !== 'your_project_id' && 
  value !== 'your_sender_id' && value !== 'your_app_id' && value !== undefined
);

let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    
    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase configuration is missing. Running in demo mode without Firebase.');
  console.log('To enable Firebase features:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com');
  console.log('2. Copy your config to .env.local file');
  console.log('3. Set environment variables in your deployment platform');
}

// Export Firebase services (will be null if not configured)
export { auth, db };

export default app;

// Sample crop types data for MVP
export const cropTypesData = [
  {
    id: '1',
    name: 'tomato',
    name_ar: 'طماطم',
    growing_period_days: 90,
    water_requirements: '500-700 مم',
    fertilizer_requirements: 'NPK 15-15-15',
    irrigation_frequency_days: 2,
    fertilization_frequency_days: 14,
    season: 'صيفي'
  },
  {
    id: '2', 
    name: 'wheat',
    name_ar: 'قمح',
    growing_period_days: 150,
    water_requirements: '400-500 مم',
    fertilizer_requirements: 'يوريا 46%',
    irrigation_frequency_days: 7,
    fertilization_frequency_days: 21,
    season: 'شتوي'
  },
  {
    id: '3',
    name: 'corn',
    name_ar: 'ذرة',
    growing_period_days: 120,
    water_requirements: '600-800 مم',
    fertilizer_requirements: 'NPK 20-10-10',
    irrigation_frequency_days: 3,
    fertilization_frequency_days: 14,
    season: 'صيفي'
  },
  {
    id: '4',
    name: 'cotton',
    name_ar: 'قطن',
    growing_period_days: 180,
    water_requirements: '700-900 مم',
    fertilizer_requirements: 'سماد مركب',
    irrigation_frequency_days: 5,
    fertilization_frequency_days: 21,
    season: 'صيفي'
  },
  {
    id: '5',
    name: 'rice',
    name_ar: 'أرز',
    growing_period_days: 130,
    water_requirements: '1000-1200 مم',
    fertilizer_requirements: 'يوريا + فوسفات',
    irrigation_frequency_days: 1,
    fertilization_frequency_days: 28,
    season: 'صيفي'
  }
];

// Sample weather alerts for MVP
export const weatherAlertsData = [
  {
    id: '1',
    title: 'موجة حارة متوقعة',
    description: 'درجات حرارة مرتفعة متوقعة الأسبوع القادم. يُنصح بزيادة الري.',
    severity: 'medium' as const,
    type: 'temperature' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'أمطار خفيفة متوقعة',
    description: 'أمطار خفيفة متوقعة يومي الجمعة والسبت. يمكن تقليل الري.',
    severity: 'low' as const,
    type: 'rain' as const,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];
