import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SupportContactModal from '../components/SupportContactModal';
import { useLandingTheme } from '../context/LandingThemeContext';
import usePageSEO from '../hooks/usePageSEO';

const JURISDICTIONS = [
  {
    name: 'Argentina',
    intro:
      "Under Argentina's Personal Data Protection Law (PDPL), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: To know what personal data is being processed and to obtain a copy.',
      'Right to Rectification: To correct inaccurate or incomplete data.',
      'Right to Deletion: To request the deletion of their data when it is no longer necessary or consent has been withdrawn.',
      'Right to Object: To object to the processing of their data on legitimate grounds.',
    ],
  },
  {
    name: 'Australia',
    intro:
      'Under the Privacy Act 1988, the Australian Privacy Principles (APPs), and the Spam Act 2003, Data Subjects are granted several rights including:',
    rights: [
      'Right to Access: Individuals can request access to their personal information held by an organization.',
      'Right to Correction: Individuals can request correction of inaccurate or outdated personal information.',
      'Right to Opt-Out: Individuals can opt-out of receiving unsolicited commercial electronic messages.',
      'Where lawful and practicable, you have the option of not identifying yourself or using a pseudonym when interacting with us.',
      'If you believe that we have breached the Australian Privacy Principles, you can make a complaint by contacting our Data Protection Officer. We will investigate your complaint and respond to you within a reasonable period. If you are not satisfied with our response, you can refer your complaint to the Office of the Australian Information Commissioner (OAIC) by telephone +61 1300 363 992 or email enquiries@oaic.gov.au.',
    ],
  },
  {
    name: 'Brazil',
    intro:
      "Under Brazil's General Data Protection Law (LGPD), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Confirmation of Processing: To confirm whether Personal Data is being processed.',
      'Right to Access: To access your Personal Data.',
      'Right to Correction: To request the correction of incomplete, inaccurate, or outdated Personal Data.',
      'Right to Anonymization, Blocking, or Deletion: Allows for Personal Data to be anonymized, blocked, or deleted when unnecessary or processed unlawfully.',
      'Right to Data Portability: To request Personal Data in a structured, commonly used, and machine-readable format.',
      'Right to Information on Data Sharing: To know with whom Personal Data is being shared.',
      'Right to Object: To object to the processing of Personal Data.',
      'Right to Withdraw Consent: To withdraw consent at any time.',
    ],
  },
  {
    name: 'Canada',
    intro:
      "Under the Personal Information Protection and Electronic Documents Act (PIPEDA), British Columbia's PIPA, Alberta's PIPA, and Canada's Anti-Spam Legislation (CASL), Data Subjects are granted several rights including:",
    rights: [
      'Right to Access: To access Personal Data held about you.',
      'Right to Correction: To request correction of inaccurate Personal Data.',
      'Right to Opt-Out: To opt-out of receiving unsolicited electronic communications.',
    ],
  },
  {
    name: 'Chile',
    intro:
      "Under Chile's Law No. 19,628 on the Protection of Private Life (DPL), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data when it is no longer necessary or processed unlawfully.',
      'Right to Object: To object to the processing of your Personal Data.',
    ],
  },
  {
    name: 'China',
    intro:
      "Under China's Personal Information Protection Law (PIPL), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to be Informed: To be informed about the purpose and scope of Personal Data processing.',
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data in certain circumstances.',
      'Right to Portability: To request your Personal Data in a portable format.',
      'Right to Restrict Processing: To restrict processing of your Personal Data in certain situations.',
      'Right to Object: To object to the processing of your Personal Data.',
    ],
  },
  {
    name: 'European Union & European Economic Area',
    intro:
      'Under the General Data Protection Regulation (GDPR), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'Right to be Informed: Data Subjects must be informed about Personal Data collection and processing activities.',
      'Right to Access: Data Subjects can request access to their Personal Data.',
      'Right to Rectification: Data Subjects can request correction of inaccurate Personal Data.',
      'Right to Erasure (Right to be Forgotten): Data Subjects can request deletion of their Personal Data.',
      'Right to Restrict Processing: Data Subjects can request restriction of processing in certain circumstances.',
      'Right to Data Portability: Data Subjects can request their Personal Data in a portable format.',
      'Right to Object: Data Subjects can object to the processing of their Personal Data.',
      'Right not to be subject to Automated Decision-Making: Data Subjects can object to decisions made solely on automated processing.',
      'If you have concerns about our data processing activities, you have the right to lodge a complaint with the Supervisory Authority for your Member State.',
    ],
  },
  {
    name: 'Hong Kong',
    intro:
      'Under the Personal Data Privacy Ordinance (PDPO), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate Personal Data.',
    ],
  },
  {
    name: 'Indonesia',
    intro:
      "Under Indonesia's Law No. 27 of 2022 on Personal Data Protection (PDP), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data.',
      'Right to Restrict Processing: To restrict the processing of your Personal Data.',
      'Right to Data Portability: To request your Personal Data in a portable format.',
    ],
  },
  {
    name: 'Israel',
    intro:
      "Under Israel's Protection of Privacy Law, 5741-1981, Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Rectification: To request correction of inaccurate Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data.',
    ],
  },
  {
    name: 'Japan',
    intro:
      'If you are a resident of Japan, please see our Japan Privacy Notice to read additional disclosures required under applicable law.',
    rights: [],
  },
  {
    name: 'Malaysia',
    intro:
      'Under the Personal Data Protection Act 2010 (PDPA), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate or outdated Personal Data.',
      'Right to Withdraw Consent: To withdraw consent at any time.',
    ],
  },
  {
    name: 'Mexico',
    intro:
      "Under Mexico's Federal Law on Protection of Personal Data Held by Individuals (LFPDPPP), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: To request access to your Personal data.',
      'Right to Rectification: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Cancellation: To request deletion of your Personal Data.',
      'Right to Opposition: To object to the processing of your Personal Data.',
    ],
  },
  {
    name: 'Nigeria',
    intro:
      'Under the Nigeria Data Protection Regulation (NDPR), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'The right to be informed about the collection and use of your personal data.',
      'The right to access your personal data.',
      'The right to rectify inaccurate personal data.',
      'The right to request the deletion of your personal data.',
      'The right to data portability.',
      'The right to object to the processing of your personal data.',
      'The right to withdraw consent at any time, where consent is the legal basis for processing.',
    ],
  },
  {
    name: 'Philippines',
    intro:
      "If you have concerns about our data processing activities, you have the right to lodge a complaint with the National Privacy Commission (NPC). Contact details for the NPC can be found at https://privacy.gov.ph/mechanics-for-complaints/. Under the Philippines' Data Privacy Act (Republic Act No. 10173), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to be Informed: To be informed whether Personal Data pertaining to you shall be, are being, or have been processed.',
      'Right to Access: To reasonable access to your Personal Data upon demand.',
      'Right to Object: To object to the processing of your Personal Data, including processing for direct marketing, automated processing, or profiling.',
      'Right to Rectification: To dispute the inaccuracy or error in your Personal Data and have it corrected and updated.',
      'Right to Erasure or Blocking: To suspend, withdraw, or order the blocking, removal, or destruction of your Personal Data from our filing system upon discovery and substantial proof that the Personal Data are incomplete, outdated, false, or unlawfully obtained.',
      'Right to Data Portability: To obtain from us a copy of your Personal Data in an electronic or structured format that is commonly used and allows for further use by the data subject.',
      'Right to Damages: To be indemnified for any damages sustained due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of your Personal Data.',
    ],
  },
  {
    name: 'Russia',
    intro:
      'Under the Russian Federal Law on Personal Data (No. 152-FZ), Data Subjects are granted several rights to control and protect their personal information. Here are the key Data Subject rights under Russian data protection law:',
    rights: [
      'Right to Information and Access: To know how your Personal Data is processed, including purposes, sources, methods, and third-party sharing.',
      'Right to Consent: Consent is needed for processing Personal Data, which must be voluntary, specific, and informed.',
      'Right to Withdraw Consent: To withdraw your consent anytime.',
      'Right to Rectification: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data if processing is unnecessary or consent is withdrawn, unless we are legally required to retain it.',
      'Right to Restriction of Processing: To request processing restrictions in certain situations, such as data accuracy disputes or objections.',
      'Right to Data Portability: To receive your Personal Data in a structured, machine-readable format and request its transfer to another Data Controller.',
      'Right to Object: To object to Personal Data processing, including for direct marketing.',
      'Automated Decision-Making and Profiling Rights: To refuse decisions based solely on automated processing, including profiling, that significantly affect your rights and freedoms.',
      'Right to Complain to the Data Protection Authority: To file complaints with the Data Protection Authority Roskomnadzor if your rights are violated.',
    ],
  },
  {
    name: 'South Africa',
    intro:
      'Under the Protection of Personal Information Act (POPIA), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'The right to access your Personal Data.',
      'The right to correct or delete your Personal Data.',
      'The right to object to the processing of your Personal Data.',
      'The right to withdraw consent at any time, where consent is the legal basis for processing.',
      'The right to lodge a complaint with the Information Regulator.',
    ],
  },
  {
    name: 'South Korea',
    intro:
      "Under South Korea's Personal Information Protection Act (PIPA), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to Access: Request access to your Personal Data.',
      'Right to Correction: Request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion: Request deletion of your Personal Data.',
      'Right to Suspend Processing: Request suspension of the processing of your Personal Data.',
    ],
  },
  {
    name: 'Switzerland',
    intro:
      'Under the Swiss Federal Act on Data Protection (FADP), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:',
    rights: [
      'Right to Access: To request access to your Personal Data.',
      'Right to Correction: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion: To request deletion of your Personal Data.',
      'If you have concerns about our data processing activities, you have the right to lodge a complaint with the Federal Data Protection and Information Commissioner (FDPIC).',
    ],
  },
  {
    name: 'Thailand',
    intro:
      "Under Thailand's Personal Data Protection Act (PDPA), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to be Informed: To be informed about Personal Data collection and processing activities.',
      'Right to Access: To request access to your Personal Data.',
      'Right to Rectification: To request correction of inaccurate Personal Data.',
      'Right to Erasure: To request deletion of your Personal Data.',
      'Right to Restrict Processing: To request restriction of processing in certain circumstances.',
      'Right to Data Portability: To request your Personal Data in a portable format.',
      'Right to Object: To object to the processing of your Personal Data.',
    ],
  },
  {
    name: 'Turkey',
    intro:
      "Under Turkey's Personal Data Protection Law (KVKK), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to be Informed: To be informed about Personal Data collection and processing activities.',
      'Right to Access: To request access to your Personal Data.',
      'Right to Rectification: To request correction of inaccurate or incomplete Personal Data.',
      'Right to Deletion or Destruction: To request deletion or destruction of your Personal Data.',
      'Right to Object: To object to the processing of your Personal Data.',
    ],
  },
  {
    name: 'United Arab Emirates (UAE)',
    intro:
      "Under the United Arab Emirates' Protection of Personal Data Protection (PDPL), Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'The right to be informed about the collection and use of your personal data.',
      'The right to access your personal data.',
      'The right to rectify inaccurate personal data.',
      'The right to request the deletion of your personal data.',
      'The right to restrict processing of your personal data.',
      'The right to data portability.',
      'The right to object to the processing of your personal data.',
      'The right to withdraw consent at any time, where consent is the legal basis for processing.',
    ],
  },
  {
    name: 'United Kingdom',
    intro:
      "Under the UK's GDPR, and the Data Protection Act 2018, Data Subjects are granted several rights to ensure the protection of their Personal Data. These rights include:",
    rights: [
      'Right to be Informed: To be informed about Personal Data collection and processing activities.',
      'Right to Access: To request access to your Personal Data.',
      'Right to Rectification: To request correction of inaccurate Personal Data.',
      'Right to Erasure (Right to be Forgotten): To request deletion of your Personal Data.',
      'Right to Restrict Processing: To restrict processing in certain circumstances.',
      'Right to Data Portability: To request your Personal Data in a portable format.',
      'Right to Object: To object to the processing of your Personal Data.',
      'Right not to be subject to Automated Decision-Making: To object to decisions made solely on automated processing.',
      "If you have concerns about our data processing activities, you have the right to lodge a complaint with the Information Commissioner's Office (ICO). Contact details for the ICO can be found at https://ico.org.uk/make-a-complaint/.",
    ],
  },
  {
    name: 'United States',
    intro:
      'We do not "sell" Personal Data or "share" Personal Data for cross-contextual behavioral advertising (as those terms are defined under applicable local laws). We also do not process Sensitive Personal Information for the purposes of inferring characteristics about a consumer.',
    rights: [
      'Depending on the state you live in, under applicable local laws you may also submit a rights request through an authorized agent. If you do so, the agent must present signed written permission to act on your behalf and you may also be required to independently verify your identity and submit proof of your residency with us. Authorized agent requests can be submitted to DPO@proxstream.com.',
      'Depending on the state you live in, under applicable local laws you may have the right to appeal a decision we make relating to requests to exercise your rights. To appeal a decision, please send your request to DPO@proxstream.com.',
    ],
    nested: [
      {
        heading: 'California Residents',
        text: 'If you are a resident of California, please see our California Privacy Notice to read additional disclosures required under applicable law.',
      },
      {
        heading: 'Colorado Residents',
        text: 'If you are a resident of Colorado, you have the following rights under the Colorado Privacy Act (CPA):',
        list: [
          'The right to access your data.',
          'The right to correct inaccuracies in your data.',
          'The right to delete your data.',
          'The right to data portability.',
          'The right to opt out of the sale of your data.',
        ],
      },
      {
        heading: 'Connecticut Residents',
        text: 'If you are a resident of Connecticut, you have the following rights under the Connecticut Data Privacy Act (CTDPA):',
        list: [
          'The right to access your data.',
          'The right to correct inaccuracies in your data.',
          'The right to delete your data.',
          'The right to data portability.',
          'The right to opt out of the sale of your data.',
        ],
      },
      {
        heading: 'Massachusetts Residents',
        text: 'If you are a resident of Massachusetts, we comply with the Massachusetts Data Privacy Law (201 CMR 17.00) as follows:',
        list: [
          'We maintain a comprehensive information security program to protect personal information.',
          'Our security measures include encryption of personal data, secure user authentication protocols, and access control measures.',
        ],
      },
      {
        heading: 'New York Residents',
        text: 'If you are a resident of New York, we comply with the New York SHIELD Act as follows:',
        list: [
          'We implement reasonable safeguards to protect the confidentiality, integrity, and availability of personal information.',
          'In the event of a data breach, we will notify affected individuals as required by the New York SHIELD Act.',
        ],
      },
      {
        heading: 'Oregon Residents',
        text: 'If you are a resident of Oregon, you have the following rights under the Oregon Consumer Privacy Act ("OCPA"):',
        list: [
          'The right to access your data.',
          'The right to know a list of the specific third parties that have received your personal data or any personal data from a controller.',
          'The right to correct any inaccuracies in your personal data.',
          'The right to have your personal data deleted.',
          'The right to obtain a copy of your personal data.',
          'The right to opt-out of a controller using your data.',
        ],
      },
      {
        heading: 'Utah Residents',
        text: 'If you are a resident of Utah, you have the following rights under the Utah Consumer Privacy Act (UCPA):',
        list: [
          'The right to access your data.',
          'The right to correct inaccuracies in your data.',
          'The right to delete your data.',
          'The right to data portability.',
          'The right to opt out of the sale of your data.',
        ],
      },
      {
        heading: 'Virginia Residents',
        text: 'If you are a resident of Virginia, you have the following rights under the Virginia Consumer Data Protection Act (VCDPA):',
        list: [
          'The right to access your data.',
          'The right to correct inaccuracies in your data.',
          'The right to delete your data.',
          'The right to data portability.',
          'The right to obtain a copy of your data.',
          'The right to opt out of the sale of your data.',
        ],
      },
    ],
  },
];

const SECTIONS = [
  {
    title: '1. Introduction',
    body: [
      'This is the Privacy Policy of Proxstream ("Proxstream", "us", "we", or "our"). This Privacy Policy is incorporated into and is subject to our Terms.',
      'This Privacy Policy applies to websites, apps, and other services that Proxstream operates. For simplicity, we refer to all of these as our "Services" or the "Proxstream Services" in this Privacy Policy. Our Privacy Policy is displayed prominently on our website and is easily accessible to all Data Subjects. To make it extra clear, we have added links to this Privacy Policy on all applicable Services.',
      'Proxstream collects Personal Data related to you when you use or access our Services. We respect your privacy and are strongly committed to keeping your Personal Data secure. This Privacy Policy outlines how we collect, use, disclose, and safeguard your Personal Data. It also explains your rights and how you can exercise them.',
      'We do not sell or rent your Personal Data. We will only share or otherwise disclose your Personal Data as necessary to provide our Services, or as otherwise described in this Privacy Policy.',
    ],
  },
  {
    title: '2. Definitions',
    bullets: [
      '"Personal Data" means any information relating to, or that can be linked to, an identified or identifiable individual.',
      '"Sensitive Personal Information" means special categories of Personal Data that are considered particularly sensitive due to their potential impact on individuals\' privacy and fundamental rights.',
      '"Processing" means any operation or set of operations performed on Personal Data or sets of Personal Data, whether by automated means or not, such as collection, storage, use, disclosure, etc.',
      '"Data Controller" means the entity that determines the purposes and means of processing Personal Data and is responsible for ensuring compliance with data protection laws and regulations.',
      '"Data Processor" means the entity that processes Personal Data on behalf of the Data Controller.',
      '"Data Subject" means an identifiable individual about whom Personal Data is being processed.',
      '"Express Consent" means a clear and unambiguous agreement or permission given by an individual for a specific purpose and requires the individual to actively and affirmatively indicate their consent.',
      '"Explicit Consent" means a very clear and specific statement of consent from an individual which must be freely given, informed, and unambiguous.',
      '"Commercial Electronic Message" means messages that are sent electronically for the purpose of promoting or advertising a product, service, or business and can include emails, text messages, instant messages, and other electronic communications.',
      '"Direct Marketing Message" refers to promotional or advertising messages that are directed at specific individuals or target audiences and may be sent electronically (e.g., email marketing campaigns), or through other channels (e.g., direct mail, telemarketing, or online advertising).',
    ],
  },
  {
    title: '3. Who We Are',
    body: [
      'The company that is responsible for your Personal Data under this Privacy Policy is Proxstream.',
      'If you are located in the European Union ("EU"), European Economic Area ("EEA"), Switzerland, or the United Kingdom ("UK"), Proxstream is the Data Controller.',
    ],
  },
  {
    title: "4. Children's Privacy",
    body: [
      'IF YOU ARE UNDER 18 YEARS OF AGE, DO NOT USE OR ACCESS THE PROXSTREAM SERVICES AT ANY TIME OR IN ANY MANNER.',
      'Proxstream is restricted to individuals who are 18 years of age or older. Our Services are not directed to, or intended for, children or individuals under the age of 18. For that reason, we do not knowingly collect Personal Data from children or individuals under the age of 18. We verify the age of our users to ensure compliance with applicable laws.',
      'If we learn that we are engaged in the processing of Personal Data from children or individuals under the age of 18, we will halt such processing immediately and promptly take steps to delete the Personal Data.',
      'If you have reason to believe that a child or individual under the age of 18 has provided Personal Data to us through our Services, please email us at support@proxstream.com. We will investigate any notification and, if appropriate, promptly delete the Personal Data from our systems.',
    ],
  },
  {
    title: '5. Categories of Data Subjects',
    intro: 'Under applicable law, we collect and process Personal Data from the following categories of Data Subjects:',
    bullets: [
      'Users: Individuals who register for and use our Services.',
      'Viewers: Individuals who view live streams and other content on our platform without registering.',
      'Partners: Individuals or organizations that partner with us for various reasons, such as content creation, marketing, etc.',
    ],
  },
  {
    title: '6. Consent',
    body: [
      'By using our Services, you consent to the collection and use of your Personal Data for the specified purposes outlined in this Privacy Policy. You can manage your consent preferences through your account settings or by contacting us directly. Where required by law, we will obtain your express or explicit consent before collecting or using your Personal Data or if we collect Sensitive Personal Information.',
    ],
  },
  {
    title: '7. Personal Data We Collect',
    intro:
      'We take reasonable steps to ensure the Personal Data we collect is accurate, complete, and up-to-date. We ensure that the collection, use, and disclosure of your Personal Data is reasonable and necessary for the purposes identified in this Privacy Policy. When you use our Services, we collect Personal Data that includes the following:',
    bullets: [
      'Personal Data you provide to us;',
      'Personal Data we collect automatically; and',
      'Personal Data we receive from other sources.',
    ],
    body: [
      'Please note that we need certain types of Personal Data so that we can create your account and provide our Services to you. If you do not provide us with such Personal Data, or ask us to delete it, you may not be able to access or use our Services. We outline in more detail the Personal Data we collect below.',
    ],
    subsections: [
      {
        heading: 'Personal Data You Provide to Us',
        items: [
          'We collect Personal Data from you when you provide it to us while creating or updating an account, using our Services, or communicating with us. This includes:',
          'Account information: When you create an account with us, we collect your name, date of birth, and gender. Depending on the method you use to create an account we may also collect your email address, a password you create for your account, phone number, third-party authorization token, social media account ID, social media account information you give us permission to access, and GPS location, if you allow us permission to access your device\'s GPS.',
          'User Content: When you use our Services, we collect the user content you upload including chat messages, photos, voice messages, videos, live streams, bio information, social media usernames, and location.',
          'Communication Information: If you communicate with us through email, or our online social media accounts, we collect your name, contact details, and the contents of any messages you send.',
          'Other Information You Provide: We collect other information that you may provide to us, such as when you provide us with information to establish your age or identity.',
        ],
      },
      {
        heading: 'Personal Data We Collect Automatically',
        items: [
          'Personal Data we receive automatically when you use our Services includes:',
          'Log Data: Information that your browser or device automatically sends when you use our Services. Log data includes your Internet Protocol (IP) address, browser type and settings, the date and time of your request, and how you interact with our Services.',
          'Usage Data: We may automatically collect information about your use of the Services, such as the types of content that you view or engage with, the features you use and the actions you take, as well as your time zone, country, the dates and times of access, user agent and version, type of computer or mobile device, and your computer connection.',
          'Device Information: Information about your device including make, model, operating system, device identifiers, advertising identifiers, push notification tokens, permissions, and browser. Information collected may depend on the type of device you use and its settings.',
          'Purchase information: When you make a purchase through our Services, we receive information regarding your purchase such as, which purchase you made, subscription information, third-party payment processor name, receipt data including order ID, amount, and expiry date.',
          'Cookies and Similar Technologies: We use cookies and similar technologies to collect usage data and to operate and improve our Services. You can manage your cookie preferences through your browser settings. For details about our use of cookies, please visit our Cookie Policy.',
        ],
      },
      {
        heading: 'Personal Data We Receive from Other Sources',
        items: [
          'We collect information from other sources, such as from our trusted business partners, including security partners to protect against fraud, abuse, and other security threats to our Services, or our marketing vendors who provide us with information about potential customers.',
          'When you take certain actions on other sites, we may receive information about you. For example, when we advertise on third-party platforms, if you click on the ad, we may receive information about which ad you saw and on which platform. Similarly, we may also receive certain information when you click on a referral link, such as which website you came from.',
          'Additionally, other users may provide information about you as they use our Services, for instance as they interact with you or if they submit a report involving you or your user content.',
        ],
      },
    ],
  },
  {
    title: '8. Lawful Basis for Processing',
    intro:
      'We ensure your Personal Data is processed lawfully, fairly, and transparently in accordance with applicable laws, and for the purposes described in this Privacy Policy. We rely on the following lawful bases to process your Personal Data:',
    subsections: [
      {
        heading: 'Consent',
        items: [
          'We process your Personal Data on the basis of your express, clear, and freely given consent for specific purposes that we communicate to you. Depending on the consent given, you can revoke your consent at any time through your account settings, your device\'s permissions settings, your third-party account settings, or by contacting us at DPO@proxstream.com.',
        ],
      },
      {
        heading: 'To Honor Our Contractual Commitments',
        items: [
          'Much of our processing of your Personal Data is to meet our contractual obligations to you, or to take steps at your request in anticipation of entering into a contract with you. For example, to create your account or provide you with customer support.',
        ],
      },
      {
        heading: 'Legal Obligations',
        items: [
          'We need to use and disclose Personal Data in certain ways to comply with our legal obligations, e.g. we retain Personal Data where we are required by law or if we are compelled to do so by a court order or regulatory body.',
        ],
      },
      {
        heading: 'Legitimate Interests',
        items: [
          'In many cases, we process your Personal Data on the basis that it furthers our legitimate business interests in ways that are not overridden by your interests or fundamental rights and freedoms. This includes:',
          'To provide a safe and enjoyable user experience;',
          'To prevent misuse, and to enforce our Terms of Use and other policies against users who violate them;',
          'To provide customer support;',
          'To engage in Marketing or Advertising, e.g. advertising on third-party services or sending emails or other communications to let you know about new features or services;',
          'To track the fundamental metrics of our business, to perform financial reporting, and to respond to regulatory obligations; and',
          'To analyze and improve our business, e.g. collecting information about how you use our Services to optimize the design and placement of certain features or add new features.',
        ],
      },
    ],
  },
  {
    title: '9. Data Minimization',
    body: [
      'We adhere to the principle of data minimization, collecting only the Personal Data necessary to achieve the purposes stated in this Privacy Policy.',
    ],
  },
  {
    title: '10. How We Use Your Personal Data',
    intro:
      'We collect your Personal Data exclusively through lawful and fair means, and for various purposes. These purposes are communicated to you at the time of collection or are publicly disclosed in this Privacy Policy. We ensure that you are fully informed about both the primary and secondary purposes of collection. Additionally, we ensure that the Personal Data collected is adequate, relevant, and limited to what is necessary to fulfill the following purposes:',
    bullets: [
      'To provide, administer, maintain and/or analyze our Services;',
      'To improve our Services and conduct research;',
      'To communicate with you, including to send you information or marketing about our Services;',
      'To develop new programs and Services;',
      'To process transactions and send related information;',
      'To personalize your user experience and deliver tailored content;',
      'To carry out business transfers;',
      'To prevent fraud, criminal activity, or misuses of our Services, and to protect the security of our systems and Services; and',
      'To comply with legal obligations and to protect the rights, privacy, safety, or property of our users, us, our affiliates, or any third party.',
    ],
  },
  {
    title: '11. Aggregated or De-Identified Information',
    body: [
      'We aggregate, de-identify, or anonymize your Personal Data so that it can no longer be used to identify you. We use this information to analyze the effectiveness of our Services, improve and add features, conduct research, and for similar purposes. Additionally, from time to time, we may share or publish aggregated information, such as general user statistics, with third parties. We collect this information through our Services, cookies, and other means described in this Privacy Policy. We will maintain and use de-identified information in its anonymous or de-identified form and will not attempt to re-identify it unless required by law.',
    ],
  },
  {
    title: '12. Data Sharing and Disclosure',
    intro:
      'In certain circumstances we may share or disclose your Personal Data to third parties without further notice to you, unless required by law. We ensure that any third-party recipients are subject to data protection obligations. We may share or disclose your Personal Data for various purposes and under the following circumstances:',
    subsections: [
      {
        heading: 'Vendors and Service Providers',
        items: [
          'To assist us in meeting business operations needs and to perform certain services and functions, we may provide certain Personal Data to vendors and service providers, including providers of hosting services, customer service vendors, cloud services, email communication software, web analytics services, and other information technology providers. Pursuant to our instructions, these parties will access, process, or store Personal Data only in the course of performing their duties to us.',
        ],
      },
      {
        heading: 'Business Transfers',
        items: [
          'If we are involved in strategic transactions, reorganization, bankruptcy, receivership, or transition of service to another provider (collectively, a "Transaction"), your Personal Data and other information may be disclosed in the diligence process with counterparties and others assisting with the Transaction and transferred to a successor or affiliate as part of that Transaction along with other assets. In such cases, we would require any such business entity to honor the terms of this Privacy Policy.',
        ],
      },
      {
        heading: 'Legal Requirements',
        items: [
          'We may share your Personal Data, including information about your interaction with our Services, with government authorities, industry peers, or other third parties (i) if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, (ii) to protect and defend our rights or property, (iii) if we determine, in our sole discretion, that there is a violation of our terms, policies, or the law; (iv) to detect or prevent fraud or other illegal activity; (v) to protect the safety, security, and integrity of our products, employees, or users, or the public, or (vi) to protect against legal liability.',
        ],
      },
      {
        heading: 'Affiliates',
        items: [
          'We may disclose Personal Data to our affiliates, meaning an entity that controls, is controlled by, or is under common control with Proxstream. Our affiliates may use the Personal Data we share in a manner consistent with this Privacy Policy.',
        ],
      },
      {
        heading: 'Other Users and Third Parties You Share Information With',
        items: [
          'Certain features allow you to display or share information with other users or third parties. For example, you may share Live Streams with other users via shared links or send information to third-party applications via shared links. Be sure you trust any user or third party with whom you share information.',
        ],
      },
      {
        heading: 'With Your Consent',
        items: ['If you specifically give us consent to share your Personal Data.'],
      },
    ],
  },
  {
    title: '13. Data Retention',
    intro:
      'We retain your Personal Data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. How long we retain your Personal Data will depend on a number of factors, such as:',
    bullets: [
      'Our purpose for processing the Personal Data (such as whether we need to retain the Personal Data to provide our Services);',
      'The amount, nature, and sensitivity of the Personal Data;',
      'The potential risk of harm from unauthorized use or disclosure of the Personal Data; and',
      'Any legal requirements that we are subject to.',
    ],
    outro: 'After such time, your Personal Data will be securely deleted or anonymized.',
  },
  {
    title: '14. Data Security Measures',
    body: [
      'We maintain a comprehensive data security program which includes encryption, secure user authentication protocols, access controls, and regular security audits. We implement technical, physical, and organizational safeguards to protect the confidentiality, integrity, and availability of your Personal Data from unauthorized or unlawful processing, access, disclosure, alteration, destruction, theft, loss, damage, copying, use, or modification, and we regularly review our security measures to consider any new available technologies and/or methods.',
      'However, please note that no data transmission over the internet can be guaranteed to be completely secure. Therefore, you should take special care in deciding what information you send to us via our Services or through email. We cannot ensure or warrant the security of any Personal Data you transmit to us, and you do so at your own risk. We cannot guarantee that such information may not be accessed, disclosed, altered, or destroyed by breach of any of our physical, technical, or managerial safeguards. In addition, we are not responsible for circumvention of any privacy settings or security measures contained on our Service, or third-party websites.',
    ],
  },
  {
    title: '15. Privacy Impact Assessments',
    body: [
      'Where required by law, we will conduct Privacy Impact Assessments ("PIA") when we are planning to implement a new program, system, technology, or process that involves the collection, use, or disclosure of your Personal Data, or when making significant changes to existing programs or processes that may impact your privacy.',
    ],
  },
  {
    title: '16. Data Protection Impact Assessments',
    body: [
      'Where required by law, Data Protection Impact Assessments ("DPIA") are conducted to assess and mitigate the risks associated with Personal Data processing, particularly where processing is likely to result in a high risk to individuals\' rights and freedoms.',
    ],
  },
  {
    title: '17. Data Subject Rights',
    intro:
      'Depending on your local jurisdiction and applicable laws, you may have certain statutory rights in relation to your Personal Data. For example, you may have the following:',
    bullets: [
      'Right to Be Informed: To be informed about the collection and use of your Personal Data.',
      'Right to Access: To request access to or obtain a copy of your Personal Data and information relating to how it is processed.',
      'Right to Rectify: To correct inaccurate or incomplete Personal Data, or update your Personal Data.',
      'Right to Erase or Delete: To request deletion of your Personal Data from our records and systems.',
      'Right to Restrict Processing: To restrict how we process your Personal Data.',
      'Right to Object to Processing: To object to how we process your Personal Data.',
      'Right to Data Portability: To obtain, transfer, and reuse your Personal Data in a portable format for your own purposes across different services.',
      'Right to Consent: To consent to the collection, use, and disclosure of your data, except where permitted or required by law.',
      'Right to Withdraw Consent: To withdraw consent at any time where we rely on consent as the legal basis to process your Personal Data.',
      'Right to Opt-Out: To Opt-out of the sale of your Personal Data, or the processing of your Personal Data for targeted advertising.',
      'Right to Be Free From Discrimination: Not to be discriminated against for exercising any of your privacy rights.',
      'Right to Not be Subject to Automated Decision Making and Profiling: To not be subject to a decision when it is based on automated processing and it produces an adverse legal effect or significantly affects you.',
      'Right to Cessation of Use: Request that we cease the use of your Personal Data.',
      'Right to Lodge a Complaint: To lodge a complaint with your local data protection authority.',
    ],
    outro:
      'For more specific information regarding your rights specific to your jurisdiction and applicable laws, see the Special Jurisdictional Provisions section at the bottom of this Privacy Policy.',
  },
  {
    title: '18. How to Exercise Your Rights',
    body: [
      'You may exercise some of your rights through your Proxstream account settings at any time. If you are unable to exercise your rights through your account settings, you may submit a rights request using one of the contact methods listed in the Contact Information section of this Privacy Policy.',
      'In order to protect your Personal Data from unauthorized access, change, or deletion, we may require you to verify your credentials before we process your request. If you do not have an account with us, or if we suspect fraudulent or malicious activity, we may ask you to provide additional Personal Data and proof of residency for verification purposes. If we cannot verify your identity, we will not be able to honor your request.',
      'We will not discriminate against you for exercising your rights. You do not usually need to pay a fee to exercise your rights. If you make a request, we will respond to the request within thirty (30) days, or as required by law.',
    ],
  },
  {
    title: '19. International Data Transfers and Storage',
    body: [
      'By using our Services, you understand and acknowledge that your Personal Data will be transferred, stored, and processed in our facilities and servers located in the United States and Canada, and may be disclosed to our service providers and affiliates in other jurisdictions. If we transfer Personal Data to a foreign country, we ensure that such transfers are made in compliance with all applicable data protection laws.',
      'If you are based in the EU, EEA, Switzerland, or the UK we may transfer your Personal Data to a foreign country that may not offer the same level of data protection as your home country. However, we transfer Personal Data pursuant to applicable data protection laws. To transfer your Personal Data outside of the EU, EEA, Switzerland or the UK, we rely on the European Commission\'s Adequacy Decisions on certain countries and, for other jurisdictions, we rely on the Standard Contractual Clauses as approved by the European Commission, or Binding Corporate Rules and any applicable country addenda.',
    ],
  },
  {
    title: '20. Links to Third-Party Services and Websites',
    body: [
      'Our Service may contain links to other services or websites not operated or controlled by Proxstream, including social media services (collectively, "Third-Party Sites"). The information that you share with Third-Party Sites will be governed by the specific privacy policies and terms of service of the Third-Party Sites and not by this Privacy Policy. By providing these links we do not imply that we endorse or have reviewed these sites. Please contact the Third-Party Sites directly for information on their privacy practices and policies.',
    ],
  },
  {
    title: '21. Do Not Track',
    body: [
      'Do Not Track is a privacy preference that users can set in certain web browsers. Do Not Track signals are a way for users to inform websites and services that they do not want certain information about their webpage visits collected over time and across websites or online services. However, we do not recognize or respond to browser-initiated Do Not Track signals.',
    ],
  },
  {
    title: '22. Direct Marketing and Commercial Electronic Messages',
    body: [
      'We may use your Personal Data to send you Commercial Electronic Messages or Direct Marketing Communications based on your consent, the preferences in your account settings, or the preferences on your device. Where required by law, we will obtain your express or explicit consent before sending these communications.',
      'All email communications include a clear identification of the sender, a valid physical postal address, and an easy-to-use opt-out mechanism. You can opt out of receiving email communications at any time by clicking on the "unsubscribe" link located at the bottom of such emails or contact us at support@proxstream.com. You can further edit your preferences through your account settings or your device settings at any time. Opt-out requests are honored within ten (10) business days.',
      'We have also implemented internal compliance programs, including regular audits and staff training, to ensure adherence to the applicable anti-spam laws.',
    ],
  },
  {
    title: '23. Automated Decision-Making and Profiling',
    body: [
      'We do not engage in automated decision-making or profiling that produces legal or similarly significant effects to you.',
    ],
  },
  {
    title: '24. Data Breach Notifications',
    body: [
      'In the event of a data breach, we will promptly notify affected individuals and relevant regulatory authorities, or as required by law. We will provide sufficient information to allow you to take protective measures against potential consequences.',
    ],
  },
  {
    title: '25. Changes to This Privacy Policy',
    body: [
      'We may update this Privacy Policy from time to time. When we do, we will post an updated version on this page along with the effective date, unless another type of notice is required by law. Your continued use of our Services after any changes indicates your acceptance of the new policy.',
    ],
  },
  {
    title: '26. Data Protection Officer',
    body: [
      'We have appointed a Data Protection Officer ("DPO") to oversee and ensure compliance with applicable privacy laws, to oversee our data protection strategy and implementation, and to act as a point of contact for data protection authorities and individuals. In Canada, our DPO is considered our "Privacy Officer", and in South Africa our DPO is considered our "Information Officer". To contact our DPO please see the Contact Information section of this Privacy Policy.',
    ],
  },
  {
    title: '27. Contact Information',
    body: [
      'For any questions or concerns about this Privacy Policy, or matters related to our processing of your Personal Data, please contact our Data Protection Officer at:',
      'Proxstream',
      'Attention: Data Protection Officer',
      'Email: DPO@proxstream.com',
      'If you have any complaints regarding our privacy practices, you can contact our Data Protection Officer or lodge a complaint with your local data protection authority.',
    ],
  },
];

const SectionCard = ({ section, isDark }) => (
  <article
    className={`rounded-2xl p-6 md:p-8 border transition-colors ${
      isDark
        ? 'bg-white/[0.04] border-white/10 shadow-[0_0_40px_-20px_rgba(253,29,29,0.35)]'
        : 'bg-white/70 border-black/5 shadow-sm'
    }`}
  >
    <h2
      className={`text-lg md:text-xl font-bold mb-4 ${
        isDark
          ? 'bg-gradient-to-r from-[#c084fc] via-[#fb7185] to-[#fdba74] bg-clip-text text-transparent'
          : 'text-gray-900'
      }`}
    >
      {section.title}
    </h2>

    {section.intro && (
      <p className={`text-sm md:text-base leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {section.intro}
      </p>
    )}

    {section.body?.map((para) => (
      <p
        key={para.slice(0, 60)}
        className={`text-sm md:text-base leading-relaxed mb-3 last:mb-0 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
      >
        {para}
      </p>
    ))}

    {section.bullets && (
      <ul className={`list-disc pl-5 space-y-2 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {section.bullets.map((item) => (
          <li key={item.slice(0, 72)}>{item}</li>
        ))}
      </ul>
    )}

    {section.subsections?.map((sub) => (
      <div key={sub.heading} className="mt-4">
        <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-rose-200/90' : 'text-gray-800'}`}>
          {sub.heading}
        </h3>
        <ul className={`list-disc pl-5 space-y-1.5 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {sub.items.map((item) => (
            <li key={item.slice(0, 72)}>{item}</li>
          ))}
        </ul>
      </div>
    ))}

    {section.outro && (
      <p className={`text-sm md:text-base leading-relaxed mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {section.outro}
      </p>
    )}
  </article>
);

const PrivacyPage = () => {
  const { isDark } = useLandingTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  usePageSEO({
    title: 'Privacy Policy | ProxStream Data Protection & Security',
    description:
      'ProxStream Privacy Policy outlines how we collect, protect, and respect your personal data and privacy across all streaming services.',
    canonicalPath: '/privacy',
  });

  return (
    <div
      className={`min-h-screen font-sans leading-relaxed transition-colors duration-300 ${
        isDark ? 'bg-[#0c0714] text-gray-200 selection:bg-fuchsia-500/40 selection:text-white' : 'bg-[#faf8fc] text-gray-800 selection:bg-purple-500 selection:text-white'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(131,58,180,0.22), transparent), radial-gradient(ellipse 60% 40% at 95% 10%, rgba(253,29,29,0.14), transparent), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(252,176,69,0.12), transparent)'
          : 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(131,58,180,0.05), transparent), radial-gradient(ellipse 60% 40% at 95% 10%, rgba(253,29,29,0.03), transparent), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(252,176,69,0.04), transparent)',
      }}
    >
      <Navbar />
      <SupportContactModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      <button
        type="button"
        onClick={() => setSupportOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 text-white font-bold text-xs py-3.5 px-2 rounded-l-xl shadow-2xl tracking-widest uppercase [writing-mode:vertical-lr] cursor-pointer border-y border-l border-white/30 hover:scale-105 transition-all duration-200"
        style={{
          background: 'linear-gradient(180deg, #833AB4 0%, #FD1D1D 55%, #FCB045 100%)',
          boxShadow: '0 10px 25px rgba(236,72,153,0.4)',
        }}
      >
        Support
      </button>

      <section className="relative pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl"
            style={{ background: isDark ? 'rgba(131,58,180,0.35)' : 'rgba(131,58,180,0.14)' }}
          />
          <div
            className="absolute top-16 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: isDark ? 'rgba(253,29,29,0.22)' : 'rgba(253,29,29,0.1)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl"
            style={{ background: isDark ? 'rgba(252,176,69,0.2)' : 'rgba(252,176,69,0.12)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center flex flex-col items-center">
          <img src="/Logos/Logo.png" alt="Proxstream" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1
            className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-center ${
              isDark
                ? 'bg-gradient-to-r from-[#c084fc] via-[#fb7185] to-[#fdba74] bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}
          >
            Proxstream Privacy Policy
          </h1>
          <p className={`text-sm md:text-base text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Effective Date: March 13, 2025
          </p>
          <p className="mt-4 text-sm flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/terms"
              className="font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent hover:opacity-80"
            >
              Terms of Service
            </Link>
            <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>·</span>
            <Link
              to="/about"
              className="font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent hover:opacity-80"
            >
              Community Guidelines
            </Link>
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-8 md:px-16 pb-16 space-y-8">
        {SECTIONS.map((section) => (
          <SectionCard key={section.title} section={section} isDark={isDark} />
        ))}

        <article
          className={`rounded-2xl p-6 md:p-8 border transition-colors ${
            isDark
              ? 'bg-white/[0.04] border-white/10 shadow-[0_0_40px_-20px_rgba(131,58,180,0.45)]'
              : 'bg-white/70 border-black/5 shadow-sm'
          }`}
        >
          <h2
            className={`text-lg md:text-xl font-bold mb-4 ${
              isDark
                ? 'bg-gradient-to-r from-[#c084fc] via-[#fb7185] to-[#fdba74] bg-clip-text text-transparent'
                : 'text-gray-900'
            }`}
          >
            28. Special Jurisdictional Provisions
          </h2>
          <p className={`text-sm md:text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            While this Privacy Policy endeavors to address a comprehensive range of legal requirements and standards
            concerning the protection of Personal Data, it is important to acknowledge that certain jurisdictions may
            impose additional terms or requirements. If you are a Data Subject to whom the laws of the jurisdictions
            outlined below apply, the terms outlined below will apply to you in addition to the terms set out in this
            Privacy Policy. In the event of a conflict between the laws and regulations in your Jurisdiction and the
            terms of this Privacy Policy, the laws and regulations in your Jurisdiction shall take precedence.
          </p>

          <div className="space-y-8">
            {JURISDICTIONS.map((j) => (
              <div key={j.name}>
                <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-rose-200' : 'text-gray-800'}`}>
                  {j.name}
                </h3>
                <p className={`text-sm md:text-base leading-relaxed mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {j.intro}
                </p>
                {j.rights?.length > 0 && (
                  <ul
                    className={`list-disc pl-5 space-y-1.5 text-sm md:text-base ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {j.rights.map((r) => (
                      <li key={r.slice(0, 80)}>{r}</li>
                    ))}
                  </ul>
                )}
                {j.nested?.map((n) => (
                  <div key={n.heading} className="mt-4 ml-1">
                    <h4 className={`text-sm font-semibold mb-1.5 ${isDark ? 'text-amber-200/90' : 'text-gray-700'}`}>
                      {n.heading}
                    </h4>
                    <p className={`text-sm leading-relaxed mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {n.text}
                    </p>
                    {n.list && (
                      <ul
                        className={`list-disc pl-5 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {n.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
