import React from "react";
import "./css/TermsAndConditions.css";
import Footer from "../components/footer/Footer";

export default function TermsAndConditions() {
  const dropdownStyle = {
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  };

  const summaryStyle = {
    padding: "10px",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const detailsContentStyle = {
    padding: "15px",
    backgroundColor: "#fff",
  };

  return (
    <>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          color: "#333",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          paddingTop: "90px",
        }}
        className="cancellation-policy"
      >
        <h1
          style={{
            fontSize: "2rem",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          Terms & Conditions
        </h1>

        <p
          style={{
            fontStyle: "italic",
            marginBottom: "20px",
          }}
        >
          Last updated on 10-11-2024 17:44:43
        </p>

        <p>
          These Terms and Conditions, along with privacy policy or other terms
          ("Terms") constitute a binding agreement by and between KUNAL KUMAR
          SINGH, ("Website Owner" or "we" or "us" or "our") and you ("you" or
          "your") and relate to your use of our website, goods (as applicable)
          or services (as applicable) (collectively, "Services").
        </p>

        <p>
          By using our website and availing the Services, you agree that you
          have read and accepted these Terms (including the Privacy Policy). We
          reserve the right to modify these Terms at any time and without
          assigning any reason. It is your responsibility to periodically review
          these Terms to stay informed of updates.
        </p>

        <p>
          The use of this website or availing of our Services is subject to the
          following terms of use:
        </p>

        <div style={{ marginBottom: "20px" }}>
          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              1. User Information and Responsibility
            </summary>
            <div style={detailsContentStyle}>
              <p>
                To access and use the Services, you agree to provide true,
                accurate and complete information to us during and after
                registration, and you shall be responsible for all acts done
                through the use of your registered account.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>2. Disclaimer of Warranties</summary>
            <div style={detailsContentStyle}>
              <p>
                Neither we nor any third parties provide any warranty or
                guarantee as to the accuracy, timeliness, performance,
                completeness or suitability of the information and materials
                offered on this website or through the Services, for any
                specific purpose. You acknowledge that such information and
                materials may contain inaccuracies or errors and we expressly
                exclude liability for any such inaccuracies or errors to the
                fullest extent permitted by law.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>3. Use at Your Own Risk</summary>
            <div style={detailsContentStyle}>
              <p>
                Your use of our Services and the website is solely at your own
                risk and discretion. You are required to independently assess
                and ensure that the Services meet your requirements.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              4. Intellectual Property Rights
            </summary>
            <div style={detailsContentStyle}>
              <p>
                The contents of the Website and the Services are proprietary to
                Us and you will not have any authority to claim any intellectual
                property rights, title, or interest in its contents.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>5. Unauthorized Use</summary>
            <div style={detailsContentStyle}>
              <p>
                You acknowledge that unauthorized use of the Website or the
                Services may lead to action against you as per these Terms or
                applicable laws.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>6. Payment for Services</summary>
            <div style={detailsContentStyle}>
              <p>
                You agree to pay us the charges associated with availing the
                Services.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>7. Lawful Use</summary>
            <div style={detailsContentStyle}>
              <p>
                You agree not to use the website and/ or Services for any
                purpose that is unlawful, illegal or forbidden by these Terms,
                or Indian or local laws that might apply to you.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>8. Third-Party Links</summary>
            <div style={detailsContentStyle}>
              <p>
                You agree and acknowledge that website and the Services may
                contain links to other third party websites. On accessing these
                links, you will be governed by the terms of use, privacy policy
                and such other policies of such third party websites.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>9. Binding Agreement</summary>
            <div style={detailsContentStyle}>
              <p>
                You understand that upon initiating a transaction for availing
                the Services you are entering into a legally binding and
                enforceable contract with us for the Services.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>10. Refund Policy</summary>
            <div style={detailsContentStyle}>
              <p>
                You shall be entitled to claim a refund of the payment made by
                you in case we are not able to provide the Service. The
                timelines for such return and refund will be according to the
                specific Service you have availed or within the time period
                provided in our policies (as applicable). In case you do not
                raise a refund claim within the stipulated time, then this would
                make you ineligible for a refund.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>11. Force Majeure</summary>
            <div style={detailsContentStyle}>
              <p>
                Notwithstanding anything contained in these Terms, the parties
                shall not be liable for any failure to perform an obligation
                under these Terms if performance is prevented or delayed by a
                force majeure event.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>12. Governing Law</summary>
            <div style={detailsContentStyle}>
              <p>
                These Terms and any dispute or claim relating to it, or its
                enforceability, shall be governed by and construed in accordance
                with the laws of India.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>13. Jurisdiction</summary>
            <div style={detailsContentStyle}>
              <p>
                All disputes arising out of or in connection with these Terms
                shall be subject to the exclusive jurisdiction of the courts in
                Phagwara, Punjab.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>14. Communication</summary>
            <div style={detailsContentStyle}>
              <p>
                All concerns or communications relating to these Terms must be
                communicated to us using the contact information provided on
                this website.
              </p>
            </div>
          </details>
        </div>

        <p
          style={{
            fontStyle: "italic",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          By using our Services, you acknowledge that you have read, understood,
          and agree to be bound by these Terms and Conditions.
        </p>
      </div>
      <Footer />
    </>
  );
}
