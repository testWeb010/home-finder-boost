import React from "react";
import './css/TermsAndConditions.css';
import Footer from "../components/footer/Footer";

export default function CancellationPolicy() {
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
          Cancellation & Refund Policy
        </h1>

        <p
          style={{
            fontStyle: "italic",
            marginBottom: "20px",
          }}
        >
          Last updated on 10-11-2024 17:45:25
        </p>

        <p>
          KUNAL KUMAR SINGH believes in helping its customers as far as
          possible, and has therefore a liberal cancellation policy. Under this
          policy:
        </p>

        <div style={{ marginBottom: "20px" }}>
          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              1. Immediate Cancellations
            </summary>
            <div style={detailsContentStyle}>
              <p>
                Cancellations will be considered only if the request is made
                immediately after placing the order. However, the cancellation
                request may not be entertained if the orders have been
                communicated to the vendors/merchants and they have initiated
                the process of shipping them.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              2. Perishable Items Cancellation Policy
            </summary>
            <div style={detailsContentStyle}>
              <p>
                KUNAL KUMAR SINGH does not accept cancellation requests for
                perishable items like flowers, eatables, etc. However,
                refund/replacement can be made if the customer establishes that
                the quality of the product delivered is not good.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              3. Damaged or Defective Items
            </summary>
            <div style={detailsContentStyle}>
              <p>
                In case of receipt of damaged or defective items, please report
                the same to our Customer Service team. The request will,
                however, be entertained once the merchant has checked and
                determined the same at their own end. This should be reported
                on the same day of receipt of the products. In case you feel
                that the product received is not as shown on the site or as per
                your expectations, you must bring it to the notice of our
                customer service on the same day of receiving the product. The
                Customer Service Team, after looking into your complaint, will
                take an appropriate decision.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              4. Manufacturer Warranty Issues
            </summary>
            <div style={detailsContentStyle}>
              <p>
                In case of complaints regarding products that come with a
                warranty from manufacturers, please refer the issue to them.
              </p>
            </div>
          </details>

          <details style={dropdownStyle}>
            <summary style={summaryStyle}>
              5. Refund Processing
            </summary>
            <div style={detailsContentStyle}>
              <p>
                In case of any refunds approved by KUNAL KUMAR SINGH, it will
                take 6-8 days for the refund to be processed to the end
                customer.
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
          and agree to this Cancellation & Refund Policy.
        </p>
      </div>
      <Footer />
    </>
  );
}
