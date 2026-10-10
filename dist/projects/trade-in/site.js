const pageHeights = { 1: 12636, 2: 12914, 3: 7406 };

// The coordinates follow the original 1920-point-wide PDF pages.
// Only motion that matches the visible PDF artwork replaces it in place.
const clips = [
  { key: "launch-2024", title: "2024 发布会主视觉应用", page: 1, section: "发布会主视觉", type: "marker", x: 1798, y: 4980 },
  { key: "banner-2024", title: "2024 发布会横幅", page: 1, section: "主视觉动效", type: "overlay", x: 131, y: 10304, w: 1658, h: 415, poster: "static/full/024.webp?v=20261010-hd" },
  { key: "countdown-1", title: "发布会倒计时 1 天", page: 1, section: "倒计时物料", type: "overlay", x: 133, y: 11840, w: 343, h: 745, poster: "static/full/027.webp?v=20261010-hd" },
  { key: "friends-cat", title: "大家电抢先购 · 朋友圈动态", page: 2, section: "线上链路", type: "overlay", x: 1267, y: 4499, w: 503, h: 504, poster: "media/friends-cat-revised.jpg", fit: "contain", replacement: true, background: "#fff" },
  { key: "logo-2025", title: "国家补贴 · 至高 20% OFF 折叠券", page: 2, section: "2025 项目规划", type: "marker", x: 1775, y: 9010, poster: "media/logo-2025-revised.jpg", transparent: true },
  { key: "brand-2025", title: "国补品牌视觉", page: 2, section: "视觉升级", type: "marker", indexOnly: true, x: 1760, y: 10370 },
  { key: "system-2025", title: "国补视觉系统", page: 2, section: "视觉升级", type: "marker", x: 1760, y: 11520 },
  { key: "coupon-2025", media: "coupon-demo-2025", title: "国家补贴券动画演示", page: 2, section: "002 动画演示", type: "overlay", x: 100, y: 12525, w: 1640, h: 340, poster: "media/coupon-demo-2025.jpg", fit: "cover", demo: true },
  { key: "claim-success", title: "领券成功反馈", page: 2, section: "领券动效", type: "marker", indexOnly: true },
  { key: "flying-coupon", title: "优惠券飞入", page: 2, section: "领券动效", type: "marker", indexOnly: true },
  { key: "confetti", title: "领券庆祝动效", page: 2, section: "领券动效", type: "marker", indexOnly: true },
  { key: "main-venue", media: "main-venue-header", title: "国家补贴主会场版头", page: 3, section: "会场分层表达", type: "overlay", x: 138, y: 862, w: 487, h: 333, poster: "media/main-venue-header.webp" },
  { key: "category-banner", title: "品类权益版头轮播", page: 3, section: "内容分级", type: "overlay", x: 1035, y: 860, w: 481, h: 335, poster: "static/full/055.webp?v=20261010-hd" },
  { key: "xiaomi-brand-banner", title: "品牌权益版头轮播", page: 3, section: "内容分级", type: "overlay", x: 138, y: 1262, w: 501, h: 323, poster: "static/full/060.webp" },
  { key: "brand-venues", title: "品牌会场轮播", page: 3, section: "品牌会场", type: "overlay", x: 135, y: 1863, w: 296, h: 643, poster: "static/full/065.webp" },
  { key: "category-venue", title: "品类会场轮播", page: 3, section: "品类会场", type: "overlay", x: 1377, y: 1936, w: 204, h: 443, poster: "static/full/066.webp?v=20261010-hd" },
  { key: "june18-venue-header", title: "618 国补抢先购领券版头", page: 3, section: "多权益表达", type: "overlay", x: 172.213, y: 3059.857, w: 283.352, h: 202.125, poster: "static/full/070.webp?v=20261010-hd", foreground: { src: "media/june18-phone-frame.webp", x: 155, y: 3045, w: 315, h: 225 } },
  { key: "double11", title: "双 11 补上加补", page: 3, section: "多权益表达", type: "marker", indexOnly: true, x: 1780, y: 3550 },
  { key: "super-day", title: "超级国补日数字翻转", page: 3, section: "会场延展", type: "marker", indexOnly: true, x: 1365, y: 4750 },
  { key: "double11-numbers", title: "双 11 优惠数字翻转", page: 3, section: "会场延展", type: "overlay", x: 1600, y: 4825, w: 198, h: 135, poster: "static/full/086.webp" },
  { key: "june18-horizontal", title: "618 横向券版头", page: 3, section: "其他尝试", type: "overlay", x: 1601, y: 4968, w: 196, h: 107, poster: "static/full/089.webp" },
  { key: "june18-flip", title: "618 折叠版头", page: 3, section: "其他尝试", type: "overlay", x: 1395, y: 5083, w: 196, h: 107, poster: "static/full/090.webp" },
  { key: "june18", title: "618 多重优惠券版头", page: 3, section: "其他尝试", type: "overlay", x: 1601, y: 5083, w: 196, h: 107, poster: "static/full/091.webp" },
  { key: "metro-banner", title: "地铁长屏 · 吉祥物入场", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 5712, w: 850, h: 96, poster: "static/full/092.webp", start: 0, end: 2 },
  { key: "metro-scene", title: "地铁广告现场", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 1047, y: 5712, w: 382, h: 215 },
  { key: "metro-color", media: "metro-banner", title: "地铁长屏 · 多彩字效", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 5822, w: 850, h: 96, poster: "static/full/095.webp", start: 2, end: 4 },
  { key: "metro-flip", media: "metro-banner", title: "地铁长屏 · 翻转字效", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 5932, w: 850, h: 96, poster: "static/full/098.webp", start: 4, end: 6 },
  { key: "metro-coupons", media: "metro-banner", title: "地铁长屏 · 多重优惠券", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 6042, w: 850, h: 96, poster: "static/full/099.webp", start: 6, end: 9 },
  { key: "metro-benefits", media: "metro-banner", title: "地铁长屏 · 优惠券展开", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 6152, w: 850, h: 96, poster: "static/full/102.webp", start: 9, end: 12 },
  { key: "metro-call-to-action", media: "metro-banner", title: "地铁长屏 · 国补收尾", page: 3, section: "上海徐家汇地铁站", type: "overlay", x: 137, y: 6261, w: 850, h: 96, poster: "static/full/103.webp", start: 12, end: 15.3 },
  { key: "elderly-vertical", title: "惠老补贴竖版广告", page: 3, section: "惠老补贴项目", type: "overlay", x: 957, y: 6575, w: 236, h: 559, poster: "static/full/104.webp?v=20261010-hd" },
  { key: "elderly-venue", title: "惠老补贴会场", page: 3, section: "惠老补贴项目", type: "overlay", x: 152, y: 6577, w: 274, h: 557, poster: "media/elderly-venue-crop.jpg", fit: "fill" },
  { key: "elderly-popup", title: "惠老补贴弹窗", page: 3, section: "惠老补贴项目", type: "overlay", x: 426, y: 6577, w: 254, h: 557, poster: "media/elderly-popup-crop.jpg", fit: "fill" },
  { key: "national-showcase", title: "2025 国家补贴 · 营销设计动态展示", page: 3, section: "国家补贴设计展示", type: "overlay", x: 1388, y: 6585, w: 249.084, h: 540, poster: "media/national-showcase.jpg", fit: "contain", replacement: true },
  { key: "offline-countdown", title: "国补倒计时 · 竖版海报", section: "线下传播", type: "offline", label: "01 / 竖版海报", description: "国补倒计时 · 叠加优惠 50% OFF", portrait: true },
  { key: "offline-elevator", title: "双 11 大促梯媒", section: "线下传播", type: "offline", label: "02 / 横版梯媒", description: "国补叠加优惠 · 50% OFF" },
  { key: "offline-double11", title: "双 11 抓紧更新了", section: "线下传播", type: "offline", label: "03 / 横版海报", description: "国补叠优惠 · 低至 5 折" },
  { key: "mini-claim-success", title: "领取成功反馈", section: "小程序领券", type: "appendix", label: "主流程", description: "领取国家补贴 · 本单补贴 ¥1345 起" },
  { key: "mini-flying-coupon", title: "飞券入账", section: "小程序领券", type: "appendix", label: "动效方案 01", description: "家装家居补贴 20% · 飞券反馈" },
  { key: "mini-red-envelope", title: "红包弹出", section: "小程序领券", type: "appendix", label: "动效方案 02", description: "本单补贴 ¥1345 起 · 红包反馈" },
  { key: "popup-claim-reminder", title: "开抢提醒弹窗", section: "领券弹窗", type: "appendix", label: "01 / 开抢提醒", description: "湖南国补 · 今日 12:00 开抢" },
  { key: "popup-qualification", title: "资格中签弹窗", section: "领券弹窗", type: "appendix", label: "02 / 资格反馈", description: "冰箱国补 20% · 中签礼花" },
  { key: "popup-quota-success", title: "领取成功弹窗", section: "领券弹窗", type: "appendix", label: "03 / 领取成功", description: "补贴额度 ¥20000 · 商品引导" }
];

const clipSource = clip => `media/${clip.media || clip.key}.mp4`;
const clipPoster = clip => { const src = clip.poster || `media/${clip.key}.jpg`; return src.includes("?") ? src : `${src}?v=20261010-hd`; };

const pages = Object.fromEntries(
  [...document.querySelectorAll(".pdf-page")].map(page => [Number(page.dataset.page), page])
);
const indexDialog = document.querySelector("#index-dialog");
const videoDialog = document.querySelector("#video-dialog");
const modalVideo = document.querySelector("#modal-video");
const indexList = document.querySelector("#clip-index");
const videoTitle = document.querySelector("#video-title");
const videoLocation = document.querySelector("#video-location");
const videoCount = document.querySelector("#video-count");
const motionButton = document.querySelector("#toggle-motion");
const zoomButton = document.querySelector("#toggle-zoom");
const documentView = document.querySelector("#document");
const offlineCards = document.querySelector("#offline-cards");
const miniCards = document.querySelector("#mini-cards");
const popupCards = document.querySelector("#popup-cards");
const inlineVideos = [];
let activeClip = 0;
let motionEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelector("#open-index span").textContent = String(clips.length);

function place(node, clip) {
  node.style.left = `${clip.x / 1920 * 100}%`;
  node.style.top = `${clip.y / pageHeights[clip.page] * 100}%`;
  if (clip.type === "overlay") {
    node.style.width = `${clip.w / 1920 * 100}%`;
    node.style.height = `${clip.h / pageHeights[clip.page] * 100}%`;
  }
  pages[clip.page].append(node);
}


// Remove only the near-black backdrop; retain the gray ticket and its lettering.
function makeCouponCanvas(video, canvas, crop, enabled) {
  canvas.width = 900;
  canvas.height = 608;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const still = new Image();
  let lastTime = -1;
  function paint(source) {
    const width = source.videoWidth || source.naturalWidth;
    const height = source.videoHeight || source.naturalHeight;
    if (!width || !height) return;
    const [cx, cy, cw, ch] = crop;
    const sw = width * cw, sh = height * ch;
    const scale = Math.min(canvas.width / sw, canvas.height / sh);
    const dw = sw * scale, dh = sh * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, width * cx, height * cy, sw, sh,
      (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const light = Math.max(data[i], data[i + 1], data[i + 2]);
      if (light < 28) data[i + 3] *= Math.max(0, (light - 12) / 16);
    }
    context.putImageData(pixels, 0, 0);
  }
  function refresh() {
    if (video.readyState >= 2) paint(video);
    else if (still.complete) paint(still);
  }
  still.onload = () => { if (video.readyState < 2) paint(still); };
  still.src = video.poster;
  for (const event of ["loadeddata", "seeked", "pause"]) video.addEventListener(event, refresh);
  function tick() {
    if (enabled() && !video.paused && video.readyState >= 2 && Math.abs(video.currentTime - lastTime) >= 1 / 30) {
      paint(video); lastTime = video.currentTime;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  return { refresh, poster(src) { still.src = src; lastTime = -1; } };
}
const couponModalFrame = document.createElement("div");
couponModalFrame.className = "coupon-modal-frame";
modalVideo.before(couponModalFrame);
couponModalFrame.append(modalVideo);
const couponModalCanvas = document.createElement("canvas");
couponModalCanvas.className = "coupon-modal-canvas";
couponModalCanvas.setAttribute("aria-hidden", "true");
couponModalFrame.append(couponModalCanvas);
const modalCoupon = makeCouponCanvas(modalVideo, couponModalCanvas,
  [100 / 640, 50 / 360, 438 / 640, 274 / 360],
  () => videoDialog.open && clips[activeClip]?.transparent);

function openClip(index) {
  activeClip = (index + clips.length) % clips.length;
  const clip = clips[activeClip];
  if (indexDialog.open) indexDialog.close();
  modalVideo.pause();
  modalVideo.src = clipSource(clip);
  modalVideo.poster = clipPoster(clip);
  couponModalFrame.classList.toggle("is-keyed", !!clip.transparent);
  if (clip.transparent) modalCoupon.poster(modalVideo.poster);
  modalVideo.onloadedmetadata = () => { if (clip.start != null) modalVideo.currentTime = clip.start; };
  modalVideo.ontimeupdate = () => {
    if (clip.end != null && modalVideo.currentTime >= clip.end) modalVideo.currentTime = clip.start || 0;
  };
  videoTitle.textContent = clip.title;
  videoLocation.textContent = clip.type === "appendix" || clip.type === "offline" ? `补充章节 · ${clip.section}` : `PDF 第 ${clip.page} 页 · ${clip.section}`;
  videoCount.textContent = `${activeClip + 1} / ${clips.length}`;
  if (!videoDialog.open) videoDialog.showModal();
  inlineVideos.forEach(({ video }) => video.pause());
  modalVideo.play().catch(() => {});
}

clips.forEach((clip, index) => {
  const indexButton = document.createElement("button");
  indexButton.type = "button";
  indexButton.className = "clip-item";
  const location = clip.type === "appendix" || clip.type === "offline" ? `补充章节 · ${clip.section}` : `PDF ${String(clip.page).padStart(2, "0")} · ${clip.section}`;
  indexButton.innerHTML = `<img src="${clipPoster(clip)}" alt="" loading="lazy"><span><small>${location}</small><strong>${clip.title}</strong></span>`;
  indexButton.addEventListener("click", () => openClip(index));
  indexList.append(indexButton);

  if (clip.type === "appendix" || clip.type === "offline") {
    const card = document.createElement("article");
    card.className = clip.type === "offline" ? `offline-card${clip.portrait ? " is-portrait" : ""}` : "mini-card";
    const heading = document.createElement("div");
    heading.className = "mini-card-heading";
    heading.innerHTML = `<small>${clip.label}</small><h3>${clip.title}</h3><p>${clip.description}</p>`;
    const region = document.createElement("div");
    region.className = clip.type === "offline" ? "offline-video-frame" : "mini-video-frame";
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.poster = clipPoster(clip);
    video.dataset.src = clipSource(clip);
    video.setAttribute("aria-hidden", "true");
    const expand = document.createElement("button");
    expand.type = "button";
    expand.className = "mini-expand";
    expand.textContent = "放大播放 ↗";
    expand.setAttribute("aria-label", `放大播放${clip.title}`);
    expand.addEventListener("click", () => openClip(index));
    region.append(video, expand);
    card.append(heading, region);
    (clip.type === "offline" ? offlineCards : clip.section === "领券弹窗" ? popupCards : miniCards).append(card);
    inlineVideos.push({ video, region });
    return;
  }

  if (clip.indexOnly) return;

  if (clip.type === "overlay") {
    const region = document.createElement("div");
    region.className = "motion-region";
    region.dataset.clip = clip.key;
    if (clip.replacement) region.classList.add("is-replacement");
    if (clip.background) region.style.background = clip.background;
    if (clip.demo) region.classList.add("is-demo");
    const video = document.createElement("video");
    video.muted = true;
    video.loop = clip.end == null;
    video.playsInline = true;
    video.preload = "none";
    video.poster = clipPoster(clip);
    video.dataset.src = clipSource(clip);
    video.style.objectFit = clip.fit || "cover";
    if (clip.w < 400) region.classList.add("is-small");
    video.addEventListener("loadedmetadata", () => { if (clip.start != null) video.currentTime = clip.start; });
    video.addEventListener("timeupdate", () => {
      if (clip.end != null && video.currentTime >= clip.end) video.currentTime = clip.start || 0;
    });
    video.setAttribute("aria-hidden", "true");
    video.addEventListener("playing", () => region.classList.add("is-ready"));
    video.addEventListener("error", () => region.classList.remove("is-ready"));
    const expand = document.createElement("button");
    expand.type = "button";
    expand.className = "expand-video";
    expand.textContent = "⛶";
    expand.setAttribute("aria-label", `放大播放${clip.title}`);
    expand.addEventListener("click", () => openClip(index));
    region.append(video, expand);
    if (clip.transparent) {
      region.classList.add("is-transparent");
      const canvas = document.createElement("canvas");
      canvas.className = "coupon-canvas";
      canvas.setAttribute("aria-hidden", "true");
      region.append(canvas);
      makeCouponCanvas(video, canvas, clip.crop, () => region.dataset.visible === "true" && !document.hidden);
    }
    place(region, clip);
    if (clip.foreground) {
      const frame = document.createElement("img");
      frame.className = "foreground-art";
      frame.src = clip.foreground.src;
      frame.alt = "";
      frame.setAttribute("aria-hidden", "true");
      place(frame, { page: clip.page, type: "overlay", ...clip.foreground });
    }
    inlineVideos.push({ video, region });
  } else {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "motion-marker";
    marker.textContent = "▶";
    marker.title = `播放${clip.title}`;
    marker.setAttribute("aria-label", `播放${clip.title}`);
    marker.addEventListener("click", () => openClip(index));
    place(marker, clip);
  }
});

function syncMotion() {
  for (const { video, region } of inlineVideos) {
    if (motionEnabled && region.dataset.visible === "true" && !document.hidden && !videoDialog.open && !indexDialog.open) {
      if (!video.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
  motionButton.textContent = motionEnabled ? "暂停动效" : "播放动效";
  motionButton.setAttribute("aria-pressed", String(motionEnabled));
}

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target.dataset.visible = String(entry.isIntersecting);
  syncMotion();
}, { rootMargin: "150px 0px", threshold: 0.01 });
inlineVideos.forEach(({ region }) => observer.observe(region));

document.querySelector("#open-index").addEventListener("click", () => { indexDialog.showModal(); syncMotion(); });
document.querySelector("#close-index").addEventListener("click", () => indexDialog.close());
document.querySelector("#close-video").addEventListener("click", () => videoDialog.close());
document.querySelector("#previous-video").addEventListener("click", () => openClip(activeClip - 1));
document.querySelector("#next-video").addEventListener("click", () => openClip(activeClip + 1));
for (const dialog of [indexDialog, videoDialog]) {
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
}
videoDialog.addEventListener("close", () => {
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  syncMotion();
});
indexDialog.addEventListener("close", syncMotion);
motionButton.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  syncMotion();
});
zoomButton.addEventListener("click", () => {
  const zoomed = documentView.classList.toggle("zoomed");
  zoomButton.textContent = zoomed ? "适应屏幕" : "放大阅读";
  zoomButton.setAttribute("aria-pressed", String(zoomed));
});
document.addEventListener("visibilitychange", syncMotion);
document.querySelector("#open-index span").textContent = clips.length;
syncMotion();
