# ShareShed: Campus Resource Sharing

**CodeHack India 2026 · Problem: Unlock Underused Equipment and Spaces**

ShareShed helps a college safely share its labs, tools and rooms with students. It adds trust, safety and a full history to booking, so it is more than a normal booking app.

**Live app:** https://ishwaripatil618-lang.github.io/ShareShed/

## The problem
Labs, cameras and workshop tools sit unused, while students cannot afford them. Normal booking apps do not check training, approval, condition or damage.

## Use case
One college shares its workshop lab and media equipment with its own students.

## Users
- **Student:** finds a resource, checks eligibility, requests a booking.
- **Resource owner (lab in-charge):** approves or rejects requests, checks users in, records the return.
- **Admin:** can see and manage all resources.

## Full journey (works end to end)
1. Owner lists a resource with rules, maximum hours and required training.
2. Student searches and sees "eligible" or "not eligible" with the reason.
3. Student requests a booking.
4. The system checks training, time, hour limit and fair-use limit.
5. Owner approves, rejects (reason required) or adds to the waiting list.
6. Owner checks the user in and records the condition before use.
7. Owner records the return and the condition after use.
8. Damage or delay is reported automatically.
9. Both sides can see the full history.

## Features
- Resource listings with location, rules and training needs
- Search and eligibility check
- Booking with conflict detection
- Waiting list with a clear reason and position
- Approval, rejection and waiting list by the owner
- Check-in and return with before and after condition
- Automatic damage and delay reports
- Fair use: maximum 2 open bookings per person
- Role-based controls: students, owners and admin see different actions
- Activity history for every important action
- Human decisions: the owner makes every approval, rejection and penalty decision

## How to test (for judges)
Open the live link. Use the **"Acting as"** dropdown at the top right. No password is needed.

| Step | Do this |
|---|---|
| 1 | As **Asha Patil**: Find resources, request the **3D Printer** for a future time, add a purpose |
| 2 | Switch to **Dr. Mehta**: Requests, click **Approve** |
| 3 | Still as Dr. Mehta: click **Check in**, then **Return** with condition **Damaged** |
| 4 | Open **History and incidents**: the damage report shows |
| 5 | As **Rahul Verma** (no training): the 3D Printer is blocked |
| 6 | As Asha, book the Camera Kit. As Dr. Mehta, approve it. As Rahul, book the same time: he goes on the **waiting list** |

Use **Reset demo data** at the bottom of the page to start again.

## Tech stack
HTML, CSS and JavaScript (single file), hosted on GitHub Pages.

## AI and tools disclosure
This prototype was built during the hackathon with help from **Claude (Anthropic)** for code generation. No templates or external libraries are used.

## Privacy and safety
- All demo data is fictional.
- No real personal data is collected.
- Important decisions are made by a person, not by an automatic system.

## Known limitations
- Data is saved only in the browser (localStorage), so it is not shared between devices.
- Login is simulated with a role dropdown.
- No real notifications or photo upload yet.

## Future plans
- Real login and a shared database (for example Supabase)
- Email and WhatsApp reminders for approvals and overdue returns
- Photo upload for condition records
- An AI summary of damage reports, with the owner always making the final decision
- Support for several institutions
