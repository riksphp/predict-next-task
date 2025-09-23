# Next Task Predictor - Agentic AI Personal Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🎯 Project Overview

An intelligent Chrome Extension that serves as your personal AI assistant, proactively suggesting meaningful tasks based on philosophical foundations and user context. Unlike traditional assistants that wait for commands, this system initiates interactions and provides mindful productivity guidance.

### 🌟 Key Features

- **🧠 Intelligent Task Prediction**: AI-powered suggestions based on user context and behavior patterns
- **📊 Comprehensive Dashboard**: Score tracking, task management, and learning notes
- **💬 Contextual Chat**: Interactive conversations with task awareness
- **📚 Educational Notes**: Auto-generated learning content based on user activity
- **🎯 SMART Goals**: Tasks designed to be Specific, Measurable, Achievable, Relevant, Time-bound
- **📈 Progress Tracking**: Level-based scoring system with category bonuses
- **🔄 Anti-Repetition Logic**: Intelligent variety enforcement to prevent task monotony

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PERSONAL ASSISTANT SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   FRONTEND UI   │    │  BUSINESS LOGIC │    │  DATA STORAGE   │            │
│  │   COMPONENTS    │◄──►│    SERVICES     │◄──►│     LAYER       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│          │                        │                        │                   │
│          ▼                        ▼                        ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │    ROUTING      │    │   AI SERVICES   │    │  CHROME/LOCAL   │            │
│  │   NAVIGATION    │    │   (GEMINI API)  │    │    STORAGE      │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Components

- **🏠 HomePage**: Input interface and task prediction
- **📋 ResponsePage**: Task display and completion interface
- **💬 ChatPage**: Interactive conversation with context awareness
- **📊 DashboardPage**: Comprehensive analytics and management
- **🏆 ScoreWidget**: Global score and level display

---

## 🔄 User Journey Flow

```
USER INPUT → CONTEXT EXTRACTION → AI PROCESSING → TASK PREDICTION → INTERACTION
     │              │                    │              │              │
     ▼              ▼                    ▼              ▼              ▼
┌─────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│HomePage │   │  ChatPage   │   │ Prediction  │   │ Response    │   │ Dashboard   │
│         │──►│             │   │  Service    │──►│    Page     │   │    Page     │
│• Input  │   │• Messages   │   │             │   │             │   │             │
│• Predict│   │• Context    │   │• Gather Data│   │• Show Task  │   │• Analytics  │
│• Chat   │   │• Extract    │   │• Priority   │   │• Complete   │   │• Management │
└─────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 🛠️ Tech Stack

### Core Technologies

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Modules
- **AI Integration**: Google Gemini API
- **Storage**: Chrome Extension API + localStorage fallback
- **Routing**: React Router (Memory Router)

### Development Tools

- **Linting**: ESLint (React + TypeScript + Hooks + a11y)
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm

---

## 📁 Project Structure

```
base-truths/
├── public/
│   ├── manifest.json         # Chrome Extension Manifest V3
│   └── icon128.png          # Extension icon
├── src/
│   ├── features/
│   │   └── nextTaskPredictor/
│   │       ├── components/   # UI Components
│   │       │   ├── HomePage.tsx
│   │       │   ├── ResponsePage.tsx
│   │       │   ├── ChatPage.tsx
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── ScoreWidget.tsx
│   │       │   └── Popup.tsx
│   │       ├── data-layer/   # Data Management
│   │       │   ├── conversationStorage.ts
│   │       │   ├── userProfileStorage.ts
│   │       │   ├── taskStorage.ts
│   │       │   ├── scoreStorage.ts
│   │       │   ├── notesStorage.ts
│   │       │   ├── prompts.ts
│   │       │   └── geminiApi.ts
│   │       ├── services/     # Business Logic
│   │       │   ├── predictService.ts
│   │       │   ├── contextService.ts
│   │       │   ├── analysisService.ts
│   │       │   ├── scoringService.ts
│   │       │   └── noteGenerationService.ts
│   │       ├── constants/    # Configuration
│   │       │   ├── taskCategories.ts
│   │       │   └── interactiveTasks.ts
│   │       └── hooks/        # Custom Hooks
│   │           └── usePrediction.ts
│   ├── main.tsx             # Application entry point
│   └── styles.css           # Global styles
├── index.html               # Vite HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Chrome Browser

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd EAGV2/base-truths
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Development**
   ```bash
   npm run dev          # Start development server
   npm run build        # Build for production
   npm run preview      # Preview production build
   npm run lint         # Run ESLint
   ```

### Chrome Extension Setup

1. **Build the extension**

```bash
   npm run build
```

2. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder
   - Pin the extension to your toolbar

---

## 🎮 Usage Guide

### Basic Workflow

1. **📝 Input Context**: Enter your current situation, goals, or preferences
2. **🎯 Predict Task**: AI generates a personalized, actionable task
3. **💬 Interact**: Chat about the task or ask for clarification
4. **✅ Complete**: Mark tasks as complete to earn points and level up
5. **📊 Track Progress**: Monitor your development in the dashboard

### Features Deep Dive

#### 🧠 Task Prediction System

- **Priority-based**: User input > Professional growth > Personal growth > Foundational
- **SMART Goals**: All tasks are designed to be achievable within 30 minutes
- **Anti-repetition**: Intelligent logic prevents monotonous suggestions
- **Context-aware**: Considers your profession, mood, and recent activity

#### 📊 Scoring System

- **Base Points**: 5 points for task completion
- **Category Bonuses**: Additional points based on task type
- **Level Progression**: 100 points per level
- **Interactive Tasks**: Special scoring for AI interactions

#### 📚 Learning Notes

- **Auto-generation**: Creates educational content based on your activity
- **Profession-focused**: Tailored to your specific field
- **Request-based**: Generate notes on specific topics via chat
- **Scrollable Interface**: Organized accordion-style display

---

## 🔧 Configuration

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Gemini API Integration

The system uses Google's Gemini API for intelligent task prediction and context extraction. Obtain an API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

---

## 📈 Roadmap

### Current Features (MVP1) ✅

- Task prediction with context awareness
- Interactive chat interface
- Comprehensive scoring system
- Dashboard analytics
- Educational note generation
- Anti-repetition logic

### Planned Features (MVP2) 🚧

- **Multi-Agent Architecture**: Specialized AI agents for different domains
- **Advanced Analytics**: Deeper insights into productivity patterns
- **Calendar Integration**: Task scheduling and time management
- **Collaborative Features**: Team productivity insights
- **Mobile Companion**: Cross-platform synchronization

---

## 🧪 Development

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: React, TypeScript, hooks, and accessibility rules
- **Prettier**: Consistent code formatting
- **Modular Architecture**: Clear separation of concerns

### Testing

```bash
npm run lint         # Code quality checks
npm run build        # Production build verification
```

### Debugging

- Console logging throughout the application
- Chrome DevTools integration
- Error boundaries for robust error handling

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain component modularity
- Write descriptive commit messages
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini**: AI processing capabilities
- **React Team**: Frontend framework
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling

---

## 📞 Support

For questions, suggestions, or issues:

- Create an issue in the repository
- Check the architecture documentation in `ARCHITECTURE.md`
- Review the visual architecture in `VISUAL_ARCHITECTURE.md`

---

**Built with ❤️ for mindful productivity and personal growth**
