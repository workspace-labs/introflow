# Trailhead

- kind: tablet
- screens: upright
- language: en
- about: A tablet app for walking clubs. The leader picks a route, plans the trip with the group, follows the map without signal, and keeps a log of how the walk really went.
- stage: #0c1613
- accent: #f2a33a
- drawing: rings
- paper: app
- date: 2026-11-12
- version: 1
- status: draft
- next: Open the app flow to see every screen, step by step.

## facts
- Device [tablet]: Android tablet
- Maps [offline]: Work without signal
- For [people]: Walking clubs

## introduction
- Trailhead is a tablet app for small walking clubs. It keeps everything a walk needs in one place: the route, the people, the kit and the plan for when things run late.
- A walk leader carries a lot in their head. Which route is safe today, who said they were coming, who has the first aid kit, and when to turn back if the group is slow. Trailhead puts those answers on one tablet in the leader's pack.
- This document describes the app as it is today: who it is for, every window in it, and what it can do.

## who
- For whom: The walk leader of a small club: the person who chooses the route, checks who is coming and brings everyone back.
- Where it runs: On one Android tablet in the leader's pack. Maps and plans are saved on it, so it works where there is no signal.
? Why it was built: Because paper maps and group chats do not show, in one place, who is coming, what to carry and when to turn back.

## what
- order: steps
- main: 3
- sub: One walk, from choosing the route to the log.
### Before the walk: Choosing where to go, and getting everyone ready
1. Routes | Before the walk: Every saved walk with its distance, time and difficulty.
   shot: screenshots/1-routes.png
   cut: 0%, 12%
   more: Each route is a card: a small drawing of its shape, where it starts, how long it takes and how hard it is. A route that is already planned shows its date.
   sees: Every saved route, as a card
   sees: Which route is planned, and for when
   does: Opens a route to see its map
2. Trip plan | Before the walk: Who is coming, the kit list, the meeting point and the turn-back time.
   shot: screenshots/3-plan.png
   cut: 0%, 18%
   more: The plan is one page the whole group can check before leaving the car park. Nothing in it needs a signal.
   sees: Who is coming, and who leads
   sees: The kit list, with what is still missing
   does: Ticks each item as it is packed
   does: Starts the walk
   feature: Turn-back time: The hour the group turns back if the top is not reached.
   feature: Shared kit list: One list for everyone, so nothing is packed twice or forgotten.
### On the trail: Finding the way, and remembering it
3. Route map | On the trail: The whole route on a map that works without signal, with distance, climb and time.
   shot: screenshots/2-map.png
   cut: 8%, 22%
   more: The map is saved on the tablet before the walk, so it opens on a hillside with no signal at all.
   sees: The route, the start and the halfway hut
   sees: Distance, climb and walking time
   does: Plans the walk from the map
4. Trip log | After the walk: What the walk really was: distance, time, the height along the way and notes.
   shot: screenshots/4-log.png
   cut: 0%, 30%
   sees: Distance walked and time out
   sees: Notes for next time
   does: Shares the log with the group

## features
- Works without signal: Maps and plans are saved on the tablet before the walk.
- One tablet for the group: Nothing to install on anyone's phone.
? Notes that teach: Each log keeps what to do differently next time, beside its route.

## different
- Works without signal: Maps are saved on the tablet before the walk.
- A turn-back time: The plan holds the hour the group turns back if it is running late.
- One kit list for the group: Everyone sees what is packed and what is still missing.
? A log that teaches: Notes from each walk are kept beside its route, ready for next time.

## conclusion
- Trailhead does a small job well: it gets a group out, around and back, with a plan everyone has seen.
? It suits clubs of up to about a dozen walkers, where one person leads and one tablet is enough.
- Everything described here works without a signal, because the hills are where a signal is least likely.
