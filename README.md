# Instagram Proxy Manager

Application for managing Instagram accounts and proxy servers with automatic login and messaging capabilities.

## Features

- Management of multiple Instagram accounts
- Assignment of proxy servers to accounts
- Automatic Instagram login
- Sending messages
- Bulk import of accounts (via formatted text or CSV)

## Instagram Login Implementation

This application now supports **real login** to Instagram accounts using an automated browser with the Puppeteer library.

### How it works

1. The application launches an automated browser (headless Chrome) with a proxy
2. Automatically fills in Instagram login credentials
3. Handles possible errors (incorrect credentials, two-factor authentication, challenges)
4. Saves session data (cookies, localStorage) for future use without logging in
5. Uses session data for login and sending messages

### Activating real login

To activate real login (instead of the simulated version), you have two options:

1. **For development/testing**: Set in the `.env.local` file the variable:
   ```
   USE_REAL_INSTAGRAM_LOGIN="true"
   ```

2. **For production**: Automatically activated in production mode (`NODE_ENV="production"`)

### Technical implementation

The application uses:

- **puppeteer-extra**: Enhanced version of Puppeteer for better functionality
- **puppeteer-extra-plugin-stealth**: Avoids automation detection
- **Multi-proxy support**: Formats `host:port` and `host:port:username:password`
- **Session storage**: Cookies and localStorage stored in the database

### Security warning

**Important notice:** Automated login to Instagram accounts may violate Instagram's terms of service. Using this application may lead to account blocking or other sanctions from Instagram. Use this application only for educational purposes or for accounts you are authorized to use.

## Installation and setup

1. Clone the repository
   ```bash
   git clone https://github.com/pvldod/instagram-proxy-manager.git
   cd instagram-proxy-manager
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env.local` file with database connection (optional for development)
   ```
   DATABASE_URL=""  # Empty for mock data during development
   USE_REAL_INSTAGRAM_LOGIN="false"  # Set to "true" to activate real login
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Database configuration

The application uses Neon Postgres database. For proper operation, you need to set the environment variable:

```
DATABASE_URL="postgres://..."
```

For local development without a database, the application automatically uses mock data.

## Development mode

```bash
npm run dev
```

## Production build

```bash
npm run build
npm start
```

## License

MIT
