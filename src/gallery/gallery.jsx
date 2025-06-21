import React, { useState, useEffect } from 'react';
import './gallery.css';

import image1 from '../gallery_images/image1.jpeg';
import image2 from '../gallery_images/image2.jpeg';
import image3 from '../gallery_images/image3.jpeg';
import image4 from '../gallery_images/image4.jpeg';
import image5 from '../gallery_images/image5.jpeg';
import image6 from '../gallery_images/image6.jpeg';


const ImageGallery = () => {

    return (
        <div className='gallery-container'>
            <h2 className='gallery-title'>Event Highlights</h2>
            <div>
                <p>The first International Conference on Trends in Engineering Systems and Technologies (ICTEST-2024) was successfully conducted by Govt. Model Engineering College, Thrikkakara from April 11 to 13, 2024 with the  technical sponsorship of IEEE Kerala section and with the title sponsorship of Defence Research & Development Organisation (DRDO). This conference brought together scholars, researchers, and industry professionals across different regions in the country and abroad to discuss and explore the latest advancements in various engineering disciplines.
                    The conference featured a diverse range of tracks, each focusing on cutting-edge topics in engineering and technology. The key tracks included:<br />
                </p>
                <p >
                    -Artificial Intelligence and Machine Learning<br />
                    -Image Processing<br />
                    -Cybersecurity and Network Technologies<br />
                    -Power Systems and Renewable Energy<br />
                    -Robotics, Control Systems, and Automation<br />
                    -Communication Systems<br />
                    -Biomedical Engineering and Healthcare Technologies<br />
                    -Data Science and Big Data Analytics<br />
                    -VLSI and Embedded Systems<br />
                    -Internet of Things and Smart Systems<br />
                    -Blockchain Technologies</p>
                <div className='gallery-item'>
                    <img src={image1} className='gallery-image' />
                </div>
                <p >
                    We were honored to have distinguished personalities for the inauguration and valedictory functions:<br />

                    -Inauguration Presided By:<br/> Dr. Arunkumar V A, Director of the Institute of Human Resources Development (IHRD)<br />

                    -Chief Guest: <br />Sri A Joseph, Managing Director, BrahMos Aerospace<br />
                </p>
                <div className='gallery-item'>
                    <img src={image2} className='gallery-image' />
                </div>
                <p >
                    -Valedictory Presided By:<br /> Dr. Mini M G, Principal, Model Engineering College<br />

                    -Chief Guest for Valedictory:<br /> Dr. Ramadevi, Scientist G, Naval Physical Oceanographic Laboratory, DRDO<br />
                </p>
                <div className='gallery-item'>
                    <img src={image3} className='gallery-image' />
                </div>
                <p >
                    The conference featured insightful keynote speeches, technical sessions, and vibrant social events that made it memorable for all attendees. 🌟
                </p>
                <div className='gallery-item'>
                    <img src={image4} className='gallery-image' />
                </div>
                <p >
                    One of the highlights was the GALA Night, an evening of music, entertainment, and camaraderie, which gave participants a chance to unwind, network, and forge lasting connections in a relaxed atmosphere. 🎶🎤
                </p>
                <div className='gallery-item'>
                    <img src={image5} className='gallery-image' />
                </div>
                <div className='gallery-item'>
                    <img src={image6} className='gallery-image' />
                </div>
            </div>
            <p>A big thank you to everyone who contributed to ICTEST-2024, and here’s to continuing the momentum of collaboration, innovation, and knowledge exchange in the years to come! 🌍💡</p>
            <p>All Publications can be found <a href="https://ieeexplore.ieee.org/xpl/conhome/10576062/proceeding" target='_blank'>here</a></p>
        </div>
    );
};

export default ImageGallery;
