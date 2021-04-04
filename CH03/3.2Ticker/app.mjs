import {EventEmitter} from 'events'
import {readFile} from 'fs'

class FindRegex extends EventEmitter{
    static TICK_SIZE = 50;

    constructor(regex) {
        super();
        this.regex = regex
        this.files =[]
        this.count = 0
        this.finished = false
    }

    addFile(file){
        this.files.push(file)
        return this
    }

    ticker(number, callback){
        this.count++
        setTimeout(()=>{this.emit('tick', this.count); this.finished?callback():this.ticker(number,callback)},number)
    }

    find(){
        setTimeout(()=>this.emit('start', this.files),0)
        this.ticker(FindRegex.TICK_SIZE,() => setTimeout(()=>this.emit('end', this.count),0))
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

                if(file == this.files[this.files.length-1]){
                    this.finished = true
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
    .on('tick', ticks => console.log(`has been passed ${ticks} ticks`))
    .on('end', ticks => console.log(`the final ammount of ticks was ${ticks} `))
