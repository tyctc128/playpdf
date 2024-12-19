let pdfDoc = null;
let pageNum = 1;
let isPlaying = false;
let playInterval = null;
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const fileInput = document.getElementById('pdfFile');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// 創建音效
const pageFlipSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');

// 停止按鈕的音效處理
function playStopSound() {
    // 創建多個音效實例同時播放來增加音量
    const soundCount = 3; // 同時播放3個實例
    for(let i = 0; i < soundCount; i++) {
        const stopSound = new Audio('dunnn.wav');
        stopSound.volume = 1.0; // 設定最大音量
        
        const promise = stopSound.play();
        if (promise !== undefined) {
            promise.then(_ => {
                console.log('音效播放成功');
            }).catch(error => {
                console.log('音效播放失敗:', error);
            });
        }
    }
}

// 載入PDF文件
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('請上傳PDF文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);
        loadPDF(typedarray);
    };
    reader.readAsArrayBuffer(file);
});

// 載入PDF
async function loadPDF(data) {
    try {
        pdfDoc = await pdfjsLib.getDocument({data: data}).promise;
        pageNum = 1;
        renderPage(pageNum);
        startBtn.disabled = false;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('PDF載入失敗！');
    }
}

// 渲染PDF頁面
async function renderPage(num) {
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({scale: 1.5});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        const pageFlipSoundInstance = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        pageFlipSoundInstance.play();
    } catch (error) {
        console.error('Error rendering page:', error);
    }
}

// 開始輪播函數
function startCarousel() {
    playInterval = setInterval(async () => {
        // 生成隨機頁碼
        pageNum = Math.floor(Math.random() * pdfDoc.numPages) + 1;
        await renderPage(pageNum);
    }, parseInt(speedSlider.value));
}

// 更新速度顯示
speedSlider.addEventListener('input', function() {
    const speed = this.value / 1000;
    speedValue.textContent = speed.toFixed(2);
    if (isPlaying) {
        // 如果正在播放，立即更新播放速度
        clearInterval(playInterval);
        startCarousel();
    }
});

// 開始輪播
startBtn.addEventListener('click', function() {
    if (!pdfDoc) return;
    isPlaying = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    startCarousel();
});

// 停止輪播
stopBtn.addEventListener('click', function() {
    isPlaying = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearInterval(playInterval);
    playStopSound();  // 播放停止音效
});
