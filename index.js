const fs = require("fs");
const path = require("path");
const OpenSubtitlesApi = require("opensubtitles-api");
const fetch = require("node-fetch");

// Available languages
const languages = new Map([["fr", "fre"], ["en", "eng"]]);

// Handling arguments
const source = process.argv[2].split("/");
const lang = languages.has(process.argv[3]) ? process.argv[3] : "en";
const dest = process.argv[4] || source.slice(0, source.length - 1).join("/");

// Building subtitle name
let filename = source[source.length - 1];
filename = filename.slice(0, filename.lastIndexOf(".")) + ".srt";

// Creating new api
const api = new OpenSubtitlesApi({
  useragent: "PlayMe v1"
});

// Search for the subtitle with the api, using the filepath as research parameter

(async function() {
  try {
    const subs = await api.search({
      sublanguageid: languages.get(lang),
      extensions: ["srt"],
      limit: "1",
      path: source.join("/")
    });

    if (subs[lang] === undefined) {
      console.warn("No subtitle found for this file.");
      return;
    }

    const response = await fetch(subs[lang][0].url);

    if (response.ok) {
      const file = await response.text();

      fs.writeFile(path.join(dest, filename), file, err => {
        if (err) throw err;

        console.log("Subtitles downloaded succesfuly.");
        return;
      });
    }
  } catch (e) {
    console.error(e);
  }
})();
