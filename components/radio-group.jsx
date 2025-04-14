import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export default function FormRadioGroup({
  data,
  currentSelected,
  setSelected,
  label_attr,
  value_attr,
}) {
  return (
    <RadioGroup
      value={currentSelected}
      onValueChange={setSelected}
      defaultValue="No Filter"
    >
      <div className="flex items-center space-x-2 w-full">
        <RadioGroupItem value="No Filter" id={`radio-No Filter`} />
        <Label htmlFor="radio-No Filter" className="mr-auto">
          No Filter
        </Label>
      </div>
      {data.map((item, index) => {
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
      })}
    </RadioGroup>
  );
}
