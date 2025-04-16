const description = `
<details>
<summary><strong>📘 Hướng dẫn sử dụng hệ thống tạo ảnh bằng template</strong></summary>

<br/>

# 📸 API Tạo Ảnh Từ Template / Hình Ảnh

## 🎯 Chức Năng Chính

- Tạo ảnh từ **template** có sẵn  
- Tạo ảnh từ **ảnh đầu vào** (img2img)

---

## 🚀 Cách Tạo Ảnh

1. **Lấy API Key** từ admin
2. Gửi yêu cầu kèm API key trong header để xác thực
3. Gọi các endpoint phù hợp để tạo ảnh

---

## 🧩 Cách Thêm Template Mới

1. **Thử nghiệm template** trên nền tảng Shakker để kiểm tra độ ổn định và chất lượng  
2. **Kiểm tra model** đã tồn tại hay chưa:
   - Có thể dùng endpoint \`/model\` hoặc kiểm tra qua **statistics**
3. **Cập nhật template**:
   - Gửi request đến \`POST /inputTemplate\`
   - Nếu dùng chức năng *img2img*, cần cập nhật ảnh vào trường \`image\`
4. **Chú ý định dạng JSON**:
   - Đúng cú pháp, không có dấu phẩy sau phần tử cuối cùng

📌 **Ví dụ template hợp lệ**:
\`\`\`json
{
  "model": "NhatBinh5",
  "classification": {
    "clothing_type": "shirt",
    "background": "beach"
  }
}
\`\`\`

---

## 🛠️ Cách Sử Dụng API

### 🔐 Xác Thực
Header:  
\`x-client-auth-token: <API_KEY>\`

### 📡 Các Endpoint Chính

| Endpoint             | Mô tả                         |
|----------------------|-------------------------------|
| \`POST /generate\`       | Tạo ảnh                       |
| \`GET /model\`           | Thông tin model hiện có       |
| \`POST /inputTemplate\` | Thêm hoặc cập nhật template |

---
<details>
<summary><strong>📥 Chi Tiết: Tạo Template Qua \`POST /inputTemplate\`</strong></summary>

### 📝 Mục đích
Dùng để **tạo hoặc cập nhật một template sinh ảnh** sử dụng model và các thông số cụ thể, bao gồm prompt, classification và các tuỳ chỉnh kỹ thuật.

---

### 🧠 Schema: InputTemplate

| Trường                | Bắt buộc | Kiểu dữ liệu | Mô tả |
|------------------------|----------|---------------|--------|
| \`modelName\`           | ✅       | string        | Tên của model đã có sẵn trong hệ thống |
| \`go_fast\`             | ❌       | boolean       | Bật chế độ sinh ảnh nhanh (ít bước hơn) |
| \`image\`               | ❌       | string (URL)  | Ảnh gốc (nếu dùng kiểu img2img) |
| \`classification\`      | ✅       | object        | Thông tin phân loại: trang phục, bối cảnh, giới tính, phong cách |
| \`prompt\`              | ✅       | string        | Nội dung mô tả ảnh cần sinh |
| \`aspect_ratio\`        | ✅       | string        | Tỉ lệ ảnh đầu ra, mặc định \`1:1\` |
| \`output_quality\`      | ✅       | number        | Chất lượng ảnh (0–100) |
| \`output_format\`       | ✅       | string        | Định dạng ảnh đầu ra: \`jpg\`, \`webp\`, ... |
| \`prompt_strength\`     | ✅       | number        | Mức ảnh hưởng của prompt (0–1) |
| \`lora_scale\`          | ✅       | number        | Mức ảnh hưởng của LoRA |
| \`num_inference_steps\` | ✅       | number        | Số bước suy diễn (ảnh hưởng độ chi tiết) |
| \`guidance_scale\`      | ✅       | number        | Độ bám prompt (3–7 là phổ biến) |

---

### 💡 classification (bắt buộc):

| Trường           | Kiểu dữ liệu | Ghi chú |
|------------------|---------------|---------|
| \`clothing_type\` | string[]      | Ví dụ: \`["giaolinhnam"]\` |
| \`background\`     | string[]      | Ví dụ: \`["hanoi", "hue"]\` |
| \`gender\`         | string[]      | \`["male"]\`, \`["female"]\` |
| \`style\`          | string[]      | Tùy ý: \`["cổ trang"]\`, \`[]\` |

---

### 💡 Ví dụ JSON body:

\`\`\`json
{
  "modelName": "victorle317/giaolinhnam",
  "go_fast": false,
  "image": "https://i.pinimg.com/564x/4d/8d/8d/example.jpg",
  "classification": {
    "clothing_type": ["giaolinhnam"],
    "background": ["hanoi", "hue"],
    "gender": ["male"],
    "style": []
  },
  "prompt": "a white American man wearing traditional giaolinhnam in front of Hue citadel",
  "aspect_ratio": "1:1",
  "output_quality": 100,
  "output_format": "jpg",
  "prompt_strength": 0.8,
  "lora_scale": 1.1,
  "num_inference_steps": 28,
  "guidance_scale": 3
}
\`\`\`

---

### ✅ Response mẫu:

\`\`\`json
{
  "message": "Successfully created 1 templates",
  "templates": [
    {
      "template_id": "67fe06238a0397139a469c42",
      "modelName": "victorle317/giaolinhnam",
      "classification": {
        "clothing_type": ["giaolinhnam"],
        "background": ["hanoi", "hue"],
        "gender": ["male"],
        "style": []
      },
      "prompt": "a white American man ...",
      "aspect_ratio": "1:1",
      "output_quality": 100,
      "output_format": "jpg",
      "prompt_strength": 0.8,
      "lora_scale": 1.1,
      "num_inference_steps": 28,
      "guidance_scale": 3
    }
  ]
}
\`\`\`
</details>
---

### 📊 Thống kê mẫu (\`GET /statistics\`)

Gọi API \`/statistics\` để xem thống kê hiện có về:
- \`clothing_type\` đang phổ biến
- \`background\` thường dùng
- \`gender\` và \`style\` phân bố ra sao
- Model nào được sử dụng nhiều nhất

</details>
`;

module.exports = description;