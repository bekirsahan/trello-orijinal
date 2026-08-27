# Veritabanı ER Tasarımı

Sistemimiz ilişkisel bir yapıda kurgulanmıştır. Görev yönetimi, projeler, kullanıcılar ve üyeler arasındaki ilişkiler veri bütünlüğünü koruyacak şekilde tasarlanmıştır.

## Sütunlar ve İlişkiler

### 1. User Tablosu
Sistemdeki tüm kayıtlı kullanıcıları temsil eder.

* `id` (String, PK, default: uuid/cuid): Benzersiz tanımlayıcı.
* `email` (String, Unique): Giriş için kullanılan e-posta adresi.
* `passwordHash` (String): Güvenli şifre hash'i (Bcrypt).
* `name` (String): Kullanıcının adı ve soyadı.
* `role` (Enum: `ADMIN`, `USER`, default: `USER`): Sistem genelindeki yetki rolü.
* `avatar` (String, Nullable): Kullanıcı avatar görseli veya rengi için URL/Değer.
* `createdAt` / `updatedAt` (DateTime): Zaman damgaları.

### 2. Project Tablosu
Proje panolarını temsil eder. Her projenin bir sahibi (`owner`) ve görevleri (`tasks`) bulunur.

* `id` (String, PK, default: uuid/cuid): Benzersiz tanımlayıcı.
* `title` (String): Proje adı (örn: "Pazarlama Kampanyası").
* `description` (String, Nullable): Projenin kısa açıklaması.
* `color` (String, default: "#4f46e5"): Arayüzde görüntülenecek tema rengi (Hex formatında).
* `ownerId` (String, FK -> User.id): Projeyi oluşturan ve yöneten kullanıcı.
* `createdAt` / `updatedAt` (DateTime): Zaman damgaları.

### 3. ProjectMember Tablosu
Projelere atanan ekip üyelerini ve onların projedeki rollerini temsil eder. Bir projenin birden fazla üyesi, bir kullanıcının da dahil olduğu birden fazla proje olabilir (Çoktan Çoka İlişki).

* `id` (String, PK): Benzersiz kayıt id.
* `projectId` (String, FK -> Project.id, Cascade Delete): Proje.
* `userId` (String, FK -> User.id, Cascade Delete): Üye olan kullanıcı.
* `role` (Enum: `OWNER`, `MEMBER`, `VIEWER`, default: `MEMBER`): Proje içi yetkilendirme.
* `joinedAt` (DateTime): Katılma tarihi.

### 4. Task Tablosu
Proje panosundaki görev kartlarını temsil eder.

* `id` (String, PK, default: uuid/cuid): Benzersiz tanımlayıcı.
* `title` (String): Görevin kısa başlığı.
* `description` (String, Nullable): Görevin ayrıntılı açıklaması.
* `status` (Enum: `todo`, `doing`, `done`, default: `todo`): Kanban üzerindeki sütun konumu.
* `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT`, default: `MEDIUM`): Görev önceliği.
* `orderIndex` (Int, default: 0): Sütun içindeki dikey sıralama numarası.
* `dueDate` (DateTime, Nullable): Son teslim tarihi.
* `tags` (String, Nullable): Etiketler (Virgülle ayrılmış veya JSON formatında dizi).
* `projectId` (String, FK -> Project.id, Cascade Delete): Görevin ait olduğu proje.
* `assigneeId` (String, FK -> User.id, Nullable): Görevin atandığı (sorumlu) kullanıcı.
* `createdById` (String, FK -> User.id): Görevi oluşturan kullanıcı.
* `createdAt` / `updatedAt` (DateTime): Zaman damgaları.

### 5. TaskLog Tablosu (Opsiyonel / İzlenebilirlik)
Görevlerin geçmiş hareketlerini ve aktivitelerini tutar.

* `id` (String, PK)
* `taskId` (String, FK -> Task.id, Cascade Delete)
* `userId` (String, FK -> User.id)
* `action` (String): "CREATED", "STATUS_CHANGE", "UPDATED", "ASSIGNEE_CHANGE" vb.
* `details` (String): "Görev 'Doing' sütununa taşındı" vb.
* `timestamp` (DateTime)
