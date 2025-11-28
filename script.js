// الدالة الرئيسية لتغيير الاسم الظاهر
async function changeDisplayName() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const newNickname = document.getElementById('newNickname').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    // التحقق من المدخلات
    if (!sessionId) {
        showResult('error', '❌ يرجى إدخال Session ID');
        return;
    }

    if (!newNickname) {
        showResult('error', '❌ يرجى إدخال الاسم الجديد');
        return;
    }

    // إظهار تحميل
    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        // أولاً: استخراج معلومات المستخدم
        const userInfo = await getUserInfo(sessionId);
        
        if (!userInfo) {
            showResult('error', '❌ فشل في استخراج معلومات المستخدم. تأكد من صحة Session ID');
            return;
        }

        // ثانياً: تغيير الاسم الظاهر
        const changeResult = await changeNickname(sessionId, userInfo.user_id, newNickname);
        
        if (changeResult && changeResult.success) {
            showResult('success', `✅ تم تغيير الاسم الظاهر بنجاح إلى: ${newNickname}`);
        } else {
            showResult('error', '❌ فشل في تغيير الاسم. قد يكون هناك مشكلة في الصلاحيات');
        }

    } catch (error) {
        showResult('error', `❌ حدث خطأ: ${error.message}`);
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// دالة استخراج معلومات المستخدم
async function getUserInfo(sessionId) {
    const hosts = [
        "api.tiktokv.com",
        "www.tiktok.com", 
        "api-tiktok.tiktokv.com"
    ];

    for (const host of hosts) {
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://${host}/passport/web/account/info/`)}`;
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Cookie': `sessionid=${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.data && data.data.user_id) {
                    console.log('✅ تم استخراج البيانات بنجاح من:', host);
                    return data.data;
                }
            }
        } catch (error) {
            console.log(`❌ فشل الاتصال بـ ${host}:`, error.message);
            continue;
        }
    }
    
    return null;
}

// دالة تغيير الاسم الظاهر
async function changeNickname(sessionId, userId, newNickname) {
    const baseUrl = "https://api-tiktok.tiktokv.com/aweme/v1/commit/user/";
    
    const params = new URLSearchParams({
        'app_name': 'trill',
        'version_code': '985',
        'device_type': 'iPhone14,2',
        'device_platform': 'iphone',
        'lang': 'ar',
        'app_language': 'ar',
        'current_region': 'IQ',
        'carrier_region': 'IQ',
        'ac': 'wifi',
        'channel': 'appstore',
        'aid': '1180',
        'ts': Math.floor(Date.now() / 1000).toString()
    });

    const payload = {
        'uid': userId,
        'nickname': newNickname,
        'signature': '',
        'unique_id': ''
    };

    try {
        const fullUrl = `${baseUrl}?${params}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'TikTok 26.5.0 rv:985 (iPhone; iOS 16.6; ar_IQ) Cronet',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': `sessionid=${sessionId}`,
                'X-SS-STUB': 'A'.repeat(32),
                'X-Gorgon': '84000000000000000000000000000000',
                'X-Khronos': Math.floor(Date.now() / 1000).toString()
            },
            body: new URLSearchParams(payload)
        });

        const result = await response.json();
        return { success: response.ok, data: result };
        
    } catch (error) {
        console.error('❌ خطأ في تغيير الاسم:', error);
        return { success: false, error: error.message };
    }
}

// دالة عرض النتائج
function showResult(type, message) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result ${type}`;
    resultDiv.innerHTML = message;
    resultDiv.classList.remove('hidden');
}

// إضافة event listener للإدخال
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                changeDisplayName();
            }
        });
    });
});
