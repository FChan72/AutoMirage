# AutoMirage
A platform for instant automation of routine tasks via an AI assistant and ready-made code templates.

## Features

- 🤖 AI assistant for creating automations
- 📦 Ready-made templates for popular tasks
- ⚡ Instant results without installing software
- 🔒 Secure data storage
- 💰 Flexible pricing system

## Installation

1. Clone the repository:
git clone https://github.com/yourusername/automirage.git
cd automirage
```
2. Create a virtual environment and activate it:

python -m venv venv
source venv/bin/activate  # for Linux/Mac
venv\Scripts\activate    # for Windows
```
3.Install dependencies:

pip install -r requirements.txt
```
4. Create a .env file in the root directory:
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
```
5.Initialize the database:

flask db init
flask db migrate
flask db upgrade
```
## Running
1. Start the development server:

flask run
2. Open http://localhost:5000 in your browser
```
## Project Structure
automirage/
├── app.py          # Main application file                                              
├── requirements.txt  # Project dependencies                                                        
├── static/         # Static files                                                                 
│   ├── css/        # Styles                                                              
│   ├── js/         # JavaScript files                                                 
│   └── images/     # Images                                                          
└── templates/      # HTML templates                                                                             
``
## Technologies
Frontend: HTML5, CSS3, JavaScript
Backend: Python, Flask
Database: SQLite
AI: OpenAI GPT-4
``
## License
MIT License
