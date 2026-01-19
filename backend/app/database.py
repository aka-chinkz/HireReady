"""
Database connection and Prisma client setup
"""

from prisma import Prisma
import os
from dotenv import load_dotenv

load_dotenv()

prisma = Prisma()

async def connect_db():
    """Connect to database"""
    await prisma.connect()

async def disconnect_db():
    """Disconnect from database"""
    await prisma.disconnect()





