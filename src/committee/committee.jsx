import Committee_members from "../committee_members/committee_members";
// import RegistrationFees from "../registrationFees/registrationFees";
// import ConfernceTrack from "../conferenceTrack/conferenceTrack";
import "../schedule/schedule.css";

export default function Committee() {
  return (
    <div className="schedule-main">
      <Committee_members />
    </div>
  );
}
