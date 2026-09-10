import React from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import { Shield, AlertTriangle, Eye, Lock, Ban, HeartHandshake, Mail, MessageSquare } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans leading-relaxed selection:bg-purple-500 selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* ─── HERO BANNER (Matching Image 2) ─────────────────────────────────── */}
      <section className="relative pt-20 overflow-hidden">
        <div className="relative min-h-[380px] md:min-h-[440px] flex items-center justify-center">
          {/* Hero Background Image (Hands Joined over desk) */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80" 
              alt="Community & Safety" 
              className="w-full h-full object-cover"
            />
            {/* Warm dark overlay for text contrast matching Image 2 */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/60" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-white text-left w-full">
            {/* Logo Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl md:text-5xl font-black tracking-tight text-white font-sans">
                Proxstream
              </span>
            </div>

            {/* Subtitle */}
            <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100 max-w-3xl">
              India's best 24x7 live streaming mobile application
            </h1>

            {/* Subtext */}
            <p className="text-sm md:text-base text-gray-200 max-w-2xl font-normal leading-relaxed">
              proxstream.com is committed to user safety, and continues to develop more proactive user tools and resources to facilitate the combat of problems as they arise. Please see our policies outlined below.
            </p>
          </div>

          {/* Side Support Badge (Sticky right tab from Image 2) */}
          <button 
            onClick={() => alert("Support Team: Contact us at complaints@proxstream.com")}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 px-1.5 rounded-l-md shadow-2xl tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 cursor-pointer border-y border-l border-purple-400"
          >
            Support
          </button>
        </div>
      </section>

      {/* ─── MAIN CONTENT BODY ──────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Human Moderator Intro Text */}
        <section className="text-gray-700 text-sm md:text-base leading-relaxed border-b border-gray-100 pb-8">
          <p>
            proxstream.com employs a group of human moderators around the globe, 24 hours per day, 7 days a week. Our group of mediators work both proactively and responsively, reacting to user reports. If a user is observed violating the application's Community Guidelines, they are liable to quick suspension or restriction from the application. To additionally be related to law authorization and different districts to aid criminal and wellbeing related examinations to the furthest reaches of the law, without damaging user privacy.
          </p>
        </section>

        {/* Primary Heading */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            How proxstream.com is protecting its community:
          </h2>

          {/* Policy 1: No Nudity or Sexual Content */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Nudity or Sexual Content
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              proxstream.com expressly forbids our broadcasters from engaging in, or broadcasting any of the following sex-related content that promotes sexual activity, exploitation and/or assault. Sexually implied content or activities are also prohibited, although additional content may be permitted for educational content or pre-approved, but in each case, additional restrictions must be observed. Anything related to minors should be cautious and prohibit any content involving minor eroticism. We reserve the right to report misuse of inappropriate content to relevant law enforcement agencies.
            </p>
          </div>

          {/* Policy 2: No Bullying & Harassment */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Bullying & Harassment
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Regardless of whether the target is on proxstream.com, we prohibit the use of proxstream.com for all bullying, harassment and hate speech. We do not allow individuals, communities or organizations that perform such behavior to use our services. The type of this content, including but not limited to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Discriminatory or humiliating remarks based on: race or ethnic origin, religion or faith, disability, gender, age, nationality, appearance or physical attributes, or sexual orientation/gender identity.</li>
              <li>Displaying altered images of an individual meant to degrade that individual, or sharing photos or videos of physical bullying of a person for the purpose of shaming the victim.</li>
              <li>Sharing/displaying personal info of an individual for the purpose of blackmail or harassment.</li>
              <li>Profanity and/or vulgarity of any kind.</li>
            </ul>
          </div>

          {/* Community Visual Banner Break */}
          <div className="my-10 bg-gradient-to-r from-purple-900 via-indigo-900 to-black rounded-2xl p-8 text-white text-center shadow-xl space-y-6">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Broadcast yourself & connect with the world
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden shadow-lg border border-white/20 h-44">
                <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80" alt="Broadcast" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border border-white/20 h-44">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Connect" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border border-white/20 h-44">
                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80" alt="World" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Policy 3: No Illegal or Criminal Activities */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Illegal or Criminal Activities
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Contenting connection with the use, mention or display of illicit drugs and/or drug paraphernalia is strictly prohibited. Content highlighting tobacco and/or alcohol consumption by users is also strongly discouraged on proxstream.com. Use good judgment, as we reserve the right to punish the account and work with law enforcement when we believe there is a legitimate risk of physical harm or direct threat to public safety, including but not limited to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Content in connection with the use, mention or display of illicit drugs and/or drug paraphernalia.</li>
              <li>Smoking or drinking during a broadcast.</li>
              <li>Cause physical or financial harm to people, animals, property, or businesses directly or indirectly.</li>
              <li>Used by or in the presence of a minor during a broadcast.</li>
            </ul>
          </div>

          {/* Policy 4: No Violence */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Violence
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              proxstream.com has zero tolerance for attempts or threats to harm or kill others. You are ultimately responsible for your own physical and psychological health and well-being, but as a community, we must be respectful of others who may be disturbed or offended by your Content or message. Therefore, we strictly prohibit the following behaviors, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Advocate or encourage suicide and self-injury.</li>
              <li>Promote or encourage physical violence, sensational or shocking acts that tend to cause harm or discomfort towards yourself / others / child or animals.</li>
              <li>Dangerous or distracted driving.</li>
              <li>Over-focusing on extreme or unreasonable bloody or violent content..</li>
            </ul>
          </div>

          {/* Policy 5: No Private Content */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Private Content
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              proxstream.com respects the privacy of others, and we work hard to ensure that the information you share with us is secure. Determinations of unauthorized private Content will be determined on a case-by-case basis by proxstream.com in our sole discretion. Please do the same and refrain from the use of Content which invades another person’s privacy or which divulges their private or confidential information. Examples of private information may include, but not limited to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Personal addresses or locations that are considered or treated private, and/or non-public personal phone numbers and email addresses.</li>
              <li>Social security or other national identity numbers or credit card information.</li>
              <li>Intimate videos or photos taken or distributed without the subject’s consent.</li>
              <li>Videos or images that are considered private under applicable laws.</li>
            </ul>
          </div>

          {/* Policy 6: No Spamming */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-400 tracking-wide">
              No Spamming
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              proxstream.com prohibits users from making commercial profit through our platform. Please do not use misleading or incorrect information, and please avoid the following behaviors, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Deliberately collect likes, tracking Numbers, free virtual currency, or contact other users for commercial purposes without consent.</li>
              <li>Advertise any product or service, whether it is legal or illegal, through live content or any user information, fields, etc.</li>
              <li>Publish or distribute unauthorized ads, duplicate messages, or user reports.</li>
              <li>Phishing.</li>
              <li>Spread malware or viruses.</li>
              <li>Sell or share user accounts;</li>
              <li>Resell proxstream.com services or features.</li>
            </ul>
          </div>

          {/* Policy 7: Reporting Abuses and Complaints */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 tracking-wide">
              Reporting Abuses and Complaints.
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              proxstream.com is a community, we rely heavily on all of your support and we welcome you to report any content or activity that you believe may be in violation of our Guidelines at{' '}
              <a href="mailto:complaints@proxstream.com" className="text-purple-600 font-semibold hover:underline">
                complaints@proxstream.com
              </a>
              . We take your reports very seriously, and in most cases, will ask you for information, please understand and follow the following specifications:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-gray-600">
              <li>Please tell us why you think that content should be removed (e.g., whether the content involves sexual, illegal or violent acts), and attach a screenshot/Screen Recording and User ID to support.</li>
            </ul>
          </div>

        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
