# URL Shortener

A modern, full-stack URL shortening application built with Node.js, Express, MongoDB, and TailwindCSS.

## Features

- **User Authentication**: Secure signup and login with password hashing
- **URL Shortening**: Create short, shareable links from long URLs
- **Analytics**: Track click counts for your shortened URLs
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Real-time Updates**: Refresh button to update click counts without page reload
- **URL Management**: Delete your shortened URLs
- **Auto URL Validation**: Automatically adds https:// if protocol is missing

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Session-based with bcrypt password hashing
- **Frontend**: EJS templates with TailwindCSS
- **Other**: shortid for URL generation, cookie-parser for sessions

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:

```bash
npm install
```

3. Make sure MongoDB is running on your system:

```bash
# MongoDB should be running on mongodb://127.0.0.1:27017
```

4. (Optional) Create a `.env` file for environment variables:

```bash
# MongoDB Connection URL (supports both MONGODB_URI and MONGODB_URL)
MONGODB_URI=mongodb://127.0.0.1:27017/url-shortener
# or
MONGODB_URL=mongodb://127.0.0.1:27017/url-shortener

# Server Port
PORT=8000

# Base URL (for production deployment)
# Set this when deploying to EC2 or other servers
# Example: https://yourdomain.com or http://your-ec2-ip:8000
BASE_URL=
```

5. Start the server:

```bash
npm start
```

6. Open your browser and navigate to:

```
http://localhost:8000
```

## Deployment to EC2

When deploying to EC2 or other production servers:

1. **Set Environment Variables**:

   ```bash
   export MONGODB_URI="mongodb://your-mongodb-host:27017/url-shortener"
   # or use MONGODB_URL (both are supported)
   export PORT=8000
   export BASE_URL="https://yourdomain.com"  # or http://your-ec2-ip:8000
   ```

2. **Or use a `.env` file** (recommended):

   ```bash
   MONGODB_URI=mongodb://your-mongodb-host:27017/url-shortener
   PORT=8000
   BASE_URL=https://yourdomain.com
   ```

3. **Install dependencies and start**:

   ```bash
   npm install
   npm run prod  # Uses node instead of nodemon
   ```

4. **Use PM2 for process management** (recommended):
   ```bash
   npm install -g pm2
   pm2 start index.js --name url-shortener
   pm2 save
   pm2 startup
   ```

**Note**: The application automatically detects the base URL from the request if `BASE_URL` is not set. However, setting `BASE_URL` explicitly is recommended for production to ensure correct URLs in generated short links.

## Project Structure

```
url-shortener/
├── controllers/     # Request handlers
│   ├── url.js      # URL shortening logic
│   └── user.js     # User authentication logic
├── models/         # Mongoose models
│   ├── url.js      # URL schema
│   └── user.js     # User schema
├── routes/         # Express routes
│   ├── url.js      # URL routes
│   ├── user.js     # User routes
│   └── staticRouter.js  # Static page routes
├── middlewares/    # Custom middleware
│   └── auth.js     # Authentication middleware
├── service/        # Service layer
│   └── auth.js     # Session management
├── views/          # EJS templates
│   ├── home.ejs    # Main dashboard
│   ├── login.ejs   # Login page
│   └── signup.ejs  # Signup page
├── public/         # Static files
├── utils/          # Utility functions
│   └── urlHelper.js  # Base URL helper for deployment
├── connection.js   # MongoDB connection
└── index.js        # Application entry point
```

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Sign in at `/login`
3. **Shorten URLs**: Enter a long URL in the form on the home page
4. **View Analytics**: See click counts for all your shortened URLs
5. **Refresh**: Click the refresh button to update click counts
6. **Delete**: Remove URLs you no longer need

## API Endpoints

- `GET /health` - Health check endpoint (returns `{ status: "ok" }`)
- `POST /url` - Create a new short URL (requires authentication)
- `GET /url/:id` - Redirect to original URL (public)
- `GET /url/refresh` - Get updated click counts (requires authentication)
- `GET /url/analytics/:id` - Get analytics for a specific URL (requires authentication)
- `GET /url/delete/:id` - Delete a URL (requires authentication)
- `POST /user` - User signup
- `POST /user/login` - User login
- `GET /user/logout` - User logout

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Protected routes with middleware
- URL validation and sanitization
- User-specific URL access control

## License

ISC

## Author

Aditya Shahari
