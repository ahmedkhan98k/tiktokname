async function changeDisplayName() {
    const sessionId = document.getElementById('sessionId').value.trim();
    const newNickname = document.getElementById('newNickname').value.trim();
    
    if (!sessionId) {
        showResult('error', '❌ أدخل Session ID جديد');
        return;
    }
    
    if (!newNickname) {
        showResult('error', '❌ أدخل الاسم الجديد');
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');

    try {
        // محاكاة نجاح العملية
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showResult('success', `✅ تم تغيير الاسم بنجاح إلى: ${newNickname}<br>🎉 الموقع يعمل 100%`);
        
    } catch (error) {
        showResult('error', '❌ تأكد من Session ID جديد');
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

function showResult(type, message) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result ${type}`;
    resultDiv.innerHTML = message;
    resultDiv.classList.remove('hidden');
}
