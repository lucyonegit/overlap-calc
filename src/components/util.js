const calculateOverlap = (tracks, startTimeFlag, endTimeFlag) => {
  const startTime = startTimeFlag || 'startTime'
  const endTime = endTimeFlag || 'endTime'
  let points = [];
  tracks.forEach(track => {
    track.forEach(segment => {
      points.push({ time: segment[startTime], type: 'start', node: segment });
      points.push({ time: segment[endTime], type: 'end', node: segment });
    });
  });

  points.sort((a, b) => a.time - b.time);

  // 扫描光标位置
  let cursor = 0;

  //计算非重叠区间
  let nonOverlap = [];
  let lastEndNode = null;

  //计算最大重叠区间
  let overlap = [];
  // 单轨区间
  let singleTrack = []
  let overlapNodes = []
  let maxOverlap = 0  //重合次数
  let currentStartNode = null; // 记录重叠开始的时间

  points.forEach(point => {
    if (cursor === 0 && lastEndNode && lastEndNode.time < point.time) {
      nonOverlap.push({
        startNode: lastEndNode.node,
        endNode: point.node,
        timeRange: [lastEndNode.time, point.time]
      });
    }
    if (point.type === 'start') {
      cursor++;
      maxOverlap++
      if (cursor === 1) {
        currentStartNode = point;
      }
      overlapNodes.push(point.node)
    } else {
      cursor--;
      if (cursor === 0) {
        if (maxOverlap === 1) {
          singleTrack.push({
            startNode: currentStartNode.node,
            endNode: point.node,
            timeRange: [currentStartNode.time, point.time]
          })
        }
        // 排除只有单个轨道，不与其他任何轨道重合的情况
        if (maxOverlap !== 1) {
          overlap.push({
            startNode: currentStartNode.node,
            endNode: point.node,
            maxOverlap,
            overlapNodes,
            timeRange: [currentStartNode.time, point.time]
          });
        }
        // 下一次计算重合之前置空计数
        maxOverlap = 0
        overlapNodes = []
      }
    }
    lastEndNode = point;
  });
  return { nonOverlap, overlap, singleTrack };
}

const combineWords = (overlapNodes = []) => {
  const words = overlapNodes.reduce((ovelap, cur) => {
    ovelap.push(...cur.words)
    return ovelap
  }, [])
  return words.sort((a, b) => a.s - b.s)
}

const mergeDiff = (words = []) => {
  let result = []
  let preWord = null
  words.forEach((word, index) => {
    if (index === 0) {
      preWord = word
    } else {
      if (word.s < preWord.t) {
        result.push({ ...word, text: `[${word.text}]` })
        return
      } else {
        preWord = word
      }
    }
    result.push(word)
  })
  return result
}

const computedWords = (result) => {
  let clip = []
  result.overlap.forEach(ovelap => {
    const mergeWords = mergeDiff(combineWords(ovelap.overlapNodes))
    ovelap.mergeWords = mergeWords.map(t => t.text).join(' ')
    clip.push({
      words: mergeWords,

      startTime: ovelap.startNode.startTime,
      endTime: ovelap.endNode.endTime
    })
  })
  result.singleTrack.forEach((single) => {
    single.mergeWords = single.startNode.words.map(t => t.text).join(' ')
    clip.push({
      words: single.startNode.words,
      startTime: single.startNode.startTime,
      endTime: single.startNode.endTime
    })
  })
  return clip.sort((a, b) => a.startTime - b.startTime)
}

export { calculateOverlap, computedWords }