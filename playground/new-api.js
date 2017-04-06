function statFolder(flow, folderPath) {    
    fs.stat(folderPath, (err, stat) => {
        if (err) {
            return flow.taskError(err)
        }

        flow.taskDone(stat)
    })
}

function readFolder (flow, data) {
    readDir(data.folderPath, (err, entries) => {
        if (err) {
            return flow.taskError(err)
        }
        
        flow.taskDone(entries)
    })    
}

function handleEntries (flow, entries) {
    const folderMap = flow.data;

    newFlow(folderMap)
        .pForEach(entries)
        .run((sFlow, entry, i) => {
            const entryPath = path.resolve(entry)

            fs.stat(entryPath, (err, stat) => {
                if (err) {
                    return sFlow.taskError(err)
                }

                if (stat.isFile()) {
                    data.entries[entry] = {
                        type: getEntryType(stat),
                        size: stat.size
                    }
                    
                    return sFlow.taskDone()
                }
                else if (stat.isDirectory()) {
                    const _folderMap = createFolderMap(entryPath)

                    sflow.reFlow(_folderMap, (err, {folderMap}) => {
                        data.entries[entry] = folderMap
                    })
                }
            })
        })

    
}

function createFolderMap(folderPath) {
    return {
        path: folder,
        stat: null,
        type: -1
    };
}

function mapFolder (folderPath, userCallback) {
    const data = createFolderMap(folderPath)

    newFlow(data)
        .run(statFolder)
        .then(readFolder)
        .then(handleEntries)
        .then(userCallback)
        .go()
}


function mapFolder (folder, userCallback) {
    newFlow().setData({
        type: 0,
        path: folder
    })
    .task('parseFolderStat', (task) => {

        statFolder('path', (err, stat) => {
            if (err) {
                return task.error(err)
            }

            statData = getAllYouNeedFromStat(stat)

            // .done loads `statData` on flow.data.statData
            task.done({statData})
        })

    })
    .task('parseDirEntries', (DirTask) => {

        readDir('path', (err, entries) => {
            task.forEach(entries).parallel((task, entry, i) => {
                const entryPath = path.resolve(entry)

                statFile(entryPath, (err, stat) => {
                    if (err) {
                        return task.error(err)
                    }

                    task.data.entries[entry] = {
                        type: getEntryType(stat),
                        size: stat.size
                    }

                    task.done(stat.size)
                })
            }).go()
        })

    })

    // readFile(entry, (err, content) => {
    //     if (err) {
    //         return task.error(err)
    //     }
    //     task.done(entries)
    // })

    mainFlow.run(parseFolderStat, parseDirEntries).then(extra1, extra2).then(userCallback)
}

function mapFolder (folder, userCallback) {
    const mainFlow = createFlow().setData({
        type: 0,
        path: folder
    })

    // a task holds its parent flow: `task.flow`
    const parseFolderStat = mainFlow.createTask((task) => {
        statFolder('path', (err, stat) => {
            if (err) {
                return task.error(err)
            }

            statData = getAllYouNeedFromStat(stat)

            // .done loads `statData` on flow.data.statData
            task.done({statData})
        })
    });
        
    const parseDirEntries = mainFlow.createTask((task) => {
        readDir('path', (err, entries) => {
            // a flow holds a `.subFlows` array
            // a subFlow holds its parent flow: `subFlow.flow`
            const subFlow = mainFlow.createFlow(entries)
                .limit(5)
                .forEach((task, entry, i) => {
                    const entryPath = path.resolve(entry)

                    statFile(entryPath, (err, stat) => {
                        if (err) {
                            return task.error(err)
                        }

                        task.data.entries[entry] = {
                            type: getEntryType(stat),
                            size: stat.size
                        }
                        // here task knows it's inside a forEach/map (task.forEachDone)
                        task.done(stat.size)
                    })
                })
            ;
        
            entries.forEach((entry, i) => {
                subFlow
                    .run((task) => {
                    })
                    .and((task) => {
                        readFile(entry, (err, content) => {
                            if (err) {
                                return task.error(err)
                            }
                            task.done(entries)
                        })
                    })
                .go()
            })
        })
    });

    mainFlow.run(parseFolderStat, parseDirEntries).then(extra1, extra2).then(userCallback)

    mainFlow
        .run(statFolder)
        .condition(result => {
            if (result === isDirectory) {
                return true
            }
            return false
        })
        .then(readDir)
        .else(() => {
            console.log('empty / not found');
        })
    .callback(userCallback)
}

function mapFolder (folder, userCallback) {
    folderData = {
        type: 0,
        path: folder
    }

    mainFlow = createFlow()
        .run(task => {
            statFolder('path', (err, stat) => {
                if (err) {
                    return task.error(err)
                }
                task.data = doWhateverWithStat(stat, () => {
                    task.done(stat)
                })
            })
        })
        .and(task => {
            readDir('path', (err, entries) => {
                subFlow = mainFlow.subFlow(entries.length * 2)
                
                    .limit(10)
                    .taskDoneHandler((fileSize) => {
                        this.data.total += fileSize
                    })
            
                entries.forEach((entry, i) => {
                    subFlow
                        .run((task) => {
                            statFile(entry, (err, stat) => {
                                task.done(stat.size)
                            })
                        })
                        .and((task) => {
                            readFile(entry, (err, content) => {
                                if (err) {
                                    return task.error(err)
                                }
                                task.done(err, entries)
                            })
                        })
                    .go()
                })
            })
        })
    .go(folderData, userCallback)
}



// ----------------------------------------------

mapFolder('path/to/folder', (err, result) => {
    console.log('result', result);
})