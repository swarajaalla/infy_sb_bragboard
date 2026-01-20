from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import csv
import io
import zipfile

from app.database import SessionLocal
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.shoutout import ShoutOut
from app.models.reactions import Reaction
from app.models.comments import Comment
from app.models.report import Report

# Optional AdminLog
try:
    from app.models.admin_log import AdminLog
    ADMIN_LOG_ENABLED = True
except ImportError:
    ADMIN_LOG_ENABLED = False

# PDF
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle,
    Spacer, PageBreak
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

router = APIRouter(prefix="/admin/export", tags=["Admin Export"])


# ---------------- DB DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- MASTER EXPORT ----------------
@router.get("/master-report")
def export_master_report(
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if format not in {"csv", "pdf"}:
        raise HTTPException(status_code=400, detail="Invalid format. Use csv or pdf")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # =========================================================
    # PDF EXPORT
    # =========================================================
    if format == "pdf":
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        def section(title: str):
            elements.append(Paragraph(title, styles["Heading2"]))
            elements.append(Spacer(1, 10))

        def add_table(data):
            table = Table(data, repeatRows=1)
            table.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ]))
            elements.append(table)
            elements.append(PageBreak())

        # Title
        elements.append(Paragraph("BragBoard – Master Admin Report", styles["Title"]))
        elements.append(Paragraph(
            f"Generated on {datetime.now().strftime('%d %b %Y %H:%M')}",
            styles["Normal"]
        ))
        elements.append(PageBreak())

        # USERS
        section("Users")
        users_data = [["ID", "Name", "Email", "Dept", "Role", "Sent", "Received"]]
        for u in db.query(User).all():
            users_data.append([
                u.id,
                u.name,
                u.email,
                u.department,
                u.role,
                db.query(func.count(ShoutOut.id)).filter(ShoutOut.from_user_id == u.id).scalar(),
                db.query(func.count(ShoutOut.id)).filter(ShoutOut.to_user_id == u.id).scalar(),
            ])
        add_table(users_data)

        # SHOUTOUTS
        section("Shoutouts")
        shoutouts_data = [["ID", "Message", "From", "To", "Date", "Reactions", "Comments"]]
        for s in db.query(ShoutOut).all():
            shoutouts_data.append([
                s.id,
                s.message[:40],
                s.from_user.name,
                s.to_user.name,
                s.created_at.strftime("%d-%m-%Y"),
                db.query(func.count(Reaction.id)).filter(Reaction.shoutout_id == s.id).scalar(),
                db.query(func.count(Comment.id)).filter(Comment.shoutout_id == s.id).scalar(),
            ])
        add_table(shoutouts_data)

        # COMMENTS
        section("Comments")
        comments_data = [["ID", "Content", "User", "Shoutout", "Date"]]
        for c in db.query(Comment).all():
            comments_data.append([
                c.id,
                c.content[:40],
                c.user.name,
                c.shoutout_id,
                c.created_at.strftime("%d-%m-%Y"),
            ])
        add_table(comments_data)

        # REPORTS
        section("Reported Shoutouts")
        reports_data = [["ID", "Shoutout ID", "Reported By (User ID)", "Reason", "Status"]]
        for r in db.query(Report).all():
            reports_data.append([
                r.id,
                r.shoutout_id,
                r.reported_by,
                r.reason,
                r.status,
            ])
        add_table(reports_data)

        doc.build(elements)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=master_report_{timestamp}.pdf"
            },
        )

    # =========================================================
    # CSV EXPORT (ZIP)
    # =========================================================
    zip_buffer = io.BytesIO()

    def write_csv(zipf, filename, headers, rows):
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(headers)
        writer.writerows(rows)
        zipf.writestr(filename, buf.getvalue())

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:

        # USERS
        write_csv(
            zipf,
            "users.csv",
            ["ID", "Name", "Email", "Department", "Role"],
            [
                [u.id, u.name, u.email, u.department, u.role]
                for u in db.query(User).all()
            ],
        )

        # SHOUTOUTS
        write_csv(
            zipf,
            "shoutouts.csv",
            ["ID", "Message", "From User ID", "To User ID", "Created At"],
            [
                [s.id, s.message, s.from_user_id, s.to_user_id, s.created_at]
                for s in db.query(ShoutOut).all()
            ],
        )

        # REACTIONS
        write_csv(
            zipf,
            "reactions.csv",
            ["ID", "Type", "User ID", "Shoutout ID", "Created At"],
            [
                [r.id, r.type, r.user_id, r.shoutout_id, r.created_at]
                for r in db.query(Reaction).all()
            ],
        )

        # COMMENTS
        write_csv(
            zipf,
            "comments.csv",
            ["ID", "Content", "User ID", "Shoutout ID", "Created At"],
            [
                [c.id, c.content, c.user_id, c.shoutout_id, c.created_at]
                for c in db.query(Comment).all()
            ],
        )

        # REPORTS
        write_csv(
            zipf,
            "reports.csv",
            ["ID", "Shoutout ID", "Reported By", "Reason", "Status", "Created At"],
            [
                [r.id, r.shoutout_id, r.reported_by, r.reason, r.status, r.created_at]
                for r in db.query(Report).all()
            ],
        )

        # ADMIN LOGS (optional)
        if ADMIN_LOG_ENABLED:
            write_csv(
                zipf,
                "admin_logs.csv",
                ["ID", "Admin ID", "Action", "Target Type", "Target ID", "Timestamp"],
                [
                    [
                        log.id,
                        log.admin_id,
                        log.action,
                        log.target_type,
                        log.target_id,
                        log.timestamp,
                    ]
                    for log in db.query(AdminLog).all()
                ],
            )

    # ✅ MUST BE AFTER ZIP CLOSE
    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=master_report_{timestamp}.zip"
        },
    )
