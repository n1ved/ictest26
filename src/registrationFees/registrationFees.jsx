import "./registrationFees.css";
import Navbar from "../navbar/navbar.jsx";
import QR from './upi.png';

export default function RegistrationFees() {
  const rate = [
    { name: "Faculty, IEEE Member:", rate: "INR 6500" },
    { name: "Faculty, Non-IEEE Member:", rate: "INR 8000" },
    { name: "Research Scholar/Student, IEEE Member:", rate: "INR 6500" },
    { name: "Research Scholar/Student, Non-IEEE Member:", rate: "INR 8000" },
    { name: "Industry Professional, IEEE Member:", rate: "INR 8000" },
    { name: "Industry Professional, Non-IEEE Member:", rate: "INR 10000" },
    { name: "Foreign Delegate, Professional, IEEE Member:", rate: "255 USD" },
    {
      name: "Foreign Delegate, Professional, Non-IEEE Member:",
      rate: "300 USD",
    },
    { name: "Foreign Delegate, Student IEEE Member:", rate: "125 USD" },
    { name: "Foreign Delegate, Non-Student IEEE Member:", rate: "150 USD" },
    { name: "Additional Authors from India:", rate: "INR 1000 (for one day)" },
    {
      name: "Additional Authors from Outside India:",
      rate: "20 USD (for one day)",
    },
    { name: "Attendees from India:", rate: "INR 1000 (for one day)" },
    { name: "Attendees from Outside India:", rate: "20 USD (for one day)" },
  ];
  // Split the rates into two columns
  const leftColumn = rate.slice(0, 7);
  const rightColumn = rate.slice(7, 14);

  return (
    <>
      <Navbar />
      <div className="registration-fees-bg">
        <h1>Registration Fees</h1>
        <div className="register">
          <div className="column">
            {leftColumn.map((each, index) => (
              <div className="fees-box" key={index}>
                <h2>{each.name}</h2>
                <p>{each.rate}</p>
              </div>
            ))}
          </div>
          <div className="column">
            {rightColumn.map((each, index) => (
              <div className="fees-box" key={index}>
                <h2>{each.name}</h2>
                <p>{each.rate}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bank-details">
          <h2>Bank Account Details</h2>
          <div className="bank-details-container">
            <img src={QR} alt={"Scan to pay"}/>
            <div className="bank-details-box">
              <p>
                Account Name: <strong>International Conference on Trends in Engineering Systems and
                technologies</strong>
              </p>
              <p>
                Account Number: <strong>42346083528</strong>
              </p>
              <p>
                IFSC Code: <strong>SBIN0070218</strong>
              </p>
              <p>
                Bank Name: <strong>State bank of India</strong>
              </p>
              <p>
                Branch: <strong>Edappally</strong>
              </p>
              <p>
                MICR Code: <strong>682002905</strong>
              </p>
            </div>

          </div>
        </div>
      </div>

    </>
  );
}
