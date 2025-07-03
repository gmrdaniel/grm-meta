export const getPinterestRegisterEmail = (name: string, url: string) => {

const template = `<div>
  <p>Hello ${name}</p>
  <p>
    I'm Nicole from La Neta, a marketing agency that has partnered with Pinterest to invite
    a select group of creators to join its program. The challenge? Join Pinterest,
    connect your IG account, and let your content shine there too.
  </p>
  <p>By doing so, you'll automatically be entered to win:</p>
  <ul>
    <li>1 Amazon gift card for $1,000 USD</li>
    <li>10 Amazon gift cards for $100 USD</li>
  </ul>
  <p><b>Plus, by joining you'll receive:</b></p>
  <ul>
    <li>Access to an exclusive webinar with the Pinterest team</li>
    <li>Special resources to help you grow faster as a content creator</li>
  </ul>
  <p>
    You have until May 15th to participate. If you're looking to boost your growth on a
    visual platform built for creators like you, this is your moment.
  </p>
  <div style="text-align: center; padding-top: 20px; padding-bottom: 20px;">
    <a href="${url}" class="button" style="
      text-decoration: none !important;
      color: white !important;
      background-color: #E60023 !important;
      padding-top: 10px !important; 
      padding-bottom: 10px !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
      margin-top: 20px !important;
      margin-bottom: 20px !important;
      border-radius: 20px !important;
      cursor: pointer !important;">
      Join here
    </a>
    <p style="color: #9a9a9a !important; margin-top: 20px !important">
      If you have trouble with the button above, try copying and pasting the following link: 
      <a style="color: #00ade8" href="${url}">${url}</a>
    </p>
  </div>
  <p>If you have any questions, feel free to reach out. I'm here to support you.</p>
</div>`;

    return template
}