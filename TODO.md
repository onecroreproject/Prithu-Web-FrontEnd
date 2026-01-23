# Job Filtering Issues Fix

## Issues Identified
- [ ] Experience filtering logic is duplicated and buggy in JobLayout.jsx
- [ ] Filter counts are inaccurate in FilterSection.jsx (uses filtered jobs instead of all jobs)
- [ ] State synchronization issues between JobHeader and JobLayout
- [ ] Complex filtering logic mixing client-side and server-side filtering

## Tasks to Complete
- [ ] Fix experience filtering logic in JobLayout.jsx fetchJobs function
- [ ] Update FilterSection.jsx to use allJobs prop for accurate filter counts
- [ ] Simplify state management between JobHeader and JobLayout components
- [ ] Test all filtering functionality (employment type, work mode, salary, experience, education, skills, etc.)
- [ ] Verify filter counts are accurate
- [ ] Ensure filters work correctly with URL parameters

## Progress
- [x] Analyzed code and identified issues
- [x] Created plan and got user approval
