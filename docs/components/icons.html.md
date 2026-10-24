<!-- Generated from docs/components/icons.html; run python3 scripts/generate-ai-docs.py. -->

[HTML版](icons.html) · [llms.txt](../llms.txt)

# Icons

**Material Design Icons（MDI）を使用しています。** MDI 7.4.47のSVGを同梱しています（Apache License 2.0）。[出典・同梱ファイルを確認する](mdi-icons.html.md#mdi-source)

[定番MDI 128種類・検索・SVGのコピーはこちら →](mdi-icons.html.md)

Icons from **Material Design Icons** (MDI 7.4.47, Apache-2.0). Every glyph is a single `<path>` with `fill="currentColor"`, so it takes the text colour and follows the light/dark theme. Drop each `<svg>` inline — nothing is fetched, so the page's CSP (`default-src 'none'`) is not affected.

## Size ramp

16

20

24

32

48

## Colour states (all use fill="currentColor")

default

primary

success

dim

## Icon tints — the palette

The same single-colour glyphs can carry a semantic hue. One class sets a colour token; the path still paints itself with `currentColor`, so the shape never changes and the light/dark swap comes along for free.

--accent-primary

--accent-success

--accent-danger

--accent-warning

--accent-info

## Tinted variants — the grey twin in the corner is today's look

format-list-checks

1 Tasks · primary

robot-outline

2 Agents · info

source-branch

3 Worktrees · primary

shield-account-outline

4 Roles · info

chart-timeline-variant

5 Plans · primary

bell-outline

6 Alerts · warning

message-text-outline

7 Chat · success

rocket-launch-outline

Launch… · primary

refresh

Rescan · unchanged

close

Close / toast × · danger

plus

Create task · primary

play

Start task · success

check-circle-outline

Approve review · success

undo-variant

Send back · warning

stop

Stop a run · danger

playlist-play

Queue on/off · primary

alert-outline

Alerts / warning

delete-outline

Delete task · danger

pencil-outline

Edit task · unchanged

magnify

Search · unchanged

bullhorn-outline

Notices button · warning

weather-night

Dark theme · info

white-balance-sunny

Light theme · warning

message-plus-outline

New chat · success

content-copy

Copy bubble · unchanged

help-circle-outline

Keys (?) · unchanged

unfold-more-horizontal

open all · unchanged

unfold-less-horizontal

fold all · unchanged

## Current against tinted, side by side

today

tinted

start

today

tinted

approve

today

tinted

close

today

tinted

stop

today

tinted

warning

today

tinted

tasks

format-list-checks

1 Tasks

robot-outline

2 Agents

source-branch

3 Worktrees

shield-account-outline

4 Roles

chart-timeline-variant

5 Plans

bell-outline

6 Alerts

message-text-outline

7 Chat

## Header & view actions

bullhorn-outline

Notices button

help-circle-outline

Keys (?) button

weather-night

Dark theme

white-balance-sunny

Light theme

magnify

Search

unfold-more-horizontal

open all

unfold-less-horizontal

fold all

rocket-launch-outline

Launch…

refresh

Rescan

close

Close / toast ×

## Tasks board & chat

plus

Create task

play

Start task (▶)

message-plus-outline

New chat

content-copy

Copy bubble

## Task actions (review & lifecycle)

pencil-outline

Edit task

delete-outline

Delete task

check-circle-outline

Approve review

undo-variant

Send back

stop

Stop a run

playlist-play

Queue on/off

alert-outline

Alerts / warning

## In context

Start task

a Backlog card's play button (▶)

Approve

a Review card's approve button (green)

Send back

return a task to the previous column

Stop

halt a running agent (filled square)

Rescan

an outline button, icon before the word

Close

a toast's × (dim, hover to full)

Usage pattern (inline SVG, currentColor, sized by CSS)

```html
<button class="btn btn-sm btn-outline-secondary">
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M17.65,6.35C…Z"/></svg>
  Rescan
</button>

/* icon colour follows the text: */
svg { fill: currentColor; flex: none; }

/* a tint is only a colour on an ancestor — the path never changes: */
.i-success { color: var(--accent-success); }

<svg class="i-success" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>

/* unchanged today: no tint class, the glyph just inherits the text colour */
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M17.65,6.35C…Z"/></svg>
```
