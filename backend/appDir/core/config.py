import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Put it in backend/.env or your environment.")
