# Literature Game - Development Instructions

## 🎯 Teaching Approach

### **Step-by-Step Learning Process**
For each development phase, we follow this educational structure:

1. **📚 THEORY EXPLANATION**
   - Explain what technology/concept we're implementing
   - Why this technology is the right choice for our use case
   - How it fits into the overall architecture
   - Key concepts and terminology

2. **🔧 IMPLEMENTATION PLAN**
   - What files we'll create/modify
   - What functionality we'll build
   - How it integrates with existing code

3. **💻 HANDS-ON CODING**
   - Implement the planned features
   - Test and verify functionality
   - Document progress

4. **🧠 KEY LEARNINGS**
   - What we learned from this phase
   - Important decisions made
   - Best practices discovered

### **Educational Goals**
- Understand **why** each technology choice was made
- Learn the **theory** behind each implementation
- Build **practical experience** with real-world tools
- Develop **best practices** for full-stack development

---

## 🏗️ Architecture Overview

### **Monorepo Structure**
```
literature/
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared types & game engine
└── package.json     # Workspace configuration
```

### **Technology Stack Reasoning**
- **TypeScript**: Type safety across client/server boundaries
- **React**: Component-based UI with great ecosystem
- **Express**: Simple, flexible Node.js web framework
- **Socket.io**: Real-time bidirectional communication
- **Vite**: Fast development and optimized builds

---

## 📋 Development Phases

### **Phase 0.x - Foundation Setup** ✅
- Monorepo workspace configuration
- TypeScript setup across packages
- Shared type definitions

### **Phase 1.x - Game Engine** ✅  
- Core Literature game logic
- Move validation and execution
- Claiming system and game ending

### **Phase 2.x - Backend Server** (Next)
- Express server with Socket.io
- Real-time multiplayer communication
- Game room management

### **Phase 3.x - Frontend Client**
- React UI components
- Game interface design
- Socket.io client integration

### **Phase 4.x - Integration & Polish**
- End-to-end testing
- Error handling
- UI/UX improvements

---

## 🎓 Learning Methodology

**Before each implementation:**
1. Explain the technology and concepts
2. Justify why it's the right choice
3. Show how it fits the bigger picture
4. Plan the implementation approach

**During implementation:**
1. Build incrementally with explanations
2. Test each piece as we go
3. Document decisions and learnings

**After each phase:**
1. Review what was accomplished
2. Update progress documentation
3. Plan the next logical step 

## 🕹️ Playing the Game (UI Overview)
- Your hand is now displayed at the bottom of the screen, grouped by suit (♥ ♦ ♣ ♠) in a horizontal row for easy viewing.
- The turn indicator is at the top center, always showing whose turn it is.
- Your player name and team are shown above your hand.
- Opponent hands are shown around the oval table with only 1-2 cards visible for clarity.
- Score and claimed sets are always visible at the top right. 