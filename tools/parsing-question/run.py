"""
LaTeX Question Parser - Main Entry Point

Run this script to start the Streamlit application for parsing LaTeX questions.

Usage:
    python run.py
    
Or with Streamlit directly:
    streamlit run run.py
"""

import sys
import os
import subprocess

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def main():
    """Main entry point for the application."""
    
    # Check if running with Streamlit
    if 'streamlit' in sys.modules:
        # Running with streamlit run command
        from ui.app import main as app_main
        app_main()
    else:
        # Running directly with python
        print("🚀 Starting LaTeX Question Parser...")
        print("📝 This application converts LaTeX questions to CSV format")
        print()
        
        # Check if streamlit is installed
        try:
            import streamlit
            print("✅ Streamlit found")
        except ImportError:
            print("❌ Streamlit not found. Please install it:")
            print("   pip install streamlit")
            return
        
        # Check other dependencies
        required_packages = [
            'pandas',
            'multiprocessing'
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package)
                print(f"✅ {package} found")
            except ImportError:
                missing_packages.append(package)
                print(f"❌ {package} not found")
        
        if missing_packages:
            print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
            print("Please install them with:")
            print(f"   pip install {' '.join(missing_packages)}")
            return
        
        print("\n🌐 Starting Streamlit server...")
        print("📱 The application will open in your web browser")
        print("🛑 Press Ctrl+C to stop the server")
        print()
        
        # Start Streamlit
        try:
            subprocess.run([
                sys.executable, '-m', 'streamlit', 'run', __file__,
                '--server.address', 'localhost',
                '--server.port', '8501',
                '--browser.gatherUsageStats', 'false'
            ])
        except KeyboardInterrupt:
            print("\n👋 Application stopped by user")
        except Exception as e:
            print(f"\n❌ Error starting application: {str(e)}")


if __name__ == "__main__":
    main()
