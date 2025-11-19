"""
AWS Lambda Handler for ClubCompass API
Wraps the FastAPI application for serverless deployment
"""
from mangum import Mangum
from app.main import app

# Create Lambda handler
handler = Mangum(app, lifespan="off")

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
