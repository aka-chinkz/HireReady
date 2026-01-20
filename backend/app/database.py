"""
Database connection and Prisma client setup
"""

from prisma import Prisma
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

prisma = Prisma()

async def connect_db():
    """Connect to database with retry logic"""
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            await prisma.connect()
            print("✅ Database connected successfully")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Database connection attempt {attempt + 1} failed: {e}")
                print(f"⚠️  Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"❌ Database connection failed after {max_retries} attempts: {e}")
                raise

async def disconnect_db():
    """Disconnect from database"""
    try:
        await prisma.disconnect()
        print("✅ Database disconnected")
    except Exception as e:
        print(f"⚠️  Error disconnecting database: {e}")

async def ensure_connected():
    """Ensure database connection is active, reconnect if needed"""
    try:
        # Try a simple query to check connection
        await prisma.user.find_first(take=1)
    except Exception as e:
        error_str = str(e).lower()
        if "not connected" in error_str or "connection" in error_str:
            print("⚠️  Database connection lost, attempting to reconnect...")
            try:
                await prisma.connect()
                print("✅ Database reconnected successfully")
            except Exception as reconnect_error:
                print(f"❌ Failed to reconnect: {reconnect_error}")
                raise





