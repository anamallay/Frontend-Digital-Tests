# Digital Tests (Frontend)

The **Digital Tests** frontend is a web application designed for creating, sharing, and managing online tests. Built with React, TypeScript, and Tailwind CSS, the platform offers an intuitive and seamless user experience for both test creators and participants. It supports multiple languages, including English and Arabic, providing a localized experience with right-to-left (RTL) support for Arabic users. The frontend is optimized for responsiveness, ensuring a smooth interface across all devices, from mobile to desktop.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Responsive Design](#responsive-design)
- [Localization](#localization)
- [Environment Variables](#environment-variables)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- **Create and Share Tests**: Users can create quizzes by adding a name, creating questions with 4 options each, specifying the correct answer, and setting the required time per question. Users can also choose whether the quiz is public or private, share it, and take the test.
- **Results and Feedback**: After taking a test, users receive their results, including the correct answers and their performance.
- **Responsive Design**: Optimized for mobile, tablet, and desktop using custom Tailwind breakpoints.
- **Multi-language Support**: Supports English (LTR) and Arabic (RTL) localization.
- **User Authentication**: Full account management with the ability to log in, register, log out, reset passwords, and securely store all test-related data in the user's account.
- **Reusable Components**: Includes modals and form components for easy customization across the application.

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   Clone the frontend project to your local machine:

   ```bash
   git clone https://github.com/anamallay/Frontend-Digital-Tests
   cd Frontend-Digital-Tests
   ```

2. **Navigate into the project directory:**
   ```bash
   cd Frontend-Digital-Tests
   ```
3. **Install Dependencies:**

   ```bash
   npm install
   ```

   This will install all necessary packages listed in `package.json`

4. **Set Up Environment Variables:**

   Create a `.env` file in the root of the project directory and add the required environment variables as specified in the [Environment Variables](#environment-variables) section.

5. **Run the Application:**
   ```
    npm run dev
   ```

## Responsive Design

The application is designed to be fully responsive, using the following Tailwind custom breakpoints:

- **xs**: `475px` (small mobile devices)
- **sm**: `640px` (small devices like phones)
- **md**: `768px` (tablets)
- **lg**: `1024px` (laptops)
- **xl**: `1280px` (desktops)
- **xxl**: `1536px` (extra large screens)

## Localization

The project uses **i18next** to support multiple languages. Currently, the supported languages are:

- **English (en)**: Left-to-right text direction.
- **Arabic (ar)**: Right-to-left text direction.

Translation files are located in the `src/translation/` directory.

## Environment Variables

Create a `.env` file in the root of project directory and add the following variables:

```bash
 BACKEND_URL=<your-backend-url>
```

Replace each `<value>` with your actual configuration values:

- **BACKEND_URL**: The base URL of your backend API (e.g., `http://localhost:8080/api/` or your production URL). This variable is used by the frontend to communicate with the backend.

## Technologies Used

- **React**: For building the user interface.
- **TypeScript**: For type safety and better developer experience.
- **Tailwind CSS**: For responsive design and custom styling.
- **Redux**: For state management across the application.
- **react-router-dom**: For handling client-side routing and navigation between different pages.
- **i18next**: For localization and translation management.
- **EJS**: For rendering server-side templates for emails.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
