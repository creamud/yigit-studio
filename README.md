# Yigit Studio

Apple × Tesla görsel diline sahip, tarayıcıda çalışan etkileşimli Model 3 kişiselleştirme ve sürüş deneyimi. Three.js tabanlıdır; sunucu veya API anahtarı gerektirmez.

## Yerel çalıştırma

Proje klasöründe:

```sh
python3 -m http.server 4173 --directory dist
```

Ardından http://localhost:4173 adresini aç. ES modülleri nedeniyle HTML dosyasını doğrudan çift tıklamak yerine bir HTTP sunucusu kullan.

## Kontroller

- **W:** İleri hareket.
- **S:** Fren, durduktan sonra geri hareket.
- **A / D:** Sola / sağa dönüş.
- **R:** Aracı en yakın yol şeridine geri al.
- **C / E:** İç ve dış görünüm arasında geçiş.
- **U:** Sürüş sırasında arayüzü gizle / göster.
- **L:** Farlar.
- **H:** Korna.
- **Fareyle sürükleme:** Kamerayı çevir.

Araç içindeki ekrana veya alt araç ekranı düğmesine tıklayınca, mevcut görüntünün üzerine araç durumu, ayarlar, harita ve müzik kitaplığını içeren tablet açılır. Kişiselleştirme panelinde boya, jant, döşeme, ambiyans ve ses ayarları bulunur.

## Sürüş ve dünya

Ayran, Cap ve Wallet yerleşimlerini içeren sahil rotası, ortak araç ekranı haritası, zemin eğimi ve süspansiyon tepkisi, yüzeye bağlı tutuş, ağaç / kaya / bina / dağ çarpışmaları ve devrilme davranışı içerir. R tuşu sıkışma veya devrilme sonrasında kullanılabilir.

## Müzik ve tarayıcı verileri

İçe aktarılan müzik dosyaları, dosya adlarıyla birlikte yalnızca kullanıcının tarayıcısındaki IndexedDB içinde saklanır. Bu depoya yüklenmez. Ses düzeyleri ve oynatma tercihleri de tarayıcıda saklanır.

Tarayıcı verileri site adresine bağlıdır. Önceki site adresinde içe aktarılan müzikler yeni GitHub Pages adresine otomatik taşınmaz; yeni adreste yeniden içe aktarılabilir.

## Testler

Node.js yüklüyken:

```sh
npm test
```

Testler; tuş eşlemesi, dönüş simetrisi, fren / geri hareket, zemin ve çarpışma davranışı, devrilme sonrası sıfırlama ve kare hızından bağımsız hareketi kapsar.

## GitHub Pages yayını

1. GitHub deposunda **Settings → Pages** bölümünü aç.
2. **Source** olarak **GitHub Actions** seç.
3. Ana dal olan `main` güncellendiğinde `.github/workflows/pages.yml` testleri çalıştırır ve `dist/` klasörünü yayımlar.
4. Yayın durumu **Actions** sekmesinden izlenebilir.

Yerel veya başka bir platformdaki değişikliklerin de yayına girmesi için önce bu depoya aktarılması gerekir.

## Kaynaklar ve atıflar

- 3D Model 3 sanatçı modeli ve uyarlamalar: [Model kaynakları](dist/models/highland/CREDITS.md).
- Fontlar: [Font kaynakları](dist/assets/fonts/CREDITS.md).
- Three.js ve diğer üçüncü taraf kütüphanelerin telif / lisans bildirimleri ilgili dosyalarda korunmuştur.
- Tesla simgesi: Simple Icons.

Tesla tarafından hazırlanmış veya onaylanmış resmî bir ürün değildir. Üçüncü taraf varlıkların kendi lisansları geçerlidir.
