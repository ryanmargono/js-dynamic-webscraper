const Nightmare = require('nightmare')

const nightmare = Nightmare();
nightmare.goto('https://www.basketball-reference.com/players/j/jamesle01.html')
    .wait(2000)
    .evaluate(() => {
        const toArr = (nodeList) => Array.prototype.map.call(nodeList, n => Math.floor(parseFloat(n.textContent)))
        const toSeasonArr = (nodeList) => Array.prototype.map.call(nodeList, n => n.textContent)

        const getData = (table) => ({
            y: toSeasonArr(document.querySelectorAll(`#${table} > tbody > tr > th > a`)),
            p: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="pts_per_g"]`)),
            fg: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="fg_per_g"]`)),
            fgA: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="fga_per_g"]`)),
            threes: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="fg3_per_g"]`)),
            ft: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="ft_per_g"]`)),
            ftA: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="fta_per_g"]`)),
            a: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="ast_per_g"]`)),
            r: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="trb_per_g"]`)),
            t: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="tov_per_g"]`)),
            s: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="stl_per_g"]`)),
            b: toArr(document.querySelectorAll(`#${table} > tbody > tr > [data-stat="blk_per_g"]`)),
        })
        const result = {
            playoffs: getData('playoffs_per_game'),
            perGame: getData('per_game') 
        }
        
        return result
    })
    .end()
    .then((data) => {
        const createReport = (obj) => {
            const length = obj.y.length
            const result = {};
            for (i=0; i<length; i++){
                const year = obj['y'][i]
                const fgMissed = (obj['fgA'][i]) - (obj['fg'][i])
                const ftMissed = (obj['ftA'][i]) - (obj['ft'][i])
                let dd = false
                let td = false
                let counter = 0
                
                if (obj['a'][i]>=10) counter++
                if (obj['p'][i]>=10) counter++
                if (obj['r'][i]>=10) counter++
                if (counter === 3) td = true
                if (counter >= 2) dd = true

                result[year] = 0
                result[year] += fgMissed * -0.25
                result[year] += ftMissed * -0.25
                result[year] += obj['p'][i]
                result[year] += obj['a'][i] * 1.5
                result[year] += obj['t'][i] * -0.5
                result[year] += obj['s'][i] * 2
                result[year] += obj['b'][i] * 2
                result[year] += obj['threes'][i]
                if (td) result[year] += 2.0
                if (dd) result[year] += 2.0
            }
            return result
        }
        const result = {
            perGame: createReport(data.perGame),
            playoffs: createReport(data.playoffs)
        }
        console.log('perGame - playoffs:')
        for (let key in result.perGame) {
            if (key in result.playoffs) {
                console.log (key+" :", result.perGame[key] - result.playoffs[key])
            }
        }
        return JSON.stringify(result)
    })

