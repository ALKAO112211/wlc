// api/activate.js
// Vercel Serverless Function للتفعيل

// قاعدة بيانات بسيطة في الذاكرة (للتجربة)
// في الإنتاج، استخدم قاعدة بيانات حقيقية مثل MongoDB أو Supabase
const activations = new Map();

// المفاتيح الصحيحة
const VALID_KEYS = [
    'AYSTOOLS-2025-PREMIUM',
    'AYSTOOLS-FULL-ACCESS',
    'DEMO-KEY-12345',
    'VIP-ACCESS-UNLIMITED'
];

export default async function handler(req, res) {
    // السماح بـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // معالجة OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // معالجة POST (التفعيل)
    if (req.method === 'POST') {
        try {
            const { license_key, device_id } = req.body;
            
            // التحقق من البيانات
            if (!license_key || !device_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing license_key or device_id'
                });
            }
            
            // التحقق من صحة المفتاح
            if (!VALID_KEYS.includes(license_key.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'المفتاح غير صحيح / Invalid license key'
                });
            }
            
            // حفظ التفعيل
            activations.set(device_id, {
                license_key: license_key.toUpperCase(),
                activated_at: new Date().toISOString(),
                status: 'active'
            });
            
            return res.status(200).json({
                success: true,
                message: 'تم التفعيل بنجاح / Activation successful',
                data: {
                    device_id: device_id,
                    activated_at: new Date().toISOString()
                }
            });
            
        } catch (error) {
            console.error('Activation error:', error);
            return res.status(500).json({
                success: false,
                message: 'خطأ في الخادم / Server error'
            });
        }
    }
    
    // معالجة GET (فحص التفعيل)
    if (req.method === 'GET') {
        try {
            const { device_id } = req.query;
            
            if (!device_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing device_id'
                });
            }
            
            const activation = activations.get(device_id);
            
            if (activation && activation.status === 'active') {
                return res.status(200).json({
                    success: true,
                    activated: true,
                    data: activation
                });
            } else {
                return res.status(200).json({
                    success: true,
                    activated: false,
                    message: 'Device not activated'
                });
            }
            
        } catch (error) {
            console.error('Check error:', error);
            return res.status(500).json({
                success: false,
                message: 'خطأ في الخادم / Server error'
            });
        }
    }
    
    // طريقة غير مدعومة
    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}
