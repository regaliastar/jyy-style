const Segment = require('segment')
const request = require('request')
const readline = require('readline')
const async = require('async')
const POSTAG = require('./lib/POSTAG')
const segment = new Segment()
const main_tag = ['名词 名语素','动词 动语素','形容词 形语素']
const queryUrl = "http://fanyi.youdao.com/openapi.do?keyfrom=node-translator&key=2058911035&type=data&doctype=json&version=1.1&q="
segment.useDefault()

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
})
console.log('输入待转换文字： \n')
rl.on('line', answer => {
    // 实例： 这是一个基于Node.js的转换程序。
    let tokens = segment.doSegment(answer)
    let translate_dic = []   //需要翻译的词组
    for(i in tokens){
        if(main_tag.indexOf(POSTAG.chsName(tokens[i].p)) > -1){
            let obj = {i:i, w:tokens[i].w}
            translate_dic.push(obj)
        }
    }
    let length = translate_dic.length
    async.forEach(translate_dic, (item, callback) => {
        let url = encodeURI(queryUrl+item.w)
        request(url, (err, response, body) => {
            if (!err && response.statusCode === 200){
                let data = JSON.parse(body)
                let index
                for(i in translate_dic){
                    if(translate_dic[i].i == item.i){
                        index = i
                        break
                    }
                }
                translate_dic[index].w = translate_dic[index].w+'（'+data.translation[0]+'）'
                tokens[translate_dic[index].i].w = translate_dic[index].w
                length--
                if(length <= 0){
                    let output = ''
                    for(j in tokens){
                        output += tokens[j].w
                    }
                    console.log(JSON.stringify(output))
                }
                callback()
            }else {
                console.error(err)
            }
        })
    })
    // rl.close()
})

