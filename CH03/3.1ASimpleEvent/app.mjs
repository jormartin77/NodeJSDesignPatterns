import {EventEmitter} from 'events'
import {readFile} from 'fs'

class FindRegex extends EventEmitter{

    constructor(regex) {
        super();
        this.regex = regex
        this.files =[]
    }

    addFile(file){
        this.files.push(file)
        return this
    }

    find(){
        setTimeout(()=>this.emit('start', this.files),0)
        for (const file of this.files){
            readFile(file,'utf8', (err,content) =>{
                if(err){
                    return this.emit('error', err)
                }

                this.emit('fileread', file)

                const match = content.match(this.regex)
                if(match){
                    match.forEach(elem =>
                        this.emit('found', file, elem))
                }
            })
        }
        return this
    }
}

const findRegexInstance = new FindRegex(/Hello \w+/)
findRegexInstance
    .addFile('fileA.txt')
    .addFile('fileB.txt')
    .find()
    .on('found', (file, match) => console.log(`Mathed "${match}" in file ${file}`))
    .on('error', err => console.log(`Error: ${err}`))
    .on('start', files => console.log(`starts with files ${files}`))
