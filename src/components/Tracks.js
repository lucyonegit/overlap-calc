import { calculateOverlap, computedWords } from './util'
import { useEffect, useMemo, useState } from 'react'
import TrackItem from './TrackItem'
import testdata from './mock';
function getColor(color = "") {
  return (color += "0123456789abcdef"[Math.floor(Math.random() * 10)]) && (color.length === 6 ? color : getColor(color));
}

const Track = () => {
  const dpr = 30
  const [tracks, setTracks] = useState(testdata);
  const [result, setResult] = useState({ nonOverlap: [], overlap: [], singleTrack: [] })
  const [clips, setClips] = useState([])
  useEffect(() => {
    const res = calculateOverlap(tracks)
    const clips = computedWords(res)
    setResult(res)
    setClips(clips)
  }, [tracks])

  const onMove = (trackIndex, index, left, offset) => {
    const newTrack = JSON.parse(JSON.stringify(tracks))
    newTrack[trackIndex][index].startTime = left / dpr
    newTrack[trackIndex][index].endTime = newTrack[trackIndex][index].endTime + offset / dpr
    if (newTrack[trackIndex][index].words) {
      newTrack[trackIndex][index].words.forEach((t) => {
        t.s = t.s + offset / dpr
        t.t = t.t + offset / dpr
      })
    }
    setTracks(newTrack)
  }
  const colors = useMemo(() => {
    return [getColor(), getColor(), getColor(), getColor(), getColor(), getColor()]
  }, [])
  return (
    <div className="content">
      <div className="tracks-content">
        {
          tracks.map((track, trackIndex) => {
            const color = colors[trackIndex]
            return (
              <div key={trackIndex} className="track">
                <div className='track-title'>轨道{trackIndex + 1}</div>
                {track.map((t, index) => {
                  return (
                    <TrackItem
                      key={index}
                      color={color}
                      width={(t.endTime - t.startTime) * dpr}
                      left={t.startTime * dpr}
                      words={t.words}
                      dpr={dpr}
                      onMove={(left, offset) => { onMove(trackIndex, index, left, offset) }}
                    />
                  )
                })}
              </div>
            )
          })
        }
      </div>
      <div className="rule-content">
        {
          result.overlap.map(((r, index) => {
            return <div key={index} className='rule-item rule-item-overlap' style={{ width: (r.timeRange[1] - r.timeRange[0]) * dpr, left: r.timeRange[0] * dpr }}>
              <span>最大重合区间</span>
              <span className='mergetext'>{r.mergeWords}</span>
            </div>
          }))
        }
      </div>
      <div className="rule-content">
        {
          result.nonOverlap.map(((r, index) => {
            return <div key={index} className='rule-item rule-item-nonOverlap' style={{ width: (r.timeRange[1] - r.timeRange[0]) * dpr, left: r.timeRange[0] * dpr }}>
              <span>空白</span>
            </div>
          }))
        }
      </div>
      <div className="rule-content">
        {
          result.singleTrack.map(((r, index) => {
            return <div key={index} className='rule-item rule-item-singleTrack' style={{ width: (r.timeRange[1] - r.timeRange[0]) * dpr, left: r.timeRange[0] * dpr }}>
              <span>单轨</span>
              <span className='mergetext'>{r.mergeWords}</span>
            </div>
          }))
        }
      </div>
      <div className='clips'>
        {
          clips.map((clip, index) => {
            return <p key={index}>{index + 1} {clip.words.map(t => t.text).join(' ')}</p>
          })
        }
      </div>
    </div >
  )
}

export default Track