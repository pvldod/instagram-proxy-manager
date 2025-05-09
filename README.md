# Instagram Proxy Manager

Aplikace pro správu Instagram účtů a proxy serverů s možností automatického přihlašování a zasílání zpráv.

## Funkce

- Správa více Instagram účtů
- Přiřazení proxy serverů k účtům
- Automatické přihlašování do Instagramu
- Odesílání zpráv
- Hromadný import účtů (přes formátovaný text nebo CSV)

## Implementace přihlašování do Instagramu

Tato aplikace nyní podporuje **skutečné přihlašování** do Instagram účtů pomocí automatizovaného prohlížeče s knihovnou Puppeteer.

### Jak to funguje

1. Aplikace spustí automatizovaný prohlížeč (headless Chrome) s proxy
2. Automaticky vyplní přihlašovací údaje na Instagram
3. Zpracuje možné chyby (nesprávné údaje, dvoufaktorové ověření, challenge)
4. Uloží data relace (cookies, localStorage) pro budoucí použití bez přihlašování
5. Používá session data pro přihlášení a odesílání zpráv

### Aktivace skutečného přihlašování

Pro aktivaci reálného přihlašování (místo simulované verze) máte dvě možnosti:

1. **Pro vývoj/testování**: Nastavte v souboru `.env.local` proměnnou:
   ```
   USE_REAL_INSTAGRAM_LOGIN="true"
   ```

2. **Pro produkci**: Automaticky se aktivuje v produkčním režimu (`NODE_ENV="production"`)

### Technická implementace

Aplikace používá:

- **puppeteer-extra**: Rozšířená verze Puppeteeru pro lepší funkcionalitu
- **puppeteer-extra-plugin-stealth**: Vyhýbá se detekci automatizace
- **Multi-proxy podporu**: Formáty `host:port` i `host:port:username:password`
- **Ukládání relace**: Cookies a localStorage uchovány v databázi

### Bezpečnostní varování

**Důležité upozornění:** Automatizované přihlašování do Instagram účtů může být v rozporu s podmínkami služby Instagramu. Použití této aplikace může vést k blokaci účtů nebo jiným sankcím ze strany Instagramu. Tuto aplikaci používejte pouze pro vzdělávací účely nebo pro účty, které máte oprávnění používat.

## Instalace a nastavení

1. Naklonujte repozitář
   ```bash
   git clone https://github.com/pvldod/instagram-proxy-manager.git
   cd instagram-proxy-manager
   ```

2. Nainstalujte závislosti
   ```bash
   npm install
   # nebo
   pnpm install
   ```

3. Vytvořte soubor `.env.local` s připojením k databázi (volitelné pro vývoj)
   ```
   DATABASE_URL=""  # Prázdné pro mock data při vývoji
   USE_REAL_INSTAGRAM_LOGIN="false"  # Nastavte na "true" pro aktivaci skutečného přihlašování
   ```

4. Spusťte vývojový server
   ```bash
   npm run dev
   # nebo
   pnpm dev
   ```

## Konfigurace databáze

Aplikace využívá databázi Neon Postgres. Pro správné fungování je potřeba nastavit proměnnou prostředí:

```
DATABASE_URL="postgres://..."
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
