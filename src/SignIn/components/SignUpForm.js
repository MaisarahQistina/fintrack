import React, { useState } from 'react';

export function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isValid, setIsValid] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [id]: value };

      // Validate form fields
      const isFormValid =
        updatedData.fullName.trim() !== '' &&
        updatedData.dob.trim() !== '' &&
        updatedData.email.trim() !== '' &&
        updatedData.password.trim() !== '' &&
        updatedData.confirmPassword.trim() !== '' &&
        updatedData.password === updatedData.confirmPassword; // Ensure passwords match

      setIsValid(isFormValid);
      return updatedData;
    });
  };

  return (
    <form className="flex flex-col flex-1 shrink self-stretch w-full basis-0 min-h-[600px] max-md:max-w-full">
      <div className="flex flex-col mt-4 w-full max-md:max-w-full">
        <label htmlFor="fullName" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
          placeholder="Full Name"
          aria-label="Full Name"
        />

        <label htmlFor="dob" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya mt-5">
          Date of Birth
        </label>
        <input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
          aria-label="Date of Birth"
        />

        <label htmlFor="email" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya mt-5">
          Enter your email address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
          placeholder="Email address"
          aria-label="Email address"
        />

        <label htmlFor="password" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya mt-5">
          Enter your password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
          placeholder="Password"
          aria-label="Password"
        />

        <label htmlFor="confirmPassword" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya mt-5">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
          placeholder="Confirm Password"
          aria-label="Confirm Password"
        />
      </div>

      <button
        type="submit"
        className={`flex justify-center items-center px-6 py-4 mt-4 w-full rounded-lg text-base font-semibold ${isValid ? 'bg-[#2B613B] text-white' : 'bg-gray-200 text-neutral-400 cursor-not-allowed'}`}
        disabled={!isValid}
      >
        Sign Up
      </button>
    </form>
  );
}
