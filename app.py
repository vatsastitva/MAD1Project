from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from models.models import db, bcrypt
from controllers.auth import auth_bp, login_manager
from controllers.admin import admin_bp
from controllers.user import user_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'  # Change this to a secure key

@app.route('/')
def home():
    return render_template('home.html')
# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)

# Register authentication blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(user_bp, url_prefix='/user')


# Define routes
if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True, port=5001)