import React from 'react';
import './Legal.css';

const TournamentRules = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <h1>Tournament Rules & Regulations</h1>
          <p className="last-updated">EA Sports FC 26 - 2v2 Tournament | December 20, 2025</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="container">
          <div className="legal-text">
            <h2>1. Tournament Format</h2>
            <h3>1.1 General Information</h3>
            <ul>
              <li><strong>Game:</strong> EA Sports FC 26</li>
              <li><strong>Platform:</strong> PlayStation only</li>
              <li><strong>Format:</strong> 2v2 Team Competition</li>
              <li><strong>Teams:</strong> 32 teams (64 players total)</li>
              <li><strong>Prize Pool:</strong> ₦1,500,000</li>
              <li><strong>Entry Fee:</strong> ₦100,000 per team</li>
              <li><strong>Date:</strong> December 20, 2025</li>
              <li><strong>Start Time:</strong> 15:00 UTC</li>
            </ul>

            <h3>1.2 Tournament Structure</h3>
            <ul>
              <li>Single-elimination bracket</li>
              <li>Best-of-one matches (Round of 32 through Quarter-finals)</li>
              <li>Best-of-three Semi-finals</li>
              <li>Best-of-five Grand Final</li>
            </ul>

            <h2>2. Eligibility Requirements</h2>
            <h3>2.1 Player Requirements</h3>
            <ul>
              <li>Must be 18 years or older (or have parental consent)</li>
              <li>Must have a valid PSN ID</li>
              <li>Must own EA Sports FC 26 on PlayStation</li>
              <li>Must have stable internet connection</li>
              <li>Both team members must be registered</li>
            </ul>

            <h3>2.2 Team Requirements</h3>
            <ul>
              <li>Each team consists of exactly 2 players</li>
              <li>Teams must have a unique team name</li>
              <li>No substitutions allowed after registration closes</li>
              <li>Team members can only be part of one team</li>
            </ul>

            <h2>3. Registration Process</h2>
            <h3>3.1 How to Register</h3>
            <ol>
              <li>Complete the online registration form</li>
              <li>Provide accurate information for both players</li>
              <li>Pay the entry fee (₦100,000) via Paystack</li>
              <li>Receive confirmation email with tournament details</li>
            </ol>

            <h3>3.2 Registration Deadline</h3>
            <p>
              Registration closes when all 32 team slots are filled or 24 hours before tournament start time, 
              whichever comes first. Register early to secure your spot!
            </p>

            <h2>4. Match Rules</h2>
            <h3>4.1 Game Settings</h3>
            <ul>
              <li><strong>Match Length:</strong> 6 minutes per half (12 minutes total)</li>
              <li><strong>Difficulty:</strong> World Class</li>
              <li><strong>Match Speed:</strong> Normal</li>
              <li><strong>Game Speed:</strong> Normal</li>
              <li><strong>Controllers:</strong> Default (assists allowed)</li>
              <li><strong>Injuries:</strong> On</li>
              <li><strong>Offsides:</strong> On</li>
              <li><strong>Handballs:</strong> On</li>
            </ul>

            <h3>4.2 Team Selection</h3>
            <ul>
              <li>Teams can select any club from EA Sports FC 26</li>
              <li>Each player controls their own player on the field</li>
              <li>No restrictions on club selection</li>
              <li>Custom tactics are allowed</li>
              <li>Both players must use their registered PSN IDs</li>
            </ul>

            <h3>4.3 Match Start</h3>
            <ul>
              <li>Players must be ready 10 minutes before scheduled match time</li>
              <li>Check-in will be conducted in the tournament Discord channel</li>
              <li>Both team members must confirm readiness</li>
              <li>Failure to check in may result in disqualification</li>
            </ul>

            <h2>5. Technical Issues</h2>
            <h3>5.1 Disconnections</h3>
            <ul>
              <li>If a player disconnects before the 70th minute, the match will be replayed</li>
              <li>If disconnection occurs after the 70th minute, the score stands</li>
              <li>Intentional disconnections will result in disqualification</li>
              <li>Maximum 2 replays per match; third disconnect results in forfeit</li>
            </ul>

            <h3>5.2 Game Crashes/Freezes</h3>
            <ul>
              <li>Screenshot evidence required for all technical issues</li>
              <li>Tournament administrators will review and make final decisions</li>
              <li>Matches may be replayed at administrator discretion</li>
            </ul>

            <h2>6. Scoring and Results</h2>
            <h3>6.1 Match Winner</h3>
            <ul>
              <li>Team with most goals at final whistle wins</li>
              <li>In case of draw: Extra time (2x 5 minutes)</li>
              <li>If still tied: Penalty shootout</li>
            </ul>

            <h3>6.2 Reporting Results</h3>
            <ul>
              <li>Winning team must report result with screenshot proof</li>
              <li>Screenshots must show final score and both player PSN IDs</li>
              <li>Results must be reported within 10 minutes of match completion</li>
              <li>Disputes will be reviewed by administrators</li>
            </ul>

            <h2>7. Code of Conduct</h2>
            <h3>7.1 Fair Play</h3>
            <ul>
              <li>No cheating, hacking, or exploiting game bugs</li>
              <li>No use of unauthorized software or hardware</li>
              <li>No match-fixing or collusion</li>
              <li>No toxic behavior, harassment, or hate speech</li>
            </ul>

            <h3>7.2 Communication</h3>
            <ul>
              <li>Respectful communication required at all times</li>
              <li>English, Pidgin, or major Nigerian languages allowed</li>
              <li>Voice chat etiquette must be maintained</li>
              <li>Unsportsmanlike conduct will result in penalties</li>
            </ul>

            <h2>8. Penalties and Disqualification</h2>
            <h3>8.1 Warning System</h3>
            <ul>
              <li><strong>First Offense:</strong> Verbal warning</li>
              <li><strong>Second Offense:</strong> Match point penalty or game forfeiture</li>
              <li><strong>Third Offense:</strong> Disqualification from tournament</li>
            </ul>

            <h3>8.2 Immediate Disqualification</h3>
            <p>The following will result in immediate disqualification:</p>
            <ul>
              <li>Cheating or hacking</li>
              <li>Severe toxic behavior or threats</li>
              <li>Providing false registration information</li>
              <li>Impersonation of other players</li>
              <li>Refusing to follow administrator instructions</li>
            </ul>

            <h2>9. Prize Distribution</h2>
            <h3>9.1 Prize Breakdown</h3>
            <ul>
              <li><strong>1st Place:</strong> ₦750,000 (50%)</li>
              <li><strong>2nd Place:</strong> ₦450,000 (30%)</li>
              <li><strong>3rd Place:</strong> ₦225,000 (15%)</li>
              <li><strong>4th Place:</strong> ₦75,000 (5%)</li>
            </ul>

            <h3>9.2 Payout Process</h3>
            <ul>
              <li>Prizes will be distributed within 7-14 business days</li>
              <li>Winners must provide valid Nigerian bank account details</li>
              <li>Prize money will be split equally between team members</li>
              <li>Confirmation email will be sent after payment</li>
              <li>Tax obligations are the responsibility of winners</li>
            </ul>

            <h2>10. Tournament Administration</h2>
            <h3>10.1 Administrator Decisions</h3>
            <ul>
              <li>All administrator decisions are final</li>
              <li>Administrators may modify rules if necessary</li>
              <li>Rule interpretations are at administrator discretion</li>
              <li>Any unforeseen situations will be handled fairly</li>
            </ul>

            <h3>10.2 Protests and Appeals</h3>
            <ul>
              <li>Protests must be submitted immediately after the match</li>
              <li>Include screenshot evidence and detailed explanation</li>
              <li>Protests will be reviewed within 30 minutes</li>
              <li>Decision on protests is final and binding</li>
            </ul>

            <h2>11. Streaming and Content</h2>
            <h3>11.1 Broadcasting Rights</h3>
            <ul>
              <li>syncplay eSports reserves the right to stream all matches</li>
              <li>Players may stream their own POV with proper credit</li>
              <li>Content must comply with EA Sports terms of service</li>
              <li>Offensive or inappropriate content is prohibited</li>
            </ul>

            <h3>11.2 Media Obligations</h3>
            <ul>
              <li>Winners may be required for brief post-match interviews</li>
              <li>Winner photos may be used for promotional purposes</li>
              <li>Players consent to tournament highlights and content</li>
            </ul>

            <h2>12. Important Reminders</h2>
            <div className="reminder-box">
              <h3>Before the Tournament:</h3>
              <ul>
                <li>✓ Ensure both players have EA Sports FC 26 installed and updated</li>
                <li>✓ Test your internet connection</li>
                <li>✓ Join the tournament Discord server</li>
                <li>✓ Verify your PSN ID is correct in registration</li>
                <li>✓ Be available 30 minutes before start time</li>
              </ul>
            </div>

            <h2>13. Contact and Support</h2>
            <p>For tournament-related questions or issues:</p>
            <div className="contact-box">
              <p><strong>Email:</strong> info@syncplay.co</p>
              <p><strong>Discord:</strong> Will be provided in confirmation email</p>
              <p><strong>Tournament Day Support:</strong> Available from 14:00 UTC</p>
            </div>

            <div className="legal-footer">
              <p>
                By registering for this tournament, you acknowledge that you have read, understood, and agree 
                to comply with all rules and regulations outlined above.
              </p>
              <p>
                <strong>Good luck and have fun! 🎮⚽</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TournamentRules;

