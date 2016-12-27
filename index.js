const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

const Fetcher = require('./src/fetcher')
const Handler = require('./src/handler')
const credentials = require('./src/credentials')
const languages = require('./src/languages')

// If the help argument is specify, returns the documentation
if (argv.h || argv.help) {
  console.log(`
    usage: getsub <file> [options]
    options:
    [--dest | -d <destination>]   Directory path for the subtitle, defaults to same directory as the source
    [--lang | -l <language>]      Specifies the language for the subtitle. Defaults to 'eng', available languages:
        - ${languages.join('\n\t- ')}
  `)
  process.exit()
}

// Exit if no file is specified
if (!argv._[0]) {
  console.error('Error: No file specified')
  process.exit()
}

// Gathering arguments
const source = path.resolve(process.cwd(), argv._[0])
const filepath = source.slice(0, source.lastIndexOf('/'))
// File name *without the extension*
const filename = source.slice(source.lastIndexOf('/') + 1).substring(0, source.lastIndexOf('.'))
const lang = argv.lang || argv.l || 'eng'

// Exit if language is not recognized
if (languages.indexOf(lang)) {
  console.error(`Error: This language is not recognized. Available languages:
        - ${languages.join('\n\t- ')}
    `)
  process.exit()
}

/**
 *  Get the filepath for saving the subtitles
 *  @method  getDest
 *  @return  {String}  Absolute filepath, ex: `/Users/Me/Desktop/subtitles.srt`
 */
const getDest = () => {
  if (argv.dest) {
    return `${argv.dest}/${filename}.srt`
  }

  if (argv.d) {
    return `${argv.d}/${filename}.srt`
  }

  // Defaults to same directory as source file
  return `${filepath}/${filename}.srt`
}

const dest = getDest()
const fetcher = new Fetcher(credentials)

console.log(`
  Fetching subtitle...
  - File: ${filename}
  - Language: ${lang}
`)

fetcher.search(source, lang)
  .mergeMap(text => Handler.save(text, dest))
  .subscribe(
    () => {
      console.log(`Subtitle saved to ${dest}`)
      process.exit()
    },
    err => {
      console.error(err)
      process.exit(1)
    }
  )
