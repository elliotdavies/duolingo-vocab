# Get Duolingo word lists and translations

This NodeJS script downloads a list of all the foreign words you've seen during
a Duolingo course, plus their translations (according to the Duolingo
dictionary), and writes them to a JSON file.

It's a hacky, one-off version of https://gitlab.com/nithiya/duolingo[https://gitlab.com/nithiya/duolingo],
which is a much more extensive and better maintained package.

Credit is also due to https://github.com/KartikTalwar/Duolingo[https://github.com/KartikTalwar/Duolingo],
which is the unofficial API package for Duolingo (in Python).

1. Install dependencies:

```bash
npm install
```

2. Log into Duolingo via the web UI and grab your JWT from your browser's cookie
storage.

3. Run the script:

```bash
DUOLINGO_TOKEN="<jwt>" node index.mjs
```
