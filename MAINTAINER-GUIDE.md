# Film Society Bhubaneswar website: Maintainer Guide

This guide has two parts:

- **Part 1: Setting up the computer.** For the person preparing the PC. Done once.
- **Part 2: Adding a film.** For the person maintaining the website. Done every time a film is screened.

The website is built from a folder of notes. You write and edit the notes in **Obsidian** (a note-taking app). When you **publish**, the website updates by itself within a few minutes.

---

# Part 1: Setting up the computer (one time)

### 1.1 Install the programs

Install these, accepting the default options:

| Program | Where to get it | Why |
|---|---|---|
| **Git** | https://git-scm.com/download/win | Sends changes to GitHub. It includes the sign-in helper. |
| **Node.js 22 LTS** | https://nodejs.org | Builds and publishes the site. |
| **Obsidian** | https://obsidian.md | Where all editing happens. |

### 1.2 Give the maintainer access to GitHub

The maintainer needs a GitHub account with **write access** to the repository `shreyan707/fsb_quartz`.

On GitHub, open the repository, then **Settings → Collaborators → Add people**.

### 1.3 Download the website files

Open **PowerShell** (Start menu → type "PowerShell") and run:

```powershell
cd $HOME\Documents
git clone https://github.com/shreyan707/fsb_quartz.git
cd fsb_quartz
npm ci
```

`npm ci` takes a few minutes. The website now lives in `Documents\fsb_quartz`.

Set the name that appears on their changes. Use the maintainer's name and email:

```powershell
git config user.name "Maintainer Name"
git config user.email "maintainer@example.com"
```

The first time they publish, a browser window asks them to sign in to GitHub. After that, Git remembers them.

### 1.4 Open the notes in Obsidian

1. Open Obsidian and choose **Open folder as vault**.
2. Pick `Documents\fsb_quartz\content`. Pick the **`content`** folder, not `fsb_quartz`.
3. If asked, click **Trust author and enable plugins**.

### 1.5 Obsidian settings

In **Settings (gear icon) → Files and links**:

| Setting | Value |
|---|---|
| Default location for new attachments | **In the folder specified below** → `assets/posters` |
| New link format | **Absolute path in vault** |
| Use [[Wikilinks]] | **On** |

### 1.6 Install the two plugins

Go to **Settings → Community plugins**, click **Turn on community plugins**, then **Browse**. Install and **enable** these two:

**Templater** (by SilentVoid): fills in a new note's blank layout automatically.

In Settings → Templater:
- **Template folder location:** `templates`
- **Trigger Templater on new file creation:** On
- **Enable folder templates:** On. Then add two rules:
  - Folder `movies` → template `templates/Film.md`
  - Folder `Director Profiles` → template `templates/Director Profile.md`

**Image Converter** (by xRyul): turns any image you drag in into a small WebP file.

In its settings (option names can differ slightly between versions):
- **Convert to:** WEBP
- **Quality:** 80
- **Resize:** width **342** px, keeping the proportions. This matches the existing posters.
- **Rename / filename:** use the note's name, if the option exists.

### 1.7 Create the templates folder and files

In Obsidian, create a folder called **`templates`** at the top level of the vault, next to `movies`. The website ignores this folder, so nothing in it gets published.

Create these three notes inside it and paste in the text shown.

**`templates/Film.md`**

```markdown
---
title: "TITLE"
original_title: "ORIGINAL TITLE"
release_year: YEAR
director: "DIRECTOR NAME"
language: "LANGUAGE"
country: "COUNTRY"
runtime: "MINUTES min"
genre:
  - "GENRE"
screenings:
  - YYYY-MM-DD
member_screenings:
  - YYYY-MM-DD
poster: "assets/posters/FILE-NAME.webp"
---

# TITLE (YEAR)

## Movie Information

| Field | Details |
|---|---|
| Title | TITLE |
| Original Title | ORIGINAL TITLE |
| Release Year | YEAR |
| Director | DIRECTOR NAME |
| Language | LANGUAGE |
| Country | COUNTRY |
| Runtime | MINUTES min |
| Genre | GENRE, GENRE |

## Description

DESCRIPTION

## Additional Information

**Cast:**
- ACTOR 1
- ACTOR 2
- ACTOR 3

**Production Company:** COMPANY

**IMDb Rating:** RATING

## Screenings

- DAY MONTH YEAR · Actor Studio
- DAY MONTH YEAR · Member Screening

## Tags

#GENRE #DIRECTOR-NAME #yYEAR #SERIES_TAG #SEASON_TAG
```

**`templates/Director Profile.md`**

```markdown
---
title: "DIRECTOR NAME"
tags:
  - director
tmdb_id: TMDB NUMBER
photo: "[[assets/director-profiles/FILE-NAME.webp]]"
films_screened: 1
---

<p class="director-label">Director</p>

<div class="director-profile">
<img src="assets/director-profiles/FILE-NAME.webp" alt="DIRECTOR NAME">
<div class="director-facts">

- **Born:** YYYY-MM-DD, CITY, COUNTRY
- **Films screened:** 1

FIRST SENTENCE OF THE BIOGRAPHY.

</div>
</div>

## Biography

FULL BIOGRAPHY

Description above from the Wikipedia article DIRECTOR NAME, licensed under CC BY-SA, full list of contributors on Wikipedia.

## Films screened

- [[movies/DECADE/FILM-FILE-NAME|FILM TITLE]] (YEAR)
```

**`templates/Season Page.md`**

```markdown
---
title: "SEASON YEAR"
tags:
  - SEASON_PAGE_TAG
---

# SEASON YEAR

**MONTHS** · 0 screenings · Tag: #SEASON_TAG

| # | Date | Film | Year | Director |
|---|---|---|---|---|

[[INDEX_LINK|← All seasons]]
```

### 1.8 Test it

1. Make a small change, such as a typo fix on any film page.
2. Follow **Part 2, Step 8 (Publish)**.
3. Check the website updates after a few minutes.

If publishing fails, see **Troubleshooting** at the end.

> **Note for the setup person:** the plain `npx quartz sync` command does **not** work on this repository. It tries to download from a branch called `v5` that doesn't exist, then stops. It also *force*-pushes, which can overwrite other people's changes. Always use the two-line publish command from Step 8, which downloads `main` first.

---

# Part 2: Adding a film (every time)

Do the steps in order. A checklist is at the end.

## Step 1: Collect the film's details

Search for the film on **https://www.themoviedb.org** (TMDB) and write down:

- Title, original title (if it's in another language), and year of release
- Director, language, country, runtime in minutes, and genres
- Top 3 actors and the production company
- The **poster**: on the film's page, click the poster and download the image

Get the **IMDb rating** from **https://www.imdb.com**.

For the **description**, use the Film Society's own write-up from the screening announcement if there is one. Otherwise use TMDB's summary.

Also note the **screening date**, and whether it's:
- **Actor Studio**: the Sunday series, or
- **Member Screening**: the Saturday series.

## Step 2: Choose the file name and folder

**File name:** the title in lowercase, with every space or punctuation mark replaced by a hyphen, then the year. Remove accents (é → e). Drop a leading "The" only if the title on the poster doesn't have it.

| Film | File name |
|---|---|
| The Edge of Heaven (2007) | `the-edge-of-heaven-2007` |
| Where Is the Friend's House? (1987) | `where-is-the-friend-s-house-1987` |
| Moolaadé (2005) | `moolaade-2005` |

**Folder:** the decade of the **release year**, inside `movies`. For example, a 2007 film goes in `movies/2000s`, and a 1968 film goes in `movies/1960s`.

> **Before creating:** search Obsidian (Ctrl+O) for the title. If the film **already has a page**, don't make a new one. Just add the new screening date (Step 3 and Step 4) and continue from Step 6.

## Step 3: Create the film note

1. In the left sidebar, right-click the decade folder (e.g. `movies/2000s`) → **New note**.
2. Name it with the file name from Step 2.
3. The template fills in automatically. If it doesn't, press **Ctrl+P**, type "Templater: Open insert template modal", and choose **Film**.
4. Replace every word in CAPITALS with the real details.

**Rules for the top section (between the `---` lines):**

| Field | What to write | Example |
|---|---|---|
| `title` | The title, in "quotes" | `"The Edge of Heaven"` |
| `original_title` | Original-language title. Delete the line if it's the same as the title. | `"Auf der anderen Seite"` |
| `release_year` | Just the number, **no** quotes | `2007` |
| `director` | Full name, in quotes. For two directors, join them with `&`. | `"Fatih Akin"` |
| `language` | In quotes. Separate several languages with `/`. | `"French/Wolof"` |
| `country` | In quotes. Separate several countries with commas. Use **United States of America**, not USA. | `"Germany, Turkey"` |
| `runtime` | Minutes plus "min", in quotes | `"122 min"` |
| `genre` | One genre per line, each starting with two spaces, a dash, then the genre in quotes | `  - "Drama"` |
| `screenings` | **Actor Studio (Sunday)** dates only. Format **YEAR-MONTH-DAY**. **Delete both lines** if it's not Actor Studio. | `  - 2024-12-29` |
| `member_screenings` | **Member Screening (Saturday)** dates only. Same format. **Delete both lines** if it's not a member screening. | `  - 2023-12-16` |
| `poster` | Set in Step 5 | `"assets/posters/the-edge-of-heaven-2007.webp"` |

> **Dates:** always write them as `2024-12-29` (year-month-day, with leading zeros). Never write 29/12/2024.
> **Never mix the two date fields.** Sunday dates go only in `screenings`; Saturday dates go only in `member_screenings`.

**In the page body:**
- The **Movie Information** table repeats the same details.
- Under **Screenings**, write each date in words, with the series after it, e.g. `- 16 December 2023 · Member Screening`. Delete the line that doesn't apply.

## Step 4: Tags

The last line of the note holds the tags. Separate them with spaces. **A tag can never contain a space.**

| Tag | Rule | Example |
|---|---|---|
| Genre | Each genre, spaces → hyphens | `#Drama` `#Science-Fiction` |
| Director | Name with spaces → hyphens. Remove dots and accents. Give each director their own tag. | `#Ousmane-Sembene` `#Darin-J-Sallam` |
| Year | The release year with a `y` in front (a tag can't be only digits) | `#y2007` |
| Series | `#actor_studio` for Sunday, `#member_screening` for Saturday. Use both if screened in both. | `#member_screening` |
| Season | See the table below | `#member_winter_2023` |

**Which season is the screening in?** Go by the **screening date**, not the release year:

| Screening month | Season |
|---|---|
| March, April, May, June | **Summer** of that year |
| July, August, September | **Monsoon** of that year |
| October, November, December | **Winter** of that year |
| January, February | **Winter** of the **previous** year |

For example, a screening on 10 January 2026 is in **Winter 2025**.

**The season tag is written differently for each series:**

| Series | Season tag looks like |
|---|---|
| Actor Studio (Sunday) | `#winter_2025` |
| Member Screening (Saturday) | `#member_winter_2025`, with `member_` in front |

Full example:

```
#Drama #Fatih-Akin #y2007 #member_screening #member_winter_2018
```

## Step 5: Add the poster

1. Drag the downloaded poster image into the film note. Image Converter turns it into a `.webp` file in `assets/posters`.
2. Check the file's name in `assets/posters`. If it isn't the same as the film's file name, right-click it → **Rename**. For example, it should be `the-edge-of-heaven-2007.webp`.
3. Dragging the image also adds a line like `![[...webp]]` to the note. **Delete that line.**
4. In the top section, set `poster: "assets/posters/the-edge-of-heaven-2007.webp"`.

Nothing else is needed. When the site is published, it automatically adds the image sizes to the page and makes smaller copies where it can, so large posters are fine.

## Step 6: The director's page

Press **Ctrl+O** and search the director's name. Director pages are in the `Director Profiles` folder.

### If the director already has a page

1. At the bottom, under **Films screened**, add a line for the film. Keep the list in order of year:
   ```
   - [[movies/2000s/the-edge-of-heaven-2007|The Edge of Heaven]] (2007)
   ```
2. Increase the films-screened number in **both** places by one:
   - the top section: `films_screened: 3`
   - the facts list: `- **Films screened:** 3`

### If the director is new

1. Right-click the `Director Profiles` folder → **New note**. Name it after the director in lowercase with hyphens, e.g. `fatih-akin`. The template fills in.
2. On TMDB, open the director's page (click their name on the film's page). From there:
   - **TMDB number:** the number in the web address, e.g. `themoviedb.org/person/`**`4956`**`-...` → `tmdb_id: 4956`
   - **Born:** the date (as `YYYY-MM-DD`) and place. If the director has died, add a line under it: `- **Died:** YYYY-MM-DD`
   - **Biography:** copy it into the Biography section. Put its first sentence in the box near the top as well.
3. **Photo:**
   1. Download the director's photo from TMDB and drag it into the note. It becomes a `.webp`.
   2. Move the image from `assets/posters` to **`assets/director-profiles`** by dragging it in the sidebar.
   3. Rename it to the same name as the director's page, e.g. `fatih-akin.webp`.
   4. Delete the `![[...]]` line that was added to the note.
   5. Replace `FILE-NAME` with that name in **both** places: the `photo:` line and the `<img src=...>` line.
4. If the film is Actor Studio, add `  - actor_studio` under `  - director` in the `tags:` list.
5. Fill in the **Films screened** list with this film, and set the films-screened count to `1`.

## Step 7: Add the film to the lists

### 7-0. Good to know: the home page and the All Films page

The home page shows the **12 most recently screened** films, Actor Studio and member screenings together (this is `Recent.base`), and links to the **All Films** page (`films.md`), which shows every film as posters or tables. Both fill themselves in from the film notes, so you never edit them by hand. A film appears in the home page strip once its note has a screening date that has already passed, under either `screenings:` or `member_screenings:`. Future dates are ignored until the site is next published after that day.

### 7a. The film list: `movies/index.md`

Find the decade heading (e.g. `## 2000s`) and add a line in order of year:

```
- [[movies/2000s/the-edge-of-heaven-2007|The Edge of Heaven]] (2007) – Dir. Fatih Akin (Germany, Turkey)
```

### 7b. The season page

| Series | Season pages are in | Example |
|---|---|---|
| Actor Studio | `actor-studio` | `actor-studio/winter-2025.md` |
| Member Screening | `member-screenings` | `member-screenings/winter-2025.md` |

Open the right season page and add a row at the end of the table, in date order. Copy the row above and change it:

```
| 7 | 10 January 2026 | [[movies/1950s/cairo-station-1958\|Cairo Station]] | 1958 | Youssef Chahine |
```

- The first number is the row's position: one more than the row above.
- Inside the table, the link **must** use `\|` (backslash, then the bar), not just `|`.
- If the film was shown in **both** series, add ` ★` after the link on **both** season pages.

Then update the screening counts:
1. At the top of the season page: `**October 2025 – February 2026** · 13 screenings · ...`
2. In that series' **index** page (`actor-studio/index.md` or `member-screenings/index.md`): the season's row in the table, and the **Total** line at the bottom.

### 7c. If it's the first screening of a new season

1. Right-click `actor-studio` or `member-screenings` → **New note**. Name it like `summer-2027`.
2. Insert the **Season Page** template (Ctrl+P → "Templater: Open insert template modal" → Season Page).
3. Fill it in:
   - **Title:** e.g. `Summer 2027`
   - **Months:** `March – June 2027`, `July – September 2027` or `October 2027 – February 2028`
   - **Page tag:** `actor_studio_season` or `member_screening_season`
   - **Season tag:** e.g. `summer_2027` or `member_summer_2027`
   - **Index link:** `actor-studio/index` or `member-screenings/index`
4. In the series index page, add a `## 2027` heading if it's missing, and a row for the new season. Copy an existing row as the pattern.

## Step 8: Check and publish

### Preview (optional, recommended)

Open PowerShell and run:

```powershell
cd $HOME\Documents\fsb_quartz
npx quartz build --serve
```

Wait for "Started a Quartz server", then open **http://localhost:8080** in a browser and look at the new pages. When you're done, press **Ctrl+C** in PowerShell to stop it.

> **Don't see your changes? Do a hard refresh.** The browser keeps old copies of pages, images and scripts. A normal reload (the reload button or **F5**) may still show the old version. Press **Ctrl+Shift+R** (or **Ctrl+F5**) instead. This is called a *hard refresh*, and it makes the browser fetch everything again. Do this whenever a change doesn't appear, in the preview and on the live site.

### Test the full production build (optional, advanced)

`quartz build --serve` is quick, but it skips the extra processing steps that run on the real site (tag link fixes, accessibility fixes, search index splitting, image optimization). To test exactly what gets published, build and process the site, then serve the `public/` folder. Run from the website folder:

```powershell
cd $HOME\Documents\fsb_quartz
npx quartz build
npm run postprocess
node scripts/serve.mjs
```

Then open **http://localhost:8123/**. Press **Ctrl+C** to stop. The server runs from the site root, like the live site, so the graph, search and fonts load the same way. (Don't use an old copy of `serve.mjs` that adds a `/fsb_quartz` prefix. That was for the old GitHub Pages address and breaks the graph.)

- `scripts/serve.mjs` is part of the repository. To use another folder or port: `node scripts/serve.mjs public 9000`.
- To pick up new changes, run `npx quartz build` and `npm run postprocess` again. You don't need to restart the server. Then do a **hard refresh (Ctrl+Shift+R)** in the browser.
- If old pages still appear, delete the `public` folder first and rebuild. Don't run `postprocess` twice on the same build.
- If plugins are missing or were updated, run `npm run install-plugins` before building.
### Publish

In PowerShell:

```powershell
cd $HOME\Documents\fsb_quartz
git pull origin main
npx quartz sync --no-pull -m "Add The Edge of Heaven"
```

Change the text in quotes to describe what you did. Wait 2–3 minutes, then check the live site: **https://bhubaneswar.filmsociety.workers.dev**.

> **Always run `git pull origin main` first.** It downloads any changes others have made, so yours don't overwrite them.

---

## Checklist

- [ ] Film note is in the right decade folder, and its file name is lowercase-with-hyphens plus the year
- [ ] Every CAPITAL placeholder is replaced
- [ ] Dates are written `YYYY-MM-DD`; Sunday dates are in `screenings`, Saturday dates in `member_screenings`
- [ ] Tags include genre, director, year, series and season, with no spaces inside a tag
- [ ] Poster is a `.webp` in `assets/posters`, named like the film, and the `poster:` line matches it
- [ ] Director page is updated (film line plus **both** counts), or a new one is created with its photo in `assets/director-profiles`
- [ ] Film is added to `movies/index.md`
- [ ] Row is added to the season page, and the counts are updated on the season page and the index
- [ ] Previewed, then published

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Poster doesn't show | The `poster:` line doesn't match the file exactly. Check the spelling and the `.webp` ending. |
| Link shows as missing or greyed out | The link's path doesn't match the file name. Check the folder and spelling inside `[[...]]`. |
| A tag is split in two | It contains a space. Use hyphens instead. |
| Table row looks broken | The link inside the table needs `\|`, not `|`. |
| Page looks broken at the top | Something is wrong between the `---` lines: a missing quote, or genre lines without the two spaces and the dash. |
| Template didn't fill in | Ctrl+P → "Templater: Open insert template modal" → pick the template. |
| Changes don't show in the browser (preview or live site) | The browser is showing an old saved copy. Do a hard refresh with **Ctrl+Shift+R**. F5 or the reload button may not be enough. |
| `git pull` says "conflict" | Stop and contact the website owner; don't try to fix it. |
| Publish asks to sign in | Sign in to GitHub in the browser window that opens. |
| Publish says "permission denied" | Your GitHub account doesn't have access yet. Ask the owner (Part 1.2). |
