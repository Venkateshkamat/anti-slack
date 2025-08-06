# Roommate Duties Tracker - Frontend Structure

This document explains the modular structure of the frontend application.

## 📁 Project Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── DutyTracker.js    # Main duty tracking interface
│   ├── ManagementPanel.js # Users and tasks management
│   └── TabNavigation.js  # Tab navigation component
├── hooks/               # Custom React hooks
│   └── useDutyData.js   # Data management hook
├── services/            # API and external services
│   └── api.js          # API service layer
├── App.js              # Main application component
├── App.css             # Main stylesheet
└── index.css           # Global styles
```

## 🧩 Components

### `App.js` - Main Application
- **Purpose**: Root component that orchestrates the entire application
- **Responsibilities**:
  - Manages active tab state
  - Renders header and navigation
  - Conditionally renders main content based on active tab
- **Dependencies**: All other components and the `useDutyData` hook

### `TabNavigation.js` - Navigation Component
- **Purpose**: Handles tab switching between Duty Tracker and Management
- **Props**:
  - `activeTab`: Current active tab
  - `setActiveTab`: Function to change active tab
- **Features**: Styled tab buttons with active states

### `DutyTracker.js` - Duty Tracking Interface
- **Purpose**: Main interface for adding duties and viewing charts
- **Props**: All data and handlers from `useDutyData` hook
- **Features**:
  - Duty submission form
  - Bar chart for total tasks per user
  - Line chart for tasks over time with date range filtering
  - Responsive design

### `ManagementPanel.js` - Management Interface
- **Purpose**: Interface for managing users and tasks
- **Props**: All data and handlers from `useDutyData` hook
- **Features**:
  - Add/delete users
  - Add/delete tasks
  - Confirmation dialogs for deletions
  - Grid layout for side-by-side management

## 🎣 Custom Hooks

### `useDutyData.js` - Data Management Hook
- **Purpose**: Centralized data management and API interactions
- **State Management**:
  - Users and tasks lists
  - Form states for duty submission
  - Chart data (total tasks, per-user-per-date)
  - Date range for filtering
- **API Functions**:
  - `fetchUsersAndTasks()`: Load users and tasks
  - `fetchStats()`: Load chart statistics
  - `handleSubmit()`: Submit new duty
  - `handleAddUser()`: Add new user
  - `handleAddTask()`: Add new task
  - `handleDeleteUser()`: Delete user with validation
  - `handleDeleteTask()`: Delete task with validation

## 🔌 Services

### `api.js` - API Service Layer
- **Purpose**: Centralized API communication
- **Features**:
  - Axios instance with default configuration
  - Organized API endpoints by functionality
  - Error handling utilities
  - Timeout and retry logic
- **API Groups**:
  - `usersAPI`: User management endpoints
  - `tasksAPI`: Task management endpoints
  - `dutiesAPI`: Duty submission endpoints
  - `statsAPI`: Statistics endpoints

## 🎨 Styling

### `App.css` - Component Styles
- Bootstrap-like design system
- Responsive layouts
- Interactive elements (buttons, forms, cards)
- Animations and transitions

### `index.css` - Global Styles
- CSS reset and base styles
- Typography and spacing
- Focus states and accessibility
- Form element styling

## 🔄 Data Flow

1. **Initialization**: `useDutyData` hook loads initial data on mount
2. **User Interaction**: Components trigger handlers from the hook
3. **API Calls**: Handlers use services to communicate with backend
4. **State Updates**: Successful API calls update local state
5. **UI Updates**: Components re-render with new data

## 🚀 Benefits of This Structure

### **Separation of Concerns**
- UI components focus only on presentation
- Business logic is centralized in hooks
- API communication is isolated in services

### **Reusability**
- Components can be easily reused
- Hooks can be shared across components
- Services can be used by multiple hooks

### **Maintainability**
- Clear file organization
- Easy to locate and modify specific functionality
- Reduced coupling between components

### **Testability**
- Components can be tested in isolation
- Hooks can be tested independently
- Services can be mocked for testing

### **Scalability**
- Easy to add new features
- Simple to extend existing functionality
- Clear patterns for new developers

## 🔧 Adding New Features

1. **New Component**: Create in `components/` directory
2. **New Hook**: Create in `hooks/` directory for data management
3. **New API**: Add to appropriate service in `services/` directory
4. **New Styles**: Add to `App.css` or create component-specific CSS

## 📝 Best Practices

- Keep components focused on a single responsibility
- Use props for data flow between components
- Centralize API calls in services
- Use custom hooks for complex state management
- Maintain consistent naming conventions
- Add proper error handling and loading states 