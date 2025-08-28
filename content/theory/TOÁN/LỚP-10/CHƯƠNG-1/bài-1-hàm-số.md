---
title: "Khái niệm Hàm số"
subject: "TOÁN"
grade: 10
chapter: 1
lesson: 1
description: "Tìm hiểu khái niệm cơ bản về hàm số, cách biểu diễn và tính chất"
keywords: ["hàm số", "tập xác định", "tập giá trị", "đồ thị hàm số"]
difficulty: "medium"
estimatedTime: "45 phút"
author: "NyNus Education"
lastUpdated: "2025-08-16"
mobileOptimized: true
---

# Khái niệm Hàm số

## 🎯 Mục tiêu học tập

Sau khi học xong bài này, học sinh có thể:
- Hiểu được khái niệm hàm số và các cách cho hàm số
- Xác định được tập xác định và tập giá trị của hàm số
- Biết cách biểu diễn hàm số bằng đồ thị
- Nhận biết được tính chất cơ bản của hàm số

## 📚 Nội dung chính

### 1. Khái niệm Hàm số

**Định nghĩa**: Cho hai tập hợp khác rỗng $D$ và $R$. Hàm số $f$ từ $D$ vào $R$ là một quy tắc đặt tương ứng mỗi phần tử $x \in D$ với một và chỉ một phần tử $y \in R$.

Ký hiệu: $f: D \to R$ hoặc $y = f(x)$

Trong đó:
- $x$ được gọi là **biến số** (hay **đối số**)
- $y$ được gọi là **giá trị** của hàm số tại $x$
- $D$ được gọi là **tập xác định** của hàm số
- $f(D) = \{f(x) | x \in D\}$ được gọi là **tập giá trị** của hàm số

### 2. Các cách cho hàm số

#### a) Cho bằng công thức
Hàm số được cho bởi biểu thức $y = f(x)$

**Ví dụ**: $y = 2x + 1$, $y = x^2 - 3x + 2$

#### b) Cho bằng bảng
Liệt kê các cặp giá trị $(x, y)$ tương ứng

| $x$ | -2 | -1 | 0 | 1 | 2 |
|-----|----|----|---|---|---|
| $y$ | 4  | 1  | 0 | 1 | 4 |

#### c) Cho bằng đồ thị
Biểu diễn hàm số trên mặt phẳng tọa độ

### 3. Tập xác định của hàm số

**Quy tắc tìm tập xác định**:

1. **Hàm đa thức**: $D = \mathbb{R}$
2. **Hàm phân thức**: Loại bỏ giá trị làm mẫu số bằng 0
3. **Hàm căn bậc chẵn**: Biểu thức dưới dấu căn phải không âm
4. **Hàm logarit**: Biểu thức trong logarit phải dương

**Ví dụ**:
- $y = \frac{1}{x-2}$ có $D = \mathbb{R} \setminus \{2\}$
- $y = \sqrt{x-1}$ có $D = [1; +\infty)$
- $y = \ln(x+3)$ có $D = (-3; +\infty)$

### 4. Đồ thị hàm số

**Định nghĩa**: Đồ thị của hàm số $y = f(x)$ với tập xác định $D$ là tập hợp tất cả các điểm $M(x; f(x))$ trong mặt phẳng tọa độ $Oxy$ với $x \in D$.

**Tính chất**:
- Mỗi đường thẳng song song với trục $Oy$ cắt đồ thị hàm số tại nhiều nhất một điểm
- Đồ thị hàm số có thể được vẽ bằng cách lập bảng giá trị và nối các điểm

## 💡 Ví dụ minh họa

### Ví dụ 1
Cho hàm số $f(x) = x^2 - 4x + 3$

a) Tìm tập xác định của hàm số
b) Tính $f(0)$, $f(2)$, $f(-1)$
c) Tìm $x$ sao cho $f(x) = 0$

**Lời giải**:

a) Vì $f(x) = x^2 - 4x + 3$ là hàm đa thức nên $D = \mathbb{R}$

b) 
- $f(0) = 0^2 - 4 \cdot 0 + 3 = 3$
- $f(2) = 2^2 - 4 \cdot 2 + 3 = 4 - 8 + 3 = -1$
- $f(-1) = (-1)^2 - 4 \cdot (-1) + 3 = 1 + 4 + 3 = 8$

c) $f(x) = 0 \Leftrightarrow x^2 - 4x + 3 = 0$

Phân tích: $x^2 - 4x + 3 = (x-1)(x-3) = 0$

Vậy $x = 1$ hoặc $x = 3$

### Ví dụ 2
Tìm tập xác định của hàm số $y = \frac{\sqrt{x+1}}{x-2}$

**Lời giải**:

Điều kiện xác định:
$$\begin{cases}
x + 1 \geq 0 \\
x - 2 \neq 0
\end{cases}
\Leftrightarrow
\begin{cases}
x \geq -1 \\
x \neq 2
\end{cases}$$

Vậy tập xác định là $D = [-1; 2) \cup (2; +\infty)$

## 🔥 Bài tập thực hành

### Bài 1
Tìm tập xác định của các hàm số sau:
a) $y = \frac{2x+1}{x^2-9}$
b) $y = \sqrt{5-2x}$
c) $y = \frac{1}{\sqrt{x^2-4}}$

### Bài 2
Cho hàm số $f(x) = 2x^2 - 3x + 1$
a) Tính $f(1)$, $f(-2)$, $f(\frac{1}{2})$
b) Tìm $x$ sao cho $f(x) = 6$

### Bài 3
Vẽ đồ thị hàm số $y = x^2 - 2x - 3$ và từ đó suy ra tập giá trị của hàm số.

## 📝 Tóm tắt

- **Hàm số** là quy tắc đặt tương ứng mỗi $x \in D$ với một và chỉ một $y \in R$
- **Tập xác định** là tập hợp tất cả giá trị $x$ mà hàm số có nghĩa
- **Đồ thị hàm số** là tập hợp điểm $(x; f(x))$ trong mặt phẳng tọa độ
- Có nhiều cách cho hàm số: công thức, bảng, đồ thị

---

**Bài tiếp theo**: [Bài 2 - Hàm số bậc nhất](./bài-2-hàm-số-bậc-nhất.md)
