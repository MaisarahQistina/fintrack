import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignInForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [id]: value };
      const isFormValid = updatedData.email.trim() !== '' && updatedData.password.trim() !== '';
      setIsValid(isFormValid);
      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      navigate('/my-expenses'); // Redirect to My Expenses page
    }
  };

  return (
    <form className="flex flex-col w-full mt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col w-full max-md:max-w-full">
        <label htmlFor="email" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya">
          Email Address
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
      </div>

      <div className="flex flex-col mt-5 w-full max-md:max-w-full">
        <label htmlFor="password" className="text-xl leading-none text-black mb-3 text-[20] font-abhaya">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="flex w-full bg-white rounded border border-solid border-neutral-200 min-h-[57px] px-4 text-base text-[18] font-abhaya"
            placeholder="Password"
            aria-label="Password"
          />
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b5d2af5f9874ea9de20745e58028cb75f564f5b290c4d91c88eaf70d18831526?placeholderIfAbsent=true&apiKey=dc1dfaeed34d4c05a46eb3603635944e"
            alt="eye icon"
            className="object-contain absolute right-4 top-1/2 transform -translate-y-1/2 w-5 aspect-square"
          />
        </div>
      </div>

      <button
        type="submit"
        className={`flex justify-center items-center px-6 py-4 mt-4 w-full rounded-lg text-base font-semibold ${isValid ? 'bg-[#2B613B] text-white' : 'bg-gray-200 text-neutral-400 cursor-not-allowed'}`}
        disabled={!isValid}
      >
        Sign In
      </button>
    </form>
  );
}
