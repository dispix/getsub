const fs = require('fs')
const Rx = require('Rx')

/**
 * The Handler class writes the subtitle to the disk
 */
class Handler {
  /**
   *  Writes the subtitle to the disk
   *  @method  save
   *  @param   {String}  content      Subtitle text
   *  @param   {String}  path  Full (absolute) path of the subtitle
   */
  static save (content, path) {
    // Transform the callback method into an Observable
    const writeFile = Rx.Observable.fromCallback(fs.writeFile)

    return writeFile(path, content)
  }
}

module.exports = Handler
