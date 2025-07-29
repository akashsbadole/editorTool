# CodeCraft AI - Advanced Code Generation Platform

CodeCraft AI is a comprehensive web-based AI code generation platform that provides a full IDE experience with code generation, editing capabilities, project management, and direct deployment functionality. The platform is powered by Ollama AI models and offers real-time streaming responses, multi-file preview with Monaco Editor, theme switching, and one-click deployment to various platforms.

## 🚀 Features

### Core Functionality
- **AI Code Generation**: Powered by DeepSeek Coder and Code Llama models via Ollama
- **Full IDE Experience**: Monaco Editor with syntax highlighting, IntelliSense, and multi-file support
- **Real-time Streaming**: Live code generation with progress feedback
- **Project Management**: Create, organize, and manage multiple coding projects
- **One-Click Deployment**: Deploy to Vercel, Netlify, Railway with automated setup
- **Terminal Integration**: Built-in terminal with common development commands
- **Theme Support**: Light/dark mode with seamless switching

### Advanced Features
- **Package Type Selection**: Support for Frontend, Backend, Full-stack, Mobile, Desktop, and CLI projects
- **Environment Variables**: Secure management of deployment secrets
- **File Tree Navigation**: Intuitive file explorer with folder structure
- **ZIP Export**: Download generated code as compressed archives
- **Prompt History**: Access and reuse previous code generation prompts
- **Auto-save**: Automatic saving of code changes every 30 seconds
- **Deployment Monitoring**: Real-time deployment status and logs

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for responsive and modern styling
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing
- **Monaco Editor** for professional code editing experience

### Backend Stack
- **Node.js** with Express.js for the server
- **TypeScript** with ES modules throughout
- **PostgreSQL** with Drizzle ORM for data persistence
- **Ollama API** integration for AI code generation
- **Server-Sent Events** for real-time streaming
- **In-memory caching** with database fallback

### AI Integration
- **Ollama Models**: DeepSeek Coder, Code Llama, and other coding models
- **Streaming Support**: Real-time generation feedback
- **Context-Aware**: Maintains project context across generations
- **Multi-language**: Supports various programming languages and frameworks

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional, uses in-memory storage by default)
- Ollama installed and running locally

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codecraft-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Ollama**
   ```bash
   # Install Ollama (macOS/Linux)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a coding model
   ollama pull deepseek-coder:6.7b
   # or
   ollama pull codellama:7b
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database (optional - uses in-memory storage if not provided)
DATABASE_URL=postgresql://username:password@localhost:5432/codecraft

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder:6.7b

# Server Configuration  
PORT=5000
NODE_ENV=development
```

## 🎯 Usage Guide

### Creating Your First Project

1. **Start a New Project**
   - Click "Create New Project" on the home page
   - Enter a project name and description
   - Select the package type (Frontend, Backend, Full-stack, etc.)
   - Choose whether to initialize with AI or start empty

2. **Generate Code with AI**
   - Open your project in the IDE
   - Use the code generation panel
   - Describe what you want to build in natural language
   - Watch as AI generates your code in real-time
   - Review and edit the generated files

3. **Edit and Develop**
   - Use the Monaco editor for code editing
   - Navigate files with the file tree
   - Use the integrated terminal for development commands
   - Auto-save keeps your changes secure

4. **Deploy Your Project**
   - Open the Deploy tab in the IDE
   - Choose your preferred platform (Vercel, Netlify, Railway)
   - Configure environment variables
   - Click "Deploy Now" for one-click deployment

### Package Types

- **Frontend**: React, Vue, Angular, vanilla JavaScript applications
- **Backend**: Node.js, Python, Go APIs and services  
- **Full-stack**: Complete applications with frontend and backend
- **Mobile**: React Native, Flutter mobile applications
- **Desktop**: Electron, Tauri desktop applications
- **CLI**: Command-line tools and utilities

### AI Code Generation

The platform supports natural language descriptions such as:

- "Create a login form with email validation and password visibility toggle"
- "Build a REST API for a todo application with CRUD operations"
- "Generate a React dashboard with charts and data tables"
- "Create a mobile app for expense tracking with categories"

## 🚀 Deployment Process

### Supported Platforms

#### Vercel
- **Best for**: Frontend and serverless applications
- **Features**: Auto HTTPS, Global CDN, Zero configuration
- **Process**: Connects via GitHub, automatic builds and deployments

#### Netlify  
- **Best for**: JAMstack and static sites
- **Features**: Form handling, Serverless functions, Split testing
- **Process**: Git-based deployments with continuous integration

#### Railway
- **Best for**: Full-stack applications with databases
- **Features**: Database hosting, Auto scaling, Team collaboration
- **Process**: Container-based deployments with automatic scaling

### Deployment Steps

1. **Prepare Your Project**
   - Ensure all code is saved and tested
   - Set up required environment variables
   - Verify package.json scripts are configured

2. **Configure Deployment**
   - Select your preferred platform
   - Set environment variables in the deployment panel
   - Review deployment configuration

3. **Deploy**
   - Click "Deploy Now" to start the process
   - Monitor deployment progress in real-time
   - Access your live application once deployment completes

4. **Post-Deployment**
   - Test your deployed application
   - Monitor performance and logs
   - Set up custom domains if needed

## 🛠️ Development

### Project Structure

```
codecraft-ai/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── assets/         # Static assets
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage abstraction
│   ├── index.ts            # Server entry point
│   └── vite.ts             # Vite development integration
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts           # Data models and validation
└── components.json         # shadcn/ui configuration
```

### Key Components

#### Frontend Components
- **ProjectManager**: Handles project CRUD operations and listing
- **CodeEditor**: Monaco-based code editor with syntax highlighting
- **FileTree**: Interactive file system navigation
- **Terminal**: Integrated terminal with development commands
- **DeploymentPanel**: Deployment configuration and monitoring
- **StreamingModal**: Real-time code generation interface

#### Backend Services
- **Routes**: RESTful API endpoints for projects, prompts, and deployments
- **Storage**: Abstracted storage interface with memory and database implementations
- **Ollama Integration**: AI model communication and streaming

### Adding New Features

1. **Define Data Schema**
   ```typescript
   // shared/schema.ts
   export const newFeatureSchema = z.object({
     id: z.string(),
     name: z.string(),
     // ... other fields
   });
   ```

2. **Update Storage Interface**
   ```typescript
   // server/storage.ts
   interface IStorage {
     createNewFeature(data: InsertNewFeature): Promise<NewFeature>;
     // ... other methods
   }
   ```

3. **Add API Routes**
   ```typescript
   // server/routes.ts
   app.post("/api/newfeature", async (req, res) => {
     // Implementation
   });
   ```

4. **Create Frontend Component**
   ```typescript
   // client/src/components/new-feature.tsx
   export function NewFeature() {
     // Component implementation
   }
   ```

## 🔧 API Reference

### Projects API

#### GET /api/projects
Returns all projects for the user.

**Response:**
```json
[
  {
    "id": "proj_123",
    "name": "My React App",
    "description": "A modern React application",
    "packageType": "frontend",
    "files": {},
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/projects
Creates a new project.

**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "packageType": "frontend"
}
```

#### GET /api/projects/:id
Returns a specific project by ID.

#### PATCH /api/projects/:id
Updates a project's files or metadata.

#### DELETE /api/projects/:id
Deletes a project.

### Prompts API

#### GET /api/prompts
Returns all prompts, optionally filtered by project.

**Query Parameters:**
- `projectId` (optional): Filter prompts by project

#### POST /api/prompts
Creates a new code generation prompt.

**Request:**
```json
{
  "projectId": "proj_123",
  "packageType": "frontend",
  "command": "Create a login form with validation"
}
```

### Deployments API

#### GET /api/deployments/:projectId
Returns deployment history for a project.

#### POST /api/deployments
Creates a new deployment.

**Request:**
```json
{
  "projectId": "proj_123",
  "platform": "vercel"
}
```

## 🤝 Contributing

We welcome contributions to CodeCraft AI! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes and test thoroughly
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Contribution Guidelines

- Follow TypeScript best practices
- Maintain test coverage for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the community discussions for help and ideas

## 🚀 Roadmap

### Upcoming Features
- [ ] Multi-user collaboration and real-time editing
- [ ] Advanced debugging tools and breakpoints
- [ ] Plugin system for custom code generators
- [ ] Integration with GitHub, GitLab for version control
- [ ] Docker container deployment support
- [ ] Advanced AI model fine-tuning
- [ ] Code review and quality analysis tools
- [ ] Team workspaces and project sharing

### Version History
- **v1.0.0**: Initial release with core IDE and deployment features
- **v1.1.0** (Planned): Team collaboration and advanced deployment options
- **v1.2.0** (Planned): Plugin system and custom AI model support

---

**Built with ❤️ by the CodeCraft AI team**

For the latest updates and announcements, follow our [GitHub repository](https://github.com/your-org/codecraft-ai).