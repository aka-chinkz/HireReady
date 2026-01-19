"""
Career Intelligence Engine
Deterministic logic for skill matching, readiness scoring, and filtering
"""

from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from app.database import prisma

class CareerIntelligence:
    """Core intelligence engine for career planning"""
    
    # Skill categories and their weights
    SKILL_WEIGHTS = {
        "core": 0.4,  # DSA, OOP, System Design
        "language": 0.3,  # Python, Java, JavaScript
        "framework": 0.2,  # React, Django, Spring
        "tool": 0.1  # Git, Docker, AWS
    }
    
    # Skill categorization
    CORE_SKILLS = ["DSA", "OOP", "System Design", "Algorithms", "Data Structures"]
    LANGUAGE_SKILLS = ["Python", "Java", "JavaScript", "TypeScript", "C++", "Go", "Rust"]
    FRAMEWORK_SKILLS = ["React", "Django", "Spring", "Flask", "Node.js", "Express", "Vue"]
    TOOL_SKILLS = ["Git", "Docker", "AWS", "Kubernetes", "CI/CD", "PostgreSQL", "MongoDB"]
    
    def categorize_skill(self, skill: str) -> str:
        """Categorize a skill into core, language, framework, or tool"""
        skill_upper = skill.upper()
        
        if any(core in skill_upper for core in [s.upper() for s in self.CORE_SKILLS]):
            return "core"
        elif any(lang in skill_upper for lang in [s.upper() for s in self.LANGUAGE_SKILLS]):
            return "language"
        elif any(fw in skill_upper for fw in [s.upper() for s in self.FRAMEWORK_SKILLS]):
            return "framework"
        elif any(tool in skill_upper for tool in [s.upper() for s in self.TOOL_SKILLS]):
            return "tool"
        return "other"
    
    def calculate_readiness_score(
        self, 
        user_skills: List[str], 
        required_skills: List[str],
        user_year: int,
        min_year: int
    ) -> float:
        """
        Calculate readiness score (0-100) based on:
        - Skill match percentage (70%)
        - Year appropriateness (30%)
        """
        if not required_skills:
            return 0.0
        
        # Normalize skills to lowercase for comparison
        user_skills_lower = [skill.lower().strip() for skill in user_skills if skill.strip()]
        required_skills_lower = [skill.lower().strip() for skill in required_skills if skill.strip()]
        
        if not required_skills_lower:
            return 0.0
        
        # Convert to sets for exact matching
        user_set = set(user_skills_lower)
        required_set = set(required_skills_lower)
        
        # Count exact matches
        exact_matches = len(user_set.intersection(required_set))
        
        # Count partial matches (only for skills not already matched exactly)
        unmatched_required = required_set - user_set
        partial_match_count = 0
        
        for req_skill in unmatched_required:
            for user_skill in user_set:
                # Check for partial matches (one contains the other, or similar)
                if (req_skill in user_skill or user_skill in req_skill) and req_skill != user_skill:
                    # Additional checks for common variations
                    if any(variant in user_skill or user_skill in variant for variant in [req_skill + 's', req_skill.replace(' ', ''), req_skill.replace('-', '')]):
                        partial_match_count += 0.5
                        break
                    # Check for abbreviations (e.g., "JS" matches "JavaScript")
                    if len(req_skill) > 3 and len(user_skill) > 3:
                        if req_skill[:3] == user_skill[:3] or req_skill[-3:] == user_skill[-3:]:
                            partial_match_count += 0.3
                            break
        
        # Calculate skill match percentage
        total_matches = exact_matches + partial_match_count
        skill_score = min(100.0, (total_matches / len(required_set)) * 100.0)
        
        # Year appropriateness (30% weight)
        year_diff = user_year - min_year
        if year_diff >= 0:
            year_score = 100.0
        elif year_diff == -1:
            year_score = 70.0  # One year early
        elif year_diff == -2:
            year_score = 40.0  # Two years early
        else:
            year_score = 10.0  # Too early
        
        # Weighted combination
        readiness = (skill_score * 0.7) + (year_score * 0.3)
        return round(readiness, 2)
    
    def identify_skill_gaps(
        self, 
        user_skills: List[str], 
        required_skills: List[str]
    ) -> List[Dict]:
        """Identify missing skills and prioritize them"""
        user_set = set(skill.lower() for skill in user_skills)
        required_set = set(skill.lower() for skill in required_skills)
        
        missing = required_set - user_set
        
        gaps = []
        for skill in missing:
            category = self.categorize_skill(skill)
            priority = "high" if category == "core" else "medium" if category in ["language", "framework"] else "low"
            
            gaps.append({
                "skill": skill,
                "required": True,
                "priority": priority,
                "category": category
            })
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        gaps.sort(key=lambda x: priority_order.get(x["priority"], 3))
        
        return gaps
    
    def filter_by_year(
        self, 
        user_year: int, 
        roles: List[Dict]
    ) -> List[Dict]:
        """Filter roles based on user's university year"""
        filtered = []
        
        for role in roles:
            min_year = role.get("min_year", 1)
            
            # Allow roles where user meets minimum year requirement
            if user_year >= min_year:
                filtered.append(role)
            # For internships, allow 1 year early
            elif role.get("is_internship") and user_year >= min_year - 1:
                filtered.append(role)
        
        return filtered
    
    def filter_by_tier(
        self, 
        target_tiers: List[int], 
        companies: List[Dict]
    ) -> List[Dict]:
        """Filter companies by target tiers"""
        return [c for c in companies if c.get("tier") in target_tiers]
    
    def generate_recommendations(
        self, 
        user_year: int, 
        readiness_score: float,
        skill_gaps: List[Dict]
    ) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Year-based recommendations
        if user_year == 1:
            recommendations.append("Focus on building core programming skills and DSA fundamentals")
            recommendations.append("Look for micro-internships and open-source contributions")
        elif user_year == 2:
            recommendations.append("Start applying for summer internships at Tier 2 and Tier 3 companies")
            recommendations.append("Build projects showcasing your skills")
        elif user_year == 3:
            recommendations.append("Target Tier 1 internships (FAANG) for next summer")
            recommendations.append("Prepare for technical interviews with mock coding sessions")
        else:  # Final year
            recommendations.append("Focus on full-time roles at your target companies")
            recommendations.append("Network with alumni and attend career fairs")
        
        # Readiness-based recommendations
        if readiness_score < 50:
            recommendations.append("Consider taking online courses to fill skill gaps")
            recommendations.append("Build portfolio projects to demonstrate your abilities")
        elif readiness_score < 70:
            recommendations.append("Continue building skills, especially in high-priority areas")
            recommendations.append("Start preparing for technical interviews")
        else:
            recommendations.append("You're well-prepared! Focus on interview practice and networking")
        
        # Skill gap recommendations
        high_priority_gaps = [g for g in skill_gaps if g["priority"] == "high"]
        if high_priority_gaps:
            top_gap = high_priority_gaps[0]["skill"]
            recommendations.append(f"Prioritize learning {top_gap} - it's critical for your target roles")
        
        return recommendations





