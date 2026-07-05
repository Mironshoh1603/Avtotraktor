# Quiz Application - Client API Documentation

## Base URL
```
http://localhost:3003
```

## Authentication

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "testuser1",
    "role": "user"
  }
}
```

**Response (Error):**
```json
{
  "message": "Noto'g'ri username yoki parol",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

---

## Quiz Questions

### 2. Get Random Questions
**Endpoint:** `GET /questions/random`

**Query Parameters:**
- `lang` (optional): uz, kr, ru
- `limit` (optional): Number of questions (default: 50)

**Request Example:**
```
GET /questions/random?lang=uz&limit=20
```

**Response:**
```json
[
  {
    "id": 1,
    "question": "Qaysi avtomobil uchun bu belgilarning ta'sir oralig'ida to'xtashga ruxsat etiladi?",
    "options": [
      "Qizilga",
      "Ikkala avtomobilga", 
      "Hech qaysi biriga",
      "Sariq avtomobilga"
    ],
    "correct_option": "Sariq avtomobilga",
    "image_path": "images_db/6872-1-327.jpg",
    "lang": "uz",
    "category_id": 16,
    "answer_description": "YHQ 1-ilovasi 3-bo'limi...",
    "answer_video": "videos_db/6872-784.mp4"
  }
]
```

### Media Files
**Images:** `http://localhost:3003/uploads/{image_path}`
**Videos:** `http://localhost:3003/uploads/{answer_video}`

---

## Test Results

### 3. Submit Test Result  
**Endpoint:** `POST /results`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "total_questions": 20,
  "correct_answers": 16,
  "wrong_answers": 4,
  "score_percentage": 80,
  "answers_detail": [
    {
      "question_id": 1,
      "selected_option": "Sariq avtomobilga",
      "is_correct": true
    },
    {
      "question_id": 2, 
      "selected_option": "Faqat A yo'nalish bo'ylab.",
      "is_correct": false
    }
  ],
  "test_language": "uz",
  "test_duration_seconds": 600
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 2,
  "total_questions": 20,
  "correct_answers": 16,
  "wrong_answers": 4,
  "score_percentage": 80,
  "test_language": "uz",
  "test_duration_seconds": 600,
  "completed_at": "2026-05-25T19:26:55.284Z",
  "answers_detail": [...]
}
```

### 4. Get My Results
**Endpoint:** `GET /results/my-results`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "total_questions": 20,
    "correct_answers": 16, 
    "wrong_answers": 4,
    "score_percentage": 80,
    "test_language": "uz",
    "test_duration_seconds": 600,
    "completed_at": "2026-05-25T19:26:55.284Z"
  },
  {
    "id": 2,
    "total_questions": 15,
    "correct_answers": 12,
    "wrong_answers": 3, 
    "score_percentage": 80,
    "test_language": "uz",
    "test_duration_seconds": 450,
    "completed_at": "2026-05-25T19:27:31.771Z"
  }
]
```

### 5. Get My Statistics
**Endpoint:** `GET /results/my-statistics`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "total_tests": 2,
  "average_score": 80,
  "highest_score": 80,
  "lowest_score": 80,
  "total_questions_answered": 35,
  "total_correct_answers": 28,
  "total_wrong_answers": 7
}
```

---

## Error Analysis

### 6. Get My Wrong Questions
**Endpoint:** `GET /results/my-wrong-questions`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "question_id": 2,
    "question_text": "Yo'naltirgichlar bilan ko'rsatilgan yo'nalishlarning qaysi biri...",
    "wrong_count": 1,
    "total_attempts": 2,
    "error_percentage": 50,
    "last_wrong_answer": "Faqat A yo'nalish bo'ylab.",
    "correct_answer": "Faqat A va D yo'nalishlari bo'ylab."
  }
]
```

---

## File Upload

### 7. Upload File
**Endpoint:** `POST /upload/file`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'file' field containing the image or video file
```

**Response:**
```json
{
  "url": "/uploads/1779987014038-524410408.jpg",
  "originalName": "image.jpg"
}
```

---

## Categories

### 7. Get Categories
**Endpoint:** `GET /categories`

**Response:**
```json
[
  {
    "id": 16,
    "name": "Kategoriya 16", 
    "description": null,
    "status": 1
  }
]
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |  
| 400 | Bad Request |
| 401 | Unauthorized (Invalid token or credentials) |
| 403 | Forbidden (Access denied) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Frontend Implementation Examples

### JavaScript/Axios Examples:

```javascript
const API_BASE = 'http://localhost:3003';

// 1. Login
async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password
    });
    
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.response.data.message };
  }
}

// 2. Get Questions
async function getQuestions(lang = 'uz', limit = 20) {
  try {
    const response = await axios.get(`${API_BASE}/questions/random?lang=${lang}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Questions yuklashda xatolik:', error);
    return [];
  }
}

// 3. Submit Test Result
async function submitTest(testData) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(`${API_BASE}/results`, testData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response.data.message };
  }
}

// 4. Get My Results  
async function getMyResults() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(`${API_BASE}/results/my-results`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Natijalarni yuklashda xatolik:', error);
    return [];
  }
}

// 5. Get My Statistics
async function getMyStatistics() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(`${API_BASE}/results/my-statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Statistikalarni yuklashda xatolik:', error);
    return null;
  }
}

// 6. Get My Wrong Questions
async function getMyWrongQuestions() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.get(`${API_BASE}/results/my-wrong-questions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Xato savollarni yuklashda xatolik:', error);
    return [];
  }
}

// 7. Upload File
async function uploadFile(file) {
  const token = localStorage.getItem('token');
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE}/upload/file`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return { success: true, url: response.data.url };
  } catch (error) {
    console.error('Fayl yuklashda xatolik:', error);
    return { success: false, message: 'Upload failed' };
  }
}
```

### React Hook Example:

```javascript
import { useState, useEffect } from 'react';

function useQuestions(lang, limit) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const data = await getQuestions(lang, limit);
      setQuestions(data);
      setLoading(false);
    }
    
    fetchQuestions();
  }, [lang, limit]);
  
  return { questions, loading };
}
```

---

## Important Notes

1. **Authentication Required:** Test result endpoints require valid JWT token
2. **Token Storage:** Store token securely (localStorage/sessionStorage)  
3. **Media Files:** All images/videos are served from `/uploads/` directory
4. **CORS:** API supports CORS for localhost:3000, localhost:5173, localhost:3001
5. **Rate Limiting:** No rate limiting currently implemented
6. **File Paths:** Use relative paths for media files (e.g., "images_db/file.jpg")