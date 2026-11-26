const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, size, size);

  // 角丸
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.125);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // スケール調整
  const scale = size / 512;

  // 渋谷のビル群
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(80 * scale, 200 * scale, 60 * scale, 240 * scale);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(160 * scale, 160 * scale, 50 * scale, 280 * scale);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(230 * scale, 180 * scale, 55 * scale, 260 * scale);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(300 * scale, 140 * scale, 45 * scale, 300 * scale);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(360 * scale, 170 * scale, 52 * scale, 270 * scale);

  // 接続線
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(105 * scale, 220 * scale);
  ctx.lineTo(185 * scale, 180 * scale);
  ctx.lineTo(257 * scale, 200 * scale);
  ctx.lineTo(322 * scale, 160 * scale);
  ctx.lineTo(385 * scale, 190 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(105 * scale, 260 * scale);
  ctx.lineTo(185 * scale, 220 * scale);
  ctx.lineTo(257 * scale, 240 * scale);
  ctx.lineTo(322 * scale, 200 * scale);
  ctx.lineTo(385 * scale, 230 * scale);
  ctx.stroke();

  // グラフ要素（円）
  ctx.fillStyle = '#fbbf24';
  const points = [
    [105, 220], [185, 180], [257, 200], [322, 160], [385, 190]
  ];
  
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, 8 * scale, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 渋谷の文字表現
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(200 * scale, 80 * scale, 112 * scale, 8 * scale);
  ctx.fillRect(220 * scale, 100 * scale, 72 * scale, 6 * scale);
  ctx.fillRect(240 * scale, 115 * scale, 32 * scale, 4 * scale);

  // ダッシュボードアイコン
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(420 * scale, 80 * scale, 24 * scale, 16 * scale);
  ctx.fillRect(420 * scale, 104 * scale, 32 * scale, 12 * scale);
  ctx.fillRect(420 * scale, 124 * scale, 20 * scale, 10 * scale);

  // ファイルに保存
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// 各サイズのアイコンを生成
generateIcon(192, 'icon-192.png');
generateIcon(512, 'icon-512.png');
generateIcon(180, 'apple-touch-icon.png');

console.log('All icons generated successfully!'); 