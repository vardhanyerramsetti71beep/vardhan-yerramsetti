from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph

OUT = "assets/Vardhan_Yerramsetti_Resume.pdf"
s = getSampleStyleSheet()
s.add(ParagraphStyle(name="Name", parent=s["Title"], fontName="Helvetica-Bold", fontSize=20, leading=23, textColor=colors.HexColor("#14213D"), spaceAfter=2))
s.add(ParagraphStyle(name="Sub", parent=s["Normal"], fontSize=9, leading=12, textColor=colors.HexColor("#46515f"), spaceAfter=8))
s.add(ParagraphStyle(name="Head", parent=s["Heading2"], fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=colors.HexColor("#14213D"), spaceBefore=8, spaceAfter=3))
s.add(ParagraphStyle(name="Body", parent=s["Normal"], fontSize=8.4, leading=10.5, spaceAfter=2))
s.add(ParagraphStyle(name="Project", parent=s["Normal"], fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.HexColor("#14213D"), spaceBefore=4, spaceAfter=1))
s.add(ParagraphStyle(name="Meta", parent=s["Normal"], fontName="Helvetica-Oblique", fontSize=7.6, leading=9.5, textColor=colors.HexColor("#46515f"), spaceAfter=2))

def p(text, style="Body"): return Paragraph(text, s[style])
def bullets(items): return [p("• " + item) for item in items]

story = [
    p("VARDHAN YERRAMSETTI", "Name"),
    p("Python Full Stack Developer | AWS Certified Cloud Practitioner | Data Science", "Sub"),
    p("+91 7386033417 | vardhanyerramsetti71@gmail.com | Andhra Pradesh, India<br/>vardhan-yerramsetti.vercel.app | github.com/vardhanyerramsetti71beep | linkedin.com/in/vardhan-yerramsetti", "Sub"),
    p("PROFESSIONAL SUMMARY", "Head"),
    p("Python Full Stack Developer experienced in production APIs, cloud-hosted data products and interactive web experiences. Skilled in Flask, FastAPI, React, AWS, SQL optimization, machine learning and creative WebGL development. Delivered 9 live projects across Vercel and AWS."),
    p("TECHNICAL SKILLS", "Head"),
    p("<b>Languages:</b> Python, JavaScript (ES6+), SQL, C++, HTML5, CSS3<br/><b>Frontend & Creative Dev:</b> React, Next.js, Vite, Three.js, GSAP, ScrollTrigger, Lenis, Tailwind CSS<br/><b>Backend & Data:</b> Flask, FastAPI, Django, REST APIs, MySQL, PyMySQL, JWT, Scikit-learn, OpenCV<br/><b>Cloud & DevOps:</b> AWS (EC2, S3, RDS, Lambda, IAM), Docker, Vercel, Git/GitHub"),
    p("SELECTED TECHNICAL PROJECTS", "Head"),
    p("CrunchLab — 3D Product Experience", "Project"),
    p("Vite, Three.js, GSAP ScrollTrigger, Lenis, JavaScript, CSS | Live: crunchlab-blond.vercel.app | Code: github.com/vardhanyerramsetti71beep/crunchlab", "Meta"),
    *bullets(["Created a scroll-driven 3D product site with a cinematic chip-storm loader, interactive hero carousel, flavour wall and build-your-own 3-pack experience.", "Generated all six product-pack visuals in code using canvases and real-time Three.js meshes, eliminating image and model assets.", "Added responsive motion controls that respect prefers-reduced-motion, including scroll, swipe, keyboard and autoplay interactions."]),
    p("Scalable Task & Data Management Cloud Portal", "Project"),
    p("Python, Flask REST API, React, MySQL, AWS EC2/S3, Docker | Live: task-cloud-portal.vercel.app", "Meta"),
    *bullets(["Built a multi-tenant cloud portal with strict organisation-level isolation across tasks, files and audit logs.", "Engineered compound MySQL B-Tree indexes that reduced query execution from 18.4 ms to 13.8 ms.", "Decoupled binary storage into Amazon S3 and deployed containerized services on EC2 with Docker."]),
    p("OmniPulse — CLV & Retention Engine", "Project"),
    p("FastAPI, Scikit-learn, BG/NBD, Gamma-Gamma, Python | Live: omni-pulse-enterprise-clv-churn-int-teal.vercel.app", "Meta"),
    *bullets(["Implemented BG/NBD and Gamma-Gamma models for real-time customer vitality and 12-month lifetime-value predictions.", "Delivered validated FastAPI inference endpoints with sub-15 ms prediction latency for churn-risk triage."]),
    p("MoodHarmonics — Emotion Music Recommender", "Project"),
    p("Python, Flask, OpenCV, Scikit-learn, WebRTC | Live: music-recommending.vercel.app", "Meta"),
    *bullets(["Built a webcam-based facial-expression pipeline with over 90% classification accuracy and targeted music recommendations.", "Optimized OpenCV frame processing and Flask endpoints for low-latency live interaction."]),
    p("WORK EXPERIENCE", "Head"),
    p("Operations & Logistics Associate — Instakart Services Pvt. Ltd. (Flipkart Logistics) | Jan 2026 – Apr 2026", "Project"),
    *bullets(["Supervised warehouse operations, order dispatch and inventory databases while maintaining 99% data integrity.", "Removed workflow bottlenecks between ground teams and dispatch systems, contributing to a 15% throughput increase."]),
    p("Direct Marketing Coordinator — Future Generali Total Health Insurance | Aug 2022 – Jan 2023", "Project"),
    *bullets(["Ran multi-channel campaigns reaching 5,000+ prospects and analyzed funnels that increased qualified leads by 10%."]),
    p("Teaching Assistant, Computer Science — Sri Srinivasa Gravity Junior College | Jun 2022 – Aug 2022", "Project"),
    *bullets(["Mentored 40+ engineering aspirants in CS fundamentals, OOP and problem-solving; led weekly Python and C++ debugging labs."]),
    p("EDUCATION & CERTIFICATIONS", "Head"),
    p("B.Tech, Computer Science & Engineering — Jawaharlal Nehru Technological University, Kakinada (2018–2026) | CGPA: 6.5/10<br/>AWS Certified Cloud Practitioner (2023) | AWS Academy Graduate: Cloud Foundations (2023) | Android Enterprise Associate, Google (2022) | Networking Essentials, Cisco (2022)")
]

SimpleDocTemplate(OUT, pagesize=A4, rightMargin=15*mm, leftMargin=15*mm, topMargin=12*mm, bottomMargin=12*mm).build(story)
print(f"Created {OUT}")
