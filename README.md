# Architech AI

Architech AI is a tool for designing system architecture diagrams. It features a visual design canvas with drag-and-drop components and provides AI-powered feedback on your designs. This helps you learn and apply best practices in system design.

## Core Features

- **Visual Design Canvas:** Easily create system architecture diagrams using a drag-and-drop interface with pre-built components like load balancers, API gateways, web servers, databases, caches, queues, and CDNs.
- **AI-Powered Feedback:** Get generative AI-powered feedback on your system designs. The AI evaluates key aspects like scalability, availability, and cost, providing insights based on best practices.
- **Feature Requirements Input:** Describe your system requirements in text to inform the AI's design analysis.
- **Templates and Learning Modules:** Access ready-made templates for common system designs to kickstart your work.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Genkit
- Firebase

## Getting Started

### Prerequisites

- Node.js (version 20 or later recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/architech-ai.git
   ```
   *Note: Replace `your-username/architech-ai.git` with the actual repository URL.*
2. Navigate to the project directory:
   ```bash
   cd architech-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

1. To start the Next.js development server:
   ```bash
   npm run dev
   ```
   This will typically start the application on `http://localhost:9002`.

2. To start the Genkit AI development server (in a separate terminal):
   ```bash
   npm run genkit:dev
   ```
   Alternatively, to run Genkit with hot-reloading when AI-related files change:
   ```bash
   npm run genkit:watch
   ```

## Project Structure

Here's a brief overview of the main directories:

- **`src/app`**: Contains the core application code, including pages and layouts, following Next.js conventions.
- **`src/components`**: Houses reusable React components used throughout the application, such as UI elements, chat windows, and the design canvas.
- **`src/ai`**: Includes the Genkit AI flows, configurations, and any AI-related logic for features like system design evaluation.
- **`src/lib`**: Contains utility functions, Firebase configuration, and other shared library code.
- **`docs`**: Contains project documentation, like the blueprint.
- **`public`**: Static assets that are publicly accessible.

## Contributing

Contributions are welcome! If you'd like to contribute to Architech AI, please follow these steps:

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes** and commit them with clear and descriptive messages.
4. **Push your changes** to your forked repository.
5. **Submit a pull request** to the main repository for review.

Please ensure your code adheres to the existing style and that any new features are well-tested.

## License

This project is currently pending license selection. More information will be added here soon.

---

*This README was generated with assistance from an AI coding partner.*
