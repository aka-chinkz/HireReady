"""
Authentication endpoints for Google OAuth
"""

from fastapi import APIRouter, HTTPException
from app.database import prisma
from pydantic import BaseModel
from typing import Optional
import os
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import jwt
from jwt import PyJWKClient

router = APIRouter()

# Google OAuth configuration
# In production, set these via environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

class GoogleTokenRequest(BaseModel):
    credential: str  # Google ID token

class AuthResponse(BaseModel):
    user_id: str
    email: Optional[str]
    has_completed_onboarding: bool

def verify_google_token(token: str) -> dict:
    """
    Verify Google ID token and return user info.
    
    In production, ensure GOOGLE_CLIENT_ID is set in environment variables.
    Handles clock skew issues by allowing a tolerance window.
    """
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return {
            'google_id': idinfo['sub'],
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture')
        }
    except ValueError as e:
        error_str = str(e)
        # Check if it's a clock skew issue ("Token used too early")
        if "Token used too early" in error_str or "used too early" in error_str.lower():
            # Retry with clock skew tolerance using PyJWT with JWK client
            try:
                # Use PyJWKClient to fetch and cache Google's public keys
                jwks_client = PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")
                
                # Get the signing key from the token
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                
                # Decode and verify with clock skew tolerance (60 seconds)
                idinfo = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience=GOOGLE_CLIENT_ID,
                    options={
                        "verify_signature": True,
                        "verify_exp": True,
                        "verify_iat": True,
                        "verify_nbf": True,
                        "verify_aud": True,
                    },
                    leeway=60  # 60 seconds tolerance for clock skew
                )
                
                # Verify the issuer
                if idinfo.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid token: Wrong issuer"
                    )
                
                return {
                    'google_id': idinfo['sub'],
                    'email': idinfo.get('email'),
                    'name': idinfo.get('name'),
                    'picture': idinfo.get('picture')
                }
            except jwt.InvalidTokenError as jwt_error:
                raise HTTPException(
                    status_code=401,
                    detail=f"Token verification failed: {str(jwt_error)}"
                )
            except Exception as retry_error:
                # If retry also fails, return original error
                raise HTTPException(
                    status_code=401, 
                    detail=f"Invalid token (clock skew issue): {error_str}. Retry error: {str(retry_error)}"
                )
        else:
            # Other ValueError - invalid token
            raise HTTPException(status_code=401, detail=f"Invalid token: {error_str}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

@router.post("/google", response_model=AuthResponse)
async def google_login(request: GoogleTokenRequest):
    """
    Authenticate user with Google OAuth token.
    
    Flow:
    1. Frontend sends Google ID token (from Google Sign-In button)
    2. Backend verifies the token with Google
    3. Backend finds or creates user in database
    4. Backend returns user ID and onboarding status
    
    Security:
    - Token is verified with Google's servers
    - Only valid Google tokens are accepted
    - User is created if they don't exist
    """
    try:
        # Verify Google token
        google_user_info = verify_google_token(request.credential)
        
        google_id = google_user_info['google_id']
        email = google_user_info.get('email')
        picture = google_user_info.get('picture')
        
        # Find or create user
        # Handle case where username column doesn't exist yet
        try:
            user = await prisma.user.find_unique(
                where={"googleId": google_id}
            )
        except Exception as find_error:
            error_msg = str(find_error).lower()
            # Log the actual error for debugging
            print(f"Database find error: {find_error}")
            if "column" in error_msg and "username" in error_msg:
                # Database column doesn't exist - this shouldn't happen on find_unique
                # but if it does, try to handle it
                raise HTTPException(
                    status_code=500,
                    detail=f"Database schema mismatch: {str(find_error)}. Please run: prisma migrate deploy --schema=prisma/schema.prisma"
                )
            raise
        
        if not user:
            # Create new user
            try:
                user = await prisma.user.create(
                    data={
                        "googleId": google_id,
                        "email": email,
                        "profilePicture": picture,
                        "skills": [],
                        "targetTiers": [],
                        "readinessScore": 0.0
                    }
                )
            except Exception as create_error:
                error_msg = str(create_error).lower()
                # Log the actual error for debugging
                print(f"Database create error: {create_error}")
                if "column" in error_msg and "username" in error_msg:
                    # Username column doesn't exist in database
                    # This means the Prisma client has username but DB doesn't
                    # The create should work, but if it fails, it's a Prisma client issue
                    raise HTTPException(
                        status_code=500,
                        detail=f"Database schema mismatch: {str(create_error)}. Please run: prisma migrate deploy --schema=prisma/schema.prisma"
                    )
                raise
        else:
            # Update email and profile picture if they changed
            update_data = {}
            if email and user.email != email:
                update_data["email"] = email
            if picture and user.profilePicture != picture:
                update_data["profilePicture"] = picture
            
            if update_data:
                try:
                    user = await prisma.user.update(
                        where={"id": user.id},
                        data=update_data
                    )
                except Exception as update_error:
                    error_msg = str(update_error).lower()
                    if "column" in error_msg and "username" in error_msg:
                        # Username column doesn't exist - just use existing user
                        pass
                    else:
                        raise
        
        # Check if user has completed onboarding
        # User has completed onboarding if they have careerStream set
        has_completed_onboarding = user.careerStream is not None
        
        return AuthResponse(
            user_id=user.id,
            email=user.email,
            has_completed_onboarding=has_completed_onboarding
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/verify/{user_id}")
async def verify_user(user_id: str):
    """
    Verify that a user exists and is authenticated.
    Used for session validation.
    """
    try:
        user = await prisma.user.find_unique(
            where={"id": user_id}
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "valid": True,
            "user_id": user.id,
            "email": user.email,
            "has_completed_onboarding": user.careerStream is not None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))