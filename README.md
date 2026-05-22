# Payvandchi va gazpayvandchi imtihon platformasi

GitHub Pages uchun tayyor statik web-platforma.

## Kirish paroli
Admin parol: `17011995`

## Funksiyalar
- Admin parol oynasi
- Payvandchi va gazpayvandchi rollari
- Ro‘yxatdan o‘tish: ism, familiya, korxona, lavozim, uchastka
- Kamera orqali xodim yuzini rasmga olish
- 15 daqiqalik test
- Har bir xodimga 20 ta savol:
  - 14 ta kasbiy savol
  - 2 ta mehnat muhofazasi
  - 2 ta yong‘in xavfsizligi
  - 2 ta elektr xavfsizligi
- Savol va javob variantlari aralashtiriladi
- To‘g‘ri javoblar ko‘rsatilmaydi
- Natijalar brauzer xotirasida saqlanadi
- Har bir natijani alohida o‘chirish
- CSV eksport

## GitHub Pages joylash
1. GitHub’da yangi repository oching.
2. ZIP ichidagi fayllarni repository ichiga yuklang:
   - `index.html`
   - `style.css`
   - `script.js`
   - `questions.js`
   - `README.md`
3. Repository → Settings → Pages.
4. Branch: `main`, folder: `/root`.
5. Save bosing.
6. Berilgan GitHub Pages link orqali oching.

## Muhim eslatma
Bu loyiha server ishlatmaydi. Natijalar faqat ochilgan brauzerning `localStorage` xotirasida saqlanadi.
Agar umumiy markaziy baza kerak bo‘lsa, keyingi versiyada Firebase/Supabase ulash tavsiya qilinadi.
