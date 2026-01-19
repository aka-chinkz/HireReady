"""
Quick seed script runner
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from prisma.seed import main

if __name__ == "__main__":
    asyncio.run(main())





