# Two-Factor Authentication (2FA) Project

This project implements a simple Two-Factor Authentication (2FA) system using Speakeasy and Express.js. The system allows users to register and verify their identity using TOTP (Time-based One-Time Password).

## Features

- User registration with a unique ID and TOTP secret generation.
- Verification of TOTP tokens.
- Validation of TOTP tokens.
- Simple in-memory storage using node-json-db.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the server:
    ```bash
    node app.js
    ```

2. The server will be running on `http://localhost:9000`.

## API Endpoints

### Register a User

- **URL:** `/api/register`
- **Method:** `POST`
- **Description:** Registers a new user and generates a TOTP secret.
- **Response:**
  ```json
  {
    "id": "user-id",
    "secret": "base32-encoded-secret"
  }
  ```
### Verify TOTP Token
- URL: /api/verify
- Method: POST
- Description: Verifies a user's TOTP token.
- Request Body:
 ```json
  {
    "userId": "user-id",
    "token": "totp-token"
  }
  ```
- Response:
 ```json
{
  "verified": true
}
```
### Validate TOTP Token

- URL: /api/validate
- Method: POST
- Description: Validates a user's TOTP token.
- Request Body:
 ```json
  {
    "userId": "user-id",
    "token": "totp-token"
  }
```
- Response:
 ```json
  {
    "validated": true
  }
  ```
