import fetch from "node-fetch";
import * as fs from "fs/promises";
const TOKEN = process.env.DUOLINGO_TOKEN;
const CHUNK_SIZE = 500;
const vocabOverviewUrl = "https://www.duolingo.com/vocabulary/overview";
const mkDictionaryUrl = (lang, words) => {
    const wordString = "[" + words.map((w) => `"${w}"`).join(",") + "]";
    return `https://d2.duolingo.com/api/1/dictionary/hints/${lang}/en?tokens=${encodeURIComponent(wordString)}`;
};
const fetchVocabOverview = async () => {
    const res = await fetch(vocabOverviewUrl, {
        headers: {
            cookie: `jwt_token=${TOKEN}`,
        },
        method: "GET",
    });
    const overview = (await res.json());
    return overview;
};
const fetchTranslations = async (words) => {
    const url = mkDictionaryUrl("hu", words);
    const res = await fetch(url, {
        headers: {
            cookie: `jwt_token=${TOKEN}`,
        },
        method: "GET",
    });
    const translations = (await res.json());
    return translations;
};
const main = async () => {
    if (!TOKEN) {
        throw new Error("Missing env var DUOLINGO_TOKEN");
    }
    const { language_string, vocab_overview } = await fetchVocabOverview();
    console.info(`Retrieved vocab for language ${language_string}`);
    const words = vocab_overview.map((item) => item.word_string);
    const unique_words = [...new Set(words)];
    const chunks = [];
    let chunk = [];
    let i = 0;
    for (const w of unique_words) {
        if (i < CHUNK_SIZE) {
            chunk.push(w);
            i++;
        }
        else {
            chunks.push(chunk);
            chunk = [w];
            i = 1;
        }
    }
    const translations = await Promise.all(chunks.map(fetchTranslations)).then((mappings) => mappings.reduce((acc, mapping) => ({ ...acc, ...mapping })));
    console.info(`Fetched ${Object.keys(translations).length} sets of translations`);
    await fs.writeFile("translations.json", JSON.stringify(translations));
};
main();
