#!/bin/bash

# Quick test script for resume upload to GCS

echo "Testing resume upload to Google Cloud Storage..."
echo ""

# Create a test PDF file
echo "Creating test resume file..."
echo "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF" > /tmp/test-resume.pdf

echo "✓ Test resume created at /tmp/test-resume.pdf"
echo ""

# Make the API call
echo "Uploading resume..."
curl -X POST http://localhost:3000/api/Application/apply \
  -F "name=John Doe" \
  -F "email=john.doe@example.com" \
  -F "position=Software Engineer" \
  -F "jobPostingId=1" \
  -F "resume=@/tmp/test-resume.pdf"

echo ""
echo ""
echo "Done! Check the response above."
