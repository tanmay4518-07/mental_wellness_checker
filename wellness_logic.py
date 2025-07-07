def calculate_wellness_score(q1, q2, q3, q4, q5, q6, q7, q8, q9, q10):
    emotional = int(q1) + int(q2) + int(q3)
    physical = int(q4) + int(q5) + int(q6)
    social   = int(q7) + int(q8) + int(q9) + int(q10)
    total = emotional + physical + social

    category_summary = (
        f"🧠 Emotional Health Score: {emotional}/9\n"
        f"💪 Physical Wellness Score: {physical}/9\n"
        f"🤝 Social & Lifestyle Score: {social}/12\n"
    )

    if total >= 25:
        suggestion = "You're doing great! Keep maintaining your balance."
    elif total >= 18:
        suggestion = "You're doing okay. Try to focus more on self-care and connections."
    else:
        suggestion = "It seems you're struggling. Please consider reaching out to a mental health professional or support system."

    return category_summary + "\n📘 Suggestion: " + suggestion
