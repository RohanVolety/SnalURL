# SnapURL - A Short URL Service in Node.js

SnapURL is a URL shortening service built using Node.js, providing users with the ability to create shortened versions of long URLs for easier sharing and management. With SnapURL, users can register, create an account, and generate short URLs.

## Features

- URL Shortening: Easily create short URLs for long web addresses.
- User Registration: Users can register for an account to manage their short URLs.
- Customization: Customize the short URLs according to your preferences.
- Analytics: Track the number of clicks for the shortened URLs.


## Getting Started

### Prerequisites

- Node.js installed on your machine

- MongoDB database should be configured

### Installation

1. Clone the SnapURL repository to your local machine:

```bash
git clone https://github.com/RohanVolety/SnapURL.git
```
2. Install dependencies:

```bash
npm install
```
3. Set up your environment variables:
Create a `.env` file in the root directory of the project and define the following variables:
```bash
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```
4. Usage

1. start the server
```
npm start
```
2. Access SnapURL at http://localhost:8000.

3. Create an account and start shortening URLs.
