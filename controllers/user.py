from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.models import db, User, Subject, Chapter, Quiz, Question, Score
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from sqlalchemy import text


user_bp = Blueprint('user', __name__)

# ✅ User Registration Route
@user_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form['full_name']
        email = request.form['email']
        password = request.form['password']
        qualification = request.form['qualification']
        dob = request.form['dob']
        # Convert date_of_quiz from string to Date
        try:
            dob = datetime.strptime(dob, "%Y-%m-%d").date()
        except ValueError:
            flash("Invalid date format!", "danger")
            return redirect(url_for("admin.add_quiz"))

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered. Please login.', 'danger')
            return redirect(url_for('user.login'))

        # Hash the password
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Create new user
        new_user = User(full_name=full_name, email=email, password=hashed_password, qualification=qualification, dob=dob)
        db.session.add(new_user)
        db.session.commit()

        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('user.login'))

    return render_template('user/register.html')

# ✅ User Login Route
@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            print("User ID stored in session:", session['user_id'])
            login_user(user)  # Flask-Login handles session
            flash('Login successful!', 'success')
            return redirect(url_for('user.dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')

    return render_template('user/login.html')

# ✅ User Logout Route
@user_bp.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

# ✅ User Dashboard
@user_bp.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_authenticated:
        flash("Please log in to access this page.", "warning")
        return redirect(url_for('user.login'))
    user = User.query.get(session['user_id'])
    subjects = Subject.query.all()
    quizzes = Quiz.query.all()
    current_date = datetime.now().strftime('%Y-%m-%d')
    questions=Question.query.all()

    return render_template('user/dashboard.html', user=user, subjects=subjects, quizzes=quizzes, questions=questions, current_date=current_date)

# Scores
@user_bp.route('/scores')
@login_required
def scores():
    user_id = session.get('user_id')
    quizzes=Quiz.query.all()
    scores=Score.query.all()
    user=User.query.get(user_id)

    return render_template('user/scores.html', scores=scores, quizzes =quizzes, user_id=user_id, user=user)

#Summary
@user_bp.route('/summary_data')
@login_required
def user_summary_data():
    user_id = session.get('user_id')

    # Query to count quizzes per subject
    query1 = text("""          
        SELECT Q.subject_name , SUM(S.total_scored) *100/ SUM(Q.total_marks) AS quiz_count
        FROM quiz Q JOIN score S ON Q.id=S.quiz_id
        where s.user_id= :user_id
        GROUP BY Q.subject_name
    """)
    subject_percent_counts = db.session.execute(query1, {'user_id': user_id}).fetchall()
    subject_percent_counts = {row[0]: row[1] for row in subject_percent_counts}

    # Query to count quizzes attempted per month
    query2 = text("""
        SELECT strftime('%m', sc.time_stamp_of_attempt) AS month, COUNT(sc.id) AS attempt_count
        FROM score sc
        WHERE sc.user_id = :user_id
        GROUP BY month
    """)
    monthly_quiz_attempts = db.session.execute(query2, {'user_id': user_id}).fetchall()
    monthly_quiz_attempts = {row[0]: row[1] for row in monthly_quiz_attempts}

    return jsonify({'subjectQuizCounts': subject_percent_counts, 'monthlyQuizAttempts': monthly_quiz_attempts})

@user_bp.route('/summary')
@login_required
def summary():
    if 'user_id' not in session:
        return redirect(url_for('user.login'))
    user_id = session.get('user_id')
    user=User.query.get(user_id)
    return render_template('user/user_summary.html', user=user)


@user_bp.route('/search')
def search():
    query = request.args.get('q', '').strip().lower()
    user_id = session.get('user_id')
    
    # Join Quiz and Score tables on quiz.id = score.quiz_id
    quiz_scores = db.session.query(
        Quiz.id.label("quiz_id"),
        Quiz.name.label("quiz_name"),
        Quiz.subject_name.label("subject_name"),
        Score.user_id.label("user_id"),
        Quiz.date_of_quiz.label("quiz_date"),
        Score.total_scored.label("score")
    ).join(Score, Quiz.id == Score.quiz_id).filter(
        Score.total_scored.ilike(f"%{query}%")  # Searching for quiz names that match query
    ).filter(
        Score.user_id == user_id
    )

    quiz_date = db.session.query(
        Quiz.id.label("quiz_id"),
        Quiz.name.label("quiz_name"),
        Quiz.subject_name.label("subject_name"),
        Score.user_id.label("user_id"),
        Quiz.date_of_quiz.label("quiz_date"),
        Score.total_scored.label("score")
    ).join(Score, Quiz.id == Score.quiz_id).filter(
        Quiz.date_of_quiz.ilike(f"%{query}%")  # Searching for quiz names that match query
    ).filter(
        Score.user_id == user_id
    )

    # Format response
    return jsonify({
        "quiz_scores": [
            {
                "quiz_id": qs.quiz_id,
                "quiz_name": qs.quiz_name,
                "subject_name": qs.subject_name,
                "quiz_date": qs.quiz_date.strftime("%Y-%m-%d") if qs.quiz_date else "N/A",
                "score": qs.score
            }
            for qs in quiz_scores
        ],
        "quiz_date": [
            {
                "quiz_id": qs.quiz_id,
                "quiz_name": qs.quiz_name,
                "subject_name": qs.subject_name,
                "quiz_date": qs.quiz_date.strftime("%Y-%m-%d") if qs.quiz_date else "N/A",
                "score": qs.score
            }
            for qs in quiz_date
        ]
    })
# Update Profile
@user_bp.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    user = User.query.get(current_user.id)
    user.full_name = request.form['full_name']
    user.email = request.form['email']
    if request.form['old_password'] != None:
        if check_password_hash(user.password, request.form['old_password']) and request.form['new_password']==request.form['confirm_password']:
            user.password = generate_password_hash(request.form['new_password'], method='pbkdf2:sha256')
    db.session.commit()
    flash("Profile updated!", "success")
    return redirect(request.referrer or url_for('user.dashboard'))




# ✅ View Quiz - Show Chapters
@user_bp.route('/view_quiz/<int:quiz_id>')
@login_required
def view_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)  # Fetch quiz details from DB
    question = Question.query.filter_by(quiz_id=quiz_id).first()
    return render_template('user/view_quiz.html', quiz=quiz, question=question)


# ✅ Attempt Quiz - Show Questions
# ✅ Start Quiz - Display All Questions on One Page
@user_bp.route('/start_quiz/<int:quiz_id>', methods=['GET', 'POST'])
@login_required
def start_quiz(quiz_id):
    if 'user_id' not in session:
        return redirect(url_for('user.login'))

    quiz = Quiz.query.get_or_404(quiz_id)
    questions = Question.query.filter_by(quiz_id=quiz_id).order_by(Question.id).all()
    user_id = session['user_id']

    # Check if the user already attempted the quiz
    existing_score = Score.query.filter_by(quiz_id=quiz.id, user_id=user_id).first()

    if request.method == 'POST':
        selected_answers = {int(q_id): int(request.form[q_id]) for q_id in request.form}

        # Calculate new score
        score = 0
        for q in questions:
            if selected_answers.get(q.id) == q.correct_option:
                score += q.marks

        # Determine the timestamp (use quiz.date if available, otherwise use current UTC time)
        attempt_timestamp = quiz.date_of_quiz if quiz.date_of_quiz else datetime.utcnow()
        # If user already attempted, update their score
        if existing_score:
            existing_score.total_scored = score  # Update score
            existing_score.time_stamp_of_attempt = attempt_timestamp 
        else:
            # Create new score entry if not found
            existing_score = Score(
                quiz_id=quiz.id,
                chapter_id=quiz.chapter_id,
                user_id=user_id,
                total_scored=score,
                time_stamp_of_attempt=attempt_timestamp)
            db.session.add(existing_score)

        db.session.commit()

        return redirect(url_for('user.scores'))

    return render_template('user/start_quiz.html', quiz=quiz, questions=questions)

# ✅ Quiz Result - Display Score
@user_bp.route('/quiz_result')
@login_required
def quiz_result():
    if 'user_id' not in session:
        return redirect(url_for('user.login'))

    score = request.args.get('score', 0, type=int)
    total_questions = request.args.get('total_questions', 1, type=int)

    return render_template('user/quiz_result.html', score=score, total_questions=total_questions)

from flask import get_flashed_messages

@user_bp.route("/check_flash")
def check_flash():
    messages = get_flashed_messages(with_categories=True)
    print("Flash Messages:", messages)  # This will print in the terminal
    return "Check your terminal!"