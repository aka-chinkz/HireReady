"""
Database connection and Prisma client setup
"""

from prisma import Prisma
import os
from dotenv import load_dotenv
import asyncio
import logging

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

prisma = Prisma()

async def connect_db():
    """Connect to database with retry logic.
    Never crashes the app - logs errors and continues."""
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            await prisma.connect()
            print("✅ Database connected successfully")
            logger.info("Database connection established")
            return
        except Exception as e:
            error_msg = str(e)
            if attempt < max_retries - 1:
                print(f"⚠️  Database connection attempt {attempt + 1} failed: {error_msg}")
                logger.warning(f"Database connection attempt {attempt + 1} failed: {error_msg}")
                print(f"⚠️  Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"❌ Database connection failed after {max_retries} attempts: {error_msg}")
                logger.error(f"Database connection failed after {max_retries} attempts: {error_msg}")
                # Don't raise - let the app start without database
                # Routes will handle database errors gracefully
                print("⚠️  App will continue without database connection. Routes will handle errors.")

async def disconnect_db():
    """Disconnect from database"""
    try:
        await prisma.disconnect()
        print("✅ Database disconnected")
    except Exception as e:
        print(f"⚠️  Error disconnecting database: {e}")

async def ensure_connected():
    """Ensure database connection is active, reconnect if needed.
    Never raises exceptions - returns True if connected, False otherwise."""
    try:
        # Check if already connected by trying a simple query
        # Use a timeout to prevent hanging
        await asyncio.wait_for(
            prisma.user.find_first(take=1),
            timeout=5.0  # 5 second timeout
        )
        return True
    except asyncio.TimeoutError:
        print("⚠️  Database query timed out, attempting to reconnect...")
        logger.warning("Database query timed out")
        try:
            await asyncio.wait_for(prisma.connect(), timeout=5.0)
            print("✅ Database reconnected successfully")
            return True
        except Exception as reconnect_error:
            print(f"❌ Failed to reconnect: {reconnect_error}")
            logger.error(f"Database reconnection failed: {reconnect_error}")
            return False
    except Exception as e:
        error_str = str(e).lower()
        if "not connected" in error_str or "connection" in error_str or "connect" in error_str:
            print("⚠️  Database connection lost, attempting to reconnect...")
            logger.warning(f"Database connection lost: {error_str}")
            try:
                await asyncio.wait_for(prisma.connect(), timeout=5.0)
                print("✅ Database reconnected successfully")
                return True
            except Exception as reconnect_error:
                print(f"❌ Failed to reconnect: {reconnect_error}")
                logger.error(f"Database reconnection failed: {reconnect_error}")
                return False
        # Other database errors (schema, etc.) - connection is active but query failed
        # This is fine, connection exists
        logger.debug(f"Database query error (non-connection): {error_str}")
        return True





