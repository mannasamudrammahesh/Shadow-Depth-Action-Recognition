# Shadow-Depth Action Recognition

A real-time computer vision application that uses physics-based shadow analysis and depth estimation to recognize hand-to-mouth actions. Built with advanced computer vision techniques, this system analyzes shadows cast by hands to calculate 3D distances and classify actions with high accuracy.

## 🎥 Demo

Watch the live demonstration of the Shadow-Depth Action Recognition system in action:

[![Shadow-Depth Action Recognition Demo](https://img.youtube.com/vi/wcVjnqYEliA/maxresdefault.jpg)](https://youtu.be/wcVjnqYEliA)

**[🎬 View Demo on YouTube](https://youtu.be/wcVjnqYEliA)**

## 🚀 Features

- **Real-time Action Recognition**: Detects and classifies hand movements (safe, approaching, touching, eating)
- **Physics-Based Depth Estimation**: Uses shadow analysis and the inverse square law to calculate 3D distances
- **Advanced Computer Vision**: Integrates MediaPipe for hand and face landmark detection
- **Interactive Visualizations**: 
  - Real-time shadow heatmaps
  - Light vector visualization
  - Distance overlays
  - Debug panels with physics calculations
- **Customizable Settings**: Adjustable thresholds, sensitivity, and visualization modes
- **Responsive Design**: Works across desktop and mobile devices

## 🧠 How It Works

The system combines multiple computer vision and physics principles:

1. **MediaPipe Integration**: Detects hand and facial landmarks in real-time
2. **Light Source Estimation**: Analyzes facial shading gradients to determine light direction
3. **Shadow Projection**: Calculates shadow boundaries using geometric projection
4. **Physics-Based Depth**: Uses the formula `Z = k × √(Shadow_Area) × (1/Shadow_Sharpness) × cos(θ)` 
5. **Action Classification**: Classifies actions based on calculated hand-to-mouth distance

## 🛠 Technologies Used

- **React 18** with TypeScript for the frontend
- **MediaPipe Tasks Vision** for AI-powered hand and face detection
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Custom Physics Engine** for shadow analysis and depth estimation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shadow-Depth-Action-Recognition
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🎯 Usage

1. **Start Camera**: Click the camera button to begin video capture
2. **Position Yourself**: Ensure your face and hands are visible in the frame
3. **Adjust Settings**: Use the control panel to fine-tune detection parameters
4. **View Analysis**: Watch real-time distance calculations and action classifications
5. **Explore Visualizations**: Enable heatmaps, light vectors, and debug info for detailed insights

## 🔧 Configuration

The application offers extensive customization options:

- **Distance Threshold**: Adjust the sensitivity for action detection
- **Shadow Sensitivity**: Control how shadows are analyzed
- **Light Mode**: Choose between automatic light detection or manual positioning
- **Visualization Options**: Toggle heatmaps, light vectors, and debug information

## 🧪 Physics & Algorithms

### Shadow Analysis
- Implements geometric shadow projection based on light source direction
- Uses convex hull algorithms for shadow boundary detection
- Applies the inverse square law for light intensity calculations

### Depth Estimation
- Combines 2D landmark distances with shadow-based depth cues
- Incorporates light angle compensation for improved accuracy
- Provides confidence scores based on detection quality

### Action Classification
- Multi-threshold system for action categorization
- Real-time confidence scoring
- Temporal smoothing for stable classifications

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

### Deployment Options
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **Any Static Host**: Upload the contents of `dist` to your hosting provider

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📧 Contact

For questions or feedback about this project, please open an issue on GitHub.
