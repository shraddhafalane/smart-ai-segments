import React, { useState } from "react";
import Select from "react-select";

type StepOption = {
  name: string;
  option_id?: number;
  id?: string;
  value: boolean | string | number;
};

type Step =
  | {
      type: "radio" | "multiselect";
      step: number;
      name: string;
      external_id: string;
      options: StepOption[];
    }
  | {
      type: "timeframe";
      step: number;
      name: string;
      external_id: string;
      options: { value: number; id: number; name: string };
    };

export const Formx = ({ children }: { children: string }) => {
  let parsedContent;
  let stringContent;
  try {
    parsedContent = JSON.parse(children);
  } catch (error) {
    stringContent = children;
  }
  console.log("Formx1", parsedContent);
  console.log("Form2", stringContent);
  const steps: Step[] = [
    {
      type: "radio",
      step: 1,
      name: "Contact type",
      external_id: "signed_up",
      options: [
        { name: "Prospect", option_id: 1, value: false },
        { name: "Member", option_id: 2, value: true },
      ],
    },
    {
      type: "multiselect",
      step: 2,
      name: "Contact State",
      external_id: "prospect_state",
      options: [
        { id: "1", name: "hot", value: true },
        { id: "2", name: "cold", value: true },
        { id: "3", name: "blowout", value: false },
      ],
    },
    {
      name: "number of days in past",
      step: 3,
      type: "timeframe",
      external_id: "contacts_open_qoute_timeframe_step",
      options: {
        value: 20,
        id: 1,
        name: "exactly_in_past",
      },
    },
  ];

  const [formState, setFormState] = useState<{
    selectedRadio: number | null;
    selectedMultiSelect: { label: string; value: string }[];
    timeframeValue: number | string;
  }>({
    selectedRadio:
      steps.find((step) => step.type === "radio") &&
      "options" in steps.find((step) => step.type === "radio")!
        ? (steps
            .find((step) => step.type === "radio")!
            .options as StepOption[]).find((o) => o.value === true)?.option_id || null
        : null,

    selectedMultiSelect:
      steps.find((step) => step.type === "multiselect") &&
      "options" in steps.find((step) => step.type === "multiselect")!
        ? (steps
            .find((step) => step.type === "multiselect")!
            .options as StepOption[])
            .filter((o) => o.value === true)
            .map((o) => ({ label: o.name, value: o.name }))
        : [],

    timeframeValue:
      steps.find((step) => step.type === "timeframe") &&
      "options" in steps.find((step) => step.type === "timeframe")!
        ? (steps.find((step) => step.type === "timeframe")!.options as {
            value: number;
          }).value
        : "",
  });

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      selectedRadio: Number(event.target.value),
    }));
  };

  const handleMultiSelectChange = (selected: any) => {
    setFormState((prev) => ({
      ...prev,
      selectedMultiSelect: selected || [],
    }));
  };

  const handleTimeframeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      timeframeValue: event.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formState);
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-md w-full max-w-md mx-auto border border-gray-300">
      <h2 className="text-lg font-semibold mb-4 text-center border-b border-gray-300 pb-2">
        Audience Conditions
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Radio Buttons */}
        {steps
          .filter((s): s is Extract<Step, { type: "radio" }> => s.type === "radio")
          .map((step: Extract<Step, { type: "radio" }>) => (
            <div key={(step as Extract<Step, { type: "timeframe" }>).step} className="border border-gray-300 rounded-md p-4">
              <label className="block text-sm font-medium mb-2">{(step as Extract<Step, { type: "timeframe" }>).name}</label>
              <div className="flex flex-col gap-4">
                {step.options.map((opt: StepOption) => (
                  <label key={opt.option_id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`radio-${step.step}`}
                      value={opt.option_id}
                      checked={formState.selectedRadio === opt.option_id}
                      onChange={handleRadioChange}
                      className="h-4 w-4"
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            </div>
          ))}

        {/* Multiselect */}
        {steps
          .filter((s): s is Extract<Step, { type: "multiselect" }> => s.type === "multiselect")
          .map((step) => (
            <div key={step.step} className="border border-gray-300 rounded-md p-4">
              <label className="block text-sm font-medium mb-2">{step.name}</label>
              <Select
                isMulti
                options={step.options.map((opt) => ({
                  label: opt.name,
                  value: opt.name,
                }))}
                value={formState.selectedMultiSelect}
                onChange={handleMultiSelectChange}
              />
            </div>
          ))}

        {/* Timeframe */}
        {steps
          .filter((s): s is Extract<Step, { type: "timeframe" }> => s.type === "timeframe")
          .map((step) => (
            <div key={(step as Extract<Step, { type: "timeframe" }>).step} className="border border-gray-300 rounded-md p-4">
              <label className="block text-sm font-medium mb-2">{step.name}</label>
              <input
                type="number"
                value={formState.timeframeValue}
                onChange={handleTimeframeChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          ))}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Save Condition
        </button>
      </form>
    </div>
  );
};

export default Formx;
