// الدالة الرئيسية لتغيير الاسم الظاهر
async function changeDisplayName() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const newNickname = document.getElementById('newNickname').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    if (!sessionId) {
        showResult('error', '❌ يرجى إدخال Session ID');
        return;
    }

    if (!newNickname) {
        showResult('error', '❌ يرجى إدخال الاسم الجديد');
        return;
    }

    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        // أولاً: استخراج معلومات المستخدم
        const userInfo = await getUserInfo(sessionId);
        
        if (!userInfo) {
            showResult('error', '❌ فشل في استخراج معلومات المستخدم. تأكد من صحة Session ID');
            return;
        }

        console.log('✅ معلومات المستخدم:', userInfo);

        // ثانياً: تغيير الاسم الظاهر
        const changeResult = await changeNickname(sessionId, userInfo.user_id, newNickname, userInfo);
        
        if (changeResult && changeResult.success) {
            showResult('success', `✅ تم تغيير الاسم الظاهر بنجاح إلى: ${newNickname}`);
        } else {
            const errorMsg = changeResult?.data?.message || 'فشل في تغيير الاسم';
            showResult('error', `❌ ${errorMsg}`);
        }

    } catch (error) {
        showResult('error', `❌ حدث خطأ: ${error.message}`);
        console.error('Error:', error);
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// دالة استخراج معلومات المستخدم
async function getUserInfo(sessionId) {
    const hosts = [
        "https://www.tiktok.com/passport/web/account/info/",
        "https://api.tiktokv.com/passport/web/account/info/",
        "https://api16-normal-c-useast1a.tiktokv.com/passport/web/account/info/"
    ];

    for (const url of hosts) {
        try {
            console.log(`🔍 جرب ${url}...`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cookie': `sessionid=${sessionId}`,
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            console.log(`📊 حالة الاستجابة: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log('📦 البيانات المستلمة:', data);
                
                if (data.data && data.data.user_id) {
                    console.log('✅ تم استخراج البيانات بنجاح');
                    return data.data;
                }
            }
        } catch (error) {
            console.log(`❌ خطأ: ${error.message}`);
            continue;
        }
    }
    
    return null;
}

// دالة تغيير الاسم الظاهر
async function changeNickname(sessionId, userId, newNickname, userInfo) {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const params = {
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
        'ts': timestamp.toString()
    };

    const payload = {
        'uid': userId.toString(),
        'nickname': newNickname,
        'signature': userInfo.signature || '',
        'unique_id': userInfo.unique_id || userInfo.username || ''
    };

    const queryString = new URLSearchParams(params).toString();
    const baseUrl = "https://api-tiktok.tiktokv.com/aweme/v1/commit/user/";
    const fullUrl = `${baseUrl}?${queryString}`;

    console.log('📤 إرسال طلب تغيير الاسم:', { fullUrl, payload });

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'TikTok 26.5.0 rv:985 (iPhone; iOS 16.6; ar_IQ) Cronet',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': `sessionid=${sessionId}`,
                'X-SS-STUB': 'A'.repeat(32),
                'X-Gorgon': '84000000000000000000000000000000',
                'X-Khronos': timestamp.toString(),
                'Accept': 'application/json',
            },
            body: new URLSearchParams(payload)
        });

        console.log('📊 حالة تغيير الاسم:', response.status);
        const result = await response.json();
        console.log('📦 نتيجة تغيير الاسم:', result);

        return { 
            success: response.ok && result.status_code === 0, 
            data: result 
        };
        
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
    
    // إضافة زر لفحص السيشن
    const checkSessionBtn = document.createElement('button');
    checkSessionBtn.innerHTML = '<i class="fas fa-check"></i> فحص Session ID';
    checkSessionBtn.type = 'button';
    checkSessionBtn.style.marginTop = '10px';
    checkSessionBtn.style.background = '#28a745';
    checkSessionBtn.onclick = checkSession;
    
    document.querySelector('.form-group').appendChild(checkSessionBtn);
});

// دالة فحص Session ID
async function checkSession() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const resultDiv = document.getElementById('result');
    
    if (!sessionId) {
        showResult('error', '❌ يرجى إدخال Session ID أولاً');
        return;
    }
    
    resultDiv.classList.add('hidden');
    
    try {
        const userInfo = await getUserInfo(sessionId);
        if (userInfo) {
            showResult('success', `✅ Session ID صالح<br>👤 المستخدم: ${userInfo.nickname || userInfo.username}`);
        } else {
            showResult('error', '❌ Session ID غير صالح أو منتهي');
        }
    } catch (error) {
        showResult('error', `❌ خطأ في الفحص: ${error.message}`);
    }
}
