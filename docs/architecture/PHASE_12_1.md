# Phase 12.1 — Public DELSU Information Hub + Official Notices

## Goal
Extend DELSU Compass to serve aspiring, newly admitted and current students with public campus-survival information without turning the project into an admissions processing system.

## Scope boundary
DELSU Compass **informs and guides**. Official DELSU portals remain responsible for application, admission, fee payment, course registration and other institutional transactions.

## Public experience
- `/` now contains a real product landing page and selected featured official notices.
- `/explore` is publicly accessible without authentication.
- The information hub exposes published guide articles, official notices, verified map locations and accommodation price ranges derived from approved listings.
- Time-sensitive facts such as Post-UTME dates and cut-off marks are not hard-coded in React.

## Trusted information model
`InformationNotice` stores admission, academic, registration, examination, campus and general notices. Notices support draft/published/archived status, audience, important date, expiry date, featured state and source reference.

`GuideArticle` stores longer-lived public guides such as About DELSU, Campus & Abraka, Accommodation, Admissions and New Student orientation.

Only administrators can create or modify these records. Public routes return only published, non-expired information intended for public/all audiences.

## Reuse of existing modules
The public hub reads verified active locations from the Locations module and computes accommodation rent ranges from approved listings. It does not duplicate map or accommodation databases.

## Administrator role
The admin console now includes `/admin/information`, where authorized system managers can publish, edit, archive and source official notices and public guide articles.
