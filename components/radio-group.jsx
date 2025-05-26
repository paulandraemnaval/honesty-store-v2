import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export default function FormRadioGroup({
  data = [],
  currentSelected,
  setSelected,
  label_attr,
  value_attr,
}) {
  return (
    <RadioGroup
      value={currentSelected}
      onValueChange={setSelected}
      defaultValue="none"
    >
      <div className="flex items-center space-x-2 w-full flex-1">
        <RadioGroupItem value="none" id={`radio-${label_attr}-no-filter`} />
        <Label htmlFor={`radio-${label_attr}-no-filter`} className="mr-auto">
          No Filter
        </Label>
      </div>
      {data.length > 0
        ? data?.map((item) => {
            const label = item[label_attr];
            const value = item[value_attr];
            return (
              <div key={value} className="flex items-center space-x-2 w-full">
                <RadioGroupItem value={value} id={`radio-${value}`} />
                <Label htmlFor={`radio-${value}`} className="mr-auto">
                  {label}
                </Label>
              </div>
            );
          })
        : null}
    </RadioGroup>
  );
}
