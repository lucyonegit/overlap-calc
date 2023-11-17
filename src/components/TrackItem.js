import { useState } from 'react'
const TrackItem = (props) => {
  const { width, left, onMove, color, words, dpr } = props
  const [leftvalue, setLeft] = useState(left)
  const onMouseDown = (e) => {
    const deltaLeft = e.clientX - leftvalue
    const handler = (e) => {
      const left = e.clientX - deltaLeft
      setLeft(left);
      onMove(left, left - leftvalue)
    }
    document.addEventListener("mousemove", handler);
    document.addEventListener("mouseup", function () {
      document.removeEventListener("mousemove", handler);
    });
  }
  return (
    <div
      className="track-item"
      style={{ width, left: leftvalue, background: `#${color}` }}
      onMouseDown={onMouseDown}>
      {
        words && words.map((text, index) => {
          return <span key={index} className='track-item-text' style={{ width: (text.t - text.s) * dpr, left: (text.s - leftvalue / dpr) * dpr }}>{text.text}</span>
        })
      }
    </div >
  )
}

export default TrackItem