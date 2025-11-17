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

4. Start the server:

```bash
npm start
```

5. Open your browser and navigate to:

```
http://localhost:8000
```

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
