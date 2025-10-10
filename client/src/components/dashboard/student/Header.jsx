import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import college_logo  from '../../../assets/main/College_logo.webp'
import iqarena  from '../../../assets/main/icon.png'


const API_BASE = import.meta.env.VITE_API_BASE;
const Header = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success && data.profile?.name) {
          setUserName(data.profile.name);
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  return (
    <>
      <div className="bg-background border-b border-border p-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <img src={college_logo} alt="" width={100} />
            </div>
            <div>
                <h2 className='text-orange-500 font-[800]'>
                    NADAR SARASWATHI COLLEGE OF ENGINEERING & TECHNOLOGY 
                </h2>
            </div>
           <div>
              <img src={iqarena} alt="" width={80} />
            </div>
            
            <div className='Logout'>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  window.location.reload();
                }}
                aria-label="Logout"
                className='bg-gray-200 '
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ff8800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-log-out">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
