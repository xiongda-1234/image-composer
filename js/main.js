// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.querySelector('.preview-container');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 拖拽上传相关事件
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('drag-over');
}

function unhighlight() {
    dropZone.classList.remove('drag-over');
}

// 处理文件上传
dropZone.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const files = Array.from(e.target.files);
    
    // 限制上传数量
    if (files.length > 10) {
        alert('最多只能上传10张图片！');
        return;
    }
    
    // 清空现有预览
    const imagesGrid = document.querySelector('.images-grid');
    imagesGrid.innerHTML = '';
    
    // 处理每个文件
    files.forEach((file, index) => {
        if (!file.type.match('image.*')) {
            alert(`文件 ${file.name} 不是图片格式！`);
            return;
        }
        
        // 创建图片卡片
        const card = createImageCard(file, index);
        imagesGrid.appendChild(card);
        
        // 读取并显示图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const cardOriginalImg = card.querySelector('.original-image');
            cardOriginalImg.src = e.target.result;
            card.querySelector('.original-size').textContent = formatFileSize(file.size);
            
            // 压缩图片
            compressImage(e.target.result, card);
        }
        reader.readAsDataURL(file);
    });
    
    previewContainer.style.display = 'block';
}

// 创建图片卡片
function createImageCard(file, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.innerHTML = `
        <h3>${file.name}</h3>
        <div class="image-comparison">
            <div class="image-preview">
                <p>原图</p>
                <img class="original-image" alt="原图">
                <div class="file-info">
                    <span>大小：</span>
                    <span class="original-size">0 KB</span>
                </div>
            </div>
            <div class="image-preview">
                <p>压缩后</p>
                <img class="compressed-image" alt="压缩后">
                <div class="file-info">
                    <span>大小：</span>
                    <span class="compressed-size">0 KB</span>
                </div>
            </div>
        </div>
        <div class="card-actions">
            <button class="download-button" onclick="downloadImage(this)">下载此图片</button>
        </div>
    `;
    return card;
}

// 压缩图片
function compressImage(dataUrl, card) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const quality = qualityInput.value / 100;
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        const cardCompressedImg = card.querySelector('.compressed-image');
        cardCompressedImg.src = compressedDataUrl;
        updateCompressedSize(compressedDataUrl, card);
    }
    img.src = dataUrl;
}

// 更新压缩后的文件大小
function updateCompressedSize(dataUrl, card) {
    const base64str = dataUrl.split(',')[1];
    const decoded = atob(base64str);
    card.querySelector('.compressed-size').textContent = formatFileSize(decoded.length);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 质量滑块事件
qualityInput.addEventListener('input', function() {
    qualityValue.textContent = this.value + '%';
    if (originalImage.src) {
        compressImage(originalImage.src);
    }
});

// 下载单张压缩后的图片
function downloadImage(button) {
    const card = button.closest('.image-card');
    const fileName = card.querySelector('h3').textContent;
    const compressedImg = card.querySelector('.compressed-image');
    const link = document.createElement('a');
    link.download = `compressed-${fileName}`;
    link.href = compressedImg.src;
    link.click();
}

// 下载所有压缩后的图片
document.getElementById('downloadAllBtn').addEventListener('click', function() {
    const cards = document.querySelectorAll('.image-card');
    cards.forEach(card => {
        const downloadBtn = card.querySelector('.download-button');
        downloadBtn.click();
    });
}); 