# API Dokümantasyonu (REST API Specification)

Tüm isteklerde `Content-Type: application/json` kullanılmalıdır. JWT gerektiren korumalı endpoint'lerde istek başlığında (header) `Authorization: Bearer <TOKEN>` gönderilmelidir.

---

## 🔑 1. Auth Servisi (Kimlik Doğrulama)

### POST `/api/auth/register`
Sisteme yeni bir kullanıcı kaydeder.
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "name": "Bekir Karşıyaka",
    "email": "bekir@example.com",
    "password": "securepassword123"
  }
  ```
* **Başarılı Yanıt (201 Created):**
  ```json
  {
    "success": true,
    "message": "Kullanıcı başarıyla kaydedildi.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "u1",
      "name": "Bekir Karşıyaka",
      "email": "bekir@example.com",
      "role": "USER"
    }
  }
  ```

### POST `/api/auth/login`
Kullanıcı girişi sağlar ve JWT token döner.
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "email": "bekir@example.com",
    "password": "securepassword123"
  }
  ```
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "message": "Giriş başarılı.",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "u1",
      "name": "Bekir Karşıyaka",
      "email": "bekir@example.com",
      "role": "USER"
    }
  }
  ```

### GET `/api/auth/me`
Aktif JWT oturumu geçerli ise kullanıcının profil bilgilerini döner.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "u1",
      "name": "Bekir Karşıyaka",
      "email": "bekir@example.com",
      "role": "USER",
      "avatar": null
    }
  }
  ```

---

## 📁 2. Proje Servisi

### GET `/api/projects`
Giriş yapmış kullanıcının dahil olduğu veya sahibi olduğu projeleri listeler.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "projects": [
      {
        "id": "p1",
        "title": "Trello Klon Geliştirme",
        "description": "Faz 1-4 entegrasyonu",
        "color": "#4f46e5",
        "ownerId": "u1",
        "createdAt": "2026-08-21T13:00:00.000Z"
      }
    ]
  }
  ```

### POST `/api/projects`
Yeni bir proje panosu oluşturur.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "title": "Yeni Proje",
    "description": "Proje açıklaması buraya gelecek.",
    "color": "#e11d48"
  }
  ```
* **Başarılı Yanıt (201 Created):**
  ```json
  {
    "success": true,
    "project": {
      "id": "p2",
      "title": "Yeni Proje",
      "description": "Proje açıklaması buraya gelecek.",
      "color": "#e11d48",
      "ownerId": "u1"
    }
  }
  ```

### GET `/api/projects/:id`
Projenin detaylarını, görevlerini ve ekip üyelerini tek bir istekte getirir.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "project": {
      "id": "p1",
      "title": "Trello Klon Geliştirme",
      "description": "Faz 1-4 entegrasyonu",
      "color": "#4f46e5",
      "ownerId": "u1",
      "tasks": [
        {
          "id": "t1",
          "title": "ER diyagramı çizilecek",
          "status": "todo",
          "priority": "HIGH",
          "orderIndex": 0,
          "assigneeId": null
        }
      ],
      "members": [
        {
          "userId": "u1",
          "role": "OWNER",
          "user": {
            "name": "Bekir Karşıyaka",
            "email": "bekir@example.com"
          }
        }
      ]
    }
  }
  ```

---

## 📌 3. Görev (Task) Servisi

### POST `/api/tasks`
Projeye yeni bir görev ekler.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "projectId": "p1",
    "title": "Kod yazmaya başla",
    "description": "Express sunucu yapısı kurulacak.",
    "priority": "HIGH",
    "dueDate": "2026-08-28T23:59:59.000Z",
    "assigneeId": "u1"
  }
  ```

### PUT `/api/tasks/:id`
Görev detaylarını günceller.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "title": "Güncellenmiş Başlık",
    "description": "Açıklama güncellendi",
    "priority": "LOW",
    "assigneeId": null,
    "dueDate": null
  }
  ```

### PATCH `/api/tasks/:id/status`
Kanban panosunda kart kaydırıldığında durumu (`status`) ve yeni sütun içi sırayı (`orderIndex`) tek bir PATCH işlemiyle verimli bir şekilde günceller.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **İstek Gövdesi (Request Body):**
  ```json
  {
    "status": "doing",
    "orderIndex": 2
  }
  ```
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "task": {
      "id": "t1",
      "status": "doing",
      "orderIndex": 2
    }
  }
  ```

### DELETE `/api/tasks/:id`
Görevi panodan siler.
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "message": "Görev başarıyla silindi."
  }
  ```
