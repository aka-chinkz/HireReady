"""
Calendar Generation Service
Creates application timelines with preparation, application, and interview phases
"""

from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

class CalendarGenerator:
    """Generate application calendars based on company timelines"""
    
    # Month name to number mapping
    MONTH_MAP = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12
    }
    
    def parse_month(self, month_name: str) -> int:
        """Convert month name to number"""
        return self.MONTH_MAP.get(month_name.lower(), 1)
    
    def get_application_window(
        self, 
        open_month: str, 
        current_year: int,
        is_internship: bool
    ) -> Tuple[datetime, datetime]:
        """
        Get application window dates
        Internships: Usually open 2-3 months before start
        Full-time: Usually open 1-2 months before start
        """
        month_num = self.parse_month(open_month)
        
        # Application typically opens 2-3 months before
        if is_internship:
            # For summer internships (June start), apps open in Aug-Sept of previous year
            if month_num >= 6:  # Summer internship
                app_start_month = month_num - 3
                app_start_year = current_year - 1
            else:
                app_start_month = month_num - 2
                app_start_year = current_year
        else:  # Full-time
            app_start_month = month_num - 2
            app_start_year = current_year
        
        # Normalize month
        if app_start_month <= 0:
            app_start_month += 12
            app_start_year -= 1
        
        app_start = datetime(app_start_year, app_start_month, 1)
        app_end = datetime(app_start_year, app_start_month + 1, 1) - timedelta(days=1)
        
        return app_start, app_end
    
    def generate_phases(
        self,
        application_start: datetime,
        application_end: datetime,
        company_tier: int
    ) -> Dict[str, datetime]:
        """
        Generate all phases for an application:
        - Preparation: 4-6 weeks before application
        - Application: Application window
        - Interview: 2-4 weeks after application closes
        """
        # Preparation phase (4-6 weeks before)
        prep_duration = 6 if company_tier == 1 else 4  # Tier 1 needs more prep
        prep_start = application_start - timedelta(weeks=prep_duration)
        prep_end = application_start - timedelta(days=1)
        
        # Interview phase (starts 2 weeks after application closes, lasts 4-6 weeks)
        interview_start = application_end + timedelta(weeks=2)
        interview_duration = 6 if company_tier == 1 else 4
        interview_end = interview_start + timedelta(weeks=interview_duration)
        
        return {
            "preparation_start": prep_start,
            "preparation_end": prep_end,
            "application_start": application_start,
            "application_end": application_end,
            "interview_start": interview_start,
            "interview_end": interview_end
        }
    
    def generate_calendar_events(
        self,
        applications: List[Dict],
        start_date: datetime = None,
        end_date: datetime = None
    ) -> List[Dict]:
        """Generate calendar events from applications"""
        if start_date is None:
            start_date = datetime.now()
        if end_date is None:
            end_date = datetime.now() + relativedelta(months=12)
        
        events = []
        
        for app in applications:
            company_name = app.get("company_name", "Unknown")
            tier = app.get("tier", 3)
            role_name = app.get("role_name", "")
            
            # Preparation phase
            prep_start = app["preparation_start"]
            prep_end = app["preparation_end"]
            if prep_start <= end_date and prep_end >= start_date:
                events.append({
                    "id": f"{app['id']}-prep",
                    "title": f"Prepare: {company_name} - {role_name}",
                    "company": company_name,
                    "tier": tier,
                    "start": prep_start,
                    "end": prep_end,
                    "phase": "preparation",
                    "status": app.get("status", "planned"),
                    "color": self._get_tier_color(tier)
                })
            
            # Application phase
            app_start = app["application_start"]
            app_end = app["application_end"]
            if app_start <= end_date and app_end >= start_date:
                events.append({
                    "id": f"{app['id']}-app",
                    "title": f"Apply: {company_name} - {role_name}",
                    "company": company_name,
                    "tier": tier,
                    "start": app_start,
                    "end": app_end,
                    "phase": "application",
                    "status": app.get("status", "planned"),
                    "color": self._get_tier_color(tier)
                })
            
            # Interview phase
            interview_start = app["interview_start"]
            interview_end = app["interview_end"]
            if interview_start <= end_date and interview_end >= start_date:
                events.append({
                    "id": f"{app['id']}-interview",
                    "title": f"Interview: {company_name} - {role_name}",
                    "company": company_name,
                    "tier": tier,
                    "start": interview_start,
                    "end": interview_end,
                    "phase": "interview",
                    "status": app.get("status", "planned"),
                    "color": self._get_tier_color(tier)
                })
        
        # Sort by start date
        events.sort(key=lambda x: x["start"])
        
        return events
    
    def _get_tier_color(self, tier: int) -> str:
        """Get color for tier"""
        colors = {
            1: "#8b5cf6",  # Violet
            2: "#06b6d4",  # Cyan
            3: "#64748b"   # Slate
        }
        return colors.get(tier, "#64748b")
    
    def export_to_ics(self, events: List[Dict]) -> str:
        """Export events to iCalendar format"""
        ics_lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//CareerPath Planner//EN",
            "CALSCALE:GREGORIAN"
        ]
        
        for event in events:
            ics_lines.extend([
                "BEGIN:VEVENT",
                f"UID:{event['id']}@careerpathplanner.com",
                f"DTSTART:{event['start'].strftime('%Y%m%dT%H%M%S')}",
                f"DTEND:{event['end'].strftime('%Y%m%dT%H%M%S')}",
                f"SUMMARY:{event['title']}",
                f"DESCRIPTION:Phase: {event['phase']}, Company: {event['company']}",
                "END:VEVENT"
            ])
        
        ics_lines.append("END:VCALENDAR")
        
        return "\n".join(ics_lines)

