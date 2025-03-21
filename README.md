# Visa Products Application

A full-stack web application for browsing and managing travel visa products across different countries. This project helps travelers find the right visa options for their international travel needs.

<img width="1306" alt="image" src="https://github.com/user-attachments/assets/cd19306d-3f33-49be-a911-fd0a48ccc6ee" />


## Overview

The Visa Products application allows users to browse, filter, and view detailed information about visa products for different countries. It provides a user-friendly interface for discovering visa requirements, pricing, and other important details for international travel.

### Features

- Browse visa products across multiple countries
- Filter products by country, visa type, price range, and more
- View detailed information for specific visa products
- Server-side pagination, filtering, and sorting
- Responsive design for mobile and desktop use

## Project Structure

This project is set up as an Nx monorepo with two main applications:

- **Client**: Angular frontend application
- **Server**: NestJS backend API

### Technology Stack

#### Frontend
- Angular 17 (Standalone components)
- Angular Material
- RxJS
- TypeScript

#### Backend
- NestJS
- TypeORM
- PostgreSQL
- Winston (Logging)
- Swagger (API Documentation)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/semo94/visa-browser.git
   cd visa-browser
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=visa_browser
   
   # API Configuration
   PORT=3000
   API_PREFIX=api/v1
   
   # Environment
   NODE_ENV=development
   ```

4. Set up the database:
   ```bash
   # Create the database
   createdb visa_browser
   
   # The database schema will be automatically created when the server starts
   # due to the synchronize: true option in TypeORM configuration
   ```

5. Import sample data (optional):
   ```bash
   npx ts-node apps/server/src/scripts/import.csv.ts
   ```

## Running the Application

### Development Mode

1. Start the API server:
   ```bash
   npx nx serve server
   ```

2. Start the client application:
   ```bash
   npx nx serve client
   ```

3. Open your browser and navigate to:
   - Client application: http://localhost:4200
   - API documentation: http://localhost:3000/api/docs

### Production Build

1. Build both applications:
   ```bash
   npx nx build server
   npx nx build client
   ```

2. The built applications will be available in the `dist/` directory

## API Endpoints

The API provides the following endpoints:

### Products

- `GET /api/v1/products` - Get a list of visa products with filtering and pagination
- `GET /api/v1/products/:id` - Get a single visa product by ID
- `POST /api/v1/products` - Create a new visa product
- `PUT /api/v1/products/:id` - Update an existing visa product
- `DELETE /api/v1/products/:id` - Delete a visa product

Each endpoint includes proper validation, error handling, and response formatting.

## Client Application Structure

The Angular client application follows a feature-based architecture:

- **Core**: Services, models, and interceptors that are used throughout the application
- **Features**: Feature-specific modules and components (products)
- **Shared**: Reusable components, directives, and pipes

## Server Application Structure

The NestJS server application follows a modular architecture:

- **Modules**: Feature-specific modules (products)
- **Controllers**: Route handlers for API endpoints
- **Services**: Business logic and data access
- **Entities**: Database models
- **DTOs**: Data Transfer Objects for API requests and responses
- **Common**: Shared utilities, filters, interceptors, and services

## Development

### Code Style and Linting

The project uses ESLint for code linting:

```bash
npx nx lint client
npx nx lint server
```

### Running Tests

```bash
# Run client tests
npx nx test client

# Run server tests
npx nx test server
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Nx monorepo
- Styled with Angular Material
- Database powered by PostgreSQL
