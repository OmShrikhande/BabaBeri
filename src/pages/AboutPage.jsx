import React, { useState } from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import SupportContactModal from '../components/SupportContactModal';
import { useLandingTheme } from '../context/LandingThemeContext';
import usePageSEO from '../hooks/usePageSEO';

const AboutPage = () => {
  const { isDark } = useLandingTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  usePageSEO({
    title: 'About ProxStream | Leading Live Streaming & Creator Community',
    description:
      'Learn about ProxStream, our mission to empower live creators worldwide, safety standards, interactive PK battles, and next-generation broadcasting technology.',
    canonicalPath: '/about',
  });

  const muted = isDark ? 'text-purple-300 font-semibold' : 'text-purple-900 font-bold';
  const body = isDark ? 'text-gray-300' : 'text-gray-700';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const cardBg = isDark
    ? 'bg-[#130b20]/60 border-white/10 hover:border-purple-500/30 shadow-xl shadow-purple-950/20'
    : 'bg-white/90 border-purple-100 shadow-md shadow-purple-900/5';
  const softBorder = isDark ? 'border-white/10' : 'border-purple-100';

  return (
    <div
      className={`min-h-screen font-sans leading-relaxed transition-colors duration-300 ${
        isDark
          ? 'bg-[#0c0714] text-gray-100 selection:bg-fuchsia-500/40 selection:text-white'
          : 'bg-[#faf8fc] text-gray-800 selection:bg-purple-500 selection:text-white'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(131,58,180,0.25), transparent), radial-gradient(ellipse 60% 40% at 95% 10%, rgba(253,29,29,0.16), transparent), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(252,176,69,0.12), transparent)'
          : 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(131,58,180,0.06), transparent), radial-gradient(ellipse 60% 40% at 95% 10%, rgba(253,29,29,0.04), transparent), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(252,176,69,0.05), transparent)',
      }}
    >
      <Navbar />
      <SupportContactModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      <section className="relative pt-20 overflow-hidden">
        <div className="relative min-h-[380px] md:min-h-[440px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
              alt="Community & Safety"
              className="w-full h-full object-cover filter brightness-[0.75]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0714]/90 via-[#0c0714]/70 to-[#0c0714]/80" />
            <div
              className="absolute inset-0 opacity-40 mix-blend-overlay"
              style={{
                background:
                  'linear-gradient(135deg, rgba(131,58,180,0.5) 0%, rgba(253,29,29,0.3) 50%, rgba(252,176,69,0.35) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-8 md:px-16 py-12 text-white text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <img src="/Logos/Logo.png" alt="Proxstream" className="w-8 h-8 object-contain" />
              <span className="text-xl md:text-2xl font-black tracking-tight text-white font-sans">
                Proxstream
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight max-w-3xl text-center">
              India's best 24x7 live streaming mobile application
            </h1>

            <p className="text-base md:text-lg text-gray-200 font-normal leading-relaxed max-w-2xl text-center">
              Proxstream is committed to user safety, and continues to develop more proactive user tools and
              resources to facilitate the combat of problems as they arise. Please see our policies outlined
              below.
            </p>
          </div>

          <button
            onClick={() => setSupportOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 text-white font-bold text-xs py-3.5 px-2 rounded-l-xl shadow-2xl tracking-widest uppercase [writing-mode:vertical-lr] cursor-pointer border-y border-l border-white/30 hover:scale-105 transition-all duration-200"
            style={{
              background: 'linear-gradient(180deg, #833AB4 0%, #FD1D1D 55%, #FCB045 100%)',
              boxShadow: '0 10px 25px rgba(236,72,153,0.4)',
            }}
          >
            Support
          </button>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-8 md:px-16 py-12 space-y-10">
        <section
          className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all ${cardBg}`}
        >
          <p className={`text-base md:text-lg leading-relaxed ${body}`}>
            Proxstream employs a group of human moderators around the globe, 24 hours per day, 7 days a week.
            Our group of mediators work both proactively and responsively, reacting to user reports. If a user
            is observed violating the application&apos;s Community Guidelines, they are liable to quick
            suspension or restriction from the application. To additionally be related to law authorization and
            different districts to aid criminal and wellbeing related examinations to the furthest reaches of
            the law, without damaging user privacy.
          </p>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#833AB4] via-[#FD1D1D] to-[#FCB045]" />
            <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${heading}`}>
              How Proxstream is protecting its community:
            </h2>
          </div>

          {[
            {
              title: 'No Nudity or Sexual Content',
              text: 'Proxstream expressly forbids our broadcasters from engaging in, or broadcasting any of the following sex-related content that promotes sexual activity, exploitation and/or assault. Sexually implied content or activities are also prohibited, although additional content may be permitted for educational content or pre-approved, but in each case, additional restrictions must be observed. Anything related to minors should be cautious and prohibit any content involving minor eroticism. We reserve the right to report misuse of inappropriate content to relevant law enforcement agencies.',
            },
            {
              title: 'No Bullying & Harassment',
              text: 'Regardless of whether the target is on Proxstream, we prohibit the use of Proxstream for all bullying, harassment and hate speech. We do not allow individuals, communities or organizations that perform such behavior to use our services. The type of this content, including but not limited to the following:',
              list: [
                'Discriminatory or humiliating remarks based on: race or ethnic origin, religion or faith, disability, gender, age, nationality, appearance or physical attributes, or sexual orientation/gender identity.',
                'Displaying altered images of an individual meant to degrade that individual, or sharing photos or videos of physical bullying of a person for the purpose of shaming the victim.',
                'Sharing/displaying personal info of an individual for the purpose of blackmail or harassment.',
                'Profanity and/or vulgarity of any kind.',
              ],
            },
          ].map((block) => (
            <div
              key={block.title}
              className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all ${cardBg}`}
            >
              <h3 className={`text-xl font-bold tracking-wide mb-3 ${muted}`}>{block.title}</h3>
              <p className={`text-sm md:text-base leading-relaxed ${body}`}>{block.text}</p>
              {block.list && (
                <ul className={`mt-4 list-disc pl-6 space-y-2 text-sm md:text-base ${body}`}>
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div
            className="my-10 rounded-2xl p-8 text-white text-center shadow-2xl space-y-6 border border-white/20 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(131,58,180,0.9) 0%, rgba(253,29,29,0.85) 50%, rgba(252,176,69,0.8) 100%)',
            }}
          >
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <h3 className="relative z-10 text-2xl md:text-3xl font-black tracking-tight">
              Broadcast yourself & connect with the world
            </h3>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
              ].map((src) => (
                <div key={src} className="rounded-xl overflow-hidden shadow-xl border border-white/30 h-48 group">
                  <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </div>

          {[
            {
              title: 'No Illegal or Criminal Activities',
              text: 'Content in connection with the use, mention or display of illicit drugs and/or drug paraphernalia is strictly prohibited. Content highlighting tobacco and/or alcohol consumption by users is also strongly discouraged on Proxstream. Use good judgment, as we reserve the right to punish the account and work with law enforcement when we believe there is a legitimate risk of physical harm or direct threat to public safety, including but not limited to the following:',
              list: [
                'Content in connection with the use, mention or display of illicit drugs and/or drug paraphernalia.',
                'Smoking or drinking during a broadcast.',
                'Cause physical or financial harm to people, animals, property, or businesses directly or indirectly.',
                'Used by or in the presence of a minor during a broadcast.',
              ],
            },
            {
              title: 'No Violence',
              text: 'Proxstream has zero tolerance for attempts or threats to harm or kill others. You are ultimately responsible for your own physical and psychological health and well-being, but as a community, we must be respectful of others who may be disturbed or offended by your Content or message. Therefore, we strictly prohibit the following behaviors, including but not limited to:',
              list: [
                'Advocate or encourage suicide and self-injury.',
                'Promote or encourage physical violence, sensational or shocking acts that tend to cause harm or discomfort towards yourself / others / child or animals.',
                'Dangerous or distracted driving.',
                'Over-focusing on extreme or unreasonable bloody or violent content.',
              ],
            },
            {
              title: 'No Private Content',
              text: 'Proxstream respects the privacy of others, and we work hard to ensure that the information you share with us is secure. Determinations of unauthorized private Content will be determined on a case-by-case basis by Proxstream in our sole discretion. Please do the same and refrain from the use of Content which invades another person\'s privacy or which divulges their private or confidential information. Examples of private information may include, but not limited to the following:',
              list: [
                'Personal addresses or locations that are considered or treated private, and/or non-public personal phone numbers and email addresses.',
                'Social security or other national identity numbers or credit card information.',
                'Intimate videos or photos taken or distributed without the subject\'s consent.',
                'Videos or images that are considered private under applicable laws.',
              ],
            },
            {
              title: 'No Spamming',
              text: 'Proxstream prohibits users from making commercial profit through our platform. Please do not use misleading or incorrect information, and please avoid the following behaviors, including but not limited to:',
              list: [
                'Deliberately collect likes, tracking Numbers, free virtual currency, or contact other users for commercial purposes without consent.',
                'Advertise any product or service, whether it is legal or illegal, through live content or any user information, fields, etc.',
                'Publish or distribute unauthorized ads, duplicate messages, or user reports.',
                'Phishing.',
                'Spread malware or viruses.',
                'Sell or share user accounts;',
                'Resell Proxstream services or features.',
              ],
            },
          ].map((block) => (
            <div
              key={block.title}
              className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all ${cardBg}`}
            >
              <h3 className={`text-xl font-bold tracking-wide mb-3 ${muted}`}>{block.title}</h3>
              <p className={`text-sm md:text-base leading-relaxed ${body}`}>{block.text}</p>
              {block.list && (
                <ul className={`mt-4 list-disc pl-6 space-y-2 text-sm md:text-base ${body}`}>
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all ${cardBg}`}>
            <h3 className={`text-xl font-bold tracking-wide mb-3 ${heading}`}>
              Reporting Abuses and Complaints.
            </h3>
            <p className={`text-sm md:text-base leading-relaxed ${body}`}>
              Proxstream is a community, we rely heavily on all of your support and we welcome you to report any
              content or activity that you believe may be in violation of our Guidelines at{' '}
              <a
                href="mailto:complaints@proxstream.com"
                className="font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent hover:opacity-80"
              >
                complaints@proxstream.com
              </a>
              . We take your reports very seriously, and in most cases, will ask you for information, please
              understand and follow the following specifications:
            </p>
            <ul className={`mt-4 list-disc pl-6 space-y-2 text-sm md:text-base ${body}`}>
              <li>
                Please tell us why you think that content should be removed (e.g., whether the content involves
                sexual, illegal or violent acts), and attach a screenshot/Screen Recording and User ID to
                support.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

