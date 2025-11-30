import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PasswordInput = ({id,
  name,
  value,
  onChange,
  placeholder = '',
  className = '',
  label,
  autoComplete,
  required = false,}) => {
    
    const [show, setShow] = useState(false);

    return ( 
        <div>
      {label && <label htmlFor={id} className="block mb-1 text-gray-700 font-medium">{label}</label>}
      <div className="relative">
        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          type={show ? 'text' : 'password'}
          className={`w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${className}`}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
     );
}

export default PasswordInput;
