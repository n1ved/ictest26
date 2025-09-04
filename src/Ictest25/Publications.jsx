export default function Publications2025(){
    return(
        <div className="publications-container" id="publications" >
            <h2>Publications</h2>
            <div className="publication-content" style={{width: '100%', textAlign: 'center', display: 'block', marginTop: '20px' , fontSize: '20px'}}>
                <center>
                    All publications related to ICTEST 2025 can be found on the IEEE Xplore Digital Library. Please visit the following link to access the conference proceedings and papers.
                </center>
                <div className="spacer" />
                <a href="https://ieeexplore.ieee.org/servlet/opac?punumber=11040147" target="_blank" rel="noopener noreferrer" >
                    <button className="ieee-button" style={{background: 'linear-gradient(45deg, #0072C6, #00A1E0)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' , margin:'auto' , marginTop:"20px"}}>
                        Visit IEEE Xplore for ICTEST 2025 Publications
                    </button>
                </a>
            </div>
        </div>
    );
}