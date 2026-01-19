"""
ATS Resume Analyzer & Scoring Engine
Mirrors how modern ATS software evaluates resumes
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import re
import io
from datetime import datetime

router = APIRouter()

# Resume parsing utilities
def normalize_text(text: str) -> str:
    """Normalize text for keyword matching"""
    # Lowercase
    text = text.lower()
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def handle_synonyms(text: str) -> str:
    """Handle common skill synonyms"""
    synonyms = {
        'js': 'javascript',
        'react.js': 'react',
        'reactjs': 'react',
        'node.js': 'nodejs',
        'nodejs': 'nodejs',
        'ai': 'artificial intelligence',
        'ml': 'machine learning',
        'dl': 'deep learning',
        'api': 'application programming interface',
        'aws': 'amazon web services',
        'gcp': 'google cloud platform',
        'azure': 'microsoft azure',
    }
    words = text.split()
    normalized = []
    for word in words:
        normalized.append(synonyms.get(word, word))
    return ' '.join(normalized)

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from text"""
    normalized = normalize_text(text)
    normalized = handle_synonyms(normalized)
    # Split into words and filter out common stop words (except skill words)
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'}
    words = normalized.split()
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    return keywords

def parse_text_resume(text: str) -> Dict[str, Any]:
    """Parse text resume into structured format"""
    lines = text.split('\n')
    
    resume_data = {
        'name': '',
        'contact': {'email': '', 'phone': '', 'location': ''},
        'skills': [],
        'experience': [],
        'education': [],
        'certifications': [],
        'projects': [],
        'raw_text': text
    }
    
    current_section = None
    current_experience = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect section headers
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in ['experience', 'work experience', 'employment', 'professional experience']):
            current_section = 'experience'
            continue
        elif any(keyword in line_lower for keyword in ['education', 'academic']):
            current_section = 'education'
            continue
        elif any(keyword in line_lower for keyword in ['skills', 'technical skills', 'core competencies']):
            current_section = 'skills'
            continue
        elif any(keyword in line_lower for keyword in ['certifications', 'certificates', 'certification']):
            current_section = 'certifications'
            continue
        elif any(keyword in line_lower for keyword in ['projects', 'project']):
            current_section = 'projects'
            continue
        
        # Extract name (usually first non-empty line)
        if not resume_data['name'] and len(line.split()) <= 4 and '@' not in line:
            resume_data['name'] = line
            continue
        
        # Extract contact info
        if '@' in line and '.' in line:
            resume_data['contact']['email'] = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line).group(0) if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line) else ''
        if re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', line):
            resume_data['contact']['phone'] = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', line).group(0) if re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', line) else ''
        
        # Parse sections
        if current_section == 'skills':
            # Extract skills (comma or bullet separated)
            skills = re.split(r'[,•·\-\n]', line)
            for skill in skills:
                skill = skill.strip()
                if skill and len(skill) > 1:
                    resume_data['skills'].append(skill)
        
        elif current_section == 'experience':
            # Try to detect job title/company pattern
            if re.search(r'\d{4}|\d{2}/\d{4}', line):  # Contains date
                if current_experience:
                    resume_data['experience'].append(current_experience)
                current_experience = {
                    'company': '',
                    'role': '',
                    'dates': '',
                    'bullets': []
                }
                # Extract dates
                dates = re.findall(r'\d{4}|\d{2}/\d{4}', line)
                if dates:
                    current_experience['dates'] = ' - '.join(dates[:2])
                # Extract company/role
                parts = re.split(r'\d{4}|\d{2}/\d{4}', line)
                if parts:
                    current_experience['role'] = parts[0].strip()
                    if len(parts) > 1:
                        current_experience['company'] = parts[1].strip()
            elif current_experience and (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                bullet = line.lstrip('•-*').strip()
                if bullet:
                    current_experience['bullets'].append(bullet)
            elif current_experience and not current_experience['company']:
                current_experience['company'] = line
        
        elif current_section == 'education':
            if re.search(r'\d{4}', line):
                resume_data['education'].append({
                    'degree': line,
                    'institution': '',
                    'year': re.search(r'\d{4}', line).group(0) if re.search(r'\d{4}', line) else ''
                })
        
        elif current_section == 'certifications':
            resume_data['certifications'].append(line)
        
        elif current_section == 'projects':
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                resume_data['projects'].append(line.lstrip('•-*').strip())
    
    if current_experience:
        resume_data['experience'].append(current_experience)
    
    return resume_data

def parse_pdf_resume(file_content: bytes) -> Dict[str, Any]:
    """Parse PDF resume - simplified version"""
    # Try pdfplumber first (better text extraction)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ''
            # Limit to first 5 pages for resumes (resumes are typically 1-3 pages)
            max_pages = min(len(pdf.pages), 5)
            for i, page in enumerate(pdf.pages[:max_pages]):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
                # Early exit if we have enough text (resumes are typically short)
                if len(text) > 10000:  # Stop after 10k characters
                    break
        if not text.strip():
            raise ValueError("Could not extract text from PDF")
        return parse_text_resume(text)
    except ImportError:
        # Fallback to PyPDF2
        try:
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ''
            # Limit to first 5 pages for resumes
            max_pages = min(len(pdf_reader.pages), 5)
            for i, page in enumerate(pdf_reader.pages[:max_pages]):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
                # Early exit if we have enough text
                if len(text) > 10000:
                    break
            if not text.strip():
                raise ValueError("Could not extract text from PDF")
            return parse_text_resume(text)
        except ImportError:
            raise HTTPException(status_code=500, detail="PDF parsing libraries not installed. Run: pip install pdfplumber or pip install PyPDF2")
    except Exception as e:
        # If both libraries are installed but parsing fails, try fallback
        try:
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ''
            max_pages = min(len(pdf_reader.pages), 5)
            for i, page in enumerate(pdf_reader.pages[:max_pages]):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
                if len(text) > 10000:
                    break
            if text.strip():
                return parse_text_resume(text)
        except:
            pass
        # If all fails, raise informative error
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}. Please ensure the PDF contains readable text.")

def parse_docx_resume(file_content: bytes) -> Dict[str, Any]:
    """Parse DOCX resume"""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_content))
        text = '\n'.join([para.text for para in doc.paragraphs])
        if not text.strip():
            raise ValueError("Could not extract text from DOCX file")
        return parse_text_resume(text)
    except ImportError:
        raise HTTPException(status_code=500, detail="python-docx library not installed. Run: pip install python-docx")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DOCX file: {str(e)}. Please ensure the file is a valid DOCX document.")

def extract_jd_keywords(jd_text: str) -> Dict[str, Any]:
    """Extract keywords from job description"""
    normalized_jd = normalize_text(jd_text)
    normalized_jd = handle_synonyms(normalized_jd)
    
    jd_data = {
        'required_skills': [],
        'preferred_skills': [],
        'years_experience': 0,
        'tools_technologies': [],
        'job_title_keywords': [],
        'hard_skills': [],
        'soft_skills': [],
        'all_keywords': extract_keywords(jd_text)
    }
    
    # Extract years of experience
    years_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)', normalized_jd, re.IGNORECASE)
    if years_match:
        jd_data['years_experience'] = int(years_match.group(1))
    
    # Extract required/preferred skills (simple heuristic)
    lines = jd_text.split('\n')
    in_required = False
    in_preferred = False
    
    for line in lines:
        line_lower = line.lower()
        if 'required' in line_lower or 'must have' in line_lower or 'essential' in line_lower:
            in_required = True
            in_preferred = False
        elif 'preferred' in line_lower or 'nice to have' in line_lower or 'bonus' in line_lower:
            in_preferred = True
            in_required = False
        
        if in_required or in_preferred:
            keywords = extract_keywords(line)
            if in_required:
                jd_data['required_skills'].extend(keywords)
            else:
                jd_data['preferred_skills'].extend(keywords)
    
    # If no explicit required/preferred, treat all keywords as required
    if not jd_data['required_skills']:
        jd_data['required_skills'] = jd_data['all_keywords']
    
    return jd_data

# ATS Scoring Functions
def calculate_keyword_match_score(resume_data: Dict[str, Any], jd_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate keyword match score (40 points)"""
    max_score = 40
    
    resume_text = normalize_text(resume_data['raw_text'])
    resume_keywords = set(extract_keywords(resume_text))
    resume_skills = set([normalize_text(s) for s in resume_data['skills']])
    
    required_skills = set([normalize_text(s) for s in jd_data.get('required_skills', [])])
    preferred_skills = set([normalize_text(s) for s in jd_data.get('preferred_skills', [])])
    
    # Match required skills (2x weight)
    required_matches = required_skills.intersection(resume_keywords.union(resume_skills))
    required_score = min(len(required_matches) * 2, 20) if required_skills else 0
    
    # Match preferred skills (1.5x weight)
    preferred_matches = preferred_skills.intersection(resume_keywords.union(resume_skills))
    preferred_score = min(len(preferred_matches) * 1.5, 15) if preferred_skills else 0
    
    # Penalize keyword stuffing (if same keyword appears > 5 times)
    keyword_counts = {}
    for keyword in resume_keywords:
        keyword_counts[keyword] = resume_text.count(keyword)
    
    stuffing_penalty = sum(1 for count in keyword_counts.values() if count > 5) * 0.5
    stuffing_penalty = min(stuffing_penalty, 5)
    
    # Penalize skills without context (skills listed but not in experience bullets)
    skills_in_experience = set()
    for exp in resume_data['experience']:
        exp_text = ' '.join(exp.get('bullets', []))
        exp_keywords = set(extract_keywords(exp_text))
        skills_in_experience.update(exp_keywords)
    
    skills_without_context = resume_skills - skills_in_experience
    context_penalty = min(len(skills_without_context) * 0.3, 5)
    
    # Ensure all values are numeric before calculation
    required_score = float(required_score) if required_score is not None else 0.0
    preferred_score = float(preferred_score) if preferred_score is not None else 0.0
    stuffing_penalty = float(stuffing_penalty) if stuffing_penalty is not None else 0.0
    context_penalty = float(context_penalty) if context_penalty is not None else 0.0
    
    score = required_score + preferred_score - stuffing_penalty - context_penalty
    score = max(0.0, min(float(score), float(max_score)))
    
    return {
        'score': round(score, 1),
        'max_score': max_score,
        'required_matches': list(required_matches),
        'preferred_matches': list(preferred_matches),
        'missing_required': list(required_skills - resume_keywords.union(resume_skills)),
        'skills_without_context': list(skills_without_context)
    }

def calculate_experience_relevance_score(resume_data: Dict[str, Any], jd_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate experience relevance score (25 points)"""
    max_score = 25
    
    if not resume_data['experience']:
        return {'score': 0, 'max_score': max_score, 'details': 'No experience found'}
    
    score = 0
    
    # Match job titles similarity
    jd_title_keywords = set(extract_keywords(' '.join(jd_data.get('job_title_keywords', []))))
    title_match_score = 0
    for exp in resume_data['experience']:
        exp_title_keywords = set(extract_keywords(exp.get('role', '')))
        if jd_title_keywords:
            similarity = len(jd_title_keywords.intersection(exp_title_keywords)) / len(jd_title_keywords)
            title_match_score += similarity * 3
    title_match_score = min(title_match_score, 8)
    score += title_match_score
    
    # Check years of experience
    years_required = jd_data.get('years_experience', 0)
    if years_required is None:
        years_required = 0
    try:
        years_required = int(years_required)
        if years_required < 0:
            years_required = 0
    except (ValueError, TypeError):
        years_required = 0
    
    total_years = 0.0
    if years_required and years_required > 0:
        # Estimate years from dates
        for exp in resume_data['experience']:
            dates = exp.get('dates', '') or ''
            if not dates or not isinstance(dates, str):
                continue
            year_matches = re.findall(r'\d{4}', dates)
            if len(year_matches) >= 2:
                try:
                    start_year_str = year_matches[0]
                    end_year_str = year_matches[1]
                    if not start_year_str or not end_year_str:
                        continue
                    start_year = int(start_year_str)
                    end_year = int(end_year_str)
                    # Validate years are reasonable
                    if 1900 <= start_year <= 2100 and 1900 <= end_year <= 2100:
                        if end_year < 3000:
                            years_diff = (end_year - start_year) / 12.0
                        else:
                            years_diff = (datetime.now().year - start_year) / 12.0
                        if years_diff is not None and isinstance(years_diff, (int, float)):
                            total_years += max(0.0, float(years_diff))  # Ensure non-negative
                except (ValueError, TypeError, ZeroDivisionError) as e:
                    # Skip invalid date entries
                    continue
        
        if total_years and total_years > 0:
            try:
                if total_years >= float(years_required):
                    score += 5
                elif total_years >= (float(years_required) * 0.7):
                    score += 3
                else:
                    score += 1
            except (TypeError, ValueError):
                pass
    
    # Skills used in experience bullets
    jd_skills = set(jd_data.get('required_skills', []) + jd_data.get('preferred_skills', []))
    skills_in_bullets = set()
    for exp in resume_data['experience']:
        bullets_text = ' '.join(exp.get('bullets', []))
        bullets_keywords = set(extract_keywords(bullets_text))
        skills_in_bullets.update(bullets_keywords)
    
    skills_match = len(jd_skills.intersection(skills_in_bullets))
    skills_score = min(skills_match * 1.5, 12)
    score += skills_score
    
    # Ensure score is numeric
    score = float(score) if score is not None else 0.0
    score = max(0.0, min(score, float(max_score)))
    
    return {
        'score': round(score, 1),
        'max_score': max_score,
        'years_estimated': round(total_years, 1) if total_years > 0 else None,
        'skills_in_experience': list(skills_in_bullets.intersection(jd_skills))
    }

def calculate_formatting_score(resume_data: Dict[str, Any], resume_text: str) -> Dict[str, Any]:
    """Calculate formatting & ATS readability score (15 points)"""
    max_score = 15
    score = max_score
    
    # Check for tables (simple heuristic - multiple consecutive lines with | or tabs)
    table_pattern = r'\|.*\|'
    if re.search(table_pattern, resume_text):
        score -= 3
    
    # Check for images/icons (can't detect in text, but check for image references)
    image_patterns = r'\.(png|jpg|jpeg|gif|svg)'
    if re.search(image_patterns, resume_text, re.IGNORECASE):
        score -= 2
    
    # Check for standard headings
    standard_headings = ['experience', 'education', 'skills', 'certifications', 'projects']
    resume_lower = resume_text.lower()
    headings_found = sum(1 for heading in standard_headings if heading in resume_lower)
    if headings_found < 3:
        score -= 2
    
    # Check for fancy fonts/symbols (unicode symbols)
    fancy_chars = re.findall(r'[^\x00-\x7F]', resume_text)
    if len(fancy_chars) > 50:  # Too many special characters
        score -= 2
    
    # Check chronological order (dates should be in order)
    dates = re.findall(r'\d{4}', resume_text)
    if len(dates) >= 2:
        try:
            date_ints = []
            for d in dates:
                if d is None:
                    continue
                try:
                    year_int = int(d)
                    if 1900 <= year_int <= 2100:
                        date_ints.append(year_int)
                except (ValueError, TypeError):
                    continue
            if date_ints and len(date_ints) >= 2:
                # Check if dates are mostly descending (reverse chronological)
                descending = sum(1 for i in range(len(date_ints)-1) if date_ints[i] >= date_ints[i+1])
                if descending < len(date_ints) * 0.5:
                    score -= 1
        except (ValueError, TypeError, IndexError):
            pass
    
    score = max(0, min(score, max_score))
    
    return {
        'score': round(score, 1),
        'max_score': max_score,
        'issues': []
    }

def calculate_education_certifications_score(resume_data: Dict[str, Any], jd_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate education & certifications match score (10 points)"""
    max_score = 10
    score = 0
    
    # Education relevance (basic check)
    if resume_data['education']:
        score += 5
    
    # Certifications relevance
    if resume_data['certifications']:
        score += 3
    
    # Match certifications to JD keywords
    jd_keywords = set([normalize_text(k) for k in jd_data.get('all_keywords', [])])
    cert_matches = 0
    for cert in resume_data['certifications']:
        cert_keywords = set(extract_keywords(cert))
        if cert_keywords.intersection(jd_keywords):
            cert_matches += 1
    
    score += min(cert_matches * 0.5, 2)
    
    score = max(0, min(score, max_score))
    
    return {
        'score': round(score, 1),
        'max_score': max_score,
        'certifications_found': len(resume_data['certifications'])
    }

def calculate_soft_skills_score(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate soft skills & action verbs score (10 points)"""
    max_score = 10
    
    action_verbs = ['led', 'built', 'optimized', 'designed', 'developed', 'implemented', 'created', 'managed', 'improved', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'coordinated', 'executed', 'launched', 'established', 'enhanced', 'streamlined']
    
    resume_text = normalize_text(resume_data['raw_text'])
    action_verbs_found = [verb for verb in action_verbs if verb in resume_text]
    
    # Score based on action verbs found
    verb_score = min(len(action_verbs_found) * 0.8, 7)
    
    # Check for generic buzzwords without examples
    buzzwords = ['team player', 'hard worker', 'detail oriented', 'self motivated', 'results driven']
    buzzword_count = sum(1 for buzzword in buzzwords if buzzword in resume_text)
    penalty = min(buzzword_count * 0.5, 3)
    
    # Ensure all values are numeric
    verb_score = float(verb_score) if verb_score is not None else 0.0
    penalty = float(penalty) if penalty is not None else 0.0
    
    score = verb_score + 3.0 - penalty  # Base score of 3
    score = max(0.0, min(float(score), float(max_score)))
    
    return {
        'score': round(score, 1),
        'max_score': max_score,
        'action_verbs_found': action_verbs_found,
        'buzzwords_found': [bw for bw in buzzwords if bw in resume_text]
    }

def generate_feedback(resume_data: Dict[str, Any], jd_data: Dict[str, Any], scores: Dict[str, Any]) -> List[str]:
    """Generate actionable feedback"""
    feedback = []
    
    # Keyword feedback
    keyword_breakdown = scores['breakdown']['keywordMatch']
    missing_required = keyword_breakdown.get('missing_required', [])
    if missing_required:
        feedback.append(f"Add these required keywords: {', '.join(missing_required[:5])}")
    
    skills_without_context = keyword_breakdown.get('skills_without_context', [])
    if skills_without_context:
        feedback.append(f"Use these skills in your experience bullets: {', '.join(skills_without_context[:3])}")
    
    # Experience feedback
    exp_breakdown = scores['breakdown']['experience']
    if exp_breakdown.get('years_estimated', 0) < jd_data.get('years_experience', 0):
        feedback.append(f"Emphasize your {jd_data.get('years_experience', 0)}+ years of experience more clearly")
    
    # Formatting feedback
    if scores['breakdown']['formatting']['score'] < 12:
        feedback.append("Ensure your resume uses standard headings (Experience, Education, Skills)")
        feedback.append("Avoid tables, images, and fancy fonts for better ATS readability")
    
    # Soft skills feedback
    soft_breakdown = scores['breakdown']['softSkills']
    if len(soft_breakdown.get('action_verbs_found', [])) < 5:
        feedback.append("Add more action verbs to your experience bullets (led, built, optimized, designed, etc.)")
    
    if soft_breakdown.get('buzzwords_found'):
        feedback.append("Replace generic buzzwords with specific examples and achievements")
    
    return feedback

# API Models
class ATSAnalysisRequest(BaseModel):
    job_description: Optional[str] = None

class ATSAnalysisResponse(BaseModel):
    atsScore: float
    breakdown: Dict[str, Any]
    feedback: List[str]
    resume_data: Dict[str, Any]

@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    Analyze resume and calculate ATS score
    Accepts PDF, DOCX, or TXT files
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        # Read file content
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
        file_ext = file.filename.split('.')[-1].lower()
        
        # Parse resume based on file type
        if file_ext == 'pdf':
            resume_data = parse_pdf_resume(file_content)
        elif file_ext in ['doc', 'docx']:
            resume_data = parse_docx_resume(file_content)
        elif file_ext == 'txt':
            resume_data = parse_text_resume(file_content.decode('utf-8', errors='ignore'))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}. Please upload PDF, DOCX, or TXT")
        
        # Validate parsed resume has content
        if not resume_data.get('raw_text', '').strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the resume. Please ensure the file contains readable text.")
        
        # Extract JD keywords if provided
        jd_data = extract_jd_keywords(job_description) if job_description else {'required_skills': [], 'preferred_skills': [], 'years_experience': 0, 'all_keywords': []}
        
        # Calculate scores
        keyword_score = calculate_keyword_match_score(resume_data, jd_data)
        experience_score = calculate_experience_relevance_score(resume_data, jd_data)
        formatting_score = calculate_formatting_score(resume_data, resume_data['raw_text'])
        education_score = calculate_education_certifications_score(resume_data, jd_data)
        soft_skills_score = calculate_soft_skills_score(resume_data)
        
        # Calculate total score - ensure all scores are numeric
        keyword_sc = float(keyword_score.get('score', 0) or 0)
        experience_sc = float(experience_score.get('score', 0) or 0)
        formatting_sc = float(formatting_score.get('score', 0) or 0)
        education_sc = float(education_score.get('score', 0) or 0)
        soft_skills_sc = float(soft_skills_score.get('score', 0) or 0)
        
        total_score = keyword_sc + experience_sc + formatting_sc + education_sc + soft_skills_sc
        
        # Generate feedback
        scores_dict = {
            'breakdown': {
                'keywordMatch': keyword_score,
                'experience': experience_score,
                'formatting': formatting_score,
                'education': education_score,
                'softSkills': soft_skills_score
            }
        }
        feedback = generate_feedback(resume_data, jd_data, {'breakdown': scores_dict['breakdown']})
        
        return ATSAnalysisResponse(
            atsScore=round(total_score, 1),
            breakdown=scores_dict['breakdown'],
            feedback=feedback,
            resume_data={
                'name': resume_data.get('name', ''),
                'skills': resume_data.get('skills', [])[:20],  # Limit for response size
                'experience_count': len(resume_data.get('experience', [])),
                'education_count': len(resume_data.get('education', []))
            }
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in analyze_resume: {error_detail}")
        # Provide more helpful error message
        error_msg = str(e) if str(e) else "An unexpected error occurred while analyzing the resume"
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {error_msg}")
