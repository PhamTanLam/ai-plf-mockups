# Deploy — Cloudflare Pages

App là SPA tĩnh, dùng **HashRouter** → không cần cấu hình rewrite, chạy trên mọi host tĩnh.

| | Giá trị |
|---|---|
| **Build command** | `npm run build:web` |
| **Output directory** | `dist-web` |
| **Node version** | ≥ 20 |
| **Base path** | `/` (mặc định). Nếu host dưới sub-path: đặt env `BASE_PATH=/duong-dan/` |

> `npm run build` (mặc định) vẫn tạo bản **1 file** `dist/index.html` để gửi/double-click — không dùng cho web deploy.

## CI/CD — GitHub Actions (đang dùng)

Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- **push `main`** → deploy **production** (`https://ai-plf.pages.dev`).
- **pull request / nhánh khác** → deploy **preview** (URL riêng theo nhánh, comment vào PR).
- chạy tay: tab **Actions** → *Deploy to Cloudflare Pages* → **Run workflow**.

### Thiết lập 1 lần

**1. Tạo Pages project** (chỉ làm 1 lần, vì workflow dùng direct-upload):
```bash
npx wrangler login
npx wrangler pages project create ai-plf --production-branch=main
```
(hoặc Dashboard → Workers & Pages → Create → Pages → *Direct Upload*, đặt tên `ai-plf`).

**2. Lấy credentials Cloudflare:**
- **Account ID**: Dashboard → Workers & Pages → cột phải (*Account ID*).
- **API Token**: My Profile → API Tokens → *Create Token* → template **"Edit Cloudflare Workers"** (hoặc custom có quyền *Account › Cloudflare Pages › Edit*).

**3. Thêm secrets vào GitHub** (repo → Settings → Secrets and variables → Actions → *New repository secret*):
| Tên | Giá trị |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token ở bước 2 |
| `CLOUDFLARE_ACCOUNT_ID` | account id ở bước 2 |

Xong → mỗi lần merge vào `main`, GitHub Actions tự build & deploy.

> Đổi tên project? Sửa `--project-name=ai-plf` trong cả `deploy.yml` và script `deploy:cf`.
> Default branch không phải `main`? Sửa `branches: [main]` trong `deploy.yml`.

## Deploy thủ công (không qua CI)
```bash
npx wrangler login
npm run deploy:cf         # = build:web + wrangler pages deploy dist-web --project-name=ai-plf
```

## Ghi chú
- `public/_redirects` (`/* /index.html 200`) đã có sẵn — SPA fallback, an toàn nếu sau này đổi sang BrowserRouter (URL sạch không có `#`).
- Dữ liệu demo lưu ở `localStorage` trình duyệt (không có backend) — đúng ràng buộc mockup.
