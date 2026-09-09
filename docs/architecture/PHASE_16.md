# Phase 16 — Deployment and Final Audit

Phase 16 finalizes DELSU Compass for handoff and deployment. It does not add a new product domain.

## Finalization work

- production deployment configuration for Render
- SPA rewrite configuration for Vercel
- backend Dockerfile
- complete production environment documentation
- explicit MongoDB Atlas replacement instructions
- external-service inventory
- generic SMTP email-verification delivery through Nodemailer
- final smoke-test checklist
- cumulative final-project packaging

## Production architecture

Browser → React/Vite frontend → HTTPS REST API → Node/Express backend → MongoDB Atlas

The backend additionally calls OpenRouteService for directions. Email verification is sent from the backend through SMTP when enabled. Browser geolocation remains permission-based and live coordinates are not stored as navigation history.

## Final scope boundary

DELSU Compass informs, guides, organizes, and supports campus life. It does not replace DELSU institutional systems for admission processing, fee payment, course registration, or other official transactions.
