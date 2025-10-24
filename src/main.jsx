import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Beautiful welcome message
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🎉 Welcome to Mark to PDF Converter! 🎉                  ║
║                                                              ║
║    ✨ Transform your Markdown files into beautiful PDFs ✨   ║
║                                                              ║
║    🚀 Ready to convert your documents! 🚀                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`)

console.log(`
🌟 Features:
   • 📝 Markdown to PDF conversion
   • 🎨 Beautiful styling and formatting
   • 📱 Responsive design
   • 🌍 Multi-language support
   • ⚡ Fast and efficient processing
`)

console.log(`
💡 Getting Started:
   1. Paste your Markdown content
   2. Customize the styling
   3. Click 'Generate PDF'
   4. Download your beautiful PDF!
`)

console.log(`
🎯 Happy converting! Let's turn your ideas into professional documents!
`)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
