# vibe-vetting

Vibe vetting foundation site built with Next.js, TypeScript, and MongoDB.

## Features

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **MongoDB** connection configured and ready to use
- Modern React with automatic runtime

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```bash
MONGODB_URI=mongodb://localhost:27017/vibe-vetting
```

Or for MongoDB Atlas:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibe-vetting
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

- `/app` - Next.js App Router pages and API routes
  - `/api/test-db` - MongoDB connection test endpoint
  - `layout.tsx` - Root layout component
  - `page.tsx` - Home page
- `/lib` - Utility functions and configurations
  - `mongodb.ts` - MongoDB connection singleton

## MongoDB Connection

The MongoDB connection is configured in `/lib/mongodb.ts` and uses a singleton pattern to reuse the connection across API routes. This prevents connection pool exhaustion in serverless environments.

Test the MongoDB connection by visiting `/api/test-db` or clicking the "Test MongoDB Connection" button on the home page.
