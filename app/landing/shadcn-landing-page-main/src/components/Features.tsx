import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import image from "@/public/img/landing/3.png";
import image2 from "@/public/img/landing/5.png";
import image3 from "@/public/img/landing/6.png";
import { StaticImageData } from "next/image";
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface FeatureProps {
  title: string;
  description: string;
  image: StaticImageData;
  animation: {
    scale: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}

const features: FeatureProps[] = [
  {
    title: "Exercise Completion",
    description:
      "You are graded based on your performance in the exercises.",
    image: image,
    animation: {
      scale: 1.8,
      startX: -50,
      startY: -30,
      endX: 0,
      endY: 0
    }
  },
  {
    title: "Track Progress",
    description:
      "Every challenge you complete will be reflected in your progress chart.",
    image: image2,
    animation: {
      scale: 2.2,
      startX: 60,
      startY: 50,
      endX: 0,
      endY: 0
    }
  },
  {
    title: "Challenges",
    description:
      "Get an idea of what format you should practice based on the difficulty level.",
    image: image3,
    animation: {
      scale: 1.6,
      startX: 0,
      startY: 50,
      endX: 0,
      endY: 0
    }
  },
];

const featureList: string[] = [
  "Drag and Drop",
  "Fill in the Blanks",
  "Sentence transformation",
  "Question formation",
  "Matching",
  "Multiple Choice",
  "Dialogue Sorting",
  "Conjugation Tables",
  "Spot the Mistake",
];

export const Features = () => {
  const imageRef = useRef<HTMLImageElement>(null);

  

  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Types of Exercises
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge
              variant="secondary"
              className="text-sm"
            >
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image, animation }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter style={{ overflow: 'hidden', height: '300px' }}>
              <Image
                ref={imageRef}
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
                style={{ transform: `scale(${animation.scale}) translate(${animation.startX}px, ${animation.startY}px)` }}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
