function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

window.EMBEDDED_SITE_DATA = {
    "_meta": {
        "version": "1.0.0",
        "lastUpdated": "2026-08-06",
        "repo": {
            "owner": "hakanv9",
            "repo": "v9testsite1",
            "branch": "main"
        }
    },
    "heroSlider": [
        {
            "id": "slide-1",
            "src": "resimler/anasayfa-hosgeldin-resmi1.webp",
            "alt": "Hoşgeldin 1",
            "order": 1
        },
        {
            "id": "slide-2",
            "src": "resimler/anasayfa-hosgeldin-resmi2.webp",
            "alt": "Hoşgeldin 2",
            "order": 2
        },
        {
            "id": "slide-3",
            "src": "resimler/anasayfa-hosgeldin-resmi3.webp",
            "alt": "Hoşgeldin 3",
            "order": 3
        },
        {
            "id": "slide-4",
            "src": "resimler/anasayfa-hosgeldin-resmi4.webp",
            "alt": "Hoşgeldin 4",
            "order": 4
        }
    ],
    "projects": [
        {
            "id": "kurye",
            "slug": "kurye",
            "name": "V9 Kurye Uygulaması",
            "nameEN": "V9 Courier App",
            "shortDesc": "Gerçek zamanlı harita takibi, akıllı rota yönetimi ve anlık bildirimler ile kuryelerin teslimat süreçlerini uçtan uca yöneten mobil uygulama.",
            "shortDescEN": "A mobile app that manages courier delivery processes end-to-end with real-time map tracking, smart route management and instant notifications.",
            "thumbnail": "resimler/projeler-resmi1.webp",
            "tags": [
                "📦 Kurye",
                "📱 Mobil"
            ],
            "status": "discontinued",
            "order": 1,
            "visible": true,
            "detail": {
                "isAndroid": true,
                "playStoreEnabled": false,
                "playStoreUrl": "#",
                "logo": "resimler/uygulama_logo.webp",
                "downloads": "5B+",
                "rating": "4.5 ★",
                "ageRating": "3+",
                "appSize": "~18 MB",
                "minAndroid": "Android 8.0 (Oreo) / API 26",
                "description": [
                    "V9 Kurye Uygulaması, teslimat süreçlerini uçtan uca yöneten bir mobil çözümdür.",
                    "Gerçek zamanlı GPS takibi ile kuryenin tüm hareketleri anlık olarak izlenebilir. Dinamik rota optimizasyonu, teslimat süresini ve yakıt tüketimini önemli ölçüde azaltır.",
                    "📍 Gerçek Zamanlı Harita Takibi | 🗺️ Dinamik Rota | 🔔 Anlık Bildirimler | 🚀 Akıllı Teslimat"
                ],
                "descriptionEN": [
                    "V9 Courier App is a mobile solution that manages delivery processes end-to-end.",
                    "With real-time GPS tracking, all courier movements can be monitored instantly. Dynamic route optimization significantly reduces delivery time and fuel consumption.",
                    "📍 Real-Time Map Tracking | 🗺️ Dynamic Route | 🔔 Instant Notifications | 🚀 Smart Delivery"
                ],
                "permissions": [
                    "📍 Konum (Ön plan & Arka plan)",
                    "🔔 Bildirimler",
                    "📶 İnternet Erişimi",
                    "⚡ Arka Plan Servisi",
                    "📷 Kamera (teslimat fotoğrafı)"
                ],
                "screenshots": [
                    "resimler/uygulama_ekran1.webp",
                    "resimler/uygulama_ekran2.webp"
                ],
                "changelog": [
                    {
                        "id": "cl-kurye-1",
                        "version": "v1.2.0",
                        "date": "2024-11-15",
                        "type": "major",
                        "notes": [
                            "Gerçek zamanlı harita motoru yenilendi",
                            "Rota optimizasyon algoritması güncellendi",
                            "Kritik hata düzeltmeleri"
                        ]
                    },
                    {
                        "id": "cl-kurye-2",
                        "version": "v1.1.0",
                        "date": "2024-08-01",
                        "type": "minor",
                        "notes": [
                            "Bildirim sistemi iyileştirildi",
                            "Arayüz güncellemeleri",
                            "Performans iyileştirmeleri"
                        ]
                    },
                    {
                        "id": "cl-kurye-3",
                        "version": "v1.0.0",
                        "date": "2024-05-10",
                        "type": "major",
                        "notes": [
                            "İlk sürüm yayınlandı",
                            "Temel harita ve takip özellikleri",
                            "Anlık bildirim altyapısı"
                        ]
                    }
                ]
            }
        },
        {
            "id": "grup-v1",
            "slug": "grup-v1",
            "name": "V9 Grup Konum Paylaşımı",
            "nameEN": "V9 Group Location Sharing",
            "shortDesc": "Anlık çoklu konum takibi ile grubun her üyesini haritada eş zamanlı gösteren mobil uygulama. v1.0",
            "shortDescEN": "A mobile app that shows all group members on the map simultaneously with real-time multi-location tracking. v1.0",
            "thumbnail": "resimler/projeler-resmi2.webp",
            "tags": [
                "🗺️ Harita"
            ],
            "status": "paused",
            "order": 2,
            "visible": true,
            "detail": {
                "isAndroid": true,
                "playStoreEnabled": false,
                "playStoreUrl": "#",
                "logo": "resimler/uygulama_logo.webp",
                "downloads": "10B+",
                "rating": "4.8 ★",
                "ageRating": "3+",
                "appSize": "~12 MB",
                "minAndroid": "Android 8.0 (Oreo) / API 26",
                "description": [
                    "V9 Grup Konum Paylaşımı (v1.0), bir grup içindeki tüm üyelerin konumunu aynı anda haritada göstermeye yarayan mobil bir uygulamadır.",
                    "Saniyeler içinde oda oluşturun, davet bağlantısı paylaşın ve grubunuzun tüm üyelerini anlık olarak haritada izleyin. Akıllı toplanma noktası hesaplaması ile herkese en yakın buluşma noktası belirlenir.",
                    "👥 Dinamik Grup Yönetimi | 📍 Gerçek Zamanlı Çoklu Takip | 🔋 Optimize Pil Kullanımı | 🎯 Akıllı Toplanma Noktaları"
                ],
                "descriptionEN": [
                    "V9 Group Location Sharing (v1.0) is a mobile application that shows the location of all members in a group on the map simultaneously.",
                    "Create a room in seconds, share the invitation link, and track all members of your group on the map in real time. The smart gathering point calculation determines the closest meeting point for everyone.",
                    "👥 Dynamic Group Management | 📍 Real-Time Multi-Tracking | 🔋 Optimized Battery Usage | 🎯 Smart Gathering Points"
                ],
                "permissions": [
                    "📍 Konum (Ön plan & Arka plan)",
                    "🔔 Bildirimler",
                    "📶 İnternet Erişimi",
                    "⚡ Arka Plan Servisi"
                ],
                "screenshots": [
                    "resimler/uygulama_ekran1.webp",
                    "resimler/uygulama_ekran2.webp"
                ],
                "changelog": [
                    {
                        "id": "cl-grv1-1",
                        "version": "v1.0.3",
                        "date": "2025-02-20",
                        "type": "fix",
                        "notes": [
                            "GPS senkronizasyon hatası düzeltildi",
                            "Pil tüketimi optimize edildi"
                        ]
                    },
                    {
                        "id": "cl-grv1-2",
                        "version": "v1.0.2",
                        "date": "2025-01-10",
                        "type": "minor",
                        "notes": [
                            "Harita motoru güncellendi",
                            "Arayüz iyileştirmeleri"
                        ]
                    },
                    {
                        "id": "cl-grv1-3",
                        "version": "v1.0.0",
                        "date": "2024-12-01",
                        "type": "major",
                        "notes": [
                            "İlk sürüm yayınlandı",
                            "Çoklu kullanıcı konum takibi",
                            "Oda sistemi ve davet bağlantısı"
                        ]
                    }
                ]
            }
        },
        {
            "id": "grup-v2",
            "slug": "grup-v2",
            "name": "V9 Grup Konum V2",
            "nameEN": "V9 Group Location V2",
            "shortDesc": "Entegre sohbet, low-latency GPS ve ölçeklenebilir mimariye sahip gelişmiş sürüm. v2.0",
            "shortDescEN": "Advanced version with integrated chat, low-latency GPS and scalable architecture. v2.0",
            "thumbnail": "resimler/projeler-resmi3.webp",
            "tags": [
                "💬 Sohbet",
                "📍 Konum"
            ],
            "status": "development",
            "statuses": [
                "development",
                "live"
            ],
            "order": 3,
            "visible": true,
            "detail": {
                "isAndroid": true,
                "playStoreEnabled": false,
                "playStoreUrl": "#",
                "logo": "resimler/uygulama_logo.webp",
                "downloads": "-",
                "rating": "-",
                "ageRating": "3+",
                "appSize": "~15 MB",
                "minAndroid": "Android 8.0 (Oreo) / API 26",
                "description": [
                    "V9 Grup Konum Paylaşımı V2, birinci sürümün üzerine inşa edilmiş, entegre sohbet özelliği ve low-latency GPS senkronizasyonu ile donatılmış gelişmiş bir sürümdür.",
                    "Yönetici yetkileri, oda kapasite ayağırlığıarı ve gerçek zamanlı mesajlaşma ile grup yönetimi tamamen yeniden tasağırlığıandı. Modüler mimari sayesinde gelecekteki özellikler kolayca entegre edilebilir.",
                    "🚀 Low-latency GPS | 💬 Entegre Sohbet | ⚙️ Yönetici Paneli | 🔄 Ölçeklenebilir Mimari"
                ],
                "descriptionEN": [
                    "V9 Group Location Sharing V2 is an advanced version built on top of the first version, equipped with integrated chat and low-latency GPS synchronization.",
                    "Group management has been completely redesigned with administrator permissions, room capacity settings, and real-time messaging. The modular architecture allows future features to be easily integrated.",
                    "🚀 Low-latency GPS | 💬 Integrated Chat | ⚙️ Admin Panel | 🔄 Scalable Architecture"
                ],
                "permissions": [
                    "📍 Konum (Ön plan & Arka plan)",
                    "🔔 Bildirimler",
                    "📶 İnternet Erişimi",
                    "⚡ Arka Plan Servisi",
                    "💬 İnternet Mesajlaşma"
                ],
                "screenshots": [
                    "resimler/uygulama_ekran1.webp",
                    "resimler/uygulama_ekran2.webp"
                ],
                "changelog": [
                    {
                        "id": "cl-grv2-1",
                        "version": "v2.0.1-beta",
                        "date": "2026-07-15",
                        "type": "minor",
                        "notes": [
                            "Sohbet modülü beta testleri",
                            "GPS gecikme iyileştirmeleri",
                            "Arayüz güncellemeleri"
                        ]
                    },
                    {
                        "id": "cl-grv2-2",
                        "version": "v2.0.0-alpha",
                        "date": "2026-05-01",
                        "type": "major",
                        "notes": [
                            "V2 mimarisi oluşturuldu",
                            "Entegre sohbet altyapısı",
                            "Low-latency GPS motoru"
                        ]
                    }
                ]
            }
        }
    ],
    "faq": [
        {
            "id": "faq-cat-1",
            "category": "🌐 Genel & Portfolyo Hakkında",
            "categoryEN": "🌐 General & Portfolio",
            "questions": [
                {
                    "id": "faq-q-1-1",
                    "q": "Bu sitenin amacı ve vizyonu nedir?",
                    "qEN": "What is the purpose and vision of this site?",
                    "a": "Bu site; Android, iOS, Web ve masaüstü platformları için geliştirdiğim mobil uygulamaları, teknik projelerimi ve yazılım çalışmalarımı sergilediğim kişisel geliştirici portfolyomdur. Amacım, kullanıcı odaklı, yüksek performanslı ve modern dijital çözümler sunmaktır.",
                    "aEN": "This site is my personal developer portfolio where I showcase mobile applications, technical projects, and software work developed for Android, iOS, Web, and desktop platforms. My goal is to deliver user-centric, high-performance, and modern digital solutions."
                },
                {
                    "id": "faq-q-1-2",
                    "q": "'Site' adlı proje ve sürüm geçmişi nedir?",
                    "qEN": "What is the 'Site' project and its version history?",
                    "a": "Bu web sitesinin kendisi de aktif olarak geliştirdiğim bağımsız bir projedir. Sitede yapılan performans optimize çalışmaları, yeni UI/UX tasarımları, hata düzeltmeleri ve altyapı güncellemeleri 'Site' adıyla projeler listesinde yayınlanmakta ve sürüm detayları şeffafça sunulmaktadır.",
                    "aEN": "This website itself is an independent project that I actively develop. Performance optimizations, new UI/UX designs, bug fixes, and infrastructure updates made to the site are published under the project named 'Site' in the projects list, with transparent version details."
                },
                {
                    "id": "faq-q-1-3",
                    "q": "Sitede hangi tür projeler yer alıyor?",
                    "qEN": "What types of projects are hosted on the site?",
                    "a": "Portfolyoda gerçek zamanlı GPS takip kurye uygulamaları, grup konum paylaşım sistemleri, kişisel web projeleri, açık kaynaklı araçlar, API entegrasyonları ve hobi amaçlı yazılım denemeleri yer almaktadır.",
                    "aEN": "The portfolio features real-time GPS tracking courier apps, group location sharing systems, personal web projects, open-source tools, API integrations, and hobby software experiments."
                },
                {
                    "id": "faq-q-1-4",
                    "q": "Projelerinizle ilgili geri bildirimde bulunabilir miyim?",
                    "qEN": "Can I provide feedback regarding your projects?",
                    "a": "Kesinlikle! Her projenin detay sayfasında yer alan 'Hata Bildirimi' veya 'Özellik İsteği' butonlarını kullanarak ya da genel iletişim formumuz aracılığıyla görüş ve önerilerinizi iletebilirsiniz.",
                    "aEN": "Absolutely! You can share your feedback and suggestions using the 'Bug Report' or 'Feature Request' buttons on each project's details page, or via our general contact form."
                }
            ]
        },
        {
            "id": "faq-cat-2",
            "category": "📱 Mobil & Android/iOS Uygulamaları",
            "categoryEN": "📱 Mobile & Android/iOS Applications",
            "questions": [
                {
                    "id": "faq-q-2-1",
                    "q": "Mobil uygulamalarınız hangi izinlere ihtiyaç duyuyor?",
                    "qEN": "What permissions do your mobile apps require?",
                    "a": "V9 Kurye ve Grup Konum Paylaşımı gibi harita tabanlı uygulamalarımız; temel canlı konum takibi fonksiyonu için Konum (Ön plan ve Arka plan), anlık bilgilendirmeler için Bildirim ve veri senkronizasyonu için İnternet izni istemektedir. Gerekli olmayan hiçbir ekstra izin talep edilmez.",
                    "aEN": "Our map-based applications, such as V9 Courier and Group Location Sharing, request Location (Foreground and Background) for core live tracking, Notification for instant alerts, and Internet permission for data sync. No unnecessary extra permissions are ever requested."
                },
                {
                    "id": "faq-q-2-2",
                    "q": "Arka plan konum izni pil ömrünü olumsuz etkiler mi?",
                    "qEN": "Does background location permission negatively affect battery life?",
                    "a": "Uygulamalarımız akıllı GPS dinleme algoritmaları ve low-latency konum senkronizasyon motorları ile geliştirilmiştir. Hareket halinde olunmadığında GPS güncellemeleri yavaşlatılır. Ayrıca grup veya kurye oturumu kapatıldığında arka plan izni tamamen durdurulur.",
                    "aEN": "Our applications are built with smart GPS listening algorithms and low-latency location synchronization engines. GPS updates slow down when idle. Additionally, background tracking stops completely when a group or courier session is closed."
                },
                {
                    "id": "faq-q-2-3",
                    "q": "Uygulamalarınızı Google Play Store üzerinden indirebilir miyim?",
                    "qEN": "Can I download your applications from the Google Play Store?",
                    "a": "Aktif yayındaki uygulamalarımızın Google Play Store indirme bağlantıları doğrudan detay sayfalarında mevcuttur. Test aşamasında veya yayın öncesi (WIP) durumdaki projeler için APK indirme veya kapalı test katılım bağlantıları sağlanmaktadır.",
                    "aEN": "Download links for apps actively live on the Google Play Store are available directly on their detail pages. For projects in testing or work-in-progress (WIP) status, direct APK downloads or closed test participation links are provided."
                },
                {
                    "id": "faq-q-2-4",
                    "q": "Uygulama izinlerini dilediğim zaman iptal edebilir miyim?",
                    "qEN": "Can I revoke application permissions at any time?",
                    "a": "Evet, dilediğiniz an cihazınızın Android veya iOS Ayağırlığıar > Uygulamalar bölümüne giderek uygulamalarımıza verdiğiniz konum, bildirim veya diğer izinleri kısıtlayabilir ya da tamamen kapatabilirsiniz.",
                    "aEN": "Yes, at any time you can go to your device's Android or iOS Settings > Applications menu to restrict or completely turn off location, notification, or other permissions granted to our apps."
                }
            ]
        },
        {
            "id": "faq-cat-3",
            "category": "📝 Sürümler, Güncellemeler ve Açık Kaynak",
            "categoryEN": "📝 Releases, Updates & Open Source",
            "questions": [
                {
                    "id": "faq-q-3-1",
                    "q": "Projelerin sürüm geçmişini nasıl takip edebilirim?",
                    "qEN": "How can I track the release history of projects?",
                    "a": "Proje listesinden ilgili projenin 'Detayları İncele' butonuna tıklayarak açılan özel detay sayfasında projenin tüm sürüm geçmişini (Changelog), yayın tarihlerini, eklenen yeni özellikleri ve düzeltilen hataları inceleyebilirsiniz.",
                    "aEN": "Clicking the 'View Details' button for any project in the project list takes you to its dedicated detail page, where you can inspect the full release history (Changelog), release dates, newly added features, and bug fixes."
                },
                {
                    "id": "faq-q-3-2",
                    "q": "Projelerinizin kaynak kodları açık kaynaklı mı?",
                    "qEN": "Are your project source codes open source?",
                    "a": "Bazı projelerimiz ve geliştirme araçlarımız açık kaynak kodlu olarak GitHub üzerinde paylaşılmaktadır. İlgili projenin detay sayfasında açık kaynak kod bağlantısı yer alıyorsa projeyi inceleyebilir ve katkıda bulunabilirsiniz.",
                    "aEN": "Some of our projects and developer tools are shared as open source on GitHub. If an open-source repository link is present on the project's detail page, you can examine the code and contribute."
                }
            ]
        },
        {
            "id": "faq-cat-4",
            "category": "🔒 Veri Gizliliği & Güvenlik",
            "categoryEN": "🔒 Data Privacy & Security",
            "questions": [
                {
                    "id": "faq-q-4-1",
                    "q": "Konum veya kişisel verilerim sunucularınızda saklanıyor mu?",
                    "qEN": "Are my location or personal data stored on your servers?",
                    "a": "Canlı konum takibi gerektiren uygulamalarımızda veriler yalnızca aktif oturum süresince şifreli kanallar (SSL/TLS) üzerinden anlık eşitleme için kullanılır. Oturum sonlandırıldığında konum verisi sunuculardan kalıcı olarak temizlenir.",
                    "aEN": "In applications requiring live location tracking, data is used only for real-time synchronization over encrypted channels (SSL/TLS) during an active session. Once the session ends, location data is permanently purged from servers."
                },
                {
                    "id": "faq-q-4-2",
                    "q": "Verilerim üçüncü taraflağırlığıa paylaşılıyor mu?",
                    "qEN": "Is my data shared with third parties?",
                    "a": "Kesinlikle hayır. Verileriniz hiçbir ticari amaçla satılmaz, reklam ağlarına aktarılmaz veya yetkisiz üçüncü taraflağırlığıa paylaşılmaz. Detaylı bilgi için Yasal Bilgiler sayfamızı ziyaret edebilirsiniz.",
                    "aEN": "Strictly no. Your data is never sold for commercial purposes, transferred to ad networks, or shared with unauthorized third parties. For detailed information, please visit our Legal Information page."
                }
            ]
        }
    ],
    "legal": {
        "privacy": {
            "lastUpdated": "7 Ağustos 2026",
            "content": [
                {
                    "id": "privacy-sec-1",
                    "heading": "1. Veri Sorumlusu ve Kapsam",
                    "headingEN": "1. Data Controller and Scope",
                    "text": "Bu Gizlilik Politikasıı, AVS&V9 bünyesinde geliştirilen ve yayınlanan tüm web siteleri, mobil uygulamalar (Android & iOS platformları) ve bağımsız dijital projeler için geçerlidir. Geliştirici olarak temel ilkemiz, kullanıcılarımızın kişisel verilerinin gizliliğini korumak, şeffaflık sağlamak ve uluslararası veri güvenliği standartlarına tam uyum göstermektir.",
                    "textEN": "This Privacy Policy applies to all websites, mobile applications (Android & iOS platforms), and independent digital projects developed and published under AVS&V9. As a developer, our core principle is to protect the privacy of user data, ensure transparency, and comply fully with international data security standards."
                },
                {
                    "id": "privacy-sec-2",
                    "heading": "2. Toplanan Veriler ve Kullanım Amaçları",
                    "headingEN": "2. Collected Data and Purposes of Use",
                    "text": "Uygulamalarımızın ve web sitemizin sunduğu hizmet türüne bağlı olarak yalnızca işlevsellik için zorunlu olan minimum seviyede veri işlenmektedir:<br>• <b>Konum Verisi (GPS):</b> V9 Kurye ve Grup Konum uygulamalarımızda harita üzeri canlı takip, rota çizimi ve grup üyelerinin anlık yerini göstermek amacıyla Ön Plan (Foreground) ve Arka Plan (Background) konum verisi işlenir.<br>• <b>Cihaz ve Bağlantı Bilgileri:</b> İşletim sistemi sürümü, cihaz modeli ve ağ durumu, uygulama stabilitesini artırmak ve teknik uyumsuzlukları çözmek amacıyla anonim olarak değerlendirilebilir.<br>• <b>Destek ve İletişim Verileri:</b> Sitedeki iletişim formu üzerinden tarafımıza ilettiğiniz ad, e-posta adresi ve mesaj metinleri yalnızca destek talebinizi yanıtlamak amacıyla kullanılır.",
                    "textEN": "Depending on the services offered by our applications and website, only the minimum data required for functionality is processed:<br>• <b>Location Data (GPS):</b> Foreground and Background location data is processed in map-based apps like V9 Courier and Group Location Sharing to show real-time positions, route drawing, and group tracking.<br>• <b>Device & Network Info:</b> OS version, device model, and network state may be anonymously evaluated to improve application stability and resolve technical bugs.<br>• <b>Support Data:</b> Name, email address, and message contents submitted via the contact form are used exclusively to respond to your inquiry."
                },
                {
                    "id": "privacy-sec-3",
                    "heading": "3. Üçüncü Taraf Hizmetler ve Google Gizlilik Politikasıı",
                    "headingEN": "3. Third-Party Services & Google Privacy Policy",
                    "text": "Projelerimiz; Google Play Hizmetleri (Google Play Services), Firebase (Crashlytics ve Performans İzleme) ile harita servislerini (Google Maps / Mapbox) kullanabilir. Bu entegrasyonlar, servis sağlayıcıların kendi gizlilik standartlarına tabidir. Google hizmetlerinin verileri nasıl topladığı ve işlediği hakkında daha fazla bilgi edinmek için resmi <a href=\"https://policies.google.com/privacy\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"legal-link\">Google Gizlilik Politikasıı (Google Privacy Policy)</a> sayfasını ziyaret edebilirsiniz.",
                    "textEN": "Our projects may utilize Google Play Services, Firebase (Crashlytics & Performance Monitoring), and mapping APIs (Google Maps / Mapbox). These integrations are subject to their respective providers' privacy policies. To learn more about how Google handles user data, please visit the official <a href=\"https://policies.google.com/privacy\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"legal-link\">Google Privacy Policy</a> page."
                },
                {
                    "id": "privacy-sec-4",
                    "heading": "4. Veri Saklama ve Güvenlik Önlemleri",
                    "headingEN": "4. Data Retention and Security Measures",
                    "text": "Canlı konum takibi esnasında işlenen GPS verileri sunucularımızda kalıcı olarak depolanmaz; yalnızca aktif oturum süresince anlık harita senkronizasyonu için işlenir ve oturum kapatıldığında bellekten temizlenir. Tüm veri iletimleri uçtan uca SSL/TLS şifreleme protokolleri ile güvence altına alınmıştır.",
                    "textEN": "GPS data processed during live tracking is not permanently stored on our servers; it is processed strictly for real-time map sync during active sessions and purged upon session termination. All data transmissions are secured using end-to-end SSL/TLS encryption protocols."
                },
                {
                    "id": "privacy-sec-5",
                    "heading": "5. Çocukların Gizliliği (Children's Privacy)",
                    "headingEN": "5. Children's Privacy",
                    "text": "Uygulamalarımız ve web sitemiz 13 yaşın altındaki çocuklardan bilerek kişisel veri toplamamaktadır. 13 yaşından küçük bir bireyin kişisel veri paylaştığını tespit etmemiz durumunda bu veriler derhal sunucularımızdan silinecektir.",
                    "textEN": "Our apps and website do not knowingly collect personal data from children under the age of 13. If we discover that a child under 13 has provided personal data, such information will be promptly purged from our systems."
                },
                {
                    "id": "privacy-sec-6",
                    "heading": "6. Haklarınız ve İletişim",
                    "headingEN": "6. Rights and Contact",
                    "text": "Kişisel verilerinize erişme, verilerinizin düzeltilmesini veya tamamen silinmesini talep etme hakkına sahipsiniz. Gizlilikpolitikamız veya kişisel verilerinizle ilgili tüm soru, talep ve bildirimleriniz için sayfanın altındaki iletişim butonunu kullanarak bize ulaşabilirsiniz.",
                    "textEN": "You have the right to access, rectify, or request the deletion of your personal data. For any questions, requests, or notifications regarding our privacy policy or personal data, you can reach out via the contact button at the bottom of the page."
                }
            ]
        },
        "terms": {
            "lastUpdated": "7 Ağustos 2026",
            "content": [
                {
                    "id": "terms-sec-1",
                    "heading": "1. Hizmet Şartları ve Kabul",
                    "headingEN": "1. Terms of Service and Acceptance",
                    "text": "Bu web sitesini veya AVS&V9 tarafından geliştirilen mobil uygulamaları kullanarak bu Kullanım Koşullarını kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen uygulamaları ve siteyi kullanmayınız.",
                    "textEN": "By using this website or mobile applications developed by AVS&V9, you agree to be bound by these Terms of Use. If you do not accept these terms, please refrain from using the applications and website."
                },
                {
                    "id": "terms-sec-2",
                    "heading": "2. Fikri Mülkiyet Hakları",
                    "headingEN": "2. Intellectual Property Rights",
                    "text": "Bu sitede ve uygulamalarda yer alan tüm yazılımlar, tasarım ögeleri, logolar, grafikler, metinler ve kod yapıları AVS&V9'a aittir. Açık kaynak lisansı (MIT, Apache vb.) açıkça belirtilmemiş içerikler izinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.",
                    "textEN": "All software, design elements, logos, graphics, texts, and code architectures on this site and within apps belong to AVS&V9. Unless explicitly licensed under an open-source framework (e.g. MIT, Apache), content may not be copied, reproduced, or commercially exploited without authorization."
                },
                {
                    "id": "terms-sec-3",
                    "heading": "3. Kullanım Kuralları ve Yükümlülükler",
                    "headingEN": "3. Rules of Conduct & User Obligations",
                    "text": "Kullanıcılar uygulamaları yasalara, genel ahlak kurallarına ve amacına uygun olarak kullanacağını taahhüt eder. Uygulamalar üzerinde tersine mühendislik (reverse engineering) yapmak, sistem güvenliğini ihlal etmeye çalışmak veya sunucu altyapısına aşırı yük bindirecek zarağırlığıı girişimlerde bulunmak kesinlikle yasaktır.",
                    "textEN": "Users agree to utilize applications in compliance with laws, ethics, and intended functionality. Attempting reverse engineering, security breaches, or malicious actions that overload server infrastructure is strictly prohibited."
                },
                {
                    "id": "terms-sec-4",
                    "heading": "4. Sorumluluk Sınırlaması",
                    "headingEN": "4. Limitation of Liability",
                    "text": "Hizmetlerimiz ve uygulamalarımız 'olduğu gibi' (AS IS) esasıyla sunulmaktadır. Uygulamaların her cihazda kesintisiz veya tamamen hatasız çalışacağı garanti edilmez. İnternet bağlantı kesintileri, cihaz uyumsuzlukları veya üçüncü taraf servis aksamalarından doğabilecek dolaylı zarağırlığıardan AVS&V9 sorumlu tutulamaz.",
                    "textEN": "Our services and applications are provided on an 'AS IS' basis. We do not guarantee uninterrupted or error-free operation on every device. AVS&V9 cannot be held liable for indirect damages arising from network disconnections, device incompatibilities, or third-party service outages."
                },
                {
                    "id": "terms-sec-5",
                    "heading": "5. Koşullarda Değişiklik Hakları",
                    "headingEN": "5. Right to Modify Terms",
                    "text": "AVS&V9, bu kullanım şartlarını ve yasal politikaları dilediği zaman güncelleme hakkını saklı tutar. Güncellenen maddeler sitede yayınlandığı andan itibaren yürürlüğe girer.",
                    "textEN": "AVS&V9 reserves the right to modify these terms and legal policies at any time. Modified terms take effect immediately upon being published on the site."
                }
            ]
        }
    },
    "socialFeed": {
        "lastUpdated": "2026-08-06 19:30",
        "posts": [
            {
                "id": "soc-yt-1",
                "platform": "youtube",
                "platformName": "YouTube",
                "author": "AVS&V9 Official",
                "title": "📍 Grup Konum V2 — Tanıtım Videosu",
                "description": "Low-latency GPS senkronizasyonu ve entegre sohbet özelliklerini gösteren detaylı tanıtım videosu.",
                "thumbnail": "resimler/sosyalmedya_post2.webp",
                "postUrl": "https://youtube.com",
                "date": "2026-08-05",
                "badgeColor": "#FF0000"
            },
            {
                "id": "soc-ig-1",
                "platform": "instagram",
                "platformName": "Instagram",
                "author": "@avsv9_dev",
                "title": "🚀 V9 Kurye — Geliştirme Süreci",
                "description": "Gerçek zamanlı harita entegrasyonunun sahne arkasına dair özel kareler ve teknik ayrıntılar.",
                "thumbnail": "resimler/sosyalmedya_post1.webp",
                "postUrl": "https://www.instagram.com/avs.v9",
                "date": "2026-08-04",
                "badgeColor": "#E1306C"
            },
            {
                "id": "soc-tt-1",
                "platform": "tiktok",
                "platformName": "TikTok",
                "author": "@avsv9_official",
                "title": "⚡ Yeni Güncelleme — Canlı Demo",
                "description": "Son güncellemeyle gelen yeni özelliklerin kısa ve eğlenceli tanıtım videosu.",
                "thumbnail": "resimler/sosyalmedya_post3.webp",
                "postUrl": "https://tiktok.com",
                "date": "2026-08-03",
                "badgeColor": "#00f2fe"
            },
            {
                "id": "soc-x-1",
                "platform": "x",
                "platformName": "X (Twitter)",
                "author": "@avsv9_dev",
                "title": "📣 V9 Harita Motoru Sürüm Notları",
                "description": "Yeni rota optimizasyon algoritması ve bellek iyileştirmeleri hakkında teknik güncellemeler yayınlandı.",
                "thumbnail": "resimler/sosyalmedya_post1.webp",
                "postUrl": "https://x.com",
                "date": "2026-08-02",
                "badgeColor": "#1DA1F2"
            }
        ]
    }
};
window.EMBEDDED_TRANSLATIONS = {
    "tr": {
        "nav.home": "Ana Sayfa",
        "nav.projects": "Projelerim",
        "nav.about": "Hakkında",
        "nav.contact": "İletişim",
        "nav.faq": "SSS",
        "nav.legal": "Yasal",
        "hero.title": "HOŞGELDİN YOLCU",
        "hero.subtitle": "Basit ama etkili yazılımlar, kullanıcı dostu deneyimler ve modern çözümlerle yolculuğumuza devam ediyoruz.",
        "hero.scroll": "Aşağı Kaydır",
        "projects.title": "Projelerim",
        "projects.intro": "Kullanıcı deneyimini ön planda tutan, sade tasarımlı ve işlevsel çözümler geliştirmeye odaklanıyorum.",
        "about.title": "Hakkında",
        "about.intro": "Projelerim, teknik beceri ve kullanıcı odaklı düşünce yapısının birleşimiyle ortaya çıkıyor.",
        "about.body1": "Teknolojiye duyduğum merak ve kişisel gelişim amacıyla başlayan bu yolculuk, bugün daha büyük hedeflere hizmet eden, sürdürülebilir ve güçlü projelere dönüştü. Sektör deneyimim, farklı bakış açılarım ve sürekli öğrenme tutkum, geliştirdiğim her çözümün temelini oluşturuyor.",
        "about.body2": "Amacım, karmaşık görünen fikirleri basit, hızlı ve etkili dijital deneyimlere dönüştürmek. Her proje, kullanıcıyla olan bağı güçlendiren ve gerçek bir ihtiyaca çözüm sunan bir yaklaşımla inşa ediliyor.",
        "about.skills": "💻 Beceriler & Uzmanlık Alanları",
        "contact.title": "İletişim",
        "contact.intro": "Projeler, fikirler veya işbirlikleri hakkında konuşmak isterseniz, bir mesaj bırakın.",
        "contact.name": "Adınız",
        "contact.email": "E-posta Adresiniz",
        "contact.message": "Mesajınız",
        "contact.send": "Mail Gönder",
        "detail.about": "📋 Uygulama Hakkında",
        "detail.requirements": "📱 Sistem Gereksinimleri",
        "detail.permissions": "🔐 Gerekli İzinler",
        "detail.changelog": "📝 Sürüm Geçmişi",
        "detail.getapp": "Google Play'den İndir",
        "detail.downloads": "İndirme",
        "detail.rating": "Puan",
        "detail.agerating": "Yaş",
        "detail.minandroid": "Minimum Android",
        "detail.connection": "Bağlantı",
        "detail.connval": "İnternet bağlantısı gerekli (Wi-Fi / Mobil veri)",
        "detail.size": "Boyut",
        "detail.perm.location": "Konum (Ön plan & Arka plan)",
        "detail.perm.notif": "Bildirimler",
        "detail.perm.net": "İnternet Erişimi",
        "detail.perm.bg": "Arka Plan Servisi",
        "detail.contactdev": "Geliştirici İletişim",
        "detail.subj.bug": "🐛 Hata Bildirimi",
        "detail.subj.feature": "💡 Özellik İsteği",
        "detail.subj.question": "❓ Soru",
        "detail.subj.other": "💬 Diğer",
        "detail.cta": "Farklı bir sorunuz mu var?",
        "detail.ctabtn": "Doğrudan İletişime Geçin →",
        "social.title": "Sosyal Medya",
        "social.intro": "Güncel paylaşımlar, uygulama duyuruları ve geliştirme sürecinden kareler.",
        "social.slide1.title": "🚀 V9 Kurye — Geliştirme Süreci",
        "social.slide1.desc": "Gerçek zamanlı harita entegrasyonunun sahne arkasına dair özel kareler ve teknik ayrıntılar.",
        "social.slide2.title": "📍 Grup Konum V2 — Tanıtım Videosu",
        "social.slide2.desc": "Low-latency GPS senkronizasyonu ve entegre sohbet özelliklerini gösteren tam tanıtım videosu.",
        "social.slide3.title": "⚡ Yeni Güncelleme — Canlı Demo",
        "social.slide3.desc": "Son güncellemeyle gelen yeni özelliklerin kısa ve eğlenceli tanıtım videosu.",
        "social.viewpost": "Gönderiyi İncele ↗",
        "social.follow": "Takip Et",
        "social.subscribe": "Abone Ol",
        "social.getapp": "Uygulamayı İndir",
        "faq.page.title": "Sıkça Sorulan Sorular",
        "faq.page.sub": "Uygulamalar hakkında merak edilen tüm sorular burada.",
        "legal.page.title": "Yasal Bilgiler",
        "legal.page.sub": "Gizlilik Politikamız ve Kullanım Koşullarımız.",
        "legal.tab.privacy": "Gizlilik Politikasıı",
        "legal.tab.terms": "Kullanım Koşulları"
    },
    "en": {
        "nav.home": "Home",
        "nav.projects": "Projects",
        "nav.about": "About",
        "nav.contact": "Contact",
        "nav.faq": "FAQ",
        "nav.legal": "Legal",
        "hero.title": "WELCOME, TRAVELLER",
        "hero.subtitle": "Simple yet powerful software, user-friendly experiences, and modern solutions — our journey continues.",
        "hero.scroll": "Scroll Down",
        "projects.title": "My Projects",
        "projects.intro": "Focused on developing clean, functional solutions that put user experience first.",
        "about.title": "About",
        "about.intro": "My projects are born from the combination of technical skill and a user-centred mindset.",
        "about.body1": "This journey began with a curiosity for technology and personal growth; today it has evolved into powerful, sustainable projects that serve greater goals. My industry experience, diverse perspectives, and constant drive to learn form the foundation of every solution I build.",
        "about.body2": "My goal is to transform seemingly complex ideas into simple, fast, and effective digital experiences. Every project is built on an approach that strengthens the bond with the user and is rooted in a real need.",
        "about.skills": "💻 Skills & Knowledge Areas",
        "contact.title": "Contact",
        "contact.intro": "If you would like to talk about projects, ideas, or collaborations, leave a message.",
        "contact.name": "Your Name",
        "contact.email": "Your Email Address",
        "contact.message": "Your Message",
        "contact.send": "Send Email",
        "detail.about": "📋 About the App",
        "detail.requirements": "📱 System Requirements",
        "detail.permissions": "🔐 Required Permissions",
        "detail.changelog": "📝 Release History",
        "detail.getapp": "Get it on Google Play",
        "detail.downloads": "Downloads",
        "detail.rating": "Rating",
        "detail.agerating": "Age",
        "detail.minandroid": "Minimum Android",
        "detail.connection": "Connection",
        "detail.connval": "Internet connection required (Wi-Fi / Mobile data)",
        "detail.size": "Size",
        "detail.perm.location": "Location (Foreground & Background)",
        "detail.perm.notif": "Notifications",
        "detail.perm.net": "Internet Access",
        "detail.perm.bg": "Background Service",
        "detail.contactdev": "Developer Contact",
        "detail.subj.bug": "🐛 Bug Report",
        "detail.subj.feature": "💡 Feature Request",
        "detail.subj.question": "❓ Question",
        "detail.subj.other": "💬 Other",
        "detail.cta": "Have a different question?",
        "detail.ctabtn": "Contact Directly →",
        "social.title": "Social Media",
        "social.intro": "Latest posts, app announcements, and behind-the-scenes of the development process.",
        "social.slide1.title": "🚀 V9 Courier — Development Process",
        "social.slide1.desc": "Exclusive behind-the-scenes shots and technical details of real-time map integration.",
        "social.slide2.title": "📍 Group Location V2 — Promo Video",
        "social.slide2.desc": "Full promotional video showcasing low-latency GPS synchronization and integrated chat features.",
        "social.slide3.title": "⚡ New Update — Live Demo",
        "social.slide3.desc": "A short and fun promo video of the new features coming with the latest update.",
        "social.viewpost": "View Post ↗",
        "social.follow": "Follow",
        "social.subscribe": "Subscribe",
        "social.getapp": "Download App",
        "faq.page.title": "Frequently Asked Questions",
        "faq.page.sub": "All your questions about the applications are here.",
        "legal.page.title": "Legal Information",
        "legal.page.sub": "Our Privacy Policy and Terms of Use.",
        "legal.tab.privacy": "Privacy Policy",
        "legal.tab.terms": "Terms of Use"
    }
};

// =============================================
// === AVS&V9 ANA SCRIPT (STABL & HATASIZ) ===
// =============================================

function sanitize(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function addSwipeListener(element, onSwipeLeft, onSwipeRight) {
    if (!element) return;
    let touchStartX = 0;
    let touchEndX = 0;
    element.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    element.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    function handleSwipe() {
        const threshold = 50;
        if (touchStartX - touchEndX > threshold && onSwipeLeft) onSwipeLeft();
        else if (touchEndX - touchStartX > threshold && onSwipeRight) onSwipeRight();
    }
}

// --- PERF-3: HERO SLIDER YNETCS ------------------------------------------

let _heroSlideInterval = null;

function startHeroSlider(slidesNodeList) {
    clearInterval(_heroSlideInterval);
    if (!slidesNodeList || slidesNodeList.length < 2) return;
    let cur = Array.from(slidesNodeList).findIndex(s => s.classList.contains('active'));
    if (cur < 0) cur = 0;

    function goNext() {
        slidesNodeList[cur].classList.remove('active');
        cur = (cur + 1) % slidesNodeList.length;
        slidesNodeList[cur].classList.add('active');
        startTimer();
    }
    function goPrev() {
        slidesNodeList[cur].classList.remove('active');
        cur = (cur - 1 + slidesNodeList.length) % slidesNodeList.length;
        slidesNodeList[cur].classList.add('active');
        startTimer();
    }
    function startTimer() {
        clearInterval(_heroSlideInterval);
        _heroSlideInterval = setInterval(goNext, 10000);
    }

    startTimer();

    const container = document.querySelector('.slider-container');
    if (container && !container.hasAttribute('data-swipe-added')) {
        addSwipeListener(container, goNext, goPrev);
        container.setAttribute('data-swipe-added', 'true');
    }
}


function getStatusTag(status) {
    const map = {
        'live': { cls: 'tag-live', text: '🟢 Yayında' },
        'development': { cls: 'tag-wip', text: '⏳ Geliştirme Aşamasında' },
        'completed': { cls: 'tag-completed', text: '✅ Tamamlandı' },
        'discontinued': { cls: 'tag-inactive', text: '❌ Yayından Kaldırılmış' },
        'paused': { cls: 'tag-soon', text: '⏸️ Geliştirme Durdurulmuş' },
        'research': { cls: 'tag-wip', text: '🔍 Araştırma Aşamasında' },
        'bugfix': { cls: 'tag-wip', text: '🛠️ Hata Düzeltme' },
        'waiting': { cls: 'tag-soon', text: '⏱ Beklemede' },
        'special': { cls: 'tag-wip', text: '⭐ Özel Durum' },
        'rnd': { cls: 'tag-wip', text: '🧪 Ar-Ge Aşamasında' }
    };
    return map[status] || { cls: '', text: String(status) };
}

let TRANSLATIONS = {};

async function loadTranslations() {
    try {
        const res = await fetch('data/translations.json', { cache: 'no-cache' });
        if (res.ok) {
            let text = await res.text();
            if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
            TRANSLATIONS = JSON.parse(text);
        } else {
            TRANSLATIONS = window.EMBEDDED_TRANSLATIONS || {};
        }
    } catch (e) {
        console.warn('translations.json fetch edilemedi, embedded fallback kullanılıyor:', e);
        TRANSLATIONS = window.EMBEDDED_TRANSLATIONS || {};
    }
    const savedLang = localStorage.getItem('avs_lang') || 'tr';
    applyLang(savedLang);
}


async function loadSiteData() {
    try {
        const res = await fetch(`data/site-data.json?t=${Date.now()}`, { cache: 'no-cache' });
        if (res.ok) {
            let text = await res.text();
            if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
            return JSON.parse(text);
        }
    } catch (e) {
        console.warn('site-data.json fetch edilemedi, embedded fallback kullanılıyor:', e);
    }
    return window.EMBEDDED_SITE_DATA || null;
}

function initDynamicHeroSlider(data) {
    const slides = data.heroSlider;
    if (!slides || !slides.length) return;
    const container = document.querySelector('.slider-container');
    if (!container) return;

    container.querySelectorAll('.slide').forEach(s => s.remove());

    slides
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach((slide, idx) => {
            const img = document.createElement('img');
            img.src = sanitize(slide.src);
            img.alt = sanitize(slide.alt || '');
            img.className = 'slide' + (idx === 0 ? ' active' : '');
            img.loading = idx === 0 ? 'eager' : 'lazy';
            container.appendChild(img);
        });

    startHeroSlider(container.querySelectorAll('.slide'));
}

function initDynamicProjectsList(data) {
    const projects = data.projects;
    if (!projects || !projects.length) return;

    const listContainer = document.querySelector('.projects-list');
    if (!listContainer) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';

    const visible = projects
        .filter(p => p.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (!visible.length) return;

    listContainer.innerHTML = visible.map((p, i) => {
        const statuses = p.statuses || (p.status ? [p.status] : []); const statusHTML = statuses.map(s => { const st = getStatusTag(s); return `<span class="${st.cls} tag">${st.text}</span>`; }).join('');
        const extraTags = p.tags || [];
        const name = (lang === 'en' && p.nameEN) ? p.nameEN : p.name;
        const desc = (lang === 'en' && p.shortDescEN) ? p.shortDescEN : (p.shortDesc || '');
        const detailLabel = lang === 'en' ? 'View Details' : 'Detayları İncele';
        return `
        <a href="proje-detay.html?p=${sanitize(p.slug)}" class="project-oval-box scroll-anim" aria-label="${sanitize(name)} Detayları">
            <img src="${sanitize(p.thumbnail)}" alt="${sanitize(name)}" class="project-oval-img" loading="${i === 0 ? 'eager' : 'lazy'}">
            <div class="project-oval-info">
                <div class="project-oval-title">${sanitize(name)}</div>
                <div class="project-oval-desc">${sanitize(desc)}</div>
                <div class="project-oval-tags">
                    ${statusHTML}
                    ${extraTags.map(t => `<span class="tag">📌 ${sanitize(t)}</span>`).join('')}
                </div>
            </div>
            <div class="project-oval-btn">${sanitize(detailLabel)}</div>
        </a>
        `;
    }).join('');

    const newItems = listContainer.querySelectorAll('.scroll-anim');
    if (window._scrollObserver) {
        newItems.forEach(item => window._scrollObserver.observe(item));
    }
}

function initDynamicSocialFeed(data) {
    if (!data || !data.socialFeed || !data.socialFeed.posts || !data.socialFeed.posts.length) return;
    const smSlider = document.getElementById('smSlider');
    if (!smSlider) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';

    const SVG_ICONS = {
        youtube: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        instagram: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
        x: `<svg class="sm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    };

    const BADGE_CLASSES = {
        youtube: 'sm-badge-youtube',
        instagram: 'sm-badge-instagram',
        tiktok: 'sm-badge-tiktok',
        x: 'sm-badge-x'
    };

    smSlider.innerHTML = data.socialFeed.posts.map(p => {
        const pKey = (p.platform || 'youtube').toLowerCase();
        const iconSvg = SVG_ICONS[pKey] || SVG_ICONS.youtube;
        const badgeCls = BADGE_CLASSES[pKey] || 'sm-badge-youtube';
        const fallbackSrc = 'resimler/Yakindabos.webp';
        return `
            <div class="sm-slide">
                <div class="sm-slide-img-wrap">
                    <img src="${sanitize(p.thumbnail)}" alt="${sanitize(p.title)}" loading="lazy"
                         onerror="this.onerror=null; this.src='${fallbackSrc}'">
                </div>
                <div class="sm-slide-body">
                    <div class="sm-platform-badge ${badgeCls}">
                        ${iconSvg}
                        ${sanitize(p.platformName || p.platform)}
                    </div>
                    <h3 class="sm-slide-title">${sanitize(p.title)}</h3>
                    <p class="sm-slide-desc">${sanitize(p.description)}</p>
                    <a href="${sanitize(p.postUrl)}" class="sm-slide-btn" target="_blank" rel="noopener noreferrer">
                        ${(lang === 'en' ? 'View Post ↗' : 'Gönderiyi İncele ↗')}
                    </a>
                </div>
            </div>
        `;
    }).join('');

    const smDots = document.getElementById('smDots');
    if (smDots) {
        smDots.innerHTML = data.socialFeed.posts.map((_, idx) => `
            <button class="sm-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}" role="tab"
                aria-selected="${idx === 0 ? 'true' : 'false'}" aria-label="Slayt ${idx + 1}"></button>
        `).join('');
    }
}

function initDynamicFaq(data) {

    const faq = data.faq;
    if (!faq || !faq.length) return;

    const main = document.querySelector('.subpage-main');
    if (!main) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';

    main.querySelectorAll('.faq-section-title, .faq-list-group, .faq-cta-card').forEach(el => el.remove());

    faq.forEach(cat => {
        if (!cat.questions || !cat.questions.length) return;

        const h2 = document.createElement('h2');
        h2.className = 'section-title faq-section-title';
        h2.textContent = (lang === 'en' && cat.categoryEN) ? cat.categoryEN : cat.category;
        main.appendChild(h2);

        const list = document.createElement('div');
        list.className = 'faq-list faq-list-group';

        cat.questions.forEach(item => {
            const qText = (lang === 'en' && item.qEN) ? item.qEN : item.q;
            const aText = (lang === 'en' && item.aEN) ? item.aEN : item.a;
            const div = document.createElement('div');
            div.className = 'faq-item';
            div.innerHTML = `
                <button class="faq-question">
                    ${sanitize(qText)}
                    <span class="faq-icon">»</span>
                </button>
                <div class="faq-answer">
                    <div class="faq-answer-inner">${sanitize(aText)}</div>
                </div>`;
            list.appendChild(div);
        });

        main.appendChild(list);
    });

    const cta = document.createElement('section');
    cta.className = 'pd-content-card faq-cta-card';
    const ctaTitle = lang === 'en' ? 'Did you not find what you were looking for?' : 'Aradığınız cevabı bulamadınız mı?';
    const ctaSub = lang === 'en' ? 'If you have a different question or a technical request, you can contact the developer directly.' : 'Farklı bir sorunuz veya teknik bir talebiniz varsa doğrudan geliştiriciye ulaşabilirsiniz.';
    const ctaBtn = lang === 'en' ? 'Contact Directly →' : 'Doğrudan İletişime Geçin →';
    cta.innerHTML = `
        <h3 class="faq-cta-title">${sanitize(ctaTitle)}</h3>
        <p class="faq-cta-sub">${sanitize(ctaSub)}</p>
        <a href="index.html#iletisim" class="oval-btn pd-cta-btn">${sanitize(ctaBtn)}</a>`;
    main.appendChild(cta);
}


function initDynamicLegal(data) {
    const legal = data.legal;
    if (!legal) return;

    const lang = localStorage.getItem('avs_lang') || 'tr';


    const ctaTitle = lang === 'en' ? 'Have Questions or Legal Inquiries?' : 'Yasal Konularda Sorunuz mu Var?';
    const ctaSub = lang === 'en' ? 'For data privacy requests or detailed inquiries, you can contact the developer directly.' : 'Kişisel veri talepleriniz veya detaylı yasal sorularınız için doğrudan iletişime geçebilirsiniz.';
    const ctaBtn = lang === 'en' ? 'Contact Directly →' : 'Doğrudan İletişime Geçin →';
    const ctaHtml = `
        <div class="pd-content-card faq-cta-card" style="margin-top: 30px;">
            <h3 class="faq-cta-title">${sanitize(ctaTitle)}</h3>
            <p class="faq-cta-sub">${sanitize(ctaSub)}</p>
            <a href="index.html#iletisim" class="oval-btn pd-cta-btn">${sanitize(ctaBtn)}</a>
        </div>`;

    // Gizlilik politikas
    const privSec = document.getElementById('panel-privacy');
    if (privSec && legal.privacy) {
        const dateEl = privSec.querySelector('.legal-date');
        if (dateEl && legal.privacy.lastUpdated) dateEl.textContent = (lang === 'en' ? `Last updated: ` : `Son güncelleme: `) + legal.privacy.lastUpdated;
        const contentEl = privSec.querySelector('.legal-content');
        if (contentEl && legal.privacy.content) {
            contentEl.innerHTML = legal.privacy.content.map(sec => `
                <h3>${sanitize((lang === 'en' && sec.headingEN) ? sec.headingEN : sec.heading)}</h3>
                <p>${(lang === 'en' && sec.textEN) ? sec.textEN : sec.text}</p>`).join('');

            privSec.querySelectorAll('.faq-cta-card').forEach(el => el.remove());
            privSec.insertAdjacentHTML('beforeend', ctaHtml);
        }
    }

    // Kullanm koullar
    const termsSec = document.getElementById('panel-terms');
    if (termsSec && legal.terms) {
        const dateEl = termsSec.querySelector('.legal-date');
        if (dateEl && legal.terms.lastUpdated) dateEl.textContent = (lang === 'en' ? `Last updated: ` : `Son güncelleme: `) + legal.terms.lastUpdated;
        const contentEl = termsSec.querySelector('.legal-content');
        if (contentEl && legal.terms.content) {
            contentEl.innerHTML = legal.terms.content.map(sec => `
                <h3>${sanitize((lang === 'en' && sec.headingEN) ? sec.headingEN : sec.heading)}</h3>
                <p>${(lang === 'en' && sec.textEN) ? sec.textEN : sec.text}</p>`).join('');


            termsSec.querySelectorAll('.faq-cta-card').forEach(el => el.remove());
            termsSec.insertAdjacentHTML('beforeend', ctaHtml);
        }
    }
}

// --- Tema ---
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('avs_theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// --- Dil ---
function applyLang(lang) {
    if (TRANSLATIONS && Object.keys(TRANSLATIONS).length > 0) {
        const t = TRANSLATIONS[lang] || TRANSLATIONS['tr'];
        if (t) {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (t[key] !== undefined) el.textContent = t[key];
            });
        }
    }
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang.toUpperCase();
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('avs_lang', lang);

    // DNAMK BLMLER F5 YAPMADAN RE-RENDER ET
    if (window.CURRENT_SITE_DATA) {
        const isIndex = !!document.querySelector('.slider-container');
        const isFaq = !!document.querySelector('.faq-list');
        const isLegal = !!document.getElementById('panel-privacy');
        const isProjectDetail = !!document.getElementById('pdAppSlider');

        if (isIndex) {
            initDynamicProjectsList(window.CURRENT_SITE_DATA);
            initDynamicSocialFeed(window.CURRENT_SITE_DATA);
        }
        if (isFaq) initDynamicFaq(window.CURRENT_SITE_DATA);
        if (isLegal) initDynamicLegal(window.CURRENT_SITE_DATA);
        if (isProjectDetail && window.CURRENT_PROJECT) {
            initProjectDetail(window.CURRENT_PROJECT);
        }
    }
}

function toggleLang() {
    const current = localStorage.getItem('avs_lang') || 'tr';
    applyLang(current === 'tr' ? 'en' : 'tr');
}

(function () {
    const savedTheme = localStorage.getItem('avs_theme') || 'dark';
    const savedLang = localStorage.getItem('avs_lang') || 'tr';
    applyTheme(savedTheme);
    applyLang(savedLang);
})();


function initApp() {
    loadTranslations(); // TRANSLATIONS'i yükle

    if (!document.documentElement.hasAttribute('data-admin-page')) {
        const isIndex = !!document.querySelector('.slider-container');
        if (isIndex) {
            const listContainer = document.querySelector('.projects-list');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div class="project-oval-box skeleton-box"></div>
                    <div class="project-oval-box skeleton-box"></div>
                    <div class="project-oval-box skeleton-box"></div>
                `;
            }
        }
        loadSiteData().then(data => {
            if (!data) return;
            window.CURRENT_SITE_DATA = data;


            const isIndex = !!document.querySelector('.slider-container');
            const isFaq = !!document.querySelector('.faq-list');
            const isLegal = !!document.getElementById('panel-privacy');
            const isProjectDetail = !!document.getElementById('pdAppSlider');

            if (isIndex) {
                initDynamicHeroSlider(data);
                initDynamicProjectsList(data);
                initDynamicSocialFeed(data);
            }
            if (isFaq) initDynamicFaq(data);
            if (isLegal) initDynamicLegal(data);

            if (isProjectDetail && data.projects && data.projects.length > 0) {
                const params = new URLSearchParams(window.location.search);
                const projKey = params.get('p');
                if (!projKey) {
                    window.location.href = 'index.html';
                    return;
                }
                const proj = data.projects.find(p => p.slug === projKey || p.id === projKey);

                if (!proj) {
                    window.location.href = 'index.html';
                    return;
                }
                window.CURRENT_PROJECT = proj;
                if (proj) initProjectDetail(proj);
            }
        });
    }


    const themeToggleBtn = document.getElementById('themeToggle');
    const langToggleBtn = document.getElementById('langToggle');

    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    if (banner && localStorage.getItem('avs_cookie_accepted') !== 'true') {
        setTimeout(() => banner.classList.add('visible'), 1200);
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('avs_cookie_accepted', 'true');
                banner.classList.remove('visible');
            });
        }
    }


    const staticSlides = document.querySelectorAll('.slide');
    if (staticSlides.length > 0) {

        startHeroSlider(staticSlides);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(_heroSlideInterval);
            } else {
                startHeroSlider(document.querySelectorAll('.slide'));
            }
        });
    }

    // --- HAMBURGER MOBL MEN ---
    document.addEventListener('click', e => {
        const burgerBtn = e.target.closest('.hamburger');
        if (burgerBtn) {
            const nav = burgerBtn.parentElement ? burgerBtn.parentElement.querySelector('.nav-links') : document.querySelector('.nav-links');
            if (nav) {
                const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
                burgerBtn.classList.toggle('active', !isOpen);
                nav.classList.toggle('active', !isOpen);
                burgerBtn.setAttribute('aria-expanded', String(!isOpen));
            }
            return;
        }

        const link = e.target.closest('.nav-links a');
        if (link) {
            const nav = link.closest('.nav-links');
            if (nav) {
                nav.classList.remove('active');
                const burger = nav.parentElement ? nav.parentElement.querySelector('.hamburger') : document.querySelector('.hamburger');
                if (burger) {
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                }
            }
        }
    });

    // --- SCROLL ANMASYONLARI ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '-50px', threshold: 0.15 });


    window._scrollObserver = observer;
    document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));


    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    if (sections.length && navAnchors.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(sec => navObserver.observe(sec));
    }

    // --- FORM DORULAMA (letiim) ---
    const contactNameInput = document.getElementById('contactName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactMessageInput = document.getElementById('contactMessage');
    const nameField = document.getElementById('nameField');
    const emailField = document.getElementById('emailField');
    const messageField = document.getElementById('messageField');
    const nameHint = document.getElementById('nameHint');
    const emailHint = document.getElementById('emailHint');
    const messageHint = document.getElementById('messageHint');

    function setFieldState(fieldEl, hintEl, isValid, message) {
        if (!fieldEl || !hintEl) return;
        fieldEl.classList.remove('valid', 'invalid');
        if (isValid === true) fieldEl.classList.add('valid');
        if (isValid === false) fieldEl.classList.add('invalid');
        hintEl.textContent = message;
    }

    function validateName() {
        if (!contactNameInput) return true;
        const val = contactNameInput.value.trim();
        if (val.length === 0) { setFieldState(nameField, nameHint, null, ''); return false; }
        if (val.length < 2) { setFieldState(nameField, nameHint, false, 'En az 2 karakter giriniz.'); return false; }
        setFieldState(nameField, nameHint, true, '✓ Güzel!');
        return true;
    }

    function validateEmail() {
        if (!contactEmailInput) return true;
        const val = contactEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val.length === 0) { setFieldState(emailField, emailHint, null, ''); return false; }
        if (!emailRegex.test(val)) { setFieldState(emailField, emailHint, false, 'Geçerli bir e-posta adresi girin.'); return false; }
        setFieldState(emailField, emailHint, true, '✓ E-posta adresi geçerli.');
        return true;
    }

    function validateMessage() {
        if (!contactMessageInput) return true;
        const val = contactMessageInput.value.trim();
        if (!messageField || !messageHint) return true;
        if (val.length === 0) { setFieldState(messageField, messageHint, null, ''); return false; }
        if (val.length < 5) { setFieldState(messageField, messageHint, false, 'Mesajınızı biraz daha uzun yazın.'); return false; }
        setFieldState(messageField, messageHint, true, '✓ Hazır!');
        return true;
    }

    if (contactNameInput) contactNameInput.addEventListener('input', validateName);
    if (contactEmailInput) contactEmailInput.addEventListener('input', validateEmail);
    if (contactMessageInput) contactMessageInput.addEventListener('input', validateMessage);


    function setupMathCaptcha({ questionEl, inputEl, iconEl, statusEl, onVerifySuccess }) {
        let correctAnswer = null;
        let isVerified = false;

        function generate() {
            const x = Math.floor(Math.random() * 10) + 1;
            const y = Math.floor(Math.random() * 10) + 1;
            correctAnswer = x + y;
            isVerified = false;
            if (questionEl) questionEl.textContent = `${x} + ${y} = ?`;
            if (inputEl) { inputEl.value = ''; inputEl.className = 'math-input'; }
            if (iconEl) iconEl.textContent = '';
            if (statusEl) statusEl.textContent = 'Sonucu yazın ve devam edin.';
        }

        if (inputEl) {
            inputEl.addEventListener('input', () => {
                const val = parseInt(inputEl.value, 10);
                if (inputEl.value === '' || isNaN(val)) {
                    inputEl.className = 'math-input';
                    if (iconEl) iconEl.textContent = '';
                    if (statusEl) statusEl.textContent = 'Sonucu yazın ve devam edin.';
                    isVerified = false;
                    return;
                }
                if (val === correctAnswer) {
                    inputEl.className = 'math-input correct';
                    if (iconEl) { iconEl.textContent = '✓'; iconEl.style.color = '#2ecc71'; }
                    if (statusEl) statusEl.textContent = '✓ Doğru! Yönlendiriliyorsunuz...';
                    isVerified = true;
                    setTimeout(() => { if (onVerifySuccess) onVerifySuccess(); }, 600);
                } else {
                    inputEl.className = 'math-input wrong';
                    if (iconEl) { iconEl.textContent = '✗'; iconEl.style.color = '#e74c3c'; }
                    if (statusEl) statusEl.textContent = 'Yanlış cevap! Soru yenileniyor...';
                    isVerified = false;
                    setTimeout(generate, 800);
                }
            });
        }

        return {
            generate,
            reset: () => { isVerified = false; },
            isVerified: () => isVerified
        };
    }


    const contactButton = document.getElementById('contactButton');
    const verificationModal = document.getElementById('verificationModal');
    const verifyButton = document.getElementById('verifyButton');
    const cancelButton = document.getElementById('cancelButton');
    const contactStatus = document.getElementById('contactStatus');
    const captchaStatus = document.getElementById('captchaStatus');
    const mathQuestion = document.getElementById('mathQuestion');
    const mathAnswerInput = document.getElementById('mathAnswer');
    const mathCheckIcon = document.getElementById('mathCheckIcon');

    const contactCaptcha = setupMathCaptcha({
        questionEl: mathQuestion,
        inputEl: mathAnswerInput,
        iconEl: mathCheckIcon,
        statusEl: captchaStatus,
        onVerifySuccess: completeVerification
    });

    function lockScroll() {
        document.body.classList.add('modal-open');
    }

    function unlockScroll() {
        setTimeout(() => {
            const hasActiveModal = document.querySelector('.verification-modal.active, .pgallery-overlay.open');
            if (!hasActiveModal) {
                document.body.classList.remove('modal-open');
            }
        }, 50);
    }

    function openVerificationModal() {
        if (!verificationModal) return;
        contactCaptcha.generate();
        verificationModal.classList.add('active');
        verificationModal.setAttribute('aria-hidden', 'false');
        lockScroll();
        try { verificationModal.removeAttribute('inert'); } catch (e) { }
        setTimeout(() => { if (mathAnswerInput) mathAnswerInput.focus(); }, 150);
    }

    function closeVerificationModal() {
        if (!verificationModal) return;
        verificationModal.classList.remove('active');
        verificationModal.setAttribute('aria-hidden', 'true');
        unlockScroll();
        try { verificationModal.setAttribute('inert', ''); } catch (e) { }
        contactCaptcha.reset();
    }

    function completeVerification() {
        closeVerificationModal();

        const name = contactNameInput ? contactNameInput.value.trim() : '';
        const email = contactEmailInput ? contactEmailInput.value.trim() : '';
        const message = contactMessageInput ? contactMessageInput.value.trim() : '';
        const rawEmail = atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==');
        const subject = encodeURIComponent(`Portfolyo Iletisim - ${name}`);
        const body = encodeURIComponent(`Merhaba,\n\nAdim: ${name}\nE-postam: ${email}\n\nMesajim:\n${message}`);
        const mailtoUrl = `mailto:${rawEmail}?subject=${subject}&body=${body}`;

        if (contactStatus) {

            contactStatus.innerHTML = `
                <div class="mail-success-card">
                    <p class="mail-success-title">✅ Güvenlik Doğrulaması Başarılı!</p>
                    <p class="mail-success-sub">Mesajınız e-posta istemcinize aktarıldı. Otomatik açılmadıysa aşağıdaki butona basabilir veya adrese doğrudan mail atabilirsiniz:</p>
                    <div class="mail-success-actions">
                        <a href="${mailtoUrl}" class="mail-direct-btn">✉️ E-postayı Gönder (${rawEmail})</a>
                        <button type="button" class="mail-copy-btn" id="mailCopyBtn">📋 Adresi Kopyala</button>
                    </div>
                </div>
            `;

            const copyBtn = document.getElementById('mailCopyBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(rawEmail).then(() => {
                        copyBtn.textContent = '✓ Kopyalandı!';
                        setTimeout(() => { copyBtn.textContent = '📋 Adresi Kopyala'; }, 2000);
                    }).catch(() => {
                        copyBtn.textContent = rawEmail;
                    });
                });
            }
        }

        try {
            const mailLink = document.createElement('a');
            mailLink.href = mailtoUrl;
            mailLink.style.display = 'none';
            document.body.appendChild(mailLink);
            mailLink.click();
            document.body.removeChild(mailLink);
        } catch (err) {
            console.error('Mailto hatası:', err);
        }
    }

    if (verifyButton) verifyButton.addEventListener('click', () => { if (contactCaptcha.isVerified()) completeVerification(); else if (captchaStatus) captchaStatus.textContent = 'Lütfen soruyu doğru cevaplayın.'; });
    if (cancelButton) cancelButton.addEventListener('click', closeVerificationModal);
    if (verificationModal) verificationModal.addEventListener('click', e => { if (e.target === verificationModal) closeVerificationModal(); });

    if (contactButton) {
        contactButton.addEventListener('click', () => {
            const nameOk = validateName();
            const emailOk = validateEmail();
            const messageOk = validateMessage();

            if (!nameOk && contactNameInput && contactNameInput.value.trim().length === 0)
                setFieldState(nameField, nameHint, false, 'Lütfen adınızı girin.');
            if (!emailOk && contactEmailInput && contactEmailInput.value.trim().length === 0)
                setFieldState(emailField, emailHint, false, 'Lütfen e-posta adresinizi girin.');
            if (!messageOk && contactMessageInput && contactMessageInput.value.trim().length === 0)
                setFieldState(messageField, messageHint, false, 'Lütfen mesajınızı girin.');

            if (nameOk && emailOk && messageOk) openVerificationModal();
        });
    }

    document.addEventListener('click', e => {
        const card = e.target.closest('.bento-card[data-href]');
        if (card) {
            if (e.target.closest('.bento-detail-btn')) return;
            window.location.href = card.dataset.href;
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('.bento-card[data-href]');
            if (card && (e.target === card || e.target.closest('.bento-card') === card)) {
                if (e.target.closest('.bento-detail-btn')) return;
                e.preventDefault();
                window.location.href = card.dataset.href;
            }
        }
    });

    // --- SSS & CHANGELOG AKORDYON ---
    document.addEventListener('click', e => {
        const btn = e.target.closest('.faq-question');
        if (!btn) return;

        const item = btn.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('open');
        const container = item.closest('.faq-list') || item.parentElement;

        if (container) {
            container.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) openItem.classList.remove('open');
            });
        }

        item.classList.toggle('open', !isOpen);
    });

    // --- YASAL SEKMELER (yasal.html) ---
    document.querySelectorAll('.legal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.legal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });

    // --- SOSYAL MEDYA SLIDER ---
    const smSlider = document.getElementById('smSlider');
    if (smSlider) {
        const smSlides = Array.from(smSlider.querySelectorAll('.sm-slide'));
        const smDotsEl = document.getElementById('smDots');
        const smDots = smDotsEl ? Array.from(smDotsEl.querySelectorAll('.sm-dot')) : [];
        const smPrev = document.getElementById('smPrev');
        const smNext = document.getElementById('smNext');
        let smCurrent = 0;
        let smTimer = null;

        if (smSlides[0]) smSlides[0].classList.add('active');

        function smGoTo(idx, direction = 'next') {
            if (idx === smCurrent) return;
            const prev = smCurrent;
            smCurrent = (idx + smSlides.length) % smSlides.length;

            smSlides[prev].classList.add(direction === 'next' ? 'exit-left' : 'exit-right');
            smSlides[prev].classList.remove('active');

            requestAnimationFrame(() => { smSlides[smCurrent].classList.add('active'); });

            setTimeout(() => {
                smSlides[prev].classList.remove('exit-left', 'exit-right');
            }, 560);

            smDots.forEach((d, i) => {
                d.classList.toggle('active', i === smCurrent);
                d.setAttribute('aria-selected', String(i === smCurrent));
            });
        }

        function smGoNext() { smGoTo((smCurrent + 1) % smSlides.length, 'next'); }
        function smGoPrev() { smGoTo((smCurrent - 1 + smSlides.length) % smSlides.length, 'prev'); }

        function smStartTimer() {
            clearInterval(smTimer);
            smTimer = setInterval(smGoNext, 10000);
        }

        smStartTimer();

        if (smPrev) smPrev.addEventListener('click', () => { smGoPrev(); smStartTimer(); });
        if (smNext) smNext.addEventListener('click', () => { smGoNext(); smStartTimer(); });

        const smContainer = document.querySelector('.sm-slider-container');
        if (smContainer) {
            addSwipeListener(smContainer,
                () => { smGoNext(); smStartTimer(); },
                () => { smGoPrev(); smStartTimer(); }
            );
        }

        smDots.forEach((dot, i) => {
            dot.addEventListener('click', () => { smGoTo(i, i > smCurrent ? 'next' : 'prev'); smStartTimer(); });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(smTimer);
            else smStartTimer();
        });
    }

    // --- PROJE DETAY SAYFASI DNAMK VER HARTASI ---
    function initProjectDetail(proj) {
        if (!proj) return;
        window.CURRENT_PROJECT = proj;
        const lang = localStorage.getItem('avs_lang') || 'tr';
        const detail = proj.detail || {};

        const name = lang === 'en' ? (proj.nameEN || proj.name || 'Project Details') : (proj.name || 'Proje Detayları');
        const desc = lang === 'en' ? (proj.shortDescEN || proj.shortDesc || '') : (proj.shortDesc || '');


        document.title = `${name} | AVS&V9`;
        const bc = document.getElementById('pdBreadcrumbName');
        if (bc) bc.textContent = name;


        const pdTitle = document.getElementById('pdAppName');
        if (pdTitle) pdTitle.textContent = name;


        const logoEl = document.getElementById('pdAppLogo');
        if (logoEl) {
            logoEl.src = detail.logo || proj.logo || 'resimler/uygulama_logo.webp';
            logoEl.alt = name;
        }

        // Stats
        const dlEl = document.getElementById('pdDownloads');
        if (dlEl) dlEl.textContent = detail.downloads || 'N/A';

        const ratingEl = document.getElementById('pdRating');
        if (ratingEl) ratingEl.textContent = detail.rating || 'N/A';

        const ageEl = document.getElementById('pdAgeRating');
        if (ageEl) ageEl.textContent = detail.ageRating || detail.age || '3+';


        const isAndroid = detail.isAndroid === true;
        const isPlayStoreEnabled = detail.playStoreEnabled === true;
        const showAndroidReqs = isAndroid && isPlayStoreEnabled;


        const badgeContainer = document.getElementById('pdStatusBadgeContainer');
        if (badgeContainer) {
            let statuses = proj.statuses || (proj.status ? [proj.status] : []);
            let trStatus = detail.statusText || proj.statusText || '';
            let enStatus = detail.statusTextEN || proj.statusTextEN || '';

            badgeContainer.innerHTML = statuses.map(s => {
                let cls = 'pd-status-badge';
                if (s === 'inactive' || s === 'discontinued') cls += ' inactive';
                else if (s === 'wip' || s === 'paused' || s === 'waiting' || s === 'research' || s === 'development') cls += ' wip';
                let text = '';
                if (trStatus && statuses.length === 1 && s === proj.status) {
                    text = lang === 'en' ? enStatus : trStatus;
                } else {
                    text = getStatusTag(s).text;
                }
                return `<div class="${cls}"><span>${escapeHTML(text)}</span></div>`;
            }).join('');
        }

        const playStoreUrl = detail.playStoreUrl || proj.playUrl || '';
        const hasPlayUrl = playStoreUrl && playStoreUrl !== '#' && playStoreUrl.trim().length > 0;

        const plinkEl = document.getElementById('pdPlayStoreLink');
        if (plinkEl) {
            if (showAndroidReqs && hasPlayUrl) {
                plinkEl.style.display = 'inline-flex';
                plinkEl.href = playStoreUrl;
            } else {
                plinkEl.style.display = 'none';
            }
        }

        const storeStats = document.querySelector('.pd-store-stats');
        if (storeStats) {
            if (!showAndroidReqs) {
                storeStats.style.display = 'none';
            } else {
                storeStats.style.display = 'flex';
            }
        }


        const reqGrid = document.querySelector('.pd-req-grid');
        const reqBoxes = document.querySelectorAll('.pd-req-box');
        if (showAndroidReqs) {
            if (reqGrid) {
                const reqSection = reqGrid.closest('.pd-section');
                if (reqSection) reqSection.style.display = 'block';
                reqGrid.style.display = 'grid';
            }
            reqBoxes.forEach(b => b.style.display = 'block');
        } else {
            if (reqGrid) {
                const reqSection = reqGrid.closest('.pd-section');
                if (reqSection) reqSection.style.display = 'none';
                reqGrid.style.display = 'none';
                reqGrid.innerHTML = ''; // Aggressive clear to prevent DOM leaks
            }
            reqBoxes.forEach(b => b.style.display = 'none');


            const fallbackReq = document.getElementById('pdReqList');
            if (fallbackReq && fallbackReq.parentElement) fallbackReq.parentElement.style.display = 'none';
            const fallbackPerm = document.getElementById('pdPermList');
            if (fallbackPerm && fallbackPerm.parentElement) fallbackPerm.parentElement.style.display = 'none';
        }

        const minEl = document.getElementById('pdMinAndroid');
        if (minEl) minEl.textContent = detail.minAndroid || 'Android 8.0+';

        const sizeEl = document.getElementById('pdAppSize');
        if (sizeEl) sizeEl.textContent = detail.appSize || proj.size || '~15 MB';

        const permEl = document.getElementById('pdPermList');
        const permsArr = detail.permissions || proj.perms || [];
        if (permEl) {
            if (permsArr.length > 0) {
                permEl.innerHTML = permsArr.map(p => `<span class="pd-tag">📌 ${escapeHTML(p)}</span>`).join('');
            } else {
                permEl.innerHTML = `<span class="pd-tag">${lang === 'en' ? 'No special permissions required' : 'Özel izin gerektirmez'}</span>`;
            }
        }


        const descEl = document.getElementById('pdDescription');
        let rawDesc = (lang === 'en' && detail.descriptionEN && detail.descriptionEN.length) ? detail.descriptionEN : (detail.description && detail.description.length ? detail.description : desc);
        if (typeof rawDesc === 'string') {
            rawDesc = rawDesc.split('\n\n').map(s => s.trim()).filter(Boolean);
        }
        if (descEl) {
            if (Array.isArray(rawDesc) && rawDesc.length > 0) {
                descEl.innerHTML = rawDesc.map(p => `<p>${escapeHTML(p)}</p>`).join('');
            } else if (desc) {
                descEl.innerHTML = `<p>${escapeHTML(desc)}</p>`;
            } else {
                descEl.innerHTML = '';
            }
        }

        // Changelog
        const changelogEl = document.getElementById('pdChangelog');
        const clData = detail.changelog || [];
        if (changelogEl) {
            if (clData && clData.length > 0) {
                changelogEl.innerHTML = clData.map(c => {
                    const cTitle = lang === 'en' && c.titleEN ? c.titleEN : (c.title || '');
                    const features = lang === 'en' && c.featuresEN ? c.featuresEN : (c.features || c.notes || []);
                    const fixes = lang === 'en' && c.fixesEN ? c.fixesEN : (c.fixes || []);
                    const featStr = features.length ? `<p class="cl-subtitle">✨ ${lang === 'en' ? 'New Features' : 'Yeni Özellikler'}</p><ul>${features.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';
                    const bugStr = fixes.length ? `<p class="cl-subtitle">🐛 ${lang === 'en' ? 'Bug Fixes' : 'Hata Düzeltmeleri'}</p><ul>${fixes.map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>` : '';

                    const typeMap = {
                        major: { tr: '🔴 Büyük Güncelleme', en: '🔴 Major Update', color: '#ff4757' },
                        minor: { tr: '🔵 Küçük Güncelleme', en: '🔵 Minor Update', color: '#3742fa' },
                        fix: { tr: '🟢 Hata Düzeltme', en: '🟢 Bug Fix', color: '#2ed573' },
                        feature: { tr: '🟣 Özellik', en: '🟣 Feature', color: '#9b59b6' },
                        initial: { tr: '🟡 İlk Sürüm', en: '🟡 Initial Release', color: '#f1c40f' }
                    };
                    const cType = c.type && typeMap[c.type] ? typeMap[c.type] : null;
                    const typeBadge = cType ? `<span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${cType.color}15; color: ${cType.color}; border: 1px solid ${cType.color}40; margin-left: 8px;">${lang === 'en' ? cType.en : cType.tr}</span>` : '';

                    return `
                <div class="faq-item">
                    <button class="faq-question">
                        <span>${escapeHTML(c.version || '')} ${typeBadge} ${cTitle ? '- ' + escapeHTML(cTitle) : ''}</span>
                        <span class="cl-date">${escapeHTML(c.date || '')}</span>
                        <span class="faq-icon">▼</span>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer-inner">
                            ${featStr}
                            ${bugStr}
                        </div>
                    </div>
                </div>`;
                }).join('');
            } else {
                changelogEl.innerHTML = `<p style="color:var(--text-secondary); padding: 12px 0;">${lang === 'en' ? 'No release history published for this project yet.' : 'Bu proje için henüz sürüm geçmişi yayınlanmadı.'}</p>`;
            }
        }

        // Screenshots / Slider
        const pdAppSlider = document.getElementById('pdAppSlider');
        const slides = detail.screenshots || proj.slides || [];
        if (pdAppSlider) {
            if (slides && slides.length > 0) {
                pdAppSlider.innerHTML = slides.map((src, i) =>
                    `<div class="pd-app-slide${i === 0 ? ' active' : ''}">
                   <img src="${src}" alt="${escapeHTML(name)} Screen ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" title="${lang === 'en' ? 'Click to zoom' : 'Büyütmek için tıklayın'}">
                 </div>`
                ).join('');
            } else {
                pdAppSlider.innerHTML = '';

                const sliderSection = pdAppSlider.closest('.pd-section');
                if (sliderSection) sliderSection.style.display = 'none';
            }
        }
    }

    // --- Proje Detay Feedback / E-posta Gnderimi (pdSendBtn) ---
    const pdSendBtn = document.getElementById('pdSendBtn');
    const pdVerifyModal = document.getElementById('pdVerifyModal');
    const pdMathQ = document.getElementById('pdMathQ');
    const pdMathA = document.getElementById('pdMathA');
    const pdMathIcon = document.getElementById('pdMathIcon');
    const pdCapStatus = document.getElementById('pdCaptchaStatus');
    const pdVerifyBtn = document.getElementById('pdVerifyBtn');
    const pdCancelBtn = document.getElementById('pdCancelBtn');
    const pdStatus = document.getElementById('pdStatus');

    const pdCaptcha = setupMathCaptcha({
        questionEl: pdMathQ,
        inputEl: pdMathA,
        iconEl: pdMathIcon,
        statusEl: pdCapStatus,
        onVerifySuccess: completePdVerify
    });

    function closePdModal() {
        if (!pdVerifyModal) return;
        pdVerifyModal.classList.remove('active');
        pdVerifyModal.setAttribute('aria-hidden', 'true');
        unlockScroll();
        try { pdVerifyModal.setAttribute('inert', ''); } catch (e) { }
        pdCaptcha.reset();
    }

    function completePdVerify() {
        closePdModal();
        const name = document.getElementById('pdName')?.value.trim() || 'İsimsiz';
        const email = document.getElementById('pdEmail')?.value.trim() || '';
        const subj = document.getElementById('pdSubject')?.value || 'diğer';
        const msg = document.getElementById('pdMessage')?.value.trim() || '';

        const mailtoUrl = `mailto:${atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==')}?subject=${encodeURIComponent(`[AVS&V9 - ${subj.toUpperCase()}] ${name}`)}&body=${encodeURIComponent(`Gönderen: ${name}\nE-posta: ${email}\n\nMesaj:\n${msg}`)}`;
        window.location.href = mailtoUrl;

        if (pdStatus) {
            pdStatus.style.display = 'block';
            pdStatus.innerHTML = `
                <div style="background: rgba(0,173,181,0.08); border: 1px solid var(--accent-color); border-radius: 16px; padding: 16px; margin-top: 14px; text-align: left;">
                    <p style="margin: 0 0 8px; color: var(--accent-color); font-weight: 700;">✓ E-posta istemciniz açıldı!</p>
                    <p style="margin: 0 0 8px; font-size: 0.85rem; color: var(--text-secondary);">Açılmadıysa doğrudan e-posta atabilirsiniz: <strong>${atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ==')}</strong></p>
                    <button type="button" id="copyPdMailBtn" class="bento-detail-btn" style="font-size: 0.78rem; padding: 5px 12px;">📋 E-postayı Kopyala</button>
                </div>
            `;
            const copyBtn = document.getElementById('copyPdMailBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(atob('YWd2cnNwLnY5QGdtYWlsLmNvbQ=='));
                    copyBtn.textContent = '✓ Kopyalandı!';
                    setTimeout(() => { copyBtn.textContent = '📋 E-postayı Kopyala'; }, 2000);
                });
            }
        }
    }

    if (pdSendBtn) {
        pdSendBtn.addEventListener('click', () => {
            const name = document.getElementById('pdName')?.value.trim();
            const email = document.getElementById('pdEmail')?.value.trim();
            const msg = document.getElementById('pdMessage')?.value.trim();

            if (!name || !email || !msg) {
                if (pdStatus) {
                    pdStatus.style.display = 'block';
                    pdStatus.innerHTML = `<span style="color: #e74c3c;">Lütfen tüm gerekli alanları (Ad, E-posta, Mesaj) doldurun.</span>`;
                }
                return;
            }

            if (!pdVerifyModal) return;
            pdCaptcha.generate();
            pdVerifyModal.classList.add('active');
            pdVerifyModal.setAttribute('aria-hidden', 'false');
            lockScroll();
            try { pdVerifyModal.removeAttribute('inert'); } catch (e) { }
            setTimeout(() => { if (pdMathA) pdMathA.focus(); }, 150);
        });
    }

    if (pdCancelBtn) pdCancelBtn.addEventListener('click', closePdModal);
    if (pdVerifyBtn) {
        pdVerifyBtn.addEventListener('click', () => {
            if (pdCaptcha.isVerified()) completePdVerify();
            else if (pdCapStatus) pdCapStatus.textContent = 'Lütfen soruyu doğru cevaplayın.';
        });
    }

} // End of initApp

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// --- GLOBAL DELEGATED CLICK LISTENERS (BLSEL BAIMSIZLIK) ----------------
document.addEventListener('click', e => {
    const themeBtn = e.target.closest('#themeToggle');
    if (themeBtn) {
        toggleTheme();
        return;
    }
    const langBtn = e.target.closest('#langToggle');
    if (langBtn) {
        toggleLang();
        return;
    }
    const legalTabBtn = e.target.closest('.legal-tab-btn');
    if (legalTabBtn) {
        const target = legalTabBtn.dataset.tab;
        document.querySelectorAll('.legal-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('active'));
        legalTabBtn.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
        return;
    }
});


// --- RECOVERED FUNCTIONS ---


document.addEventListener('click', e => {
    const scrollInd = e.target.closest('.scroll-indicator');
    if (scrollInd) {
        const projSec = document.getElementById('projeler');
        if (projSec) {
            projSec.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }
});


document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute('href').length > 1) {
        const targetId = anchor.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            e.preventDefault();
            targetSection.scrollIntoView({ behavior: 'smooth' });


            const nav = anchor.closest('.nav-links');
            if (nav) {
                nav.classList.remove('active');
                const burger = document.querySelector('.hamburger');
                if (burger) {
                    burger.classList.remove('active');
                    burger.setAttribute('aria-expanded', 'false');
                }
            }
        }
    }
});


document.addEventListener('click', e => {
    const smCard = e.target.closest('.sm-card[href="#"]');
    if (smCard) {
        e.preventDefault();
    }
});

