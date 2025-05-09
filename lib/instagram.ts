// Implementace přihlášení do Instagramu s puppeteer
// Importy pro skutečné přihlášení pouze v node.js prostředí, ne při buildování
// Pro řešení problémů s buildováním přesuneme importy do dynamických importů
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// puppeteer.use(StealthPlugin());

interface PuppeteerLaunchOptions {
  headless: "new" | boolean;
  args?: string[];
  executablePath?: string;
}

interface PuppeteerBrowser {
  newPage(): Promise<PuppeteerPage>;
  close(): Promise<void>;
}

interface PuppeteerPage {
  goto(url: string, options?: { waitUntil: string }): Promise<any>;
  waitForSelector(selector: string, options?: { timeout: number }): Promise<any>;
  waitForNavigation(options?: { waitUntil: string }): Promise<any>;
  waitForTimeout(timeout: number): Promise<void>;
  $x(xpath: string): Promise<any[]>;
  $$(selector: string): Promise<any[]>;
  $(selector: string): Promise<any>;
  type(selector: string, text: string, options?: { delay: number }): Promise<void>;
  click(selector: string): Promise<void>;
  cookies(): Promise<any[]>;
  setCookie(...cookies: any[]): Promise<void>;
  evaluate<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>;
  evaluateOnNewDocument(fn: Function, ...args: any[]): Promise<void>;
  setUserAgent(userAgent: string): Promise<void>;
  authenticate(credentials: { username: string; password: string }): Promise<void>;
  url(): string;
  keyboard: { press(key: string): Promise<void> };
}

interface PuppeteerModule {
  launch(options: PuppeteerLaunchOptions): Promise<PuppeteerBrowser>;
}

interface LoginParams {
  username: string
  password: string
  proxyAddress: string
}

interface SendMessageParams {
  sessionData: string
  proxyAddress: string
  targetUsername: string
  message: string
}

// Helper funkce pro parsování proxy adresy
function parseProxyAddress(proxyAddress: string): { host: string, port: string, username?: string, password?: string } {
  const parts = proxyAddress.split(':');
  
  if (parts.length === 2) {
    // Formát host:port
    return { host: parts[0], port: parts[1] };
  } else if (parts.length === 4) {
    // Formát host:port:username:password
    return { 
      host: parts[0], 
      port: parts[1], 
      username: parts[2], 
      password: parts[3] 
    };
  }
  
  throw new Error('Neplatný formát proxy. Použijte host:port nebo host:port:username:password');
}

// Pomocná funkce pro dynamické načtení puppeteeru jen když je to potřeba (v Node.js prostředí)
async function loadPuppeteer() {
  // Tato funkce se volá pouze v Node.js prostředí, ne při buildování
  if (typeof window === 'undefined') {
    try {
      // Dynamický import funguje lépe s Next.js než statický import nahoře
      const puppeteerExtra = await import('puppeteer-extra');
      const puppeteer = puppeteerExtra.default;
      
      const StealthPlugin = await import('puppeteer-extra-plugin-stealth');
      puppeteer.use(StealthPlugin.default());
      
      return puppeteer;
    } catch (error) {
      console.error('Chyba při načítání puppeteeru:', error);
      return null;
    }
  }
  return null;
}

/**
 * Přihlásí se do Instagramu s danými údaji přes proxy
 */
export async function loginToInstagram({ username, password, proxyAddress }: LoginParams) {
  console.log(`Pokus o přihlášení do Instagramu jako ${username} přes proxy ${proxyAddress}`);
  
  try {
    // Použít skutečnou implementaci pouze v produkčním režimu
    // nebo když je explicitně nastaveno USE_REAL_INSTAGRAM_LOGIN=true
    if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_INSTAGRAM_LOGIN === 'true') {
      // Načíst puppeteer jen když je potřeba
      const puppeteer = await loadPuppeteer();
      
      // Pokud se puppeteer nepodařilo načíst, použijeme mock implementaci
      if (!puppeteer) {
        console.log('Puppeteer se nepodařilo načíst, používám simulaci');
        return mockLoginToInstagram(username);
      }
      
      // Parsovat proxy adresu
      const proxyInfo = parseProxyAddress(proxyAddress);
      
      // Nastavení pro puppeteer
      const options: any = {
        headless: "new",
        args: [
          `--proxy-server=${proxyInfo.host}:${proxyInfo.port}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      };
      
      // Spustit browser
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      
      // Nastavit autentizaci pro proxy, pokud je potřeba
      if (proxyInfo.username && proxyInfo.password) {
        await page.authenticate({
          username: proxyInfo.username,
          password: proxyInfo.password,
        });
      }
      
      // Nastavit user agent pro reálnější prohlížeč
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      
      // Přejít na Instagram
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
      
      // Přijmout cookies, pokud se zobrazí dialog
      try {
        const acceptCookies = await page.$x("//button[contains(text(), 'Accept') or contains(text(), 'Accept All')]");
        if (acceptCookies.length > 0) {
          await acceptCookies[0].click();
          await page.waitForTimeout(2000); // Počkat na zpracování
        }
      } catch (e) {
        console.log('Dialog s cookies se nezobrazil nebo byl jiný formát');
      }
      
      // Vyplnit přihlašovací údaje
      await page.waitForSelector('input[name="username"]');
      await page.type('input[name="username"]', username, { delay: 50 });
      await page.type('input[name="password"]', password, { delay: 50 });
      
      // Kliknout na přihlašovací tlačítko
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]')
      ]);
      
      // Kontrola, zda jsme přihlášeni - kontrola URL nebo přítomnost prvků
      const currentUrl = page.url();
      
      // Pokud jsme dosud na přihlašovací stránce, pravděpodobně došlo k chybě
      if (currentUrl.includes('accounts/login')) {
        // Zkusit najít chybovou zprávu
        const errorMessage = await page.evaluate(() => {
          const errorElement = document.querySelector('p[role="alert"]');
          return errorElement ? errorElement.textContent : null;
        });
        
        await browser.close();
        return {
          success: false,
          error: errorMessage || 'Přihlášení se nezdařilo. Zkontrolujte své přihlašovací údaje.'
        };
      }
      
      // Kontrola dvoufaktorového ověření
      if (currentUrl.includes('two_factor')) {
        await browser.close();
        return {
          success: false,
          error: 'Účet vyžaduje dvoufaktorové ověření. Tato funkce není implementována.'
        };
      }
      
      // Kontrola jiných výzev (telefon, email, captcha)
      if (currentUrl.includes('challenge')) {
        await browser.close();
        return {
          success: false,
          error: 'Instagram vyžaduje další ověření. Zkuste se přihlásit manuálně v prohlížeči.'
        };
      }
      
      // Získat cookies a localStorage pro budoucí použití
      const cookies = await page.cookies();
      const localStorage = await page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              data[key] = value;
            }
          }
        }
        return data;
      });
      
      // Zavřít prohlížeč
      await browser.close();
      
      // Vrátit úspěšný výsledek s daty relace
      return {
        success: true,
        sessionData: JSON.stringify({ cookies, localStorage }),
      };
    } else {
      return mockLoginToInstagram(username);
    }
    
  } catch (error: any) {
    console.error('Chyba při přihlašování:', error);
    
    // Vrátit chybu
    return {
      success: false,
      error: `Chyba při přihlašování: ${error.message || 'Neznámá chyba'}`
    };
  }
}

// Mock implementace pro vývojové prostředí
function mockLoginToInstagram(username: string) {
  console.log('[SIMULACE] Přihlašování jako', username);
  
  // Simulovat zpoždění sítě
  return new Promise<{success: boolean, sessionData: string}>(resolve => {
    setTimeout(() => {
      // Simulované údaje relace
      const sessionData = JSON.stringify({
        cookies: [
          { name: "sessionid", value: `real_session_${Date.now()}`, domain: ".instagram.com" },
          { name: "ds_user_id", value: "12345678", domain: ".instagram.com" },
        ],
        localStorage: "{}",
      });
      
      resolve({
        success: true,
        sessionData,
      });
    }, 3000);
  });
}

/**
 * Použije existující session data k obnovení přihlášení do Instagramu
 */
export async function useExistingSession(sessionData: string, proxyAddress: string) {
  console.log(`Použití existující relace s proxy ${proxyAddress}`);
  
  try {
    // Použít skutečnou implementaci pouze v produkčním režimu
    // nebo když je explicitně nastaveno USE_REAL_INSTAGRAM_LOGIN=true
    if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_INSTAGRAM_LOGIN === 'true') {
      // Načíst puppeteer jen když je potřeba
      const puppeteer = await loadPuppeteer();
      
      // Pokud se puppeteer nepodařilo načíst, použijeme mock implementaci
      if (!puppeteer) {
        console.log('Puppeteer se nepodařilo načíst, používám simulaci');
        return mockUseExistingSession();
      }
      
      // Parsovat data relace
      const session = JSON.parse(sessionData);
      const proxyInfo = parseProxyAddress(proxyAddress);
      
      // Nastavení pro puppeteer
      const options: any = {
        headless: "new",
        args: [
          `--proxy-server=${proxyInfo.host}:${proxyInfo.port}`,
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      };
      
      // Spustit browser
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      
      // Nastavit autentizaci pro proxy, pokud je potřeba
      if (proxyInfo.username && proxyInfo.password) {
        await page.authenticate({
          username: proxyInfo.username,
          password: proxyInfo.password,
        });
      }
      
      // Nastavení cookies z předchozí relace
      if (session.cookies && Array.isArray(session.cookies)) {
        await page.setCookie(...session.cookies);
      }
      
      // Nastavení localStorage z předchozí relace
      if (session.localStorage) {
        await page.evaluateOnNewDocument((storageData) => {
          try {
            const data = storageData;
            for (const key in data) {
              window.localStorage.setItem(key, data[key]);
            }
          } catch (e) {
            console.error('Chyba při nastavování localStorage:', e);
          }
        }, session.localStorage);
      }
      
      // Přejít na Instagram pro ověření relace
      await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
      
      // Zkontrolovat, zda jsme přihlášeni - kontrola nepřítomnosti přihlašovacího tlačítka
      const isLoggedIn = await page.evaluate(() => {
        return !document.querySelector('a[href="/accounts/login/"]');
      });
      
      await browser.close();
      
      return { success: isLoggedIn };
    } else {
      return mockUseExistingSession();
    }
    
  } catch (error: any) {
    console.error('Chyba při používání existující relace:', error);
    
    return { 
      success: false,
      error: `Chyba při používání existující relace: ${error.message || 'Neznámá chyba'}`
    };
  }
}

// Mock implementace pro vývojové prostředí
function mockUseExistingSession() {
  console.log('[SIMULACE] Použití existující session');
  
  // Simulovat zpoždění sítě
  return new Promise<{success: boolean}>(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
}

/**
 * Odešle zprávu konkrétnímu uživateli na Instagramu
 */
export async function sendInstagramMessage({ sessionData, proxyAddress, targetUsername, message }: SendMessageParams) {
  console.log(`Odesílání zprávy uživateli ${targetUsername} pomocí proxy ${proxyAddress}`);
  
  try {
    // Použít skutečnou implementaci pouze v produkčním režimu
    // nebo když je explicitně nastaveno USE_REAL_INSTAGRAM_LOGIN=true
    if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_INSTAGRAM_LOGIN === 'true') {
      // Načíst puppeteer jen když je potřeba
      const puppeteer = await loadPuppeteer();
      
      // Pokud se puppeteer nepodařilo načíst, použijeme mock implementaci
      if (!puppeteer) {
        console.log('Puppeteer se nepodařilo načíst, používám simulaci');
        return mockSendInstagramMessage(targetUsername, message);
      }
      
      // Parsovat data relace
      const session = JSON.parse(sessionData);
      const proxyInfo = parseProxyAddress(proxyAddress);
      
      // Nastavení pro puppeteer
      const options: any = {
        headless: "new",
        args: [
          `--proxy-server=${proxyInfo.host}:${proxyInfo.port}`,
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      };
      
      // Spustit browser
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      
      // Nastavit autentizaci pro proxy, pokud je potřeba
      if (proxyInfo.username && proxyInfo.password) {
        await page.authenticate({
          username: proxyInfo.username,
          password: proxyInfo.password,
        });
      }
      
      // Nastavení cookies z předchozí relace
      if (session.cookies && Array.isArray(session.cookies)) {
        await page.setCookie(...session.cookies);
      }
      
      // Nastavení localStorage z předchozí relace
      if (session.localStorage) {
        await page.evaluateOnNewDocument((storageData) => {
          try {
            const data = storageData;
            for (const key in data) {
              window.localStorage.setItem(key, data[key]);
            }
          } catch (e) {
            console.error('Chyba při nastavování localStorage:', e);
          }
        }, session.localStorage);
      }
      
      // Přejít na stránku přímých zpráv
      await page.goto(`https://www.instagram.com/direct/inbox/`, { waitUntil: 'networkidle2' });
      
      // Kliknout na tlačítko pro novou zprávu
      await page.waitForSelector('button[aria-label="New message"]');
      await page.click('button[aria-label="New message"]');
      
      // Vyhledat uživatele
      await page.waitForSelector('input[placeholder="Search..."]');
      await page.type('input[placeholder="Search..."]', targetUsername, { delay: 50 });
      
      // Počkat na výsledky vyhledávání a vybrat uživatele
      await page.waitForSelector('[role="dialog"] [role="button"]');
      const searchResults = await page.$$('[role="dialog"] [role="button"]');
      
      if (searchResults.length === 0) {
        throw new Error(`Uživatel ${targetUsername} nebyl nalezen`);
      }
      
      // Kliknout na prvního nalezeného uživatele
      await searchResults[0].click();
      
      // Kliknout na tlačítko pro pokračování
      await page.waitForSelector('button[tabindex="0"]');
      const nextButtons = await page.$$('button[tabindex="0"]');
      
      // Najít tlačítko Next/Chat
      let foundNextButton = false;
      for (const button of nextButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Next') || text.includes('Chat'))) {
          await button.click();
          foundNextButton = true;
          break;
        }
      }
      
      if (!foundNextButton) {
        throw new Error('Nepodařilo se najít tlačítko pro pokračování');
      }
      
      // Počkat na chat a poslat zprávu
      await page.waitForSelector('div[aria-label="Message"]', { timeout: 10000 });
      await page.type('div[aria-label="Message"]', message, { delay: 50 });
      
      // Odeslat zprávu
      await page.keyboard.press('Enter');
      
      // Počkat na odeslání
      await page.waitForTimeout(2000);
      
      await browser.close();
      
      return { success: true };
    } else {
      return mockSendInstagramMessage(targetUsername, message);
    }
    
  } catch (error: any) {
    console.error('Chyba při odesílání zprávy:', error);
    
    return { 
      success: false,
      error: `Chyba při odesílání zprávy: ${error.message || 'Neznámá chyba'}`
    };
  }
}

// Mock implementace pro vývojové prostředí
function mockSendInstagramMessage(targetUsername: string, message: string) {
  console.log(`[SIMULACE] Odesílána zpráva uživateli ${targetUsername}: ${message}`);
  
  // Simulovat zpoždění sítě
  return new Promise<{success: boolean}>(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 2000);
  });
}
