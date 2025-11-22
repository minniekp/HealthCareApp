import { Eye, EyeOff, AlertCircle } from "lucide-react";

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  icon: Icon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  required = false,
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        )}
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`input-field ${Icon ? "pl-10" : "pl-4"} ${
            showPasswordToggle ? "pr-10" : "pr-4"
          } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;

