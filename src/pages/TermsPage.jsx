import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SupportContactModal from '../components/SupportContactModal';
import { useLandingTheme } from '../context/LandingThemeContext';
import usePageSEO from '../hooks/usePageSEO';

const SECTIONS = [
  {
    title: '1. Introduction; Agreement to These Terms',
    body: [
      'PLEASE READ THESE TERMS CAREFULLY. THIS IS A BINDING CONTRACT. These Terms set forth our legal obligations to each other. They apply to your access and use of our Services. If you do not wish to be bound by these Terms, or you do not agree to these Terms, do not access or otherwise use our Services. BY ACCESSING, DOWNLOADING, USING, PURCHASING, PAYING TO USE AND/OR SUBSCRIBING TO OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY, THESE TERMS, AS THEY MAY BE AMENDED FROM TIME TO TIME. IF YOU DO NOT AGREE WITH THESE TERMS IN THEIR ENTIRETY, YOU MAY NOT USE THE PROXSTREAM SERVICES. YOUR CONTINUED USE OF OUR SERVICES AFTER WE POST REVISED TERMS MEANS THAT YOU AGREE TO THE REVISIONS. We also have a Privacy Policy, and User Content and Conduct Policy that apply to your use of our Services and are incorporated into these Terms. You should read these policies as they contain important information about your use of our Services.',
    ],
  },
  {
    title: '2. Definitions',
    intro: 'In these Terms, certain terms are defined for clarity and consistency. Please review the following definitions:',
    bullets: [
      '"Terms" refers to these Terms located at the URL /terms on the Proxstream website.',
      '"Proxstream," "we," "us," and "our," refer to Proxstream, including its subsidiaries and related companies.',
      '"Services," or "Proxstream Services," encompass the services, apps, websites, and other products owned and operated by Proxstream.',
      '"you," or "your," refer to the individual accessing or using our Services. If you are accessing our Services on behalf of a legal entity (such as your employer), you affirm that you have the authority to bind that entity to these Terms. In such cases, "you" and "your" will apply to the legal entity.',
      '"User," or "Users," denote individuals, excluding you, who access or utilize our Services.',
      '"third party," "third-party," "third parties," or "third-parties," refer to individuals, groups, or entities, excluding you, us, or other Proxstream Users.',
      '"Proxstream\'s Paid Services," or "Paid Services," refer to additional functionality, features, services or products that you pay for on or through our Services, which includes but is not limited to subscriptions, Virtual Currency, or Virtual Goods.',
      '"Virtual Currency" refers to a digital representation of value, only available in electronic form within the Proxstream app, for example, our Proxstream Coins.',
      '"Virtual Good," or "Virtual Goods," refer to any non-physical object used within the Proxstream app, for example, a live stream Gift.',
      '"App Store Account" refers to either your Apple iTunes account or your Google Play account.',
      '"User Content," or "Users\' Content," refer to all content that you, and other Proxstream Users, can add (upload, post, share, or live stream) to our Services, both publicly and privately. This includes text, links, GIFs, emojis, photos, videos, audio, or other media. If we introduce another method for adding User Content to our Services, it also falls under this definition.',
      '"Proxstream\'s Content," or "our Content," refer to our Services and all materials and content on our Services, other than User Content or third-party content. This includes, but is not limited to, software, images, text, graphics, designs, illustrations, Proxstream\'s logos, patents, trademarks, service marks, copyrights, photographs, audio, videos, music, information, data, other files, and the arrangement of such materials and content on our Services.',
    ],
    outro: 'These definitions are provided to ensure clarity and consistency in the interpretation of these Terms. By accessing or using our Services, you agree to abide by these defined terms.',
  },
  {
    title: '3. Who We Are',
    body: [
      'We are Proxstream. Proxstream is owned and operated for the Proxstream live streaming platform.',
      'For questions, contact us using the details in Section 28 (Contact Us).',
    ],
  },
  {
    title: '4. Account Eligibility',
    intro: 'To access and use our Services, you must meet certain eligibility criteria. Please carefully review the following requirements before using our Services:',
    subsections: [
      {
        heading: 'Age Requirement',
        items: [
          'Our Services are intended for individuals who are at least 18 years old.',
          'By accessing or using our Services, you confirm that you meet this age requirement.',
        ],
      },
      {
        heading: 'Legal Capacity',
        items: [
          'By using our Services, you affirm that you have the legal capacity to enter into a binding contract with Proxstream and to comply with these Terms.',
          'You are responsible for ensuring that you are legally permitted to use our Services in your jurisdiction.',
        ],
      },
      {
        heading: 'Criminal Background',
        items: [
          'You represent and warrant that you have never been convicted of a felony, or any criminal offense involving sexual misconduct or otherwise.',
          'Additionally, you confirm that you have not been previously suspended, removed, deactivated, terminated, or blocked from accessing the Proxstream Services.',
        ],
      },
      {
        heading: 'Non-Competitor Status',
        items: [
          'You certify that you are not a competitor of Proxstream and that you are not using our Services for purposes that compete with Proxstream or go against its intended use.',
        ],
      },
    ],
    outro: 'By accessing or using our Services, you acknowledge and agree to comply with these eligibility requirements. If you do not meet these criteria, you are not permitted to use the Proxstream Services.',
  },
  {
    title: '5. Privacy',
    body: [
      'Protecting your privacy is a top priority for us. We understand the importance of safeguarding your Personal Data and maintaining your trust. For detailed information on our privacy practices, including how we collect, use, and disclose, your Personal Data, as well as your options for managing your privacy settings and understanding your privacy rights, please refer to our Privacy Policy.',
    ],
  },
  {
    title: '6. What You Can Expect from Us',
    intro: 'We are committed to continuously enhancing our Services by developing new features and products to better serve you. In pursuit of this goal, we may introduce, modify, or remove features or products, ensuring that our offerings remain relevant and beneficial to you. While we strive to minimize disruptions, we may make changes to our Services without prior notice, including the addition or removal of features, or even the discontinuation of certain products or the entire service.',
    subsections: [
      {
        heading: 'Service Evolution',
        items: [
          'We are actively developing new features and products to enhance our Services.',
          'Changes may include the addition, modification, or removal of features or products.',
          'We may introduce new features or products and retire old ones to improve the overall user experience.',
        ],
      },
      {
        heading: 'Discontinuation of Services',
        items: [
          'While we aim to provide uninterrupted Services, we may discontinue our offerings altogether.',
          'We may not always provide advance notice before making changes or discontinuing our Services.',
        ],
      },
      {
        heading: 'Service Outages and Changes',
        items: [
          'Despite our efforts to maintain service stability, there may be occasional outages or changes to our Services.',
          'Your User Content may not be retrievable during such outages or changes.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        items: [
          'We are not liable for any service outages, changes, or discontinuation of our Services.',
        ],
      },
    ],
  },
  {
    title: '7. Your Responsibilities',
    intro: 'You agree to use our Services, including posting any User Content, only in a manner consistent with these Terms and compliant with all applicable laws and regulations.',
    subsections: [
      {
        heading: 'Conduct',
        items: [
          'You must treat all other Users with dignity and respect and abide by our User Content and Conduct Policy while using our Services.',
        ],
      },
      {
        heading: 'Proxstream Account',
        items: [
          'To access and use our Services, you must create a Proxstream account for personal, non-commercial use only.',
          'You agree to provide accurate information and maintain the security of your account.',
          'You are responsible for all activities on your account, including any purchases made.',
          'You must exercise caution when accessing your account from shared devices.',
          'Proxstream is not liable for any losses or damages due to unauthorized access to your account or security breaches on third-party platforms.',
        ],
      },
      {
        heading: 'Contact Information',
        items: [
          'You are responsible for maintaining accurate contact information associated with your account. Failure to do so may result in difficulty restoring your account.',
        ],
      },
      {
        heading: 'Exclusive Use',
        items: [
          'You agree not to transfer your Proxstream account or use our Services for commercial activities without our written permission.',
        ],
      },
      {
        heading: 'Data Usage Charges',
        items: [
          'You are responsible for any fees or charges incurred while accessing our Services, including data usage charges.',
        ],
      },
      {
        heading: 'Interactions with Others',
        items: [
          'You assume all risks associated with online or offline interactions with others.',
          'Proxstream does not conduct background checks on our Users and is not responsible for User conduct.',
          'You are solely responsible for your interactions with other Users.',
        ],
      },
      {
        heading: 'Reporting Violations',
        items: [
          'You may report violations of these Terms using the report feature in the Proxstream app. We will make reasonable efforts to review reported accounts or User Content but we are under no obligation to do so.',
        ],
      },
      {
        heading: 'Enforcement',
        items: [
          'We reserve the right to disable, suspend, or terminate your access to our Services or your Proxstream account for any reason, without notice. We may also take legal action against you for violations of these Terms.',
        ],
      },
    ],
  },
  {
    title: '8. User Content',
    subsections: [
      {
        heading: 'Content and Conduct',
        items: ['You are required to post User Content that follows our User Content and Conduct Policy.'],
      },
      {
        heading: 'Responsibility for User Content',
        items: [
          'You have the sole responsibility for the User Content you post or publish on our Services. This includes ensuring that you have the right to post the content, that it complies with our Terms, and that it does not infringe on the rights or privacy of others. We are not responsible for others\' use of your User Content, and you acknowledge that your User Content may be viewed, saved, shared, or otherwise used by others.',
        ],
      },
      {
        heading: 'Accuracy of Information',
        items: [
          'You must not post any inaccurate, misleading, incomplete, or false information or User Content on our Services.',
        ],
      },
      {
        heading: 'No Duty to Review User Content',
        items: [
          'We do not have a duty to pre-screen, review, control, monitor, or edit User Content. However, we reserve the right to review, edit, or refuse User Content at our discretion. You may report User Content that violates our Terms, and we may block or remove such User Content in our sole discretion.',
        ],
      },
      {
        heading: 'Other User Content',
        items: [
          'You may access other Users\' Content on our Services but must not use it without their consent or as allowed by law. Other Users\' Content does not necessarily reflect our views or opinions, and we do not endorse or verify its accuracy or reliability.',
        ],
      },
      {
        heading: 'Enforcement',
        items: [
          'We reserve the right to block, remove, or permanently delete User Content for any reason, including breaches of our Terms or our policies, or if required by law. We may take legal action against Users who post inappropriate or unlawful User Content, and we may terminate accounts of violators without notice.',
        ],
      },
      {
        heading: 'License of Your User Content to Proxstream',
        items: [
          'By using our Services, you grant us a license to use your User Content in various ways necessary for operating, developing, and improving our Services. This license is worldwide, irrevocable, non-exclusive, royalty-free, and perpetual.',
        ],
      },
      {
        heading: 'Feedback',
        items: [
          'We appreciate feedback on our Services. By providing feedback, you grant us a license to use it without any restrictions, attribution, or compensation to you.',
        ],
      },
    ],
  },
  {
    title: '9. Third Party Content',
    body: [
      'Our Services may allow you to access third-party websites, features, apps, services, or other content. We provide you access only as a convenience, and you agree that we are not responsible or liable in any way for the content or services available from these third parties. You agree that you will access third-party content at your own risk. Proxstream does not control, endorse, review, or adopt any third-party content, and we expressly disclaim any and all representations, warranties, or conditions of any kind regarding third-party content, including, without limitation, its accuracy or completeness.',
      'The collection, use, and disclosure of your information from a third party will be subject to that third party\'s privacy policies and practices and are not covered under Proxstream\'s Privacy Policy.',
    ],
  },
  {
    title: '10. Proxstream\'s Content',
    body: [
      'Proxstream\'s Content and all intellectual property rights related to our Content are the exclusive property of Proxstream. Except as explicitly provided in these Terms, nothing in these Terms shall be deemed to create a license in or under any such intellectual property rights of Proxstream.',
      'You are granted a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use our Services and our Content for non-commercial use, subject to these Terms.',
    ],
    intro: 'You agree that you will not:',
    bullets: [
      'Copy, modify, disassemble, publish, adapt, sublicense, translate, sell, distribute, transmit, perform, display, reverse engineer, decipher, decompile, or otherwise disassemble any portion of our Content or our Services or cause others to do so;',
      '"Frame" or "mirror" any part of our Services or our Content without our prior written authorization;',
      'Use meta tags, code, or other devices containing any reference to Proxstream or our Services to direct any person to any other site for any purpose;',
      'Resell, rent, lease, loan, sublicense, distribute, or otherwise transfer or make any commercial use of our Services or our Content, including providing time-sharing or similar services to any third party;',
      'Use any data mining, robots, spiders, or similar data gathering or extraction methods or otherwise collect any pictures, descriptions, data, or other content from our Services;',
      'Forge headers or otherwise manipulate identifiers to disguise the origin of any information transmitted through our Services;',
      'Remove, circumvent, disable, damage, or otherwise interfere with security-related features of our Services, features that prevent or restrict use or copying of any content accessible through our Services, or features that enforce limitations on use of our Services;',
      'Delete the copyright and any other proprietary rights notices on our Services;',
      'Use any automated methods or processes to create Proxstream accounts or access our Services or our Content; or',
      'Use our Content or our Services other than for their intended purpose.',
    ],
    outro:
      'Any use of our Content or our Services other than as expressly authorized in these Terms, without the prior written consent of Proxstream, is strictly prohibited and will violate and terminate the license granted in these Terms. Such unauthorized use may also violate applicable laws, including without limitation copyright and trademark laws and applicable communications regulations and statutes. Unless explicitly stated in these Terms, nothing in these Terms shall be construed as conferring any license to intellectual property rights, whether by estoppel, implication, or otherwise. This license is revocable at any time and for any reason whatsoever and without notice.\n\nYou acknowledge that Proxstream may from time-to-time issue upgraded versions of our Services, and may automatically electronically upgrade the version of our Services that you are using. You consent to such automatic upgrading, and agree that these Terms will apply to all such upgrades. You agree that Proxstream will not be liable to you for any such upgrades.\n\nThe foregoing license granted under these Terms is not a sale of the Proxstream Services or any copy thereof, and Proxstream or its partners or suppliers retain all rights, title, and interest in the Proxstream Services (and any copy thereof). Any attempt by you to transfer any of the rights, duties, or obligations in these Terms, except as expressly provided for in these Terms, is void. Proxstream reserves all rights not expressly granted in these Terms.',
  },
  {
    title: '11. Trademarks',
    body: [
      '"Proxstream", Proxstream\'s logos, and any other trade names or slogans contained in the Proxstream Services are trademarks or service marks of Proxstream, its partners, or its licensors and may not be copied, imitated, or used, in whole or in part, without the prior written permission of Proxstream or the applicable trademark holder. Additionally, the look and feel of the Proxstream Services, including all page headers, custom graphics, button icons, and scripts, are the service marks, trademarks, and/or trade dress of Proxstream and may not be copied, imitated, or used, in whole or in part, without our prior written permission. All other trademarks, registered trademarks, product names, and company names or logos mentioned in the Proxstream Services are the property of their respective owners. Reference to any products, services, processes, or other information, by trade name, trademark, manufacturer, supplier, or otherwise does not constitute or imply endorsement, sponsorship, or recommendation by us.',
    ],
  },
  {
    title: '12. Advertising',
    body: [
      'We may place advertisements on our Services from time to time, and we reserve the right to do so. These advertisements may be adjacent to your User Content in some cases. You are not entitled to any compensation for such advertisements. The manner, mode, and extent of such advertisements are subject to change without specific notice to you.',
    ],
  },
  {
    title: '13. App Stores',
    body: [
      'You acknowledge and agree that the availability of the Proxstream Services depends on third parties from whom you downloaded the Proxstream app, such as Google Play or the Apple App Store. These Terms are between you and Proxstream, not with the third-party app store. Each third-party app store may have its own terms and conditions to which you must agree before downloading the Proxstream app. Your compliance with all applicable terms and conditions of the app store where you downloaded the Proxstream app is a condition of your license to use the Proxstream Services.',
    ],
  },
  {
    title: '14. Respecting Copyright',
    body: [
      'We respect the intellectual property of others and expect our Users to do the same. We may, in our sole discretion, disable or terminate Proxstream accounts of Users whom we believe may be infringing the intellectual property rights of others.',
      'You can review our Digital Millennium Copyright Act (DMCA) Takedown Policy for more information.',
    ],
  },
  {
    title: '15. Proxstream\'s Paid Services',
    intro: 'In our sole discretion, we may offer you the opportunity to purchase a number of our Paid Services as outlined below.',
    body: [
      'Payments. All purchases of Proxstream\'s Paid Services will be made by you through either your App Store Account, or through your PayPal Account, depending on the purchase. Proxstream does not receive or process payments or credit card information directly since all transactions are made through your Apple, Google, or PayPal Account. All purchases are final and non-refundable. The prices for our Paid Services are subject to change without notice.',
      'Virtual Currency and Virtual Goods. You may purchase Virtual Currency, for example our Proxstream Coins, for use within the Proxstream app. Proxstream Coins will be sold in packages containing a certain amount of Proxstream Coins per package. The price for each Proxstream Coins package will be displayed at the point of purchase.',
      'When you purchase Virtual Currency, you do not own it. Instead, you receive a limited right to use it for eligible products or services within the Proxstream app. For example, you may use Proxstream Coins to purchase Virtual Goods called Gifts for other Users during a live stream. Virtual Currency may not be redeemed for any sum of money or monetary value or for other physical goods. The price for each Gift will be displayed at the point of purchase. Gifts constitute a limited license to access a certain feature on Proxstream when, as, and if allowed by us. Gifts may not be redeemed for any sum of money or monetary value or for other physical goods.',
      'All purchases of Virtual Currency and Virtual Goods are final and we do not offer refunds for any purchased Virtual Currency or Virtual Good. We are not responsible for repairing or replacing any Virtual Currency or Virtual Good, or providing you with any credit or refund in the event that we modify, suspend, or terminate any Virtual Currency or Virtual Good, or for loss or damage due to any service error, or for any other reason.',
      'Purchases of Virtual Currency or Virtual Goods may not be sub-licensed and are non-transferable, even if they expire or are revoked or discontinued. We reserve the right to change the purchase price for Virtual Currency and Virtual Goods, as well as the ways you can use Virtual Currency and Virtual Goods within the Proxstream app, at any time and without notice. We reserve the right to revoke or stop issuing Virtual Currency and Virtual Goods at any time without notice, refund, or compensation to you, and to set expiration dates for any Virtual Currency and Virtual Good.',
      'Proxstream Gems. You may receive Gifts from other Users within the Proxstream app during a live stream. Currently when you receive a Gift from another User, we will also award you with a number of virtual Proxstream Gems in relation to that Gift. The amount of Proxstream Gems you receive per Gift will be determined by us, in our sole discretion, and is subject to change without notice. You agree that we have the absolute right to manage, revise, modify, suspend, discontinue, revoke, and/or eliminate Proxstream Gems in our sole discretion, at any time and for any reason, without notice or compensation to you. Proxstream Gems are non-transferable and non-refundable.',
      'You may redeem your Proxstream Gems for a set USD dollar amount based on minimum and maximum thresholds displayed at the point of redemption. You may only make one redemption request per twenty-four-hour period. We may change redemption minimum or maximum thresholds, redemption amounts, and redemption frequency from time to time and we reserve the right to do so at any time without notice to you.',
      'We may use PayPal, Venmo, or any other third-party payment vendor to send Proxstream Gem redemption payments to you. The third-party payment vendor we use will be indicated at the point of redemption. If you wish to redeem Proxstream Gems you must have a valid third-party payment vendor account, in good standing, and agree to that third party\'s Terms of Service, policies, and procedures. You will also be responsible for any fees or other charges that third party may impose on the payment. It is your responsibility to verify the correct information has been entered when connecting to your third-party payment vendor account. Proxstream is not responsible or liable for any lost payments, fraud, unauthorized payments, payment reversals, or refunds of Proxstream Gem redemption payments.',
      'You acknowledge and agree that Proxstream shall have no liability for the loss of Virtual Currency and/or Virtual Goods due to any unauthorized third-party activity, such as hacking, phishing, password mining, social engineering, and/or any other unauthorized third party\'s or other user\'s activity, including any unauthorized transactions. Proxstream may replace such lost Virtual Currency and/or Virtual Goods under certain circumstances, at its sole discretion on a case-by-case basis, without incurring any obligation or liability to you or any other user of our Services.',
      'We reserve the right to verify your identity and eligibility to receive Proxstream Gem redemption payments prior to payment. All Users who redeem Proxstream Gems are solely responsible for the reporting and payment of any and all taxes due on the amounts received.',
      'If your Proxstream account is terminated for any reason, either by you or Proxstream, you will lose all accumulated Virtual Currency, Virtual Goods, and Proxstream Gems without refund or other compensation to you. You agree that we will have no liability to you or any third party based on our exercise of our rights with respect to Virtual Currency, Virtual Goods, and Proxstream Gems.',
      'We reserve the right to revoke, suspend or otherwise limit your access to your Virtual Currency, Virtual Goods, or Proxstream Gems if we suspect, in our sole discretion, fraudulent, abusive or unlawful activity associated with your Proxstream account. We will not reinstate any Virtual Currency, Virtual Goods, or Proxstream Gems unless we believe, in our sole discretion, we have made an error.',
      'Proxstream has no obligation to continue offering any of our Paid Services including any feature or function that enables the use or redemption of Virtual Currency, Virtual Goods, or Proxstream Gems.',
      'Without limiting any of the foregoing, you may not reproduce, distribute, transfer, modify or otherwise use our Virtual Currency, Virtual Goods, or Proxstream Gems in any manner other than as expressly outlined in these Terms or expressly authorized by Proxstream in writing.',
    ],
  },
  {
    title: '16. Updates to These Terms',
    body: [
      'We may update these Terms at any time to reflect changes to our Services or business, for legal or regulatory reasons, or to prevent abuse on or off our Services. If these changes materially affect your use of our Services or your legal rights, we will provide reasonable advance notice, unless the updates are urgent. The Terms will always display the "Effective Date" at the top of the page, indicating when the last changes were made and when they take effect. You are responsible for regularly checking this page for any changes. Your continued use of our Services after the changes take effect signifies your agreement to the updated Terms. If you do not agree to the changes, you must stop using our Services.',
    ],
  },
  {
    title: '17. Indemnity by You',
    body: [
      'To the extent permitted under applicable law, you agree to indemnify, defend, and hold harmless Proxstream, our affiliates, and our respective officers, directors, shareholders, employees, contractors, and agents from and against any and all complaints, demands, claims, damages, losses, costs, liabilities, and expenses, including legal and accounting fees, arising out of or related in any way to your access to or use of our Services, your User Content, your conduct toward other Users, or your violation of these Terms.',
    ],
  },
  {
    title: '18. Disclaimers',
    body: [
      'TO THE FULLEST EXTENT PERMITTED BY LAW, PROXSTREAM PROVIDES OUR SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN) ON AN "AS IS" AND "AS AVAILABLE" BASIS. PROXSTREAM MAKES NO WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, WITH RESPECT TO OUR SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN), INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTIES OF SATISFACTORY QUALITY, MERCHANTABILITY, ACCURACY, QUIET ENJOYMENT, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
      'PROXSTREAM DOES NOT REPRESENT OR WARRANT THAT (A) YOUR USE OF THE PROXSTREAM SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN) WILL BE SECURE, UNINTERRUPTED, COMPLETE, ERROR-FREE, OR WILL MEET YOUR REQUIREMENTS; (B) ANY DEFECTS IN OUR SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN) WILL BE DISCOVERED OR CORRECTED; (C) OUR SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN) ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (D) ANY CONTENT OR INFORMATION YOU OBTAIN ON OR THROUGH OUR SERVICES WILL BE ACCURATE OR APPROPRIATE FOR YOUR PURPOSES. FURTHERMORE, PROXSTREAM MAKES NO GUARANTEES AS TO THE NUMBER OF ACTIVE USERS AT ANY TIME, USERS\' ABILITY OR DESIRE TO COMMUNICATE WITH YOU, OR THE CONDUCT OF USERS YOU MEET THROUGH OUR SERVICES.',
      'PROXSTREAM DISCLAIMS LIABILITY FOR, AND MAKES NO WARRANTY REGARDING, THE CONNECTIVITY AND AVAILABILITY OF OUR SERVICES (INCLUDING ALL CONTENT CONTAINED THEREIN) OR THE DELIVERY OF ANY COMMUNICATIONS.',
      'PROXSTREAM HAS NO OBLIGATION TO VERIFY THE IDENTITY OF OR SCREEN THE PERSONS USING OUR SERVICES, NOR TO MONITOR THE USE OF OUR SERVICES BY OTHER USERS. THEREFORE, PROXSTREAM DISCLAIMS ANY AND ALL LIABILITY FOR YOUR INTERACTIONS WITH AND THE CONDUCT OF OTHER USERS AND FOR IDENTITY THEFT OR ANY OTHER MISUSE OF YOUR IDENTITY OR INFORMATION.',
      'THE INFORMATION PRESENTED ON OR THROUGH OUR SERVICES IS MADE AVAILABLE SOLELY FOR INFORMATIONAL PURPOSES. PROXSTREAM DOES NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY INFORMATION ON OUR SERVICES OR ANY RESULTS FROM YOUR USE OF OUR SERVICES. PROXSTREAM DOES NOT ADOPT, ENDORSE, OR ACCEPT RESPONSIBILITY OR LIABILITY FOR THE CONDUCT OF ANY USERS OR FOR THE ACCURACY OR RELIABILITY OF ANY OPINION, ADVICE, OR STATEMENT MADE BY ANY PARTY OTHER THAN PROXSTREAM. UNDER NO CIRCUMSTANCES WILL PROXSTREAM BE RESPONSIBLE FOR ANY LOSSES, DAMAGES, OR HARM OF ANY KIND RESULTING FROM ANY USER\'S CONDUCT OR YOUR USE OF OUR SERVICES OR FROM ANYONE\'S RELIANCE ON INFORMATION OR OTHER CONTENT POSTED ON OUR SERVICES, OR TRANSMITTED TO OR BY ANY USERS.',
      'PROXSTREAM IS NOT RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER HARDWARE, SOFTWARE, OR OTHER EQUIPMENT OR TECHNOLOGY, INCLUDING, WITHOUT LIMITATION, DAMAGE FROM ANY SECURITY BREACH, VIRUS, BUGS, TAMPERING, HACKING, FRAUD, ERROR, OMISSION, INTERRUPTION, DEFECT, DELAY IN OPERATION OR TRANSMISSION, COMPUTER LINE OR NETWORK FAILURE, OR ANY OTHER TECHNICAL OR OTHER DISRUPTION OR MALFUNCTION.',
      'THE LAWS OF CERTAIN JURISDICTIONS OR STATES DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES. TO THE EXTENT SUCH WARRANTIES CANNOT BE DISCLAIMED UNDER THE LAWS OF YOUR JURISDICTION, WE LIMIT THE DURATION AND REMEDIES OF SUCH WARRANTIES TO THE FULL EXTENT PERMISSIBLE UNDER THOSE LAWS.',
      'THIS WARRANTY DOES NOT AFFECT ANY CONSUMER RIGHTS YOU MIGHT HAVE UNDER APPLICABLE LAW, INCLUDING THE LEGAL GUARANTEE IN CERTAIN PLACES SUCH AS THE EUROPEAN UNION THAT PRODUCTS AND SERVICES MUST COMPLY WITH THIS AGREEMENT AND YOUR RIGHTS IN CASE OF NON-CONFORMITY OF A PRODUCT OR SERVICE.',
    ],
  },
  {
    title: '19. Limitation of Liability',
    body: [
      'WE DO NOT EXCLUDE OR LIMIT OUR LIABILITY TO YOU WHERE IT WOULD BE ILLEGAL TO DO SO. IN COUNTRIES WHERE THE BELOW TYPES OF EXCLUSIONS ARE NOT ALLOWED, WE ARE RESPONSIBLE TO YOU ONLY FOR LOSSES AND DAMAGES THAT ARE A REASONABLY FORESEEABLE RESULT OF OUR FAILURE TO USE REASONABLE CARE AND SKILL OR OUR BREACH OF OUR CONTRACT WITH YOU. THIS SECTION DOES NOT AFFECT CONSUMER RIGHTS THAT CANNOT BE WAIVED OR LIMITED BY ANY CONTRACT OR AGREEMENT.',
      'IN COUNTRIES WHERE EXCLUSIONS OR LIMITATIONS OF LIABILITY ARE ALLOWED, NEITHER PROXSTREAM, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, SHAREHOLDERS, CONTRACTORS, AGENTS, LICENSORS, SUPPLIERS, OR SERVICE PROVIDERS INVOLVED IN CREATING, PRODUCING, OR DELIVERING OUR SERVICES WILL BE LIABLE, TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, FOR ANY DIRECT, SPECIAL, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, PUNITIVE, FIXED, ENHANCED, OR ANY OTHER DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF USE, PROFITS, DATA, GOODWILL, REVENUES, SAVINGS, BUSINESS OPPORTUNITY, OR OTHER INTANGIBLE LOSSES OR OTHER ECONOMIC LOSS, COMPUTER DAMAGE OR SYSTEM FAILURE, OR THE COST OF SUBSTITUTE SERVICES OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH THESE TERMS; OR FROM YOUR ACCESS TO OR USE OF, OR INABILITY TO ACCESS OR USE, OUR SERVICES; OR FROM THE CONDUCT OR USER CONTENT OF ANY USERS OR ANY CONTENT OF ANY THIRD PARTY ON OR THROUGH ANY OF OUR SERVICES; OR FROM ANY UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR USER CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, STATUTE, TORT (INCLUDING BUT NOT LIMITED TO NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT PROXSTREAM HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, EVEN IF A LIMITED REMEDY PROVIDED IN THESE TERMS IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.',
      'BESIDES THE TYPES OF LIABILITY, WE CANNOT LIMIT BY LAW (AS DESCRIBED IN THIS SECTION), PROXSTREAM LIMITS OUR LIABILITY TO YOU TO THE GREATER OF (A) THE AMOUNTS YOU HAVE PAID US IN THE THREE MONTHS BEFORE YOU FIRST ASSERT A CLAIM; OR (B) $100 USD (OR THE EQUIVALENT IN YOUR LOCAL CURRENCY).',
      'THE EXCLUSIONS AND LIMITATIONS OF DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN YOU AND PROXSTREAM.',
    ],
  },
  {
    title: '20. Dispute Resolution; Jurisdiction',
    body: [
      'All disputes, claims, or causes of action arising from or relating to your use of our Services, our content, and these Terms will be governed by the laws of the State of New York and the federal laws of the United States, excluding any conflicts of law principles.',
      'If arbitration as described below is prohibited by applicable law, you agree that all disputes, claims, or causes of action will be heard and resolved in a court of competent jurisdiction located in New York, New York, USA. You consent to the personal jurisdiction of such courts, agree to the convenience of the forum, and waive any objections to proceeding in such courts.',
      'Except where prohibited by law, any disputes, claims, or causes of action (whether in contract, tort, statute, regulation, or otherwise, and whether pre-existing, present, or future) arising out of or relating to these Terms or our Services (including all content) will be resolved by a sole arbitrator pursuant to the rules of the American Arbitration Association (AAA).',
      'Accordingly, except where prohibited by law, you waive any right to participate in any class action against Proxstream related to any disputes, claims, or causes of action, and agree to opt out of any class proceedings against Proxstream.',
      'To initiate arbitration, provide written notice at the address specified in the Contact Us section of these Terms. If Proxstream initiates arbitration, we will notify you at the email address provided during your Proxstream account registration.',
      'YOU AND PROXSTREAM AGREE THAT ANY DISPUTES, CLAIMS, OR CAUSES OF ACTION ARISING OUT OF OR RELATED TO THE PROXSTREAM SERVICES MUST COMMENCE WITHIN ONE (1) YEAR AFTER THE DISPUTE, CLAIM, OR CAUSE OF ACTION ACCRUES. OTHERWISE, IT IS PERMANENTLY BARRED.',
      'If you are a resident in any jurisdiction where the above provision is unenforceable, then any disputes, claims, or causes of action will be governed by and construed under the laws of your jurisdiction of residence, and resolved by competent civil courts within your jurisdiction of residence.',
    ],
  },
  {
    title: '21. Termination',
    intro:
      'Unless otherwise provided, these Terms take effect upon your initial use of the Proxstream Services and shall remain in effect until terminated as described below. Termination of your Proxstream account does not cancel any recurring subscriptions or payments. You are responsible for canceling any recurring subscriptions or payments through your app store or third-party processor account. If your Proxstream account is terminated by you or by Proxstream for any reason, you will not be entitled to any refunds for purchases already made.',
    subsections: [
      {
        heading: 'Termination by Proxstream',
        items: [
          'To the fullest extent permitted by applicable law, we reserve the right, in our sole discretion, to disable, block, suspend, deactivate, or terminate your Proxstream account and/or your access to some or all of our Services at any time, with or without notice, for any reason, including but not limited to:',
          'Your breach of these Terms or any of our policies;',
          'Your breach of any applicable laws or regulations;',
          'Your fraudulent use or misuse of our Services;',
          'Compliance with a legal requirement or court order;',
          'If we reasonably believe termination is necessary to prevent harm to you, us, other Users, or Third parties;',
          'Technical or legitimate business reasons preventing us from continuing to provide our Services to you.',
        ],
      },
      {
        heading: 'Termination by You',
        items: [
          'You are free to stop using Proxstream\'s Services at any time and for any reason. You can delete your Proxstream account through the Proxstream app.',
        ],
      },
      {
        heading: 'Survival',
        items: ['Any part of these Terms that by their nature should survive after termination will survive.'],
      },
    ],
  },
  {
    title: '22. Bug Reporting',
    body: [
      'We support the responsible reporting of security vulnerabilities and bugs. To report a security issue or bug, please email us at support@proxstream.com.',
    ],
  },
  {
    title: '23. Waiver',
    body: [
      'If we fail to exercise or enforce any right or provision of these Terms, it will not constitute a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by the relevant party.',
    ],
  },
  {
    title: '24. Severability',
    body: [
      'If any provision of these Terms is held to be unlawful, void, or for any reason unenforceable, that provision will be limited or eliminated to the minimum extent necessary and will not affect the validity and enforceability of any remaining provisions.',
    ],
  },
  {
    title: '25. Assignment',
    body: [
      'To the extent permitted by applicable law, these Terms, and any rights and licenses granted hereunder, may not be transferred or assigned by you, but may be assigned by Proxstream without restriction. Any assignment attempted to be made in violation of these Terms shall be void.',
    ],
  },
  {
    title: '26. Entire Agreement',
    body: [
      'These Terms, which incorporate our Privacy Policy, and our User Content and Conduct Policy, is the entire agreement between you and Proxstream relating to the subject matter herein and will not be modified except by a writing signed by authorized representatives of both parties, or by a change to these Terms made by Proxstream as set forth in Section 16 above.',
    ],
  },
  {
    title: '27. Language of These Terms',
    body: [
      'The language of these Terms is English. The English language version of these Terms will govern your relationship with Proxstream and your use of our Services.',
    ],
  },
  {
    title: '28. Contact Us',
    body: [
      'If you have any questions regarding these Terms or your use of our Services, please contact us at:',
      'Proxstream',
      'Email: support@proxstream.com',
    ],
  },
];

const TermsPage = () => {
  const { isDark } = useLandingTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  usePageSEO({
    title: 'Terms of Service | ProxStream Live Platform',
    description:
      'Read the Terms of Service for using ProxStream streaming app, agency portals, virtual currency, and creator services.',
    canonicalPath: '/terms',
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
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl"
            style={{ background: 'rgba(131,58,180,0.18)' }}
          />
          <div
            className="absolute top-10 right-0 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'rgba(253,29,29,0.12)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'rgba(252,176,69,0.14)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center flex flex-col items-center">
          <img src="/Logos/Logo.png" alt="Proxstream" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h1
            className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Proxstream Terms
          </h1>
          <p className={`text-sm md:text-base text-center ${isDark ? 'text-purple-300' : 'text-gray-500'}`}>
            Effective Date: March 13, 2025
          </p>
          <p className={`mt-3 text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We may update these Terms from time to time, so check this page regularly for updates.
          </p>
          <p className="mt-4 text-sm text-center">
            <Link
              to="/about"
              className="font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent hover:opacity-80"
            >
              Community Guidelines
            </Link>
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-8 md:px-16 pb-16 space-y-10">
        {SECTIONS.map((section) => (
          <article
            key={section.title}
            className={`rounded-2xl p-6 md:p-8 border transition-all ${
              isDark
                ? 'bg-[#130b20]/60 border-white/10 hover:border-purple-500/30 shadow-xl shadow-purple-950/20'
                : 'bg-white/90 border-purple-100 shadow-md shadow-purple-900/5'
            }`}
          >
            <h2
              className={`text-lg md:text-xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {section.title}
            </h2>

            {section.intro && (
              <p className={`text-sm md:text-base leading-relaxed mb-3 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {section.intro}
              </p>
            )}

            {section.body?.map((para) => (
              <p
                key={para.slice(0, 48)}
                className={`text-sm md:text-base leading-relaxed mb-3 last:mb-0 whitespace-pre-line ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {para}
              </p>
            ))}

            {section.bullets && (
              <ul className={`list-disc pl-5 space-y-2 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {section.bullets.map((item) => (
                  <li key={item.slice(0, 64)}>{item}</li>
                ))}
              </ul>
            )}

            {section.subsections?.map((sub) => (
              <div key={sub.heading} className="mt-4">
                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {sub.heading}
                </h3>
                <ul className={`list-disc pl-5 space-y-1.5 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {sub.items.map((item) => (
                    <li key={item.slice(0, 64)}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {section.outro && (
              <p className={`text-sm md:text-base leading-relaxed mt-4 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {section.outro}
              </p>
            )}
          </article>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
