const mockdata = [
  generateTrack(3),
  generateTrack(4),
  generateTrack(5),
  generateTrack(6),
  generateTrack(3)
];

function generateTrack(sentenceCount) {
  const track = [];
  let currentTime = 0;

  for (let i = 0; i < sentenceCount; i++) {
    const sentence = generateSentence(currentTime);
    track.push(sentence);
    currentTime = sentence[sentence.length - 1].t + 10; // Add a gap of 10 units between sentences
  }

  return track;
}

function generateSentence(startTime) {
  const sentence = [];
  let currentTime = startTime;
  const sentenceLength = Math.floor(Math.random() * 6) + 1; // Random sentence length between 1 and 6

  for (let i = 0; i < sentenceLength; i++) {
    const character = generateRandomChineseCharacterWithSemantic();
    const wordDuration = Math.floor(Math.random() * 3) + 1; // Random word duration between 1 and 3 units

    const word = {
      text: character,
      s: currentTime,
      t: currentTime + wordDuration
    };

    sentence.push(word);
    currentTime += wordDuration; // Increment time for the next word
  }

  return sentence;
}

function generateRandomChineseCharacterWithSemantic() {
  const characters = [
    "你好", "我是", "请问", "有什么", "问题", "我觉得", "这个", "很有趣", "不错", "谢谢", "再见",
    "今天", "天气", "真好", "吃饭", "了吗", "工作", "学习", "中文", "这里", "很热闹", "有很多人", "讨论",
    "好的", "没问题", "可以", "明天", "见", "好玩", "非常", "感谢", "帮助", "哈哈", "真的吗", "不懂", "我想知道"
  ];

  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}




console.dir(mockdata, { depth: 10 });


1. 这个数据描述了3个轨道访谈节目的语音转录文本的结构化数据
2. 其中每个轨道中都有自己的句子, 可能是多句, 都有有语义的句子
3. 每个句子都有当前句子中所有的词语信息标记为words字段
4. words字段下面有文字列表, 每个文字都有单个字符text, 开始时间s, 结束时间t
5. 每一个text都是一个中文字符
6. 每个句子都有自己的开始时间startTime与结束时间endTime
7. 句子的开始时间startTime与结束时间endTime分别对应句子中words文字列表的第一个text的开始时间s与最后一个text的结束时间t


