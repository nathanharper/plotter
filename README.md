# Story Plotter

A Progressive Web App for tracking plot events and characters in your ongoing story. Built with React, Next.js, Material-UI, and PostgreSQL.

## Features

- **Character Management**: Create and manage story characters with descriptions
- **Event Tracking**: Create chronological plot events and assign characters with specific roles
- **Character Timelines**: View all events related to a specific character in chronological order
- **Relationship Timelines**: View shared events between two characters to track their relationship
- **Progressive Web App**: Install on mobile devices and use offline
- **Beautiful UI**: Modern, responsive design with Material-UI components

## Tech Stack

- **Frontend**: React, Next.js 14, Material-UI (MUI), TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **PWA**: next-pwa for offline functionality
- **Date Handling**: Day.js with Material-UI date pickers

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd story-plotter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Create a PostgreSQL database named `story_plotter`
   - Update database credentials in environment variables

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=story_plotter
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Set up database tables**
   ```bash
   npm run db:setup
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Characters Table
- `id` (Primary Key)
- `name` (Unique)
- `description`
- `created_at`
- `updated_at`

### Events Table
- `id` (Primary Key)
- `title`
- `description`
- `event_date`
- `created_at`
- `updated_at`

### Character_Events Junction Table
- `id` (Primary Key)
- `character_id` (Foreign Key)
- `event_id` (Foreign Key)
- `role` (Character's role in the event)
- `created_at`

## Usage

### Creating Characters
1. Navigate to the Characters page
2. Click the floating action button (+)
3. Enter character name and optional description
4. Click "Create"

### Creating Events
1. Navigate to the Events page
2. Click the floating action button (+)
3. Enter event title, date/time, and optional description
4. Select characters involved in the event
5. Click "Create Event"

### Viewing Timelines
1. Navigate to the Timelines page
2. For single character timeline:
   - Select "Single Character"
   - Choose a character from the dropdown
   - Click "View Timeline"
3. For relationship timeline:
   - Select "Relationship"
   - Choose two characters
   - Click "View Relationship"

## PWA Features

The app can be installed as a Progressive Web App:
- Click the install button in your browser
- Add to home screen on mobile devices
- Works offline for viewing previously loaded data

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Set up database tables

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── characters/        # Characters pages
│   ├── events/           # Events pages
│   ├── timelines/        # Timelines pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── theme.ts          # Material-UI theme
├── lib/                  # Utilities
│   └── db.ts            # Database connection and types
├── public/              # Static assets
├── scripts/             # Database setup scripts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 