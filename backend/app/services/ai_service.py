import json
import re
from typing import Optional, Tuple
from openai import OpenAI
from app.core.config import OPENAI_API_KEY, DEEPSEEK_API_KEY, DEFAULT_AI_PROVIDER, DEFAULT_AI_MODEL


class AIService:
    """AI resume optimization service"""

    def __init__(self):
        self.provider = DEFAULT_AI_PROVIDER
        self.model = DEFAULT_AI_MODEL

    def _get_client(self) -> Tuple[OpenAI, str]:
        """Get the appropriate AI client based on config."""
        if self.provider == "deepseek" and DEEPSEEK_API_KEY:
            client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
            return client, self.model
        elif OPENAI_API_KEY:
            client = OpenAI(api_key=OPENAI_API_KEY)
            return client, "gpt-4o-mini"
        else:
            raise ValueError("未配置 AI API Key，请在设置中配置")

    def optimize_resume(
        self,
        resume_text: str,
        target_position: Optional[str] = None,
        target_industry: Optional[str] = None,
        tone: str = "professional",
        language: str = "zh",
    ) -> dict:
        """Optimize a resume and return structured results."""
        client, model = self._get_client()

        system_prompt = self._build_system_prompt(tone, language)
        user_prompt = self._build_user_prompt(resume_text, target_position, target_industry, language)

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        return self._parse_response(content)

    def chat_about_resume(
        self,
        resume_text: str,
        question: str,
        history: list = None,
    ) -> str:
        """Chat about a resume in context."""
        client, model = self._get_client()

        messages = [
            {
                "role": "system",
                "content": "你是一个专业的简历顾问。根据用户提供的简历回答用户的问题。"
                           "给出具体、可操作的建议。回复简洁清晰。",
            },
            {
                "role": "user",
                "content": f"以下是我的简历内容：\n\n{resume_text}\n\n"
                           f"我的问题是：{question}",
            },
        ]

        if history:
            for h in history:
                messages.append(h)

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
        )

        return response.choices[0].message.content

    def _build_system_prompt(self, tone: str, language: str) -> str:
        lang = "Chinese" if language == "zh" else "English"
        tone_desc = {
            "professional": "Professional and formal",
            "concise": "Short and impactful",
            "creative": "Creative and standout",
        }

        return f"""You are an expert resume consultant and ATS (Applicant Tracking System) analyst.
Your task is to analyze and optimize resumes to help candidates pass ATS filters and impress recruiters.

Language: {lang}
Tone: {tone_desc.get(tone, 'Professional')}

You MUST respond in valid JSON format with the following structure:
{{
    "score": <integer 0-100, ATS compatibility score>,
    "summary": "<2-3 sentence summary of the resume's strengths and weaknesses>",
    "optimized_text": "<the complete optimized resume in markdown format>",
    "suggestions": [
        {{
            "type": "content|format|keyword|ats",
            "severity": "high|medium|low",
            "title": "<short title>",
            "description": "<what's wrong>",
            "suggestion": "<how to fix it>"
        }}
    ],
    "keyword_matches": {{
        "matched_keywords": ["<industry keywords found in resume>"],
        "missing_keywords": ["<important keywords missing from resume>"],
        "keyword_density": <float 0-100>,
        "suggestions": ["<tips to improve keyword coverage>"]
    }},
    "ats_feedback": "<ATS-specific feedback about formatting, headers, file type considerations>"
}}

IMPORTANT:
- Be honest and constructive. Don't inflate scores.
- Provide specific, actionable suggestions.
- The optimized_text should preserve the user's actual experience and skills, just improve the presentation.
- For ATS analysis, consider: standard section headers, no tables/columns, proper date formats, keyword relevance.
"""

    def _build_user_prompt(
        self,
        resume_text: str,
        target_position: Optional[str],
        target_industry: Optional[str],
        language: str,
    ) -> str:
        prompt = f"Please analyze and optimize the following resume:\n\n{resume_text}\n\n"
        if target_position:
            prompt += f"\nTarget Position: {target_position}\n"
        if target_industry:
            prompt += f"Target Industry: {target_industry}\n"
        prompt += f"\nLanguage: {'Chinese' if language == 'zh' else 'English'}"
        return prompt

    def _parse_response(self, content: str) -> dict:
        """Parse the AI response, handling markdown code blocks."""
        # Try direct JSON parse first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Fallback: return raw text as summary
        return {
            "score": 60,
            "summary": content[:500],
            "optimized_text": content,
            "suggestions": [],
            "keyword_matches": {
                "matched_keywords": [],
                "missing_keywords": [],
                "keyword_density": 0,
                "suggestions": [],
            },
            "ats_feedback": "请检查 AI API 配置或稍后重试",
        }
