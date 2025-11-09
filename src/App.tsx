import { useState, useRef } from "react";
const App = () => {
  const [unit, setUnit] = useState("%"); // '%' or 'px'
  const [value, setValue] = useState(0);
  const [displayValue, setDisplayValue] = useState("0");
  const lastValidValue = useRef(0);
  // console.log("Last valid value:", lastValidValue.current);

  const parseInputValue = (input: string): string => {
    // đổi dấu phẩy thành dấu chấm
    let processed: string = input.replace(/,/g, ".");

    // lấy chuỗi số hợp lệ từ đầu (bao gồm dấu - và . nếu phù hợp)
    const match: RegExpMatchArray | null =
      processed.match(/^[-]?\d*(?:\.\d*)?/);
    processed = match ? match[0] : "";

    return processed;
  };

  const validateValue = (val: string): number => {
    const numValue: number = parseFloat(val);

    // Nếu không phải số hợp lệ, trả về giá trị hợp lệ gần nhất
    if (isNaN(numValue)) {
      return lastValidValue.current;
    }

    // Nếu < 0, đặt về 0
    if (numValue < 0) {
      return 0;
    }

    // Nếu unit là % và > 100, đặt về lastValidValue hoặc 100
    if (unit === "%" && numValue > 100) {
      return lastValidValue.current <= 100 ? lastValidValue.current : 100;
    }

    return numValue;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const processed = parseInputValue(input);
    const numValue = parseFloat(processed);

    // Nếu là số hợp lệ → cập nhật lastValidValue ngay lúc gõ
    if (!isNaN(numValue)) {
      lastValidValue.current = numValue;
    }
  };

  const handleBlur = () => {
    const processed = parseInputValue(displayValue);
    // console.log("Processed on blur:", processed);

    // nếu rỗng hoặc chỉ "-" hoặc "."
    if (processed === "" || processed === "-" || processed === ".") {
      const fallback = lastValidValue.current;
      setValue(fallback);
      setDisplayValue(fallback.toString());
      return;
    }

    // Nếu có nhiều dấu chấm → quay về giá trị hợp lệ cuối cùng
    if ((processed.match(/\./g) || []).length > 1) {
      const fallback = lastValidValue.current;
      // console.log("Multiple dots, fallback to:", fallback);
      setValue(fallback);
      setDisplayValue(fallback.toString());
      return;
    }

    const validated = validateValue(processed);
    // console.log("Validated on blur:", validated);

    setValue(validated);
    setDisplayValue(validated.toString());
    lastValidValue.current = validated;
  };

  const handleFocus = () => {
    lastValidValue.current = value;
  };

  const decrease = () => {
    if (value <= 0) return;
    const newValue = Math.max(0, value - 1);
    setValue(newValue);
    setDisplayValue(newValue.toString());
    lastValidValue.current = newValue;
  };

  const increase = () => {
    if (unit === "%" && value >= 100) return;
    const newValue = value + 1;
    const validated = unit === "%" ? Math.min(100, newValue) : newValue;
    setValue(validated);
    setDisplayValue(validated.toString());
    lastValidValue.current = validated;
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);

    // Nếu chuyển sang % và giá trị > 100, đặt về 100
    if (newUnit === "%" && value > 100) {
      setValue(100);
      setDisplayValue("100");
      lastValidValue.current = 100;
    }
  };

  const isMinusDisabled = value <= 0;
  const isPlusDisabled = unit === "%" && value >= 100;

  return (
    <div className="w-screen h-screen bg-[#303030] flex items-center justify-center">
      <div className="w-[280px] h-[120px] bg-[#151515] flex flex-col gap-4 p-4">
        <div className="w-[248px] h-9 flex items-center gap-2">
          <label className="w-[100px] text-[#AAAAAA] leading-5 rounded-[3px]">
            Unit
          </label>
          <div className="w-[140px] h-9 flex gap-0.5 p-0.5 rounded-[8px] bg-[#212121]">
            {["%", "px"].map((u) => (
              <button
                key={u}
                className={`w-[67px] h-[32px] flex items-center justify-center ${
                  unit === u
                    ? "bg-[#424242] text-white rounded-[6px]"
                    : " text-gray-400"
                }`}
                onClick={() => handleUnitChange(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="w-[248px] h-9 flex items-center gap-2">
          <label className="w-[100px] text-[#AAAAAA] leading-5 rounded-[3px]">
            Value
          </label>
          <div className="w-[140px] flex items-center bg-[#212121] rounded-md h-9 group has-[input:hover]:has-[input:not(:focus)]:bg-[#3B3B3B] has-[input:focus]:border-1 has-[input:focus]:border-[#3C67FF] border-1 border-transparent">
            <div className="relative flex items-center group/minus">
              <button
                onClick={decrease}
                disabled={isMinusDisabled}
                className="w-9 h-9 flex items-center justify-center rounded-l-[3px] text-[#F9F9F9] group-has-[input:focus]:hover:!bg-transparent hover:bg-[#3B3B3B] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:!bg-transparent transition-colors"
              >
                −
              </button>

              {isMinusDisabled && (
                <div
                  className="absolute w-[163px] h-[26px] -top-[42px] left-1/2 transform -translate-x-1/2 
                bg-[#222222] text-white text-xs py-1 px-2 rounded-[8px] shadow-lg
                opacity-0 group-hover/minus:opacity-100 transition-opacity pointer-events-none
                before:content-[''] before:absolute before:top-full before:left-1/2 
                before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#222222]"
                >
                  Value must greater than 0
                </div>
              )}
            </div>
            <input
              type="text"
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-[68px] h-9 text-center bg-transparent focus:outline-none text-white"
            />
            <div className="relative flex items-center group/plus">
              <button
                onClick={increase}
                disabled={isPlusDisabled}
                className="w-9 h-9 flex items-center justify-center rounded-r-[3px] text-[#F9F9F9] group-has-[input:focus]:hover:!bg-transparent hover:bg-[#3B3B3B] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:!bg-transparent transition-colors"
              >
                +
              </button>
              {isPlusDisabled && (
                <div
                  className="absolute w-[176px] h-[26px] -top-[42px] left-1/2 transform -translate-x-1/2 
        bg-[#222222] text-white text-xs py-1 px-2 rounded-[8px] shadow-lg
        opacity-0 group-hover/plus:opacity-100 transition-opacity pointer-events-none
        before:content-[''] before:absolute before:top-full before:left-1/2 
        before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#222222]"
                >
                  Value must smaller than 100
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
