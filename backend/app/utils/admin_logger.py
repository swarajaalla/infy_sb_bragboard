from app.models.admin_log import AdminLog

def log_admin_action(db, admin_id, action, target_id, target_type):
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_id=target_id,
        target_type=target_type
    )
    db.add(log)
