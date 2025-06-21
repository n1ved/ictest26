import "./Sponsors.css"
export default function Sponsors(){
   const platinumSponsors = [
       {
         name: "Defence Research and Development Organisation",
         url: "https://drdo.gov.in",
         logo: "https://drdo.gov.in/drdo/sites/default/files/inline-images/new_drdo_logo.png"
       }
    ]

  const goldSponsors = [
     {
       name: "State bank of India",
       url: "https://www.sbi.co.in",
       logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/480px-SBI-logo.svg.png"
     }
    ]

  const silverSponsors = [
    {
      name: "Coming soon",
      url:"/"
    }
  ]
  const otherSponsors = [
      {
        name : "naico ITS",
        url : "https://www.naicoits.com/",
        logo : "https://naicoits.com/wp-content/uploads/2025/01/logo_blue.webp"
      },
      {
        name: "Citrus Informatics",
        url: "https://www.citrusinformatics.com/",
        logo: "https://dmc5jjueint4u.cloudfront.net/wp-content/uploads/2023/11/Citrus-icon-300x300.png"
      }
    ]

  return (
        <div className="info-container">
          <h2>Our Sponsors</h2>
          <div className="sponsor-class">
            <h3>Platinum Sponsors</h3>
            <div className="sponsor-grid">
              {
                platinumSponsors.map((sponsor) => (
                  <a className="sponsor-card" href={sponsor.url} key={sponsor.url}>
                    {sponsor.logo != null ? <img src={sponsor.logo} alt={sponsor.name} /> : null}
                    <h5>{sponsor.name}</h5>
                  </a>
                ))
              }
            </div>
          </div>
          <div className="sponsor-class">
            <h3>Gold Sponsors</h3>
            <div className="sponsor-grid">
              {
                goldSponsors.map((sponsor) => (
                  <a className="sponsor-card" href={sponsor.url} key={sponsor.url}>
                    {sponsor.logo != null ? <img src={sponsor.logo} alt={sponsor.name} /> : null}
                    <h5>{sponsor.name}</h5>
                  </a>
                ))
              }
            </div>
          </div>
          <div className="sponsor-class">
            <h3>Silver Sponsors</h3>
            <div className="sponsor-grid">
              {
                silverSponsors.map((sponsor) => (
                  <a className="sponsor-card" href={sponsor.url} key={sponsor.url}>
                    {sponsor.logo != null ? <img src={sponsor.logo} alt={sponsor.name} /> : null}
                    <h5>{sponsor.name}</h5>
                  </a>
                ))
              }
            </div>
          </div>
          <div className="sponsor-class">
            <h3>Other Sponsors</h3>
            <div className="sponsor-grid">
              {
                otherSponsors.map((sponsor) => (
                  <a className="sponsor-card" href={sponsor.url} key={sponsor.url}>
                    <img src={sponsor.logo} alt={sponsor.name} />
                    <h5>{sponsor.name}</h5>
                  </a>
                ))
              }
            </div>
          </div>
        </div>
      );
}