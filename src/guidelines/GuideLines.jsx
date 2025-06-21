import React from 'react'
import './GuideLines.css'
import ConfernceTrack from '../conferenceTrack/conferenceTrack'
import PaperSharing from '../paperSharing/PaperSharing'
const GuideLines = () => {
  return (
    <div className='guidelines'>
        <h1>Author Guidelines for Conference Paper Submission</h1>
        <p>ICTEST 2025 aims to bring together researchers, academicians, and industry professionals from around the globe to share their latest research findings, exchange ideas, and discuss emerging trends in engineering systems and technologies. The conference will cover a wide range of topics related to engineering, including but not limited to</p>
        <ConfernceTrack />
        <PaperSharing />
    </div>
  )
}

export default GuideLines