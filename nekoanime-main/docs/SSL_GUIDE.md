# Hướng dẫn Thêm SSL vào VPS của bạn (Nginx + Certbot)

Vì Vercel (HTTPS) không thể giao tiếp trực tiếp với IP VPS của bạn (HTTP), bạn cần thiết lập SSL trên VPS. Cách tiêu chuẩn là sử dụng **Nginx** làm "Reverse Proxy" và **Certbot** để lấy chứng chỉ SSL miễn phí.

## Yêu cầu Tiên quyết

1.  **Một Tên miền (Domain)**: Bạn cần một tên miền (ví dụ: `api.nekoanime.com` hoặc `backend.yourdomain.com`) trỏ về **Public IP** của VPS.
    - _Nếu chưa có, bạn có thể mua tên miền giá rẻ hoặc dùng subdomain của tên miền có sẵn._
    - **Hành động**: Vào trang quản lý tên miền (Namecheap, GoDaddy, Cloudflare...) và thêm một **A Record**:
      - Host: `api` (hoặc `@` nếu dùng tên miền chính)
      - Value: `IP_VPS_CUA_BAN`

## Bước 1: Cài đặt Nginx

SSH vào VPS của bạn và chạy lệnh cài đặt Nginx:

```bash
sudo apt update
sudo apt install nginx -y
```

## Bước 2: Cấu hình Nginx Reverse Proxy

Tạo một file cấu hình cho backend của bạn.

```bash
sudo nano /etc/nginx/sites-available/animapper
```

Dán nội dung sau vào (Thay thế `api.yourdomain.com` bằng tên miền thực tế của bạn):

```nginx
server {
    server_name api.yourdomain.com; # <--- THAY ĐỔI DÒNG NÀY

    location / {
        proxy_pass http://localhost:8080; # Trỏ về ứng dụng Ktor/Gradle đang chạy
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Lưu và thoát (Nhấn `Ctrl+O`, `Enter`, rồi `Ctrl+X`).

Kích hoạt cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/animapper /etc/nginx/sites-enabled/
sudo nginx -t  # Kiểm tra lỗi cú pháp
sudo systemctl restart nginx
```

## Bước 3: Lấy SSL miễn phí với Certbot

Cài đặt Certbot (công cụ của Let's Encrypt).

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Chạy Certbot để tự động lấy và cài đặt chứng chỉ SSL:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

- Chọn tùy chọn `2` (Redirect) nếu được hỏi, để ép buộc chuyển hướng sang HTTPS.

## Bước 4: Cập nhật Vercel

Sau khi Bước 3 thành công, bạn có thể truy cập `https://api.yourdomain.com/api/v1` trên trình duyệt.

Bây giờ, hãy vào **Vercel Project Settings > Environment Variables** và cập nhật:

```env
NEXT_PUBLIC_ANIMAPPER_API=https://api.yourdomain.com/api/v1
```

Redeploy (triển khai lại) dự án trên Vercel. Lỗi `Network Error` sẽ được khắc phục.
