import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdfParseModule from 'pdf-parse';
import { ResumeParseResult } from './dto/resume-parse-result.dto';

const pdfParse = (pdfParseModule as any).default;

const SYSTEM_PROMPT = `You are an expert resume parser. Given the raw text of a resume, extract and return the following fields in strict JSON format. Use null or empty arrays/objects if data is missing. Only return the JSON object, no extra text. Example format:
{
  "LinkedInUrl": "https://linkedin.com/in/example",
  "GithubUrl": "https://github.com/example",
  "MajorTechnologies": ["C#", ".NET", "Azure"],
  "MajorProjects": { "Project A": "High", "Project B": "Medium" },
  "MajorCertifications": ["Certification 1", "Certification 2"],
  "ErrorMessage": null
}`;

@Injectable()
export class ResumeParserService {
  /**
   * Downloads a resume from a URL and extracts structured information via Anthropic.
   * Mirrors ResumeParserTool.ParseResumeAsync behavior in C#.
   */
  async parseResume(resumeUrl: string): Promise<ResumeParseResult> {
    if (!resumeUrl || !resumeUrl.trim()) {
      return {
        LinkedInUrl: null,
        GithubUrl: null,
        MajorTechnologies: [],
        MajorProjects: {},
        MajorCertifications: [],
        ErrorMessage: 'Resume URL cannot be empty.'
      };
    }

    try {
      const response = await axios.get<ArrayBuffer>(resumeUrl, {
        responseType: 'arraybuffer'
      });
      const contentType = response.headers['content-type'];
      const fileBytes = Buffer.from(response.data);

      const isPdf =
        contentType?.includes('application/pdf') ||
        resumeUrl.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: `Unsupported file type: ${
            contentType ?? 'unknown'
          }. Only PDF resumes are supported currently.`
        };
      }

      const pdfData = await pdfParse(fileBytes);
      const resumeText = pdfData.text;

      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      if (!apiKey) {
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: 'Gemini API key not configured.'
        };
      }

      const llmPrompt = `${SYSTEM_PROMPT}\n\nResume Text:\n${resumeText}`;

      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: llmPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!text) {
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: 'Empty response from Gemini.'
        };
      }

      try {
        // Extract JSON from response (Gemini sometimes wraps JSON in markdown code blocks)
        let jsonText = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        const parsed: ResumeParseResult = JSON.parse(jsonText.trim());
        return {
          LinkedInUrl: parsed.LinkedInUrl ?? null,
          GithubUrl: parsed.GithubUrl ?? null,
          MajorTechnologies: parsed.MajorTechnologies ?? [],
          MajorProjects: parsed.MajorProjects ?? {},
          MajorCertifications: parsed.MajorCertifications ?? [],
          ErrorMessage: parsed.ErrorMessage ?? null
        };
      } catch {
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: 'Failed to parse LLM response.'
        };
      }
    } catch (err: any) {
      return {
        LinkedInUrl: null,
        GithubUrl: null,
        MajorTechnologies: [],
        MajorProjects: {},
        MajorCertifications: [],
        ErrorMessage: `Error parsing resume: ${err?.message ?? String(err)}`
      };
    }
  }
}

