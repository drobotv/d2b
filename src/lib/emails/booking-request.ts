export default `<mjml>
  <mj-head>
    <mj-title>Booking Request</mj-title>
    <mj-attributes>
      <mj-all font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" />
      <mj-text font-size="16px" color="#18181b" line-height="24px" />
      <mj-section padding="20px 0" />
      <mj-button background-color="#0f766e" color="white" border-radius="6px" font-size="16px" inner-padding="12px 20px" />
    </mj-attributes>
    <mj-style>
    </mj-style>
  </mj-head>
  <mj-body background-color="#f4f4f5">
    <mj-wrapper background-color="white" border-radius="8px" padding="30px 20px">
      <mj-section>
        <mj-column>
          <mj-text align="center" font-weight="bold" font-size="24px" padding-top="20px">
            Booking Request Sent
          </mj-text>
          <mj-text align="center" color="#71717a" padding-bottom="20px">
            Your booking request has been sent to the host for confirmation.
          </mj-text>
          <mj-divider border-width="1px" border-color="#e5e7eb" padding="0 0 20px 0" />
        </mj-column>
      </mj-section>
      <mj-section padding="0">
        <mj-column border="1px solid #e5e7eb" border-radius="8px" padding="10px">
          <mj-text font-weight="bold" padding-bottom="5px">
            {{eventTitle}}
          </mj-text>
          <mj-text color="#71717a" font-size="14px" padding-top="0">
            with {{hostName}}
          </mj-text>
          <mj-divider border-width="1px" border-color="#e5e7eb" padding="10px 0" />
          <mj-table padding="0">
            <tr>
              <td style="padding-bottom: 10px">
                <div style="font-size: 14px">{{bookingDate}}</div>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px">
                <div style="font-size: 14px">{{startTime}} - {{endTime}}</div>
                <div style="color: #71717a; font-size: 12px">{{timeZone}}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div style="font-size: 14px">{{location.name}}</div>
                <div style="color: #71717a; font-size: 12px">{{location.address}}</div>
              </td>
            </tr>
          </mj-table>
        </mj-column>
      </mj-section>
      <mj-section padding="20px 0 0 0">
        <mj-column>
          <mj-text>
            <p>Hi {{guestName}},</p>
            <p>Your booking request for {{eventTitle}} with {{hostName}} has been submitted.</p>
            <p>
              The host will review your request and you'll receive another email once they confirm or cancel your request.
            </p>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>`;
