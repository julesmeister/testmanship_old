import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MedalIcon, MapIcon, PlaneIcon, ChartIcon } from "../components/Icons";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Challenge",
    description:
      "You can generate writing challenges or use writing challenges created by other users",
  },
  {
    icon: <MapIcon />,
    title: "Community",
    description:
      "You can connect with other users and share your writing challenges",
  },
  {
    icon: <PlaneIcon />,
    title: "Exercises",
    description:
      "When something's wrong with your writing, you are prompted to practice exercises on that topic",
  },
  {
    icon: <ChartIcon />,
    title: "Performance",
    description:
      "You can track your progress and see how you are doing over time",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        What can you really do with Testmanship?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
