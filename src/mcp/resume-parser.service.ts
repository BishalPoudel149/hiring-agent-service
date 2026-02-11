import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ResumeParseResult } from './dto/resume-parse-result.dto';

// Using pdf-parse v2.x API
const { PDFParse } = require('pdf-parse');

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
   * Downloads a resume from a URL and extracts structured information via Gemini.
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
      console.log('[ResumeParser] Downloading resume from:', resumeUrl);
      const response = await axios.get<ArrayBuffer>(resumeUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
      });
      console.log('[ResumeParser] Download successful. Content-Type:', response.headers['content-type']);
      console.log('[ResumeParser] File size:', response.data.byteLength, 'bytes');

      const contentType = response.headers['content-type'];
      const fileBytes = Buffer.from(response.data);

      const isPdf =
        contentType?.includes('application/pdf') ||
        resumeUrl.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        console.error('[ResumeParser] Unsupported file type:', contentType);
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: `Unsupported file type: ${contentType ?? 'unknown'
            }. Only PDF resumes are supported currently.`
        };
      }

      console.log('[ResumeParser] Parsing PDF...');
      const parser = new PDFParse({ data: fileBytes });
      const pdfData = await parser.getText();
      await parser.destroy();
      const resumeText = pdfData.text;
      console.log('[ResumeParser] PDF parsed successfully. Text length:', resumeText.length);

      // Check if PDF has extractable text (image-based PDFs have very little text)
      if (resumeText.length < 100) {
        console.warn('[ResumeParser] PDF appears to be image-based or has minimal text. Consider using OCR.');
        // For image-based PDFs, we could implement OCR here
        // For now, return error
        return {
          LinkedInUrl: null,
          GithubUrl: null,
          MajorTechnologies: [],
          MajorProjects: {},
          MajorCertifications: [],
          ErrorMessage: 'PDF appears to be image-based with no extractable text. OCR support needed.'
        };
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
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

      console.log('[ResumeParser] Calling Gemini API with model:', model);
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
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
      console.error('[ResumeParser] Error:', err.message);
      console.error('[ResumeParser] Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      if (err.response?.status === 404) {
        console.error('[ResumeParser] API endpoint not found. Check model name and API version.');
      }
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

