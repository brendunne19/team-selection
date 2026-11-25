# County Selection Software

1. System Architecture (100% Free to Run)

• Frontend & Hosting: React (Vite) + Tailwind CSS hosted for free on GitHub Pages (auto-deployed via GitHub Actions whenever you push code).
• Drag-and-Drop Engine: @dnd-kit/core for smooth dragging between the player pool and team squads.
• Database & Auth: Supabase (Free Tier) providing a PostgreSQL database, committee-only login protection, and real-time sync so multiple committee members can view changes simultaneously.
• Automated Data Sync: Scheduled GitHub Actions running Python + Playwright (headless Chromium browser) to fetch data without hitting browser/cookie blocks.

2. Visual Selection Board Design

• Super-Wide Horizontal Kanban Board: Teams (1 to N, configurable in admin settings) sit side-by-side in a horizontally scrolling canvas (overflow-x: auto), making it easy to nudge players up or down between adjacent teams (e.g., Team 2 ↔ Team 3).
• Frozen Left Player Pool (position: sticky): Pinned to the left side of the screen while teams scroll behind it. Players are split into Men and Women and automatically sorted from highest grade/rating at the top down to lowest at the bottom. If a player is injured, have an orange outline with a warning but can still be selected but if they are unavailable, grey them out and not have them be selected.
• Side-by-Side Gender Columns per Team: Each team card displays Men (Slots 1–x) on the left and Women (Slots 1–y) on the right so all x+y squad members are visible without vertical scrolling.
• Built-In Rule Guardrails:
	• Nomination Locks: Visual warning badges if a player is dragged into a team ranked lower than their official nomination.
	• Availability Sync: Players marked unavailable or injured for that specific weekend/day are flagged or filtered out.
	• Double-Booking Alerts: Prevents assigning the same player to two teams playing on the same day.

+----------------------------------------------------------------------------------------------------------+

| [FROZEN: PLAYER POOL] |          TEAM 1 (10/10)          ||          TEAM 2 (9/10)           || TEAM 3   |
| (Pinned Left)         | Sat 14 Nov • Milton Keynes       || Sat 14 Nov • Redbridge           || (Scrolls |
|                       | [Copy Squad]                     || [Copy Squad]                     ||  Right)  |
| [Sort: Highest Grade] +-----------------+----------------++-----------------+----------------++----------+

|                       | MEN (5/5)       | WOMEN (5/5)    || MEN (4/5)       | WOMEN (5/5)    || MEN      |
|  MEN (High -> Low)    | [1. Player A]   | [1. Player F]  || [1. Player K]   | [1. Player P]  || ...      |
| [Player 1 • A2 / 840] | [2. Player B]   | [2. Player G]  || [2. Player L]   | [2. Player Q]  ||          |
| [Player 2 • B1 / 795] | [3. Player C]   | [3. Player H]  || [3. Player M]   | [3. Player R]  ||          |
| [Player 3 • C2 / 710] | [4. Player D]   | [4. Player I]  || [4. Player N]   | [4. Player S]  ||          |
|                       | [5. Player E]   | [5. Player J]  || + Drop slot     | [5. Player T]  ||          |
|  WOMEN (High -> Low)  +-----------------+----------------++-----------------+----------------++----------+

| [Player 4 • B2 / 780] | [▼ Show Lineup Sandbox]          || [▲ Hide Lineup Sandbox]          || [▼ Show] |
| [Player 5 • C1 / 730] | (Collapsed by default)           ||  MS1: [Player K]  WS1: [Player P]||          |
|                       |                                  ||  MS2: [Player L]  WS2: [Player Q]||          |
|                       |                                  ||  MD1: [K + M]     WD1: [P + R]   ||          |
|                       |                                  ||  MD2: [N + _]     WD2: [S + T]   ||          |
|                       |                                  ||  XD1: [L + Q]     XD2: [M + R]   ||          |
|                       |                                  ||  XD3: [N + S]                    ||          |
|                       +----------------------------------++----------------------------------++----------+

|                                       <--- Horizontal Scrollbar (Teams 1 to N) --->                      |
+=======================+==================================================================================+

| [FROZEN: RESERVES]    |  MEN RESERVES:   [+ Drop Sub] [Player X • C1] [Player Y • D2]                    |
| (Pinned Bottom Bar)   |  WOMEN RESERVES: [+ Drop Sub] [Player Z • C2] [Player W • D1]                    |
+-----------------------+----------------------------------------------------------------------------------+


Ideally, a team has 10 players in it, if there are less than 5 of either gender, a small warning should appear about lack of team depth, or if more than 6 of either gender a warning about over selection. The whole system should be drag and drop from the player pool or between teams, alternatively you can also click on the slots in a team to assign/remove a player. 

Players should have availability, grades/elo scores, and if relevant nominations and format preferences visible as not all players will be nominated or have preferences. Four players must be nominated per team, and they cannot play lower than that team so if put in lower, show a red warning to highlight this. Players also become locked into certain teams when they play for 2 weekends in a certain team, and so on the third weekend selection there should also be a similar warning.

3. Workflow & Captain Tools

• Squad-First Selection + WhatsApp Export: Each team card has a [Copy Squad] button that formats the 10 selected players (plus fixture date and venue) into a clean, emoji-formatted message ready to paste into your WhatsApp Community.
• Optional Lineup Sandbox ([⚙ Lineups]): Clicking the Lineups button in a team header opens a slide-over drawer pre-populated only with that team's 10 selected players. Captains or committee members can test pairings for the 11 match formats (2 MS, 2 WS, 2 MD, 2 WD, 3 XD) without cluttering the main board or affecting the official squad announcement.
• Dynamic Player Availability Portal: Each player gets a personal, no-login bookmark link (yourapp.github.io/availability?token=...) to update their Saturday/Sunday availability or report injuries mid-season, instantly updating the committee's selection board.

4. Dual-Source Data Pipeline (badminfo.com & ://tournamentsoftware.com)

• badminfo.com (Primary Grades & Ratings): Playwright opens the SPA, waits for the loading spinners to finish, and pulls up-to-date letter grades (A–G) alongside Badminton England's numerical ratings (380–800+ launching January 2027) and Senior County standings.
• ://tournamentsoftware.com (Official IDs & Match History): Playwright programmatically clicks "Accept" on the GDPR cookie wall (or uses a County Secretary login stored in GitHub Secrets) to sync official player IDs and detailed match results.