# Products Application

This application allows users to select products and apply discounts to them.

## Environment Variables

The application uses the following environment variables:

- `VITE_API_KEY`: API key for authentication
- `VITE_API_BASE_URL`: Base URL for the API

These variables are stored in a `.env` file in the root directory.

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_KEY=your_api_key
   VITE_API_BASE_URL=your_base_url
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Features

- Select products from a list
- Apply discounts to products and variants
- Drag and drop to reorder products and variants
- Search for products 

## Architecture

### Technology Stack

- **React**: Chosen as the primary frontend library for its component-based architecture, which allows for reusable UI components and efficient rendering through the virtual DOM.
- **Vite**: Used as the build tool for its fast development server and optimized production builds. Vite provides near-instantaneous hot module replacement (HMR) during development.
- **Tailwind CSS**: Implemented for styling to enable rapid UI development with utility classes. This approach reduces the need for custom CSS and ensures consistent styling across the application.
- **Framer Motion**: Integrated for animations to enhance user experience with smooth transitions and interactive elements.

### Application Structure

The application follows a modular architecture with the following key components:

1. **App Component**: The main container that manages routing and global state.
2. **ProductPicker**: Handles the product selection interface with search and filtering capabilities.
3. **ProductSelectionPopup**: Manages the modal interface for selecting products and variants.
4. **UI Components**: Reusable components like buttons, inputs, and cards that maintain consistent styling.

### State Management

- **React Hooks**: Used for local component state management (useState, useEffect).
- **Context API**: Implemented for sharing state between components without prop drilling.
- **Custom Hooks**: Created for reusable logic and side effects, improving code organization and testability.

### Performance Considerations

1. **Code Splitting**: Implemented to reduce the initial bundle size and improve load times.
2. **Memoization**: Used React.memo and useMemo to prevent unnecessary re-renders.
3. **Virtualization**: Applied for long lists to render only visible items, improving performance when dealing with large datasets.
4. **Optimized Assets**: Images and SVGs are optimized for web to reduce load times.

### Responsive Design

The application is built with a mobile-first approach, ensuring a seamless experience across devices:
- Fluid layouts that adapt to different screen sizes
- Responsive typography and spacing
- Touch-friendly interactions for mobile users
- Optimized UI components for different viewport sizes

### Accessibility

- Semantic HTML elements for better screen reader support
- ARIA attributes where necessary
- Keyboard navigation support
- Sufficient color contrast for text readability

### Reasoning Behind Architecture Choices

1. **React + Vite**: This combination provides an excellent developer experience with fast refresh times while ensuring optimized production builds. Vite's modern approach to bundling leverages ES modules for development, resulting in faster startup times compared to webpack-based solutions.

2. **Tailwind CSS**: Chosen over other styling solutions for its utility-first approach, which speeds up development and ensures consistency. The purging mechanism in production eliminates unused CSS, resulting in minimal bundle sizes.

3. **Component-Based Structure**: Breaking the UI into reusable components improves maintainability and allows for parallel development by different team members.

4. **Framer Motion**: Selected for animations because it provides a declarative API that integrates well with React's component model, making complex animations more manageable.

5. **Context API vs Redux**: For this application's scope, Context API provides sufficient state management without the additional complexity of Redux. This decision simplifies the codebase while still allowing for effective state sharing between components.

For detailed setup and deployment instructions, please refer to [SETUP.md](./SETUP.md). 