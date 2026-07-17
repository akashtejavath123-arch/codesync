import React from 'react'
import codesync from '../assets/code-sync.png'
import { useNavigate } from 'react-router-dom';
import { AuthData } from '../context/Authcontext';


const Home = () => {

  const companyLogos = ["slack", "framer", "netflix", "google", "linkedin", "instagram", "facebook"];
  const logoStyles = `
        .marquee-inner {
            animation: marqueeScroll linear infinite;
        }

        @keyframes marqueeScroll {
            0% {
                transform: translateX(0%);
            }
            100% {
                transform: translateX(-50%);
            }
        }
    `;

  const { login, isAuth } = AuthData();
  const navigate = useNavigate();

  const googleLogin = async () => {
    if(!isAuth){
      await login();
    }
    navigate('/collaboration')
  };


  return (
    <div>

      {/* herosection */}
      <div className="flex flex-col items-center max-md:px-2 bg-black text-white text-sm pb-50 pt-8 bg-[url(https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/green-gradient-bg.svg)] bg-top bg-no-repeat">

        <div className="flex items-center mt-24">
          <div className="flex -space-x-3 pr-3">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-1" />
            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="user1" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-2" />
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="user2" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-3" />
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-4" />
            <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="user5" className="size-8 rounded-full border-2 border-white hover:-translate-y-0.5 transition z-5" />
          </div>

          <div>
            <div className="flex ">
              {Array(5).fill(0).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-transparent fill-[#4aed88]" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Used by 10,000+ users
            </p>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl text-center font-semibold max-w-4xl mt-5 bg-linear-to-r from-white to-[#748298] text-transparent bg-clip-text">
          Collaborate on Code in Real-Time Seamless, Fast & Secure
        </h1>

        <p className="text-slate-300 md:text-base max-md:px-2 text-center max-w-2xl mt-5 ">
          Experience a fast and interactive real-time coding environment built for teams, classrooms, and pair-programming. Create or join rooms, collaborate with teammates, and write code together in one clean and powerful editor.
        </p>

        <div className="flex items-center gap-2 mt-8 text-sm">
          <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 transition rounded-full cursor-pointer" onClick={googleLogin}>
            Get Started
          </button>
          <button className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-6 py-2.5 cursor-pointer">
            <span>Learn More</span>
            <svg className="mt-0.5" width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.25.5 4.75 4l-3.5 3.5" stroke="currentColor" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>


        {/* companies */}
        <p className="text-slate-300 md:text-base max-md:px-2 text-center max-w-2xl mt-24">
          Inspired by collaboration tools used in leading tech companies
        </p>

        <style>{logoStyles}</style>
        <div className="overflow-hidden w-full relative max-w-4xl mx-auto select-none mt-5">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-linear-to-r " />
          <div className="marquee-inner flex will-change-transform min-w-[200%]" style={{ animationDuration: "15s" }}>
            <div className="flex">
              {[...companyLogos, ...companyLogos].map((company, index) => (
                <img key={index} src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                  alt={company} className="w-full h-full object-cover mx-6" draggable={false} />
              ))}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-linear-to-l " />
        </div>

      </div>


      <div className='bg-black text-white bg-[url(https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/green-gradient-bg.svg)] bg-top bg-no-repeat flex flex-col'>

        {/* how it works */}
        <div className='py-5'>
          <h1 className="text-3xl font-semibold text-center mx-auto">How It Works</h1>

          <p className="text-sm text-slate-300 text-center mt-2 max-w-lg mx-auto">
            Start collaborating in just a few simple steps - fast, seamless, and built for teams.
          </p>

          <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-8 md:px-0 py-10 md:pt-20">

            <div className="py-10 border-b md:py-0 md:border-r md:border-b-0 md:px-10">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
                <span className='text-green-700 font-bold text-2xl'>1</span>
              </div>
              <div className="mt-5 space-y-2">
                <h3 className="text-base font-medium text-white">Create a Room</h3>
                <p className="text-sm text-slate-300">Go to Collaboration tab and generate a new room instantly with a single click.</p>
              </div>
            </div>

            <div className="py-10 border-b md:py-0 lg:border-r md:border-b-0 md:px-10">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
                <span className='text-green-700 font-bold text-2xl'>2</span>
              </div>
              <div className="mt-5 space-y-2">
                <h3 className="text-base font-medium text-white">Share the Room ID</h3>
                <p className="text-sm text-slate-300">Send the unique ID to your teammates or friends.</p>
              </div>
            </div>

            <div className="py-10 border-b md:py-0 md:border-b-0 md:px-10">
              <div className="size-10 p-2 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center">
                <span className='text-green-700 font-bold text-2xl'>3</span>
              </div>
              <div className="mt-5 space-y-2">
                <h3 className="text-base font-medium text-white">Start Collaborating</h3>
                <p className="text-sm text-slate-300">Code together in real time with live sync powered by Socket.io.</p>
              </div>
            </div>

          </div>
        </div>

        {/* footer */}
        <footer className="flex flex-col items-center justify-center w-full py-15">
          <img src={codesync} alt="codesync" className='h-[70px]' />

          <p className="mt-4 text-center">Copyright © 2025 <a href="https://prebuiltui.com">CodeSync</a>. All rights reservered.</p>

          <div className="flex items-center gap-4 mt-5">
            <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6M6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 18c-4.51 2-5-2-7-2" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </footer>

      </div>

    </div>
  )
}

export default Home