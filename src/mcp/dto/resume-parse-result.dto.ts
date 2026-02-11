export interface ResumeParseResult {
  LinkedInUrl: string | null;
  GithubUrl: string | null;
  MajorTechnologies: string[];
  MajorProjects: Record<string, string>;
  MajorCertifications: string[];
  ErrorMessage: string | null;
}

