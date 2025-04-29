from flask import Blueprint, render_template, redirect, url_for, request, flash, session, jsonify
from models.models import db, Subject, Chapter, Quiz, Question, User, Score
from functools import wraps
from datetime import datetime
from sqlalchemy import text


# Create Blueprint for admin routes
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# Admin authentication (Only 1 admin exists)
ADMIN_USERNAME = "vatsaastitva23@gmail.com"
ADMIN_PASSWORD = "iitm"  # Change this in a secure way

# Decorator for protecting admin routes
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("admin_logged_in") is None:
            flash("Access restricted! Please log in as Admin.", "danger")
            return redirect(url_for("admin.admin_login"))
        return f(*args, **kwargs)
    return decorated_function

# Admin login route
@admin_bp.route("/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form["email"]
        password = request.form["password"]
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["admin_logged_in"] = True
            flash("Welcome Admin!", "success")
            return redirect(url_for("admin.dashboard"))
        flash("Invalid credentials!", "danger")
    return render_template("admin/login.html")

# Admin logout
@admin_bp.route("/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    flash("Logged out successfully!", "info")
    return redirect(url_for("home"))

# Admin dashboard
@admin_bp.route("/dashboard")
@admin_required
def dashboard():
    subjects = Subject.query.all()
    quizes=Quiz.query.all()
    return render_template("admin/dashboards.html", subjects=subjects, quizes=quizes)


# Quizzes
@admin_bp.route('/quizzes')
@admin_required
def quizzes():
    all_quizzes = Quiz.query.all()
    questions = Question.query.all()
    subjects = Subject.query.all()
    return render_template("admin/quizzes.html", quizzes=all_quizzes, questions=questions, subjects=subjects)


# Summary

@admin_bp.route('/summary_data')
@admin_required
def summary_data():
    query1 = text("""
        SELECT q.subject_name, MAX(sc.total_scored) AS highest_score
        FROM quiz q
        JOIN score sc ON q.id = sc.quiz_id
        GROUP BY q.subject_name
    """)
    highest_scores = db.session.execute(query1).fetchall()
    highest_scores = {row[0]: row[1] for row in highest_scores}

    query2 = text("""
        SELECT q.subject_name, COUNT(sc.id) AS user_attempts 
        FROM quiz q 
        JOIN score sc ON q.id = sc.quiz_id 
        GROUP BY q.subject_name
    """)
    user_attempts = db.session.execute(query2).fetchall()
    user_attempts = {row[0]: row[1] for row in user_attempts}

    return jsonify({'highestScores': highest_scores, 'userAttempts': user_attempts})

@admin_bp.route('/summary')
@admin_required
def summary():
    if session.get("admin_logged_in") is None:
        return redirect(url_for('admin.login'))
    return render_template('admin/summary.html')

@admin_bp.route('/search')
def search():
    query = request.args.get('q', '').strip().lower()
    
    users = User.query.filter(User.full_name.ilike(f"%{query}%")).all()
    subjects = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
    quizzes = Quiz.query.filter(Quiz.name.ilike(f"%{query}%")).all()

    return jsonify({
        "users": [{"id": u.id, "name": u.full_name, "email": u.email, "qualification": u.qualification, "dob": u.dob.strftime("%Y-%m-%d") if u.dob else "N/A"} for u in users],
        "subjects": [{"id": s.id, "name": s.name, "description": s.description} for s in subjects],
        "quizzes": [{"id": q.id, "name": q.name,"chapter_id": q.chapter_id, "subject": q.subject_name, "date": q.date_of_quiz.strftime("%Y-%m-%d"), "time": q.time_duration, "questions": q.total_ques, "marks": q.total_marks} for q in quizzes]
    })

# ------------------------- SUBJECT MANAGEMENT -------------------------

# Add new subject
@admin_bp.route("/add_subject", methods=["GET", "POST"])
@admin_required
def add_subject():
    if request.method == "POST":
        name = request.form["name"]
        description = request.form["description"]
        new_subject = Subject(name=name, description=description)
        db.session.add(new_subject)
        db.session.commit()
        flash("Subject added successfully!", "success")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/add_subject.html")

# Edit subject
@admin_bp.route("/subjects/edit/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_subject(id):
    subject = Subject.query.get_or_404(id)
    if request.method == "POST":
        subject.name = request.form["name"]
        subject.description = request.form["description"]
        db.session.commit()
        flash("Subject updated successfully!", "success")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/edit_subject.html", subject=subject)

# Delete subject
@admin_bp.route("/subjects/delete/<int:id>")
@admin_required
def delete_subject(id):
    chapters = Chapter.query.filter_by(subject_id=id).all()
    for chapter in chapters:
        scores = Score.query.filter_by(chapter_id=chapter.id).all()
        for score in scores:
            db.session.delete(score)
        questions = Question.query.filter_by(chapter_id=chapter.id).all()
        for question in questions:
            db.session.delete(question)
        quizzes = Quiz.query.filter_by(chapter_id=chapter.id).all()
        for quiz in quizzes:
            db.session.delete(quiz)
        db.session.delete(chapter)
    subject = Subject.query.get_or_404(id)
    db.session.delete(subject)
    db.session.commit()
    flash("Subject deleted successfully!", "danger")
    return redirect(url_for("admin.dashboard"))


# ------------------------- CHAPTER MANAGEMENT -------------------------

# Add new chapter
@admin_bp.route("/chapters/add/<int:subject_id>", methods=["GET", "POST"])
@admin_required
def add_chapter(subject_id):
    if request.method == "POST":
        name = request.form["chapter_name"]
        description = request.form["chapter_description"]
        new_chapter = Chapter(name=name, description=description, subject_id=subject_id, subject_name=Subject.query.get(subject_id).name)
        db.session.add(new_chapter)
        db.session.commit()
        flash("Chapter added successfully!", "success")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/add_chapter.html", subject_id=subject_id)

# Delete chapter
@admin_bp.route("/chapters/delete/<int:id>")
@admin_required
def delete_chapter(id):
    questions = Question.query.filter_by(chapter_id=id).all()
    scores = Score.query.filter_by(chapter_id=id).all()
    quiz=Quiz.query.filter_by(chapter_id=id).all()
    chapter = Chapter.query.get_or_404(id)
    for question in questions:
        db.session.delete(question)
    
    for q in quiz:
        db.session.delete(q)

    for score in scores:
        db.session.delete(score)
    db.session.delete(chapter)
    db.session.commit()
    flash("Chapter deleted successfully!", "danger")
    return redirect(url_for("admin.dashboard"))

# Edit chapter
@admin_bp.route("/chapters/edit/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_chapter(id):
    chapter = Chapter.query.get_or_404(id)
    if request.method == "POST":
        chapter.name = request.form["chapter_name"]
        chapter.description = request.form["chapter_description"]
        db.session.commit()
        flash("Chapter updated successfully!", "success")
        return redirect(url_for("admin.dashboard"))
    return render_template("admin/edit_chapter.html", chapter=chapter)


# ------------------------- QUIZ MANAGEMENT -------------------------
# Add new quiz
@admin_bp.route("/quizzes/add", methods=["GET", "POST"])
@admin_required
def add_quiz():
    if request.method == "POST":
        name=request.form.get("name")
        chapter_id = request.form.get("chapter_id")
        date_of_quiz = request.form.get("date_of_quiz")
        duration = request.form.get("hours")+":"+request.form.get("minutes")  # HH:MM format
        remarks = request.form.get("remarks")

        # Validate chapter_id
        if not chapter_id or not chapter_id.isdigit():
            flash("Valid Chapter ID is required!", "danger")
            return redirect(url_for("admin.add_quiz"))

        # Check if chapter exists
        chapter = Chapter.query.get(int(chapter_id))
        if not chapter:
            flash("Chapter not found!", "danger")
            return redirect(url_for("admin.add_quiz"))

        # Convert date_of_quiz from string to Date
        try:
            date_of_quiz = datetime.strptime(date_of_quiz, "%Y-%m-%d").date()
        except ValueError:
            flash("Invalid date format!", "danger")
            return redirect(url_for("admin.add_quiz"))

        # Create and save quiz
        new_quiz = Quiz(
            name=name,
            chapter_id=int(chapter_id),
            chapter_name=Chapter.query.get(chapter_id).name,
            subject_name= Subject.query.get(Chapter.query.get(chapter_id).subject_id).name,
            date_of_quiz=date_of_quiz,
            time_duration=duration,
            remarks=remarks,
        )
        db.session.add(new_quiz)
        db.session.commit()

        flash("Quiz added successfully!", "success")
        return redirect(url_for("admin.quizzes"))

    return render_template("admin/add_quiz.html")

# Delete quiz
@admin_bp.route("/quizzes/delete/<int:id>")
@admin_required
def delete_quiz(id):
    quiz = Quiz.query.get_or_404(id)
    scores = Score.query.filter_by(quiz_id=id).all()
    for score in scores:
        db.session.delete(score)
    db.session.delete(quiz)
    db.session.commit()
    flash("Quiz deleted successfully!", "danger")
    return redirect(url_for("admin.quizzes"))

# Edit quiz
@admin_bp.route("/quizzes/edit/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_quiz(id):
    quiz = Quiz.query.get_or_404(id)
    if request.method == "POST":
        quiz.name = request.form["name"]
        date_of_quiz_str = request.form.get('date_of_quiz')
        quiz.date_of_quiz = datetime.strptime(date_of_quiz_str, '%Y-%m-%d')
        quiz.time_duration = request.form.get("hours")+":"+request.form.get("minutes")
        quiz.remarks = request.form["remarks"]
        db.session.commit()
        flash("Quiz updated successfully!", "success")
        return redirect(url_for("admin.quizzes"))
    return render_template("admin/edit_quiz.html", quiz=quiz)

# ------------------------- QUESTION MANAGEMENT -------------------------

# Add question
@admin_bp.route("/questions/add/<int:quiz_id>", methods=["GET", "POST"])
@admin_required
def add_question(quiz_id):
    if request.method == "POST":
        question_statement = request.form["question_statement"]
        marks = request.form["marks"]
        option1 = request.form["option1"]
        option2 = request.form["option2"]
        option3 = request.form["option3"]
        option4 = request.form["option4"]
        correct_option = request.form["correct_option"]
        new_question = Question(
            quiz_id=quiz_id,
            chapter_id=Quiz.query.get(quiz_id).chapter_id,
            question_statement=question_statement,
            marks=marks,
            option1=option1,
            option2=option2,
            option3=option3,
            option4=option4,
            correct_option=correct_option,
        )
        db.session.add(new_question)
        quiz = Quiz.query.get(quiz_id)
        if quiz:
            quiz.total_ques = (quiz.total_ques or 0) + 1  # Ensure it's not None before incrementing
            quiz.total_marks = (quiz.total_marks or 0) + int(marks)
        db.session.commit()  # Commit both question and quiz update
        flash("Question added successfully!", "success")
        return redirect(url_for("admin.quizzes"))
    return render_template("admin/add_question.html", quiz_id=quiz_id)

# Delete question
@admin_bp.route("/questions/delete/<int:id>")
@admin_required
def delete_question(id):
    question = Question.query.get_or_404(id)
    marks =Question.query.filter_by(id=id).first().marks
    quiz_id = Question.query.filter_by(id=id).first().quiz_id
    quiz = Quiz.query.get(quiz_id)
    if quiz:
        quiz.total_ques = (quiz.total_ques or 0) - 1  # Ensure it's not None before decrementing
        quiz.total_marks = (quiz.total_marks or 0) - int(marks)
    db.session.delete(question)
    db.session.commit()
    flash("Question deleted successfully!", "danger")
    return redirect(url_for("admin.quizzes"))

# Edit question
@admin_bp.route('/questions/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def edit_question(id):
    question = Question.query.get_or_404(id)  # Fetch the question by ID
    quiz_id = question.quiz_id  # Directly fetch quiz_id from the question
    quiz = Quiz.query.get_or_404(quiz_id)  # Fetch the quiz
    if request.method == 'POST':
        old_marks = question.marks  # Store old marks before updating

        # Update question details
        question.question_statement = request.form['question_statement']
        question.marks = request.form['marks']  # Update marks first
        question.option1 = request.form['option1']
        question.option2 = request.form['option2']
        question.option3 = request.form['option3']
        question.option4 = request.form['option4']
        question.correct_option = request.form['correct_option']

        # Update quiz total marks correctly
        quiz.total_marks += int(question.marks) - int(old_marks)  # Adjust total_marks
        
        db.session.commit()
        flash('Question updated successfully!', 'success')
        return redirect(url_for('admin.quizzes'))  # Redirect back to the quizzes page
    
    return render_template('admin/edit_question.html', question=question, quiz=quiz)