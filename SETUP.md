# Setup and Deployment Guide

This document provides detailed instructions for setting up, using, and deploying the Products Application.

## Local Development Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher) or yarn (v1.22.0 or higher)
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Task
   ```

2. **Environment Configuration**

   Create a `.env` file in the root directory with the following variables:

   ```
   VITE_API_KEY=your_api_key
   VITE_API_BASE_URL=your_base_url
   ```

   For development purposes, you can use:
   ```
   VITE_API_KEY=dev_key
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Using yarn:
   ```bash
   yarn install
   ```

4. **Start the development server**

   Using npm:
   ```bash
   npm run dev
   ```

   Using yarn:
   ```bash
   yarn dev
   ```

   The application will be available at `http://localhost:5173` by default.

## Usage Guide

### Product Management

1. **Accessing the Product Management Interface**
   - Navigate to the home page
   - Click on "Get Started Free" or use the "Products" navigation link

2. **Selecting Products**
   - Click the "Add Products" button
   - Use the search bar to find specific products
   - Filter products by category using the dropdown
   - Select products by clicking on them
   - Click "Add Selected" to add them to your list

3. **Managing Product Variants**
   - Expand a product to see its variants
   - Select/deselect variants as needed
   - Use the checkbox to select all variants at once

4. **Applying Discounts**
   - Click the "Apply Discount" button on a product or variant
   - Choose between percentage or fixed amount discount
   - Enter the discount value
   - Click "Apply" to save the discount

5. **Reordering Products**
   - Drag and drop products to change their order
   - Use the handle icon on the left side of each product card

### Keyboard Shortcuts

- `Ctrl/Cmd + F`: Focus the search bar
- `Esc`: Close any open modal
- `Enter`: Confirm selection in modals
- `Tab`: Navigate through interactive elements

## Production Deployment

### Building for Production

1. **Create an optimized production build**

   Using npm:
   ```bash
   npm run build
   ```

   Using yarn:
   ```bash
   yarn build
   ```

   This will generate a `dist` directory with the production-ready files.

2. **Preview the production build locally**

   Using npm:
   ```bash
   npm run preview
   ```

   Using yarn:
   ```bash
   yarn preview
   ```

### Deployment Options

#### Option 1: Static Hosting (Recommended)

The application can be deployed to any static hosting service:

1. **Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in the Netlify dashboard

2. **Vercel**
   - Connect your repository to Vercel
   - Vercel will automatically detect Vite and configure the build settings
   - Add environment variables in the Vercel dashboard

3. **GitHub Pages**
   - Update `vite.config.js` to include your base path:
     ```js
     export default defineConfig({
       base: '/your-repo-name/',
       // other config
     })
     ```
   - Run `npm run build`
   - Deploy the `dist` folder to GitHub Pages

#### Option 2: Docker Deployment

1. **Create a Dockerfile**

   ```dockerfile
   FROM node:16-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**

   ```
   server {
     listen 80;
     server_name _;
     root /usr/share/nginx/html;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

3. **Build and run the Docker container**

   ```bash
   docker build -t products-app .
   docker run -p 8080:80 -d products-app
   ```

## Troubleshooting

### Common Issues

1. **API Connection Problems**
   - Verify that your `.env` file contains the correct API URL and key
   - Check browser console for CORS errors
   - Ensure the API server is running and accessible

2. **Build Failures**
   - Clear the node_modules folder and package-lock.json, then reinstall dependencies
   - Update Node.js to the latest LTS version
   - Check for syntax errors in your code

3. **Styling Issues**
   - Run `npm run build:css` to regenerate Tailwind styles
   - Clear browser cache
   - Check for conflicting CSS rules

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-repo/issues) for similar problems
2. Consult the documentation for the specific technology causing issues
3. Reach out to the development team via the project's communication channels

## Testing

### Running Tests

The application includes a suite of tests to ensure functionality works as expected.

1. **Run all tests**

   ```bash
   npm run test
   ```

2. **Run tests in watch mode**

   ```bash
   npm run test:watch
   ```

3. **Generate test coverage report**

   ```bash
   npm run test:coverage
   ```

   The coverage report will be available in the `coverage` directory.

### Writing New Tests

When adding new features, please follow these guidelines for writing tests:

1. Place test files next to the component they test with a `.test.jsx` extension
2. Use descriptive test names that explain the expected behavior
3. Mock external dependencies to isolate the component being tested
4. Test both success and failure scenarios

## Maintenance

### Updating Dependencies

Regularly update dependencies to ensure security and access to new features:

```bash
npm update
```

For major version updates, review the changelog of each package to identify breaking changes.

### Performance Monitoring

Monitor the application's performance in production using tools like:

- Lighthouse for overall performance metrics
- Chrome DevTools Performance tab for runtime performance
- React DevTools Profiler for component rendering performance 