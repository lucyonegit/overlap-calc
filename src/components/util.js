const calculateOverlap = (tracks, startTimeFlag, endTimeFlag) => {
  const startTime = startTimeFlag || 'startTime'
  const endTime = endTimeFlag || 'endTime'
  let timePoints = [];
  tracks.forEach(track => {
    track.forEach(segment => {
      timePoints.push({ time: segment[startTime], type: 'start', sentence: segment });
      timePoints.push({ time: segment[endTime], type: 'end', sentence: segment });
    });
  });

  timePoints.sort((a, b) => a.time - b.time);

  // 扫描光标位置
  let cursor = 0;

  //计算非重叠区间
  let nonOverlap = [];
  let preSentence = null;

  //计算最大重叠区间
  let overlap = [];
  // 单轨区间
  let singleTrack = []
  let overlapSentences = []
  let maxOverlapCount = 0  //重合次数
  let currentStartPoint = null; // 记录重叠开始的时间

  timePoints.forEach(point => {
    point.sentence.gapwords = []
    if (cursor === 0 && preSentence && preSentence.time < point.time) {
      nonOverlap.push({
        startSentence: preSentence.sentence,
        endSentence: point.sentence,
        timeRange: [preSentence.time, point.time]
      });
      // 给句子跟空白词，此处不给words添加，会导致计算故障
      preSentence.sentence.gapwords = [{ text: "[gap]", s: preSentence.time, t: point.time, type: 'gap' }]
    }
    if (point.type === 'start') {
      cursor++;
      maxOverlapCount++
      if (cursor === 1) {
        currentStartPoint = point;
      }
      overlapSentences.push(point.sentence)
    } else {
      cursor--;
      if (cursor === 0) {
        if (maxOverlapCount === 1) {
          singleTrack.push({
            startSentence: currentStartPoint.sentence,
            endSentence: point.sentence,
            timeRange: [currentStartPoint.time, point.time]
          })
        }
        // 排除只有单个轨道，不与其他任何轨道重合的情况
        if (maxOverlapCount !== 1) {
          overlap.push({
            startSentence: currentStartPoint.sentence,
            endSentence: point.sentence,
            maxOverlapCount,
            overlapSentences,
            timeRange: [currentStartPoint.time, point.time]
          });
        }
        // 下一次计算重合之前置空计数
        maxOverlapCount = 0
        overlapSentences = []
      }
    }
    preSentence = point;
  });
  return { nonOverlap, overlap, singleTrack };
}

const combineWords = (overlapSentences = []) => {
  const words = overlapSentences.reduce((sentence, cur) => {
    const gapWord = cur.gapwords
    sentence.push(...[...cur.words, ...gapWord])
    return sentence
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
    const mergeWords = mergeDiff(combineWords(ovelap.overlapSentences))
    ovelap.mergeWords = mergeWords.map(t => t.text).join(' ')
    clip.push({
      words: mergeWords,
      startTime: ovelap.startSentence.startTime,
      endTime: ovelap.endSentence.endTime
    })
  })
  result.singleTrack.forEach((single) => {
    const gapWord = single.startSentence.gapwords
    const words = [...single.startSentence.words, ...gapWord]
    single.mergeWords = words.map(t => t.text).join(' ')
    clip.push({
      words: [...single.startSentence.words, ...gapWord],
      startTime: single.startSentence.startTime,
      endTime: single.startSentence.endTime
    })
  })
  return clip.sort((a, b) => a.startTime - b.startTime)
}

export { calculateOverlap, computedWords }