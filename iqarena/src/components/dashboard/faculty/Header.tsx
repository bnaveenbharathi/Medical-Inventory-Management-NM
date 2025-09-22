import React from 'react'
import { Button } from "@/components/ui/button";
import college_logo  from '../../../assets/main/College_logo.webp'
import iqarena  from '../../../assets/main/icon.png'

const Header = () => {
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
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
