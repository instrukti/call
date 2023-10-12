# Video Calling App with Golang, Livekit, and Svelte

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Local Development](#local-development)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

## Introduction

Welcome to our open-source video calling app project! This application leverages Golang, Livekit, and Svelte to provide a seamless video calling experience. Whether you want to use it, contribute to its development, or explore how it works, this README is here to guide you.

## Getting Started

### Installation

To get started with our video calling app, follow these installation steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/instrukti/call.git
   cd call
   ```

2. **Install Dependencies**:

   - Install Go dependencies:

     ```bash
     go mod tidy
     ```

   - Install Node.js dependencies for the Svelte frontend:

     ```bash
     cd ui
     npm install
     npm run build
     ```

   - Finally, build the executable
     ```bash
     cd ..
     go build .
     ```

Before you can run the app, you would need to create a `.env` file with variables `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `LIVEKIT_SERVER_URL`. Refer to [Livekit documentation](https://livekit.io/docs) for detailed instructions.

### Local Development

Now that you have the project and its dependencies installed, follow these steps to set up the app locally:

1. **Set Up Livekit Server**:

   You'll need to configure a Livekit server to handle the video calling. Refer to the [Livekit documentation](https://livekit.io/docs) for detailed instructions.

2. **Configuration**:

   - Create a `.env` file in the root directory and configure the app:

     ```env
     LIVEKIT_API_KEY=devkey
     LIVEKIT_SERVER_URL=secret
     LIVEKIT_SERVER_URL=http://localhost:7780
     ```

3. **Run the App**:

   - Start the Pocketbase server, this starts up a pocketbase server with UI already embeded:

     ```bash
     go run main.go serve
     ```

   - In case you are modifying frontend, you may also start the svelte dev server:

     ```bash
     cd ui
     npm run dev -- --open
     ```

4. **Access the App**:

   To access the UI, open your web browser and visit `http://localhost:8090/`, if you have only started backend. Visit `http://localhost:5173/` if you have started the svelte dev server. To access pocketbase admin UI, visit `http://localhost:8090/_/`.

## Contributing

We welcome contributions from the open-source community! If you'd like to contribute to this project, please follow these steps:

1. **Fork the Repository**:

   Click the "Fork" button at the top-right corner of the repository page.

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/instrukti/call.git
   ```

3. **Create a New Branch**:

   ```bash
   git checkout -b feature/your-feature
   ```

4. **Make Your Changes**:

   Make your code changes and improvements.

5. **Commit Your Changes**:

   ```bash
   git commit -m "Add feature/fix"
   ```

6. **Push Your Changes**:

   ```bash
   git push origin feature/your-feature
   ```

7. **Create a Pull Request**:

   Go to the original repository and click the "New Pull Request" button.

8. **Wait for Review**:

   We will review your contribution, and if everything looks good, we will merge it.

## Disclaimer

This project is an experimental app at this stage, and the development may be abandoned in favor it already existing apps. It may contain bugs, incomplete features, or other issues. We recommend using it with caution.

**Please report any issues and contribute to the project to make it even better!**

---

Thank you for considering our open-source video calling app. We hope you find it useful and welcome your feedback and contributions. If you have any questions or need assistance, please feel free to contact us via issues or discussion.

Happy coding!
