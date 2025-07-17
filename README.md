<<<<<<< HEAD
# SyncTube Remote

เว็บแอปพลิเคชันสำหรับเล่นเพลง YouTube แบบเรียลไทม์ร่วมกัน

## การตั้งค่า

### 1. YouTube Data API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน YouTube Data API v3
4. สร้าง API Key ใน Credentials
5. จำกัดการใช้งาน API Key ให้กับ YouTube Data API เท่านั้น

### 2. Environment Variables

สร้างไฟล์ `.env.local` และเพิ่ม:

\`\`\`env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
\`\`\`

### 3. การติดตั้ง

\`\`\`bash
npm install
npm run dev
\`\`\`

## ฟีเจอร์

- ✅ ค้นหาเพลง YouTube ด้วย API จริง
- ✅ รองรับการใส่ลิงก์ YouTube โดยตรง
- ✅ แสดงระยะเวลาเพลง
- ✅ แสดงรูปภาพตัวอย่าง
- ✅ การจัดการข้อผิดพลาด
- ✅ Loading states
- ✅ Responsive design

## YouTube API Quota

YouTube Data API มี quota จำกัด:
- 10,000 units ต่อวัน (ฟรี)
- การค้นหา = 100 units
- การดูรายละเอียดวิดีโอ = 1 unit

## การใช้งาน

1. **Host**: สร้างห้องและแชร์ Room ID
2. **Participants**: เข้าร่วมห้องและค้นหาเพลง
3. **Search**: ใช้คำค้นหาหรือใส่ลิงก์ YouTube
4. **Queue**: เพิ่มเพลงเข้าคิวแบบเรียลไทม์
=======
# synctube-remote
>>>>>>> 13442afb18d7ae99558d0710ca64c9cc9e425475
