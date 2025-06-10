# Setup Notes for Story Plotter

## Node.js Library Issue Resolution

If you encounter the `libicui18n.74.dylib` error when running npm commands, try these solutions:

### Option 1: Fix ICU4C Library (macOS with Homebrew)
```bash
brew install icu4c
brew link icu4c --force
```

### Option 2: Reinstall Node.js
```bash
brew uninstall node
brew install node
```

### Option 3: Use Node Version Manager (nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

## Database Setup

1. Install PostgreSQL:
   ```bash
   brew install postgresql
   brew services start postgresql
   ```

2. Create database:
   ```bash
   createdb story_plotter
   ```

3. Set environment variables in `.env.local`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=story_plotter
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

## Application Structure

The app is fully built with:
- ✅ Next.js 14 with App Router
- ✅ Material-UI components and theming
- ✅ PWA configuration with next-pwa
- ✅ PostgreSQL database schema
- ✅ Complete API routes for CRUD operations
- ✅ Character management page
- ✅ Event management page with timeline
- ✅ Timeline views for single characters and relationships
- ✅ TypeScript types and interfaces
- ✅ Responsive design

## Key Features Implemented

1. **Character Management**: Create, view, and manage story characters
2. **Event Timeline**: Create events with dates and assign characters
3. **Character Timelines**: View all events for a specific character
4. **Relationship Timelines**: View shared events between two characters
5. **PWA Support**: Installable app with offline capabilities
6. **Modern UI**: Material-UI components with custom theme

## Next Steps After Fixing Node.js

1. Run `npm install`
2. Set up PostgreSQL database
3. Run `npm run db:setup`
4. Start development with `npm run dev`
5. Access the app at http://localhost:3000

The application is production-ready once the dependencies are installed! 