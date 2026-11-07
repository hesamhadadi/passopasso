# PassoPasso — UX Pilot reference edition
An interactive mobile PWA in React, TypeScript and Tailwind. Start at the monochrome Welcome screen. "View design sheets" opens all nine original sheets with a screen selector for classroom walkthroughs.

## Run and deploy
Node 22.12+; npm ci; npm run dev. Use npm test for production build and journey tests. For local production preview: npm run preview. Vercel: Vite, build npm run build, output dist, repository root, no environment variables. Install from the browser over HTTPS after the first online visit.

## Reference fidelity
The PDF exports only three complete phone faces per main landscape sheet; the fourth is clipped, and the fifth is outside the exported view. The 21 fully visible phone faces across sheets 1–6 and 9 use lossless source artwork with labelled keyboard-operable controls and real form fields. Changed values and selections are drawn by React. Other states are native layouts reconstructed from the visible fragments and navigation logic. Practice completion and post-visit record additionally follow the complete shared Sheet 06 design. Reference-sheet mode preserves the export including its cropping. This is a reference-based working prototype, not an official administrative service.

## Demo
Create a plan → fill in profile → procedure map → prepare documents → checklist. Choose from simulated files, or use Upload or Drop / Take Photo for real local files up to 5 MB. Review and compare, record missing details, inspect tips and select an action. The follow-up plan does not change document status. Practise both questions, try an incorrect answer, then record the visit outcome. The map menu opens the profile, plan and outcome. Language selection saves a preference; screen copy follows the English reference. Reminders are saved in the app, not sent as push notifications. Files and progress stay in this browser. This version has a separate local storage namespace from the previous dashboard.
