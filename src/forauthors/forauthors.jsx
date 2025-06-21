import Schedule from "../schedule/schedule";
import RegistrationFees from "../registrationFees/registrationFees";
import ConfernceTrack from "../conferenceTrack/conferenceTrack";
import "../schedule/schedule.css"

export default function ForAuthors() {
    return (
        <div className="schedule-main">
            <Schedule />
            <RegistrationFees />
        </div>
    );
}