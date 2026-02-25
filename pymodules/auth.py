import bcrypt

from flask_login import LoginManager, UserMixin

_users: dict[str, "User"] = {}

login_manager = LoginManager()
login_manager.login_view = "auth_bp.login"


class User(UserMixin):
    def __init__(self, uid: str, username: str, pw_hash: bytes):
        self.id = uid
        self.username = username
        self.pw_hash = pw_hash


@login_manager.user_loader
def load_user(uid: str) -> User | None:
    return _users.get(uid)


def register_user(username: str, password: str) -> User:
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = User(uid=username, username=username, pw_hash=pw_hash)
    _users[user.id] = user
    return user


def load_user_from_hash(username: str, pw_hash: str) -> User:
    user = User(uid=username, username=username, pw_hash=pw_hash.encode())
    _users[user.id] = user
    return user


def verify_password(user: User, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), user.pw_hash)


def get_user_by_username(username: str) -> User | None:
    return _users.get(username)


def change_password(user: User, new_password: str) -> None:
    user.pw_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())


def change_username(old_username: str, new_username: str) -> User | None:
    user = _users.pop(old_username, None)
    if user is None:
        return None
    user.username = new_username
    user.id = new_username
    _users[new_username] = user
    return user


def has_users() -> bool:
    return len(_users) > 0
