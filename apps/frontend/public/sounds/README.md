# Ambient Sounds for Focus Room

## 📋 Audio Files Cần Download

System cần **16 file audio** để hoạt động đầy đủ:

### 🌿 Nature Sounds (7 files)
1. `rain.mp3` - Tiếng mưa (2-3 phút, loop)
2. `thunder.mp3` - Sấm chớp (2-3 phút, loop)
3. `fire.mp3` - Lửa bập bùng (2-3 phút, loop)
4. `ocean.mp3` - Sóng biển (2-3 phút, loop)
5. `birds.mp3` - Chim hót (2-3 phút, loop)
6. `forest.mp3` - Rừng cây (2-3 phút, loop)
7. `water.mp3` - Nước chảy (2-3 phút, loop)

### 📻 Noise Colors (3 files)
8. `white-noise.mp3` - White noise (5 phút, loop)
9. `pink-noise.mp3` - Pink noise (5 phút, loop)
10. `brown-noise.mp3` - Brown noise (5 phút, loop)

### 🏙️ Ambient Sounds (3 files)
11. `cafe.mp3` - Quán cà phê (2-3 phút, loop)
12. `library.mp3` - Thư viện (2-3 phút, loop)
13. `night.mp3` - Đêm yên tĩnh (2-3 phút, loop)

### ✍️ Study Sounds (2 files)
14. `keyboard.mp3` - Gõ phím (1-2 phút, loop)
15. `writing.mp3` - Viết giấy (1-2 phút, loop)

### 🔔 Notification (1 file)
16. `timer-end.mp3` - Âm thanh thông báo (3-5 giây, NO loop)

---

## 🎵 Nguồn Download Miễn Phí

### 1. **Freesound.org** (Recommended)
- License: Creative Commons CC0 (Public Domain)
- Link: https://freesound.org/
- Keyword search:
  - "rain ambience", "thunder", "crackling fire"
  - "ocean waves", "forest birds", "flowing water"
  - "white noise", "pink noise", "brown noise"
  - "cafe ambience", "library quiet", "night crickets"
  - "keyboard typing", "pen writing"
  - "bell chime" (for timer-end)

### 2. **Pixabay Audio**
- License: Free for commercial use
- Link: https://pixabay.com/sound-effects/
- Categories: Nature, Ambience, Study

### 3. **YouTube Audio Library**
- License: Free music & sound effects
- Link: https://www.youtube.com/audiolibrary
- Download format: MP3

### 4. **Zapsplat**
- License: Free sound effects (attribution required)
- Link: https://www.zapsplat.com/

---

## 📁 File Structure

Đặt các file vào thư mục:
```
apps/frontend/public/sounds/
├── ambient/
│   ├── rain.mp3
│   ├── thunder.mp3
│   ├── fire.mp3
│   ├── ocean.mp3
│   ├── birds.mp3
│   ├── forest.mp3
│   ├── water.mp3
│   ├── white-noise.mp3
│   ├── pink-noise.mp3
│   ├── brown-noise.mp3
│   ├── cafe.mp3
│   ├── library.mp3
│   ├── night.mp3
│   ├── keyboard.mp3
│   └── writing.mp3
├── timer-end.mp3
└── sounds.json (✅ Đã có)
```

---

## ⚙️ Yêu Cầu Kỹ Thuật

### Audio Format
- **Format**: MP3
- **Bitrate**: 128kbps (recommended)
- **Sample Rate**: 44.1kHz hoặc 48kHz
- **Channels**: Stereo
- **Length**: 
  - Ambient sounds: 2-5 phút (seamless loop)
  - Timer notification: 3-5 giây

### File Size
- Mỗi file ambient: ~2-5 MB
- Timer notification: ~100-200 KB
- **Total**: ~50-80 MB cho tất cả

### Loop Quality
- File phải loop seamlessly (không có gap hoặc click)
- Test: Play sound 3 lần liên tiếp, nghe có bị gián đoạn không

---

## 🔧 Convert & Optimize (Optional)

Nếu cần convert/optimize audio files:

### Using FFmpeg (Command Line)
```bash
# Convert to MP3 128kbps
ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3

# Normalize volume
ffmpeg -i input.mp3 -af "volume=1.5" output.mp3

# Trim silence at start/end
ffmpeg -i input.mp3 -af "silenceremove=start_periods=1:stop_periods=-1:detection=peak" output.mp3

# Create seamless loop (fade out last 2s, fade in first 2s)
ffmpeg -i input.mp3 -af "afade=t=out:st=178:d=2,afade=t=in:st=0:d=2" output.mp3
```

### Using Audacity (GUI)
1. Open audio file
2. Effect → Normalize (set to -3dB)
3. Effect → Fade Out (last 2 seconds)
4. Effect → Fade In (first 2 seconds)
5. File → Export → Export as MP3 (128kbps)

---

## ✅ Verification Checklist

Sau khi download:
- [ ] 15 ambient sound files trong `ambient/`
- [ ] 1 timer-end.mp3 trong root
- [ ] Tất cả files là MP3 format
- [ ] File size hợp lý (2-5MB mỗi file)
- [ ] Test play trong browser (HTML5 Audio API support)
- [ ] Loop seamlessly (không có gap)

---

## 🚀 Deployment Notes

**Development:**
- Files được serve từ `/public/sounds/`
- Next.js tự động serve static files

**Production:**
- Consider uploading to CDN (Cloudinary, AWS S3)
- Update `audioUrl` trong `sounds.json` thành CDN URLs
- Enable compression (gzip)
- Set appropriate cache headers

**CDN Benefits:**
- Faster loading (distributed servers)
- Reduce server bandwidth
- Better scalability

---

## 🎯 Quick Start

1. **Download 16 files** từ Freesound.org hoặc Pixabay
2. **Rename** theo tên trong list trên
3. **Place** vào `apps/frontend/public/sounds/ambient/`
4. **Test** bằng cách mở `http://localhost:3000/sounds/ambient/rain.mp3`
5. **Verify** sounds.json config match với actual files

---

## 📝 License & Attribution

- Nếu dùng CC-BY sounds, cần attribution trong app
- CC0 (Public Domain) không cần attribution
- Check license của từng file trước khi deploy production

---

**Created:** 2025-02-01  
**For:** NyNus Exam Bank System - Focus Room Phase 2  
**Maintainer:** Development Team

