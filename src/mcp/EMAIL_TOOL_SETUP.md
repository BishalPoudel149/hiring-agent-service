# Email Tool Setup for Evaluation Results

## Overview

The MCP server now includes an email tool (`send_evaluation_result_email`) that automatically sends success or failure emails to candidates based on their evaluation scores.

## Features

✅ **Automatic candidate details fetching** - Tool fetches name, email, and job title from application  
✅ **Threshold-based email routing** - Success emails for scores >= threshold, rejection emails otherwise  
✅ **Meeting URL generation** - Automatically appends meeting link to success emails  
✅ **Agent-generated email content** - Agent creates personalized, professional email bodies dynamically  

## MCP Tool: `send_evaluation_result_email`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobApplicationId` | number | ✅ Yes | Application ID (used to fetch candidate details) |
| `finalAverageScore` | number | ✅ Yes | Final evaluation score (0-100) |
| `emailSubject` | string | ✅ Yes | Email subject (agent generates) |
| `emailBody` | string | ✅ Yes | Email body (agent generates personalized content) |
| `thresholdScore` | number | ❌ No | Override threshold (default: from env or 70) |
| `meetingUrlBase` | string | ❌ No | Override meeting URL base (default: from env) |

### Response

```json
{
  "success": true,
  "emailSent": true,
  "isSuccessEmail": true,
  "score": 85.5,
  "threshold": 70,
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "jobTitle": "Software Engineer",
  "meetingUrl": "https://onboardly.com/interview/123"
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Evaluation threshold score (default: 70)
EVALUATION_THRESHOLD_SCORE=70

# Base URL for meeting links (default: https://onboardly.com/interview/)
MEETING_URL_BASE=https://onboardly.com/interview/

# Email configuration (already configured in email-util.service.ts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## How It Works

1. **Agent evaluates candidate** and saves evaluation with `save_application_evaluation()`
2. **Agent calls `send_evaluation_result_email()`** with:
   - `jobApplicationId`: The application ID
   - `finalAverageScore`: The calculated average score
   - `emailSubject`: Generated subject line
   - `emailBody`: Generated personalized email body
3. **Tool automatically**:
   - Fetches candidate name, email, and job title from database
   - Checks if score >= threshold (default: 70)
   - Generates meeting URL for success cases: `{MEETING_URL_BASE}{jobApplicationId}`
   - Appends meeting URL to success email bodies
   - Sends email via SMTP
4. **Returns result** with email status and details

## Agent Instructions

The agent is configured to:
- Generate **personalized, professional email bodies** dynamically
- Use candidate name and job title in emails
- Create appropriate subjects for success/failure cases
- Include meeting links naturally in success emails

### Example Agent Workflow

```
1. get_unprocessed_applications()
2. For each application:
   a. get_application_details(applicant_id)
   b. parse_resume(resume_url)
   c. get_linkedin_profile(linkedin_url)
   d. Evaluate and calculate scores
   e. save_application_evaluation(...)
   f. send_evaluation_result_email(
        jobApplicationId=123,
        finalAverageScore=85.5,
        emailSubject="Congratulations! Next Steps for Software Engineer Position",
        emailBody="Dear John,\n\nWe are pleased to inform you..."
      )
   g. mark_application_as_processed(applicant_id)
```

## Email Body Generation

**The agent generates email bodies dynamically** - this allows for:
- Personalized content based on evaluation results
- Natural language that adapts to each candidate
- Professional tone that matches the context
- Inclusion of specific feedback or highlights

### Success Email Example (Agent Generated)

```
Dear [Candidate Name],

Congratulations! We are pleased to inform you that your application 
for the [Job Title] position has been successful.

Your strong technical background and relevant experience make you an 
excellent fit for our team.

Please use the meeting link below to schedule your interview:

[Meeting URL will be automatically appended]

We look forward to speaking with you soon!

Best regards,
The Hiring Team
```

### Rejection Email Example (Agent Generated)

```
Dear [Candidate Name],

Thank you for your interest in the [Job Title] position at our company.

After careful review of your application, we have decided to move forward 
with other candidates whose qualifications more closely match our current needs.

We appreciate the time you invested in the application process and wish you 
the best in your job search.

Best regards,
The Hiring Team
```

## Testing

To test the email tool:

1. Ensure your NestJS server is running
2. Ensure SMTP credentials are configured
3. Run your agent - it will automatically discover and use the email tool
4. Check email inbox for test emails

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env`
- Verify SMTP server allows connections
- Check application logs for errors

### Meeting URL not appearing
- Verify `MEETING_URL_BASE` is set correctly
- Check that score >= threshold for success emails
- Meeting URL is only added to success emails

### Agent not discovering tool
- Restart NestJS server to reload MCP tools
- Check MCP SSE connection is active
- Verify tool is registered in `mcp-tool-registry.service.ts`

## Files Modified

- ✅ `mcp-tool-registry.service.ts` - Added `send_evaluation_result_email` tool
- ✅ `application-tools.service.ts` - Added `getFullApplicationDetails()` method
- ✅ `agent.py` - Updated instructions to use email tool

## Next Steps

1. Set environment variables in `.env`
2. Configure SMTP credentials
3. Test with a sample application
4. Monitor email delivery
5. Adjust threshold score as needed
