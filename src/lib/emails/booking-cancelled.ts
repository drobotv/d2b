export default `
<mjml>
  <mj-head>
    <mj-title>Booking Cancelled</mj-title>
    <mj-attributes>
      <mj-all
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      />
      <mj-text font-size="16px" color="#18181b" line-height="24px" />
      <mj-button
        background-color="#0f766e"
        color="white"
        border-radius="6px"
        font-size="16px"
        inner-padding="12px 20px"
      />
    </mj-attributes>
    <mj-style> </mj-style>
  </mj-head>
  <mj-body background-color="#f4f4f5">
    <mj-section background-color="white" border-radius="8px" padding="30px 20px">
      <mj-column>
        <mj-text align="center" font-weight="bold" font-size="24px" padding-top="20px"> Booking Cancelled </mj-text>
        <mj-text align="center" color="#71717a" padding-bottom="20px"> Your booking has been cancelled. </mj-text>
        <mj-divider border-width="1px" border-color="#e5e7eb" padding="0 0 20px 0" />

        <mj-text padding="0">
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-bottom: 20px">
            <div style="font-weight: bold; padding-bottom: 5px">{{eventTitle}}</div>
            <div style="color: #71717a; font-size: 14px">with {{hostName}}</div>
            <div style="border-top: 1px solid #e5e7eb; margin: 10px 0"></div>
            <table style="width: 100%; border-collapse: collapse">
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
            </table>
          </div>
        </mj-text>

        <mj-text padding="20px 0 0 0">
          <p>Hi {{guestName}},</p>
          <p>We're writing to inform you that your booking for {{eventTitle}} with {{hostName}} has been cancelled.</p>
          <p><strong>Cancellation reason:</strong></p>
          <p style="padding: 10px; background-color: #f4f4f5; border-radius: 8px; border-left: 4px solid #0f766e">
            {{cancellationMessage}}
          </p>
        </mj-text>

        <mj-text padding="10px 0">
          <p>You can book another time slot by visiting the booking page again.</p>
        </mj-text>
        <mj-button href="{{rebookUrl}}">Book Another Time</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
