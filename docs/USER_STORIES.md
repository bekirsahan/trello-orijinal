# Kullanıcı Hikayeleri (User Stories)

## Epic 1: Kullanıcı Hesap Yönetimi & Yetkilendirme (Auth & User)

### US-101: Yeni Üye Kaydı (Sign-Up)
* **Açıklama:** Sisteme yeni katılacak bir takım üyesi olarak, ad-soyad, e-posta ve güvenli bir şifre belirterek kayıt olabilmeliyim.
* **Kabul Kriterleri:**
  * E-posta adresi benzersiz ve geçerli bir formatta olmalıdır.
  * Şifre en az 6 karakterden oluşmalı, veri tabanında hash'lenmiş (bcrypt) olarak saklanmalıdır.
  * Başarılı kayıt sonrasında sistem otomatik olarak JWT token üretmeli ve kullanıcıyı ana sayfaya yönlendirmelidir.

### US-102: Kullanıcı Girişi (Sign-In)
* **Açıklama:** Kayıtlı bir kullanıcı olarak, e-posta adresim ve şifremle sisteme giriş yapabilmeliyim.
* **Kabul Kriterleri:**
  * Hatalı e-posta veya şifre girişlerinde anlamlı ama güvenlik açığı vermeyen hata mesajları dönmelidir.
  * Başarılı girişte JWT token verilmeli ve istemci tarafında yerel depolamada saklanmalıdır.

### US-103: Profil ve Rol Yönetimi
* **Açıklama:** Giriş yapmış bir kullanıcı olarak kendi profil bilgilerimi ve avatarımı güncelleyebilmeliyim. Admin yetkisine sahip bir kullanıcı olarak ise tüm üyeleri listeyebilmeli ve rollerini (USER/ADMIN) değiştirebilmeliyim.
* **Kabul Kriterleri:**
  * Sıradan kullanıcılar rol değiştirme API'sine erişemez (403 Forbidden).
  * Admin tüm kullanıcılara erişebilir ve yetki kontrolü yapabilir.

---

## Epic 2: Proje Panoları (Project Boards)

### US-201: Proje Oluşturma ve Yönetme
* **Açıklama:** Proje yöneticisi veya üye olarak yeni bir proje panosu oluşturabilmeli, açıklama eklemeli ve panonun arka plan rengini/temasını seçebilmeliyim.
* **Kabul Kriterleri:**
  * Proje başlığı zorunludur ve boş geçilemez.
  * Projeyi oluşturan kullanıcı otomatik olarak o projenin "Sahibi" (`OWNER`) rolünü alır.
  * Proje sahibi projeyi düzenleyebilir veya silebilir.

### US-202: Projeye Ekip Arkadaşı Ekleme
* **Açıklama:** Bir proje sahibi olarak, diğer kayıtlı kullanıcıları projeme üye (`MEMBER`) olarak davet edebilmeli ve görev paylaşımı yapabilmeliyim.
* **Kabul Kriterleri:**
  * Yalnızca projede `OWNER` yetkisine sahip kullanıcı üye ekleyebilir/çıkarabilir.
  * Davet edilen kullanıcı projenin tüm görevlerini görebilir ve kendisine görev atanabilir.

---

## Epic 3: Görev ve Kanban Yönetimi (Task & Kanban)

### US-301: Görev Kartı Oluşturma
* **Açıklama:** Bir proje üyesi olarak, projedeki "To Do" sütununa yeni görev kartları ekleyebilmeli, başlık, açıklama, öncelik ve bitiş tarihi tanımlayabilmeliyim.
* **Kabul Kriterleri:**
  * Görev başlığı zorunludur.
  * Göreve `LOW`, `MEDIUM`, `HIGH`, `URGENT` önceliklerinden biri atanabilir (Varsayılan: `MEDIUM`).
  * Görev oluşturulduğunda varsayılan olarak `todo` durumunda başlar.

### US-302: Kanban Panosunda Sürükle-Bırak (Drag-and-Drop)
* **Açıklama:** Görevleri tamamladıkça veya durumları değiştikçe, kartları sütunlar (To Do, Doing, Done) arasında sürükleyip bırakarak durumlarını ve sıralarını güncelleyebilmeliyim.
* **Kabul Kriterleri:**
  * Bir kart sürüklendiğinde veritabanında `status` alanı anında (`todo`, `doing`, `done`) güncellenir.
  * Aynı sütun içindeki sıralama (`orderIndex`) güncellenerek kartların konumları korunur.
  * API, tek bir istek ile hem durumu hem de yeni sırayı güncelleyecek (`PATCH /api/tasks/:id/status`) şekilde tasarlanır.

### US-303: Görev Atama (Assignee) ve Filtreleme
* **Açıklama:** Panodaki görevlerin üstüne sorumlu atayabilmeli, teslim tarihlerini takip edebilmeli ve arama çubuğu üzerinden öncelik veya başlığa göre filtreleme yapabilmeliyim.
* **Kabul Kriterleri:**
  * Görevi üstlenen kişi kart üzerinde avatarıyla gösterilir.
  * Arama ve filtreleme işlemleri client-side veya server-side hızlı yanıt vermelidir.
