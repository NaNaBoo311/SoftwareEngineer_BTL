import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const _handleSignin = async (e) => {
    e.preventDefault(); // stop page refresh
    const fullEmail = `${email}@hcmut.edu.vn`;

    try {
      const data = await authService.signIn(fullEmail, password);
      
      // Get user profile to check role
      const userProfile = await authService.getUserProfile();
      
      // Navigate based on user role
      if (userProfile.role === "student") {
        navigate("/student-home");
      } else {
        navigate("/tutor-home");
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };
  return (
    <div className="h-screen bg-[#eee] flex flex-col items-center justify-start overflow-hidden">
      {/* White Container  */}
      <div className="bg-white shadow-lg w-full max-w-6xl">
        {/* Header  */}
        <div className="bg-[#210F7A] text-white px-2 py-3 flex items-center">
          <img src="/assets/bk_logo.png" className="h-12 w-12 mr-2" />
          <h1 className="font-semibold text-[2em] ml-5">
            Central Authentication Service
          </h1>
        </div>
        {/* Content  */}
        <div className="flex p-4">
          {/* Left: Login form */}
          <div className="bg-[#eee] w-[420px] mr-5 p-4 rounded-md">
            {/* Login Form Header */}
            <h2 className="text-xl font-bold mb-4 text-[#990033]">
              Enter your Username and Password
            </h2>
            <form className="flex flex-col space-y-4">
              {/* Username  */}
              <input
                type="text"
                placeholder="Username"
                className="p-2 border rounded-md bg-[rgb(232,240,254)] placeholder-shown:bg-[rgb(232,240,254)] not-placeholder-shown:bg-[#FFFFDD]"
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                className="p-2 border rounded-md bg-[rgb(232,240,254)] placeholder-shown:bg-[rgb(232,240,254)] not-placeholder-shown:bg-[#FFFFDD]"
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Checkbox */}
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2 h-4 w-4" />
                <label htmlFor="remember" className="text-sm text-[#777]">
                  Warn me before logging me into other sites.
                </label>
              </div>
              {/* Sign In Button (original color is #006DCC) */}
              <button
                type="submit"
                className="bg-[#210F7A] text-white py-2 rounded-md hover:bg-[#1a0d5c]"
                onClick={_handleSignin}
              >
                Sign In
              </button>
              {/* Change Password link-like text */}
              <button
                type="button"
                className="mt-2 text-xs text-blue-600 hover:underline self-start"
                onClick={() => {}}
              >
                Change Password?
              </button>
            </form>
          </div>
          {/* Right side */}
          <div className="flex-1 bg-gray-50 rounded-md p-4">
            {/* Please Note */}
            <h2 className="text-lg font-bold text-[#990033] mb-2">
              Please Note
            </h2>
            <div className="ml-4 space-y-2 text-sm text-gray-700">
              <p className="max-w-[1020px] text-black">
                The Login page enables single sign-on to multiple websites at
                HCMUT. This means that you only have to enter your user name and
                password once for websites that subscribe to the Login page.
              </p>
              <p className="max-w-[1020px] text-black">
                You will need to use your HCMUT Username and password to login
                to this site. The "HCMUT" account provides access to many
                resources including the HCMUT Information System, e-mail, ...
              </p>
              <p className="max-w-[1020px] text-black">
                For security reasons, please Exit your web browser when you are
                done accessing services that require authentication!
              </p>
            </div>
            {/* Technical Support */}
            <div className="mt-6">
              <h2 className="text-lg font-bold text-[#990033] mb-2">
                Technical Support
              </h2>
              <div className="ml-4 text-sm text-black">
                <p>
                  E-mail:{" "}
                  <a
                    href="mailto:youremail@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    an.pham3101@hcmut.edu.vn
                  </a>{" "}
                  <span className="ml-6">Tel: (+84) 123 456 789</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (Copy Right) */}
      <div className="w-full max-w-6xl px-4 py-3 text-gray-500 text-xs">
        Copyright © 2011 - 2012 Ho Chi Minh University of Technology. All rights
        reserved.
      </div>
    </div>
  );
}
