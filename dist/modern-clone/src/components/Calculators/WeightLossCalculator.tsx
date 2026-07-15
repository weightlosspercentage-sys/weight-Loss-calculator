import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function WeightLossCalculator() {
  const [startWeight, setStartWeight] = React.useState(180);
  const [currentWeight, setCurrentWeight] = React.useState(160);
  const [percentage, setPercentage] = React.useState(0);

  const calculatePercentage = () => {
    const start = Number(startWeight);
    const current = Number(currentWeight);
    if (start > 0) {
      const loss = ((start - current) / start) * 100;
      setPercentage(Number(loss.toFixed(2)));
    }
  };

  React.useEffect(() => {
    calculatePercentage();
  }, [startWeight, currentWeight]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Loss Percentage</CardTitle>
        <CardDescription>Calculate your weight loss progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="startWeight">Starting Weight (lbs)</label>
          <Input id="startWeight" type="number" value={startWeight} onChange={(e) => setStartWeight(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <label htmlFor="currentWeight">Current Weight (lbs)</label>
          <Input id="currentWeight" type="number" value={currentWeight} onChange={(e) => setCurrentWeight(Number(e.target.value))} />
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-2xl font-bold">{percentage}% Loss</div>
      </CardFooter>
    </Card>
  )
}
