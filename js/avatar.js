// ── avatar.js ── Avatar via Bild-Upload

export const BG_COLORS = [
  '#6c63ff','#ff6584','#43e97b','#f7b731','#4ecdc4',
  '#ff9a3c','#a29bfe','#fd79a8','#00cec9','#e17055'
];

export const FACES = ['😊','😎','🤩','😜','🥳','😇','🤓','😈','🦊','🐼'];
export const ACCS  = ['none','🎩','👑','🎓','🌟','🔥','💎','🎯','🎮','🎵'];

export function drawAvatar(canvas, { bgColor, face, acc }) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(w/2, h/2, w/2, 0, Math.PI*2);
  ctx.fill();
  ctx.font = `${w * 0.42}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(face, w/2, h/2 + h*0.03);
  if (acc && acc !== 'none') {
    ctx.font = `${w * 0.28}px serif`;
    ctx.fillText(acc, w * 0.72, h * 0.22);
  }
}

export function canvasToDataURL(canvas) {
  return canvas.toDataURL('image/png');
}

export function drawAvatarFromDataURL(canvas, dataURL) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      resolve();
    };
    img.src = dataURL;
  });
}
// ── avatar.js ── shared avatar rendering logic

export const BG_COLORS = [
  '#6c63ff','#ff6584','#43e97b','#f7b731','#4ecdc4',
  '#ff9a3c','#a29bfe','#fd79a8','#00cec9','#e17055'
];

export const FACES = ['😊','😎','🤩','😜','🥳','😇','🤓','😈','🦊','🐼'];
export const ACCS  = ['none','🎩','👑','🎓','🌟','🔥','💎','🎯','🎮','🎵'];

export function drawAvatar(canvas, { bgColor, face, acc }) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background circle
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(w/2, h/2, w/2, 0, Math.PI*2);
  ctx.fill();

  // Face emoji
  ctx.font = `${w * 0.42}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(face, w/2, h/2 + h*0.03);

  // Accessory emoji
  if (acc && acc !== 'none') {
    ctx.font = `${w * 0.28}px serif`;
    ctx.fillText(acc, w * 0.72, h * 0.22);
  }
}

export function canvasToDataURL(canvas) {
  return canvas.toDataURL('image/png');
}

export function drawAvatarFromDataURL(canvas, dataURL) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      resolve();
    };
    img.src = dataURL;
  });
}
