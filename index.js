const fs = require('fs')
const path = require('path')
const OpenSubtitlesApi = require('opensubtitles-api')
const { XMLHttpRequest } = require('xmlhttprequest')

// Available languages
const languages = new Map([
  ['fr', 'fre'],
  ['en', 'eng']
])

// Handling arguments
const source = process.argv[2].split('/')
const lang = languages.has(process.argv[3]) ? process.argv[3] : 'en'
const dest = process.argv[4] || source.slice(0, source.length - 1).join('/')

// Building subtitle name
let filename = source[source.length - 1]
filename = filename.slice(0, filename.lastIndexOf('.')) + '.srt'

// Creating new api
const api = new OpenSubtitlesApi({
  useragent: 'OSTestUserAgentTemp'
})

// Search for the subtitle with the api, using the filepath as research parameter
api.search({
  sublanguageid: languages.get(lang),
  extensions: ['srt'],
  limit: '1',
  path: source.join('/')
})
  .then((subs) => {
    if (subs[lang] === undefined) {
      console.warn('No subtitle found for this file.')
      return
    }

    // Initiating new XHR call if an url is available
    const xhr = new XMLHttpRequest()

    // Save subtitle after the XHR call has ended
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        fs.writeFile(path.join(dest, filename), xhr.responseText, (err) => {
          if (err) throw err

          console.log('Subtitles downloaded succesfuly.')
          return
        })
      }
    }

    xhr.open('GET', subs[lang][0].url)
    xhr.send()
  })
  .catch((err) => console.error(err))
