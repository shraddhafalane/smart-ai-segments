import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  config: {
    name: string;
    options: {
      display_name: string;
      option_id: number;
      value: boolean;
    }[];
  };
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ config, className }, ref) => {
    const { name, options } = config;

    // Find default selected option where value is true
    const defaultSelected = options.find((opt) => opt.value === true)?.option_id;

    const [selectedOption, setSelectedOption] = React.useState<number | undefined>(
      defaultSelected
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedOption(Number(event.target.value));
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2", className)} // Consistent styling
      >
        <label className="text-sm font-medium text-foreground">{name}</label>
        <div className="flex gap-4">
          {options.map((option) => (
            <label
              key={option.option_id}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="radio"
                name={name}
                value={option.option_id}
                checked={selectedOption === option.option_id}
                onChange={handleChange}
                className="h-4 w-4 border border-input rounded-full text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              {option.display_name}
            </label>
          ))}
        </div>
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };