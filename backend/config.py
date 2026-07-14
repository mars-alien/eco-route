from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_url: str
    db_name: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
