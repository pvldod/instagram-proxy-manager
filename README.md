# Instagram Proxy Manager

Aplikace pro správu Instagram účtů a proxy serverů s možností automatického přihlašování a zasílání zpráv.

## Funkce

- Správa více Instagram účtů
- Přiřazení proxy serverů k účtům
- Automatické přihlašování do Instagramu
- Odesílání zpráv
- Hromadný import účtů (přes formátovaný text nebo CSV)

## Implementace přihlašování do Instagramu

Aktuální implementace **simuluje** přihlašování do Instagramu. Pro reálnou implementaci je potřeba provést následující kroky:

### 1. Instalace závislostí

```bash
npm install --save puppeteer
# nebo
npm install --save playwright
```

### 2. Skutečná implementace v souboru `lib/instagram.ts`

Pro implementaci reálného přihlašování do Instagramu je potřeba upravit soubor `lib/instagram.ts`. Aktuální verze obsahuje pouze simulovanou implementaci (mock). Pro reálnou implementaci je potřeba:

1. Zakomentovat/odstranit simulované části
2. Odkomentovat/přidat skutečnou implementaci s Puppeteer/Playwright
3. Zajistit, že přihlašování probíhá na serveru (serverová komponenta v Next.js)

### 3. Nastavení CSP (Content Security Policy)

Pro správné fungování automatizovaného prohlížeče je potřeba v Next.js upravit CSP:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://instagram.com; img-src 'self' data:;"
          }
        ]
      }
    ]
  }
}
```

### 4. Zabezpečení

Při implementaci reálného přihlašování dbejte na:

- Šifrování hesel v databázi
- Bezpečné ukládání cookies a session dat
- Rotaci proxy serverů pro zamezení blokace
- Implementaci anti-bot detection technik

## Bezpečnostní varování

**Důležité upozornění:** Automatizované přihlašování do Instagram účtů může být v rozporu s podmínkami služby Instagramu. Použití této aplikace může vést k blokaci účtů nebo jiným sankcím ze strany Instagramu. Tuto aplikaci používejte pouze pro vzdělávací účely nebo pro účty, které máte oprávnění používat.

## Konfigurace databáze

Aplikace využívá databázi Neon Postgres. Pro správné fungování je potřeba nastavit proměnnou prostředí:

```
DATABASE_URL=postgres://...
```

Pro místní vývoj bez databáze používá aplikace automaticky mock data.

## Vývojový režim

```bash
npm run dev
```

## Produkční build

```bash
npm run build
npm start
```

## Licence

MIT
