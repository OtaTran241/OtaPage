# Sakura Breeze

Web scene hoa anh đào rơi có tương tác realtime.

Tương tác:
- Di chuột hoặc vuốt: tạo luồng gió làm cánh hoa lệch hướng.
- Click hoặc tap: tạo xoáy cánh hoa tại vị trí chạm.

## Chạy nhanh

```bash
cd /home/system/wwwroot/moving/osm-vn/flow/co
python3 -m http.server 8080
```

Mở trình duyệt tại: `http://localhost:8080`

## Cấu trúc

- `index.html`: canvas và bảng hướng dẫn
- `style.css`: nền pastel và lớp UI
- `script.js`: animation cánh hoa, nền cây anh đào, tương tác gió/xoáy
