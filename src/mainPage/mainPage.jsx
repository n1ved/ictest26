import React from 'react'
import './mainPage.css'
import ieeeINNER from '../assets/ieee-inner-shell.png'
import ieeeOUTER from '../assets/ieee-outer-shell.png'
import college from '../assets/collegeImage.jpeg'
export default function MainPage() {
  return (
    <div className='main-parent-div'>
      {/* <div className="ieee-background-image-div">
            <img src={ieeeINNER} alt="" />
            <img src={ieeeOUTER} alt="" className='animating-image'/>
      </div> */}
      <div className="sticky-outer-layer-blur">
            <h1>Govt. Model engineering college</h1>
            <p>MEC was established in 1989 by the Institute of Human Resources Development (IHRD), an autonomous technical educational research institute established by the Government of Kerala in 1987.
<a href="https://www.mec.ac.in">[Read more]</a></p>
            <div className="college-video-preview">
                  <img src={college} alt="" />
            </div>
      </div>
    </div>
  )
}
