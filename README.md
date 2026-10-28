# Ekran Kaydedici (Ravix_w1)

Düşük sistemli bilgisayarlar (özellikle eski laptoplar) için geliştirilmiş, hafif ve tamamen ücretsiz bir Electron tabanlı ekran kaydedicidir.

## 🚀 Sürüm Geçmişi ve Özellikler

### [v1.3.0] - En Son Sürüm (Güncel)
Bu sürüm, bilgisayarı yormadan, kasmadan kayıt almak için özel performans optimizasyonları içerir.
*   **Ham Kayıt Modu (Raw Mode):** Görüntüyü işlemeden (kırpmadan) doğrudan kaydeder. Bu sayede eski bilgisayarlarda yaşanan video kasmalarını (frame drop) tamamen ortadan kaldırır.
*   **Önizleme Donması:** Kayıt başladığı an sağ taraftaki canlı önizleme donar. Bilgisayarın tüm gücü sadece videoyu kaydetmeye odaklanır. Kayıt bittiğinde önizleme tekrar aktif olur.
*   **Klavye Kısayolları:** Oyun içindeyken bile (F9 ile başlat/durdur, F10 ile duraklat) kontrol imkanı.
*   **Özel Çerçeve:** İstenilen X, Y, Genişlik ve Yükseklik değerleriyle sadece belirli bir alanı kaydetme.
*   **Sistem ve Mikrofon Sesi Karışımı:** İki ses kaynağını aynı anda kaydedip ses seviyelerini ayarlama.
*   **Kurtarma Sistemi:** Çökme durumunda kaydı kurtarma.

---

### ⚠️ [v1.2.0] Kullananlar İçin Önemli Farklar (Eski Sürüm)
Eğer hala v1.2.0 sürümünü kullanıyorsanız, **kayıt esnasında yaşadığınız kasmaların (FPS düşüşlerinin) sebebi bu sürümün teknik altyapısıdır.** 
*   **Sorun:** v1.2.0'da önizleme ekranı kayıt sırasında sürekli açık kalıyordu ve bilgisayar hem oyunu kaydetmeye hem de önizlemeyi canlı tutmaya çalıştığı için ekran kartı zorlanıyordu.
*   **Eksik Özellik:** v1.2.0'da "Ham Kayıt Modu" bulunmuyordu. Tüm görüntüler arka planda işlenerek (Canvas üzerinden kırpılarak) kaydediliyordu.
*   **Neden v1.3.0'a Geçmelisiniz?** v1.3.0'da gelen "Ham Kayıt Modu" ve "Önizleme Donması" özellikleri sayesinde bilgisayarınız artık sadece kayda odaklanır ve kasmayan, akıcı videolar elde edersiniz. **Lütfen en son sürüme güncelleyin.**

## Kurulum (Geliştiriciler İçin)
Projeyi indirdikten sonra terminalde:
```bash
npm install
npm start
