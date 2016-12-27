const Rx = require('Rx')
const fetch = require('isomorphic-fetch')
const OpenSubtitlesApi = require('opensubtitles-api')

/**
 *  The Fetcher class is in charge of all API calls
 */
class Fetcher {
  /**
   *  Initiates the class with API credentials
   *  @method constructor
   *  @param  {Object}      credentials   User credentials, created with the Credentials class
   *  @param  {Map}         languages     A map containing languages informations
   *  @return {Object}                    A new fetcher object
   */
  constructor (credentials) {
    this.api = new OpenSubtitlesApi(credentials)
  }

  /**
   *  Search a subtitle for a given file in a given language
   *  @method  search
   *  @param   {String}       file            Path to the video file
   *  @param   {String}       [lang='eng']    Language
   *  @return  {Observable}                   Observable from the fetch
   */
  search (file, lang = 'eng') {
    return Rx.Observable.fromPromise(this.api.search({
      sublanguageid: lang,
      extensions: ['srt'],
      limit: '1',
      path: file
    }))
      .map(subs => {
        // Throw no subtitles were found for that file in that language
        if (!subs[lang]) {
          return Rx.Observable.throw('No subtitle found.')
        }

        return subs
      })
      .mergeMap(subs => fetch(subs[lang][0].url))
      .mergeMap(res => res.text())
  }
}

module.exports = Fetcher
