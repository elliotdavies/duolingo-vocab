/**
 * H/T https://github.com/KartikTalwar/Duolingo
 * H/T https://gitlab.com/nithiya/duolingo
 */

import fetch from "node-fetch";
import fs from "fs/promises";

const token = process.env.DUOLINGO_TOKEN;

if (!token) {
  throw new Error("Missing env var DUOLINGO_TOKEN");
}

const vocabOverviewUrl = "https://www.duolingo.com/vocabulary/overview";

const mkDictionaryUrl = (lang, words) => {
  const wordString = "[" + words.map((w) => `"${w}"`).join(",") + "]";
  return `https://d2.duolingo.com/api/1/dictionary/hints/${lang}/en?tokens=${encodeURIComponent(
    wordString
  )}`;
};

const fetchVocabOverview = async () => {
  const res = await fetch(vocabOverviewUrl, {
    headers: {
      cookie: `jwt_token=${token}`,
    },
    method: "GET",
  });

  return await res.json();
};

const fetchTranslations = async (words) => {
  const url = mkDictionaryUrl("hu", words);

  const res = await fetch(url, {
    headers: {
      cookie: `jwt_token=${token}`,
    },
    method: "GET",
  });

  return await res.json();
};

const main = async () => {
  const { language_string, vocab_overview } = await fetchVocabOverview();

  console.info(`Retrieved vocab for language ${language_string}`);

  const words = vocab_overview.map((item) => item.word_string);
  const unique_words = [...new Set(words)];

  const chunkSize = 500;

  const chunks = [];
  let chunk = [];
  let i = 0;

  for (const w of unique_words) {
    if (i < chunkSize) {
      chunk.push(w);
      i++;
    } else {
      chunks.push(chunk);
      chunk = [w];
      i = 1;
    }
  }

  const translations = await Promise.all(chunks.map(fetchTranslations)).then(
    (mappings) => mappings.reduce((acc, mapping) => ({ ...acc, ...mapping }))
  );

  console.info(
    `Fetched ${Object.keys(translations).length} sets of translations`
  );

  await fs.writeFile("translations.json", JSON.stringify(translations));
};

main();
