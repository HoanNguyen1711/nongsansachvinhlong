import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User

# Use an in-memory SQLite database for testing, with static pool to share it across threads
DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    # Create test admin user
    with Session(engine) as session:
        test_admin = User(
            username="testadmin",
            hashed_password=get_password_hash("testpassword"),
            is_active=True,
            role="super_admin"
        )
        session.add(test_admin)
        session.commit()
        
    with Session(engine) as session:
        yield session
        
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_db_override():
        return session

    # Override get_db dependency to use the test session
    app.dependency_overrides[get_db] = get_db_override
    
    with TestClient(app) as client:
        yield client
        
    # Clear overrides after test is finished
    app.dependency_overrides.clear()

@pytest.fixture(name="admin_token_headers")
def admin_token_headers_fixture(client: TestClient):
    # Log in test admin to get access token
    login_data = {
        "username": "testadmin",
        "password": "testpassword"
    }
    response = client.post("/api/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
